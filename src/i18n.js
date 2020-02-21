import Vue from 'vue';
import VueI18n from 'vue-i18n';
import _ from 'lodash';

Vue.use(VueI18n);

const charList = {};

Vue.prototype.$tt = function(t) {
  const $t = this.$t(t);
  return t === $t ? _.last(t.split('.')) : $t;
};

Vue.prototype.$implementatedChars = function() {
  return charList[this.$root.locale];
};

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const [, locale, file] = key.split('/');
    const name = file.split('.')[0];
    if (!messages[locale]) messages[locale] = {};
    // if (name === '_') Object.assign(messages[locale], locales(key));
    messages[locale][name] = locales(key);
    if (name === 'character') charList[locale] = Object.keys(locales(key));
  });
  _.each(_.omit(messages, ['zh', 'en']), obj => {
    obj._ = _.merge({}, messages.en._, obj._);
  });
  _.each(messages, obj => {
    const m = obj._;
    delete obj._;
    _.merge(obj, m);
  });
  return messages;
}

const option = {
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: loadLocaleMessages(),
};

export default new VueI18n(option);
