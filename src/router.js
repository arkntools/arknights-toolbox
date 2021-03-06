import Vue from 'vue';
import Router from 'vue-router';
import Mdui from 'mdui';

Vue.use(Router);

const $ = Mdui.JQ;

export const router = new Router({
  routes: [
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
      redirect: '/riic',
    },
    {
      path: '/riic',
      name: 'riic',
      component: () => import(/* webpackChunkName: "app.riic" */ './views/RIIC.vue'),
    },
    {
      path: '/depot',
      name: 'depot',
      component: () => import(/* webpackChunkName: "app.depot" */ './views/Depot.vue'),
    },
  ],
});

router.afterEach((to, from) => {
  if (from.name) localStorage.setItem('lastPage', to.path);
  $('body').attr('tab', to.name);
  Vue.nextTick(() => {
    $('.router-link-active:not(.router-root)').addClass('mdui-tab-active');
    $(window).trigger('mduiTabInit');
  });
});

export const meta = {
  home: {
    icon: 'home',
  },
  hr: {
    icon: 'person_add',
  },
  material: {
    icon: 'dashboard',
  },
  level: {
    icon: 'add',
  },
  riic: {
    icon: 'build',
  },
  depot: {
    icon: 'apps',
    chip: 'rc.4',
  },
};
