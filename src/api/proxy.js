const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app, name, url, options = {}) => {
  const { origin, pathname } = new URL(url);
  const route = `/api/proxy/${name}`;
  app.use(
    route,
    createProxyMiddleware({
      target: origin,
      changeOrigin: true,
      onProxyRes: res => delete res.headers['set-cookie'],
      pathRewrite: { [`^${route}`]: pathname },
      ...options,
    })
  );
};
