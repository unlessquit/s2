var fs = require('fs')
var mkdirp = require('mkdirp')
var crypto = require('crypto')
var mime = require('mime-types')
var config = require('./config')
var path = require('path')

var key2id = s => crypto.createHash('sha1').update(s).digest('hex')
var id2dir = id => path.join(config.dataDir, id.slice(0, 2), id.slice(2, 4))

class S2Obj {
  static loadById (id) {
    var obj = new S2Obj(id)

    return new Promise((resolve, reject) => {
      fs.readFile(obj.filenameMetadata, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(obj)
            return
          }

          reject(err)
          return
        }

        var metadata = JSON.parse(data)

        var stat = fs.statSync(obj.filename)
        metadata.size = stat.size

        obj.metadata = metadata
        resolve(obj)
      })
    })
  }

  static loadByKey (key) {
    return S2Obj.loadById(key2id(key))
  }

  static createForKey (key) {
    return new S2Obj(key2id(key))
  }

  constructor (id) {
    this.id = id
    this.dir = id2dir(id)
    this.filename = path.join(this.dir, this.id)
    this.filenameMetadata = path.join(this.dir, this.id) + '.json'
    this.metadata = {}
  }

  get name () {
    return path.basename(this.metadata.key)
  }

  get anonymizedName () {
    var ext = mime.extension(this.metadata['content-type'])

    return ext
      ? this.id + '.' + ext
      : this.id
  }

  get metadata () {
    return this._metadata
  }

  set metadata (data) {
    this._metadata = data
  }

  validatePutCondition (condition) {
    if (!condition['if-match']) return true

    if (this.metadata.etag !== condition['if-match']) return false

    return true
  }

  createReadStream () {
    return fs.createReadStream(this.filename)
  }

  write (metadata, src) {
    return new Promise((resolve, reject) => {
      mkdirp(this.dir, err => {
        if (err) {
          reject(err)
          return
        }

        fs.writeFile(this.filenameMetadata, JSON.stringify(metadata), err => {
          if (err) {
            reject(err)
            return
          }

          this.metadata = metadata

          var writer = fs.createWriteStream(this.filename)
          var pipe = src.pipe(writer)
          pipe.on('error', err => reject(err))
          pipe.on('finish', () => resolve())
        })
      })
    })
  }
}

module.exports = S2Obj
