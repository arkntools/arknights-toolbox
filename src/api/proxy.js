const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (target, options = { ignorePath: true }) => {
  const app = express();
  app.use(
    createProxyMiddleware({
      target,
      changeOrigin: true,
      onProxyRes: res => delete res.headers['set-cookie'],
      ...options,
    })
  );
  return http.createServer(app);
};
