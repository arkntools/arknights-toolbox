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
		},
		updatefound() {
			console.log('New content is downloading.');
		},
		updated() {
			console.log('New content is available; please refresh.');
			snackbar({
				message: '发现更新，是否重载页面以应用更新',
				buttonText: '重载',
				timeout: 0,
				onButtonClick: function() {
					window.location.reload();
				}
			});
			alert('应用已更新', '应用会在下次启动时完成更新。如果一直出现本提示，请尝试清除浏览器缓存。');
		},
		offline() {
			console.log('No internet connection found. App is running in offline mode.');
		},
		error(error) {
			console.error('Error during service worker registration:', error);
		}
	});
}
