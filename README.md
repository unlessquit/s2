# s2
(HTTP) Storage Service

## Usage

### Create

    curl -X PUT -H "Content-Type: image/png" --data-binary @image.png http://localhost:3000/-/my/image.png

### Fetch

    curl http://localhost:3000/-/my/image.png
    curl http://localhost:3000/4e4cca9ce5267a5a25c276d0a9538af1a1855b1b
    curl http://localhost:3000/4e4cca9ce5267a5a25c276d0a9538af1a1855b1b/image.png
    curl http://localhost:3000/4e4cca9ce5267a5a25c276d0a9538af1a1855b1b/whatever.png
