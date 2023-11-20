const devConfig = require('./dev')
const prodConfig = require('./prod')
const isProduct = ['production', 'prod'].includes(process.env.NODE_ENV)
const config = isProduct ? prodConfig : devConfig
module.exports = {
  styleOutputPath: 'theme',
  outputPath: 'lib',
  clearConsole: config.clearConsole,
  isProduct,
  // 打包忽略
  externalMap: {
    vue: true,
    'element-ui': true,
    lodash: true,
    'pinyin-pro': true,
    mitt: true
  },
  prefix: '@x-gantt-elastic'
}
