import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home
		},
		{
			path: '/hr',
			name: 'arkn-hr',
			component: () => import(/* webpackChunkName: "hr" */ './views/Hr.vue')
		},
		{
			path: '/material',
			name: 'arkn-material',
			component: () => import(/* webpackChunkName: "material" */ './views/Material.vue')
		}
	]
});
