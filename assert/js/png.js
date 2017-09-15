/**
 * em2046
 * 2017-09-15
 */
class PNG {
  constructor (options) {
    this.width = options.width
    this.height = options.height
    this.bitDepth = options.bitDepth
    this.colourType = options.colourType
    this.compressionMethod = options.compressionMethod
    this.filterMethod = options.filterMethod
    this.interlaceMethod = options.interlaceMethod
  }
}

module.exports = PNG
