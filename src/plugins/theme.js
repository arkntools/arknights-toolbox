import Vue from 'vue';
import _ from 'lodash';

const classObj2ClassName = obj =>
  Object.entries(obj)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(' ');

Vue.directive(
  'theme-class',
  function (el, { value: [lightClass = null, darkClass = null] }, vnode) {
    const classes = [
      vnode.data.staticClass,
      classObj2ClassName(_.get(vnode, 'data.class', {})),
      _.get(vnode, 'parent.data.staticClass', ''),
      classObj2ClassName(_.get(vnode, 'parent.data.class', {})),
      vnode.context.$root.dark ? darkClass : lightClass,
    ];
    el.className = classes.filter(cn => cn).join(' ');
  },
);
