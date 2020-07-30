module.exports = require('../src/api/proxy')('https://jsonstorage.net', {
  pathRewrite: { '^/api/jsonstorage': '/api/items' },
});
