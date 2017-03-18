var fs = require('fs')
var path = require('path')
var express = require('express')
var app = express()
var crypto = require('crypto')
var mkdirp = require('mkdirp')

var sha256 = s => crypto.createHash('sha1').update(s).digest('hex')
var id2dir = id => path.join(id.slice(0, 2), id.slice(2, 4))

var rw = express.Router()

rw.put(/.+/, (req, res) => {
  var key = req.path
  var id = sha256(key)
  var dir = id2dir(id)

  mkdirp(dir, err => {
    if (err) {
      res.statusCode = 500
      res.end(err)
      return
    }

    var writer = fs.createWriteStream(path.join(dir, id))
    req.pipe(writer)
    res.end(id + '\n')
  })
})

rw.get('/:key', (req, res) => {
  var key = '/' + req.params.key
  var id = sha256(key)

  sendFile(id, res)
})

app.use('/-', rw)

app.get('/:id', (req, res) => {
  var id = req.params.id

  sendFile(id, res)
})

app.get('/:id/:name', (req, res) => {
  var id = req.params.id

  sendFile(id, res)
})

app.get('/', (req, res) => res.send('Hello World!'))

function sendFile (id, res) {
  fs.createReadStream(path.join(id2dir(id), id)).pipe(res)
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
