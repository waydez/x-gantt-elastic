const utils = require('../build/utils')
module.exports = {
  resolve: ['.js', '.vue', '.json', '.svg'],
  alias: {
    '@': utils.resolve('../src'),
    '@packages': utils.resolve('../packages'),
    '@x-gantt-elastic': utils.resolve('../')
  }
}
