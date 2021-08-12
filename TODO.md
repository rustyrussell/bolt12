# TODO

## Python

- [ ] finish python library -- RR
- [ ] publish python library v0.0.1alpha -- RR
- [x] move test vectors as JSON -- RR
- [ ] write some examples --RR

## JavaScript

- [x] move js into javascript/ dir -- AS
- [x] use tools/generate-code.py (merge changes from generate-js.py) -- AS
- [x] javascript/Makefile should generate code -- AS
- [x] test against lightning-rfc/bolt12/format-string-test.json
- [x] run test vectors in JS -- AS
- [ ] write some examples -- AS
- [x] make v0.0.1alpha of NPM -- AS
- [ ] fetchinvoice creation support, sending via bootstrap.bolt12.org -- AS
- [ ] Native fetchinvoice -- AS
    - [ ] connect via ws to LN node. -- AS
    - [ ] Implement Noise NK protocol as per BOLT 8 -- AS
    - [ ] send /receive init msgs  -- AS
    - [ ] create onionmessage (big subproject) -- AS
    - [ ] use it instead of bootstrap.bolt12.org API -- AS

## General

- [x] rename repo to bolt12 -- RR
- [ ] generate specs/ from lightning-rfc --RR
- [ ] add more test vectors -- RR
- [ ] bootstrap.bolt12.org/fetchinvoiceraw/HEX -- RR
- [ ] add BOLT12 quote checking to repo -- RR
- [ ] bootstrap.bolt12.org offer a WS proxy -- RR
