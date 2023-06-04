const { resolve, parse } = require('path');
const _ = require('lodash');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ClosurePlugin = require('./plugins/ClosurePlugin');
const dataServer = require('./tools/serveData');

const { env } = process;
if (!env.VUE_APP_SHA) {
  env.VUE_APP_SHA = env.VERCEL_GIT_COMMIT_SHA || env.CF_PAGES_COMMIT_SHA || env.COMMIT_REF || '';
}
env.VUE_APP_DIST_VERSION = `${require('dateformat')(new Date(), 'yyyymmddHHMMss')}${
  env.VUE_APP_SHA ? `-${env.VUE_APP_SHA.substr(0, 8)}` : ''
}`;

if (env.npm_lifecycle_event === 'build' && !env.VUE_APP_DATA_BASE_URL) {
  throw new Error('VUE_APP_DATA_BASE_URL env is not provided');
}

if (env.npm_lifecycle_event === 'serve' && !env.VUE_APP_DATA_BASE_URL) {
  dataServer.start();
}

const runtimeCachingRule = (reg, handler = 'CacheFirst') => ({
  urlPattern: reg,
  handler,
  options: {
    cacheableResponse: {
      statuses: [200],
    },
  },
});

const runtimeCachingRuleByURL = ({ protocol, host, pathname }, handler = 'CacheFirst') =>
  runtimeCachingRule(
    new RegExp(`^${protocol}\\/\\/${host.replace(/\./g, '\\.')}${pathname.replace(/\//g, '\\/')}`),
    handler,
  );

const singleVendorSet = new Set(['vue', 'vue-router', 'vue-i18n', 'pinia', 'lodash', 'mdui']);
const vendorMap = {
  'vue-demi': 'pinia',
  'lodash.combinations': 'lodash',
};

const config = {
  publicPath: '',
  assetsDir: 'assets',
  productionSourceMap: true,
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: env.NODE_ENV === 'production' ? 'static' : 'server',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
      }),
    ],
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: module => {
              const paths = module.context.match(/[\\/]node_modules[\\/](.*)/)[1].split(/[\\/]/);
              const name = paths[0].startsWith('@') ? `${paths[0]}/${paths[1]}` : paths[0];
              if (singleVendorSet.has(name)) return `vendors.${name}`;
              if (name in vendorMap) return `vendors.${vendorMap[name]}`;
              if (/\bvue-/.test(name)) return 'vendors.vue.addons';
              return 'vendors';
            },
            chunks: 'all',
            enforce: true,
          },
          data: {
            test: /[\\/]src[\\/]data[\\/].+\.json$/,
            name(module, chunks, cacheGroupKey) {
              let { name } = parse(module.identifier());
              if (/^item(Order)?|level$/.test(name)) name = 'common';
              return [cacheGroupKey, name].join('/');
            },
            chunks: 'all',
            enforce: true,
          },
          i18n: {
            test: /[\\/]src[\\/]locales[\\/].+\.json$/,
            name(module, chunks, cacheGroupKey) {
              const { dir } = parse(module.identifier());
              return [cacheGroupKey, _.last(dir.split(/[\\/]/))].join('/');
            },
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
    resolve: { alias: {} },
  },
  chainWebpack: config => {
    config.plugins.delete('preload').delete('prefetch');
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      importWorkboxFrom: 'local',
      skipWaiting: false,
      exclude: [
        /^\./,
        'manifest.json',
        /\.(map|zip|txt)$/,
        /^assets\/img\/other\//,
        /^assets\/icons\/shortcut-/,
        /.*\.worker.js$/,
      ],
      runtimeCaching: [
        runtimeCachingRule(/assets\/img\/other\//),
        runtimeCachingRule(/assets\/js\/.*\.worker.js/),
        runtimeCachingRuleByURL(
          new URL('https://avatars.githubusercontent.com'),
          'StaleWhileRevalidate',
        ),
      ],
    },
    name: '明日方舟工具箱',
    themeColor: '#212121',
    msTileColor: '#212121',
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'assets/icons/texas-favicon-32x32-v2.png',
      favicon16: 'assets/icons/texas-favicon-16x16-v2.png',
      appleTouchIcon: 'assets/icons/texas-apple-icon-180x180-v2.png',
      msTileImage: 'assets/icons/texas-msapplication-icon-144x144-v2.png',
      maskIcon: 'assets/icons/texas-mask-icon-16x16-v2.svg',
    },
    manifestOptions: {
      name: '明日方舟工具箱',
      short_name: '方舟工具箱',
      lang: 'zh',
      start_url: '/',
      background_color: '#212121',
      description:
        '明日方舟工具箱，全服支持，宗旨是简洁美观且对移动设备友好。目前功能包括：公开招募计算、精英材料计算、刷图规划、仓库材料识别导入、干员升级计算、基建技能筛选。',
      categories: ['tools'],
      shortcuts: [
        {
          name: '公开招募计算',
          short_name: '公开招募',
          url: '/#/hr',
          icons: [
            {
              src: 'assets/icons/shortcut-hr-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        {
          name: '精英材料计算',
          short_name: '精英材料',
          url: '/#/material',
          icons: [
            {
              src: 'assets/icons/shortcut-material-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        {
          name: '干员升级计算',
          short_name: '干员升级',
          url: '/#/level',
          icons: [
            {
              src: 'assets/icons/shortcut-level-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        {
          name: '基建技能筛选',
          short_name: '基建技能',
          url: '/#/riic',
          icons: [
            {
              src: 'assets/icons/shortcut-riic-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
      ],
      icons: [
        {
          src: 'assets/icons/texas-icon-192x192-v2.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'assets/icons/texas-icon-192x192-maskable-v2.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'assets/icons/texas-icon-512x512-v2.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'assets/icons/texas-icon-512x512-maskable-v2.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      screenshots: Array(6)
        .fill()
        .map((v, i) => ({
          src: `https://statics.arkn.lolicon.app/arknights-toolbox/screenshots/${i}.png`,
          sizes: '1380x845',
          type: 'image/png',
        })),
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'cn',
      fallbackLocale: 'cn',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/data': {
        target: 'http://127.0.0.1',
        pathRewrite: { '^/data': '' },
        router: () => `http://127.0.0.1:${dataServer.port}`,
        onProxyRes: (res, req) => {
          if (req.url.endsWith('.json')) res.headers['Cache-Control'] = 'no-cache';
        },
      },
    },
  },
};

if (env.DR_DEV) {
  config.configureWebpack.resolve.alias['@arkntools/depot-recognition'] = resolve(env.DR_DEV);
}

const runtimeCachingURLs = [
  'https://statics.arkn.lolicon.app',
  'https://i.loli.net',
  'https://fonts.loli.net',
  'https://gstatic.loli.net',
  'https://fastly.jsdelivr.net',
].map(url => new URL(url));

if (env.VUE_APP_DATA_BASE_URL) {
  console.log(`VUE_APP_DATA_BASE_URL=${env.VUE_APP_DATA_BASE_URL}`);
  const url = new URL(`${env.VUE_APP_DATA_BASE_URL}`);
  url.pathname = '/img/';
  runtimeCachingURLs.push(url);
}

if (env.NODE_ENV === 'production') {
  if (env.VUE_APP_CDN) {
    config.publicPath = env.VUE_APP_CDN;
    config.crossorigin = 'anonymous';
    const CDN_URL = new URL(env.VUE_APP_CDN);
    if (
      !runtimeCachingURLs.some(
        ({ protocol, host }) => protocol === CDN_URL.protocol && host === CDN_URL.host,
      )
    ) {
      runtimeCachingURLs.push(CDN_URL);
    }
  }
  config.configureWebpack.plugins.push(new ClosurePlugin());
}

config.pwa.workboxOptions.runtimeCaching.push(
  ...runtimeCachingURLs.map(url => runtimeCachingRuleByURL(url)),
);

module.exports = config;
