/*eslint-disable */
const Axios = require('axios');
const Fse = require('fs-extra');

const ua =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';

function saveStream2File(stream, filePath) {
  return new Promise((reslove, reject) => {
    stream.pipe(Fse.createWriteStream(filePath));
    stream.on('end', () => {
      reslove();
    });
    stream.on('error', e => {
      reject(e);
    });
  });
}

function get(url, filePath, retry = 10) {
  return Axios.get(url, {
    responseType: 'stream',
    headers: { 'User-Agent': ua },
  })
    .then(r => saveStream2File(r.data, filePath))
    .catch(e => {
      if (retry === 0) {
        console.error(`ERROR ${url}`);
        throw e;
      }
      console.log(`RETRY ${url}`);
      if (Fse.existsSync(filePath)) Fse.unlinkSync(filePath);
      return get(url, filePath, retry - 1);
    });
}

function getTinied(url, filePath, retry = 10) {
  return Axios.get(url, {
    responseType: 'stream',
    headers: { 'User-Agent': ua },
  })
    .then(({ data }) =>
      Axios.post('https://tinypng.com/web/shrink', data, {
        headers: {
          'Content-Type': 'image/png',
          'User-Agent': ua,
        },
      })
    )
    .then(({ data }) =>
      Axios.get(data.output.url, {
        responseType: 'stream',
        headers: { 'User-Agent': ua },
      })
    )
    .then(({ data }) => saveStream2File(data, filePath))
    .catch(e => {
      if (retry === 0) {
        console.error(`ERROR ${url}`);
        throw e;
      }
      console.log(`RETRY ${url}`);
      if (Fse.existsSync(filePath)) Fse.unlinkSync(filePath);
      return get(url, filePath, retry - 1);
    });
}

function download(url, filePath, logText) {
  if (Fse.existsSync(filePath)) return Promise.resolve();
  if (logText) console.log(logText);
  return get(url, filePath);
}

function downloadTinied(url, filePath, logText) {
  if (Fse.existsSync(filePath)) return Promise.resolve();
  if (logText) console.log(logText);
  return getTinied(url, filePath);
}

module.exports = { download, downloadTinied };
