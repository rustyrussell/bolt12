const {
    tlv_tlv_payload,
    tlv_offer,
    tlv_invoice_request,
    tlv_invoice,
    tlv_invoice_error
}=require('./gencode.js')
const sha256 = require('js-sha256');
const concat = Buffer.concat;
const {
    towire_bigsize,
    fromwire_bigsize,
}=require('./fundamental_types')
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
    while(merkle_nodes.length!=1){
        merkle_nodes=leaves(merkle_nodes)
    }
    return merkle_nodes[0]
}
function decode(paymentReq){
    if (typeof paymentReq !== 'string') 
        throw new Error('Lightning Payment Request must be string');
    let paymentRequest='';
    for(let i=0;i<paymentReq.length;i++){
        if(paymentReq[i]=='\n'||paymentReq[i]=='\r'){
            paymentRequest+=' ';
            continue;
        }
        else paymentRequest+=paymentReq[i];
    }
    for(let i=0;i<paymentRequest.length;i++){
        if(paymentRequest[i]=='+'){
            let s=i,e;
            i++;
            while(i<paymentRequest.length && paymentRequest[i]==' '){
                i++;
            }
            e=i;
            if(e==paymentRequest.length || s==0 || paymentRequest.charAt(s-1) in isBech32==false || paymentRequest.charAt(e) in isBech32==false)
                throw new Error('Lightning Payment Request must be string')
            paymentRequest=paymentRequest.slice(0,s)+paymentRequest.slice(e);
        }
    }
    if(paymentRequest.indexOf(' ')!=-1)
        throw new Error('Lightning Payment Request must be string');
    
    if(paymentRequest!=paymentRequest.toLowerCase()&&paymentRequest!=paymentRequest.toUpperCase())
        throw new Error('Lightning Payment Request must be string');
    paymentRequest=paymentRequest.toLowerCase();
    
    if (paymentRequest.slice(0, 2) != 'ln') 
        throw new Error('Not a proper lightning payment request');

    if (paymentRequest.indexOf('1')==-1)
        throw new Error('Separator not present');
    
    encodedData=paymentRequest.slice(paymentRequest.lastIndexOf('1')+1);
    prefix=paymentRequest.slice(0,paymentRequest.lastIndexOf('1'));
    
    for(let i=0; i<encodedData.length; i++){
        if(encodedData.charAt(i) in isBech32==false)
            throw new Error('Not a proper lightning pay request');
    }
    let words=[]
    switch(prefix){
        case "lno":
            type = "lno"
            TAGPARSER = tlv_offer
            break;
        case "lnr":
            type = "lnr"
            TAGPARSER = tlv_invoice_request
            break;
        case "lni":
            type = "lni"
            TAGPARSER = tlv_invoice
            break;
    default:
        throw new Error(prefix.toString() + ' is not a proper lightning prefix')  
    }
    for (let i=0;i<encodedData.length;i++){
        words[words.length]=ALPHABET_MAP[encodedData.charAt(i)]
    }
    words_8bit=convert(words,5,8)
    const tags = [];
    const final={};
    const fin_content={};
    const unknowns={};
    const tgcode=[]
    final['string']=paymentRequest;
    
    final['type']=type;
    
    final['valid']='True'//Need to verify offer_ID with signature.
    
    buffer= (Buffer.from(words_8bit));

    if(words.length * 5 % 8 != 0){
        buffer=buffer.slice(0,-1);
    }

    while(buffer.length){
        let tlvs=[];

        let res=fromwire_bigsize(buffer);
        
        const tagCode=res[0];

        if(tgcode.length>0)
            if(tagCode<=tgcode[tgcode.length-1])
                throw Error('TLVs should be in ascending order!');

        tgcode.push(tagCode);
        
        tlvs.push(Number(''+tagCode));
        
        buffer=res[1];
        
        res=fromwire_bigsize(buffer);
        
        tagLength = res[0];
        
        tlvs.push(Number(''+tagLength));
        
        buffer = res[1];
        
        tagWords = buffer.slice(0, Number(''+tagLength));

        
        if (tagCode in TAGPARSER){
            tagName=TAGPARSER[tagCode][0];
            fin_content[tagName] = TAGPARSER[tagCode][2](Buffer.from(tagWords));
        }
        
        else if (tagCode%2==1){
            unknowns[tagCode]=tagWords;
            fin_content[tagcode]=tagWords.toString('hex');
        }

        else{
            throw Error('Invalid: Unknown even field number '+tagCode);
        }

        tlvs.push(tagWords);
        
        buffer=buffer.slice(Number(''+tagLength))
        
        if(tagCode<240||tagCode>1000)
            tags.push(Buffer.concat([Buffer.from(tlvs.slice(0,2)),tlvs[2]]).toString('hex'));
    }
    final['contents']=fin_content;
    final['offer_id']=signature_valid(tags);
    return final;
}

module.exports={
    decode
}