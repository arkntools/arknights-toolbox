import Vue from 'vue';
import VueGtag from 'vue-gtag';
import { router } from '../router';
import defineVueProperty from './defineVueProperty';

if (process.env.VUE_APP_GTAG) {
  Vue.use(
    VueGtag,
    {
      config: {
        id: process.env.VUE_APP_GTAG,
        params: {
          app_version: process.env.VUE_APP_DIST_VERSION,
        },
      },
    },
    router,
  );
  // 异常上报
  Vue.config.errorHandler = (err, vm, info) => {
    vm.$gtag.exception({
      description: `${err} | ${info}`,
      fatal: false,
    });
  };
} else {
  defineVueProperty('gtag', { event: () => {} });
}
