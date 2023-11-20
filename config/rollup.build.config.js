module.exports = {
  esDir: 'es',

  formatTypeList: [
    { format: 'cjs', min: false, suffix: '.js' },
    // { format: 'cjs', min: true, suffix: '.common.min.js' },
    // { format: 'umd', min: false, suffix: '.umd.js' },
    // { format: 'umd', min: true, suffix: '.umd.min.js' }
    { format: 'es', min: false, suffix: '.js' }
    // { format: 'es', min: true, suffix: '.es.min.js' }
  ],
  addons: []
}
