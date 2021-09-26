const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const sha256 = require('js-sha256');
const chacha20 = require('./chacha20.js');
function privateKeyMul(secret, tweak) {
    return Buffer.from(secp256k1.privateKeyTweakMul(Buffer.from(secret), tweak));
}
function ecdh(pubkey, privkey){
    return Buffer.from(secp256k1.ecdh(pubkey,privkey));
}
function getPublicKey(privKey, compressed = true){
    return Buffer.from(secp256k1.publicKeyCreate(privKey, compressed));
}
function RightShift(buff, num){
    const res = Buffer.alloc(buff.length, buff);
    for(let i = res.length - num - 1; i>=0; i--){
        res[num + i] = res[i];
    }
    for(let i=0; i<num; i++){
        res[i] = 0;
    }
    return res;
}
function genKey(keyType, ss){
    return crypto.createHmac('sha256', keyType).update(ss).digest();
}
function genCipher(key, len) {
    const iv = Buffer.alloc(16);
    const data = Buffer.alloc(len);
    return chacha20.encrypt(key, iv, data)
}
function genFiller(key, numHops, hopSize, sharedsec){
    const maxNhops = 20;
    const fillerSize = (maxNhops + 1) * hopSize;
    let filler = Buffer.alloc(fillerSize);
    for(let i = 0; i<numHops-1; i++){
        const slice = filler.slice(hopSize);
        filler = Buffer.alloc(fillerSize);
        slice.copy(filler);
        const streamKey = genKey(key, sharedsec[i]);
        const streamBytes = genCipher(streamKey, fillerSize);
        filler = (filler ^ streamBytes) >>> 0;
    }
    return filler.slice((maxNhops - numHops + 2) * hopSize);
}
class Shared_Secret{
    constructor(privkey, pubkey){
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
class OnionPacket {
    constructor(version=0x00, hopPayloads ,associatedData, ss){
        const routingInfo, headerMac, hmacs;
        const numHops = hopPayloads.length;
        const hopDataSize = 65;
        const hmacSize = 32;
        const routingInfoSize = 1300;
        const numStreamBytes = routingInfoSize * 2;
        const filler = genFiller('rho', numHops, hopDataSize, ss.sharedsecrets);
        const paddingKey = genKey('pad', ss.privKey);
        const paddingBytes = genCipher (paddingKey, routingInfoSize);
        let mixHeader = Buffer.alloc(routingInfoSize, paddingBytes);
        let nextHmac = Buffer.alloc(hmacSize);
        this.hmacs = [];
        for(let i=numHops-1; i>=0; i--){
            const rhoKey = genKey('rho', ss.sharedsecrets[i]);
            const muKey = genKey('mu', ss.sharedsecrets[i]);
            const streamBytes = genCipher(rhoKey, numStreamBytes);
            mixHeader = RightShift(mixHeader, hopDataSize);
            const hopData = Buffer.concat([Buffer.alloc(1), 
                                           hopPayloads[i],
                                           nextHmac]);
            hopData.copy(mixHeader);
            mixHeader = (mixHeader^streamBytes) >>> 0;
            if(i===numHops - 1){
                filler.copy(mixHeader, mixHeader.length - filler.length);
            }
            const packet = Buffer.concat([mixHeader, associatedData]);
            nextHmac =  crypto.createHmac('sha256', 'mu').update(packet).digest(); 
            this.hmacs.unshift(nextHmac);
        }
        this.headerMac = nextHmac;
        this.routingInfo = mixHeader;
    }
    toBuffer(){
        return Buffer.concat([
            Buffer.from([this.version]),
            this.ss.sessionPubKey,
            this.routingInfo,
            this.headerMac,
        ]);
    }
}















// var check = new Shared_Secret;
// const hopPublicKeys = [
//     Buffer.from('02eec7245d6b7d2ccb30380bfbe2a3648cd7a942653f5aa340edcea1f283686619', 'hex'),
//     Buffer.from('0324653eac434488002cc06bbfb7f10fe18991e35f9fe4302dbea6d2353dc0ab1c', 'hex'),
//     Buffer.from('027f31ebc5462c1fdce1b737ecff52d37d75dea43ce11c74d25aa297165faa2007', 'hex'),
//     Buffer.from('032c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991', 'hex'),
//     Buffer.from('02edabbd16b41c8371b92ef2f04c1185b4f03b6dcd52ba9b78d9d7c89c8f221145', 'hex')
// ];

// const sessionKey = Buffer.from('4141414141414141414141414141414141414141414141414141414141414141', 'hex');
// arr = check.computeSharedSecrets(sessionKey, hopPublicKeys);
// console.log(arr);