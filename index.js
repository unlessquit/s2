var app = require('./src/app.js')
var config = require('./src/config')

// Main
app.set('trust proxy', config.trustProxy)
app.listen(config.port, function () {
  console.log('s2 app listening on port ' + config.port + '!')
})

process.on('SIGINT', function () {
  process.exit()
})
