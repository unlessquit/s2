/* eslint-env browser */

function S2 (serverUrl) {
  this.serverUrl = serverUrl
}

S2.prototype.fetchJson = function (key, callback) {
  var req = new XMLHttpRequest()
  req.addEventListener('load', function () {
    callback(JSON.parse(this.responseText))
  })
  req.open('GET', this.serverUrl + key)
  req.send()
}

S2.prototype.storeJson = function (key, value, callback) {
  var req = new XMLHttpRequest()
  req.addEventListener('load', function () {
    if (callback) {
      callback(this.responseText)
    }
  })
  req.open('PUT', this.serverUrl + key)
  req.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
  req.send(JSON.stringify(value))
}
