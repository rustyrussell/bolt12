#! /usr/bin/python3
from typing import Tuple, Optional, Dict, Any, Sequence, Callable, List
from io import BytesIO
import bech32
import generated
import hashlib
import re
from fundamentals import fromwire_bigsize, towire_bigsize
from key import verify_schnorr, sign_schnorr

# BOLT #12:
# All signatures are created as per
# [BIP-340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki),
# and tagged as recommended there.  Thus we define H(`tag`,`msg`) as
# SHA256(SHA256(`tag`) || SHA256(`tag`) || `msg`), and SIG(`tag`,`msg`,`key`)
# as the signature of H(`tag`,`msg`) using `key`.

def bolt12_h(tag: bytes, data: bytes = bytes()) -> 'hashlib.HASH':
    tag_sha = hashlib.sha256(tag).digest()
    ret = hashlib.sha256(tag_sha + tag_sha)
    ret.update(data)
    return ret


# Table-driven tlv decoder
def helper_fromwire_tlv(tlv_table: Dict[str, Tuple[str, Any, Any]],
                        buffer: bytes) -> Tuple[Dict[str, Any], Dict[int, bytes]]:
    tlvs = {}
    unknowns = {}
    prev_tlvtype = -1

    while len(buffer) != 0:
        tlv_type, buffer = fromwire_bigsize(buffer)
        if tlv_type <= prev_tlvtype:
            raise ValueError('Invalid: field number {} after {}'.format(tlv_type, prev_tlvtype))
        prev_tlvtype = tlv_type
        tlv_len, buffer = fromwire_bigsize(buffer)
        tlv_bytes = buffer[:tlv_len]
        buffer = buffer[tlv_len:]
        if len(tlv_bytes) < tlv_len:
            raise ValueError('Incomplete: field number {} truncated'.format(tlv_type))

        if tlv_type in tlv_table:
            name, _, fromwire = tlv_table[tlv_type]
            tlvs[name], tlv_bytes = fromwire(tlv_bytes)
            if len(tlv_bytes) != 0:
                raise ValueError('Invalid: field number {} extra bytes'.format(tlv_type))
        elif tlv_type % 2 == 1:
            unknowns[tlv_type] = tlv_bytes
        else:
            raise ValueError('Invalid: Unknown even field number {}'.format(tlv_type))

    return tlvs, unknowns



def tlv_ordered(tlv_table: Dict[str, Tuple[str, Any, Any]],
                tlvs: Dict[str, Any], unknowns: Dict[int, bytes],
                exclude_sigs: bool = False) -> List[Tuple[int, bytes]]:
    """Marshall all entries into bytes, arrange in increasing order"""
    def find_tlv_byname(tlv_table, tlvname):
        for tlv in tlv_table:
            if tlv_table[tlv][0] == tlvname:
                return tlv
        raise ValueError("Unknown value {} set".format(tlvname))

    # add knowns into tlv_bytestr
    tlv_bytestr = unknowns.copy()
    for tlvname, value in tlvs.items():
        tlvnum = find_tlv_byname(tlv_table, tlvname)
        if tlvnum in tlv_bytestr:
            raise ValueError("Value {} ({}) set in unknowns and tlvs".format(tlvnum, tlvname))
        tlv_bytestr[tlvnum] = tlv_table[tlvnum][1](value)

    ret = []
    for k in sorted(tlv_bytestr):
        # BOLT #12:
        # TLV types 240 through 1000 are considered signature elements.
        if exclude_sigs and k >= 240 and k <= 1000:
            continue
        ret += [(k, tlv_bytestr[k])]
    return ret


def tlv_enc(num: int, val: bytes) -> bytes:
    return towire_bigsize(num) + towire_bigsize(len(val)) + val
    
# Table-driven tlv encode
def helper_towire_tlv(tlv_table: Dict[str, Tuple[str, Any, Any]],
                      tlvs: Dict[str, Any],
                      unknowns: Dict[int, bytes]) -> bytes:
    buffer = bytes()
    for k, bytestr in tlv_ordered(tlv_table, tlvs, unknowns):
        buffer += tlv_enc(k, bytestr)

    return buffer


def simple_bech32_decode(bech32str: str) -> Tuple[str, bytes]:
    """Bech32 decode without a checksum"""
    # We only lower the case if ALL CAPS
    if bech32str.isupper():
        bech32str = bech32str.lower()

    sep = bech32str.find('1')
    if sep == -1:
        return None, None

    hrp = bech32str[:sep]
    if not hrp.islower():
        return None, None

    ret5 = bytes()
    for c in bech32str[sep+1:]:
        pos = bech32.CHARSET.find(c)
        if pos == -1:
            return None, None
        ret5 += bytes([pos])
    return hrp, bytes(bech32.convertbits(ret5, 5, 8, False))


def simple_bech32_encode(hrp: str, data: bytes) -> str:
    """Bech32 encode without a checksum"""
    encstr = hrp + '1'
    for c in bech32.convertbits(data, 8, 5, True):
        encstr += bech32.CHARSET[c]
    return encstr


class Bolt12(object):
    def __init__(self, hrp: str, tlv_table: Dict[str, Tuple[str, Any, Any]], bytestr: bytes):
        self.hrp = hrp
        self.tlv_table = tlv_table
        self.values, self.unknowns = helper_fromwire_tlv(tlv_table, bytestr)

    @staticmethod
    def create(hrp: str, bytestr: bytes):
        if hrp == 'lno':
            return Offer(hrp, bytestr)
        elif hrp == 'lnr':
            return InvoiceRequest(hrp, bytestr)
        elif hrp == 'lni':
            return Invoice(hrp, bytestr)

        raise ValueError('Unknown human readable prefix {}'.format(hrp))

    @staticmethod
    def lnall_ctx(tlv_ordered_nosigs: List[Tuple[int, bytes]]) -> 'hashlib.HASH':
        # BOLT #12:
        # 2. The H(`LnAll`|all-tlvs,tlv) where "all-tlvs" consists of all non-signature TLV entries
        #    appended in ascending order.
        all_tlvs = bytes()
        for num, bytestr in tlv_ordered_nosigs:
            all_tlvs += tlv_enc(num, bytestr)

        return bolt12_h(b'LnAll' + all_tlvs)

    @staticmethod
    def merkle_pair(a: bytes, b: bytes) -> bytes:
        # BOLT #12:
        # The Merkle tree inner nodes are H(`LnBranch`, lesser-SHA256|greater-SHA256)
        if a < b:
            return bolt12_h(b'LnBranch', a + b).digest()
        else:
            return bolt12_h(b'LnBranch', b + a).digest()

    @staticmethod
    def merkle_branch(leaves: Sequence[bytes]) -> bytes:
        # BOLT #12:
        # If there are not exactly a power of 2 leaves, then the tree depth will
        # be uneven, with the deepest tree on the lowest-order leaves.
        if len(leaves) == 0:
            # This shouldn't happen, but use a distinctive all-zero value if it does.
            return bytes(32)
        if len(leaves) == 1:
            return leaves[0]

        # Split into order-of-two and remainder.
        branchsize = 1
        while branchsize * 2 < len(leaves):
            branchsize *= 2
        return Bolt12.merkle_pair(Bolt12.merkle_branch(leaves[:branchsize]),
                                  Bolt12.merkle_branch(leaves[branchsize:]))

    def merkle(self) -> bytes:
        ordered = tlv_ordered(self.tlv_table, self.values, self.unknowns, exclude_sigs=True)
        # BOLT #12:
        # The Merkle tree's leaves are, in TLV-ascending order for each tlv:
        # 1. The H(`LnLeaf`,tlv).
        lnleaf = bolt12_h(b'LnLeaf')
        # BOLT #12:
        # 2. The H(`LnAll`|all-tlvs,tlv)
        lnall = self.lnall_ctx(ordered)

        leaves = []
        for num, bytestr in ordered:
            tlv = tlv_enc(num, bytestr)
            leafnode = lnleaf.copy()
            leafnode.update(tlv)
            lnallnode = lnall.copy()
            lnallnode.update(tlv)
            leaves.append(self.merkle_pair(leafnode.digest(), lnallnode.digest()))

        return self.merkle_branch(leaves)

    @staticmethod
    def _check_sig(msgname: str, fieldname: str, merkle_root: bytes, pubkey32: bytes, bip340sig: bytes) -> bool:
        # BOLT #12:
        # Each form is signed using one or more TLV signature elements; TLV
        # types 240 through 1000 are considered signature elements.  For these
        # the tag is `lightning` | `messagename` | `fieldname`, and `msg` is
        # the Merkle-root; `lightning` is the literal 9-byte ASCII string,
        # `messagename` is the name of the TLV stream being signed
        # (i.e. `offer`, `invoice_request` or `invoice`) and the `fieldname`
        # is the TLV field containing the signature (e.g. `signature` or
        # `payer_signature`).

        # BOLT #12:
        # Thus we define ... SIG(`tag`,`msg`,`key`) as the signature of H(`tag`,`msg`) using `key`.
        hash = bolt12_h(bytes('lightning' + msgname + fieldname, encoding='utf8'), merkle_root).digest()
        return verify_schnorr(pubkey32, bip340sig, hash)

    @staticmethod
    def _sign(msgname: str, fieldname: str, merkle_root: bytes, privkey: bytes, bip340sig: bytes) -> bool:
        hash = bolt12_h(bytes('lightning' + msgname + fieldname, encoding='utf8'), merkle_root).digest()
        return sign_schnorr(privkey, hash)

    # BOLT #9:
    # | 8/9   | `var_onion_optin` ... | IN9 |
    # | 14/15 | `payment_secret` ... | IN9 |
    # | 16/17 | `basic_mpp` ... | IN9 |
    known_features = {8: 'var_onion_optin',
                      14: 'payment_secret',
                      16: 'basic_mpp'}
    @staticmethod
    def check_features(featureset: bytes) -> Optional[str]:
        """Returns None if OK, otherwise the complaint"""
        # BOLT #12
        # - if `features` contains unknown _even_ bits that are non-zero:
        #     - MUST NOT respond to the offer.
        #     - SHOULD indicate the unknown bit to the user.
        for i in range(0, len(featureset) * 8, 2):
            # Big-endian bitfields are the *worst*
            byte = int(featureset[len(featureset) - 1 - i // 8])
            if byte & (1 << (i%8)) and i not in known_features:
                return "Unsupported required feature {}".format(i)
        return None


class Offer(Bolt12):
    """Class for an offer"""
    def __init__(self, hrp: str, bytestr: bytes):
        super().__init__(hrp, generated.tlv_offer, bytestr)
        self.offer_id = self.merkle()

    def check(self) -> Tuple[bool, str]:
        """Check it's OK: returns (True, '') or (False, reason)"""
        # BOLT #12:
        #   - if `features` contains unknown _odd_ bits that are non-zero:
        #     - MUST ignore the bit.
        #   - if `features` contains unknown _even_ bits that are non-zero:
        #     - MUST NOT respond to the offer.
        #     - SHOULD indicate the unknown bit to the user.
        whybad = self.check_features(self.values.get('features', bytes()))
        if whybad:
            return False, whybad
        # BOLT #12:
        #   - if `node_id` or `description` is not set:
        #     - MUST NOT respond to the offer.
        if 'node_id' not in self.values:
            return False, "Missing node_id"
        if 'description' not in self.values:
            return False, "Missing description"
        # BOLT #12:
        #  - if `signature` is present, but is not a valid signature
        #    using `node_id` as described in [Signature
        #    Calculation](#signature-calculation): - MUST NOT respond
        #    to the offer.
        if 'signature' in self.values:
            if not self._check_sig("offer", "signature",
                                   self.offer_id,
                                   self.values['node_id'],
                                   self.values['signature']):
                return False, "Bad signature"

        # BOLT #12:
        #  - SHOULD not respond to an offer if the current time is after
        #    `absolute_expiry`.
        if 'absolute_expiry' in self.values and time.time() > self.values['absolute_expiry']:
            return False, "Expired {} seconds ago".format(int(time.time())
                                                          - self.values['absolute_expiry'])

        # BOLT #12:
        #  - FIXME: more!
        return True, ''


class InvoiceRequest(Bolt12):
    """Class for an invoice_request"""
    def __init__(self, hrp: str, bytestr: bytes):
        super().__init__(hrp, generated.tlv_invoice_request, bytestr)


class Invoice(Bolt12):
    """Class for an invoice"""
    def __init__(self, hrp: str, bytestr: bytes):
        super().__init__(hrp, generated.tlv_invoice, bytestr)


class Decoder(object):
    """Generates a bolt12, or a failure string"""
    def __init__(self):
        self.so_far = ''

    def complete(self) -> bool:
        """Is this string done?"""
        return len(self.so_far) > 0 and not re.search(r'\+\s*$', self.so_far)

    def add(self, bech32str: str):
        """Add this to the string, return complete()"""
        self.so_far += bech32str
        return self.complete()

    def result(self) -> Tuple[Optional[Bolt12], str]:
        """One string is complete(), try decoding"""
        assert self.complete()
        if self.so_far.startswith('+'):
            return None, 'Missing a part?'
        hrp, bytestr = simple_bech32_decode(re.sub(r'([A-Z0-9a-z])\+\s*([A-Z0-9a-z])', r'\1\2',
                                                   self.so_far))
        if bytestr is None:
            return None, 'Invalid bech32 string'

        try:
            ret = Bolt12.create(hrp, bytestr)
        except ValueError as e:
            return None, ' '.join(e.args)

        return ret, ''
