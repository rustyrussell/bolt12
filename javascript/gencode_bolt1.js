var assert = require('assert');
const {
    towire_byte,
    fromwire_byte,
    towire_chain_hash,
    fromwire_chain_hash,
    towire_channel_id,
    fromwire_channel_id,
    towire_array_utf8,
    fromwire_array_utf8,
    towire_bigsize,
    fromwire_bigsize,
    towire_point,
    fromwire_point,
    towire_point32,
    fromwire_point32,
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
}=require('./fundamental_types')

function towire_init_tlvs_networks(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    value = {"chains": value}
    for (let v of value["chains"]) {
        buf = Buffer.concat([buf, towire_chain_hash(v)]);
    }
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_init_tlvs_networks(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    v = [];
    for (let i = 0; buffer.length; i++) {
        retarr = fromwire_chain_hash(buffer);
        v.push(retarr[0]);
        buffer = retarr[1];
    }
    value["chains"] = v;

    return value["chains"];
}

const tlv_init_tlvs = {
    1: ["networks", towire_init_tlvs_networks, fromwire_init_tlvs_networks],
}
function towire_n1_tlv1(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    value = {"amount_msat": value}
    buf = Buffer.concat([buf, towire_tu64(value["amount_msat"])]);
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_n1_tlv1(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_tu64(buffer);
    value["amount_msat"] = retarr[0];    buffer = retarr[1];

    return value["amount_msat"];
}

function towire_n1_tlv2(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    value = {"scid": value}
    buf = Buffer.concat([buf, towire_short_channel_id(value["scid"])]);
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_n1_tlv2(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_short_channel_id(buffer);
    value["scid"] = retarr[0];    buffer = retarr[1];

    return value["scid"];
}

function towire_n1_tlv3(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_point(value["node_id"])]);
    _n++;
    buf = Buffer.concat([buf, towire_u64(value["amount_msat_1"])]);
    _n++;
    buf = Buffer.concat([buf, towire_u64(value["amount_msat_2"])]);
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_n1_tlv3(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_point(buffer);
    value["node_id"] = retarr[0];    buffer = retarr[1];
    retarr = fromwire_u64(buffer);
    value["amount_msat_1"] = retarr[0];    buffer = retarr[1];
    retarr = fromwire_u64(buffer);
    value["amount_msat_2"] = retarr[0];    buffer = retarr[1];

    return value;
}

function towire_n1_tlv4(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    value = {"cltv_delta": value}
    buf = Buffer.concat([buf, towire_u16(value["cltv_delta"])]);
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_n1_tlv4(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_u16(buffer);
    value["cltv_delta"] = retarr[0];    buffer = retarr[1];

    return value["cltv_delta"];
}

const tlv_n1 = {
    1: ["tlv1", towire_n1_tlv1, fromwire_n1_tlv1],
    2: ["tlv2", towire_n1_tlv2, fromwire_n1_tlv2],
    3: ["tlv3", towire_n1_tlv3, fromwire_n1_tlv3],
    254: ["tlv4", towire_n1_tlv4, fromwire_n1_tlv4],
}
function towire_n2_tlv1(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    value = {"amount_msat": value}
    buf = Buffer.concat([buf, towire_tu64(value["amount_msat"])]);
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_n2_tlv1(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_tu64(buffer);
    value["amount_msat"] = retarr[0];    buffer = retarr[1];

    return value["amount_msat"];
}

function towire_n2_tlv2(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    value = {"cltv_expiry": value}
    buf = Buffer.concat([buf, towire_tu32(value["cltv_expiry"])]);
    _n++;
    assert(Object.keys(value).length == _n);
    return buf;
}

function fromwire_n2_tlv2(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_tu32(buffer);
    value["cltv_expiry"] = retarr[0];    buffer = retarr[1];

    return value["cltv_expiry"];
}

const tlv_n2 = {
    0: ["tlv1", towire_n2_tlv1, fromwire_n2_tlv1],
    11: ["tlv2", towire_n2_tlv2, fromwire_n2_tlv2],
}
function towire_init(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_u16(value["globalfeatures"].length)]);

    _n++;
    for (let v of value["globalfeatures"]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    _n++;
    buf = Buffer.concat([buf, towire_u16(value["features"].length)]);

    _n++;
    for (let v of value["features"]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    _n++;
    buf = Buffer.concat([buf, towire_init_tlvs(value["tlvs"])]);
    _n++;
    assert(value.length == _n);
    return buf;
}
//Manually defining fromwire_init_tlvs, Need to debug generator..
function fromwire_init_tlvs(buffer){
    rearr = fromwire_bigsize(buffer);
    buffer = rearr[1];
    let type = rearr[0];
    rearr = fromwire_bigsize(buffer);
    let len = rearr[0];
    buffer = rearr[1];
    buffer = buffer.reverse();
    let val = fromwire_chain_hash(buffer);
    buffer = buffer.slice(len);
    return [{
        "type":type,
        "len":len,
        "val":val[0]
    },buffer];
}

function fromwire_init(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_u16(buffer);
    let lenfield_gflen = retarr[0];
    buffer = retarr[1];
    v = [];
    for (let i = 0; i<lenfield_gflen; i++) {
        retarr = fromwire_byte(buffer);
        v.push(retarr[0]);
        buffer = retarr[1];
    }
    value["globalfeatures"] = Buffer.from(v);
    retarr = fromwire_u16(buffer);
    let lenfield_flen = retarr[0];
    buffer = retarr[1];
    v = [];
    for (let i = 0; i<lenfield_flen; i++) {
        retarr = fromwire_byte(buffer);
        v.push(retarr[0]);
        buffer = retarr[1];
    }
    value["features"] = Buffer.from(v);
    if(buffer.length>0){
        retarr = fromwire_init_tlvs(buffer);
        value["tlvs"] = retarr[0];    buffer = retarr[1];
    }
    return value;
}
// console.log(fromwire_init(Buffer.from('0000000108','hex')));
function towire_error(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_channel_id(value["channel_id"])]);
    _n++;
    buf = Buffer.concat([buf, towire_u16(value["data"].length)]);

    _n++;
    for (let v of value["data"]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    _n++;
    assert(value.length == _n);
    return buf;
}

function fromwire_error(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_channel_id(buffer);
    value["channel_id"] = retarr[0];    buffer = retarr[1];
    retarr = fromwire_u16(buffer);
    let lenfield_len = retarr[0];
    buffer = retarr[1];
    v = [];
    for (let i = 0; lenfield_len; i++) {
        retarr = fromwire_byte(buffer);
        v.push(retarr[0]);
        buffer = retarr[1];
    }
    value["data"] = v;

    return [value, buffer];
}

function towire_ping(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_u16(value["num_pong_bytes"])]);
    _n++;
    buf = Buffer.concat([buf, towire_u16(value["ignored"].length)]);

    _n++;
    for (let v of value["ignored"]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    _n++;
    assert(value.length == _n);
    return buf;
}

function fromwire_ping(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_u16(buffer);
    value["num_pong_bytes"] = retarr[0];    buffer = retarr[1];
    retarr = fromwire_u16(buffer);
    let lenfield_byteslen = retarr[0];
    buffer = retarr[1];
    v = [];
    for (let i = 0; lenfield_byteslen; i++) {
        retarr = fromwire_byte(buffer);
        v.push(retarr[0]);
        buffer = retarr[1];
    }
    value["ignored"] = v;

    return [value, buffer];
}

function towire_pong(value)
{
    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_u16(value["ignored"].length)]);

    _n++;
    for (let v of value["ignored"]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    _n++;
    assert(value.length == _n);
    return buf;
}

function fromwire_pong(buffer)
{
    let _n = 0;
    let retarr;
    value = {};
    retarr = fromwire_u16(buffer);
    let lenfield_byteslen = retarr[0];
    buffer = retarr[1];
    v = [];
    for (let i = 0; lenfield_byteslen; i++) {
        retarr = fromwire_byte(buffer);
        v.push(retarr[0]);
        buffer = retarr[1];
    }
    value["ignored"] = v;

    return [value, buffer];
}
module.exports={
    tlv_init_tlvs,
    tlv_n1,
    tlv_n2,
    fromwire_init
}
