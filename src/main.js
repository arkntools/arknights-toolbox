import Vue from 'vue';
import Mdui from 'mdui';
import App from './App.vue';
import router from './router';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import './registerServiceWorker';
import materialOnlineImage from './data/materialOnlineImage.json';
import VueLazyload from 'vue-lazyload';

Vue.config.productionTip = false;
Vue.use(VueLazyload, { preLoad: 1.5 });

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
    Mdui,
    JQ: $,
    screenWidth: 0,
    nm: false,
    deferredPrompt: false,
    setting: {
      rememberLastPage: true,
      imageCDN: true,
    },
  },
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('home.setting', JSON.stringify(val));
      },
      deep: true,
    },
  },
  methods: {
    mutation: function() {
      Vue.nextTick(Mdui.mutation);
    },
    avatar({ img: { name, ext }, full }) {
      return this.setting.imageCDN ? `https://p1.ssl.qhimg.com/dr/80__/${name}.${ext}` : `assets/img/avatar/${full}.${ext}`;
    },
    materialImage(name) {
      const online = materialOnlineImage[name];
      return this.setting.imageCDN && online ? `https://ps.ssl.qhmsg.com/${online}.png` : `assets/img/material/${name}.png`;
    },
    materialT(t) {
      return this.setting.imageCDN ? `o${t}` : t;
    },
    snackbar: Mdui.snackbar,
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
    isMobile() {
      return !!/iPhone|iPad|iPod|Android/i.test(navigator.platform);
    },
  },
  created() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
    let setting = localStorage.getItem('home.setting');
    let lastPage = localStorage.getItem('lastPage');
    if (setting) {
      setting = JSON.parse(setting);
      if (setting) this.setting = Object.assign({}, this.setting, setting);
      if (setting.rememberLastPage && lastPage && router.currentRoute.path == '/') router.replace(lastPage);
      if (router.currentRoute.path != '/') localStorage.setItem('lastPage', router.currentRoute.path);
    }
  },
  mounted() {
    this.screenWidth = $('body').width();
    window.onresize = () => {
      this.screenWidth = $('body').width();
    };
    if (this.isMobile()) $('body').attr('mobile', true);
  },
  computed: {
    smallScreen() {
      return this.$root.screenWidth <= 450;
    },
  },
}).$mount('#app');
