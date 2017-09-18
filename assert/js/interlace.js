/**
 * em2046
 * 2017-09-18
 */
class interlace {
  static min (a, b) {
    if (a < b) {
      return a
    } else {
      return b
    }
  }

  static pass (data, width, height) {
    let startingRow = [0, 0, 4, 0, 2, 0, 1]
    let startingCol = [0, 4, 0, 2, 0, 1, 0]
    let rowIncrement = [8, 8, 8, 4, 4, 2, 2]
    let colIncrement = [8, 8, 4, 4, 2, 2, 1]
    let pass
    let row, col

    let colorData = Buffer.alloc(width * height * 4)

    let inputOffset = 0

    pass = 0
    while (pass < 7) {
      row = startingRow[pass]
      while (row < height) {
        col = startingCol[pass]

        // TODO unFilter
        console.log(data[inputOffset])
        inputOffset += 1

        while (col < width) {
          colorData[row * width * 4 + col * 4] = data[inputOffset]
          colorData[row * width * 4 + col * 4 + 1] = data[inputOffset + 1]
          colorData[row * width * 4 + col * 4 + 2] = data[inputOffset + 2]
          colorData[row * width * 4 + col * 4 + 3] = data[inputOffset + 3]
          inputOffset += 4
          col = col + colIncrement[pass]
        }
        row = row + rowIncrement[pass]
      }
      pass = pass + 1
    }
    return colorData
  }

  static adam7 (width, height, visit) {
    let startingRow = [0, 0, 4, 0, 2, 0, 1]
    let startingCol = [0, 4, 0, 2, 0, 1, 0]
    let rowIncrement = [8, 8, 8, 4, 4, 2, 2]
    let colIncrement = [8, 8, 4, 4, 2, 2, 1]
    let blockHeight = [8, 8, 4, 4, 2, 2, 1]
    let blockWidth = [8, 4, 4, 2, 2, 1, 1]

    let pass
    let row, col

    pass = 0
    while (pass < 7) {
      row = startingRow[pass]
      while (row < height) {
        col = startingCol[pass]

        while (col < width) {
          visit(row, col,
            interlace.min(blockHeight[pass], height - row),
            interlace.min(blockWidth[pass], width - col))
          col = col + colIncrement[pass]
        }
        row = row + rowIncrement[pass]
      }
      pass = pass + 1
    }
  }
}

module.exports = interlace
