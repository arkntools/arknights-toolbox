import 'mdui/dist/css/mdui.css';
import './utils/migration';
import './registerServiceWorker';
import _ from 'lodash';
import Vue from 'vue';
import { mapActions } from 'pinia';
import Mdui from 'mdui';
import App from './App.vue';
import { router } from './router';
import i18n from './i18n';
import { pinia } from './store';
import darkmodejs from '@yzfe/darkmodejs';
import { langList, locales, langMigration, servers } from '@/constant/lang';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import pickClone from '@/utils/pickClone';
import { loadVConsole } from '@/utils/vConsole';
import { encodeURIComponentEUCJP } from '@/utils/coder';
import { IS_DEV } from '@/utils/env';
import { useHotUpdateStore } from '@/store/hotUpdate';

import defineVueProperty from './plugins/defineVueProperty';
import './plugins/globalComponents';
import './plugins/mdui';
import './plugins/lodash';
import './plugins/theme';
import './plugins/gtag';
import './plugins/formatter';
import './plugins/longpress';
import './utils/localforage';

// import VueObserveVisibility from 'vue-observe-visibility';
import smoothscroll from 'smoothscroll-polyfill';

// Vue.use(VueObserveVisibility);
smoothscroll.polyfill();

(() => {
  const url = new URL(location.href);
  if (url.searchParams.get('vconsole')) loadVConsole();
})();

if (IS_DEV) {
  Vue.config.devtools = true;
}

// eslint-disable-next-line no-console
defineVueProperty('log', console.log);

const nls = new NamespacedLocalStorage('home');

const $ = Mdui.JQ;

new Vue({
  router,
  pinia,
  render: h => h(App),
  provide() {
    return {
      isUnreleasedChar: this.isUnreleasedChar,
    };
  },
  data: {
    githubRepo: 'https://github.com/arkntools/arknights-toolbox',
    color: {
      tagBtnHead: ['mdui-color-teal', 'mdui-color-teal-300'],
      redBtn: ['mdui-color-red', 'mdui-color-indigo-a100 mdui-ripple-black'],
      blueBtn: ['mdui-color-blue-600', 'mdui-color-blue-a100 mdui-ripple-black'],
      pinkBtn: ['mdui-color-pink-accent', 'mdui-color-indigo-a100 mdui-ripple-black'],
      pinkText: ['mdui-text-color-pink-accent', 'mdui-text-color-pink-a100'],
      dialogTransparentBtn: [null, 'mdui-text-color-indigo-a100'],
    },
    screenWidth: 0,
    nm: false,
    deferredPrompt: false,
    setting: {
      rememberLastPage: true,
      darkTheme: true,
      darkThemeFollowSystem: true,
    },
    systemDarkTheme: false,
    server: locales[0].short,
    locales,
    servers,
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
        nls.setItem('setting', val);
      },
      deep: true,
    },
    locale(lang) {
      this.updateTitle();
      nls.setItem('lang', lang);
    },
    server(server) {
      nls.setItem('server', server);
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
  computed: {
    smallScreen() {
      return this.screenWidth <= 450;
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
    localeName() {
      return this.locales.find(({ short }) => short === this.locale).long;
    },
    serverCN() {
      return this.server === 'cn';
    },
    serverTW() {
      return this.server === 'tw';
    },
    serverNotCN() {
      return !this.serverCN;
    },
    i18nServerMessages() {
      return this.$i18n.messages[this.server];
    },
    dark() {
      const { darkTheme, darkThemeFollowSystem } = this.setting;
      return (
        darkTheme && (!darkThemeFollowSystem || (darkThemeFollowSystem && this.systemDarkTheme))
      );
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
    isUnreleasedGradedUniequip() {
      // 分级模组和黑键同期实装
      return this.isUnreleasedChar('4046_ebnhlz');
    },
  },
  methods: {
    ...mapActions(useHotUpdateStore, ['initData']),
    routeIs(name) {
      return this.$route.name === name;
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
    isUnreleasedChar(name) {
      return name in this.i18nServerMessages.character;
    },
    isUnreleasedMaterial(name) {
      return name in this.i18nServerMessages.material;
    },
    isUnreleasedUniequip(id) {
      return id in (this.i18nServerMessages.uniequip || {});
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
    getLocalCharacterName(name, locale) {
      return this.$i18n.messages[locale || this.locale].character[name];
    },
    async getWikiHref({ name, appellation }) {
      if (!(name && appellation)) return '';
      switch (this.locale) {
        case 'cn':
        case 'tw':
          return `https://prts.wiki/w/${this.getLocalCharacterName(name, 'cn')}`;
        case 'jp':
          // eslint-disable-next-line no-case-declarations
          const jpName = this.getLocalCharacterName(name);
          return `https://arknights.wikiru.jp/index.php?${await encodeURIComponentEUCJP(
            jpName === 'W' ? `${jpName}(プレイアブル)` : jpName,
          )}`;
        case 'kr':
          return `https://namu.wiki/w/${this.getLocalCharacterName(name)}(명일방주)`;
        default:
          return `https://gamepress.gg/arknights/operator/${appellation.toLowerCase()}`;
      }
    },
    async openWikiHref(char) {
      window.open(await this.getWikiHref(char), '_blank');
    },
    pureName(name) {
      return name.toLowerCase?.().replace(/ /g, '');
    },
    getSearchGroup({ name, appellation, pinyin: { full, head }, romaji }) {
      const pureAppellation = this.pureName(appellation);
      const pureName = this.pureName(this.$t(`character.${name}`)) || pureAppellation;
      head = head || pureName;
      full = full || pureName;
      romaji = romaji || pureName;
      if (this.localeZH) {
        return [head, full, pureName, pureAppellation, romaji];
      } else if (this.localeIs('jp')) {
        return [romaji, pureName, pureAppellation, head, full];
      }
      return [pureName, pureAppellation, romaji, head, full];
    },
    transitionBeforeLeave(el) {
      const paRect = el.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0 };
      const elRect = el.getBoundingClientRect();
      this.$$(el).css({
        top: `${elRect.top - paRect.top}px`,
        left: `${elRect.left - paRect.left}px`,
        width: `${elRect.width}px`,
      });
    },
    transitionAfterLeaveBeforeEnter(el) {
      this.$$(el).css({
        top: '',
        left: '',
        width: '',
      });
    },
    updateScreenWidth() {
      if (this.screenWidth !== window.innerWidth) {
        this.screenWidth = window.innerWidth;
      }
    },
  },
  created() {
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

    (obj => obj && (this.setting = pickClone(this.setting, obj)))(nls.getItem('setting'));

    const lastPage = window.localStorage?.getItem('lastPage');
    const initPath = location.hash.substr(1) || '/';
    if (this.setting.rememberLastPage && lastPage && initPath === '/' && lastPage !== '/') {
      router.replace(lastPage);
    } else if (initPath !== '/') window.localStorage?.setItem('lastPage', initPath);

    const lang = nls.getItem('lang');
    if (lang) {
      const applyLang = langMigration[lang] || lang;
      if (applyLang in langList) this.locale = applyLang;
    }

    const server = nls.getItem('server');
    if (!server || !servers.includes(server)) {
      this.server = servers.includes(this.locale) ? this.locale : 'cn';
      nls.setItem('server', this.server);
    } else this.server = server;

    // 禁止 iOS 双指缩放
    document.addEventListener('gesturestart', function (event) {
      event.preventDefault();
    });
    // 配合 touch-action: manipulation; 禁止 iOS 双击缩放
    document.body.addEventListener('click', () => {});

    // 初始化工具箱数据
    this.initData();
  },
  mounted() {
    this.updateScreenWidth();
    window.addEventListener('resize', _.throttle(this.updateScreenWidth, 500, { leading: false }));
    window.addEventListener('orientationchange', this.updateScreenWidth);
    $('#footer').removeClass('mdui-hidden');
  },
  i18n,
}).$mount('#app');
