/* eslint-disable no-console */

import { register } from 'register-service-worker';
import { snackbar } from 'mdui';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.\n' + 'For more details, visit https://goo.gl/AFskqB');
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
      snackbar('缓存完成，可以离线使用了');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated() {
      console.log('New content is available; please refresh.');
      snackbar({
        message: '更新已完成，请重载页面以使用新版本',
        buttonText: '重载',
        timeout: 0,
        closeOnOutsideClick: false,
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
