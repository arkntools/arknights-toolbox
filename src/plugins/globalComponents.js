import _ from 'lodash';
import Vue from 'vue';
import Teleport from 'vue2-teleport';

Vue.component('Teleport', Teleport);

const requireComponent = require.context('../components/global', false, /.+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = _.upperFirst(_.camelCase(fileName.replace(/^\.\/(.*)\.vue$/, '$1')));
  Vue.component(componentName, componentConfig.default || componentConfig);
});
