/**
 * em2046
 * 2017-09-16
 */
let CRCTable = new Array(256)
let CRCTableComputed = 0

class CRC {
  static validateCRC (buffer, size) {
    return CRC.updateCRC(0xffffffff, buffer, size) ^ 0xffffffff
  }

  static updateCRC (CRCValue, buffer, size) {
    let c = CRCValue
    let n

    if (!CRCTableComputed) {
      CRC.makeCRCTable()
    }
    for (n = 0; n < size; n++) {
      c = CRCTable[(c ^ buffer[n]) & 0xff] ^ (c >>> 8)
    }
    return c
  }

  static makeCRCTable () {
    let c
    let n, k

    for (n = 0; n < 256; n++) {
      c = n
      for (k = 0; k < 8; k++) {
        if (c & 1) {
          c = 0xedb88320 ^ (c >>> 1)
        } else {
          c = c >>> 1
        }
      }
      CRCTable[n] = c
    }
    CRCTableComputed = 1
  }

  static equal (someCRC, anotherCRC) {
    return someCRC ^ anotherCRC === 0
  }
}

module.exports = CRC
