/**
 * em2046
 * 2017-09-15
 */
const assert = require('assert')

const PNG = require('../PNG')

/**
 * Image header
 * Width                4 bytes
 * Height               4 bytes
 * Bit depth            1 byte
 * Colour type          1 byte
 * Compression method   1 byte
 * Filter method        1 byte
 * Interlace method     1 byte
 * @param data
 * @returns {*}
 */
module.exports = function (data) {
  let width = data.readUInt32BE(0)
  let height = data.readUInt32BE(4)
  let bitDepth = data.readUInt8(8)
  let colourType = data.readUInt8(9)
  let compressionMethod = data.readUInt8(10)
  let filterMethod = data.readUInt8(11)
  let interlaceMethod = data.readUInt8(12)

  assert.notEqual(width, 0, 'Zero is an invalid value')
  assert.notEqual(height, 0, 'Zero is an invalid value')
  assert.ok([1, 2, 4, 8, 16].includes(bitDepth), 'Valid values are 1, 2, 4, 8, and 16')
  assert.ok([0, 2, 3, 4, 6].includes(colourType), 'Valid values are 0, 2, 3, 4, and 6')

  switch (colourType) {
    // Greyscale
    case 0:
      assert.ok([1, 2, 4, 8, 16].includes(bitDepth), 'Greyscale allowed bit depths are 1, 2, 4, 8, 16')
      break
    // Truecolour
    case 2:
      assert.ok([8, 16].includes(bitDepth), 'Truecolour allowed bit depths are 8, 16')
      break
    // Indexed-colour
    case 3:
      assert.ok([1, 2, 4, 8].includes(bitDepth), 'Indexed-colour allowed bit depths are 1, 2, 4, 8')
      break
    // Greyscale with alpha
    case 4:
      assert.ok([8, 16].includes(bitDepth), 'Greyscale with alpha allowed bit depths are 8, 16')
      break
    // Truecolour with alpha
    case 6:
      assert.ok([8, 16].includes(bitDepth), 'Truecolour with alpha allowed bit depths are 8, 16')
      break
  }

  assert.equal(compressionMethod, 0, 'Only compression method 0 is defined in this International Standard')
  assert.equal(filterMethod, 0, 'Only filter method 0 is defined in this International Standard')
  assert.ok([0, 1].includes(interlaceMethod), 'Two values are defined in this International Standard: 0 or 1')

  return new PNG({
    width,
    height,
    bitDepth,
    colourType,
    compressionMethod,
    filterMethod,
    interlaceMethod
  })
}
