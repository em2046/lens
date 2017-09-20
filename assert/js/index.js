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
    this.bindEvent()
  },
  bindEvent: function () {
    let self = this
    document.addEventListener('dragover', function (event) {
      event.preventDefault()
    }, false)
    document.addEventListener('drop', function (event) {
      event.preventDefault()
      let files = event.dataTransfer.files
      let file = files[0]
      if (file.type === 'image/png') {
        let filePath = file.path
        console.time('read')
        self.readPNG(filePath, function () {
          console.timeEnd('read')
        })
      }
    }, false)
  },
  readPNG: function (fileName, finishCallback) {
    let canvasZoom = this.canvasZoom
    let self = this
    fs.readFile(fileName, (err, data) => {
      if (err) throw err
      self.pngReader = new PNGReader(data, function () {
        let width = this._png.width
        let height = this._png.height
        self.canvas.setAttribute('width', width * canvasZoom)
        self.canvas.setAttribute('height', height * canvasZoom)
        self.pngReader = this
        console.log(this)
        self.renderPNG(finishCallback)
      })
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
