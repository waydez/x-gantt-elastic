const elementUIComponentPlugin = [
  'component',
  {
    'libraryName': 'element-ui',
    'styleLibraryName': 'theme-chalk'
  }
]
// const XDcloudLibComponentPlugin = [
//   'component',
//   {
//     libraryName: '@x-ui/x-dcloud-ui',
//     styleLibrary: {
//       base: false,
//       name: 'theme-chalk/theme'
//     },
//     ext: '.scss'
//   },
//   '@x-ui/x-dcloud-ui'
// ]
module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        useBuiltIns: false
        // useBuiltIns: 'entry'
      }
    ]
  ],
  plugins: [
    elementUIComponentPlugin,
    // XDcloudLibComponentPlugin,
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining'
  ]
}
