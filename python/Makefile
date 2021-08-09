#! /usr/bin/make

default: generated.py

TOPDIR := ../..

generated.py: $(TOPDIR)/specs/bolt12.csv $(TOPDIR)/specs/bolt4.csv $(TOPDIR)/specs/bolt1.csv preamble.py $(TOPDIR)/tools/generate-code.py
	(cat preamble.py && ORIGDIR=`pwd` && cd $(TOPDIR) && tools/generate-code.py --language=py) > $@

check: check-source check-pytest

check-source: check-flake8 check-mypy

check-flake8:
	flake8 --ignore=E501,E731,W503 *.py

check-pytest:
	python3 -m pytest

check-mypy:
	mypy *.py

