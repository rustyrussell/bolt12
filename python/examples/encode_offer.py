#! /usr/bin/env python3
import argparse
import bolt12
import sys

# Examples to try:
# ./examples/encode_offer.py 4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605 'Send Rusty money'
# ./examples/encode_offer.py 4b9a1fa8e006f1e3937f65f66c408e6da8e1ca728ea43222a7381df1cc449605 'Send Rusty money' --vendor="bolt12.org" --amount=10000

parser = argparse.ArgumentParser(description='Tool encode an offer')
parser.add_argument('--amount', help='Amount in msat', type=int)
parser.add_argument('--vendor', help='Who you are')
parser.add_argument('nodeid', help='32-byte nodeid (omit 02/03) for offer')
parser.add_argument('description', help='description of what offer is for')
args = parser.parse_args()

opts = {'description': args.description,
        'node_id': bytes.fromhex(args.nodeid)}
if args.amount:
    opts['amount'] = args.amount
if args.vendor:
    opts['vendor'] = args.vendor
b12 = bolt12.Offer.create(**opts)

print(b12.encode())
