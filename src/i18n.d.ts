import Vue from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $tt: Vue['$t'];
  }
}
