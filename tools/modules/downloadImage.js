const _ = require('lodash');
const Axios = require('axios').default;
const Fse = require('fs-extra');
const sharp = require('sharp');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';

const getRandomIP = () => {
  return _.range(4)
    .map(() => _.random(0, 255))
    .join('.');
};

/**
 * @param {{ url: string; path: string; startLog?: string; tiny?: boolean; resize?: number}} param0
 */
const downloadImage = async ({ url, path, startLog, tiny, resize }) => {
  if (Fse.existsSync(path)) return;
  if (startLog) console.log(startLog);
  // download
  let { data } = await Axios.get(url, {
    responseType: 'arraybuffer',
    headers: { 'User-Agent': UA },
  });
  data = Buffer.from(data);
  // resize
  if (resize) {
    data = await sharp(data).resize(resize).png().toBuffer();
  }
  // tiny
  if (tiny) {
    const { data: tinyResult } = await Axios.post('https://tinypng.com/web/shrink', data, {
      headers: {
        'Content-Type': 'image/png',
        'User-Agent': UA,
        'X-Forwarded-For': getRandomIP(),
      },
    });
    const { data: tinyImage } = await Axios.get(tinyResult.output.url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': UA },
    });
    data = Buffer.from(tinyImage);
  }
  Fse.writeFileSync(path, data);
};

module.exports = { downloadImage };
