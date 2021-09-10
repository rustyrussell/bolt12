const secp256k1 = require('secp256k1');
const sha256 = require('js-sha256');
const crypto = require('crypto');
function ecdh(pubkey, privkey){
    return Buffer.from(secp256k1.ecdh(pubkey,privkey));
}
function hmacHash(key, input, hash) {
    var hmac = crypto.createHmac(hash, key);
    hmac.update(input);
    return hmac.digest();
}
function hkdf(ikm, len, salt, info, hash) {
    if (salt === void 0) { salt = Buffer.alloc(0); }
    if (info === void 0) { info = Buffer.alloc(0); }
    if (hash === void 0) { hash = "sha256"; }
    // extract step
    var prk = hmacHash(salt, ikm, hash);
    // expand
    var n = Math.ceil(len / prk.byteLength);
    if (n > 255)
        throw new Error("Output length exceeds maximum");
    var t = [Buffer.alloc(0)];
    for (var i = 1; i <= n; i++) {
        var tp = t[t.length - 1];
        var bi = Buffer.from([i]);
        t.push(hmacHash(prk, Buffer.concat([tp, info, bi]), hash));
    }
    return Buffer.concat(t.slice(1)).slice(0, len);
}

function getPublicKey(privKey, compressed = true){
    return Buffer.from(secp256k1.publicKeyCreate(privKey, compressed));
}
function ccpEncrypt(k, n, ad, plaintext) {
    var cipher = crypto.createCipheriv("ChaCha20-Poly1305", k, n, { authTagLength: 16 });
    cipher.setAAD(ad, undefined);
    var pad = cipher.update(plaintext);
    cipher.final();
    var tag = cipher.getAuthTag();
    return Buffer.concat([pad, tag]);
}
function ccpDecrypt(k, n, ad, ciphertext) {
    var decipher = crypto.createDecipheriv("ChaCha20-Poly1305", k, n, {
        authTagLength: 16,
    });
    decipher.setAAD(ad, undefined);
    if (ciphertext.length === 16) {
        decipher.setAuthTag(ciphertext);
        return decipher.final();
    }
    if (ciphertext.length > 16) {
        var tag = ciphertext.slice(ciphertext.length - 16);
        var pad = ciphertext.slice(0, ciphertext.length - 16);
        decipher.setAuthTag(tag);
        var m = decipher.update(pad);
        var f = decipher.final();
        m = Buffer.concat([m, f]);
        return m;
    }
}

var NoiseState = (function () {
    function NoiseState(_a) {
        var ls = _a.ls, es = _a.es;
        this.protocolName = Buffer.from("Noise_XK_secp256k1_ChaChaPoly_SHA256");
        this.prologue = Buffer.from("lightning");
        this.ls = ls;
        this.lpk = getPublicKey(ls);
        this.es = es;
        this.epk = getPublicKey(es);
    }
    NoiseState.prototype.initiatorAct1 = function (rpk) {
        this.rpk = rpk;
        this._initialize(this.rpk);
        // 2. h = SHA-256(h || epk)
        this.h = sha256(Buffer.concat([this.h, this.epk]));
        // 3. es = ECDH(e.priv, rs)
        var ss = ecdh(this.rpk, this.es);
        // 4. ck, temp_k1 = HKDF(ck, es)
        var tempK1 = hkdf(ss, 64, this.ck);
        this.ck = tempK1.slice(0, 32);
        this.tempK1 = tempK1.slice(32);
        // 5. c = encryptWithAD(temp_k1, 0, h, zero)
        var c = ccpEncrypt(this.tempK1, Buffer.alloc(12), this.h, Buffer.alloc(0));
        // 6. h = SHA-256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 7. m = 0 || epk || c
        var m = Buffer.concat([Buffer.alloc(1), this.epk, c]);
        return m;
    };
    NoiseState.prototype.initiatorAct2 = function (m) {
        // 1. read exactly 50 bytes off the stream
        if (m.length !== 50)
            throw new Error("ACT2_READ_FAILED");
        // 2. parse th read message m into v, re, and c
        var v = m.slice(0, 1)[0];
        var re = m.slice(1, 34);
        var c = m.slice(34);
        // 2a. convert re to public key
        this.repk = re;
        // 3. assert version is known version
        if (v !== 0)
            throw new Error("ACT2_BAD_VERSION");
        // 4. sha256(h || re.serializedCompressed');
        this.h = sha256(Buffer.concat([this.h, this.repk]));
        // 5. ss = ECDH(re, e.priv);
        var ss = ecdh(this.repk, this.es);
        // 6. ck, temp_k2 = HKDF(cd, ss)
        var tempK2 = hkdf(ss, 64, this.ck);
        this.ck = tempK2.slice(0, 32);
        this.tempK2 = tempK2.slice(32);
        // 7. p = decryptWithAD()
        ccpDecrypt(this.tempK2, Buffer.alloc(12), this.h, c);
        // 8. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
    };
    NoiseState.prototype.initiatorAct3 = function () {
        // 1. c = encryptWithAD(temp_k2, 1, h, lpk)
        var c = ccpEncrypt(this.tempK2, Buffer.from([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]), this.h, this.lpk);
        // 2. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 3. ss = ECDH(re, s.priv)
        var ss = ecdh(this.repk, this.ls);
        // 4. ck, temp_k3 = HKDF(ck, ss)
        var tempK3 = hkdf(ss, 64, this.ck);
        this.ck = tempK3.slice(0, 32);
        this.tempK3 = tempK3.slice(32);
        // 5. t = encryptWithAD(temp_k3, 0, h, zero)
        var t = ccpEncrypt(this.tempK3, Buffer.alloc(12), this.h, Buffer.alloc(0));
        // 6. sk, rk = hkdf(ck, zero)
        var sk = hkdf(Buffer.alloc(0), 64, this.ck);
        this.rk = sk.slice(32);
        this.sk = sk.slice(0, 32);
        // 7. rn = 0, sn = 0
        this.sn = Buffer.alloc(12);
        this.rn = Buffer.alloc(12);
        // 8. send m = 0 || c || t
        var m = Buffer.concat([Buffer.alloc(1), c, t]);
        return m;
    };
    NoiseState.prototype.receiveAct1 = function (m) {
        this._initialize(this.lpk);
        // 1. read exactly 50 bytes off the stream
        if (m.length !== 50)
            throw new Error("ACT1_READ_FAILED");
        // 2. parse th read message m into v,re, and c
        var v = m.slice(0, 1)[0];
        var re = m.slice(1, 34);
        var c = m.slice(34);
        this.repk = re;
        // 3. assert version is known version
        if (v !== 0)
            throw new Error("ACT1_BAD_VERSION");
        // 4. sha256(h || re.serializedCompressed');
        this.h = sha256(Buffer.concat([this.h, re]));
        // 5. ss = ECDH(re, ls.priv);
        var ss = ecdh(re, this.ls);
        // 6. ck, temp_k1 = HKDF(cd, ss)
        var tempK1 = hkdf(ss, 64, this.ck);
        this.ck = tempK1.slice(0, 32);
        this.tempK1 = tempK1.slice(32);
        // 7. p = decryptWithAD(temp_k1, 0, h, c)
        ccpDecrypt(this.tempK1, Buffer.alloc(12), this.h, c);
        // 8. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
    };
    NoiseState.prototype.recieveAct2 = function () {
        // 1. e = generateKey() => done in initialization
        // 2. h = sha256(h || e.pub.compressed())
        this.h = sha256(Buffer.concat([this.h, this.epk]));
        // 3. ss = ecdh(re, e.priv)
        var ss = ecdh(this.repk, this.es);
        // 4. ck, temp_k2 = hkdf(ck, ss)
        var tempK2 = hkdf(ss, 64, this.ck);
        this.ck = tempK2.slice(0, 32);
        this.tempK2 = tempK2.slice(32);
        // 5. c = encryptWithAd(temp_k2, 0, h, zero)
        var c = ccpEncrypt(this.tempK2, Buffer.alloc(12), this.h, Buffer.alloc(0));
        // 6. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 7. m = 0 || e.pub.compressed() Z|| c
        var m = Buffer.concat([Buffer.alloc(1), this.epk, c]);
        return m;
    };
    NoiseState.prototype.receiveAct3 = function (m) {
        // 1. read exactly 66 bytes from the network buffer
        if (m.length !== 66)
            throw new Error("ACT3_READ_FAILED");
        // 2. parse m into v, c, t
        var v = m.slice(0, 1)[0];
        var c = m.slice(1, 50);
        var t = m.slice(50);
        // 3. validate v is recognized
        if (v !== 0)
            throw new Error("ACT3_BAD_VERSION");
        // 4. rs = decryptWithAD(temp_k2, 1, h, c)
        var rs = ccpDecrypt(this.tempK2, Buffer.from("000000000100000000000000", "hex"), this.h, c);
        this.rpk = rs;
        // 5. h = sha256(h || c)
        this.h = sha256(Buffer.concat([this.h, c]));
        // 6. ss = ECDH(rs, e.priv)
        var ss = ecdh(this.rpk, this.es);
        // 7. ck, temp_k3 = hkdf(cs, ss)
        var tempK3 = hkdf(ss, 64, this.ck);
        this.ck = tempK3.slice(0, 32);
        this.tempK3 = tempK3.slice(32);
        // 8. p = decryptWithAD(temp_k3, 0, h, t)
        ccpDecrypt(this.tempK3, Buffer.alloc(12), this.h, t);
        // 9. rk, sk = hkdf(ck, zero)
        var sk = hkdf(Buffer.alloc(0), 64, this.ck);
        this.rk = sk.slice(0, 32);
        this.sk = sk.slice(32);
        // 10. rn = 0, sn = 0
        this.rn = Buffer.alloc(12);
        this.sn = Buffer.alloc(12);
    };
    NoiseState.prototype.encryptMessage = function (m) {
        // step 1/2. serialize m length into int16
        var l = Buffer.alloc(2);
        l.writeUInt16BE(m.length, 0);
        // step 3. encrypt l, using chachapoly1305, sn, sk)
        var lc = ccpEncrypt(this.sk, this.sn, Buffer.alloc(0), l);
        // step 3a: increment sn
        if (this._incrementSendingNonce() >= 1000)
            this._rotateSendingKeys();
        // step 4 encrypt m using chachapoly1305, sn, sk
        var c = ccpEncrypt(this.sk, this.sn, Buffer.alloc(0), m);
        // step 4a: increment sn
        if (this._incrementSendingNonce() >= 1000)
            this._rotateSendingKeys();
        // step 5 return m to be sent
        return Buffer.concat([lc, c]);
    };
    NoiseState.prototype.decryptLength = function (lc) {
        var l = ccpDecrypt(this.rk, this.rn, Buffer.alloc(0), lc);
        if (this._incrementRecievingNonce() >= 1000)
            this._rotateRecievingKeys();
        return l.readUInt16BE(0);
    };
    NoiseState.prototype.decryptMessage = function (c) {
        var m = ccpDecrypt(this.rk, this.rn, Buffer.alloc(0), c);
        if (this._incrementRecievingNonce() >= 1000)
            this._rotateRecievingKeys();
        return m;
    };
    
    // Initializes the noise state prior to Act1.
    
    NoiseState.prototype._initialize = function (pubkey) {
        // 1. h = SHA-256(protocolName)
        this.h = sha256(Buffer.from(this.protocolName));
        // 2. ck = h
        this.ck = this.h;
        // 3. h = SHA-256(h || prologue)
        this.h = sha256(Buffer.concat([this.h, this.prologue]));
        // 4. h = SHA-256(h || pubkey)
        this.h = sha256(Buffer.concat([this.h, pubkey]));
    };
    NoiseState.prototype._incrementSendingNonce = function () {
        var newValue = this.sn.readUInt16LE(4) + 1;
        this.sn.writeUInt16LE(newValue, 4);
        return newValue;
    };
    NoiseState.prototype._incrementRecievingNonce = function () {
        var newValue = this.rn.readUInt16LE(4) + 1;
        this.rn.writeUInt16LE(newValue, 4);
        return newValue;
    };
    NoiseState.prototype._rotateSendingKeys = function () {
        var result = hkdf(this.sk, 64, this.ck);
        this.sk = result.slice(32);
        this.ck = result.slice(0, 32);
        this.sn = Buffer.alloc(12);
    };
    NoiseState.prototype._rotateRecievingKeys = function () {
        var result = hkdf(this.rk, 64, this.ck);
        this.rk = result.slice(32);
        this.ck = result.slice(0, 32);
        this.rn = Buffer.alloc(12);
    };
    return NoiseState;
}());