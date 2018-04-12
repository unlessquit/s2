.PHONY: test

image:
	docker build -t unlessquit/s2 .

test: image
	docker run -v $(CURDIR)/test:/app/test unlessquit/s2 npm test

release:
	docker push unlessquit/s2
