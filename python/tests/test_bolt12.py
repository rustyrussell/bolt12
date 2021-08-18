import bolt12
import json
import time


def test_version():
    assert bolt12.__version__ == '0.1.2'

# Grab offers testvector
with open("../test-vectors/offers.json", "r") as f:
    testoffers = json.loads(f.read())

# Convert hex fields to bytes:
for offer in testoffers:
    for k, v in offer['contents'].items():
        try:
            offer['contents'][k] = bytes.fromhex(v)
        except:  # noqa
            pass

with open("../lightning-rfc/bolt12/format-string-test.json", "r") as f:
    test_formatstrings = json.loads(f.read())


with open("../lightning-rfc/bolt12/offer-period-test.json", "r") as f:
    test_periods = json.loads(f.read())


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

        enc = b12.encode()
        assert enc == offer['string']


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


def test_recurrence():
    for period in test_periods:
        rvals = {'time_unit': period['time_unit'],
                 'period': period['period']}
        base = {'basetime': period["basetime"],
                'start_any_period': 0}
        rec = bolt12.Recurrence(rvals, recurrence_base=base)
        assert rec.get_period(period["n"]).start == period["expect"]["seconds_since_epoch"]

    for offer in testoffers:
        d = bolt12.Decoder()
        assert d.add(offer['string'])
        b12, _ = d.result()
        rec = b12.get_recurrence()
        if 'recurrence' not in offer['contents']:
            assert rec is None
        else:
            timenow = int(time.time())
            jan2021 = 1609459200
            jan2022 = 1640995200
            # 50 days after 2021-01-1 = 2021-02-20
            feb2021_20 = 1613779200
            # FIXME: Put this in vectors
            desc = offer['contents']['description']
            if desc == "100msat every minute":
                assert not rec.has_fixed_base()
                assert (rec.get_period(0, basetime=timenow)
                        == (timenow, timenow + 60,
                            timenow - 60, timenow + 60))
                assert (rec.get_period(3, basetime=timenow)
                        == (timenow + 180, timenow + 180 + 60,
                            timenow + 180 - 60, timenow + 180 + 60))
            elif desc == "100msat every minute, up to three times":
                assert not rec.has_fixed_base()
                assert (rec.get_period(0, basetime=timenow)
                        == (timenow, timenow + 60, timenow - 60, timenow + 60))
                assert rec.get_period(3, basetime=timenow) is None
            elif desc == "100msat every day, from 1-Jan-2021":
                assert rec.has_fixed_base()
                assert (rec.get_period(0)
                        == (jan2021, jan2021 + 3600 * 24,
                            jan2021 - 3600 * 24, jan2021 + 3600 * 24))
                assert (rec.get_period(365)
                        == (jan2022, jan2022 + 3600 * 24,
                            jan2022 - 3600 * 24, jan2022 + 3600 * 24))
            elif desc == "1000msat every 10 days, from 1-Jan-2021, pay 1hr before to 60 seconds late":
                assert rec.has_fixed_base()
                assert (rec.get_period(0)
                        == (jan2021, jan2021 + 3600 * 24 * 10,
                            jan2021 - 3600, jan2021 + 60))
                assert (rec.get_period(5)
                        == (feb2021_20, feb2021_20 + 3600 * 24 * 10,
                            feb2021_20 - 3600, feb2021_20 + 60))
            elif desc == "1000msat every 10 days, from 1-Jan-2021, pro-rata":
                assert rec.has_fixed_base()
                assert (rec.get_period(0)
                        == (jan2021, jan2021 + 3600 * 24 * 10,
                            jan2021 - 10 * 3600 * 24, jan2021 + 3600 * 24 * 10))
                assert (rec.get_period(5)
                        == (feb2021_20, feb2021_20 + 3600 * 24 * 10,
                            feb2021_20 - 10 * 3600 * 24, feb2021_20 + 3600 * 24 * 10))
                # Proportional amounts apply within the period window
                assert rec.get_pay_factor(rec.get_period(5),
                                          feb2021_20 - 1) == 1
                assert rec.get_pay_factor(rec.get_period(5),
                                          feb2021_20) == 1
                assert rec.get_pay_factor(rec.get_period(5),
                                          feb2021_20 + 5 * 3600 * 24) == 0.5
                assert rec.get_pay_factor(rec.get_period(5),
                                          feb2021_20 + 10 * 3600 * 24) == 0
                assert rec.get_pay_factor(rec.get_period(5),
                                          feb2021_20 + 10 * 3600 * 24 + 1) == 0
            elif desc == "10USD every day":
                assert not rec.has_fixed_base()
                assert (rec.get_period(0, basetime=timenow)
                        == (timenow, timenow + 24 * 60 * 60,
                            timenow - 24 * 60 * 60, timenow + 24 * 60 * 60))
                assert (rec.get_period(3, basetime=timenow)
                        == (timenow + 24 * 60 * 180,
                            timenow + 24 * 60 * 180 + 24 * 60 * 60,
                            timenow + 24 * 60 * 180 - 24 * 60 * 60,
                            timenow + 24 * 60 * 180 + 24 * 60 * 60))
            else:
                # If a new test case added, handle it here.
                assert False


def test_recurrence_period_start_offset():
    for time_unit in (0, 1, 2, 3):
        # Every 10 time_unit from 1-Jan-2021
        jan2021 = 1609459200
        rec = bolt12.Recurrence({'time_unit': time_unit, 'period': 10},
                                recurrence_base={'start_any_period': True,
                                                 'basetime': jan2021})

        # We replace _get_period to count iterations inside period_start_offset.
        rec.real_get_period = rec._get_period

        def counting_get_period(n: int, basetime: int):
            rec.iterations += 1
            return rec.real_get_period(n, basetime)

        rec._get_period = counting_get_period

        # Try ranges back and forward about a century.
        for when in range(jan2021 - 500000000,
                          jan2021 + 500000000,
                          500000):
            rec.iterations = 0
            which_period = rec.period_start_offset(when)
            assert rec.iterations > 0
            assert rec.iterations <= 2
            start, end, _, _ = rec._get_period(which_period, 1609459200)
            assert when >= start and when < end
