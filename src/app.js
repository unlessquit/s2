var fs = require('fs')
var path = require('path')
var express = require('express')
var fresh = require('fresh')
var app = express()
var utils = require('./utils')
var http = require('./http')
var S2Obj = require('./s2obj')

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
app.get('/o/:id', (req, res) => {
  return S2Obj.loadById(req.params.id)
    .then(obj => sendFile(obj, req, res, {anonymize: true}))
})

app.get(/.*/, (req, res) => {
  return S2Obj.loadByKey(req.path)
    .then(obj => sendFile(obj, req, res))
})

app.put(/.+/, (req, res) => {
  var asInbox = req.query.as === 'inbox'
  var key = asInbox ? path.join(req.path, utils.uuid()) : req.path

  S2Obj.loadByKey(key).then(obj => {
    if (!obj.validatePutCondition(req.headers)) {
      http.error412(res)
      return
    }

    var metadata = {
      'key': key,
      'content-type': req.headers['content-type'],
      'etag': utils.uuid()
    }

    obj.write(metadata, req)
      .then(() => {
        res.set('ETag', metadata.etag)
        res.send(obj.id + '\n')
      })
      .catch(err => {
        console.error('ERROR Failed to write', obj.filename, 'Reason:', err)
        http.error500(res, JSON.stringify(err))
      })
  })
})

function sendFile (obj, req, res, opts) {
  opts = opts || {}

  if (!obj.metadata.key) {
    http.error404(res)
    return
  }

  res.set('Content-Type', obj.metadata['content-type'])
  res.set('Content-Disposition', 'inline; filename="' +
          (opts.anonymize ? obj.anonymizedName : obj.name) + '"')
  res.setHeader('Content-Length', obj.metadata.size)
  res.setHeader('ETag', obj.metadata.etag || 'n/a')
  if (fresh(req.headers, res._headers)) {
    http.notModified(res)
    return
  }

  fs.createReadStream(obj.filename).pipe(res)
}

module.exports = app
