import Mdui from 'mdui';
import _ from 'lodash';

const ajax = Mdui.JQ.ajax;

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
  // lsky: file => {
  //   const formdata = new FormData();
  //   formdata.append('image', file);
  //   return promisedAjax({
  //     method: 'POST',
  //     url: 'https://pic.iqy.ink/api/upload',
  //     processData: false,
  //     data: formdata,
  //     dataType: 'json',
  //     contentType: false,
  //   });
  // },
  // corsGet: url =>
  //   promisedAjax({
  //     method: 'GET',
  //     url: `https://json2jsonp.com/?url=${encodeURIComponent(url)}`,
  //     dataType: 'jsonp',
  //     jsonp: 'callback',
  //     xhrFields: {
  //       withCredentials: true,
  //     },
  //   }),
  tagOCR: file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        promisedAjax({
          method: 'POST',
          url: 'https://arkn-api.lolicon.app/ocr',
          processData: false,
          data: reader.result.replace(/^data:.+;base64,/, ''),
          dataType: 'json',
          contentType: 'text/plain',
        })
          .then(resolve)
          .catch(reject);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
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
      url: 'https://jsonstorage.net/api/items',
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }).then(({ uri }) => _.last(uri.split('/'))),
  getJson: id =>
    promisedAjax({
      method: 'GET',
      url: `https://jsonstorage.net/api/items/${id}`,
      dataType: 'json',
      contentType: 'application/json',
    }),
  updateJson: (id, obj) =>
    promisedAjax({
      method: 'PUT',
      url: `https://jsonstorage.net/api/items/${id}`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }),
};
