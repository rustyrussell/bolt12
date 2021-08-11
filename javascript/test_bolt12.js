const {decode}=require('./index.js');
file=require('../test-vectors/offers.json');

for(let i=0;i<file.length;i++){
    console.log(decode(file[i]['string']))
    console.log("\n=======================================================================================================================\n")
}
