/* eslint-env browser */

function S2 (serverUrl) {
  this.serverUrl = serverUrl
}

S2.prototype.fetchJson = function (key, callback) {
  var req = new XMLHttpRequest()

  req.addEventListener('load', function (e) {
    if (this.status !== 200) {
      callback(this, null)
      return
    }

    callback(null, JSON.parse(this.responseText))
  })
  req.open('GET', this.serverUrl + key)
  req.send()
}

S2.prototype.store = function (key, value, options, callback) {
  var req = new XMLHttpRequest()
  req.addEventListener('load', function () {
    if (this.status !== 200) {
      callback(this, null)
      return
    }

    if (callback) {
      callback(null, this.responseText.trim())
    }
  })
  req.open('PUT', this.serverUrl + key)
  if (options['content-type']) {
    req.setRequestHeader('Content-Type', options['content-type'])
  }
  req.send(value)
}

S2.prototype.storeJson = function (key, value, callback) {
  return this.store(
    key,
    JSON.stringify(value),
    {'content-type': 'application/json; charset=utf-8'},
    callback
  )
}
