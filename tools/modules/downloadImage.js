const _ = require('lodash');
const Axios = require('axios').default;
const Path = require('path');
const Fse = require('fs-extra');
const sharp = require('sharp');
const { setOutput } = require('@actions/core');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';

const getRandomIP = () => {
  return _.range(4)
    .map(() => _.random(0, 255))
    .join('.');
};

const getImageResourceURL = path =>
  `https://raw.githubusercontent.com/yuanyan3060/Arknights-Bot-Resource/main/${path}`;

/**
 * @param {{ url: string; path: string; startLog?: string; tiny?: boolean; resize?: number}} param0
 */
const downloadImage = async ({ url, path, startLog, tiny, resize }) => {
  if (Fse.existsSync(path)) return;
  if (startLog) console.log(startLog);
  // download
  let { data } = await Axios.get(url.replace(/#/g, '%23'), {
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

/**
 * @param {{ idList: string[]; dirPath: string; resPathGetter: (id: string) => string; resize?: number}} param0
 * @returns 失败ID列表
 */
const downloadImageByList = async ({ idList, dirPath, resPathGetter, resize }) => {
  Fse.ensureDirSync(dirPath);
  const missList = idList.filter(id => !Fse.existsSync(Path.join(dirPath, `${id}.png`)));
  const failedIdList = [];
  for (const id of missList) {
    const url = getImageResourceURL(resPathGetter(id));
    try {
      await downloadImage({
        url,
        path: Path.join(dirPath, `${id}.png`),
        startLog: `Download ${url} as ${id}.png`,
        tiny: true,
        resize,
      });
    } catch (error) {
      failedIdList.push(id);
      console.log(String(error));
      setOutput('need_retry', true);
    }
  }
  return failedIdList;
};

module.exports = { downloadImage, downloadImageByList };
