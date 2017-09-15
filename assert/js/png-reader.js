/**
 * em2046
 * 2017-09-15
 */
const assert = require('assert')

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

class PNGReader {
  constructor (data) {
    this._index = 0
    this.chunks = {}
    this.setBuffer(data)
  }

  setBuffer (buffer) {
    this._buffer = buffer
    this.validateSignature()

    for (let i = 0; i < 10; i++) {
      let chunk = this.readNextChunk()
      if (!chunk) {
        break
      }
      console.log(chunk)
    }
  }

  readNextChunk () {
    if (this._index >= this._buffer.length) {
      return false
    }
    let length = this.readInt32(4)
    let chunkType = this.readString(4)
    let chunkData = this.readBuffer(length)
    let crc = this.readInt32(4)
    let sourceData = this.decodeChunk(chunkType, chunkData)
    this.chunks[chunkType] = sourceData

    if (chunkType === 'IHDR') {
      this._png = sourceData
    }

    return {
      length: length,
      chunkType: chunkType,
      sourceData: sourceData,
      crc: crc
    }
  }

  decodeChunk (type, data) {
    const decoder = require('./chunk/' + type)
    return decoder(data)
  }

  readBuffer (size) {
    let start = this._index
    let end = start + size
    this.validateBorder(end)
    let buffer = this._buffer.slice(start, end)
    this._index = end
    return buffer
  }

  readString (size) {
    let start = this._index
    let end = start + size
    let string = this._buffer.toString('ascii', start, end)
    this._index = end
    return string
  }

  readInt32 () {
    let start = this._index
    let end = start + 4
    this.validateBorder(end)
    let number = this._buffer.readUInt32BE(start, end)
    this._index = end
    return number
  }

  validateBorder (end) {
    if (end > this._buffer.length) {
      throw new Error('Over the border!')
    }
  }

  validateSignature () {
    let signature = this.readBuffer(8)
    assert.deepEqual(signature, PNG_SIGNATURE)
  }
}

module.exports = PNGReader
