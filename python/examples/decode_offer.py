#! /usr/bin/python3
import bolt12
import sys

# Examples to try:
# ./examples/decode_offer.py lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehhyec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy
# ./examples/decode_offer.py lno1qcp4256ypqpq86q2pucnq42ngssx2an9wfujqerp0y2pqun4wd68jtn00fkxzcnn9ehh+ yec6qgqsz83qfwdpl28qqmc78ymlvhmxcsywdk5wrjnj36jryg488qwlrnzyjczlqsp9nyu4phcg6dqhlhzgxagfu7zh3d9re0sqp9ts2yfugvnnm9gxkcnnnkdpa084a6t520h5zhkxsdnghvpukvd43lastpwuh73k29qsy

# Get a bolt12 decoder, feed it the argument(s).
d = bolt12.Decoder()
for arg in sys.argv[1:]:
    d.add(arg)

# Presumably it's a complete string
if not d.complete():
    print("Incomplete string", file=sys.stderr)
    sys.exit(1)

# Try to extract the offer, invoice or invoice_request
offer, whynot = d.result()
if offer is None:
    print("decode failed: {}".format(whynot), file=sys.stderr)
    sys.exit(1)

# This is called decode_offer, after all
if not isinstance(offer, bolt12.Offer):
    print("This is not an offer, it's a {}".format(type(offer)),
          file=sys.stderr)

# Sanity check the offer
ok, whynot = offer.check()
if not ok:
    print("Invalid offer: {}".format(whynot), file=sys.stderr)

# Print it out (in absolutely primitive style)
print(offer.values)
