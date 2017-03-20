# s2
(HTTP) Storage Service

# Usage

    npm install
    npm start

## From command line

    # Store
    curl -X PUT -H "Content-Type: image/png" --data-binary @image.png http://localhost:3000/my/image.png

    # Retrieve
    curl http://localhost:3000/my/image.png
    curl http://localhost:3000/o/4e4cca9ce5267a5a25c276d0a9538af1a1855b1b
    curl http://localhost:3000/o/4e4cca9ce5267a5a25c276d0a9538af1a1855b1b/image.png
    curl http://localhost:3000/o/4e4cca9ce5267a5a25c276d0a9538af1a1855b1b/whatever.png

## From any webpage

    <script type="text/javascript" src="https://some-s2-server/app/js/s2.js"></script>

    <script type="text/javascript">
      var s2 = new S2('https://some-s2-server')

      s2.storeJson('/hello.json', {text: "Hello World!"}, function () {
        s2.fetchJson('/hello.json', function (json) {
            console.log(json.text)
        })
      })
    </script>
