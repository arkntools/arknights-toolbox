const _ = require('lodash');
const FormData = require('form-data');
const { post } = require('axios');

const { OCRSPACE_API_KEY = 'helloworld' } = process.env;

const lang = {
  cn: 'chs',
  tw: 'cht',
  us: 'eng',
  jp: 'jpn',
  kr: 'kor',
};

const errorList = {
  千员: '干员',
  滅速: '減速',
};

module.exports = (server, { buffer, originalname, mimetype, size }) => {
  const formdata = new FormData();
  formdata.append('language', lang[server]);
  formdata.append('file', buffer, { filename: originalname, contentType: mimetype, knownLength: size });
  return post('https://api.ocr.space/parse/image', formdata.getBuffer(), {
    headers: {
      ...formdata.getHeaders(),
      apikey: OCRSPACE_API_KEY,
    },
  }).then(({ data }) => {
    // eslint-disable-next-line
    console.log('ocr.space:', data);
    return data.IsErroredOnProcessing
      ? data
      : {
          words: _.flatten(
            data.ParsedResults.map(({ ParsedText }) =>
              _.reduce(
                errorList,
                (cur, correct, error) => cur.replace(new RegExp(error, 'g'), correct),
                ParsedText
              ).split(/[\r\n]+/)
            )
          ),
        };
  });
};
