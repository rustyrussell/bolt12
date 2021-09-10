const WebSocket= require('ws');
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
    console.log('InitiatorAct1!');
}
Socket.onmessage=function(evt) {
    console.log('Received!');
    global_buffer= Buffer.concat([global_buffer, evt.data])
    if(global_buffer.length < 50){
        return;
    }
    var act2_buf=global_buffer.slice(0,50);
    global_buffer=global_buffer.slice(50);
    noise.initiatorAct2(act2_buf);
    console.log('InitiatorAct2!');
    var Act3 = noise.initiatorAct3();
    Socket.send(Act3);
    console.log('InitiatorAct3!');
    Socket.onmessage=function (init) {
        global_buffer= Buffer.concat([global_buffer, init.data])
        console.log(noise.decryptLength(global_buffer.slice(0,18)));
        // console.log((global_buffer.slice(18)).toString('hex'));
        global_buffer=global_buffer.slice(18);
        console.log(noise.decryptMessage(global_buffer).toString())

        Socket.send(noise.encryptMessage(Buffer.from('68656c6c6f','hex')));
        console.log('sent!');
        Socket.onmessage=function (init2) {
            console.log()
            console.log(noise.decryptLength(init2.slice(0,18)));
            console.log(noise.decryptMessage(init2.slice(18)).toString());
        }
    }
}
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