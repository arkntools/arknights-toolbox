<template>
  <div v-if="show" class="alert-bar mdui-p-a-2" v-theme-class="themeClass">
    <div class="mdui-typo"><slot></slot></div>
    <button class="mdui-btn mdui-btn-icon mdui-btn-dense mdui-ripple mdui-m-l-1" @click="close"
      ><i class="mdui-icon material-icons">close</i></button
    >
  </div>
</template>

<script>
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';

const nls = new NamespacedLocalStorage('alertBar');

const themeClassMap = {
  success: ['alert-bar__success', 'alert-bar__success-dark'],
  warn: ['alert-bar__warn', 'alert-bar__warn-dark'],
};

export default {
  name: 'AlertBar',
  props: {
    flag: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'warn',
    },
  },
  data() {
    return {
      show: this.shouldShow(),
    };
  },
  computed: {
    themeClass() {
      if (this.type in themeClassMap) return themeClassMap[this.type];
      return themeClassMap.warn;
    },
  },
  methods: {
    shouldShow() {
      return this.flag && !nls.getItem(this.flag);
    },
    close() {
      nls.setItem(this.flag, true);
      this.show = false;
    },
  },
};
</script>

<style lang="scss">
.alert-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  &.alert-bar__warn {
    background-color: #fff3cd;
    color: #664d03;
    &-dark {
      background-color: #997404;
      color: #ffda6a;
    }
  }
  &.alert-bar__success {
    background-color: #d1e7dd;
    color: #0a3622;
    &-dark {
      background-color: #0f5132;
      color: #75b798;
    }
  }
}
</style>
