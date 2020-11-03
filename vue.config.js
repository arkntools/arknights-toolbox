const { parse: parseURL } = require('url');

if (process.env.HOME === '/vercel') process.env.VUE_APP_VERCEL = '1';

const runtimeCachingRule = (reg, handler = 'CacheFirst') => ({
  urlPattern: reg,
  handler,
  options: {
    cacheableResponse: {
      statuses: [200],
    },
  },
});

const runtimeCachingRuleByURL = ({ protocol, hostname }, handler = 'CacheFirst') =>
  runtimeCachingRule(new RegExp(`^${protocol}\\/\\/${hostname.replace(/\./g, '\\.')}\\/`), handler);

const config = {
  publicPath: '',
  assetsDir: 'assets',
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
          data_common: {
            test: /[\\/]src[\\/]data[\\/](item|level)\.json/,
            name: 'data/common',
            chunks: 'all',
            enforce: true,
          },
          data: {
            test: /[\\/]src[\\/]data[\\/](?!(item|level)\.json).+\.json/,
            name: 'data/data',
            chunks: 'all',
            minSize: 1,
            maxSize: 2,
            priority: 1,
          },
          i18n_common: {
            test: /[\\/]src[\\/]locales[\\/][a-z]+[\\/](item|material|tag)\.json/,
            name: 'i18n/common',
            chunks: 'all',
            enforce: true,
          },
          i18n: {
            test: /[\\/]src[\\/]locales[\\/][a-z]+[\\/](?!(item|material|tag)\.json).+\.json/,
            name: 'i18n/i18n',
            chunks: 'all',
            minSize: 1,
            maxSize: 2,
          },
        },
      },
    },
    externals: {
      lodash: '_',
      vue: 'Vue',
      'vue-router': 'VueRouter',
      mdui: 'mdui',
      'vue-i18n': 'VueI18n',
      'vue-lazyload': 'VueLazyload',
    },
  },
  chainWebpack: config => {
    config.plugins.delete('preload').delete('prefetch');
    // config.module
    //   .rule('i18n')
    //   .resourceQuery(/blockType=i18n/)
    //   .type('javascript/auto')
    //   .use('i18n')
    //   .loader('@intlify/vue-i18n-loader');
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      exclude: ['manifest.json', /\.(map|zip|txt)$/, /^assets\/img\/(avatar|material|item|other)\//],
      runtimeCaching: [
        runtimeCachingRule(/assets\/img\/(avatar|material|item)\//),
        runtimeCachingRuleByURL(parseURL('https://avatars.githubusercontent.com'), 'StaleWhileRevalidate'),
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
      lang: 'zh-Hans',
      background_color: '#212121',
      description:
        '明日方舟工具箱，全服支持，宗旨是简洁美观且对移动设备友好。目前功能包括：公开招募计算、精英材料计算、刷图规划、干员升级计算、基建技能筛选。',
      icons: [
        {
          src: './assets/icons/texas-icon-192x192-v2.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: './assets/icons/texas-icon-192x192-maskable-v2.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: './assets/icons/texas-icon-512x512-v2.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: './assets/icons/texas-icon-512x512-maskable-v2.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
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
};

const runtimeCachingURLs = [
  'https://i.loli.net',
  'https://fonts.googleapis.cnpmjs.org',
  'https://fonts.gstatic.cnpmjs.org',
  'https://cdn.jsdelivr.net',
].map(url => parseURL(url));

const { USE_CDN, VUE_APP_CDN } = process.env;
if (USE_CDN === 'true') {
  if (!VUE_APP_CDN) throw new Error('VUE_APP_CDN env is not set');
  config.publicPath = VUE_APP_CDN;
  config.crossorigin = 'anonymous';
  const CDN_URL = parseURL(VUE_APP_CDN);
  if (
    !runtimeCachingURLs.some(({ protocol, hostname }) => protocol === CDN_URL.protocol && hostname === CDN_URL.hostname)
  ) {
    runtimeCachingURLs.push(CDN_URL);
  }
}

config.pwa.workboxOptions.runtimeCaching.push(...runtimeCachingURLs.map(url => runtimeCachingRuleByURL(url)));

module.exports = config;
