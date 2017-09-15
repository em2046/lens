/**
 * em2046
 * 2017-09-15
 */
const fs = require('fs')
const PNGReader = require('./png-reader')

fs.readFile('./assert/png/7x7.png', (err, data) => {
  if (err) throw err
  let pngReader = new PNGReader(data)
  console.log(pngReader)
})
