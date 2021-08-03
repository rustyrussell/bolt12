function towire_tu64(value)
{
    const big_i=BigInt(value.toString())
    let buff=big_i.toString(16)
    if(buff.length>16)
        throw Error('Out of Bounds!');
    buff=buff.padStart(16, '0')
    buff=Buffer.from(buff, 'hex')
    let waste_bytes=0;
    for(let i=0;i<buff.length;i++){
        if(buff[i]===0)waste_bytes++;
        else break;
    }
    return buff.slice(waste_bytes)
}
function fromwire_tu64(buffer)
{
    if(buffer.length>8)
        throw ('Out of Bounds!')
    return (BigInt(''+"0x"+buffer.toString('hex')));
}
function towire_tu32(value)
{
    const big_i=BigInt(value.toString())
    let buff=big_i.toString(16)
    if(buff.length>8)
        throw Error('Out of Bounds!');
    buff=buff.padStart(8, '0')
    buff=Buffer.from(buff, 'hex')
    let waste_bytes=0;
    for(let i=0;i<buff.length;i++){
        if(buff[i]===0)waste_bytes++;
        else break;
    }
    return buff.slice(waste_bytes)
}
function fromwire_tu32(buffer)
{
    if(buffer.length>4)
        throw ('Out of Bounds!')
    return (BigInt(''+"0x"+buffer.toString('hex')));
}
const tlvs_n1 = {
    0: [ "tlv1", towire_tu64, fromwire_tu64 ],
    11: [ "tlv2", towire_tu32, fromwire_tu32],
}
