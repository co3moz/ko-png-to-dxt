#!/usr/bin/env node
/* eslint-disable no-process-exit, no-empty */
const packageJson = require('../package.json');
const program = require('commander');
const png2dxt = require('../lib/png2dxt');
const path = require('path');
const fs = require('fs');

program
  .usage('<file>')
  .option('-o, --output [value]', 'output file name')
  .option('-f, --format [value]', 'output format', /^(a8r8g8b8|x8r8g8b8|a4r4g4b4|a1r5g5b5|dxt1|dxt3|dxt5)$/, 'a8r8g8b8')
  .option('-d, --directory', 'look cwd and convert all .dxt files')

program
  .version(packageJson.version)
  .parse(process.argv);

if (program.directory) {
  let dirLocation = path.resolve(process.cwd());
  let files = fs.readdirSync(dirLocation).filter(file => file.endsWith('.png'));

  if (files.length == 0) {
    console.log('no .png files found!');
    return;
  }

  (async () => {
    let i = 0;
    for (let file of files) {
      i++;

      let location = path.resolve(dirLocation, file);
      let output = path.resolve(program.output ? program.output : path.dirname(location), path.basename(location, '.png') + '.dxt');

      try {
        let outCheck = fs.statSync(output);
        if (outCheck) {
          console.log(parseInt(i / files.length * 100) + '% | ' + location + ' file is already converted skipping this one! ' + output)
          continue;
        }
      } catch (e) {

      }

      await png2dxt(location, output, program.format)
      console.log(parseInt(i / files.length * 100) + '% | ' + location);
    }

    console.log('I looked every file and I could converted %i of them', i);
  })().catch(x => console.error(x));

  return;
}

if (!program.args.length) return program.help();

let arg = program.args[0];
let location = path.resolve(arg);
let output = path.resolve(path.dirname(location), path.basename(location, '.png') + '.dxt');
if (program.output) {
  output = path.resolve(program.output);
}

try {
  let outCheck = fs.statSync(output);
  if (outCheck) {
    console.error('output file is already existed ' + output)
    process.exit(1);
  }
} catch (e) {

}

png2dxt(location, output, program.format).then(x => console.log(location, 'format: ' + (program.format || 'a8r8g8b8'))).catch(x => {
  if (x.message == 'Invalid file signature') {
    console.error('an Error ocurred!, please validate your png file.')
  } else {
    console.error('an Error occurred!, ' + x.message);
  }
})
