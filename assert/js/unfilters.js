/**
 * em2046
 * 2017-09-17
 */
let unfilters = {}

unfilters[0] = function (options) {
  return options.data
}

unfilters[1] = function (options) {
  let png = options.png
  let bpp = options.bpp
  let data = options.data
  let newData = Buffer.from(data)
  for (let index = 0; index < png.width; index++) {
    let offset = index * bpp
    let prevOffset = (index - 1) * bpp

    for (let j = 0; j < bpp; j++) {
      let x = newData[offset + j]
      let a

      // Left
      if (index === 0) {
        a = 0
      } else {
        a = newData[prevOffset + j]
      }

      newData[offset + j] = (x + a) & 0xFF
    }
  }
  return newData
}

unfilters[2] = function (options) {
  let bpp = options.bpp
  let lineList = options.lineList
  let heightIndex = options.heightIndex
  let data = options.data
  let png = options.png
  let newData = Buffer.from(data)

  for (let index = 0; index < png.width; index++) {
    let offset = index * bpp

    for (let j = 0; j < bpp; j++) {
      let x = newData[offset + j]
      let b

      // Up
      if (heightIndex === 0) {
        b = 0
      } else {
        b = lineList[heightIndex - 1].unfilterdData[offset + j]
      }
      newData[offset + j] = (x + b) & 0xFF
    }
  }
  return newData
}

unfilters[3] = function (options) {
  let bpp = options.bpp
  let lineList = options.lineList
  let heightIndex = options.heightIndex
  let data = options.data
  let png = options.png

  let newData = Buffer.from(data)

  for (let index = 0; index < png.width; index++) {
    let offset = index * bpp
    let prevOffset = (index - 1) * bpp

    for (let j = 0; j < bpp; j++) {
      let x = newData[offset + j]
      let a
      let b

      // Left
      if (index === 0) {
        a = 0
      } else {
        a = newData[prevOffset + j]
      }

      // Up
      if (heightIndex === 0) {
        b = 0
      } else {
        b = lineList[heightIndex - 1].unfilterdData[offset + j]
      }

      newData[offset + j] = (x + ~~((a + b) / 2)) & 0xFF
    }
  }

  return newData
}

unfilters[4] = function (options) {
  let bpp = options.bpp
  let lineList = options.lineList
  let heightIndex = options.heightIndex
  let data = options.data
  let png = options.png

  let newData = Buffer.from(data)

  for (let index = 0; index < png.width; index++) {
    let offset = index * bpp
    let prevOffset = (index - 1) * bpp

    for (let j = 0; j < bpp; j++) {
      let x = newData[offset + j]
      let a
      let b
      let c

      // Left
      if (index === 0) {
        a = 0
      } else {
        a = newData[prevOffset + j]
      }

      // Up
      if (heightIndex === 0) {
        b = 0
      } else {
        b = lineList[heightIndex - 1].unfilterdData[offset + j]
      }

      // Left and Up
      if (index === 0 || heightIndex === 0) {
        c = 0
      } else {
        c = lineList[heightIndex - 1].unfilterdData[prevOffset + j]
      }

      let pr = paethPredictor(a, b, c)
      newData[offset + j] = (x + pr) & 0xFF
    }
  }

  function paethPredictor (a, b, c) {
    let Pr
    let p = a + b - c
    let pa = Math.abs(p - a)
    let pb = Math.abs(p - b)
    let pc = Math.abs(p - c)
    if (pa <= pb && pa <= pc) {
      Pr = a
    } else if (pb <= pc) {
      Pr = b
    } else {
      Pr = c
    }
    return Pr
  }

  return newData
}

module.exports = unfilters
