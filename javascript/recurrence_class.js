"use strict"
var schnorr = require("bip-schnorr")
const sha256 = require('js-sha256');

module.exports={
    Recurrence
}

// var recur=new Recurrence({'period':10,'time_unit':0},null,1,{'basetime':31485600, 'start_any_perriod':0});
// console.log(recur.get_period(1))
// function hash(buffer) {
//     return Buffer.from(sha256.create().update(buffer).array());
// }
// function taggedHash(tag, msg) {
//     const tagHash = hash(tag);
//     return hash(Buffer.concat([tagHash, tagHash, Buffer.from(msg,'hex')]));
// }
// hash = taggedHash(Buffer.from('lightningoffersignature'),'28522b52ac39fa518ce3a5b3e4a9a96372487e78ba5eb1540ec4d9f02ca82718');
// if (schnorr.verify(Buffer.from('4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605','hex'),hash,Buffer.from('f4c5b54263766d8aa86dcb28b9973449cf995ef58ce8a96430bbb5b516460f465e9794b6842f1260b400966a3eb7e1557998f858aeb5bce1459ebc984fa3cabb','hex'))){
//     console.log('i am here');
// }
// else console.log('fucked');
// console.log(Buffer.from('28522b52ac39fa518ce3a5b3e4a9a96372487e78ba5eb1540ec4d9f02ca82718','hex'));