var fs = require('fs')
var path = require('path')
var mime = require('mime-types')
var express = require('express')
var fresh = require('fresh')
var app = express()
var crypto = require('crypto')
var mkdirp = require('mkdirp')
var config = require('./config')
var utils = require('./utils')
var http = require('./http')

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

app.get('/o/:id', (req, res) => sendFile(req.params.id, req, res, {anonymize: true}))

app.get(/.*/, (req, res) => {
  var key = req.path
  var id = key2id(key)

  sendFile(id, req, res)
})

app.put(/.+/, (req, res) => {
  var asInbox = req.query.as === 'inbox'
  var key = asInbox ? path.join(req.path, utils.uuid()) : req.path
  var id = key2id(key)
  var dir = id2dir(id)

  mkdirp(dir, err => {
    if (err) {
      http.error500(res, JSON.stringify(err))
      return
    }

    var filename = path.join(dir, id)
    var filenameMetadata = filename + '.json'

    var m = utils.maybeGetMetadata(filenameMetadata)

    if (m && req.headers['if-match'] && m.etag !== req.headers['if-match']) {
      http.error412(res)
      return
    }

    var metadata = {
      'key': key,
      'content-type': req.headers['content-type'],
      'etag': utils.uuid()
    }

    fs.writeFile(filenameMetadata, JSON.stringify(metadata), err => {
      if (err) {
        http.error500(res, JSON.stringify(err))
        return
      }

      var writer = fs.createWriteStream(filename)

      var pipe = req.pipe(writer)
      pipe.on('error', err => {
        console.error('ERROR Failed to write', filename, 'Reason:', err)
        http.error500(res, JSON.stringify(err))
      })
      pipe.on('finish', () => res.send(id + '\n'))
    })
  })
})

function sendFile (id, req, res, opts) {
  opts = opts || {}
  var filename = path.join(id2dir(id), id)

  fs.readFile(filename + '.json', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        http.error404(res)
        return
      }

      http.error500(res, JSON.stringify(err))
      return
    }

    var metadata = JSON.parse(data)
    var originalFilename = opts.anonymize
        ? anonymizedFilename(id, metadata)
        : path.basename(metadata.key)
    var stat = fs.statSync(filename)

    res.set('Content-Type', metadata['content-type'])
    res.set('Content-Disposition', 'inline; filename="' +
            originalFilename + '"')
    res.setHeader('Content-Length', stat.size)
    res.setHeader('ETag', metadata.etag || 'n/a')
    if (fresh(req.headers, res._headers)) {
      http.notModified(res)
      return
    }

    fs.createReadStream(filename).pipe(res)
  })
}

function anonymizedFilename (id, metadata) {
  var ext = mime.extension(metadata['content-type'])

  return ext
    ? id + '.' + ext
    : id
}

module.exports = app
