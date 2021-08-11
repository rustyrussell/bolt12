const {
    tlv_tlv_payload,
    tlv_offer,
    tlv_invoice_request,
    tlv_invoice,
    tlv_invoice_error
}=require('./gencode.js')
const sha256 = require('js-sha256');
const concat = Buffer.concat;
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const isBech32={};
const ALPHABET_MAP = {};

for (let z = 0; z < ALPHABET.length; z++) {
    const x = ALPHABET.charAt(z);
    ALPHABET_MAP[x] = z;
    isBech32[x]=true;
}

function hash(buffer) {
    return Buffer.from(sha256.create().update(buffer).array());
}

function taggedHash(tag, msg) {
    const tagHash = hash(tag);
    return hash(concat([tagHash, tagHash, Buffer.from(msg,'hex')]));
}

function convert (data, inBits, outBits) {
    let value = 0
    let bits = 0
    const maxV = (1 << outBits) - 1
  
    const result = []
    for (let i = 0; i < data.length; ++i) {
      value = (value << inBits) | data[i]
      bits += inBits
  
      while (bits >= outBits) {
        bits -= outBits
        result.push((value >> bits) & maxV)
      }
    }
  
    if (bits > 0) {
      result.push((value << (outBits - bits)) & maxV)
    }
    return result
}
function leaves(list_of_nodes){
    parents=[]
    if(list_of_nodes.length % 2==0){
        for(let i=0;i<list_of_nodes.length;i+=2){
            smallerSHA256=list_of_nodes[i]<list_of_nodes[i+1]?list_of_nodes[i]:list_of_nodes[i+1]
            greaterSHA256=list_of_nodes[i]>list_of_nodes[i+1]?list_of_nodes[i]:list_of_nodes[i+1]
            parents.push(taggedHash(Buffer.from('LnBranch'),smallerSHA256+greaterSHA256).toString('hex'))
        }
    }
    else{
        for(let i=0;i<list_of_nodes.length-1;i+=2){
            smallerSHA256=list_of_nodes[i]<list_of_nodes[i+1]?list_of_nodes[i]:list_of_nodes[i+1]
            greaterSHA256=list_of_nodes[i]>list_of_nodes[i+1]?list_of_nodes[i]:list_of_nodes[i+1]
            parents.push(taggedHash(Buffer.from('LnBranch'),smallerSHA256+greaterSHA256).toString('hex'))
        }
        parents.push(list_of_nodes[list_of_nodes.length-1])
    }
    return parents;
}
function branch_from_tlv(alltlv, tlv){
    l=taggedHash(Buffer.from('LnLeaf'),tlv).toString('hex')
    lnonce=taggedHash(concat([Buffer.from('LnAll'), Buffer.from(alltlv,'hex')]),tlv).toString('hex')
    smallerSHA256=l<lnonce?l:lnonce
    greaterSHA256=l>lnonce?l:lnonce
    return taggedHash(Buffer.from('LnBranch'),smallerSHA256+greaterSHA256).toString('hex')
}
function signature_valid(tlv){
    let alltlvs=''
    for(let i=0;i<tlv.length;i++)
        alltlvs+=tlv[i]
    let merkle_nodes=[]
    for(let i=0;i<tlv.length;i++)merkle_nodes[merkle_nodes.length]=branch_from_tlv(alltlvs,tlv[i])
    // console.log(alltlvs)
    // console.log(merkle_nodes)
    while(merkle_nodes.length!=1){
        merkle_nodes=leaves(merkle_nodes)
    }
    return merkle_nodes[0]
}
// console.log(tlv_offer[8][1](['1000']))
function decode(paymentRequest){
    if (typeof paymentRequest !== 'string') throw new Error('Lightning Payment Request must be string')
    paymentRequest=paymentRequest.replace('+','')
    paymentRequest=paymentRequest.replace(' ','')
    for(let i=0; i<paymentRequest.length; i++){
        if(!paymentRequest.charAt(i) in isBech32)
            throw new Error('Not a proper lightning payment request')
    }
    if (paymentRequest.slice(0, 2).toLowerCase() !== 'ln') throw new Error('Not a proper lightning payment request')
    if (paymentRequest.charAt(3)!='1')throw new Error('Separator not present')
    encodedData=paymentRequest.slice(4)
    prefix=paymentRequest.slice(0,3)
    // console.log(encodedData)
    let words=[]
    switch(prefix){
        case "lno":
            type = "Bolt 12 offer"
            TAGPARSER = tlv_offer
            break;
        case "lnr":
            type = "Bolt 12 invoice request"
            TAGPARSER = tlv_invoice_request
            break;
        case "lni":
            type = "Bolt 12 invoice"
            TAGPARSER = tlv_invoice
            break;
        default:
        throw new Error('Not a proper lightning payment request')  
    }
    // console.log(type)
    for (let i=0;i<encodedData.length;i++){
        words[words.length]=ALPHABET_MAP[encodedData.charAt(i)]
    }
    words_8bit=convert(words,5,8)
    const tags = [];
    const final={};
    const fin_content={};
    final['string']=paymentRequest;
    final['type']=type;
    final['valid']='True'//Need to verify offer_ID with signature.
    const tlv=[];
    // console.log(TAGPARSER)
    // console.log(words_8bit)
    while(words_8bit.length){
        let tlvs=''
        const tagCode = words_8bit[0]
        tlvs += Buffer.from(words_8bit.slice(0,1)).toString('hex')
        if(tagCode==0){
            break
        }
        tagName = TAGPARSER[tagCode][0]
        // parser = TAGPARSER[tagCode][2] 
        words_8bit = words_8bit.slice(1)
        // console.log(TAGPARSER[tagCode])
        // console.log(tagCode)
        if(tagCode=='0'){
            break
        }
        
    
        tagLength = words_8bit.slice(0,1)
        tlvs+=(Buffer.from(tagLength)).toString('hex')
        words_8bit = words_8bit.slice(1)
        tagWords = words_8bit.slice(0, tagLength)
        words_8bit = words_8bit.slice(tagLength)
        tlvs+=(Buffer.from(tagWords)).toString('hex')
        if(tagCode<240){
            tlv[tlv.length]=tlvs
        }
        // console.log(tagCode)
        // console.log(tagName)
        // console.log(TAGPARSER[tagCode][2](Buffer.from(tagWords)))
        fin_content[tagName]=TAGPARSER[tagCode][2](Buffer.from(tagWords))
    }
    final['offer_id']=signature_valid(tlv);
    final['contents']=fin_content;
    return final;
}
// console.log(decode("lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy"));
module.exports={
    decode
}
