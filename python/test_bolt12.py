#! /usr/bin/python3
import bolt12

testoffers = {'lno1pg257enxv4ezqcneype82um50ynhxgrwdajx283qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqs85ck65ycmkdk92smwt9zuewdzfe7v4aavvaz5kgv9mkk63v3s0ge0f099kssh3yc95qztx504hu92hnx8ctzhtt08pgk0texz0509tk':
               {"description": "Offer by rusty's node",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "28522b52ac39fa518ce3a5b3e4a9a96372487e78ba5eb1540ec4d9f02ca82718",
                "signature": "f4c5b54263766d8aa86dcb28b9973449cf995ef58ce8a96430bbb5b516460f465e9794b6842f1260b400966a3eb7e1557998f858aeb5bce1459ebc984fa3cabb",
                "_type": "lno"},
               'lno1pqqnyzsmx5cx6umpwssx6atvw35j6ut4v9h8g6t50ysx7enxv4epgrmjw4ehgcm0wfczucm0d5hxzagkqyq3ugztng063cqx783exlm97ekyprnd4rsu5u5w5sez9fecrhcuc3ykqhcypjju7unu05vav8yvhn27lztf46k9gqlga8uvu4uq62kpuywnu6me8srgh2q7puczukr8arectaapfl5d4rd6uc7st7tnqf0ttx39n40s':
               {"amount": 50,
                "description": "50msat multi-quantity offer",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "1cacc1f7d2b3a6b5f698069e3793f96bdcc32cfb249dde3b1d55c7f2f85c2985",
                "quantity_min": 1,
                "signature": "ca5cf727c7d19d61c8cbcd5ef8969aeac5403e8e9f8ce5780d2ac1e11d3e6b793c068ba81e0f302e5867e8f385f7a14fe8da8dbae63d05f973025eb59a259d5f",
                "_type": "lno",
                "vendor": "rustcorp.com.au"},
               'lno1pqqkgzs5xycrqmtnv96zqetkv4e8jgrdd9h82ar9zsg8yatnw3ujumm6d3skyuewdaexwxszqq7pugztng063cqx783exlm97ekyprnd4rsu5u5w5sez9fecrhcuc3ykqhcyp5jq3tl57jh3g32qwfy9hpa88eqwst78gn06v9xcd485hezgs8xe2800mrth3tznd5884dnnpg3sd0tvv7k9er8ex5pg0prrnl66xd7s':
               {"amount": 100,
                "description": "100msat every minute",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "34145f989a97260e6e1e1fb835ea4e58f582d514cc3e4e91dcdde114d2130578",
                "recurrence": {"period": 60,
                              "time_unit": 0},
                "signature": "d2408aff4f4af14454072485b87a73e40e82fc744dfa614d86d4f4be44881cd951defd8d778ac536d0e7ab6730a2306bd6c67ac5c8cf935028784639ff5a337d",
                "_type": "lno",
                "vendor": "rusty.ozlabs.org"},
               'lno1pqqkgz38xycrqmtnv96zqetkv4e8jgrdd9h82ar99ss82upqw3hjqargwfjk2gr5d9kk2uc5zpe82um50yhx77nvv938xtn0wfn35qsq8s0zqju6r75wqph3uwfh7e0kd3qgumdgu8989r4yxg32wwqa78xyf9s9ggqs9uzqd7zy5v0cehj4ev52g7ljaec4qqdmjk2lkv58z32mn5z5q8rsyp6fpqnyu2q6gcz6nvmdtmtgyzs3xxhchr09qsupd4tngtq6frkpumc':
               {"amount": 100,
                "description": "100msat every minute, up to three times",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "c1a4b907e4a95fe72c3d561f2ad33e96cbb509ca50f9fee1338f15949f3250bf",
                "recurrence": {"period": 60,
                              "time_unit": 0},
                "recurrence_limit": 2,
                "signature": "6f844a31f8cde55cb28a47bf2ee715001bb9595fb32871455b9d05401c702074908264e281a4605a9b36d5ed6820a1131af8b8de5043816d57342c1a48ec1e6f",
                "_type": "lno",
                "vendor": "rusty.ozlabs.org"},
               'lno1pqqkgz3zxycrqmtnv96zqetkv4e8jgryv9ujcgrxwfhk6gp3949xzm3dxgcryvg5zpe82um50yhx77nvv938xtn0wfn35qspqywq2q2laenqq83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsytf0g06zjgcrtk0n09n5wk78ssdhckpmfqmfvlxm92u36egsmf3kswfpqt70dq6mg4lw3t8qx7feh6c8hxz2vwzsdg4n957z8gh8unx':
               {"amount": 100,
                "description": "100msat every day, from 1-Jan-2021",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "bf3c613604bb741ab649f0712fa26ec8c74f06aea159714989de2095e0737f85",
                "recurrence": {"period": 1,
                              "time_unit": 1},
                "recurrence_base": {"basetime": 1609459200,
                    "start_any_period": True,
                },
                "signature": "8b4bd0fd0a48c0d767cde59d1d6f1e106df160ed20da59f36caae4759443698da0e4840bf3da0d6d15fba2b380de4e6fac1ee61298e141a8accb4f08e8b9f933",
                "_type": "lno",
                "vendor": "rusty.ozlabs.org"},
               'lno1pqpq86q2fgcnqvpsd4ekzapqv4mx2uneyqcnqgryv9uhxtpqveex7mfqxyk55ctw95erqv339ss8qcteyqcksu3qvfjkvmmjv5s8gmeqxcczqum9vdhkuernypkxzar9zsg8yatnw3ujumm6d3skyuewdaexwxszqy9pcpgptlhxvqq7yp9e58aguqr0rcun0ajlvmzq3ek63cw2w282gv3z5uupmuwvgjtq2sqxqqqquyqq8ncyph3h0xskvfd69nppz2py2nxym7rlq255z4mevv5x7vqh077n792e3gcua5p734l7d2r0x7kat69gx6c3twqexgmplmmjz2tv9hne4j5s':
               {"amount": 1000,
                "description": "1000msat every 10 days, from 1-Jan-2021, pay 1hr before to 60 seconds late",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "37fec3bf68b1938c4f27f586edec66e9eff4e0c8fe1c752512b9e89a804fbc9a",
                "recurrence_base": {"basetime": 1609459200,
                                    "start_any_period": True},
                "recurrence_paywindow": {"proportional_amount": False,
                                         "seconds_after": 60,
                                         "seconds_before": 3600},
                "recurrence": {"period": 10,
                               "time_unit": 1},
                "signature": "de3779a16625ba2cc211282454cc4df87f02a941577963286f30177fbd3f15598a31ced03e8d7fe6a86f37add5e8a836b115b81932361fef721296c2de79aca9",
                "_type": "lno",
                "vendor": "rusty.ozlabs.org"},
               'lno1pqpq86q2xycnqvpsd4ekzapqv4mx2uneyqcnqgryv9uhxtpqveex7mfqxyk55ctw95erqv339ss8qun094exzarpzsg8yatnw3ujumm6d3skyuewdaexwxszqy9pcpgptlhxvqq7yp9e58aguqr0rcun0ajlvmzq3ek63cw2w282gv3z5uupmuwvgjtq2sqgqqxj7qqpp5hspuzq0pgmhkcg6tqeclvexaawhylurq90ezqrdcm7gapzvcyfzexkt8nmu628dxr375yjvax3x20cxyty8fg8wrr2dlq3nx45phn2kqru2cg':
               {"amount": 1000,
                "description": "1000msat every 10 days, from 1-Jan-2021, pro-rata",
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "e66d7beb93ef1b1084a73e5de6975ebc75c20d1a177bd2fb022b110226baf716",
                "recurrence": {"period": 10, "time_unit": 1},
                "recurrence_base": {"start_any_period": True,
                                    "basetime": 1609459200},
                "recurrence_paywindow":  {"proportional_amount": True,
                                          "seconds_after": 864000,
                                          "seconds_before": 864000},
                "signature": "7851bbdb08d2c19c7d99377aeb93fc180afc88036e37e4742266089164d659e7be694769871f5092674d1329f8311643a50770c6a6fc1199ab40de6ab007c561",
                "_type": "lno",
                "vendor": "rusty.ozlabs.org"},
               'lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy':
               {"amount": 1000,
                "currency": "USD",
                "description": "10USD every day",
                "_minor_unit": 2,
                "node_id": "4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605",
                "_offer_id": "7cef68df49fd9222bed0138ca5603da06464b2f523ea773bc4edcb6bd07966e7",
                "recurrence": {"period": 1,
                              "time_unit": 1},
                "signature": "25993950df08d3417fdc4837509e78578b4a3cbe00095705113c43273d9506b62739d9a1ebcf5ee97453ef415ec683668bb03cb31b58ffb0585dcbfa36514102",
                "_type": "lno",
                "vendor": "rusty.ozlabs.org"}}


# FIXME: use bolt12/format-string-test.json directly
test_formatstrings = [
    {
	"comment": "A complete string is valid",
	"valid": True,
	"string": "lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy"
    },
    {
	"comment": "+ can join anywhere",
	"valid": True,
	"string": "l+no1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy"
    },
    {
	"comment": "Multiple + can join",
	"valid": True,
	"string": "lno1qcp4256ypqpq+86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn0+0fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0+sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qs+y"
    },
    {
	"comment": "+ can be followed by whitespace",
	"valid": True,
	"string": "lno1qcp4256ypqpq+ 86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn0+  0fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0+\nsqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43l+\r\nastpwuh73k29qs+\r  y"
    },
    {
	"comment": "+ must be surrounded by bech32 characters",
	"valid": False,
	"string": "lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy+"
    },
    {
	"comment": "+ must be surrounded by bech32 characters",
	"valid": False,
	"string": "lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy+ "
    },
    {
	"comment": "+ must be surrounded by bech32 characters",
	"valid": False,
	"string": "+lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy"
    },
    {
	"comment": "+ must be surrounded by bech32 characters",
	"valid": False,
	"string": "+ lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy"
    },
    {
	"comment": "+ must be surrounded by bech32 characters",
	"valid": False,
	"string": "ln++o1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy"
    },
]


def test_decode_formats():
    for testcase in test_formatstrings:
        print("{}:".format(testcase['comment']))
        d = bolt12.Decoder()
        if testcase['valid']:
            assert d.add(testcase['string'])
        else:
            if not d.add(testcase['string']):
                print(" ... unfinished")
                continue
        b12, whybad = d.result()
        if testcase['valid']:
            assert b12 is not None
            print(" ... ok!")
        else:
            assert b12 is None
            print(" ... as expected: {}".format(whybad))

    # Now try feeding in parts
    for testcase in test_formatstrings:
        parts = testcase['string'].split('+')
        if len(parts) == 1:
            continue
        print("{} (in parts):".format(testcase['comment']))
        d = bolt12.Decoder()
        for p in parts[:-1]:
            assert not d.add(p + '+')
        if not testcase['valid']:
            if not d.add(parts[-1]):
                print(" ... parts invalid")
                continue
        else:
            assert d.add(parts[-1])

        b12, whybad = d.result()
        if testcase['valid']:
            assert b12 is not None
            print(" ... ok!")
        else:
            assert b12 is None
            print(" ... as expected: {}".format(whybad))


def test_decode():
    def cleanup(fields):
        """Clean up results to match our pretty ones"""
        def cleanup_val(key, val):
            # Collapse singletons
            if isinstance(val, dict) and len(val) == 1:
                return cleanup_val(key, list(val.values())[0])
            elif isinstance(val, list) and key in ('description', 'vendor', 'currency'):
                return key, bytes(val).decode()
            elif isinstance(val, bytes):
                return key, val.hex()
            return key, val

        ret = {}
        for k, v in fields.items():
            newk, newv = cleanup_val(k, v)
            ret[newk] = newv
        return ret

    for string, values in testoffers.items():
        d = bolt12.Decoder()
        assert d.add(string)
        b12, _ = d.result()
        assert b12.hrp == values["_type"]

        # Remove our internal _ fields for testing
        decoded_expect = values.copy()
        for f in values:
            if f.startswith("_"):
                del decoded_expect[f]
        assert cleanup(b12.values) == decoded_expect


def test_merkle():
    for string, values in testoffers.items():
        d = bolt12.Decoder()
        assert d.add(string)
        b12, _ = d.result()
        assert b12.hrp == values["_type"]

        assert b12.merkle().hex() == values["_offer_id"]


def test_signature():
    dec = bolt12.Decoder()
    dec.add('lno1pg257enxv4ezqcneype82um50ynhxgrwdajx283qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqs85ck65ycmkdk92smwt9zuewdzfe7v4aavvaz5kgv9mkk63v3s0ge0f099kssh3yc95qztx504hu92hnx8ctzhtt08pgk0texz0509tk')
    offer, _ = dec.result()

    assert offer._check_sig('offer', 'signature',
                            offer.merkle(), offer.values['node_id']['node_id'], offer.values['signature']['sig'])


def test_check():
    for string, values in testoffers.items():
        d = bolt12.Decoder()
        assert d.add(string)
        b12, _ = d.result()
        assert b12.check()
