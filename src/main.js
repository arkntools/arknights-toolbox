import Vue from 'vue';
import Mdui from 'mdui';
import App from './App.vue';
import router from './router';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import './registerServiceWorker';
import materialOnlineImage from './data/materialOnlineImage.json';
import VueLazyload from 'vue-lazyload';
import i18n from './i18n';
import _ from 'lodash';

if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
  window.$ = Mdui.JQ;
}
Vue.use(VueLazyload, {
  preLoad: 2,
  lazyComponent: true,
});

Vue.prototype.$$ = Mdui.JQ;
for (const key of ['alert', 'snackbar', 'prompt', 'Dialog', 'Drawer', 'Tab', 'Select']) {
  Vue.prototype[`$${key}`] = Mdui[key];
}

const requireComponent = require.context('./components', false, /_.+\.vue$/);
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
    Mdui.mutation();
  });
});

new Vue({
  router,
  render: h => h(App),
  data: {
    screenWidth: 0,
    nm: false,
    deferredPrompt: false,
    setting: {
      rememberLastPage: true,
      imageCDN: true,
    },
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
    showLocaleSelect: true,
  },
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('home.setting', JSON.stringify(val));
      },
      deep: true,
    },
    '$i18n.locale': lang => {
      localStorage.setItem('home.lang', lang);
    },
  },
  methods: {
    mutation: function() {
      Vue.nextTick(Mdui.mutation);
    },
    avatar({ avatar: { name, ext }, pinyin: { full } }) {
      return this.setting.imageCDN
        ? `https://p1.ssl.qhimg.com/dr/80__/${name}.${ext}`
        : `assets/img/avatar/${full}.${ext}`;
    },
    materialImage(name) {
      const online = materialOnlineImage[name];
      return this.setting.imageCDN && online
        ? `https://ps.ssl.qhmsg.com/${online}.png`
        : `assets/img/material/${name}.png`;
    },
    materialT(t) {
      return this.setting.imageCDN ? `o${t}` : t;
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
  },
  created() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
    let setting = localStorage.getItem('home.setting');
    let lastPage = localStorage.getItem('lastPage');
    if (setting) this.setting = _.assign({}, this.setting, _.pick(JSON.parse(setting), _.keys(this.setting)));
    if (this.setting.rememberLastPage && lastPage && router.currentRoute.path == '/') router.replace(lastPage);
    if (router.currentRoute.path != '/') localStorage.setItem('lastPage', router.currentRoute.path);

    const lang = localStorage.getItem('home.lang');
    if (lang) this.$i18n.locale = lang;
  },
  mounted() {
    this.screenWidth = $('body').width();
    window.onresize = () => {
      this.screenWidth = $('body').width();
    };
    // if (this.isMobile()) $('body').attr('mobile', true);
  },
  computed: {
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
      return this.$i18n.locale !== 'zh';
    },
    localeCN() {
      return this.$i18n.locale === 'zh';
    },
    localeEN() {
      return this.$i18n.locale === 'en';
    },
  },
  i18n,
}).$mount('#app');
