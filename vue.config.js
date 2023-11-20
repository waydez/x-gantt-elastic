const path = require('path')
const { isProduct } = require('./build/utils')
const { externalMap } = require('./config/index')
const aliasConfig = require('./config/alias')

function resolve(dir) {
  return path.join(__dirname, dir)
}
const external = {}

const setAlias = (config) => {
  const { alias } = aliasConfig
  Object.keys(alias).forEach((key) => {
    config.resolve.alias.set(key, alias[key])
  })
}

Object.keys(externalMap).forEach((key) => {
  if (external[key]) {
    external[key] = key
  }
})

// node: code below stops process to exit normally
// const threadLoader = require('thread-loader')
// threadLoader.warmup(
//   {
//     // pool options, like passed to loader options
//     // must match loader options to boot the correct pool
//   },
//   [
//     // modules to load
//     // can be any module, i. e.
//     'babel-loader',
//     'sass-loader'
//   ]
// )
module.exports = {
  productionSourceMap: false,
  transpileDependencies: ['@x-ui/x-dcloud-ui'],
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@packages/assets/scss/mixin.scss";
          @import "@packages/assets/scss/variable/index.scss";
        `
      }
    }
  },
  chainWebpack: (config) => {
    setAlias(config)
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@packages', resolve('packages'))
      .set('@x-gantt-elastic', resolve('./'))
    // use multi thread，see https://www.npmjs.com/package/thread-loader
    // config.module
    //   .rule('compile')
    //   .test(/\.js$/)
    //   .include
    //   .add(/src/)
    //   .end()
    //   .use('thread')
    //   .loader('thread-loader')
    config.module
      .rule('js')
      .include.add(/packages/)
      .add(/src/)
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap((options) => {
        return options
      })
  },
  configureWebpack: (config) => {
    if (isProduct) {
      config.externals = external
    }
  }
}
