const runtimeCachingCacheFirstRule = reg => ({
  urlPattern: reg,
  handler: 'CacheFirst',
  options: {
    cacheableResponse: {
      statuses: [200],
    },
  },
});

module.exports = {
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
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader');
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      exclude: ['manifest.json', /\.map$/, /^assets\/img\/(avatar|material)\//, /^robots\.txt/],
      runtimeCaching: [
        runtimeCachingCacheFirstRule(/assets\/img\/(avatar|material)\//),
        runtimeCachingCacheFirstRule(/^https:\/\/cdn\.jsdelivr\.net\//),
        runtimeCachingCacheFirstRule(/^https:\/\/i\.loli\.net\//),
      ],
    },
    name: '明日方舟工具箱',
    themeColor: '#212121',
    msTileColor: '#212121',
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'assets/icons/favicon-32x32.png',
      favicon16: 'assets/icons/favicon-16x16.png',
      appleTouchIcon: 'assets/icons/apple-touch-icon.png',
      msTileImage: 'assets/icons/msapplication-icon-144x144.png',
      maskIcon: 'assets/icons/mask-icon.svg',
    },
    manifestOptions: {
      name: '明日方舟工具箱',
      short_name: '方舟工具箱',
      lang: 'zh-Hans',
      background_color: '#212121',
      description:
        '明日方舟工具箱，宗旨是简洁美观且对移动设备友好。目前功能包括：公开招募计算、精英材料计算、干员升级计算、基建技能筛选。',
      icons: [
        {
          src: './assets/icons/apple-touch-icon-57x57.png',
          sizes: '57x57',
          type: 'image/png',
        },
        {
          src: './assets/icons/apple-touch-icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: './assets/icons/apple-touch-icon-114x114.png',
          sizes: '114x114',
          type: 'image/png',
        },
        {
          src: './assets/icons/apple-touch-icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: './assets/icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: './assets/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },
  pluginOptions: {
    i18n: {
      locale: 'zh',
      fallbackLocale: 'zh',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
