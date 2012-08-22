all:
	npm -g i .

version:
	./scripts/versions.js

doc: version
	./node_modules/.bin/selleck --out ./output/

clean:
	rm -rRf ./output/*

docs: clean doc 

deploydocs: version
	rm -rRf ../shifter-pages/*
	cp -R ./output/* ../shifter-pages/

.PHONY: docs clean deploydocs
