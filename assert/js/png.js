/**
 * em2046
 * 2017-09-15
 */
class PNG {
  constructor (options) {
    this.width = options.width
    this.height = options.height
    this.setBitDepth(options.bitDepth)
    this.setColourType(options.colourType)
    this.setCompressionMethod(options.compressionMethod)
    this.setFilterMethod(options.filterMethod)
    this.setInterlaceMethod(options.interlaceMethod)
  }

  setBitDepth (bitDepth) {
    this.bitDepth = bitDepth
  }

  setColourType (colourType) {
    this.colourType = colourType
    switch (colourType) {
      case 0:
        this.colors = 1
        break
      case 2:
        this.colors = 3
        break
      case 3:
        this.colors = 1
        break
      case 4:
        this.colors = 2
        this.alpha = true
        break
      case 6:
        this.colors = 4
        this.alpha = true
        break
    }
  }

  setCompressionMethod (compressionMethod) {
    this.compressionMethod = compressionMethod
  }

  setFilterMethod (filterMethod) {
    this.filterMethod = filterMethod
  }

  setInterlaceMethod (interlaceMethod) {
    this.interlaceMethod = interlaceMethod
  }
}

module.exports = PNG
