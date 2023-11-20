const utils = require('../build/utils')
module.exports = {
  resolve: ['.js', '.vue', '.json'],
  alias: {
    '@': utils.resolve('../src'),
    '@packages': utils.resolve('../packages'),
    '@x-gantt-elastic': utils.resolve('../')
  }
}
