import Vue from 'vue';

const classObj2ClassName = obj =>
  Object.entries(obj)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(' ');

const updateClass = (el, vnode, [lightClass = null, darkClass = null] = []) => {
  const isDark = vnode.context.$root.dark;
  const classes = [
    vnode.data?.staticClass,
    classObj2ClassName(vnode.data?.class ?? {}),
    vnode.parent?.data?.staticClass ?? '',
    classObj2ClassName(vnode.parent?.data?.class ?? {}),
    isDark ? darkClass : lightClass,
  ];
  el.className = classes.filter(name => name).join(' ');
  el.dataset.isDark = isDark ? '1' : '0';
};

Vue.directive('theme-class', {
  bind: (el, { value }, vnode) => {
    updateClass(el, vnode, value);
  },
  update: (el, { value, oldValue }, vnode) => {
    const isDark = vnode.context.$root.dark ? '1' : '0';
    const targetClass = isDark ? value[1] : value[0];
    if (
      el.dataset.isDark === isDark &&
      (value === oldValue ||
        (value && oldValue && value[0] === oldValue[0] && value[1] === oldValue[1])) &&
      targetClass
        ? el.classList.contains(targetClass)
        : true
    ) {
      return;
    }
    updateClass(el, vnode, value);
  },
});
