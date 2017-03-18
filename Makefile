test: node_modules
	npm test

release: node_modules
	docker build -t unlessquit/s2 .
	docker push unlessquit/s2

node_modules: package.json
	npm install
