import Mdui from 'mdui';
import _ from 'lodash';
import { JSON_STORAGE_SERVER } from './env';

const { ajax } = Mdui.JQ;

const JSON_STORAGE_BASE_URL = `${JSON_STORAGE_SERVER}/material`;

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
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    }).then(r => r.json()),
  getJson: async id =>
    fetch(`${JSON_STORAGE_BASE_URL}/${id}`, { mode: 'cors' }).then(r => {
      if (r.status === 404) return null;
      if (r.status !== 200) throw new Error(r.statusText);
      return r.json();
    }),
  updateJson: async (id, obj) =>
    fetch(`${JSON_STORAGE_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    }).then(r => {
      if (r.status === 404) return false;
      if (!_.inRange(r.status, 200, 300)) throw new Error(r.statusText);
      return true;
    }),
};
