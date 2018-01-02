const pkg = require('../package.json')

module.exports = {
  entry: pkg.module,
  dist: 'dist/',
  filename: {
    js: 'rsup-mqtt.js'
  },
  vendor: false,
  html: false,
  sourceMap: false,
  minimize: false,
  format: 'cjs'
}
