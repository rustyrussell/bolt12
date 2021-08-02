class TruncatedIntType{
    constructor(name,byteslen){
        this.val=name
        this.bytelen=byteslen
    }
    read()
    {
        buffer=this.val
        if(typeof buffer!=Buffer){
            throw Error("Not a Buffer")
        }
        if(buffer.length>this.bytelen)
        throw Error("Out of Bounds!")
        return (''+BigInt("0x"+buffer.toString('hex')));
    }
    write()
    {
        value=this.val
        const big_i=BigInt(value.toString())
        let buff=big_i.toString(16)
        if(buff.length>2*this.bytelen)
            throw Error('Out of Bounds!')
        buff=buff.padStart(2*bytelen, '0')
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
        buffer=this.val
        if(typeof buffer!=Buffer){
            throw Error("Not a Buffer")
        }
        if(buffer.length>this.bytelen)
        throw Error("Out of Bounds!")
        if(buffer.length<this.bytelen)
            throw Error("Not enough bytes!")
        return (''+BigInt("0x"+buffer.toString('hex')));
    }
    write(){
        value=this.val
        const big_i=BigInt(value.toString())
        let buff=big_i.toString(16)
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
        buf=this.val
        if(typeof buf!=Buffer){
            throw Error("Not a Buffer")
        }
        let buf_block_height=buffer.slice(0,3);
        let buf_txn_index=buffer.slice(3,6);
        let buf_output_index=buffer.slice(6);
        return parseInt(buf_block_height.toString('hex'),16).toString()+'x'+parseInt(buf_txn_index.toString('hex'),16).toString()+'x'+parseInt(buf_output_index.toString('hex'),16).toString()
    }
    write(){
        fields=this.val
        let fields=value.split('x');
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
        buffer=this.val
        if(typeof buffer!=Buffer){
            throw Error("Not a Buffer")
        }
        if(buffer.length<this.byteslen){
            throw Error("Not enough bytes!")
        }
        buffer=buffer.slice(0,this.byteslen)
        Buffer.from('buffer','hex').toString('hex')
    }
    write(){
        if(this.val.length!=2*this.byteslen){
            throw Error("Buffer length is not appropriate")
        }
        return Buffer.from("this.val",'hex')
    }
}
fundamental_types={
        "byte":(buf)=> IntegerType(buf,1).read(),
        "u16":(buf)=> IntegerType(buf,2).read(),
        "u32":(buf)=> IntegerType(buf,4).read(),
        "u64":(buf)=> IntegerType(buf,8).read(),
        "tu16":(buf)=> TruncatedIntType(buf,2).read(),
        "tu32":(buf)=> TruncatedIntType(buf,4).read(),
        "tu64":(buf)=> TruncatedIntType(buf,8).read(),
        "chain_hash":(buf)=> FundamentalHexType(buf,32).read(),
        "channel_id":(buf)=> FundamentalHexType(buf,32).read(),
        "sha256":(buf)=> FundamentalHexType(buf,32).read(),
        "point":(buf)=> FundamentalHexType(buf,33).read(),
        "short_channel_id":(buf)=> ShortChannelIDType(buf).read(),
        "signature":(buf)=> FundamentalHexType(buf,64).read(),
        // "bigsize":   BigSizeType,
}

