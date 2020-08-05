const express = require('express');
const http = require('http');
const useProxyMiddleware = require('../src/api/proxy');

const app = express();

// useProxyMiddleware(app, 'penguin-stats', 'https://penguin-stats.io/PenguinStats/api/v2/result/matrix');
useProxyMiddleware(app, 'jsonstorage', 'https://jsonstorage.net/api/items');

module.exports = http.createServer(app);
