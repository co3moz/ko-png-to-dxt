const fs = require('fs');
const path = require('path');
const onlyBuffer = require('../lib/onlyBuffer');

(async () => {
  let files = await new Promise((resolve, reject) => fs.readdir(__dirname, (err, files) => err ? reject(err) : resolve(files)));

  for (let file of files) {
    if (!file.endsWith('.png')) continue;

    let data = await new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, file), (err, buffer) => {
        if (err) return reject(err);


        (async () => {
          let size = 0;
          for (let format of ['a8r8g8b8', 'a1r5g5b5', 'a4r4g4b4', 'x8r8g8b8', 'dxt1', 'dxt3', 'dxt5']) {
            let begin = process.hrtime();
            let data = await onlyBuffer(buffer, { format });
            if (!size) {
              size = data.length;
            }
            let time = process.hrtime(begin).reduce((n, x, i) => i == 0 ? x * 1000 : n + x / 1e6, 0);

            console.log('done %s, time: %sms, format: %s, size: %s, ratio: %s', file, time, format, data.length, data.length / size);
          }
        })().then(x => resolve(x))
          .catch(x => reject(x))
      });
    });

  }
})().catch(err => {
  console.error('TEST FAILED!');
  console.error(err);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});