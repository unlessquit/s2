.PHONY: test

image:
	docker build -t unlessquit/s2 .

test:
	docker run unlessquit/s2 npm test

release:
	docker push unlessquit/s2
