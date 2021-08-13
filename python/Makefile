#! /usr/bin/make

default: generated.py

TOPDIR := ..
# You may need to override this with PYTHON=python3 on the cmdline!
PYTHON := python

generated.py: $(TOPDIR)/specs/bolt12.csv $(TOPDIR)/specs/bolt4.csv $(TOPDIR)/specs/bolt1.csv preamble.py $(TOPDIR)/tools/generate-code.py
	$(PYTHON) $(TOPDIR)/tools/generate-code.py --preamble=preamble.py --language=py > $@

check: check-pytest check-source

check-source: check-flake8 check-mypy

check-flake8:
	flake8 --ignore=E501,E731,W503 $(filter-out key.py preamble.py, $(wildcard *.py))

check-pytest: generated.py
	python3 -m pytest

check-mypy:
	mypy *.py

