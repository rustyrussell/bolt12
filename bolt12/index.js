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

function branch_from_tlv(alltlv, tlv){
    l=taggedHash(Buffer.from('LnLeaf'),tlv).toString('hex')
    lnonce=taggedHash(concat([Buffer.from('LnAll'), Buffer.from(alltlv,'hex')]),tlv).toString('hex')
    smallerSHA256=l<lnonce?l:lnonce
    greaterSHA256=l>lnonce?l:lnonce
    return taggedHash(Buffer.from('LnBranch'),smallerSHA256+greaterSHA256).toString('hex')
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
const TAGCODES = {
    chains: 2,
    offer_id:4,
    currency: 6,
    amount: 8,
    description: 10,
    features: 12, 
    absolute_expiry: 14,
    paths: 16,
    blindedpay:18,
    blinded_capacities:19,
    vendor: 20,
    quantity_min: 22, 
    quantity_max: 24,
    recurrence:26,
    node_id:30,
    quantity:32,
    refund_for:34,
    recurrence_counter:36,
    payer_key:38,
    payer_note:39,
    created_at:40,
    payment_hash:42,
    relative_expiry:44,
    cltv:46,
    payer_info:50,
    refund_signature:52,
    send_invoice:54,
    replace_invoice:56,
    recurrence_paywindow:64,
    recurrence_limit:66,
    recurrence_start:68,
    recurrence_base:28,
    node_id:30,
    send_invoice:54,
    refund_for:34,
    signature:240
}
const TAGPARSERS = {
    // 1: (words) => wordsToBuffer(words, true).toString('hex'), // 256 bits
    2: (words) => wordsToBuffer(words, true).toString('hex'), // 256 bits
    4: (words) => wordsToBuffer(words, true).toString('hex'),
    6: (words) => wordsToBuffer(words, true).toString('utf8'), // string variable length
    8: (words) => decodeTu(words),
    10: (words) => wordsToBuffer(words, false).toString('utf8'), // string variable length
    12: features,
    14: (words) => decodeTu(words),
    16: (words) => wordsToBuffer(words, true).toString('hex'),
    18: (words) => wordsToBuffer(words, true).toString('hex'),
    19: decodeU64,
    20: (words) => wordsToBuffer(words, true).toString('utf8'), // string variable length
    22: (words) => decodeTu(words),
    24: (words) => decodeTu(words), 
    26: recur_dec,
    28: recur_base,
    30: (words) => wordsToBuffer(words, true).toString('hex'), // 256 bits
    32: (words) => decodeTu(words),
    34: (words) => wordsToBuffer(words, true).toString('hex'), //256 bits
    36: (words) => decodeTu(words),
    38: (words) => wordsToBuffer(words, true).toString('hex'), //256 bits
    39: (words) => wordsToBuffer(words, true).toString('utf8'),
    40: (words) => decodeTu(words),
    42: (words) => wordsToBuffer(words, true).toString('hex'), //256 bits
    44: (words) => decodeTu(words),
    46: (words) => decodeTu(words),
    50: (words) => wordsToBuffer(words, true).toString('hex'),
    52: (words) => wordsToBuffer(words, true).toString('hex'), // 264 bits
    54: true,
    56: (words) => wordsToBuffer(words, true).toString('hex'),
    64: recur_paywin,
    66: (words) => decodeTu(words),
    68: (words) => decodeTu(words),
    240: (words) => wordsToBuffer(words, true).toString('hex'), // 264 bits
    // 23: (words) => wordsToBuffer(words, true).toString('hex'), // 256 bits
    // 6: wordsToIntBE, // default: 3600 (1 hour)
    // 9: fallbackAddressParser,
    // 3: routingInfoParser, // for extra routing info (private etc.)
    // 5: featureBitsParser // keep feature bits as array of 5 bit words
  }
  
// reverse the keys and values of TAGCODES and insert into TAGNAMES
const TAGNAMES = {}
for (let i = 0, keys = Object.keys(TAGCODES); i < keys.length; i++) {
  const currentName = keys[i]
  const currentCode = TAGCODES[keys[i]].toString()
  TAGNAMES[currentCode] = currentName
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
function wordsToBuffer (words, trim) {
    let buffer = Buffer.from(words)
    if (trim && words.length * 5 % 8 !== 0) {
      buffer = buffer.slice(0, -1)
    }
    return buffer
}
function wordsToIntBE (words) {
    return words.reverse().reduce((total, item, index) => {
      return total + item * Math.pow(64, index)
    }, 0)
}
//decodeTu needs revision!
function decodeTu(words){
    tar=Buffer.from(words,'hex');
    const untrimmedBuffer=Buffer.alloc(8,0);
    tar.copy(untrimmedBuffer,untrimmedBuffer.length-tar.length)
    var res =(untrimmedBuffer.readUInt32BE(0) << 8) + untrimmedBuffer.readUInt32BE(4)
    return res
    // return parseInt(Buffer.from(words).toString('hex'),16)
}

function decodeU64(words){
    words=words.slice(0,8)
    res = decodeTu(words)
    return res.toString+" msat"
}
function features(words){
    return words
}
function recur_dec (words) {
    per=decodeTu(words.slice(1))
    switch(words[0]){
        case 0:
            return per.toString()+" second"
        case 1:
            return per.toString()+" day"
        case 2:
            return per.toString()+" month"
        case 3:
            return per.toString()+" year"
        default:
            return "invalid time unit for recurrence!"
    }
}
function recur_base (words) {
    start=false
    per=decodeTu(words.slice(1))
    if(words[0]!=0)start=true
    return {
        "start_any_period":start,
        "basetime": per
    }
}
function recur_paywin(words){
    before = decodeTu(words.slice(0,4))
    words=words.slice(4)
    if(words[0])proportional_am=true
    else proportional_am=false
    words=words.slice(1)
    after= decodeTu(words)
    return{
        "seconds_before":before,
        "proportional_amount":proportional_am,
        "seconds_after":after
    }
}
function orderKeys (unorderedObj) {
    const orderedObj = {}
    Object.keys(unorderedObj).sort().forEach((key) => {
      orderedObj[key] = unorderedObj[key]
    })
    return orderedObj
}
function signature_valid(tlv,sign){
    let alltlvs=''
    for(let i=0;i<tlv.length;i++)
        alltlvs+=tlv[i]
    let merkle_nodes=[]
    for(let i=0;i<tlv.length;i++)merkle_nodes[merkle_nodes.length]=branch_from_tlv(alltlvs,tlv[i])
    console.log(alltlvs)
    console.log(merkle_nodes)
    while(merkle_nodes.length!=1){
        merkle_nodes=leaves(merkle_nodes)
    }
    console.log(merkle_nodes)
}
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
            type="Bolt 12 offer"
            break;
        case "lnr":
            type="Bolt 12 invoice request"
            break;
        case "lni":
            type="Bolt 12 invoice"
            break;
        default:
        throw new Error('Not a proper lightning payment request')  
    }
    // console.log(type)
    for (let i=0;i<encodedData.length;i++){
        words[words.length]=ALPHABET_MAP[encodedData.charAt(i)]
    }
    words_8bit=convert(words,5,8)
    // console.log(words_8bit)
    // console.log(decode_tu64(words_8bit.slice(2,3)))
    const tags = []
    const data= []
    const tlv=[]
    // console.log(words_8bit)
    while(words_8bit.length){
        let tlvs=''
        const tagCode = words_8bit[0].toString()
        tlvs += Buffer.from(words_8bit.slice(0,1)).toString('hex')
        tagName = TAGNAMES[tagCode] || "unknownTagName"
        parser = TAGPARSERS[tagCode] 
        words_8bit = words_8bit.slice(1)
        if(tagCode=='54'){
            tags.push({
                tagName,
                data:parser
            })
            continue
        }
        if(tagCode=='0'){
            break
        }

        tagLength = words_8bit.slice(0,1)
        tlvs+=(Buffer.from(tagLength)).toString('hex')
        words_8bit = words_8bit.slice(1)
        tagWords = words_8bit.slice(0, tagLength)
        words_8bit = words_8bit.slice(tagLength)
        // console.log("tagWords")
        // console.log(tagWords.toString())
        tlvs+=(Buffer.from(tagWords)).toString('hex')
        // if(tagCode=='8'){
        //     // console.log(tagWords)
        //     // console.log(parseInt( Buffer.from(tagWords.slice(0,4)).toString('hex'),16))
        //     tlvs+=(Buffer.from(tagWords)).toString('hex')
        //     // console.log(words_8bit.slice(0,18))
        //     // console.log(decodeTu(words_8bit.slice(2,3)))
        //     console.log(tlvs)
        //     break
        // }
        // console.log(tlvs)
        // console.log(typeof parseInt(tagCode))
        if(parseInt(tagCode)<240){
            tlv[tlv.length]=tlvs
        }
        // if(tagCode=='unknownTagName')continue
        console.log(tagCode)
        //See: parsers for more comments
        tags.push({
        tagName,
        data: parser(tagWords) // only fallback address needs coinNetwork
        })
        if(tagCode=="240")
            sign=parser(tagWords)
    }
    let final_result={
        tags,
        "type":type
    }
    // console.log(paymentRequest)
    console.log(final_result)
    console.log(tlv)
    signature_valid(tlv,sign)
    // console.log(sign)
}
decode("lno1pg257enxv4ezq+ cneype82um50ynhxgrwdajx283qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqs85ck65ycmkdk92smwt9zuewdzfe7v4aavvaz5kgv9mkk63v3s0ge0f099kssh3yc95qztx504hu92hnx8ctzhtt08pgk0texz0509tk")
module.exports={
    decode
}