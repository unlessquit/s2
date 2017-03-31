/* eslint-env node, mocha */
var request = require('supertest')
var app = require('../src/app.js')

describe('homepage', function () {
  it('should return s2', function () {
    return request(app)
      .get('/')
      .expect('s2')
  })
})
