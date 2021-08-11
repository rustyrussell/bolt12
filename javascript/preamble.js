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

// ~ Examples below,
// console.log(towire_offer_amount(['1000']))
// --> <Buffer 03 e8>

// console.log(fromwire_offer_amount(towire_offer_amount(['1000'])))
// --> [ '1000' ]

// console.log (towire_offer_description(['aditya']));
// --> <Buffer 61 64 69 74 79 61>

// console.log(fromwire_offer_description(towire_offer_description(['aditya'])));
// --> aditya

// console.log(towire_offer_node_id(['4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605']));
// --> <Buffer 4b 9a 1f a8 e0 06 f1 e3 93 7f 65 f6 6c 40 8e 6d a8 e1 ca 72 8e a4 32 22 a7 38 1d f1 cc 44 96 05> ~Will throw error if length is not appropriate(Point32)

// console.log(fromwire_offer_node_id(towire_offer_node_id(['4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605'])))
// --> [ '4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605' ] ~Will throw error if length is not appropriate(Point32)

//console.log(towire_tlv_payload_amt_to_forward(['100000000000000']))
// --> <Buffer 5a f3 10 7a 40 00>

// console.log(fromwire_tlv_payload_amt_to_forward(towire_tlv_payload_amt_to_forward(['100000000000000'])))
// --> [ '100000000000000' ]

