#! /usr/bin/python3
import bolt12
import json

# Grab offers testvector
with open("../test-vectors/offers.json", "r") as f:
    testoffers = json.loads(f.read())

# Convert hex fields to bytes:
for offer in testoffers:
    for k, v in offer['contents'].items():
        try:
            offer['contents'][k] = bytes.fromhex(v)
        except:
            pass

with open("../lightning-rfc/bolt12/format-string-test.json", "r") as f:
    test_formatstrings = json.loads(f.read())

    
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
    for offer in testoffers:
        d = bolt12.Decoder()
        assert d.add(offer['string'])
        b12, _ = d.result()
        assert b12.hrp == offer["type"]

        assert b12.values == offer["contents"]


def test_merkle():
    for offer in testoffers:
        d = bolt12.Decoder()
        assert d.add(offer['string'])
        b12, _ = d.result()
        assert b12.hrp == offer["type"]
        assert b12.merkle().hex() == offer["offer_id"]


def test_signature():
    dec = bolt12.Decoder()
    dec.add('lno1pg257enxv4ezqcneype82um50ynhxgrwdajx283qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqs85ck65ycmkdk92smwt9zuewdzfe7v4aavvaz5kgv9mkk63v3s0ge0f099kssh3yc95qztx504hu92hnx8ctzhtt08pgk0texz0509tk')
    offer, _ = dec.result()

    assert offer._check_sig('offer', 'signature',
                            offer.merkle(), offer.values['node_id'],
                            offer.values['signature'])


def test_check():
    for offer in testoffers:
        d = bolt12.Decoder()
        assert d.add(offer['string'])
        b12, _ = d.result()
        assert b12.check()
