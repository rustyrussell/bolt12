#! /usr/bin/make

default: check src/bolt12/generated.py

TOPDIR := ..
# You may need to override this with PYTHON=python3 on the cmdline!
PYTHON := python

src/bolt12/generated.py: $(TOPDIR)/specs/bolt12.csv $(TOPDIR)/specs/bolt4.csv $(TOPDIR)/specs/bolt1.csv src/bolt12/preamble.py $(TOPDIR)/tools/generate-code.py
	$(PYTHON) $(TOPDIR)/tools/generate-code.py --preamble=src/bolt12/preamble.py --language=py > $@

check: check-pytest check-source

check-source: check-flake8 check-mypy

check-flake8:
	flake8 --ignore=E501,E731,W503 $(filter-out src/bolt12/key.py src/bolt12/preamble.py, $(wildcard src/bolt12/*.py))

check-pytest: src/bolt12/generated.py
	PYTHONPATH=src pytest

check-mypy: src/bolt12/generated.py
	mypy src/bolt12

