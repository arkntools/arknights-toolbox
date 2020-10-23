import Vue from 'vue';
import VueGtag from 'vue-gtag';
import Mdui from 'mdui';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import VueLazyload from 'vue-lazyload';
import i18n from './i18n';
import _ from 'lodash';
import darkmodejs from '@yzfe/darkmodejs';
import { locales, langEnum, langMigration } from './store/lang';
import safelyParseJSON from './utils/safelyParseJSON';

import IS_VERCEL from './utils/isVercel';

const cdnPublicPath = process.env.VUE_APP_CDN;

if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
  window.$ = Mdui.JQ;
}
Vue.use(VueLazyload, {
  preLoad: 2,
  lazyComponent: true,
});

Vue.prototype.$_ = _;
Vue.prototype.$now = _.now;
Vue.prototype.$$ = Mdui.JQ;
Vue.prototype.$mutationNextTick = function (...argu) {
  this.$nextTick(() => Mdui.mutation(...argu));
};
for (const key of ['mutation', 'alert', 'snackbar', 'prompt', 'confirm', 'Dialog', 'Drawer', 'Tab', 'Select']) {
  Vue.prototype[`$${key}`] = Mdui[key];
}

const requireComponent = require.context('./components', false, /\/_.+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = _.upperFirst(_.camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, '$1')));
  Vue.component(componentName, componentConfig.default || componentConfig);
});

const $ = Mdui.JQ;

router.afterEach((to, from) => {
  if (from.name) localStorage.setItem('lastPage', to.path);
  $('body').attr('tab', to.name);
  Vue.nextTick(() => {
    $('.router-link-active:not(.router-root)').addClass('mdui-tab-active');
    $(window).trigger('mduiTabInit');
  });
});

const classObj2ClassName = obj =>
  Object.entries(obj)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(' ');

Vue.directive('theme-class', function (el, { value: [lightClass = null, darkClass = null] }, vnode) {
  const classes = [
    vnode.data.staticClass,
    classObj2ClassName(_.get(vnode, 'data.class', {})),
    _.get(vnode, 'parent.data.staticClass', ''),
    classObj2ClassName(_.get(vnode, 'parent.data.class', {})),
    vnode.context.$root.dark ? darkClass : lightClass,
  ];
  el.className = classes.filter(cn => cn).join(' ');
});

if (process.env.VUE_APP_GTAG) {
  Vue.use(VueGtag, { config: { id: process.env.VUE_APP_GTAG } }, router);
  // 异常上报
  Vue.config.errorHandler = (err, vm, info) => {
    // eslint-disable-next-line
    console.error(err);
    // eslint-disable-next-line
    console.error(`Info: ${info}`);
    vm.$gtag.event('exception', {
      description: `${err} | Info: ${info}`,
      fatal: false,
    });
  };
} else {
  Vue.prototype.$gtag = { event: () => {} };
}

new Vue({
  router,
  render: h => h(App),
  data: {
    color: {
      tagBtnHead: ['mdui-color-teal', 'mdui-color-teal-300'],
      redBtn: ['mdui-color-red', 'mdui-color-indigo-a100 mdui-ripple-black'],
      pinkBtn: ['mdui-color-pink-accent', 'mdui-color-indigo-a100 mdui-ripple-black'],
      pinkText: ['mdui-text-color-pink-accent', 'mdui-text-color-pink-a100'],
      dialogTransparentBtn: [null, 'mdui-text-color-indigo-a100'],
    },
    screenWidth: 0,
    nm: false,
    deferredPrompt: false,
    setting: {
      rememberLastPage: true,
      // imageCDN: process.env.NODE_ENV === 'production',
      darkTheme: true,
      darkThemeFollowSystem: true,
    },
    systemDarkTheme: false,
    i18n: null,
    locales,
    localeEnum: langEnum,
    materialListRendering: true,
    themeEnum: {
      light: 0,
      dark: 1,
      followSystem: 2,
    },
    importItemsListening: false,
  },
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('home.setting', JSON.stringify(val));
      },
      deep: true,
    },
    locale(lang) {
      this.updateTitle();
      this.$emit('tab-need-updated');
      localStorage.setItem('home.lang', lang);
    },
    'setting.darkTheme'() {
      this.updatedarkTheme();
    },
    'setting.darkThemeFollowSystem'() {
      this.updatedarkTheme();
    },
    systemDarkTheme() {
      this.updatedarkTheme();
    },
  },
  methods: {
    routeIs(name) {
      return this.$route.name === name;
    },
    avatar(name) {
      return `${this.staticBaseURL}assets/img/avatar/${name}.png`;
    },
    materialImage(name) {
      return `${this.staticBaseURL}assets/img/item/${name}.png`;
    },
    calcSize(size) {
      const unit = ['B', 'KB', 'MB'];
      let lv = 0;
      while (size > 1024 && lv < 2) {
        size /= 1024;
        lv++;
      }
      return `${size.toFixed(2)} ${unit[lv]}`;
    },
    installPWA() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(choiceResult => {
          this.$gtag.event(`a2hs_prompt_${choiceResult.outcome}`, {
            event_category: 'a2hs',
            event_label: 'prompt',
          });
          this.deferredPrompt = false;
        });
      }
    },
    isImplementedChar(name) {
      return name in this.localeMessages.character;
    },
    isImplementedMaterial(name) {
      return name in this.localeMessages.material;
    },
    updateTitle() {
      document.title = this.$t('app.title');
    },
    updatedarkTheme() {
      const $body = $('body');
      if (this.dark) {
        $body.removeClass('mdui-theme-accent-pink');
        $body.addClass('mdui-theme-layout-dark mdui-theme-accent-indigo');
      } else {
        $body.removeClass('mdui-theme-layout-dark mdui-theme-accent-indigo');
        $body.addClass('mdui-theme-accent-pink');
      }
    },
    localeIs(locale) {
      return this.locale === locale;
    },
    localeNot(locales = []) {
      return !locales.includes(this.locale);
    },
    getWikiHref({ name, appellation }) {
      if (!(name && appellation)) return '';
      const getLocaleName = (locale = this.locale) => this.$i18n.messages[locale].character[name];
      switch (this.locale) {
        case 'cn':
        case 'tw':
          return `http://prts.wiki/w/${getLocaleName('cn')}`;
        case 'jp':
          return `https://wiki.gamerclub.jp/anwiki/index.php?title=${getLocaleName()}`;
        case 'kr':
          return `https://namu.wiki/w/${getLocaleName()}(명일방주)`;
        default:
          return `https://gamepress.gg/arknights/operator/${appellation.toLowerCase()}`;
      }
    },
    pureName(name) {
      return name.toLowerCase?.().replace(/ /g, '');
    },
    getSearchGroup({ name, appellation, pinyin: { full, head }, romaji }) {
      if (this.localeZH) {
        return [head, full, this.pureName(this.$t(`character.${name}`)), this.pureName(appellation), romaji];
      } else if (this.localeIs('jp')) {
        return [romaji, this.pureName(this.$t(`character.${name}`)), this.pureName(appellation), head, full];
      }
      return [this.pureName(this.$t(`character.${name}`)), this.pureName(appellation), romaji, head, full];
    },
  },
  created() {
    // $('html').attr('l', this.locale);
    this.updatedarkTheme();
    this.updateTitle();

    darkmodejs({
      onChange: (activeTheme, { DARK }) => {
        this.systemDarkTheme = activeTheme === DARK;
      },
    });

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
    const setting = localStorage.getItem('home.setting');
    const lastPage = localStorage.getItem('lastPage');
    if (setting) this.setting = _.assign({}, this.setting, _.pick(safelyParseJSON(setting), _.keys(this.setting)));

    const initPath = location.hash.substr(1) || '/';
    if (this.setting.rememberLastPage && lastPage && initPath === '/' && lastPage !== '/') router.replace(lastPage);
    else if (initPath !== '/') localStorage.setItem('lastPage', initPath);

    const lang = localStorage.getItem('home.lang');
    if (lang) this.locale = langMigration[lang] || lang;

    // 禁止 iOS 缩放
    (() => {
      document.addEventListener(
        'touchstart',
        event => {
          if (event.touches.length > 1) {
            event.preventDefault();
          }
        },
        { passive: false }
      );
      let lastTouchEnd = 0;
      document.addEventListener(
        'touchend',
        event => {
          const now = new Date().getTime();
          if (now - lastTouchEnd <= 300) {
            event.preventDefault();
          }
          lastTouchEnd = now;
        },
        false
      );
    })();
  },
  mounted() {
    this.screenWidth = $('body').width();
    window.onresize = () => {
      this.screenWidth = $('body').width();
    };
    $('#footer').css('display', 'block');
    // if (this.isMobile()) $('body').attr('mobile', true);
  },
  computed: {
    canUseCDN() {
      return !!cdnPublicPath;
    },
    isCDNEnable() {
      // return this.setting.imageCDN && this.canUseCDN;
      return this.canUseCDN;
    },
    staticBaseURL() {
      return this.isCDNEnable ? cdnPublicPath : '';
    },
    smallScreen() {
      return this.$root.screenWidth <= 450;
    },
    locale: {
      get() {
        return this.$i18n.locale;
      },
      set(val) {
        this.$i18n.locale = val;
      },
    },
    localeSelectKey() {
      return this.locale + Date.now();
    },
    localeCN() {
      return this.locale === 'cn';
    },
    localeTW() {
      return this.locale === 'tw';
    },
    localeZH() {
      return this.localeCN || this.localeTW;
    },
    localeNotZH() {
      return !this.localeZH;
    },
    localeName() {
      return this.locales.find(({ short }) => short === this.locale).long;
    },
    localeNameSimple() {
      return this.localeName.includes('中文') ? '中文' : this.localeName;
    },
    localeMessages() {
      return this.$i18n.messages[this.locale];
    },
    dark() {
      const { darkTheme, darkThemeFollowSystem } = this.setting;
      return darkTheme && (!darkThemeFollowSystem || (darkThemeFollowSystem && this.systemDarkTheme));
    },
    themeSetting: {
      get() {
        const { light, dark, followSystem } = this.themeEnum;
        const { darkTheme, darkThemeFollowSystem } = this.setting;
        if (darkTheme) {
          if (darkThemeFollowSystem) return followSystem;
          return dark;
        }
        return light;
      },
      set(val) {
        const { light, dark, followSystem } = this.themeEnum;
        const { setting } = this;
        switch (val) {
          case light:
            setting.darkTheme = false;
            break;
          case dark:
            setting.darkTheme = true;
            setting.darkThemeFollowSystem = false;
            break;
          case followSystem:
            setting.darkTheme = true;
            setting.darkThemeFollowSystem = true;
            break;
        }
      },
    },
    penguinURL() {
      // return `https://penguin-stats.${this.localeCN ? 'cn' : 'io'}/PenguinStats/api/v2/result/matrix`;
      return 'https://penguin-stats.io/PenguinStats/api/v2/result/matrix';
    },
    jsonstorageURL() {
      return IS_VERCEL && this.localeCN ? '/api/proxy/jsonstorage' : 'https://jsonstorage.net/api/items';
    },
  },
  i18n,
}).$mount('#app');
