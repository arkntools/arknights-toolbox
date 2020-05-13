import Vue from 'vue';
import Router from 'vue-router';
// import Home from './views/Home.vue';
// import Hr from './views/Hr.vue';
// import Material from './views/Material.vue';
// import Level from './views/Level.vue';
// import Base from './views/Base.vue';

Vue.use(Router);

export default new Router({
  routes: [
    // jshint ignore: start
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "app.home" */ './views/Home.vue'),
    },
    {
      path: '/hr',
      name: 'hr',
      component: () => import(/* webpackChunkName: "app.hr" */ './views/Hr.vue'),
    },
    {
      path: '/material',
      name: 'material',
      component: () => import(/* webpackChunkName: "app.material" */ './views/Material.vue'),
    },
    {
      path: '/level',
      name: 'level',
      component: () => import(/* webpackChunkName: "app.level" */ './views/Level.vue'),
    },
    {
      path: '/base',
      name: 'base',
      component: () => import(/* webpackChunkName: "app.base" */ './views/Base.vue'),
    },
    // jshint ignore: end
  ],
});
