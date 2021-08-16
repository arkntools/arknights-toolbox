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
    // eslint-disable-next-line no-console
    console.error(err);
    vm.$gtag.exception({ description: `${err} | ${info} | ${vm.$route.name}` });
  };
} else {
  defineVueProperty('gtag', { event: () => {} });
}
