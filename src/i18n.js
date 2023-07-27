import Vue from 'vue';
import VueI18n from 'vue-i18n';
import _ from 'lodash';

Vue.use(VueI18n);

Vue.prototype.$tt = function (t) {
  const $t = this.$t(t);
  return t === $t ? _.last(t.split('.')) : $t;
};

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const [, locale, file] = key.split('/');
    const name = file.split('.')[0];
    if (!messages[locale]) messages[locale] = {};
    messages[locale][name] = locales(key);
  });
  ['jp', 'kr'].forEach(key => {
    messages[key] = _.merge({}, messages.us, messages[key]);
  });
  messages.tw = _.merge({}, messages.cn, messages.tw);
  return messages;
}

const option = {
  locale: (() => {
    try {
      for (const lang of _.castArray(navigator.languages || navigator.language)) {
        if (!_.isString(lang)) continue;
        const [p1, p2] = lang.split('-').map(s => s?.toLowerCase());
        switch (p1) {
          case 'zh':
            if (['tw', 'hk', 'hant'].includes(p2)) return 'tw';
            return 'cn';
          case 'en':
            return 'us';
          case 'ja':
            return 'jp';
          case 'ko':
            return 'kr';
        }
      }
    } catch (e) {
      console.error(e);
    }
    return 'cn';
  })(),
  fallbackLocale: 'cn',
  messages: loadLocaleMessages(),
  silentFallbackWarn: true,
};

const i18n = new VueI18n(option);

export default i18n;

export const t = i18n.t.bind(i18n);
