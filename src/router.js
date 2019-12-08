import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Hr from './views/Hr.vue';
import Material from './views/Material.vue';
import Level from './views/Level.vue';
import Base from './views/Base.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/hr',
      name: 'arkn-hr',
      component: Hr,
    },
    {
      path: '/material',
      name: 'arkn-material',
      component: Material,
    },
    {
      path: '/level',
      name: 'arkn-level',
      component: Level,
    },
    {
      path: '/base',
      name: 'arkn-base',
      component: Base,
    },
  ],
});
