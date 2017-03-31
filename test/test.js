/* eslint-env node, mocha */
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

    it('can fetch object by its ID (at /o/object-id)', function () {
      var key = '/item'
      var content = 'object-id-content'

      return client.put(key).send(content).expect(200)
        .then(res => client.get('/o/' + res2id(res)).expect(content).expect(200))
    })
  })
})
