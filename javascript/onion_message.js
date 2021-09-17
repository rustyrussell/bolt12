const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const sha256 = require('js-sha256');
function privateKeyMul(secret, tweak) {
    return Buffer.from(secp256k1.privateKeyTweakMul(Buffer.from(secret), tweak));
}
function ecdh(pubkey, privkey){
    return Buffer.from(secp256k1.ecdh(pubkey,privkey));
}
function getPublicKey(privKey, compressed = true){
    return Buffer.from(secp256k1.publicKeyCreate(privKey, compressed));
}
class Shared_Secret{
    computeSharedSecret(privkey, pubkey){
        const sharedsecrets = this.computeSharedSecret(privkey, [pubkey]);
    }   
    computeSharedSecrets(sessionKey, hopPubKeys){
        let sessionPubKey = getPublicKey(sessionKey,true);
        let hopSharedSecrets = [];
        let ephemeralKey = sessionKey;
        for (let i=0; i<hopPubKeys.length; i++){
            let ecd = ecdh(hopPubKeys[i], ephemeralKey);
            hopSharedSecrets.push(ecd);
            let ephemeralPubKey = getPublicKey(ephemeralKey);
            let blindingFactor = sha256(Buffer.concat([ephemeralPubKey, ecd]));
            ephemeralKey = privateKeyMul(ephemeralKey, Buffer.from(blindingFactor,'hex'));
        }
        return hopSharedSecrets;
    }
}
var check = new Shared_Secret;
const hopPublicKeys = [
    Buffer.from('02eec7245d6b7d2ccb30380bfbe2a3648cd7a942653f5aa340edcea1f283686619', 'hex'),
    Buffer.from('0324653eac434488002cc06bbfb7f10fe18991e35f9fe4302dbea6d2353dc0ab1c', 'hex'),
    Buffer.from('027f31ebc5462c1fdce1b737ecff52d37d75dea43ce11c74d25aa297165faa2007', 'hex'),
    Buffer.from('032c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991', 'hex'),
    Buffer.from('02edabbd16b41c8371b92ef2f04c1185b4f03b6dcd52ba9b78d9d7c89c8f221145', 'hex')
];

const sessionKey = Buffer.from('4141414141414141414141414141414141414141414141414141414141414141', 'hex');
arr = check.computeSharedSecrets(sessionKey, hopPublicKeys);
console.log(arr);

