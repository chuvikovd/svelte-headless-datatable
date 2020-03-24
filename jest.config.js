const waitForExpect = require('wait-for-expect')

module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  globals: {
    waitForExpect
  }
}
