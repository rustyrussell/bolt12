const {
    tlv_tlv_payload,
    tlv_offer,
    tlv_invoice_request,
    tlv_invoice,
    tlv_invoice_error
}=require('./gencode.js')
console.log(tlv_offer[8][1](['1000']))