const Fse = require('fs-extra');
const Path = require('path');

Fse.writeJSONSync(Path.join(__dirname, '../../src/data/timestamp.json'), {
  time: Date.now(),
});
