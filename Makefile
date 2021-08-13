#! /usr/bin/make

SOURCE := $(wildcard javascript/*.js) $(wildcard python/*.py)

check: check-python check-javascript check-quotes

check-quotes: $(SOURCE:%=check-quotes/%) $(SOURCE:%=check-quotes/%)

check-quotes/%.py: %.py
	@echo $@
	@tools/check_quotes.py --comment-start='# ' --comment-continue='#' --boltdir=lightning-rfc/ $<

check-quotes/%.js: %.js
	@echo $@
	@tools/check_quotes.py --comment-start='// ' --comment-continue='//' --boltdir=lightning-rfc/ $<

check-python:
	$(MAKE) -C python check

check-javascript:
	$(MAKE) -C javascript check
