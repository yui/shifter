all:
	npm -g i .

version:
	./scripts/versions.js

doc: version
	./node_modules/.bin/selleck --out ./output/

clean:
	rm -rRf ./output/*

lint:
	npm run-script pretest

docs: clean doc 


coverage:
	npm test --coverage
	mkdir ../shifter-pages/coverage/
	cp -R ./coverage/lcov-report/* ../shifter-pages/coverage/

cleandeploy:
	rm -rRf ../shifter-pages/*

deploydocs: cleandeploy coverage docs
	cp -R ./output/* ../shifter-pages/

.PHONY: docs clean deploydocs lint coverage
