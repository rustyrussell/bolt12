'use strict'

// read() returns the value, and the buffer with the used part removed
// write() returns the buffer

class TruncatedIntType{
    constructor(name, byteslen){
        this.val=name
        this.bytelen=byteslen
    }
    read()
    {
        let buffer=this.val
        if(buffer.length>this.bytelen)
            throw Error("Out of Bounds!")
        if(buffer.length==0)
            buffer=Buffer.from('00','hex')
	let big_i = BigInt("0x"+buffer.toString('hex'))
	// Number is limited to 2^53 - 1, so use BigInt if required!
	let num = Number(big_i)
	if(num != big_i) {
	    num = big_i;
	}
        return [num, Buffer.alloc(0)]
    }
    write()
    {
        var value=this.val
        let buff=value.toString(16)
        if(buff.length>2*this.bytelen)
            throw Error('Out of Bounds!')
        buff=buff.padStart(2*this.bytelen, '0')
        buff=Buffer.from(buff, 'hex')
        let waste_bytes=0;
        for(let i=0;i<buff.length;i++){
            if(buff[i]===0)waste_bytes++;
            else break;
        }
        return buff.slice(waste_bytes)
    }
}
class IntegerType{
    constructor(name,bytelen){
        this.val=name
        this.bytelen=bytelen
    }
    read()
    {
        let buffer=this.val
        if(buffer.length<this.bytelen)
            throw Error("Not enough bytes!")
        return [BigInt("0x"+buffer.slice(0,this.bytelen).toString('hex')),
		buffer.slice(this.bytelen)];
    }
    write(){
        let value=this.val
        let buff=value.toString(16)
        if(buff.length>2*this.bytelen)
            throw Error("Out of Bounds!")
        buff=buff.padStart(2*this.bytelen, '0')
        buff=Buffer.from(buff, 'hex')
        return buff
    }
}
class ShortChannelIDType{
    constructor(val){
        this.val=val
    }
    read(){
        let buffer=this.val
        let buf_block_height=buffer.slice(0,3);
        let buf_txn_index=buffer.slice(3,6);
        let buf_output_index=buffer.slice(6,8);
        return [parseInt(buf_block_height.toString('hex'),16).toString()+'x'+parseInt(buf_txn_index.toString('hex'),16).toString()+'x'+parseInt(buf_output_index.toString('hex'),16).toString(), buffer.slice(8)]
    }
    write(){
        let fields=this.val
        fields=fields.split('x');
        let block_height=Number(fields[0]).toString(16).padStart(6,0);
        let txn_index=Number(fields[1]).toString(16).padStart(6,0);
        let output_index=Number(fields[2]).toString(16).padStart(4,0);
        return Buffer.concat([Buffer.from(block_height,'hex'),Buffer.from(txn_index,'hex'),Buffer.from(output_index,'hex')]);
    }
}
class FundamentalHexType{
    constructor(val,byteslen){
        this.val=val
        this.byteslen=byteslen
    }
    read(){
        let buffer=this.val
        if(buffer.length<this.byteslen){
            throw Error("Not enough bytes!")
        }
        return [Buffer.from(buffer,'hex').toString('hex'),
		buffer.slice(0,this.byteslen)]
    }
    write(){
        if(this.val.length!=2*this.byteslen){
            throw Error("Buffer length is not appropriate")
        }

        return Buffer.from(this.val,'hex')
    }
}
//All truncated Integers
function towire_tu16(value){
    var tu=new TruncatedIntType(value,2).write();
    return tu;
}
function fromwire_tu16(buffer){
    return new TruncatedIntType(buffer,2).read();
}
function towire_tu32(value){
    var tu=new TruncatedIntType(value,4).write();
    return tu;
}
function fromwire_tu32(buffer){
    return new TruncatedIntType(buffer,4).read();
}
function towire_tu64(value){
    var tu=new TruncatedIntType(value,8).write();
    return tu;
}
function fromwire_tu64(buffer){
    return new TruncatedIntType(buffer,8).read();
}
// console.log(fromwire_tu64(towire_tu64('1000')))
// All Integers
function towire_u16(value){
    var tu=new IntegerType(value,2).write();
    return tu;
}
function fromwire_u16(buffer){
    return new IntegerType(buffer,2).read();
}
function towire_u32(value){
    var tu=new IntegerType(value,4).write();
    return tu;
}
function fromwire_u32(buffer){
    return new IntegerType(buffer,4).read();
}
function towire_u64(value){
    var tu=new IntegerType(value,8).write();
    return tu;
}
function fromwire_u64(buffer){
    return new IntegerType(buffer,8).read();
}
function towire_byte(value){
    var tu=new IntegerType(value,1).write();
    return tu;
}
function fromwire_byte(buffer){
    return new IntegerType(buffer,1).read();
}

//Short-channel-id
function towire_short_channel_id(value){
    var tu=new ShortChannelIDType(value).write();
    return tu;
}
function fromwire_short_channel_id(buffer){
    return new ShortChannelIDType(buffer).read();
}

//Remaining all are hex strings!
function towire_chain_hash(value){
    var tu=new FundamentalHexType(value,32).write();
    return tu;
}
function fromwire_chain_hash(buffer){
    return new FundamentalHexType(buffer,32).read();
}

function towire_channel_id(value){
    var tu=new FundamentalHexType(value,32).write();
    return tu;
}
function fromwire_channel_id(buffer){
    return new FundamentalHexType(buffer,32).read();
}

function towire_sha256(value){
    var tu=new FundamentalHexType(value,32).write();
    return tu;
}
function fromwire_sha256(buffer){
    return new FundamentalHexType(buffer,32).read();
}

function towire_point(value){
    var tu=new FundamentalHexType(value,33).write();
    return tu;
}
function fromwire_point(buffer){
    return new FundamentalHexType(buffer,33).read();
}

function towire_point32(value){
    var tu=new FundamentalHexType(value,32).write();
    return tu;
}
function fromwire_point32(buffer){
    return new FundamentalHexType(buffer,32).read();
}

function towire_short_channel_id(value){
    var tu=new ShortChannelIDType(value).write();
    return tu;
}
function fromwire_short_channel_id(buffer){
    return new ShortChannelIDType(buffer).read();
}

function towire_bip340sig(value){
    var tu=new FundamentalHexType(value,64).write();
    return tu;
}
function fromwire_bip340sig(buffer){
    return new FundamentalHexType(buffer,64).read();
}
function towire_array_utf8(value){
    return Buffer.from(value.toString());
}
function fromwire_array_utf8(buffer, len){
    return [buffer.slice(0,len).toString('utf8'), buffer]
}

function towire_signature(value){
    return Buffer.from(value.toString(),'hex');
}
function fromwire_signature(buffer){
    return buffer.toString('hex');
}
function towire_bigsize(value){
    if (value < 0xFD)
        return towire_byte(value)
    else if (value <= 0xFFFF)
        return Buffer.concat([towire_byte(0xFD), towire_u16(value)])
    else if (value <= 0xFFFFFFFF)
        return Buffer.concat([towire_byte(0xFE), towire_u32(value)])
    else
        return Buffer.concat([towire_byte(0xFF), towire_u64(value)])
}
function fromwire_bigsize(buffer){
    var val = fromwire_byte(buffer);
    buffer=val[1]
    let minval;
    if (val == 0xFD){
        minval = 0xFD;
        val = fromwire_u16(buffer);
    }
    else if (val == 0xFE){
        minval = 0x10000;
        val = fromwire_u32(buffer);
    }
    else if (val == 0xFF){
        minval = 0x100000000;
        val = fromwire_u64(buffer);
    }
    else
        minval = 0;
    if (val < minval)
        throw Error("non minimal-encoded bigsize");
    return val;
}
module.exports={
    towire_byte,
    fromwire_byte,
    towire_chain_hash,
    fromwire_chain_hash,
    towire_channel_id,
    fromwire_channel_id,
    towire_array_utf8,
    fromwire_array_utf8,
    towire_point,
    fromwire_point,
    towire_point32,
    fromwire_point32,
    towire_bigsize,
    fromwire_bigsize,
    towire_sha256,
    fromwire_sha256,
    towire_short_channel_id,
    fromwire_short_channel_id,
    towire_bip340sig,
    fromwire_bip340sig,
    towire_tu16,
    fromwire_tu16,
    towire_tu32,
    fromwire_tu32,
    towire_tu64,
    fromwire_tu64,
    towire_u16,
    fromwire_u16,
    towire_u32,
    fromwire_u32,
    towire_u64,
    fromwire_u64,
}



// let fundamental_types={
//         // "byte":(buf)=> IntegerType(buf,1).read(),
//         // "u16":(buf)=> IntegerType(buf,2).read(),
//         // "u32":(buf)=> IntegerType(buf,4).read(),
//         // "u64":(buf)=> IntegerType(buf,8).read(),
//         // "tu16":(buf)=> TruncatedIntType(buf,2).read(),
//         // "tu32":(buf)=> TruncatedIntType(buf,4).read(),
//         // "tu64":(buf)=> TruncatedIntType(buf,8).read(),
//         // "chain_hash":(buf)=> FundamentalHexType(buf,32).read(),
//         // "channel_id":(buf)=> FundamentalHexType(buf,32).read(),
//         // "sha256":(buf)=> FundamentalHexType(buf,32).read(),
//         // "point":(buf)=> FundamentalHexType(buf,33).read(),
//         // "short_channel_id":(buf)=> ShortChannelIDType(buf).read(),
//         // "signature":(buf)=> FundamentalHexType(buf,64).read(),
//         // "description":(buf)=> buf.toString('utf8'),
//         // "bigsize":   BigSizeType,
// }
