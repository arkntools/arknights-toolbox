import Vue from 'vue';
import _ from 'lodash';

const requireComponent = require.context('../components/global', false, /.+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = _.upperFirst(_.camelCase(fileName.replace(/^\.\/(.*)\.vue$/, '$1')));
  Vue.component(componentName, componentConfig.default || componentConfig);
});
