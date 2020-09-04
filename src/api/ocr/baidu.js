const _ = require('lodash');
const Auth = require('@baiducloud/sdk/src/auth');
const qs = require('querystring');
const { post } = require('axios');

const { BAIDUBCE_API_KEY, BAIDUBCE_SECRET_KEY } = process.env;

const lang = {
  cn: 'CHN_ENG',
  tw: 'CHN_ENG',
  us: 'ENG',
  jp: 'JAP',
  kr: 'KOR',
};

module.exports = {
  baiduocrEnable: !!(BAIDUBCE_API_KEY && BAIDUBCE_SECRET_KEY),
  baiduocr: async (server, image) => {
    const auth = new Auth(BAIDUBCE_API_KEY, BAIDUBCE_SECRET_KEY);
    const now = new Date();

    const method = 'POST';
    const uri = '/rest/2.0/ocr/v1/general_basic';
    const headers = {
      host: 'aip.baidubce.com',
      'content-type': 'application/x-www-form-urlencoded',
    };

    const authorization = auth.generateAuthorization(method, uri, {}, headers, now.getTime() / 1000);

    return post(`https://${headers.host}${uri}`, qs.stringify({ image, language_type: lang[server] }), {
      headers: {
        ...headers,
        'x-bce-date': now.toISOString(),
        authorization,
      },
    }).then(({ data }) => {
      // eslint-disable-next-line
      console.log('baiduocr:', data);
      return data.error_code ? data : { words: _.map(data.words_result, 'words') };
    });
  },
};
