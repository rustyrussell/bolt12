const {decode}=require('./index.js');
file=require('../test-vectors/offers.json');

for(let i=0;i<file.length;i++){
    console.log(file[i]['comment'])
    dec = decode(file[i]['string'])
    assert dec['contents'] === file[i]['contents']
    assert dec['offer_id'] === file[i]['offer_id']
    assert dec['prefix'] === file[i]['type']
}
