#! /usr/bin/make

default: gencode.js

TOPDIR := ..

gencode.js: $(TOPDIR)/specs/bolt12.csv $(TOPDIR)/specs/bolt4.csv $(TOPDIR)/specs/bolt1.csv preamble.js $(TOPDIR)/tools/generate-code.py
	$(TOPDIR)/tools/generate-code.py --preamble=preamble.js --postamble=postamble.js --language=js > $@

check: gencode.js
	node test_bolt12.js
