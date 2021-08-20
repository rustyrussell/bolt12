# BOLT12
A library for decoding and verifying BOLT 12 offers, invoice_requests and invoices.

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
"bc98f5e97f766fa8db565f18bf28a5ce394146a7bafd1d4a7c87f47d8bfca4c4",
{
    "features": ['80','00','02','42','00'],
    "recurrence_counter": 0,
    "recurrence_start": 23,
    "payer_key": "bc98f5e97f766fa8db565f18bf28a5ce394146a7bafd1d4a7c87f47d8bfca4c4",
    "payer_info": ['f8','15','5f','66','88','b3','87','8e','bd','2d','8c','73','a9','1e','58','57']
}
)
```
secret_payer_key used is not a real private key! ;)
# Output --> 
```

{
  string: 'lnr1qsswvmtmawf77xcssjnnuh0xja0tcawzp5dpw77jlvpzkygzy6a0w9svqkqqqqjzqqjqqf3qhjv0t6tlweh63k6ktuvt7299ecu5z348ht736jnusl68mzlu5nzryy8cz40kdz9ns78t6tvvww53ukzhgsq30uzqxvs90g9x4jacfcw6lph937ym769923a4t8tpsag59uhxlfcu3nt849n2c3g85qfrr3zcrelx94dc4fg9mjdu3f5ymfk8snde8dxtzyc',
  type: 'lnr',
  offer_id: '43af29f0f5ba76e111a8993b46b93827a38795e6daa223d9b499738c60bbf9e4',
  valid: 'true',
  contents: {
    offer_id: 'e66d7beb93ef1b1084a73e5de6975ebc75c20d1a177bd2fb022b110226baf716',
    features: [ 128n, 0n, 2n ],
    recurrence_counter: 0,
    payer_key: 'bc98f5e97f766fa8db565f18bf28a5ce394146a7bafd1d4a7c87f47d8bfca4c4',
    payer_info: [
      248n,  21n,  95n,
      102n, 136n, 179n,
      135n, 142n
    ],
    recurrence_start: 23,
    payer_signature: '332057a0a6acbb84e1daf86e58f89bf68a5547b559d61875142f2e6fa71c8cd67a966ac4507a01231c4581e7e62d5b8aa505dc9bc8a684da6c784db93b4cb113'
  }
}
```
 You can reach us on our Telegram channel @https://t.me/bolt12org