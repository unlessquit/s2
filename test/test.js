/* eslint-env node, mocha */
var assert = require('assert')
var request = require('supertest')
var app = require('../src/app.js')
var config = require('../src/config.js')
var tmp = require('tmp')

var client = request(app)

describe('homepage', function () {
  it('should return s2', function () {
    return request(app)
      .get('/')
      .expect('s2')
  })
})

var res2id = res => res.text.trim()

describe('storage', function () {
  // Make sure we use clean storage for each test
  beforeEach(() => { config.dataDir = tmp.dirSync().name })

  describe('HTTP PUT/GET', function () {
    it('stores/retrieves content', function () {
      var key = '/item'
      var content = 'hello'

      return client.put(key).send(content).expect(200)
        .then(() => client.get(key).expect(content))
    })
  })

  describe('PUT', function () {
    it('returns ID of stored object (i.e. sha1 hash of its path)', function () {
      return client.put('/key')
        .send('content')
        .expect('bc8f1dc137b325391764fdf8ba7bb1176731e515\n')
    })
  })

  describe('GET', function () {
    it('returns 404 when object is not found', function () {
      return client.get('/unknown').expect(404)
    })

    it('returns ETag (UUID)', function () {
      var key = '/key'
      return client.put(key).send('content').then(() => {
        return client.get(key).expect('ETag', /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)
      })
    })

    describe('by ID (at /o/object-id)', function () {
      it('doesn\'t reveal sensitivie data (e.g., original filename)', function () {
        var key = '/item'
        var content = JSON.stringify({a: 10})

        return client.put(key).set('Content-Type', 'application/json').send(content).expect(200)
          .then(putRes => {
            var id = res2id(putRes)
            var res = client.get('/o/' + id)

            res.expect(200)
            // Filename is anonymized (id + extension based on content-type)
            var matchFilename = new RegExp('filename="' + id + '.json"')
            res.expect('Content-Disposition', matchFilename)

            return res
          })
      })
    })
  })

  describe('as inbox', function () {
    it('stores each PUT into its own object', function () {
      var key = '/item'
      var inbox = key + '?as=inbox'
      var content1 = 'hello1'
      var content2 = 'hello2'

      var put1 = client.put(inbox).send(content1).expect(200)
      var put2 = client.put(inbox).send(content2).expect(200)

      return Promise.all([put1, put2]).then(([res1, res2]) => {
        assert.notEqual(res2id(res1), res2id(res2))
      })
    })
  })

  xdescribe('Concurrent update', function () {
    it('fails if If-Match doesn\'t match resource\'s ETag', function () {
      var key = '/key'
      var putRes = client.put(key).send('content')

      return putRes.then(() => {
        return client.put(key).set('If-Match', 'invalid').send('content')
          .expect(412) // Precondition Failed
      })
    })
  })
})
