/**
 * BOLT12 Offer validation.
 *
 * An offer is a TLV stream encoded with the "lno" prefix.
 * This module validates the semantic rules for offers as specified
 * in BOLT 12.
 *
 * Offer TLV types (from the spec):
 *   2  - offer_chains          (array of 32-byte chain_hashes)
 *   4  - offer_metadata        (arbitrary bytes)
 *   6  - offer_currency        (UTF-8 ISO 4217 code)
 *   8  - offer_amount          (tu64 msat or currency units)
 *   10 - offer_description     (UTF-8 string)
 *   12 - offer_features        (feature bits)
 *   14 - offer_absolute_expiry (tu64 seconds since epoch)
 *   16 - offer_paths           (blinded_path array)
 *   18 - offer_issuer          (UTF-8 string)
 *   20 - offer_quantity_max    (tu64)
 *   22 - offer_issuer_id       (point, 33 bytes)
 */

import { secp256k1 } from '@noble/curves/secp256k1';
import type { TlvRecord } from './tlv.js';
import { readTruncatedUint } from './utils.js';

// Offer TLV type numbers
export const OFFER_CHAINS = 2n;
export const OFFER_METADATA = 4n;
export const OFFER_CURRENCY = 6n;
export const OFFER_AMOUNT = 8n;
export const OFFER_DESCRIPTION = 10n;
export const OFFER_FEATURES = 12n;
export const OFFER_ABSOLUTE_EXPIRY = 14n;
export const OFFER_PATHS = 16n;
export const OFFER_ISSUER = 18n;
export const OFFER_QUANTITY_MAX = 20n;
export const OFFER_ISSUER_ID = 22n;

const KNOWN_OFFER_TYPES = new Set([
  OFFER_CHAINS,
  OFFER_METADATA,
  OFFER_CURRENCY,
  OFFER_AMOUNT,
  OFFER_DESCRIPTION,
  OFFER_FEATURES,
  OFFER_ABSOLUTE_EXPIRY,
  OFFER_PATHS,
  OFFER_ISSUER,
  OFFER_QUANTITY_MAX,
  OFFER_ISSUER_ID,
]);

/**
 * Check if a type is in the valid offer range.
 * Offers may contain types 1-79 and 1000000000-1999999999.
 */
function isValidOfferType(type: bigint): boolean {
  if (type >= 1n && type <= 79n) {
    return true;
  }
  if (type >= 1000000000n && type <= 1999999999n) {
    return true;
  }
  return false;
}

/**
 * Validate UTF-8 encoding of a byte array.
 * Returns the decoded string or throws if invalid.
 */
function validateUtf8(data: Uint8Array, fieldName: string): string {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  try {
    return decoder.decode(data);
  } catch {
    throw new Error(`Invalid UTF-8 in ${fieldName}`);
  }
}

/**
 * Validate a compressed public key (33 bytes, valid point on secp256k1).
 */
function validatePoint(data: Uint8Array, fieldName: string): void {
  if (data.length !== 33) {
    throw new Error(`Invalid ${fieldName}: expected 33 bytes, got ${data.length}`);
  }
  if (data[0] !== 0x02 && data[0] !== 0x03) {
    throw new Error(`Invalid ${fieldName}: must start with 02 or 03`);
  }
  // Validate the point is actually on the secp256k1 curve
  try {
    secp256k1.ProjectivePoint.fromHex(data);
  } catch {
    throw new Error(`Invalid ${fieldName}: not a valid point on secp256k1`);
  }
}

/**
 * Validate offer_chains field: must be a multiple of 32 bytes, and non-empty.
 */
function validateChains(data: Uint8Array): void {
  if (data.length === 0 || data.length % 32 !== 0) {
    throw new Error('Invalid offer_chains: length must be a non-zero multiple of 32');
  }
}

/**
 * Validate blinded paths (offer_paths field, type 16).
 *
 * Format:
 *   For each path:
 *     first_node_id: either 33-byte point OR 9-byte sciddir (if first byte 0x00 or 0x01)
 *     path_key: 33-byte point (compressed pubkey)
 *     num_hops: u8 (must be > 0)
 *     For each hop:
 *       blinded_node_id: 33-byte point
 *       enclen: u16
 *       encrypted_recipient_data: enclen bytes
 */
function validateBlindedPaths(data: Uint8Array): void {
  let offset = 0;

  // We need to parse all paths in the single offer_paths TLV value
  let pathCount = 0;
  while (offset < data.length) {
    pathCount++;

    // first_node_id: check if it's a sciddir (starts with 0x00 or 0x01) or regular point
    if (offset >= data.length) {
      throw new Error('Truncated offer_paths: missing first_node_id');
    }

    const firstByte = data[offset];
    let firstNodeIdLen: number;
    if (firstByte === 0x00 || firstByte === 0x01) {
      // sciddir: 1 byte direction + 8 byte short_channel_id = 9 bytes
      firstNodeIdLen = 9;
    } else if (firstByte === 0x02 || firstByte === 0x03) {
      // Regular compressed point: 33 bytes
      firstNodeIdLen = 33;
    } else {
      throw new Error('Invalid first_node_id in blinded path: bad prefix byte');
    }

    if (offset + firstNodeIdLen > data.length) {
      throw new Error('Truncated offer_paths: first_node_id truncated');
    }
    offset += firstNodeIdLen;

    // path_key: 33-byte compressed point
    if (offset + 33 > data.length) {
      throw new Error('Truncated offer_paths: missing path_key');
    }
    const pathKeyPrefix = data[offset];
    if (pathKeyPrefix !== 0x02 && pathKeyPrefix !== 0x03) {
      throw new Error('Invalid path_key in blinded path: must start with 02 or 03');
    }
    offset += 33;

    // num_hops: u8
    if (offset >= data.length) {
      throw new Error('Truncated offer_paths: missing num_hops');
    }
    const numHops = data[offset];
    offset += 1;

    if (numHops === 0) {
      throw new Error('Invalid blinded path: num_hops must be > 0');
    }

    // Parse each hop
    for (let h = 0; h < numHops; h++) {
      // blinded_node_id: 33-byte point
      if (offset + 33 > data.length) {
        throw new Error('Truncated onionmsg_hop: missing blinded_node_id');
      }
      const blindedPrefix = data[offset];
      if (blindedPrefix !== 0x02 && blindedPrefix !== 0x03) {
        throw new Error('Invalid blinded_node_id: must start with 02 or 03');
      }
      offset += 33;

      // enclen: u16
      if (offset + 2 > data.length) {
        throw new Error('Truncated onionmsg_hop: missing enclen');
      }
      const enclen = (data[offset] << 8) | data[offset + 1];
      offset += 2;

      // encrypted_recipient_data
      if (offset + enclen > data.length) {
        throw new Error('Truncated onionmsg_hop: encrypted_data truncated');
      }
      offset += enclen;
    }
  }

  // Must have at least one path
  if (pathCount === 0) {
    throw new Error('offer_paths must contain at least one path');
  }
}

/**
 * Validate feature bits. Per the spec, unknown even feature bits must
 * cause rejection. Odd bits are always safe to ignore.
 */
function validateFeatures(data: Uint8Array): void {
  for (let byteIdx = 0; byteIdx < data.length; byteIdx++) {
    const byte = data[byteIdx];
    if (byte === 0) {
      continue;
    }

    // Position from the right (LSB of last byte = bit 0)
    const bitOffset = (data.length - 1 - byteIdx) * 8;

    for (let bit = 0; bit < 8; bit++) {
      if (byte & (1 << bit)) {
        const featureBit = bitOffset + bit;
        if (featureBit % 2 === 0) {
          throw new Error(`Unknown even feature bit ${featureBit}`);
        }
      }
    }
  }
}

export interface ValidatedOffer {
  records: TlvRecord[];
  hasDescription: boolean;
  hasAmount: boolean;
  hasCurrency: boolean;
  hasIssuerId: boolean;
  hasPaths: boolean;
}

/**
 * Validate an offer's TLV records according to BOLT12 semantic rules.
 */
export function validateOffer(records: TlvRecord[]): ValidatedOffer {
  let hasDescription = false;
  let hasAmount = false;
  let hasCurrency = false;
  let hasIssuerId = false;
  let hasPaths = false;

  for (const record of records) {
    const type = record.type;

    // Check type is in valid offer range
    if (!isValidOfferType(type)) {
      if (type % 2n === 0n) {
        throw new Error(`Invalid: unknown even field type ${type} outside offer range`);
      }
      // This type is out of range but odd - still invalid for offers
      throw new Error(`Invalid: field type ${type} outside valid offer range`);
    }

    // Unknown even types must be rejected
    if (!KNOWN_OFFER_TYPES.has(type) && type % 2n === 0n) {
      throw new Error(`Unknown even TLV type ${type}`);
    }

    // Validate specific fields
    switch (type) {
      case OFFER_CHAINS:
        validateChains(record.value);
        break;

      case OFFER_CURRENCY:
        validateUtf8(record.value, 'offer_currency');
        hasCurrency = true;
        break;

      case OFFER_AMOUNT: {
        const amount = readTruncatedUint(record.value);
        if (amount === 0n) {
          throw new Error('Invalid: zero offer_amount');
        }
        hasAmount = true;
        break;
      }

      case OFFER_DESCRIPTION:
        if (record.value.length === 0) {
          // BOLT12: offer_description is optional only when offer_amount is absent.
          // An empty TLV is not "descriptionless" — omit type 10 entirely.
          throw new Error('Invalid: empty offer_description');
        }
        validateUtf8(record.value, 'offer_description');
        hasDescription = true;
        break;

      case OFFER_FEATURES:
        validateFeatures(record.value);
        break;

      case OFFER_PATHS:
        validateBlindedPaths(record.value);
        hasPaths = true;
        break;

      case OFFER_ISSUER:
        validateUtf8(record.value, 'offer_issuer');
        break;

      case OFFER_ISSUER_ID:
        validatePoint(record.value, 'offer_issuer_id');
        hasIssuerId = true;
        break;
    }
  }

  // Semantic validation rules:

  // An offer with amount but no description is invalid
  if (hasAmount && !hasDescription) {
    throw new Error('Missing offer_description with offer_amount');
  }

  // Currency requires amount
  if (hasCurrency && !hasAmount) {
    throw new Error('Missing offer_amount with offer_currency');
  }

  // Must have either issuer_id or paths (or both)
  if (!hasIssuerId && !hasPaths) {
    throw new Error('Missing offer_issuer_id and no offer_paths');
  }

  return { records, hasDescription, hasAmount, hasCurrency, hasIssuerId, hasPaths };
}
