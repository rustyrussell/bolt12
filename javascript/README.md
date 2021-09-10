# BOLT12
A library for decoding and verifying BOLT 12 offers, invoice_requests and invoices and talking to the lightning node through websocket.

# Installation
```npm install bolt12 ```

# Setup
```var file = require('bolt12') ```

# Example
```
var decoded=file.decode('lno1pqqkgz3zxycrqmtnv96zqetkv4e8jgryv9ujcgrxwfhk6gp3949xzm3dxgcryvg5zpe82um50yhx77nvv938xtn0wfn35qspqywq2q2laenqq83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsytf0g06zjgcrtk0n09n5wk78ssdhckpmfqmfvlxm92u36egsmf3kswfpqt70dq6mg4lw3t8qx7feh6c8hxz2vwzsdg4n957z8gh8unx')

Output:
{
  string: 'lno1pqqkgz3zxycrqmtnv96zqetkv4e8jgryv9ujcgrxwfhk6gp3949xzm3dxgcryvg5zpe82um50yhx77nvv938xtn0wfn35qspqywq2q2laenqq83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsytf0g06zjgcrtk0n09n5wk78ssdhckpmfqmfvlxm92u36egsmf3kswfpqt70dq6mg4lw3t8qx7feh6c8hxz2vwzsdg4n957z8gh8unx',
  type: 'lno',
  offer_id: 'bf3c613604bb741ab649f0712fa26ec8c74f06aea159714989de2095e0737f85',
  valid: 'true',
  contents: {
    amount: 100,
    description: '100msat every day, from 1-Jan-2021',
    vendor: 'rusty.ozlabs.org',
    recurrence: { time_unit: 1n, period: 1 },
    recurrence_base: { start_any_period: 1n, basetime: 1609459200 },
    node_id: '4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605',
    signature: '8b4bd0fd0a48c0d767cde59d1d6f1e106df160ed20da59f36caae4759443698da0e4840bf3da0d6d15fba2b380de4e6fac1ee61298e141a8accb4f08e8b9f933'
  }
}
```

We're working on invoice_request encoding feature support(This is a new feature and not very heavily tested), If you find any bug please hit us up on github!
```
invoice_request(Offer:string, 
                secret_payer_key:string,   
                {'key':'value'})
```
Make sure you enter the 'key' same as mentioned in the spec file(or https://bolt12.org/bolt12.html#invoice-requests).

# Example
```
var inv_req=file.invoice_request('lno1pqpq86q2xycnqvpsd4ekzapqv4mx2uneyqcnqgryv9uhxtpqveex7mfqxyk55ctw95erqv339ss8qun094exzarpzsg8yatnw3ujumm6d3skyuewdaexwxszqy9pcpgptlhxvqq7yp9e58aguqr0rcun0ajlvmzq3ek63cw2w282gv3z5uupmuwvgjtq2sqgqqxj7qqpp5hspuzq0pgmhkcg6tqeclvexaawhylurq90ezqrdcm7gapzvcyfzexkt8nmu628dxr375yjvax3x20cxyty8fg8wrr2dlq3nx45phn2kqru2cg',
    "ea8d3091934f2c86c216370f0206acaaa2ee12462387743c358ca5f0245bf561",
    {
        "features": ['80','00','02','42','00'],
        "recurrence_counter": 0,
        "recurrence_start": 23,
        "payer_key": "5f200a02d68bdc3958dab425515054cc08ad51e3d26bc754ee985badaf9f4d9c",
        "payer_info": ['f8','15','5f','66','88','b3','87','8e','bd','2d','8c','73','a9','1e','58','57']
    }
)
```
# Output (After decoding the obtained string 'lnr1'..') --> 
```

{
  string: 'lnr1qsswvmtmawf77xcssjnnuh0xja0tcawzp5dpw77jlvpzkygzy6a0w9svqkqqqqjzqqjqqf3qtusq5qkk30wrjkx6ksj4z5z5esy2650r6f4uw48wnpd6mtulfkwryy8cz40kdz9ns78t6tvvww53ukzhgsq30uzq29u3m8slwfstkw6qf83s3qkyshlfxntc2qlvquhapq0f5x0lwcthg9dnrkzlpjxczgxfxdfyhelsc8s9hjdqtdgtt93a2hzlrp205hq',
  type: 'lnr',
  offer_id: '2e503f8f2a755664cb2a52bf2ac892252a5d26e507de6b33d8a55030eff046be',
  contents: {
    offer_id: 'e66d7beb93ef1b1084a73e5de6975ebc75c20d1a177bd2fb022b110226baf716',
    features: [ 128, 0, 2, 66, 0 ],
    recurrence_counter: 0,
    payer_key: '5f200a02d68bdc3958dab425515054cc08ad51e3d26bc754ee985badaf9f4d9c',
    payer_info: [
      248,  21,  95, 102, 136,
      179, 135, 142, 189,  45,
      140, 115, 169,  30,  88,
       87
    ],
    recurrence_start: 23,
    payer_signature: '51791d9e1f7260bb3b4049e30882c485fe934d78503ec072fd081e9a19ff76177415b31d85f0c8d8120c933524be7f0c1e05bc9a05b50b5963d55c5f1854fa5c'
  },
  valid: 'true'
}
```
If you run a C-lightning node with installed commando plugin you can connect and run commands on your nodes through websocket.
# Example
```
connect(node_id = '024b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605',
        address = '128.199.202.168',
        port = '9735',
        local_secret_key = 'ea8d3091934f2c86c216370f0206acaaa2ee12462387743c358ca5f0245bf561',
        rune = '2bFJq-BfakFzYc7aCvuXU_Had2PjZ_PRwh-ZDp837bw9MiZtZXRob2Q9Z2V0aW5mbw==',
        method = 'getinfo'
        ); 
```
# Output

```
Connection_established!
{
  globalfeatures: <Buffer 22 00>,
  features: <Buffer 80 08 2a 6a a2>,
  tlvs: {
    type: 1,
    len: 32,
    val: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f'
  }
}
sent init message with features "80082a6aa2"!
sent!
{"result": {"id": "024b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605", "alias": "BLUEIRON-10.1-42-g6422261-modded", "color": "024b9a", "num_peers": 43, "num_pending_channels": 0, "num_active_channels": 38, "num_inactive_channels": 1, "address": [{"type": "ipv4", "address": "128.199.202.168", "port": 9735}, {"type": "ipv6", 
"address": "2400:6180:0:d0::5cd2:a001", "port": 9735}, {"type": "torv3", "address": "ki5uack5xb4gicfnpfavzdibojfu3qvwtlg3ca7eyjxik7tgwfxummqd.onion", "port": 9735}, {"type": "torv3", "address": "kw6brkklnmktpp7ysiunxkdv6nuwhzauj3cefhhnbx2fyfe7aqud3wid.onion", "port": 9735}], "binding": [{"type": "ipv6", "address": "::", "port": 9735}, {"type": "ipv4", "address": "0.0.0.0", "port": 9735}], "version": "v0.10.1-42-g6422261-modded", "blockheight": 699469, "network": "bitcoin", "msatoshi_fees_collected": 9060527, "fees_collected_msat": "9060527msat", "lightning-dir": "/home/rusty/.lightning/bitcoin"}}
```

 You can reach us on our Telegram channel @https://t.me/bolt12org