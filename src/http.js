var utils = require('./utils')

function notModified (res) {
  utils.removeContentHeaderFields(res)
  res.statusCode = 304
  res.end()
}

function error404 (res) {
  res.status(404).send('Not Found')
}

function error412 (res) {
  res.status(412).send('Precondition failed')
}

function error500 (res, message) {
  console.error('ERROR', message)
  res.status(500).send('Internal Server Error')
}

exports.notModified = notModified
exports.error404 = error404
exports.error412 = error412
exports.error500 = error500
