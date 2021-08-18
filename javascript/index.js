var assert = require('assert');
const schnorr = require('bip-schnorr');
const {
    tlv_tlv_payload,
    tlv_offer,
    tlv_invoice_request,
    tlv_invoice,
    tlv_invoice_error
}=require('./gencode.js')
const sha256 = require('js-sha256');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const concat = Buffer.concat;
const {
    towire_bigsize,
    fromwire_bigsize,
}=require('./fundamental_types')
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const isBech32={};
const ALPHABET_MAP = {};

class Recurrence{
    constructor(recurrence, recurrence_paywindow=null, recurrence_limit=null, recurrence_base=null){
        this.period = recurrence['period'];
        this.time_unit = recurrence['time_unit'];
        this.paywindow = recurrence_paywindow;
        this.limit = recurrence_limit;
        this.base = recurrence_base;
    }
    has_fixed_base() {
        return this.base!=null
    }
    can_start_offset(){
        return this.has_fixed_base && this.base['start_any_period']
    }
    _adjust_date(basedate, units, n, sameday){
        while(true){
            if (units == 'seconds'){
                var ret=new Date(basedate)
                ret.setSeconds(ret.getSeconds()+n);
            }
            else if (units == 'days'){
                var ret=new Date(basedate)
                ret.setDate(ret.getDate()+n);
            }
            else if (units == 'months'){
                var ret=new Date(basedate)
                ret.setMonth(ret.getMonth()+n);
            }
            else if (units == 'years'){
                var ret=new Date(basedate)
                ret.setMonth(ret.getMonth()+12*n);
            }
            if (!sameday || ret.getDate()==basedate.getDate())
                return ret;
            basedate.setDate(basedate.getDate()-1);
        }
    }
    _get_period(n, basetime){
        var basedate=new Date();
        basedate.setTime(basetime*1000)
        // console.log(basedate.toUTCString());
        if (this.time_unit==0){
            var units = 'seconds';
            var sameday = false;
        }
        else if (this.time_unit==1){
            var units = 'days';
            var sameday = false;
        }
        else if (this.time_unit==2){
            var units = 'months';
            var sameday = true;
        }
        else if (this.time_unit==3){
            var units = 'years';
            var sameday = true;
        }
        
        var startdate = new Date();
        startdate.setTime( this._adjust_date(basedate, units, this.period*(n), sameday));
        var enddate = new Date();
        enddate.setTime( this._adjust_date(startdate, units, this.period, sameday));
        // console.log(enddate.toUTCString());
        var start = startdate.getTime();
        var end = enddate.getTime();

        if(this.paywindow==null){
            var paystartdate = this._adjust_date(startdate, units, -this.period, 
                                            sameday);
            // console.log('paystart:', paystartdate.toUTCString());
            var paystart=paystartdate.getTime();
            var payend=end;
        }
        else{
            var paystart = (start) - Number(this.paywindow['seconds_before']);
            var payend = (start) + Number(this.paywindow['seconds_after']);
        }
        return {
                'start': start/1000,
                'end': end/1000, 
                'paystart':paystart/1000, 
                'payend':payend/1000
                }
    }
    get_period(n){
        if (this.limit!=null && n>this.limit && n<=0){
            return null;
        }
        if (this.base!=null){
            var basetime=this.base['basetime'];
        }
        return this._get_period(n, basetime);
    }
    get_pay_factor(period, time){
        if(this.paywindow==null || !this.paywindow['proportional_amount'])
            return 1;
        if(time<period['start'])
            return 1;
        if (time > period['end'])
            return 0;
        return (period['end']-time)/period['end']-period['start'];
    }
    period_start_offset(when){
        if(this.can_start_offset){
            if (this.time_unit==0){
                var approx_mul = 1;
            }
            else if (this.time_unit==1){
                var approx_mul = 24 * 60 * 60;
            }
            else if (this.time_unit==2){
                var approx_mul = 30 * 24 * 60 * 60;
            }
            else if (this.time_unit==3){
                var approx_mul = 365 * 30 * 24 * 60 * 60;
            }
            var period_num=(when-self.base['basetime'])/(self.period * approx_mul)
            while (true){
                period = self._get_period(period_num, self.base['basetime']);
                if(when < period['end']){
                    period_num -= 1;
                }
                else if (when >= this.period.end){
                    period_num += 1;
                }
                else{
                    return period_num;
                }
            }
        }
        else throw Error('can_start_offset is not true');
    }
} 
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
function check_sign(msgname, merkle_root, pubkey32, bip340sig){
    let msg=taggedHash(Buffer.from('lightning'+msgname+'signature'),merkle_root).toString('hex');
    try{
        schnorr.verify(
            Buffer.from(pubkey32,'hex'),
            Buffer.from(msg,'hex'),
            Buffer.from(bip340sig,'hex')
        )
        return 'true';
    }
    catch(e){
        return 'false';
    }
}
function merkle_calc(tlv){
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
        
        else if (Number(tagCode)%2==1){
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
    final['offer_id']=merkle_calc(tags);
    if(!('description' in fin_content)){
        throw Error('missing description')
    }
    if(!('node_id' in fin_content)){
        throw Error('missing node_id')
    }
    final['valid']='true'
    if('signature' in fin_content){
        try{
            check_sign(prefix=='lno'?'offer':(prefix=='lni'?'invoice':(prefix=='lnr'?'invoice_request':'bad prefix!')),
                    final['offer_id'],
                    fin_content['node_id'],
                    fin_content['signature'])
        }
        catch(e){
            throw Error('Bad Signature');
        }
                    
    }
    final['contents']=fin_content;
    
    return final;
}

function get_recurrence(address){
    let decoded=decode(address);
    if (!'recurrence' in decoded['contents']){
        return null;
    }
    else{
        recur=new Recurrence(decoded['contents']['recurrence'],
                          decoded['contents']['recurrence_paywindow'],
                          decoded['contents']['recurrence_limit'],
                          decoded['contents']['recurrence_base']
                        )
        return recur;
    }
}
function fetch_invoice(offer,amount=null,quantity=null,payerkey=null,counter=null){
    let request= new XMLHttpRequest();
    let decoded=decode(offer);
    if(decoded['contents']['recurrence']==undefined ){
        let link='https://bootstrap.bolt12.org/fetchinvoice/'
                    +(offer+'/')
                    +(amount!=null?amount+'/':'')
                    +(quantity!=null?quantity:'');
        request.open('GET',link);
        request.send();
        request.resposeType='json'
        request.onload=()=>{
            if(request.status==200){
                console.log(JSON.parse(request.responseText));
            }
            else{
                console.log(`error ${request.status} \n ${request.responseText}`);
            }
        }
    }
    else{
        
    }
}
let tlv_invoice_request_rev={};
for(const [key,value] of Object.entries(tlv_invoice_request)){
    tlv_invoice_request_rev[value[0]]=Number(key);
}
function invoice_request(offer){
    let resDict={};
    resDict[tlv_invoice_request_rev['offer_id']] = tlv_invoice_request[tlv_invoice_request_rev['offer_id']][1](offer['offer_id']);
    console.log(resDict);

}
module.exports={
    decode,
    get_recurrence,
    fetch_invoice
}
