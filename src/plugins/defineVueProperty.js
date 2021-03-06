import Vue from 'vue';

export default (key, value) =>
  Object.defineProperty(Vue.prototype, `$${key}`, {
    get() {
      return value;
    },
  });
