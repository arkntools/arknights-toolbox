const Fse = require('fs-extra');
const Path = require('path');

const date = new Date();
const time = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');

Fse.writeJSONSync(Path.join(__dirname, '../src/data/timestamp.json'), { time });
