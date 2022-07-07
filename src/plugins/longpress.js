import Vue from 'vue';

const PRESS_TIMEOUT = 500;

Vue.directive('longpress', {
  bind: function (el, { value }) {
    if (typeof value !== 'function') {
      // eslint-disable-next-line no-console
      console.error(`[v-longpress] expect a function, but got ${value}`, el);
      return;
    }

    let pressTimer = null;

    const start = e => {
      if (e.type === 'mousedown' && e.button !== 0) {
        return;
      }

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          value(e);
          pressTimer = null;
        }, PRESS_TIMEOUT);
      }
    };

    const cancel = e => {
      if (e.type === 'click' && pressTimer === null) {
        e.stopImmediatePropagation();
      }
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    ['mousedown', 'touchstart'].forEach(e => el.addEventListener(e, start, true));
    ['click', 'mouseout', 'touchend', 'touchcancel'].forEach(e =>
      el.addEventListener(e, cancel, true),
    );
  },
});
