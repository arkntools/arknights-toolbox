import Mdui from 'mdui';
import _ from 'lodash';
import uuid62 from './uuid62';

const { ajax } = Mdui.JQ;

const JSON_STORAGE_BASE_URL = 'https://jsonstorage.net';

const promisedAjax = options =>
  new Promise((resolve, reject) => {
    ajax({
      ...options,
      success: data => resolve(data),
      error: reject,
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
      url: `${JSON_STORAGE_BASE_URL}/api/items`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }).then(({ uri }) => uuid62.encode(_.last(uri.split('/')))),
  getJson: code =>
    promisedAjax({
      method: 'GET',
      url: `${JSON_STORAGE_BASE_URL}/api/items/${uuid62.decode(code)}`,
      dataType: 'json',
      contentType: 'application/json',
    }),
  updateJson: (code, obj) =>
    promisedAjax({
      method: 'PUT',
      url: `${JSON_STORAGE_BASE_URL}/api/items/${uuid62.decode(code)}`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }),
};
