/**
 * em2046
 * 2017-09-18
 */
const reverseFilter = require('./reverse-filter')

class interlace {
  static min (a, b) {
    if (a < b) {
      return a
    } else {
      return b
    }
  }

  static adam7 (data, width, height, png) {
    let bpp = png.colors
    let startingRow = [0, 0, 4, 0, 2, 0, 1]
    let startingCol = [0, 4, 0, 2, 0, 1, 0]
    let rowIncrement = [8, 8, 8, 4, 4, 2, 2]
    let colIncrement = [8, 8, 4, 4, 2, 2, 1]
    let pass
    let row, col
    // let colorData = Buffer.alloc(width * height * 4)
    let colorData = new Uint8Array(width * height * 4)
    let inputOffset = 0
    let prevInputOffset = 0
    let heightIndex = 0
    let scanLine = null
    let prevScanLine = null
    let filterType = null
    let scanLineData
    let scanLineDataList = []

    pass = 0
    while (pass < 7) {
      heightIndex = 0
      prevScanLine = null
      row = startingRow[pass]
      while (row < height) {
        col = startingCol[pass]
        filterType = data[inputOffset]
        inputOffset += 1
        prevInputOffset = inputOffset
        while (col < width) {
          inputOffset += bpp
          col = col + colIncrement[pass]
        }
        scanLine = data.slice(prevInputOffset, inputOffset)
        scanLineData = reverseFilter[filterType]({
          bpp: bpp,
          heightIndex: heightIndex,
          data: scanLine,
          prevData: prevScanLine,
          png: png
        })
        heightIndex++
        prevScanLine = scanLineData
        scanLineDataList.push(scanLineData)
        row = row + rowIncrement[pass]
      }
      pass = pass + 1
    }

    // reInit
    inputOffset = 0
    heightIndex = 0
    scanLine = null
    prevScanLine = null
    filterType = null
    let scanLineBuffer = Buffer.concat(scanLineDataList)
    pass = 0
    while (pass < 7) {
      row = startingRow[pass]
      while (row < height) {
        col = startingCol[pass]
        heightIndex++
        while (col < width) {
          for (let i = 0; i < bpp; i++) {
            colorData[row * width * 4 + col * 4 + i] = scanLineBuffer[inputOffset + i]
          }
          if (bpp < 4) {
            colorData[row * width * 4 + col * 4 + 3] = 255
          }
          inputOffset += bpp
          col = col + colIncrement[pass]
        }
        row = row + rowIncrement[pass]
      }
      pass = pass + 1
    }
    return colorData
  }
}

module.exports = interlace
