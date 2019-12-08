module.exports = {
  publicPath: '',
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          data: {
            test: /[\\/]src[\\/]data[\\/]/,
            name: 'data',
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
    },
  },
  pwa: {
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://cdn\\.bootcss\\.com/'),
          handler: 'CacheFirst',
          options: {
            cacheableResponse: {
              statuses: [0, 200],
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
      description: '明日方舟工具箱，宗旨是简洁美观且对移动设备友好。目前功能包括：公开招募计算、精英材料计算、干员升级计算、基建技能筛选。',
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
};
