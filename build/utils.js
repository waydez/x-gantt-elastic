const path = require('path')
const fs = require('fs')
var { outputPath, isProduct } = require('../config/index')
const chalk = require('chalk')

module.exports = {
  getAssetsPath(_path = '.') {
    return path.posix.join(outputPath, _path)
  },
  resolve(_path) {
    return _path ? path.resolve(__dirname, _path) : path.resolve(__dirname, '..', outputPath)
  },
  isProduct,
  env: process.env.NODE_ENV,
  chalkConsole: {
    success: () => {
      console.log(chalk.green('========================================='))
      console.log(chalk.green('========打包成功(build success)!========='))
      console.log(chalk.green('========================================='))
    },
    building: (index, total) => {
      console.log(chalk.blue(`正在打包第${index}/${total}个文件...`))
    }
  },
  fsExistsSync: (_path) => {
    try {
      fs.accessSync(_path, fs.F_OK)
    } catch (e) {
      return false
    }
    return true
  },
  // wrapCustomClass: function (render) {
  //   return function (...args) {
  //     return render(...args)
  //       .replace('<code class="', '<code class="hljs ')
  //       .replace('<code>', '<code class="hljs">')
  //   }
  // },
  convertHtml: function (str) {
    return str.replace(/(&#x)(\w{4});/gi, ($0) =>
      String.fromCharCode(
        parseInt(encodeURIComponent($0).replace(/(%26%23x)(\w{4})(%3B)/g, '$2'), 16)
      )
    )
  },
  createExternal: function (ignoreMap, _external) {
    return function (modulePath, parentId) {
      let ignoreKey = Object.keys(ignoreMap).find((ignore) => modulePath.startsWith(ignore))
      if (ignoreKey) {
        return ignoreMap[ignoreKey]
      }
      var external = true
      if (path.isAbsolute(modulePath)) {
        if (!modulePath.match(/node_modules/)) {
          external = false
        }
      } else {
        external = _external.includes(modulePath)
      }
      return external
    }
  }
}
