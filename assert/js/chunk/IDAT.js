/**
 * em2046
 * 2017-09-15
 */
module.exports = function (data, pngReader) {
  pngReader.addDataChunk(data)
  return data
}
