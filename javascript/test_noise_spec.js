const {NoiseState}=require('./noise.js');

var ls = Buffer.from("1111111111111111111111111111111111111111111111111111111111111111", "hex"); 
var es = Buffer.from("1212121212121212121212121212121212121212121212121212121212121212", "hex");
let vals={ls,es};
let test1=new NoiseState(vals);

if(test1.initiatorAct1(Buffer.from('028d7500dd4c12685d1f568b4c2b5048e8534b873319f3a8daa612b469132ec7f7','hex')).toString('hex')
        !='00036360e856310ce5d294e8be33fc807077dc56ac80d95d9cd4ddbd21325eff73f70df6086551151f58b8afe6c195782c6a'
    ||test1.h!='9d1ffbb639e7e20021d9259491dc7b160aab270fb1339ef135053f6f2cebe9ce')
    throw Error('initiatorACT1 failed!');

test1.initiatorAct2(Buffer.from('0002466d7fcae563e5cb09a0d1870bb580344804617879a14949cf22285f1bae3f276e2470b93aac583c9ef6eafca3f730ae','hex'));

if(test1.h.toString('hex')!='90578e247e98674e661013da3c5c1ca6a8c8f48c90b485c0dfa1494e23d56d72')
    throw Error('initiatorACT2 failed!');

if(test1.initiatorAct3().toString('hex')!='00b9e3a702e93e3a9948c2ed6e5fd7590a6e1c3a0344cfc9d5b57357049aa22355361aa02e55a8fc28fef5bd6d71ad0c38228dc68b1c466263b47fdf31e560e139ba'
    || test1.rk.toString('hex')!='bb9020b8965f4df047e07f955f3c4b88418984aadc5cdb35096b9ea8fa5c3442'
    || test1.sk.toString('hex')!='969ab31b4d288cedf6218839b27a3e2140827047f2c0f01bf5c04435d43511a9')
    {
    throw Error('initiatorACT3 failed!');
}

if(test1.encryptMessage(Buffer.from("68656c6c6f", "hex")).toString('hex')!=
    'cf2b30ddf0cf3f80e7c35a6e6730b59fe802473180f396d88a8fb0db8cbcf25d2f214cf9ea1d95'){
    throw Error('Encryption failed!');
}

if(test1.sn.toString('hex')!='000000000200000000000000'){
    throw Error('Rotation of sending nonce failed!');
}

var input = Buffer.from("68656c6c6f", "hex");

for (let i = 1; i <= 1001; i++) {
    const m = test1.encryptMessage(input);
    const tests = {
        1: "72887022101f0b6753e0c7de21657d35a4cb2a1f5cde2650528bbc8f837d0f0d7ad833b1a256a1",
        500: "178cb9d7387190fa34db9c2d50027d21793c9bc2d40b1e14dcf30ebeeeb220f48364f7a4c68bf8",
        501: "1b186c57d44eb6de4c057c49940d79bb838a145cb528d6e8fd26dbe50a60ca2c104b56b60e45bd",
        1000: "4a2f3cc3b5e78ddb83dcb426d9863d9d9a723b0337c89dd0b005d89f8d3c05c52b76b29b740f09",
        1001: "2ecd8c8a5629d0d02ab457a0fdd0f7b90a192cd46be5ecb6ca570bfc5e268338b1a16cf4ef2d36",
    };
    if (tests[i]) {
        if(m.toString("hex")!=tests[i])
        throw Error('Key rotation failed!');
    }
}
//FIXME: decryption/error testing functions



ls = Buffer.from("2121212121212121212121212121212121212121212121212121212121212121", "hex"); // prettier-ignore
es = Buffer.from("2222222222222222222222222222222222222222222222222222222222222222", "hex"); // prettier-ignore
vals={ls,es};
let test2=new NoiseState(vals);
test2.receiveAct1(Buffer.from(
    "00036360e856310ce5d294e8be33fc807077dc56ac80d95d9cd4ddbd21325eff73f70df6086551151f58b8afe6c195782c6a",
    "hex"))

if(test2.h.toString('hex')!='9d1ffbb639e7e20021d9259491dc7b160aab270fb1339ef135053f6f2cebe9ce'){
    throw Error('receiveAct1 Failed!');
}

if(test2.recieveAct2().toString('hex')!=
    '0002466d7fcae563e5cb09a0d1870bb580344804617879a14949cf22285f1bae3f276e2470b93aac583c9ef6eafca3f730ae'
    || test2.h.toString('hex')!='90578e247e98674e661013da3c5c1ca6a8c8f48c90b485c0dfa1494e23d56d72'){
        throw Error('receiveAct2 Failed!');
}

test2.receiveAct3(Buffer.from(
    "00b9e3a702e93e3a9948c2ed6e5fd7590a6e1c3a0344cfc9d5b57357049aa22355361aa02e55a8fc28fef5bd6d71ad0c38228dc68b1c466263b47fdf31e560e139ba",
    "hex"))

if(test2.rk.toString('hex')!='969ab31b4d288cedf6218839b27a3e2140827047f2c0f01bf5c04435d43511a9'){
    throw Error('Incorrect rk!');
}

if(test2.sk.toString('hex')!='bb9020b8965f4df047e07f955f3c4b88418984aadc5cdb35096b9ea8fa5c3442'){
    throw Error('Incorrect sk!');
}

if(test2.rpk.toString('hex')!='034f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa'){
    throw Error('Remote pub key is necessary!')
}

test2.sk=test2.rk;
if(test2.encryptMessage(Buffer.from("68656c6c6f", "hex")).toString('hex')!=
    'cf2b30ddf0cf3f80e7c35a6e6730b59fe802473180f396d88a8fb0db8cbcf25d2f214cf9ea1d95')
{
    throw Error('Encription Failed!');
}

if(test2.sn.toString('hex')!='000000000200000000000000'){
    throw Error('Rotation of sending nonce failed!');
}

input = Buffer.from("68656c6c6f", "hex");
for (let i = 1; i <= 1001; i++) {
    const m = test2.encryptMessage(input);
    const tests = {
        1: "72887022101f0b6753e0c7de21657d35a4cb2a1f5cde2650528bbc8f837d0f0d7ad833b1a256a1",
        500: "178cb9d7387190fa34db9c2d50027d21793c9bc2d40b1e14dcf30ebeeeb220f48364f7a4c68bf8",
        501: "1b186c57d44eb6de4c057c49940d79bb838a145cb528d6e8fd26dbe50a60ca2c104b56b60e45bd",
        1000: "4a2f3cc3b5e78ddb83dcb426d9863d9d9a723b0337c89dd0b005d89f8d3c05c52b76b29b740f09",
        1001: "2ecd8c8a5629d0d02ab457a0fdd0f7b90a192cd46be5ecb6ca570bfc5e268338b1a16cf4ef2d36",
    };
    if (tests[i]) {
        if(m.toString("hex")!=tests[i])
        throw Error('Key rotation failed!');
    }
}

//FIXME: IMPLEMENT RECEIVE MESSAGE and ERROR 


console.log('Noise protocol working fine!');