BOLTDIR=../../lightning-rfc

all: bolt12.csv bolt4.csv bolt1.csv

# These are taken from the "offers" branch.
bolt12.csv: $(BOLTDIR)/12-offer-encoding.md
bolt1.csv: $(BOLTDIR)/01-messaging.md
bolt4.csv: $(BOLTDIR)/04-onion-routing.md

bolt%.csv:
	$(BOLTDIR)/tools/extract-formats.py $< > $@
