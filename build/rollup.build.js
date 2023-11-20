const fs = require('fs')
const { formatTypeList, addons, esDir } = require('../config/rollup.build.config.js')
const libList = require('../packages/lib-list.js')
const { styleOutputPath } = require('../config/index')
const { build } = require('./rollup.createConfig')
const { resolve, getAssetsPath } = require('./utils')
fs.mkdirSync(resolve()) // make dir 'lib'
fs.mkdirSync(getAssetsPath(styleOutputPath))
if ([...formatTypeList, ...addons].some((item) => item.format === esDir)) {
  fs.mkdirSync(getAssetsPath(esDir))
}
let pkg = []
formatTypeList.forEach(({ format, min, suffix } = {}) => {
  Object.keys(libList).forEach((moduleName) => {
    const { input, output } = libList[moduleName]
    pkg.push({ min, format, suffix, moduleName, input, output: `${output || moduleName}` })
  })
})
pkg = pkg.concat(addons) // generate options of packages

build(pkg)
