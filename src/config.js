require('dotenv').config()

exports.port = process.env.S2_PORT || 3000
exports.dataDir = process.env.S2_DATA_DIR || './'
exports.trustProxy = process.env.S2_TRUST_PROXY === '1'
