import Mdui from 'mdui';
import _ from 'lodash';

const { ajax } = Mdui.JQ;

const JSON_STORAGE_BASE_URL = 'https://json.extendsclass.com/bin';

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
  createJson: (obj, apiKey) =>
    promisedAjax({
      method: 'POST',
      url: JSON_STORAGE_BASE_URL,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
      headers: { 'api-key': apiKey || 'noaccount' },
    }).then(({ id }) => id),
  getJson: async (code, apiKey) =>
    promisedAjax({
      method: 'GET',
      url: `${JSON_STORAGE_BASE_URL}/${code}`,
      dataType: 'json',
      contentType: 'application/json',
      headers: { 'api-key': apiKey || 'noaccount' },
    }),
  updateJson: async (code, obj, apiKey) =>
    promisedAjax({
      method: 'PUT',
      url: `${JSON_STORAGE_BASE_URL}/${code}`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
      headers: { 'api-key': apiKey || 'noaccount' },
    }),
};
