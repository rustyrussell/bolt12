const WebSocket= require('ws');
const {
    tlv_init_tlvs,
    tlv_n1,
    tlv_n2,
    fromwire_init
}=require('./gencode_bolt1.js');
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto')
const {NoiseState}=require('./noise.js');
var Socket = new WebSocket('ws://128.199.202.168:9735');
var ls=Buffer.from('ea8d3091934f2c86c216370f0206acaaa2ee12462387743c358ca5f0245bf561','hex');

var es;
do {
  es = randomBytes(32)
} while (!secp256k1.privateKeyVerify(es))
let vals={ls,es};
let noise = new NoiseState(vals);
let rpk=Buffer.from('024b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605','hex');
var global_buffer=Buffer.alloc(0);
Socket.onopen=function(){
    Socket.send(noise.initiatorAct1(rpk));
    // console.log('InitiatorAct1!');
}
Socket.onmessage=function(evt) {
    // console.log('Received!');
    global_buffer= Buffer.concat([global_buffer, evt.data])
    if(global_buffer.length < 50){
        return;
    }
    var act2_buf=global_buffer.slice(0,50);
    global_buffer=global_buffer.slice(50);
    noise.initiatorAct2(act2_buf);
    // console.log('InitiatorAct2!');
    var Act3 = noise.initiatorAct3();
    Socket.send(Act3);
    // console.log('InitiatorAct3!');
    console.log('Connection_established!');
    Socket.onmessage=function (init) {
        global_buffer= Buffer.concat([global_buffer, init.data])
        console.log(noise.decryptLength(global_buffer.slice(0,18)));
        // console.log((global_buffer.slice(18)).toString('hex'));
        global_buffer=global_buffer.slice(18);

        let init_msg=noise.decryptMessage(global_buffer);
        
        init_msg=init_msg.slice(2);

        console.log(fromwire_init(init_msg));
        
        Socket.send(noise.encryptMessage(Buffer.from('00100000000580082a6aa201206fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000','hex')));
        console.log('sent!');
        Socket.onmessage=function (init2) {
            // console.log(init2);
            var len=noise.decryptLength(init2.data.slice(0,18));
            console.log(len);
            console.log(noise.decryptMessage(init2.data.slice(18,18+len+16)).toString('hex'));
            var dick={"method": "listconfigs", "rune":"zO-SpOC7Tt5XjqU23ep4WEr56YzJm_QW1_Pc6jPJrPI9MyZtZXRob2RebGlzdHxtZXRob2ReZ2V0fG1ldGhvZD1zdW1tYXJ5Jm1ldGhvZC9nZXRzaGFyZWRzZWNyZXQmbWV0aG9kL2xpc3RkYXRhc3RvcmU=", "params":[],"id":1}
            console.log(Buffer.concat([Buffer.from('4c4f','hex'), Buffer.from([0,0,0,0,0,0,0,0]) ,Buffer.from(JSON.stringify(dick))]).toString('hex'));
            Socket.send(noise.encryptMessage(Buffer.concat([Buffer.from('4c4f','hex'),Buffer.from([0,0,0,0,0,0,0,0]) ,Buffer.from(JSON.stringify(dick))])));
            console.log('sent!');
            Socket.onmessage=function (init3) {
                var len=noise.decryptLength(init3.data.slice(0,18));
                console.log(noise.decryptMessage(init3.data.slice(18,18+len+16)).toString());
            }
        }
    }
}

// rpc.server('ws://128.199.202.168:9735')
// Socket.addEventListener('message', function (event) {
//     console.log('Message from server ', event.data);
// });
Socket.onclose=function () {
    console.log([
    {
        'rn':noise.rn,
        'sn':noise.sn
    },
    {
        'sk':noise.sk,
        'rk':noise.rk
    },
    {
        'ck':noise.ck
    }
    ])
}