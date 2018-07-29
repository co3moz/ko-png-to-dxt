const dxt = require('dxt');
const fs = require('fs');
const { PNG } = require('node-png');

module.exports = function png2dxt(file, outputLocation, format) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(new PNG({
        filterType: 4
      }))
      .on('parsed', function () {
        let { width, height, data } = this;

        if (!checkSize(width) || !checkSize(height)) {
          return reject(new Error('Width or Height should be power of 2 (supported ones are 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048)'));
        }

        let imageData;
        let formatData;
        console.log(format);
        if (!format || format == 'a8r8g8b8') {
          imageData = Buffer.allocUnsafe(data.length);

          for (let i = 0; i < data.length; i += 4) {
            imageData[i + 0] = data[i + 2]; // b
            imageData[i + 1] = data[i + 1]; // g
            imageData[i + 2] = data[i + 0]; // r
            imageData[i + 3] = data[i + 3]; // a 
          }

          formatData = Buffer.from([21, 0, 0, 0, 0, 0, 0, 0]);
        } else if (format == 'x8r8g8b8') {
          imageData = Buffer.allocUnsafe(data.length);

          for (let i = 0; i < data.length; i += 4) {
            imageData[i + 0] = data[i + 2]; // b
            imageData[i + 1] = data[i + 1]; // g
            imageData[i + 2] = data[i + 0]; // r
            imageData[i + 3] = 255; // a 
          }

          formatData = Buffer.from([22, 0, 0, 0, 0, 0, 0, 0]);
        } else if (format == 'a4r4g4b4') {
          imageData = Buffer.allocUnsafe(data.length / 2);

          for (let i = 0; i < data.length; i += 4) {
            let r = (data[i + 0] >> 4) & 0xF; // 4bit
            let b = (data[i + 2] >> 4) & 0xF; // 4bit
            let g = (data[i + 1] >> 4) & 0xF; // 4bit
            let a = (data[i + 3] >> 4) & 0xF; // 4bit

            imageData[i / 2] = b + (g << 4); // b4 + g4
            imageData[i / 2 + 1] = r + (a << 4); // r4 + a4
          }

          formatData = Buffer.from([26, 0, 0, 0, 0, 0, 0, 0]);
        } else if (format == 'a1r5g5b5') {
          imageData = Buffer.allocUnsafe(data.length / 2);

          for (let i = 0; i < data.length; i += 4) {
            let r = (data[i + 0] >> 3) & 0b11111; // 5bit
            let g = (data[i + 1] >> 3) & 0b11111; // 5bit
            let b = (data[i + 2] >> 3) & 0b11111; // 5bit
            let a = data[i + 3] & 0x80; // 1bit

            let v = b + (g << 5) + (r << 10) + (a << 8);
            imageData[i / 2] = v & 0xFF; // b5 + g3
            imageData[i / 2 + 1] = v >> 8; // g2 r5 a1
          }

          formatData = Buffer.from([25, 0, 0, 0, 0, 0, 0, 0]);
        } else if (format == 'dxt1') {
          imageData = dxt.compress(data, width, height, dxt.kDxt1);
          formatData = Buffer.from([0x44, 0x58, 0x54, 0x31, 0x01, 0, 0, 0]);
        } else if (format == 'dxt3') {
          imageData = dxt.compress(data, width, height, dxt.kDxt3);
          formatData = Buffer.from([0x44, 0x58, 0x54, 0x33, 0x01, 0, 0, 0]);
        } else if (format == 'dxt5') {
          imageData = dxt.compress(data, width, height, dxt.kDxt5);
          formatData = Buffer.from([0x44, 0x58, 0x54, 0x35, 0x01, 0, 0, 0]);
        } else {
          return reject(new Error('unknown format "' + format + '"!'));
        }

        let name = 'png2dxt;' + Date.now() + ';' + file;

        let bufferLength = 4 /* image length int 4 byte */ + name.length + 4 /* NTF */ + 4 /* width */ + 4 /* height */ + 8 /* type data */ + imageData.length;
        let outputBuffer = Buffer.allocUnsafe(bufferLength);
        let offset = 0;

        // name length
        outputBuffer.writeInt32LE(name.length, offset);
        offset += 4

        // name
        outputBuffer.write(name, offset);
        offset += name.length;

        // NTF
        outputBuffer[offset] = 0x4E;
        outputBuffer[offset + 1] = 0x54;
        outputBuffer[offset + 2] = 0x46;
        outputBuffer[offset + 3] = 0x03;
        offset += 4;

        // width
        outputBuffer.writeInt32LE(width, offset);
        offset += 4;

        // height
        outputBuffer.writeInt32LE(height, offset);
        offset += 4;

        // format
        formatData.copy(outputBuffer, offset);
        offset += formatData.length;

        // data
        imageData.copy(outputBuffer, offset);

        fs.writeFile(outputLocation, outputBuffer, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      })
      .on('error', function (err) {
        reject(err);
      });
  });
}

function checkSize(size) {
  if (size == 4) return true;
  if (size == 8) return true;
  if (size == 16) return true;
  if (size == 32) return true;
  if (size == 64) return true;
  if (size == 128) return true;
  if (size == 256) return true;
  if (size == 512) return true;
  if (size == 1024) return true;
  if (size == 2048) return true;

  return false;
}