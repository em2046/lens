/* eslint-disable no-undef */
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
    this.canvasZoom = 1
    this.ctx = canvas.getContext('2d')
    console.time('rendered')
    this.readPNG(function () {
      console.timeEnd('rendered')
    })
  },
  readPNG: function (finishCallback) {
    let canvasZoom = this.canvasZoom
    fs.readFile('./assert/png/signals-adam7.png', (err, data) => {
      if (err) throw err
      let pngReader = new PNGReader(data)
      let width = pngReader._png.width
      let height = pngReader._png.height
      this.canvas.setAttribute('width', width * canvasZoom)
      this.canvas.setAttribute('height', height * canvasZoom)
      this.pngReader = pngReader
      console.log(pngReader)
      this.renderPNG(finishCallback)
    })
  },
  renderPNG: function (finishCallback) {
    let canvasZoom = this.canvasZoom
    let ctx = this.ctx
    let pngReader = this.pngReader
    let uint8Arr = new Uint8ClampedArray(pngReader._colorData)
    let png = pngReader._png
    let imgData = new ImageData(uint8Arr, png.width, png.height)
    createImageBitmap(imgData).then(function (img) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, png.width * canvasZoom, png.height * canvasZoom)
      finishCallback()
    })
  }
}

pageSingle.init()
