#! /usr/bin/make

default: gencode.js

TOPDIR := ..
# You may need to override this with PYTHON=python3 on the cmdline!
PYTHON := python

gencode.js: $(TOPDIR)/specs/bolt12.csv $(TOPDIR)/specs/bolt4.csv $(TOPDIR)/specs/bolt1.csv preamble.js $(TOPDIR)/tools/generate-code.py
	$(PYTHON) $(TOPDIR)/tools/generate-code.py --preamble=preamble.js --postamble=postamble.js --language=js > $@

check: gencode.js
	node test_bolt12.js
