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
        error: err => reject(err),
      });
    }),
  smms: file => {
    let formdata = new FormData();
    formdata.append('smfile', file);
    return new Promise((resolve, reject) => {
      ajax({
        method: 'POST',
        url: 'https://sm.ms/api/upload',
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
        error: err => reject(err),
      });
    }),
};
