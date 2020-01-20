import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach(key => {
    const [, locale, file] = key.split('/');
    const name = file.split('.')[0];
    if (!messages[locale]) messages[locale] = {};
    if (name === '_') messages[locale] = Object.assign(messages[locale], locales(key));
    else messages[locale][name] = locales(key);
  });
  return messages;
}

const option = {
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
};

option.messages.en.operatorName = '{en}';
option.messages.zh.operatorName = '{name}';

export default new VueI18n(option);
