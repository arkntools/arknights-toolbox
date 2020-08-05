const _ = require('lodash');
const express = require('express');
const http = require('http');
const multer = require('multer')();
const { baiduocrEnable, baiduocr } = require('../src/api/ocr/baidu');
const ocrspaceocr = require('../src/api/ocr/ocrspace');

const tagsData = (() => {
  const { langEnum } = require('../src/store/lang');
  return _.mapValues(langEnum, (v, lang) => Object.values(require(`../src/locales/${lang}/tag.json`)));
})();

const app = express();

const filterWords = (server, words) => _.intersection(tagsData[server], words);

app.post('*', multer.single('image'), async (req, res) => {
  const {
    body: { server },
    file,
  } = req;
  if (!file || !server) res.json({ code: 1, msg: 'Missing parameter' });

  let tags = [];
  let engine = null;
  if (baiduocrEnable && (server === 'cn' || server === 'tw')) {
    engine = 'baidu';
    const image = file.buffer.toString('base64');
    const { error_code, error_msg, words } = await baiduocr(server, image);
    if (words) tags = words;
    else {
      res.json({ code: error_code, msg: error_msg });
      return;
    }
  } else {
    engine = 'ocr.space';
    const { OCRExitCode, ErrorMessage, words } = await ocrspaceocr(server, file);
    if (words) tags = words;
    else {
      res.json({
        code: OCRExitCode,
        msg: _.castArray(ErrorMessage)
          .map(msg => (msg.endsWith('.') ? msg : `${msg}.`))
          .join(' '),
      });
      return;
    }
  }

  tags = filterWords(server, tags);
  res.json({
    code: 0,
    msg: '',
    engine,
    tags,
  });
});

module.exports = http.createServer(app);
