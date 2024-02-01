import Mdui from 'mdui';
import _ from 'lodash';
import { IS_DEV } from './env';

const { ajax } = Mdui.JQ;

const JSON_STORAGE_BASE_URL = IS_DEV
  ? 'http://localhost:8787/material'
  : 'https://arknights-toolbox-json-storage.lolicon.app/material';

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
    const data = new FormData();
    _.each(options, (v, k) => data.append(k, v));
    return promisedAjax({
      method: 'POST',
      url: '/api/tagocr',
      processData: false,
      data,
      dataType: 'json',
      contentType: false,
    });
  },
  ocrspace: (options, apikey) => {
    const data = new FormData();
    _.each(options, (v, k) => data.append(k, v));
    return promisedAjax({
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      processData: false,
      data,
      dataType: 'json',
      contentType: false,
      headers: { apikey: apikey || 'helloworld' },
    });
  },
  createJson: obj =>
    fetch(JSON_STORAGE_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { contentType: 'application/json' },
      mode: 'cors',
    }).then(r => r.json()),
  getJson: async id =>
    fetch(`${JSON_STORAGE_BASE_URL}/${id}`, { mode: 'cors' }).then(r => r.json()),
  updateJson: async (id, obj) =>
    fetch(`${JSON_STORAGE_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { contentType: 'application/json' },
      mode: 'cors',
    }),
};
