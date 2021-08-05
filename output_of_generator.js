var assert = require('assert');
const {
    towire_byte,
    fromwire_byte,
    towire_chain_hash,
    fromwire_chain_hash,
    towire_channel_id,
    fromwire_channel_id,
    towire_description,
    fromwire_description,
    towire_point,
    fromwire_point,
    towire_sha256,
    fromwire_sha256,
    towire_short_channel_id,
    fromwire_short_channel_id,
    towire_signature,
    fromwire_signature,
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

function towire_tlv_payload_amt_to_forward(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_tlv_payload_amt_to_forward(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_tlv_payload_outgoing_cltv_value(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_tlv_payload_outgoing_cltv_value(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_tlv_payload_short_channel_id(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_short_channel_id(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_tlv_payload_short_channel_id(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_short_channel_id(buffer));

    return value;
}
function towire_tlv_payload_payment_data(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    assert.equal(value[_n].length == 32)
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_tlv_payload_payment_data(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; i < 32; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);    value.push(fromwire_tu64(buffer));

    return value;
}
const tlv_tlv_payload = {
    2: [ "amt_to_forward", towire_tlv_payload_amt_to_forward, fromwire_tlv_payload_amt_to_forward ],    4: [ "outgoing_cltv_value", towire_tlv_payload_outgoing_cltv_value, fromwire_tlv_payload_outgoing_cltv_value ],    6: [ "short_channel_id", towire_tlv_payload_short_channel_id, fromwire_tlv_payload_short_channel_id ],    8: [ "payment_data", towire_tlv_payload_payment_data, fromwire_tlv_payload_payment_data ],}
function towire_offer_chains(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_chain_hash(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_offer_chains(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_chain_hash(buffer));
    }
    value.push(v);
    return value;
}
function towire_offer_currency(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_offer_currency(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_offer_amount(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_amount(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_offer_description(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_offer_description(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_offer_features(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_offer_features(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_offer_absolute_expiry(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_absolute_expiry(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_offer_paths(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_blinded_path(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_offer_paths(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_blinded_path(buffer));
    }
    value.push(v);
    return value;
}
function towire_offer_vendor(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_offer_vendor(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_offer_quantity_min(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_quantity_min(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_offer_quantity_max(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_quantity_max(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_offer_recurrence(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_byte(value[_n++])]);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_recurrence(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_byte(buffer));
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_offer_recurrence_paywindow(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_u32(value[_n++])]);
    buf = Buffer.concat([buf, towire_byte(value[_n++])]);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_recurrence_paywindow(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_u32(buffer));
    value.push(fromwire_byte(buffer));
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_offer_recurrence_limit(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_recurrence_limit(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_offer_recurrence_base(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_byte(value[_n++])]);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_recurrence_base(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_byte(buffer));
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_offer_node_id(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_node_id(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_offer_send_invoice(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_send_invoice(buffer)
{    _n = 0;
    value = [];

    return value;
}
function towire_offer_refund_for(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_refund_for(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_offer_signature(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_signature(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_offer_signature(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_signature(buffer));

    return value;
}
const tlv_offer = {
    2: [ "chains", towire_offer_chains, fromwire_offer_chains ],    6: [ "currency", towire_offer_currency, fromwire_offer_currency ],    8: [ "amount", towire_offer_amount, fromwire_offer_amount ],    10: [ "description", towire_offer_description, fromwire_offer_description ],    12: [ "features", towire_offer_features, fromwire_offer_features ],    14: [ "absolute_expiry", towire_offer_absolute_expiry, fromwire_offer_absolute_expiry ],    16: [ "paths", towire_offer_paths, fromwire_offer_paths ],    20: [ "vendor", towire_offer_vendor, fromwire_offer_vendor ],    22: [ "quantity_min", towire_offer_quantity_min, fromwire_offer_quantity_min ],    24: [ "quantity_max", towire_offer_quantity_max, fromwire_offer_quantity_max ],    26: [ "recurrence", towire_offer_recurrence, fromwire_offer_recurrence ],    64: [ "recurrence_paywindow", towire_offer_recurrence_paywindow, fromwire_offer_recurrence_paywindow ],    66: [ "recurrence_limit", towire_offer_recurrence_limit, fromwire_offer_recurrence_limit ],    28: [ "recurrence_base", towire_offer_recurrence_base, fromwire_offer_recurrence_base ],    30: [ "node_id", towire_offer_node_id, fromwire_offer_node_id ],    54: [ "send_invoice", towire_offer_send_invoice, fromwire_offer_send_invoice ],    34: [ "refund_for", towire_offer_refund_for, fromwire_offer_refund_for ],    240: [ "signature", towire_offer_signature, fromwire_offer_signature ],}
function towire_invoice_request_chains(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_chain_hash(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_chains(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_chain_hash(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_request_offer_id(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_offer_id(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_request_amount(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_amount(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_request_features(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_features(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_request_quantity(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_quantity(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_request_recurrence_counter(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_recurrence_counter(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_invoice_request_recurrence_start(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_recurrence_start(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_invoice_request_payer_key(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_payer_key(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_request_payer_note(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_payer_note(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_request_payer_info(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_payer_info(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_request_replace_invoice(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_replace_invoice(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_request_payer_signature(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_signature(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_request_payer_signature(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_signature(buffer));

    return value;
}
const tlv_invoice_request = {
    2: [ "chains", towire_invoice_request_chains, fromwire_invoice_request_chains ],    4: [ "offer_id", towire_invoice_request_offer_id, fromwire_invoice_request_offer_id ],    8: [ "amount", towire_invoice_request_amount, fromwire_invoice_request_amount ],    12: [ "features", towire_invoice_request_features, fromwire_invoice_request_features ],    32: [ "quantity", towire_invoice_request_quantity, fromwire_invoice_request_quantity ],    36: [ "recurrence_counter", towire_invoice_request_recurrence_counter, fromwire_invoice_request_recurrence_counter ],    68: [ "recurrence_start", towire_invoice_request_recurrence_start, fromwire_invoice_request_recurrence_start ],    38: [ "payer_key", towire_invoice_request_payer_key, fromwire_invoice_request_payer_key ],    39: [ "payer_note", towire_invoice_request_payer_note, fromwire_invoice_request_payer_note ],    50: [ "payer_info", towire_invoice_request_payer_info, fromwire_invoice_request_payer_info ],    56: [ "replace_invoice", towire_invoice_request_replace_invoice, fromwire_invoice_request_replace_invoice ],    240: [ "payer_signature", towire_invoice_request_payer_signature, fromwire_invoice_request_payer_signature ],}
function towire_invoice_chains(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_chain_hash(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_chains(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_chain_hash(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_offer_id(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_offer_id(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_amount(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_amount(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_description(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_description(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_features(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_features(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_paths(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_blinded_path(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_paths(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_blinded_path(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_blindedpay(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_blinded_payinfo(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_blindedpay(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_blinded_payinfo(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_blinded_capacities(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_u64(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_blinded_capacities(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_u64(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_vendor(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_vendor(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_node_id(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_node_id(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_quantity(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_quantity(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_refund_for(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_refund_for(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_recurrence_counter(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_recurrence_counter(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_invoice_send_invoice(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_send_invoice(buffer)
{    _n = 0;
    value = [];

    return value;
}
function towire_invoice_recurrence_start(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_recurrence_start(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_invoice_recurrence_basetime(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_recurrence_basetime(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_payer_key(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_payer_key(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_payer_note(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_payer_note(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_payer_info(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_payer_info(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_created_at(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_created_at(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_payment_hash(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_payment_hash(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_relative_expiry(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_relative_expiry(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_invoice_cltv(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu32(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_cltv(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu32(buffer));

    return value;
}
function towire_invoice_fallbacks(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_byte(value[1].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_fallback_address(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_fallbacks(buffer)
{    _n = 0;
    value = [];
    let lenfield_num = fromwire_byte(buffer);    v = [];
    for (let i = 0; i < lenfield_num; i++) {
        v.push(fromwire_fallback_address(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_refund_signature(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_signature(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_refund_signature(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_signature(buffer));

    return value;
}
function towire_invoice_replace_invoice(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_replace_invoice(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invoice_signature(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_signature(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_signature(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_signature(buffer));

    return value;
}
const tlv_invoice = {
    2: [ "chains", towire_invoice_chains, fromwire_invoice_chains ],    4: [ "offer_id", towire_invoice_offer_id, fromwire_invoice_offer_id ],    8: [ "amount", towire_invoice_amount, fromwire_invoice_amount ],    10: [ "description", towire_invoice_description, fromwire_invoice_description ],    12: [ "features", towire_invoice_features, fromwire_invoice_features ],    16: [ "paths", towire_invoice_paths, fromwire_invoice_paths ],    18: [ "blindedpay", towire_invoice_blindedpay, fromwire_invoice_blindedpay ],    19: [ "blinded_capacities", towire_invoice_blinded_capacities, fromwire_invoice_blinded_capacities ],    20: [ "vendor", towire_invoice_vendor, fromwire_invoice_vendor ],    30: [ "node_id", towire_invoice_node_id, fromwire_invoice_node_id ],    32: [ "quantity", towire_invoice_quantity, fromwire_invoice_quantity ],    34: [ "refund_for", towire_invoice_refund_for, fromwire_invoice_refund_for ],    36: [ "recurrence_counter", towire_invoice_recurrence_counter, fromwire_invoice_recurrence_counter ],    54: [ "send_invoice", towire_invoice_send_invoice, fromwire_invoice_send_invoice ],    68: [ "recurrence_start", towire_invoice_recurrence_start, fromwire_invoice_recurrence_start ],    64: [ "recurrence_basetime", towire_invoice_recurrence_basetime, fromwire_invoice_recurrence_basetime ],    38: [ "payer_key", towire_invoice_payer_key, fromwire_invoice_payer_key ],    39: [ "payer_note", towire_invoice_payer_note, fromwire_invoice_payer_note ],    50: [ "payer_info", towire_invoice_payer_info, fromwire_invoice_payer_info ],    40: [ "created_at", towire_invoice_created_at, fromwire_invoice_created_at ],    42: [ "payment_hash", towire_invoice_payment_hash, fromwire_invoice_payment_hash ],    44: [ "relative_expiry", towire_invoice_relative_expiry, fromwire_invoice_relative_expiry ],    46: [ "cltv", towire_invoice_cltv, fromwire_invoice_cltv ],    48: [ "fallbacks", towire_invoice_fallbacks, fromwire_invoice_fallbacks ],    52: [ "refund_signature", towire_invoice_refund_signature, fromwire_invoice_refund_signature ],    56: [ "replace_invoice", towire_invoice_replace_invoice, fromwire_invoice_replace_invoice ],    240: [ "signature", towire_invoice_signature, fromwire_invoice_signature ],}
function towire_invoice_error_erroneous_field(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    buf = Buffer.concat([buf, towire_tu64(value[_n++])]);

    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_error_erroneous_field(buffer)
{    _n = 0;
    value = [];
    value.push(fromwire_tu64(buffer));

    return value;
}
function towire_invoice_error_suggested_value(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_error_suggested_value(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invoice_error_error(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }
    assert(value.length == _n);
    return buf;
}
function fromwire_invoice_error_error(buffer)
{    _n = 0;
    value = [];
    v = [];
    for (let i = 0; buffer.length != 0; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
const tlv_invoice_error = {
    1: [ "erroneous_field", towire_invoice_error_erroneous_field, fromwire_invoice_error_erroneous_field ],    3: [ "suggested_value", towire_invoice_error_suggested_value, fromwire_invoice_error_suggested_value ],    5: [ "error", towire_invoice_error_error, fromwire_invoice_error_error ],}
function towire_onionmsg_path(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_point(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_onionmsg_path(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_point(buffer));
    let lenfield_enclen = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_enclen; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_blinded_path(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_point(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_onionmsg_path(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_blinded_path(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_point(buffer));
    let lenfield_num_hops = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_num_hops; i++) {
        v.push(fromwire_onionmsg_path(buffer));
    }
    value.push(v);
    return value;
}
function towire_blinded_payinfo(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u32(value[_n++])]);
    buf = Buffer.concat([buf, towire_u32(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[4].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_blinded_payinfo(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u32(buffer));
    value.push(fromwire_u32(buffer));
    value.push(fromwire_u16(buffer));
    let lenfield_flen = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_flen; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_fallback_address(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_byte(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_fallback_address(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_byte(buffer));
    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_invalid_realm(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_invalid_realm(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_temporary_node_failure(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_temporary_node_failure(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_permanent_node_failure(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_permanent_node_failure(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_required_node_feature_missing(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_required_node_feature_missing(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_invalid_onion_version(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_invalid_onion_version(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invalid_onion_hmac(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_invalid_onion_hmac(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_invalid_onion_key(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_sha256(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_invalid_onion_key(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_sha256(buffer));

    return value;
}
function towire_temporary_channel_failure(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u16(value[1].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_temporary_channel_failure(buffer)
{    _n = 0;
    value = [];    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_permanent_channel_failure(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_permanent_channel_failure(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_required_channel_feature_missing(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_required_channel_feature_missing(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_unknown_next_peer(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_unknown_next_peer(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_amount_below_minimum(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u64(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_amount_below_minimum(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u64(buffer));
    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_fee_insufficient(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u64(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_fee_insufficient(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u64(buffer));
    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_incorrect_cltv_expiry(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u32(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_incorrect_cltv_expiry(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u32(buffer));
    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_expiry_too_soon(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u16(value[1].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_expiry_too_soon(buffer)
{    _n = 0;
    value = [];    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_incorrect_or_unknown_payment_details(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u64(value[_n++])]);
    buf = Buffer.concat([buf, towire_u32(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_incorrect_or_unknown_payment_details(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u64(buffer));
    value.push(fromwire_u32(buffer));

    return value;
}
function towire_final_incorrect_cltv_expiry(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u32(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_final_incorrect_cltv_expiry(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u32(buffer));

    return value;
}
function towire_final_incorrect_htlc_amount(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u64(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_final_incorrect_htlc_amount(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u64(buffer));

    return value;
}
function towire_channel_disabled(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_u16(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[2].length)]);
    for (let v in value[_n]) {
        buf = Buffer.concat([buf, towire_byte(v)]);
    }    assert(value.length == _n);
    return buf;
}function fromwire_channel_disabled(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_u16(buffer));
    let lenfield_len = fromwire_u16(buffer);    v = [];
    for (let i = 0; i < lenfield_len; i++) {
        v.push(fromwire_byte(buffer));
    }
    value.push(v);
    return value;
}
function towire_expiry_too_far(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_expiry_too_far(buffer)
{    _n = 0;
    value = [];
    return value;
}
function towire_invalid_onion_payload(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    buf = Buffer.concat([buf, towire_bigsize(value[_n++])]);
    buf = Buffer.concat([buf, towire_u16(value[_n++])]);
    assert(value.length == _n);
    return buf;
}function fromwire_invalid_onion_payload(buffer)
{    _n = 0;
    value = [];    value.push(fromwire_bigsize(buffer));
    value.push(fromwire_u16(buffer));

    return value;
}
function towire_mpp_timeout(value)
{    let _n = 0;
    let buf = Buffer.alloc(0);    assert(value.length == _n);
    return buf;
}function fromwire_mpp_timeout(buffer)
{    _n = 0;
    value = [];
    return value;
}
