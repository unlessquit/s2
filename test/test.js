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
})
