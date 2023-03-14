import Vue from 'vue';
import VueI18n from 'vue-i18n';
import _ from 'lodash';

Vue.use(VueI18n);

Vue.prototype.$tt = function (t) {
  const $t = this.$t(t);
  return t === $t ? _.last(t.split('.')) : $t;
};

function loadLocaleMessages() {
  // /[A-Za-z0-9-_,\s]+\.json$/i
  const locales = require.context('./locales', true, /_\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const [, locale, file] = key.split('/');
    const name = file.split('.')[0];
    if (!messages[locale]) messages[locale] = {};
    messages[locale][name] = locales(key);
  });
  _.each(_.omit(messages, ['cn', 'us', 'tw']), obj => {
    obj._ = _.merge({}, messages.us._, obj._);
  });
  messages.tw._ = _.merge({}, messages.cn._, messages.tw._);
  _.each(messages, obj => {
    const m = obj._;
    delete obj._;
    _.merge(obj, m);
  });
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
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return 'cn';
  })(),
  fallbackLocale: 'cn',
  messages: loadLocaleMessages(),
};

export default new VueI18n(option);
