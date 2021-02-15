import Mdui from 'mdui';
import _ from 'lodash';
import B62 from './b62';
import uuid from './uuid';

const { ajax } = Mdui.JQ;

const JSON_STORAGE_BASE_URL = 'https://jsonbox.io';
const JSON_STORAGE_KEY_PREFIX = 'arknights_toolbox';

const getJsonStorageUrl = code => {
  const [bid62, rid62] = code.split('_');
  if (!bid62 || !rid62) throw new Error('Invalid sync code');
  return `${JSON_STORAGE_BASE_URL}/${JSON_STORAGE_KEY_PREFIX}_${B62.decode(bid62)}/${B62.decode(rid62)}`;
};

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
  createJson: async obj => {
    const bid = uuid();
    const { _id } = await promisedAjax({
      method: 'POST',
      url: `${JSON_STORAGE_BASE_URL}/${JSON_STORAGE_KEY_PREFIX}_${bid}`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    });
    return `${B62.encode(bid)}_${B62.encode(_id)}`;
  },
  getJson: async code =>
    promisedAjax({
      method: 'GET',
      url: getJsonStorageUrl(code),
      dataType: 'json',
      contentType: 'application/json',
    }),
  updateJson: (code, obj) =>
    promisedAjax({
      method: 'PUT',
      url: getJsonStorageUrl(code),
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }),
};
