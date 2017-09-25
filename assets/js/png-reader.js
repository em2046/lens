/**
 * em2046
 * 2017-09-15
 */
const assert = require('assert')
const path = require('path')
const fs = require('fs')
const zlib = require('zlib')
const reverseFilter = require('./reverse-filter')
const CRC = require('./crc')
const interlace = require('./interlace')

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]

class PNGReader {
  constructor (data, cb) {
    this._index = 0
    this._png = null
    this._colorData = null
    this._chunks = []
    this._dataChunkList = []
    this.setBuffer(data, cb)
  }

  setBuffer (buffer, cb) {
    this._buffer = buffer
    this.validateSignature()

    console.time('readNextChunk')
    while (true) {
      let chunk = this.readNextChunk()
      if (!chunk) {
        break
      }
      this._chunks.push(chunk)
    }
    console.timeEnd('readNextChunk')

    this.decodeDataChunk(cb)
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

  decodeDataChunk (cb) {
    let dataChunk = this.concatDataChunk()
    let png = this._png
    let self = this
    this.inflateDataChunk(dataChunk, function (inflateDataChunk) {
      if (png.interlaceMethod === 0) {
        self._colorData = self.interlace0(inflateDataChunk)
        cb.call(self)
      } else if (png.interlaceMethod === 1) {
        self._colorData = self.interlace1(inflateDataChunk)
        cb.call(self)
      }
    })
  }

  interlace0 (inflateDataChunk) {
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

    let line = null
    let prevLine = null
    // UnFilter
    console.time('UnFilter')
    for (let heightIndex = 0; heightIndex < height; heightIndex++) {
      line = lineList[heightIndex]
      let filter = line.filter
      line.reverseFilterData = reverseFilter[filter]({
        bpp: bpp,
        lineList: lineList,
        heightIndex: heightIndex,
        data: line.data,
        prevData: prevLine ? prevLine.reverseFilterData : null,
        png: png
      })
      prevLine = line
    }
    console.timeEnd('UnFilter')

    // To RGBA
    console.time('To RGBA')
    // let colorData = Buffer.alloc(width * height * 4)
    let colorData = new Uint8Array(width * height * 4)

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let offset = (i * width + j) * 4
        let reverseFilterData = lineList[i].reverseFilterData
        let r = reverseFilterData[j * bpp]
        let g = reverseFilterData[j * bpp + 1]
        let b = reverseFilterData[j * bpp + 2]
        let a
        if (png.alpha) {
          a = reverseFilterData[j * bpp + 3]
        } else {
          a = 0xff
        }
        colorData[offset] = r
        colorData[offset + 1] = g
        colorData[offset + 2] = b
        colorData[offset + 3] = a
      }
    }
    console.timeEnd('To RGBA')
    return colorData
  }

  interlace1 (inflateDataChunk) {
    let png = this._png
    let width = png.width
    let height = png.height
    return interlace.adam7(inflateDataChunk, width, height, png)
  }

  addDataChunk (data) {
    this._dataChunkList.push(data)
  }

  concatDataChunk () {
    return Buffer.concat(this._dataChunkList)
  }

  inflateDataChunk (dataChunk, cb) {
    return zlib.inflate(dataChunk, function (err, data) {
      if (err) {
        throw new Error(err)
      }
      cb(data)
    })
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
