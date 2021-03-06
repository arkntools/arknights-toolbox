import defineVueProperty from './defineVueProperty';
import Mdui from 'mdui';
import snackbar from '../utils/snackbar';

if (process.env.NODE_ENV !== 'production') {
  window.$ = Mdui.JQ;
}

defineVueProperty('$', Mdui.JQ);
['mutation', 'alert', 'prompt', 'confirm', 'Dialog', 'Drawer', 'Tab', 'Select'].forEach(key =>
  defineVueProperty(key, Mdui[key]),
);
defineVueProperty('snackbar', snackbar);
defineVueProperty('mutationNextTick', function () {
  this.$nextTick(() => Mdui.mutation(...arguments));
});
