#! /usr/bin/env python3
from typing import Tuple


# Fundamental type routines
def helper_towire_int(value: int, size) -> bytes:
    return value.to_bytes(size, 'big')


def helper_towire_truncated_int(value: int, size: int) -> bytes:
    bval = value.to_bytes(size, 'big')
    while bval.startswith(b'\0'):
        bval = bval[1:]
    return bval


def helper_towire_bytes(value: bytes, size: int) -> bytes:
    if len(value) != size:
        raise ValueError("value 0x{} should be length {}"
                         .format(value.hex(), size))
    return value


def helper_fromwire_int(buffer: bytes, size: int) -> Tuple[int, bytes]:
    if len(buffer) < size:
        raise ValueError("truncated")
    return int.from_bytes(buffer[:size], 'big'), buffer[size:]


def helper_fromwire_truncated_int(buffer: bytes, size: int) -> Tuple[int, bytes]:
    if len(buffer) > size:
        raise ValueError("extra data at end")
    if buffer.startswith(b'\0'):
        raise ValueError("non-minimal tu64")
    return int.from_bytes(buffer, 'big'), bytes()


def helper_fromwire_bytes(buffer: bytes, size: int) -> Tuple[bytes, bytes]:
    if len(buffer) < size:
        raise ValueError("truncated")
    return buffer[:size], buffer[size:]


# Now the actual fundamental types:
def towire_u64(value: int) -> bytes:
    return helper_towire_int(value, 8)


def towire_u32(value: int) -> bytes:
    return helper_towire_int(value, 4)


def towire_u16(value: int) -> bytes:
    return helper_towire_int(value, 2)


def towire_byte(value: int) -> bytes:
    return helper_towire_int(value, 1)


def towire_tu64(value: int) -> bytes:
    return helper_towire_truncated_int(value, 8)


def towire_tu32(value: int) -> bytes:
    return helper_towire_truncated_int(value, 4)


def towire_tu16(value: int) -> bytes:
    return helper_towire_truncated_int(value, 2)


def fromwire_u64(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_int(buffer, 8)


def fromwire_u32(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_int(buffer, 4)


def fromwire_u16(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_int(buffer, 2)


def fromwire_byte(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_int(buffer, 1)


def fromwire_tu64(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_truncated_int(buffer, 8)


def fromwire_tu32(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_truncated_int(buffer, 4)


def fromwire_tu16(buffer: bytes) -> Tuple[int, bytes]:
    return helper_fromwire_truncated_int(buffer, 2)


def towire_chain_hash(value: bytes) -> bytes:
    return helper_towire_bytes(value, 32)


def fromwire_chain_hash(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 32)


def towire_channel_id(value: bytes) -> bytes:
    return helper_towire_bytes(value, 32)


def fromwire_channel_id(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 32)


def towire_sha256(value: bytes) -> bytes:
    return helper_towire_bytes(value, 32)


def fromwire_sha256(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 32)


def towire_point32(value: bytes) -> bytes:
    return helper_towire_bytes(value, 32)


def fromwire_point32(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 32)


def towire_point(value: bytes) -> bytes:
    return helper_towire_bytes(value, 33)


def fromwire_point(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 33)


def towire_signature(value: bytes) -> bytes:
    return helper_towire_bytes(value, 64)


def fromwire_signature(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 64)


def towire_bip340sig(value: bytes) -> bytes:
    return helper_towire_bytes(value, 64)


def fromwire_bip340sig(buffer: bytes) -> Tuple[bytes, bytes]:
    return helper_fromwire_bytes(buffer, 64)


def towire_array_utf8(value: str) -> bytes:
    return bytes(value, encoding='utf8')


def fromwire_array_utf8(buffer: bytes, size: int) -> Tuple[str, bytes]:
    bval, buffer = helper_fromwire_bytes(buffer, size)
    try:
        return bval.decode(), buffer
    except UnicodeDecodeError as e:
        raise ValueError("Bad UTF-8 at {}-{} of 0x{}"
                         .format(e.start, e.end, bval.hex()))


def towire_short_channel_id(value: str) -> bytes:
    parts = value.split('x')
    return (int(parts[0]).to_bytes(3, 'big')
            + int(parts[1]).to_bytes(3, 'big')
            + int(parts[2]).to_bytes(2, 'big'))


def fromwire_short_channel_id(buffer: bytes) -> Tuple[str, bytes]:
    intval, buffer = fromwire_u64(buffer)
    return '{}x{}x{}'.format(intval >> 48,
                             (intval >> 24) & 0xFFFFFF,
                             intval & 0xFFFF), buffer


def towire_bigsize(value: int) -> bytes:
    if value < 0xFD:
        return towire_byte(value)
    elif value <= 0xFFFF:
        return towire_byte(0xFD) + towire_u16(value)
    elif value <= 0xFFFFFFFF:
        return towire_byte(0xFE) + towire_u32(value)
    else:
        return towire_byte(0xFF) + towire_u64(value)


def fromwire_bigsize(buffer: bytes) -> Tuple[int, bytes]:
    val, buffer = fromwire_byte(buffer)
    if val == 0xFD:
        minval = 0xFD
        val, buffer = fromwire_u16(buffer)
    elif val == 0xFE:
        minval = 0x10000
        val, buffer = fromwire_u32(buffer)
    elif val == 0xFF:
        minval = 0x100000000
        val, buffer = fromwire_u64(buffer)
    else:
        minval = 0

    if val < minval:
        raise ValueError("non minimal-encoded bigsize")
    return val, buffer
