/*eslint-disable */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.precaching.precacheAndRoute([
	'/data/addition.json',
	'/data/elite.json',
	'/data/hr.json',
	'/data/material.json'
]);

workbox.routing.registerRoute(
	new RegExp('/.*\\.(html|ico)'),
	new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
	new RegExp('/(css|js|img)/'),
	new workbox.strategies.CacheFirst()
);

workbox.routing.registerRoute(
	new RegExp('/data/'),
	new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
	new RegExp('https://cdn\\.bootcss\\.com'),
	new workbox.strategies.CacheFirst()
);
