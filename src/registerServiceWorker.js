/* eslint-disable no-console */

import { register } from 'register-service-worker';
import snackbar from './utils/snackbar';
import i18n from './i18n';

if (process.env.NODE_ENV === 'production') {
  register('service-worker.js', {
    ready() {
      console.log('App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB');
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
    updated() {
      console.log('New content is available; please refresh.');
      snackbar({
        message: i18n.t('sw.updated'),
        buttonText: i18n.t('sw.refresh'),
        timeout: 0,
        closeOnOutsideClick: false,
        noSkip: true,
        onButtonClick: () => {
          window.location.reload();
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
