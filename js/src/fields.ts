/**
 * High-level typed field extraction for BOLT12 messages.
 *
 * Provides a convenient API to access decoded offer fields by name
 * instead of manually searching TLV records by type number.
 *
 * @deprecated Use the auto-generated types from `./generated.js` instead.
 * The generated module provides spec-compliant field names (e.g. `offer_description`
 * instead of `description`) and covers offer, invoice_request, invoice, and
 * invoice_error message types. This hand-written module only covers offers.
 *
 * Migration:
 *   import { extractOfferFields, type OfferFields } from './generated.js';
 */

import type { TlvRecord } from './tlv.js';

/** Read a truncated big-endian unsigned integer. */
function tu64(data: Uint8Array): bigint {
  if (data.length === 0) {
    return 0n;
  }
  let val = 0n;
  for (let i = 0; i < data.length; i++) {
    val = (val << 8n) | BigInt(data[i]);
  }
  return val;
}

function toHex(buf: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < buf.length; i++) {
    hex += ('0' + buf[i].toString(16)).slice(-2);
  }
  return hex;
}

/**
 * Parsed chain hash with known name.
 * @deprecated Use `Uint8Array[]` from generated `OfferFields.offer_chains` instead.
 */
export interface Chain {
  hash: string;
  name: string;
}

const KNOWN_CHAINS: Record<string, string> = {
  '6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000': 'bitcoin',
  '43497fd7f826957108f4a30fd9cec3aeba79972084e90ead01ea330900000000': 'testnet',
  '06226e46111a0b59caaf126043eb5bbf28c34f3a5e332a1fc7b2b73cf188910f': 'regtest',
};

function parseChains(data: Uint8Array): Chain[] {
  const chains: Chain[] = [];
  for (let i = 0; i < data.length; i += 32) {
    const hash = toHex(data.slice(i, i + 32));
    chains.push({ hash, name: KNOWN_CHAINS[hash] || 'unknown' });
  }
  return chains;
}

/**
 * Typed offer fields extracted from TLV records.
 * @deprecated Use `GeneratedOfferFields` from `./generated.js` instead.
 */
export interface OfferFields {
  /** Chain hashes this offer is valid for (default: bitcoin mainnet). */
  chains?: Chain[];
  /** Arbitrary metadata bytes (hex). */
  metadata?: string;
  /** ISO 4217 currency code if amount is not in msat. */
  currency?: string;
  /** Amount in msat (or currency minor units if currency is set). */
  amount?: bigint;
  /** Human-readable description. */
  description?: string;
  /** Feature bits as raw bytes (hex). */
  features?: string;
  /** Absolute expiry as seconds since Unix epoch. */
  absolute_expiry?: bigint;
  /** Whether blinded paths are present. */
  has_paths: boolean;
  /** Raw paths data (hex). */
  paths?: string;
  /** Human-readable issuer name. */
  issuer?: string;
  /** Maximum quantity a payer can request. */
  quantity_max?: bigint;
  /** Issuer's compressed public key (hex, 33 bytes). */
  issuer_id?: string;
  /** The raw TLV records for advanced access. */
  records: TlvRecord[];
}

/**
 * Extract typed fields from offer TLV records.
 * @deprecated Use `extractOfferFields` from `./generated.js` instead.
 */
export function extractOfferFields(records: TlvRecord[]): OfferFields {
  const fields: OfferFields = {
    has_paths: false,
    records,
  };

  const utf8 = new TextDecoder('utf-8', { fatal: false });

  for (const rec of records) {
    switch (rec.type) {
      case 2n:
        fields.chains = parseChains(rec.value);
        break;
      case 4n:
        fields.metadata = toHex(rec.value);
        break;
      case 6n:
        fields.currency = utf8.decode(rec.value);
        break;
      case 8n:
        fields.amount = tu64(rec.value);
        break;
      case 10n:
        if (rec.value.length > 0) {
          fields.description = utf8.decode(rec.value);
        }
        break;
      case 12n:
        fields.features = toHex(rec.value);
        break;
      case 14n:
        fields.absolute_expiry = tu64(rec.value);
        break;
      case 16n:
        fields.has_paths = true;
        fields.paths = toHex(rec.value);
        break;
      case 18n:
        fields.issuer = utf8.decode(rec.value);
        break;
      case 20n:
        fields.quantity_max = tu64(rec.value);
        break;
      case 22n:
        fields.issuer_id = toHex(rec.value);
        break;
    }
  }

  return fields;
}
