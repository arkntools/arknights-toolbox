const { resolve, parse } = require('path');
const _ = require('lodash');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ClosurePlugin = require('./plugins/ClosurePlugin');
const PreventVercelBuildingPlugin = require('./plugins/PreventVercelBuildingPlugin');

const { env } = process;
if (!env.VUE_APP_SHA) env.VUE_APP_SHA = env.VERCEL_GIT_COMMIT_SHA || env.CF_PAGES_COMMIT_SHA || '';
env.VUE_APP_DIST_VERSION = `${require('dateformat')(new Date(), 'yyyymmddHHMMss')}${
  env.VUE_APP_SHA ? `-${env.VUE_APP_SHA.substr(0, 8)}` : ''
}`;

const runtimeCachingRule = (reg, handler = 'CacheFirst') => ({
  urlPattern: reg,
  handler,
  options: {
    cacheableResponse: {
      statuses: [200],
    },
  },
});

const runtimeCachingRuleByURL = ({ protocol, host }, handler = 'CacheFirst') =>
  runtimeCachingRule(new RegExp(`^${protocol}\\/\\/${host.replace(/\./g, '\\.')}\\/`), handler);

const config = {
  publicPath: '',
  assetsDir: 'assets',
  productionSourceMap: false,
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
            name: 'vendors',
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
              let { dir, name } = parse(module.identifier());
              dir = _.last(dir.split(/[\\/]/));
              if (/^item|material|tag$/.test(name)) name = 'common';
              else if (name === '_') name = 'main';
              return [cacheGroupKey, dir, name].join('/');
            },
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
      '@johmun/vue-tags-input': 'vueTagsInput',
      'javascript-lp-solver': 'solver',
      'js-md5': 'md5',
      'vue-gtag': 'VueGtag',
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
        'manifest.json',
        /\.(map|zip|txt)$/,
        /^assets\/img\/(avatar|item|other)\//,
        /^assets\/icons\/shortcut-/,
      ],
      runtimeCaching: [
        runtimeCachingRule(/assets\/img\/(avatar|item|other)\//),
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
          src: `https://cdn.jsdelivr.net/gh/arkntools/static-files/arknights-toolbox/screenshots/${i}.png`,
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
  },
};

if (env.DR_DEV) {
  config.configureWebpack.resolve.alias['@arkntools/depot-recognition'] = resolve(env.DR_DEV);
}

const runtimeCachingURLs = [
  'https://i.loli.net',
  'https://fonts.loli.net',
  'https://gstatic.loli.net',
  'https://fonts.googleapis.cnpmjs.org',
  'https://fonts.gstatic.cnpmjs.org',
  'https://cdn.jsdelivr.net',
  'https://code.bdstatic.com',
  'https://unpkg.com',
].map(url => new URL(url));

if (env.NODE_ENV === 'production') {
  const { USE_CDN, VUE_APP_CDN } = env;
  if (USE_CDN === 'true') {
    if (!VUE_APP_CDN) throw new Error('VUE_APP_CDN env is not set');
    config.publicPath = VUE_APP_CDN;
    config.crossorigin = 'anonymous';
    const CDN_URL = new URL(VUE_APP_CDN);
    if (
      !runtimeCachingURLs.some(
        ({ protocol, host }) => protocol === CDN_URL.protocol && host === CDN_URL.host,
      )
    ) {
      runtimeCachingURLs.push(CDN_URL);
    }
  }
  if (env.GITHUB_ACTIONS) {
    config.configureWebpack.plugins.push(new PreventVercelBuildingPlugin());
  }
  config.configureWebpack.plugins.push(new ClosurePlugin());
}

config.pwa.workboxOptions.runtimeCaching.push(
  ...runtimeCachingURLs.map(url => runtimeCachingRuleByURL(url)),
);

module.exports = config;
