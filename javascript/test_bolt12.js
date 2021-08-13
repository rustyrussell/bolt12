const {decode}=require('./index.js');
file=require('../test-vectors/offers.json');

for(let i=0;i<file.length;i++){
    dec = decode(file[i]['string'])
    console.log(dec);
    if(dec['offer_id']!=file[i]['offer_id'] || dec['type']!=file[i]['type']){
        throw Error("Fails for test vector #"+(i+1));
    }
}

//Will write function to compare the 'contents' field..