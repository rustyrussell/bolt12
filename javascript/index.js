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
const WebSocket= require('ws');
const {
    tlv_init_tlvs,
    tlv_n1,
    tlv_n2,
    fromwire_init,
    fromwire_error
}=require('./gencode_bolt1.js');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto')
const {NoiseState}=require('./noise.js');

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
function connect(node_id, address, port='9735', local_secret_key, rune, method){
    var link = 'ws://'+address+':'+port;

    var Socket = new WebSocket(link);
    
    var ls=Buffer.from(local_secret_key,'hex');
    
    var es;
    
    do {
    es = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(es))
    
    let vals = {ls,es};
    
    let noise = new NoiseState(vals);
    
    let rpk = Buffer.from(node_id,'hex');
    
    Socket.onopen=function(){
        Socket.send(noise.initiatorAct1(rpk));
        // console.log('InitiatorAct1!');
    }
    
    Socket.onmessage=function(evt) {
        if(evt.data.length < 50){
            return;
        }
        noise.initiatorAct2(evt.data);
        // console.log('InitiatorAct2!');
        var Act3 = noise.initiatorAct3();
        Socket.send(Act3);
        // console.log('InitiatorAct3!');
        console.log('Connection_established!');
        Socket.onmessage=function (init) {
            var len = noise.decryptLength(init.data.slice(0,18));
            var inti = init.data.slice(18,18+len+16);
            let init_msg = noise.decryptMessage(inti);
            var pref = init_msg.slice(0,2).toString('hex');
            init_msg = init_msg.slice(2);
            if(pref = '0010'){
                console.log(fromwire_init(init_msg));
                Socket.send(noise.encryptMessage(Buffer.from('00100000000580082a6aa201206fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000','hex')));
                console.log('sent init message with features "80082a6aa2"!');
                Socket.onmessage=function (init2) {
                    var len = noise.decryptLength(init2.data.slice(0,18));
                    var msg = noise.decryptMessage(init2.data.slice(18,18+len+16)).toString('hex');

                    var cmd={"method": method, "rune":rune, "params":[],"id":1}
                    // console.log(Buffer.concat([Buffer.from('4c4f','hex'), Buffer.from([0,0,0,0,0,0,0,0]) ,Buffer.from(JSON.stringify(cmd))]).toString('hex'));
                    Socket.send(noise.encryptMessage(Buffer.concat([Buffer.from('4c4f','hex'),Buffer.from([0,0,0,0,0,0,0,0]) ,Buffer.from(JSON.stringify(cmd))])));
                    console.log('sent!');
                    let result = "";
                    Socket.onmessage=function (init3) {
                        var len=noise.decryptLength(init3.data.slice(0,18));
                        var decr = noise.decryptMessage(init3.data.slice(18,18+len+16));
                        // console.log(decr.slice(0,2).toString('hex'));
                        if(decr.slice(0,2).toString('hex')==='4c4f'){
                            result += decr.slice(2).toString();
                            console.log(result);
                        }
                        else if(decr.slice(0,2).toString('hex')==='594d'){
                            result += decr.slice(2).toString();
                            Socket.close(1000,'Delibrate Closing');
                            console.log(result);
                        }
                    }
                }
            }
            else if(pref = '0011'){
                console.log(fromwire_error(init_msg));
            }
            
        }
    }

    Socket.onclose=function () {
        return ([
        {
            'rn':noise.rn,
            'sn':noise.sn
        },
        {
            'sk':noise.sk,
            'rk':noise.rk
        },
        {
            'ck':noise.ck
        }
        ])
    }
}
// connect('024b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605',
//                     '128.199.202.168',
//                     '9735',
//                     'ea8d3091934f2c86c216370f0206acaaa2ee12462387743c358ca5f0245bf561',
//                     'zO-SpOC7Tt5XjqU23ep4WEr56YzJm_QW1_Pc6jPJrPI9MyZtZXRob2RebGlzdHxtZXRob2ReZ2V0fG1ldGhvZD1zdW1tYXJ5Jm1ldGhvZC9nZXRzaGFyZWRzZWNyZXQmbWV0aG9kL2xpc3RkYXRhc3RvcmU=',
//                     'listoffers'
//         );
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
function check_sign(msgname, fieldname,merkle_root, pubkey32, bip340sig){
    let msg=taggedHash(Buffer.from('lightning'+msgname+fieldname),merkle_root).toString('hex');
    try{
        schnorr.verify(
            Buffer.from(pubkey32,'hex'),
            Buffer.from(msg,'hex'),
            Buffer.from(bip340sig,'hex')
        )
    }
    catch(e){
        throw Error('bad_signature');
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
// check_sign(prefix=='lno'?'offer':(prefix=='lni'?'invoice':(prefix=='lnr'?'invoice_request':'bad prefix!')),

function check_offer(final){
    if('signature' in final['contents']){
        try{
            check_sign(prefix='offer',
                    fieldname='signature',
                    final['offer_id'],
                    final['contents']['node_id'],
                    final['contents']['signature']);
        }
        catch(e){
            throw Error('Bad Signature!');
        }
    }
    if(!('description' in final['contents'])){
        throw Error('missing description');
    }
    if(!('node_id' in final['contents'])){
        throw Error('missing node_id');
    }
    if('absolute_expiry' in final['contents']){
        sec_since_epoch= new Date()/1000;
        if(final['contents']['absolute_expiry']<sec_since_epoch){
            throw Error('Absolute_expiry has passed!');
        }
    }
    return true;
}

function check_invoice(final){
    if('signature' in final['contents']){
        try{
            check_sign(prefix='invoice',
                    fieldname='signature',
                    final['offer_id'],
                    final['contents']['node_id'],
                    final['contents']['signature']);
        }
        catch(e){
            throw Error('Bad Signature!');
        }
    }
    else{
        throw Error('Missing signature!');
    }
    if(!'amount' in final['contents']
    || !'description' in final['contents']
    || !'created_at' in final['contents']
    || !'payment_hash' in final['contents']
    ){
        throw Error('(amount, description, created_at, payment_hash) are mandatory fields!');
    }
    if('relative_expiry' in final['contents']){
        sec_since_epoch= new Date()/1000;
        if(sec_since_epoch > final['contents']['created_at']+final['contents']['relative_expiry']){
            throw Error('invoice is expired!');
        }
    }
    else{
        sec_since_epoch= new Date()/1000;
        //Is this 7200 random?
        if(sec_since_epoch > final['contents']['created_at']+7200){
            throw Error('invoice is expired!');
        }
    }
    if('blinded_path' in final['contents']){
        if(!'blinded_payinfo' in final['contents']){
            throw Error('blinded_payinfo is missing!');
        }
    }
    return true;
}

function check_invoice_request(final){
    if(!'payer_key' in final['contents']
       || !'offer_id' in final
       || !'payer_signature' in final['contents']
    ){
        throw Error('(payer_key, offer_id, payer_signature) is mandatory');
    }
    if('payer_signature' in final['contents']){
        try{
            check_sign(prefix='invoice_request',
                    fieldname='payer_signature',
                    final['offer_id'],
                    final['contents']['payer_key'],
                    final['contents']['payer_signature']);
        }
        catch(e){
            throw Error('Bad Signature!');
        }
    }
    else{
        throw Error('Missing  payer_signature!');
    }
    //FIXME: feature even bits
    return true;
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
    words_8bit = convert(words,5,8);
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
        
        // This doesn't apply to invoices?
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
    final['contents']=fin_content;
    if(prefix=='lno'){
        if(check_offer(final)){
            final['valid']='true';
            return final;
        }
    }
    if(prefix=='lni'){
        if(check_invoice(final)){
            final['valid']='true';
            return final;
        }
    }
    if(prefix=='lnr'){
        if(check_invoice_request(final)){
            final['valid']='true';
            return final;
        }
    }
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

let tlv_invoice_request_rev={};
for(const [key,value] of Object.entries(tlv_invoice_request)){
    tlv_invoice_request_rev[value[0]]=Number(key);
}
function invoice_req_check(offer, val_dict){
    if(!('payer_key' in val_dict)){
        throw Error('payer key required!')
    }
    // SIGNATURE ENCODE AFTER GETTING THE PAYER_KEY
    if('quantity_min' in offer['contents'] || 'quantity_max' in offer['contents']){
        if(!('quantity' in val_dict)){
            throw Error('Must set quantity');
        }
        else{
            if('quantity_min' in offer['contents']){
                if(val_dict['quantity'] < offer['contents']['quantity_min']){
                    throw Error('quantity is less than quantity_min');
                }
            }
            if('quantity_max' in offer['contents']){
                if(val_dict['quantity'] > offer['contents']['quantity_max']){
                    throw Error('quantity is greater than quantity_max');
                }
            }
        }  
    }
    else{
        if('quantity' in val_dict){
            throw Error("Quantity is not required!")
        }
    }

    if(!'amount' in offer['contents']){
        if(val_dict['amount']==null){
            throw Error('Set amount!');
        }
    }
    else{
        if('amount' in val_dict){
            if(val_dict['amount']<offer['contents']['amount']){
                throw Error('amount is less than what is required!');
            }
        }
    }
    //previous unpaid invoice(clear doubts from rusty)
    if('recurrence' in offer['contents']){
        if(!val_dict['recurrence_counter'] in val_dict){
            throw Error('set a valid recurrence counter');
        }
        if('recurrence_base' in offer['contents'] 
                && offer['contents']['recurrence_base']['start_any_period']){
            if(!'recurrence_start' in val_dict)
                throw Error('Must set valid recurrence_start')
            if(!'period_offset' in val_dict)
                throw Error('Must set valid period_offset')
        }
        else{
            if('recurrence_start' in val_dict){
                throw Error('recurrence_start is illegal');
            }
        }
        if('recurrence_limit' in offer['contents'] && 
            val_dict['recurrence_counter'] > offer['contents']['recurrence_limit']){
                throw Error('Invoice request for a period greater than max_period is illegal!');
        }
        if('recurrence_paywindow' in offer['contents']){
            if('recurrence_basetime' in offer['contents'] ||
                'recurrence_counter' in offer['contents']){
                    //should not send for period prior to 'seconds_before' and later than 'seconds_after' 
                }
        }
        else{
            
        }
    }
    else{
        if('recurrence_counter' in val_dict){
            throw Error('There is no recurrence in offer!');
        }
        if('recurrence_start' in val_dict){
            throw Error('There is no recurrence in offer!');
        }
    }
}

function invoice_request(offer, secret_payer_key, val_dict){
    if(!secret_payer_key){
        throw Error("can't sign this without secret key :)");
    }
    offer=decode(offer);
    val_dict['offer_id'] = offer['offer_id'];
    invoice_req_check(offer,val_dict);
    let resDict = {};
    let tags = [];
    resDict[tlv_invoice_request_rev['offer_id']] = tlv_invoice_request[tlv_invoice_request_rev['offer_id']][1](offer['offer_id']);
    let keys = [];
    for(key in val_dict){
        if(!(key in tlv_invoice_request_rev)){
            throw Error(key + ' is not defined in spec!');
        }
        else{
            resDict[tlv_invoice_request_rev[key]]=tlv_invoice_request[tlv_invoice_request_rev[key]][1](val_dict[key]);
            keys.push(tlv_invoice_request_rev[key]);
        }
    }
    let words=[];
    keys = keys.sort(function(a, b){return a - b});
    let whole_buf=Buffer.alloc(0);
    for (let i=0;i<keys.length;i++){
        buf = Buffer.alloc(0);
        buf = concat([buf, towire_bigsize(keys[i])]);
        buf = concat([buf, towire_bigsize(resDict[keys[i]].length)]);
        buf = concat([buf, resDict[keys[i]]])
        tags.push(buf.toString('hex'));
        whole_buf = concat([whole_buf,buf]);
        while(buf.length){
            words.push(parseInt(buf.slice(0,1).toString('hex'),16));
            buf=buf.slice(1);
        }
    }
    let merkle_root = merkle_calc(tags);
    let msg = taggedHash(Buffer.from('lightninginvoice_requestpayer_signature'), merkle_root);
    let payer_sig = schnorr.sign(secret_payer_key, msg);
    buf = concat([buf, towire_bigsize(240)]);
    buf = concat([buf, towire_bigsize(payer_sig.length)]);
    buf = concat([buf, payer_sig]);
    whole_buf=concat([whole_buf,buf])
    while(buf.length){
        words.push(parseInt(buf.slice(0,1).toString('hex'),16));
        buf=buf.slice(1);
    }
    let words_5bit=convert(words,8,5);
    res_string='lnr1';
    for(let i=0;i<words_5bit.length;i++){
        res_string+=ALPHABET[words_5bit[i]];
    }
    return res_string;
}

// console.log(invoice_request('lno1pqpq86q2xycnqvpsd4ekzapqv4mx2uneyqcnqgryv9uhxtpqveex7mfqxyk55ctw95erqv339ss8qun094exzarpzsg8yatnw3ujumm6d3skyuewdaexwxszqy9pcpgptlhxvqq7yp9e58aguqr0rcun0ajlvmzq3ek63cw2w282gv3z5uupmuwvgjtq2sqgqqxj7qqpp5hspuzq0pgmhkcg6tqeclvexaawhylurq90ezqrdcm7gapzvcyfzexkt8nmu628dxr375yjvax3x20cxyty8fg8wrr2dlq3nx45phn2kqru2cg',
//     "ea8d3091934f2c86c216370f0206acaaa2ee12462387743c358ca5f0245bf561",
//     {
//         "features": ['80','00','02','42','00'],
//         "recurrence_counter": 0,
//         "recurrence_start": 23,
//         "payer_key": "5f200a02d68bdc3958dab425515054cc08ad51e3d26bc754ee985badaf9f4d9c",
//         "payer_info": ['f8','15','5f','66','88','b3','87','8e','bd','2d','8c','73','a9','1e','58','57']
//     }
//     )
// )
// //
// console.log(decode('lno1pqpq86q2xycnqvpsd4ekzapqv4mx2uneyqcnqgryv9uhxtpqveex7mfqxyk55ctw95erqv339ss8qun094exzarpzsg8yatnw3ujumm6d3skyuewdaexwxszqy9pcpgptlhxvqq7yp9e58aguqr0rcun0ajlvmzq3ek63cw2w282gv3z5uupmuwvgjtq2sqgqqxj7qqpp5hspuzq0pgmhkcg6tqeclvexaawhylurq90ezqrdcm7gapzvcyfzexkt8nmu628dxr375yjvax3x20cxyty8fg8wrr2dlq3nx45phn2kqru2cg'));

function fetch_invoice(invoice_req, node_id){
    let request= new XMLHttpRequest();
    let link='https://bootstrap.bolt12.org/rawinvreq/'
                +invoice_req+'/02'+node_id;
    request.open('GET',link);
    request.send();
    request.resposeType='json'
    request.onload=()=>{
        if(request.status==200){
            console.log(JSON.parse(request.responseText));
        }
        else if(request.status==400 && request.responseText.includes("'nodeid: should be a node id: invalid token")){
            let request2= new XMLHttpRequest();
            link='https://bootstrap.bolt12.org/rawinvreq/'
                +invoice_req+'/03'+node_id;
            request2.open('GET',link);
            request2.send();
            request2.resposeType='json'
            request2.onload=()=>{
                if(request2.status==200){
                    console.log(JSON.parse(request2.responseText));
                }
                else{
                    console.log(`error ${request2.status} \n ${request2.responseText}`);  
                }
            }
        }
        else
            console.log(`error ${request.status} \n ${request.responseText}`);
    }
}
// fetch_invoice('lnr1qsswvmtmawf77xcssjnnuh0xja0tcawzp5dpw77jlvpzkygzy6a0w9svqkqqqqjzqqjqqf3qtusq5qkk30wrjkx6ksj4z5z5esy2650r6f4uw48wnpd6mtulfkwryy8cz40kdz9ns78t6tvvww53ukzhgsq30uzq29u3m8slwfstkw6qf83s3qkyshlfxntc2qlvquhapq0f5x0lwcthg9dnrkzlpjxczgxfxdfyhelsc8s9hjdqtdgtt93a2hzlrp205hq',
// '4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605')
module.exports={
    decode,
    get_recurrence,
    fetch_invoice,
    invoice_request,
    invoice_req_check,
    connect
}
