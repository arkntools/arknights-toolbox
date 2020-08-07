import Vue from 'vue';
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

Vue.prototype.$now = _.now;
Vue.prototype.$$ = Mdui.JQ;
Vue.prototype.$mutationNextTick = function (...argu) {
  this.$nextTick(() => Mdui.mutation(...argu));
};
for (const key of ['mutation', 'alert', 'snackbar', 'prompt', 'confirm', 'Dialog', 'Drawer', 'Tab', 'Select']) {
  Vue.prototype[`$${key}`] = Mdui[key];
}

Vue.prototype.$copyText = txt => navigator.clipboard.writeText(txt);
Vue.prototype.$requestClipboardPermission = async (name = 'clipboard-write') => {
  if (!(navigator && 'permissions' in navigator && 'clipboard' in navigator)) return false;
  const permission = (await navigator.permissions.query({ name })).state;
  if (!(permission === 'granted' || permission === 'prompt')) return false;
  return true;
};

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
    $(window).trigger('mdui-tab-init');
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
      return `${this.staticBasePath}assets/img/avatar/${name}.png`;
    },
    materialImage(name) {
      return `${this.staticBasePath}assets/img/material/${name}.png`;
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
        this.deferredPrompt = false;
      }
    },
    // isMobile() {
    //   return /iPhone|iPad|iPod|Android/i.test(navigator.platform);
    // },
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
          return `http://ak.mooncell.wiki/w/${getLocaleName('cn')}`;
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
    staticBasePath() {
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
      return `https://penguin-stats.${this.localeCN ? 'cn' : 'io'}/PenguinStats/api/v2/result/matrix`;
    },
    jsonstorageURL() {
      return IS_VERCEL && this.localeCN ? '/api/proxy/jsonstorage' : 'https://jsonstorage.net/api/items';
    },
  },
  i18n,
}).$mount('#app');
