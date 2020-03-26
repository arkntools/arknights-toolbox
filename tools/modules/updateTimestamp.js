const Fse = require('fs-extra');
const Path = require('path');
const dateformat = require('dateformat');

Fse.writeJSONSync(Path.join(__dirname, '../../src/data/timestamp.json'), {
  time: dateformat(new Date(), 'yyyy-m-d'),
});
