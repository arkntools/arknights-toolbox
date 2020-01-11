import Mdui from 'mdui';

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
  lsky: file => {
    let formdata = new FormData();
    formdata.append('image', file);
    return promisedAjax({
      method: 'POST',
      url: 'https://pic.iqy.ink/api/upload',
      processData: false,
      data: formdata,
      dataType: 'json',
      contentType: false,
    });
  },
  corsGet: url =>
    promisedAjax({
      method: 'GET',
      url: `https://json2jsonp.com/?url=${encodeURIComponent(url)}`,
      dataType: 'jsonp',
      jsonp: 'callback',
      xhrFields: {
        withCredentials: true,
      },
    }),
  tagOCR: file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        promisedAjax({
          method: 'POST',
          url: 'https://arkn-api.lolicon.app/ocr',
          processData: false,
          data: JSON.stringify({ image: reader.result.replace(/^data:.+;base64,/, '') }),
          dataType: 'json',
          contentType: 'application/json',
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
  createMyjson: obj =>
    promisedAjax({
      method: 'POST',
      url: 'https://api.myjson.com/bins',
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }),
  getMyjson: id =>
    promisedAjax({
      method: 'GET',
      url: `https://api.myjson.com/bins/${id}`,
      dataType: 'json',
      contentType: 'application/json',
    }),
  updateMyjson: (id, obj) =>
    promisedAjax({
      method: 'PUT',
      url: `https://api.myjson.com/bins/${id}`,
      processData: false,
      data: JSON.stringify(obj),
      dataType: 'json',
      contentType: 'application/json',
    }),
};
