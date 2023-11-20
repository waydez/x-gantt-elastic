const modules = require('./module')

const moduleMap = { ...modules }
const moduleLib = Object.keys(moduleMap).reduce((lib, name) => {
  lib[name] = {
    input: moduleMap[name],
    output: name
  }
  return lib
}, {})

module.exports = {
  index: {
    input: 'packages/index.js',
    output: 'index'
  },
  ...moduleLib
}
