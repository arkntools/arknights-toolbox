import Vue from 'vue';
import Mdui from 'mdui';
import App from './App.vue';
import router from './router';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import './registerServiceWorker';
import VueLazyload from 'vue-lazyload';
import i18n from './i18n';
import _ from 'lodash';
import cdnPublicPath from './cdnPublicPath';
import darkmodejs from '@yzfe/darkmodejs';

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
Vue.prototype.$mutationNextTick = function(...argu) {
  this.$nextTick(() => Mdui.mutation(...argu));
};
for (const key of ['mutation', 'alert', 'snackbar', 'prompt', 'Dialog', 'Drawer', 'Tab', 'Select']) {
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
  const componentName = upperFirst(camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, '$1')));
  Vue.component(componentName, componentConfig.default || componentConfig);
});

const $ = Mdui.JQ;

router.afterEach((to, from) => {
  if (from.name) localStorage.setItem('lastPage', to.path);
  $('body').attr('tab', to.name);
  Vue.nextTick(() => {
    $('.router-link-active:not(.router-root)').addClass('mdui-tab-active');
    $(window).trigger('tabChange');
  });
});

const padClass = className => (className ? ` ${className}` : '');
const classObj2ClassName = obj =>
  Object.entries(obj)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(' ');

Vue.directive('theme-class', function(el, { value: [lightClass = null, darkClass = null] }, vnode) {
  const selfClass = classObj2ClassName(_.get(vnode, 'data.class', {}));
  const parentClass = classObj2ClassName(_.get(vnode, 'parent.data.class', {}));
  const dark = vnode.context.$root.dark;
  const addon = (dark ? darkClass : lightClass) || lightClass;
  el.className = vnode.data.staticClass + padClass(selfClass) + padClass(parentClass) + padClass(addon);
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
      imageCDN: process.env.NODE_ENV === 'production',
      darkTheme: true,
      darkThemeFollowSystem: true,
    },
    systemDarkTheme: false,
    i18n: null,
    locales: [
      {
        short: 'zh',
        long: '中文',
      },
      {
        short: 'en',
        long: 'English',
      },
      {
        short: 'ja',
        long: '日本語',
      },
      {
        short: 'ko',
        long: '한국어',
      },
    ],
    localeEnum: {
      zh: 0,
      en: 1,
      ja: 2,
      ko: 3,
    },
    localeSelectKey: 0,
    materialListRendering: true,
  },
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('home.setting', JSON.stringify(val));
      },
      deep: true,
    },
    '$i18n.locale': function(lang) {
      this.updateTitle();
      // $('html').attr('l', lang);
      localStorage.setItem('home.lang', lang);
    },
    'setting.darkTheme': function() {
      this.updatedarkTheme();
    },
    'setting.darkThemeFollowSystem': function() {
      this.updatedarkTheme();
    },
    systemDarkTheme() {
      this.updatedarkTheme();
    },
  },
  methods: {
    avatar(name) {
      return this.isCDNEnable ? `${cdnPublicPath}assets/img/avatar/${name}.png` : `assets/img/avatar/${name}.png`;
    },
    materialImage(name) {
      return this.isCDNEnable ? `${cdnPublicPath}/assets/img/material/${name}.png` : `assets/img/material/${name}.png`;
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
      $('body')[this.dark ? 'addClass' : 'removeClass']('mdui-theme-layout-dark mdui-theme-accent-indigo');
    },
    localeNot(locales = []) {
      return !locales.includes(this.locale);
    },
    getWikiHref({ name, appellation }) {
      const getLocaleName = () => this.$i18n.messages[this.locale].character[name];
      switch (this.locale) {
        case 'zh':
          return `http://ak.mooncell.wiki/w/${getLocaleName()}`;
        case 'ja':
          return `https://wiki.gamerclub.jp/anwiki/index.php?title=${getLocaleName()}`;
        case 'ko':
          return `https://namu.wiki/w/${getLocaleName()}(명일방주)`;
        default:
          return `https://gamepress.gg/arknights/operator/${appellation.toLowerCase()}`;
      }
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
    if (setting) this.setting = _.assign({}, this.setting, _.pick(JSON.parse(setting), _.keys(this.setting)));

    const initPath = location.hash.substr(1) || '/';
    if (this.setting.rememberLastPage && lastPage && initPath === '/' && lastPage !== '/') router.replace(lastPage);
    else if (initPath !== '/') localStorage.setItem('lastPage', initPath);

    const lang = localStorage.getItem('home.lang');
    if (lang) this.locale = lang;
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
    isCDNEnable() {
      return this.setting.imageCDN && !!process.env.VUE_APP_REPOSITORY;
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
    localeNotCN() {
      return this.locale !== 'zh';
    },
    localeCN() {
      return this.locale === 'zh';
    },
    localeName() {
      return this.locales.find(({ short }) => short === this.locale).long;
    },
    localeMessages() {
      return this.$i18n.messages[this.locale];
    },
    dark() {
      const { darkTheme, darkThemeFollowSystem } = this.setting;
      return darkTheme && (!darkThemeFollowSystem || (darkThemeFollowSystem && this.systemDarkTheme));
    },
  },
  i18n,
}).$mount('#app');
