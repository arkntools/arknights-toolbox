/*eslint-disable */
const Axios = require('axios');

function get(url, retry = 10) {
  return Axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    },
  })
    .then(r => {
      console.log(`GET ${url}`);
      return r.data;
    })
    .catch(() => {
      if (retry === 0) throw new Error('Get failed.');
      console.log('Retry.');
      return get(url, retry - 1);
    });
}

module.exports = get;
