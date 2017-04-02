var fs = require('fs')
var path = require('path')
var express = require('express')
var app = express()
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var config = require('./config')
var utils = require('./utils')

// Allow s2.js to do it's stuff
app.use(function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, PUT')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  next()
})

app.get('/', (req, res) => res.send('s2'))
app.use('/app', express.static('public'))

// Storage
var key2id = s => crypto.createHash('sha1').update(s).digest('hex')
var id2dir = id => path.join(config.dataDir, id.slice(0, 2), id.slice(2, 4))

// TODO: use :id + ext (from content-type) as filename
app.get('/o/:id', (req, res) => sendFile(req.params.id, res))
// TODO: use :name as filename
app.get('/o/:id/:name', (req, res) => sendFile(req.params.id, res))

app.get(/.*/, (req, res) => {
  var key = req.path
  var id = key2id(key)

  sendFile(id, res)
})

app.put(/.+/, (req, res) => {
  var asInbox = req.query.as === 'inbox'
  var key = asInbox ? path.join(req.path, utils.uuid()) : req.path
  var id = key2id(key)
  var dir = id2dir(id)

  mkdirp(dir, err => {
    if (err) {
      error500(res, JSON.stringify(err))
      return
    }

    var filename = path.join(dir, id)

    var metadata = {
      'key': key,
      'content-type': req.headers['content-type']
    }

    fs.writeFile(filename + '.json', JSON.stringify(metadata), err => {
      if (err) {
        error500(res, JSON.stringify(err))
        return
      }

      var writer = fs.createWriteStream(filename)

      var pipe = req.pipe(writer)
      pipe.on('error', err => {
        console.error('ERROR Failed to write', filename, 'Reason:', err)
        error500(res, JSON.stringify(err))
      })
      pipe.on('finish', () => res.send(id + '\n'))
    })
  })
})

function sendFile (id, res) {
  var filename = path.join(id2dir(id), id)

  fs.readFile(filename + '.json', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        error404(res)
        return
      }

      error500(res, JSON.stringify(err))
      return
    }

    var metadata = JSON.parse(data)
    var originalFilename = path.basename(metadata.key)
    var stat = fs.statSync(filename)

    res.set('Content-Type', metadata['content-type'])
    res.set('Content-Disposition', 'inline; filename="' +
            originalFilename + '"')
    res.setHeader('Content-Length', stat.size)
    fs.createReadStream(filename).pipe(res)
  })
}

function error404 (res) {
  res.status(404).send('Not Found')
}

function error500 (res, message) {
  console.error('ERROR', message)
  res.status(500).send('Internal Server Error')
}

module.exports = app
