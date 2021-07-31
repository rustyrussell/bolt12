// BOLT #1:
// 1. `tlv_stream`: `n1`
// 2. types:
//    1. type: 1 (`tlv1`)
//    2. data:
//      * [`tu64`:`amount_msat`]
//    1. type: 2 (`tlv2`)
//    2. data:
//      * [`short_channel_id`:`scid`]
//    1. type: 3 (`tlv3`)
//    2. data:
//      * [`point`:`node_id`]
//      * [`u64`:`amount_msat_1`]
//      * [`u64`:`amount_msat_2`]
//    1. type: 254 (`tlv4`)
//    2. data:
//      * [`u16`:`cltv_delta`]
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
    return BigInt("0x"+buffer.toString('hex'));
}
// console.log(s)
// console.log(BigInt("0xffffffffffffffff")) 
console.log(fromwire_tu64(towire_tu64("18446744073709551615"))) 
function towire_short_channel_id(value)
{
    let fields=value.split('x');
    let block_height=Number(fields[0]).toString(16).padStart(6,0);
    let txn_index=Number(fields[1]).toString(16).padStart(6,0);
    let output_index=Number(fields[2]).toString(16).padStart(4,0);
    return Buffer.concat([Buffer.from(block_height,'hex'),Buffer.from(txn_index,'hex'),Buffer.from(output_index,'hex')]);
}

function fromwire_short_channel_id(buffer)
{
    let buf_block_height=buffer.slice(0,3);
    let buf_txn_index=buffer.slice(3,6);
    let buf_output_index=buffer.slice(6);
    return parseInt(buf_block_height.toString('hex'),16).toString()+'x'+parseInt(buf_txn_index.toString('hex'),16).toString()+'x'+parseInt(buf_output_index.toString('hex'),16).toString()
}
// console.log(fromwire_short_channel_id(towire_short_channel_id("539268x845x1")))
// function towire_n1_tlv3(value)
// {
//     _n = 0
//     // Buffer buf
//     buf = Buffer.concat([buf, towire_point(value[_n++])])
//     buf = Buffer.concat([buf, towire_u64(value[_n++])])
//     buf = Buffer.concat([buf, towire_u64(value[_n++])])
//     assert(value.length() == _n)
//     return buf
// }

// function fromwire_n1_tlv3(buffer)
// {
//     value = []
//     _n = 0
//     value.push(fromwire_point(buffer))
//     value.push(fromwire_u64(buffer))
//     value.push(fromwire_u64(buffer))
// }
function towire_u16(value){
    const hex=value.toString(16).padStart(4,0)
    const buff=Buffer.from(hex,'hex')
    return buff
}
// console.log(towire_u16(10000))
function fromwire_u16(buffer){
    return parseInt(buffer.toString('hex'),16)
}
function towire_n1_tlv3(value){

}
function fromwire_n1_tlv3(buffer){

}
const tlvs_n1 = {
    1: [ "tlv1", towire_tu64, fromwire_tu64 ],
    2: [ "tlv2", towire_short_channel_id, fromwire_short_channel_id ],
    3: [ "tlv3", towire_n1_tlv3, fromwire_n1_tlv3 ],
    254: [ "tlv4", towire_u16, fromwire_u16 ]
}
