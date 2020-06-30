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
  locale: 'cn',
  fallbackLocale: 'cn',
  messages: loadLocaleMessages(),
};

export default new VueI18n(option);
