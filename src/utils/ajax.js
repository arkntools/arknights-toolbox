import Mdui from 'mdui';

const ajax = Mdui.JQ.ajax;

export default {
  get: (url, json = false) =>
    new Promise((resolve, reject) => {
      ajax({
        method: 'GET',
        url,
        dataType: json ? 'json' : 'text',
        success: data => resolve(data),
        error: (xhr, textStatus) => reject(textStatus),
      });
    }),
  lsky: file => {
    let formdata = new FormData();
    formdata.append('image', file);
    return new Promise((resolve, reject) => {
      ajax({
        method: 'POST',
        url: 'https://pic.iqy.ink/api/upload',
        processData: false,
        data: formdata,
        dataType: 'json',
        contentType: false,
        success: data => resolve(data),
        error: err => reject(err),
      });
    });
  },
  corsGet: url =>
    new Promise((resolve, reject) => {
      ajax({
        method: 'GET',
        url: `https://json2jsonp.com/?url=${encodeURIComponent(url)}`,
        dataType: 'jsonp',
        jsonp: 'callback',
        xhrFields: {
          withCredentials: true,
        },
        success: data => resolve(data),
        error: (xhr, textStatus) => reject(textStatus),
      });
    }),
  tagOCR: file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        ajax({
          method: 'POST',
          url: 'https://arkn-api.lolicon.app/ocr',
          processData: false,
          data: JSON.stringify({ image: reader.result.replace(/^data:.+;base64,/, '') }),
          dataType: 'json',
          contentType: 'application/json',
          success: data => resolve(data),
          error: (xhr, textStatus) => reject(textStatus),
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
};
