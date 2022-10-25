const _ = require('lodash');
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
    .catch(e => {
      if (_.get(e, 'response.status') === 404) {
        console.log(`NOT FOUND ${url}`);
        return;
      }
      if (retry <= 0) {
        console.error(`ERROR ${url}`);
        throw e;
      }
      console.log(`RETRY ${url}`);
      return get(url, retry - 1);
    });
}

module.exports = get;
