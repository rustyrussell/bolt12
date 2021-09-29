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
function chachaEncrypt(key, iv, data){
    let cipher = crypto.createCipheriv('chacha20', key, iv);
    return cipher.update(data);
}
function genCipher(key, len) {
    const iv = Buffer.alloc(16);
    const data = Buffer.alloc(len);
    return chachaEncrypt(key, iv, data)
}
function xor(a, b) {
    const result = Buffer.alloc(Math.min(a.length, b.length));
    for (let i = 0; i < result.length; i++) {
        result[i] = a[i] ^ b[i];
    }
    return result;
}
function genFiller(key, numHops, hopSize, sharedsec){
    const maxNhops = 20;
    const fillerSize = (maxNhops + 1) * hopSize;
    let filler = Buffer.alloc(fillerSize);
    for(let i = 0; i<numHops-1; i++){
        let slce = filler.slice(hopSize);
        filler = Buffer.alloc(fillerSize);
        slce.copy(filler);
        let streamKey = genKey(key, sharedsec[i]);
        let streamBytes = genCipher(streamKey, fillerSize);
        filler = xor(filler, streamBytes);
    }
    return filler.slice((maxNhops - numHops + 2) * hopSize);
}
class Shared_Secret{
    constructor(privkey, hopPubKeys){
        this.privateKey = privkey;
        this.sessionPubKey = getPublicKey(privkey, true);
        this.sharedSecrets = [];
        let ephemeralKey = sessionKey;
        for (let i=0; i<hopPubKeys.length; i++){
            let ecd = ecdh(hopPubKeys[i], ephemeralKey);
            this.sharedSecrets.push(ecd);
            let ephemeralPubKey = getPublicKey(ephemeralKey);
            let blindingFactor = sha256(Buffer.concat([ephemeralPubKey, ecd]));
            ephemeralKey = privateKeyMul(ephemeralKey, Buffer.from(blindingFactor,'hex'));
        }
    }
}
class OnionPacket {
    constructor(version=0, hopPayloads ,associatedData, ss){
        const numHops = hopPayloads.length;
        const hopDataSize = 65;
        const hmacSize = 32;
        const routingInfoSize = 1300;
        const numStreamBytes = routingInfoSize * 2;

        this.ss = ss;
        this.filler = genFiller('rho', numHops, hopDataSize, ss.sharedSecrets);
        this.paddingKey = genKey('pad', ss.privateKey);
        this.paddingBytes = genCipher (this.paddingKey, routingInfoSize);
        this.mixHeader = Buffer.alloc(routingInfoSize, this.paddingBytes);
        this.nextHmac = Buffer.alloc(hmacSize);
        this.hmacs = [];
        for(let i=numHops-1; i>=0; i--){
            let rhoKey = genKey('rho', ss.sharedSecrets[i]);
            let muKey = genKey('mu', ss.sharedSecrets[i]);
            let streamBytes = genCipher(rhoKey, numStreamBytes);
            this.mixHeader = RightShift(this.mixHeader, hopDataSize);
            let hopData = Buffer.concat([Buffer.alloc(1), 
                                           hopPayloads[i],
                                           this.nextHmac]);
            hopData.copy(this.mixHeader);
            this.mixHeader = xor(this.mixHeader, streamBytes);
            if(i==numHops - 1){
                this.filler.copy(this.mixHeader, this.mixHeader.length - this.filler.length);
            }
            let packet = Buffer.concat([this.mixHeader, associatedData]);
            this.nextHmac =  crypto.createHmac("sha256", muKey).update(packet).digest(); 
            this.hmacs.unshift(this.nextHmac);
        }
        this.headerMac = this.nextHmac;
        this.routingInfo = this.mixHeader;
    }
    toBuffer(){
        return Buffer.concat([
            Buffer.from([this.version]), // version
            this.ss.sessionPubKey, // pubkey
            this.routingInfo,
            this.headerMac,
        ]);
    }
}
// const sessionKey = Buffer.from("4141414141414141414141414141414141414141414141414141414141414141", "hex"); // prettier-ignore
// const assocData = Buffer.from("4242424242424242424242424242424242424242424242424242424242424242", "hex"); // prettier-ignore
// const pubkeys = [
//         Buffer.from("02eec7245d6b7d2ccb30380bfbe2a3648cd7a942653f5aa340edcea1f283686619", "hex"),
//         Buffer.from("0324653eac434488002cc06bbfb7f10fe18991e35f9fe4302dbea6d2353dc0ab1c", "hex"),
//         Buffer.from("027f31ebc5462c1fdce1b737ecff52d37d75dea43ce11c74d25aa297165faa2007", "hex"),
//         Buffer.from("032c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991", "hex"),
//         Buffer.from("02edabbd16b41c8371b92ef2f04c1185b4f03b6dcd52ba9b78d9d7c89c8f221145", "hex"),
//     ]; // prettier-ignore

// const hopPayloads = [
//         Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex"),
//         Buffer.from("0101010101010101000000000000000100000001000000000000000000000000", "hex"),
//         Buffer.from("0202020202020202000000000000000200000002000000000000000000000000", "hex"),
//         Buffer.from("0303030303030303000000000000000300000003000000000000000000000000", "hex"),
//         Buffer.from("0404040404040404000000000000000400000004000000000000000000000000", "hex"),
//     ]; // prettier-ignore

// const ss = new Shared_Secret(sessionKey, pubkeys);
// const res = new OnionPacket(0, hopPayloads, assocData, ss);
// // console.log(res.hmacs);
// console.log(res.toBuffer())