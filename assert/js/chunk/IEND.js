/**
 * em2046
 * 2017-09-15
 */
const assert = require('assert')

module.exports = function (data) {
  assert.ok(data.length === 0, 'The chunk\'s data field is empty')
  return null
}
