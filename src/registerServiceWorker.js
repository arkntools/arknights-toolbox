/* eslint-disable no-console */

import { register } from 'register-service-worker';
import snackbar from './utils/snackbar';
import i18n from './i18n';

if (process.env.NODE_ENV === 'production' && !process.env.VUE_APP_DISABLE_PWA) {
  register('service-worker.js', {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB',
      );
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
      snackbar(i18n.t('sw.cached'));
    },
    updatefound() {
      console.log('New content is downloading.');
      snackbar(i18n.t('sw.updatefound'));
    },
    updated(reg) {
      console.log('New content is available; please refresh.');
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      snackbar({
        message: i18n.t('sw.updated'),
        buttonText: i18n.t('sw.refresh'),
        timeout: 0,
        closeOnOutsideClick: false,
        noSkip: true,
        onButtonClick: () => {
          reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        },
      });
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    },
  });
}
