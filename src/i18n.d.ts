import Vue from 'vue';
import VueI18n from 'vue-i18n';

declare module 'vue/types/vue' {
  interface Vue {
    $tt: Vue['$t'];
  }
}

declare const i18n: VueI18n;

export default i18n;
