const { parse: parseURL } = require('url');

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
  crossorigin: 'anonymous',
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
      exclude: ['manifest.json', /\.map$/, /^assets\/img\/(avatar|material)\//, /^robots\.txt/],
      runtimeCaching: [
        runtimeCachingRule(/assets\/img\/(avatar|material)\//),
        runtimeCachingRuleByURL(parseURL('https://avatars.githubusercontent.com'), 'StaleWhileRevalidate'),
      ],
    },
    name: '明日方舟工具箱',
    themeColor: '#212121',
    msTileColor: '#212121',
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'assets/icons/favicon-32x32.png',
      favicon16: 'assets/icons/favicon-16x16.png',
      appleTouchIcon: 'assets/icons/apple-touch-icon-180x180.png',
      msTileImage: 'assets/icons/msapplication-icon-144x144.png',
      maskIcon: 'assets/icons/mask-icon-16x16.svg',
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
          src: './assets/icons/default-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: './assets/icons/default-icon-192x192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: './assets/icons/default-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: './assets/icons/default-icon-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'zh',
      fallbackLocale: 'zh',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
};

const runtimeCachingURLs = ['https://i.loli.net', 'https://cdn.jsdelivr.net'].map(url => parseURL(url));

const { USE_CDN, VUE_APP_CDN } = process.env;
if (USE_CDN === 'true') {
  if (VUE_APP_CDN) {
    config.publicPath = VUE_APP_CDN;
    const CDN_URL = parseURL(VUE_APP_CDN);
    if (
      !runtimeCachingURLs.some(
        ({ protocol, hostname }) => protocol === CDN_URL.protocol && hostname === CDN_URL.hostname
      )
    ) {
      runtimeCachingURLs.push(VUE_APP_CDN);
    }
  } else throw new Error('VUE_APP_CDN env is not set');
}

config.pwa.workboxOptions.runtimeCaching.push(...runtimeCachingURLs.map(url => runtimeCachingRuleByURL(url)));

module.exports = config;
