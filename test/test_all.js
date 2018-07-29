const fs = require('fs');
const path = require('path');
const png2dxt = require('../lib/png2dxt');

(async () => {
  let files = await new Promise((resolve, reject) => fs.readdir(__dirname, (err, files) => err ? reject(err) : resolve(files)));

  for (let file of files) {
    if (!file.endsWith('.png')) continue;
    await png2dxt(path.resolve(__dirname, file), path.resolve(__dirname, './results/', path.basename(file, '.png') + '.dxt'), path.basename(file, '.png'));
  }
})().catch(err => {
  console.error('TEST FAILED!');
  console.error(err);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});