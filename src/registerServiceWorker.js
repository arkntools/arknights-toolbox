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
			let refreshing = false;
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				if (refreshing) return;
				window.location.reload();
				refreshing = true;
			});
		},
		cached() {
			console.log('Content has been cached for offline use.');
		},
		updatefound() {
			console.log('New content is downloading.');
		},
		updated(reg) {
			console.log('New content is available; please refresh.');
			snackbar({
				message: '发现更新，请重新启动应用以完成更新',
				timeout: 0,
				onButtonClick: () => {
					reg.waiting.postMessage('skipWaiting');
				}
			});
		},
		offline() {
			console.log('No internet connection found. App is running in offline mode.');
		},
		error(error) {
			console.error('Error during service worker registration:', error);
		}
	});
}
