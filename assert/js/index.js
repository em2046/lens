/**
 * em2046
 * 2017-09-15
 */
const fs = require('fs')
const PNGReader = require('./png-reader')

let pageSingle = {
  init () {
    let canvas = document.querySelector('#canvas')
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.readPNG()
  },
  readPNG: function () {
    fs.readFile('./assert/png/7x7.png', (err, data) => {
      if (err) throw err
      let pngReader = new PNGReader(data)
      let width = pngReader._png.width
      let height = pngReader._png.height
      //debugger
      this.canvas.setAttribute('width', width)
      this.canvas.setAttribute('height', height)
      this.pngReader = pngReader
      this.renderPNG()
    })
  },
  renderPNG: function () {
    let ctx = this.ctx
    let pngReader = this.pngReader
    let uint8Arr = new Uint8ClampedArray(pngReader._colorData)
    let imgData = new ImageData(uint8Arr, pngReader._png.width, pngReader._png.height)
    createImageBitmap(imgData).then(function (img) {
      ctx.drawImage(img, 0, 0)
    })
  }
}

pageSingle.init()
