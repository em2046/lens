/**
 * em2046
 * 2017-09-15
 */
const assert = require('assert')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')
const unfilters = require('./unfilters')
const CRC = require('./crc')

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

class PNGReader {
  constructor (data) {
    this._index = 0
    this._png = null
    this._colorData = null
    this._chunks = []
    this._dataChunkList = []
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
      this._chunks.push(chunk)
    }

    this._colorData = this.decodeDataChunk()
  }

  readNextChunk () {
    if (this._index >= this._buffer.length) {
      return false
    }
    let length = this.readInt32(4)
    let chunkType = this.readBuffer(4)
    let chunkData = this.readBuffer(length)
    let CRCValue = this.readInt32(4)

    let chunkTypeString = chunkType.toString('ascii')
    let sourceData = this.decodeChunk(chunkTypeString, chunkData)
    if (chunkTypeString === 'IHDR') {
      this._png = sourceData
    }
    let typeAndData = Buffer.concat([chunkType, chunkData])
    let calculatedCRC = CRC.validateCRC(typeAndData, typeAndData.length)
    assert.ok(CRC.equal(calculatedCRC, CRCValue), 'CRC error!')

    return {
      length: length,
      chunkTypeString: chunkTypeString,
      sourceData: sourceData,
      CRCValue: CRCValue
    }
  }

  decodeChunk (type, data) {
    let moduleName = path.resolve(__dirname, './chunk/' + type + '.js')
    let moduleStat = fs.statSync(moduleName)
    if (moduleStat.isFile()) {
      const decoder = require(moduleName)
      return decoder(data, this)
    } else {
      console.log('Unknown module!')
      return data
    }
  }

  decodeDataChunk () {
    let dataChunk = this.concatDataChunk()
    let inflateDataChunk = this.inflateDataChunk(dataChunk)
    let png = this._png
    let width = png.width
    let height = png.height
    let bpp = png.colors
    let lineSize = width * bpp
    let lineFilterSize = 1
    let lineList = []

    // Scan line
    for (let index = 0; index < inflateDataChunk.length;) {
      lineList.push({
        filter: inflateDataChunk[index],
        data: inflateDataChunk.slice(index + 1, index + 1 + lineSize)
      })
      index += lineFilterSize + lineSize
    }

    // UnFilter
    for (let heightIndex = 0; heightIndex < height; heightIndex++) {
      let line = lineList[heightIndex]
      let filter = line.filter
      line.unfilterdData = unfilters[filter]({
        bpp: bpp,
        lineList: lineList,
        heightIndex: heightIndex,
        data: line.data,
        png: png
      })
    }

    // To RGBA
    let colorData = Buffer.alloc(width * height * 4)
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let offset = (i * width + j) * 4
        let r = lineList[i].unfilterdData[j * bpp]
        let g = lineList[i].unfilterdData[j * bpp + 1]
        let b = lineList[i].unfilterdData[j * bpp + 2]
        let a
        if (png.alpha) {
          a = lineList[i].unfilterdData[j * bpp + 3]
        } else {
          a = 0xff
        }
        colorData.writeUInt8(r, offset)
        colorData.writeUInt8(g, offset + 1)
        colorData.writeUInt8(b, offset + 2)
        colorData.writeUInt8(a, offset + 3)
      }
    }
    return colorData
  }

  addDataChunk (data) {
    this._dataChunkList.push(data)
  }

  concatDataChunk () {
    return Buffer.concat(this._dataChunkList)
  }

  inflateDataChunk (dataChunk) {
    return zlib.inflateSync(dataChunk)
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
