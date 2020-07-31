import Mdui from 'mdui';
import _ from 'lodash';

const { ajax } = Mdui.JQ;

const JSONSTORAGE_URL = require('./isVercel') ? '/api/proxy/jsonstorage' : 'https://jsonstorage.net/api/items';

const promisedAjax = options =>
  new Promise((resolve, reject) => {
    ajax({
      ...options,
      success: data => resolve(data),
      error: (xhr, textStatus) => reject(textStatus || 'Network error'),
    });
  });

export default {
  get: (url, json = false) =>
    promisedAjax({
      method: 'GET',
      url,
      dataType: json ? 'json' : 'text',
    }),
  tagOCR: options => {
    const formdata = new FormData();
    _.each(options, (v, k) => formdata.append(k, v));
    return promisedAjax({
      method: 'POST',
      url: '/api/tagocr',
      processData: false,
      data: formdata,
      dataType: 'json',
      contentType: false,
    });
  },
  ocrspace: options => {
    const formdata = new FormData();
    _.each(options, (v, k) => formdata.append(k, v));
    return promisedAjax({
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      processData: false,
      data: formdata,
      dataType: 'json',
      contentType: false,
      headers: { apikey: 'helloworld' },
    });
  },
  createJson: obj =>
    promisedAjax({
      method: 'POST',
      url: JSONSTORAGE_URL,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }).then(({ uri }) => _.last(uri.split('/'))),
  getJson: id =>
    promisedAjax({
      method: 'GET',
      url: `${JSONSTORAGE_URL}/${id}`,
      dataType: 'json',
      contentType: 'application/json',
    }),
  updateJson: (id, obj) =>
    promisedAjax({
      method: 'PUT',
      url: `${JSONSTORAGE_URL}/${id}`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }),
};
