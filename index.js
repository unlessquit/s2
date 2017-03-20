var fs = require('fs')
var path = require('path')
var express = require('express')
var app = express()
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var config = require('./config')

// Allow s2.js to do it's stuff
app.use(function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, PUT')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

app.use('/app', express.static('public'))

// Storage
var sha256 = s => crypto.createHash('sha1').update(s).digest('hex')
var id2dir = id => path.join(config.dataDir, id.slice(0, 2), id.slice(2, 4))

var rw = express.Router()

rw.put(/.+/, (req, res) => {
  var key = req.path
  var id = sha256(key)
  var dir = id2dir(id)

  mkdirp(dir, err => {
    if (err) {
      res.statusCode = 500
      res.send(JSON.stringify(err))
      return
    }

    var filename = path.join(dir, id)

    var metadata = {
      'key': key,
      'content-type': req.headers['content-type']
    }

    fs.writeFile(filename + '.json', JSON.stringify(metadata), err => {
      if (err) {
        res.statusCode = 500
        res.send(JSON.stringify(err))
        return
      }

      var writer = fs.createWriteStream(filename)
      req.pipe(writer).on('finish', () => res.send(id + '\n'))
    })
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
  var filename = path.join(id2dir(id), id)

  fs.readFile(filename + '.json', (err, data) => {
    if (err) {
      res.statusCode = 500
      res.send(JSON.stringify(err))
      return
    }

    var metadata = JSON.parse(data)
    var originalFilename = path.basename(metadata.key)

    res.set('Content-Type', metadata['content-type'])
    res.set('Content-Disposition', 'inline; filename="' +
            originalFilename + '"')
    fs.createReadStream(filename).pipe(res)
  })
}

// Main
app.set('trust proxy', config.trustProxy)
app.listen(config.port, function () {
  console.log('s2 app listening on port ' + config.port + '!')
})
