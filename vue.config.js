module.exports = {
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
          data: {
            test: /[\\/]src[\\/]data[\\/]/,
            name: 'data',
            chunks: 'all',
            enforce: true,
          },
          i18n: {
            test: /[\\/]src[\\/]locales[\\/]/,
            name: 'i18n',
            chunks: 'all',
            enforce: true,
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
    },
  },
  chainWebpack: config => {
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader')
      .end();
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      exclude: [/\.map$/, /^manifest.*\.js$/, /^assets\/img\/(avatar|material)\//],
      runtimeCaching: [
        {
          urlPattern: /assets\/img\/(avatar|material)\//,
          handler: 'CacheFirst',
          options: {
            cacheableResponse: {
              statuses: [200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/cdn\.bootcss\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheableResponse: {
              statuses: [200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/ps\.ssl\.qhmsg\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheableResponse: {
              statuses: [200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/p1\.ssl\.qhimg\.com\//,
          handler: 'CacheFirst',
          options: {
            cacheableResponse: {
              statuses: [200],
            },
          },
        },
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
