<template>
  <div
    v-if="show"
    class="alert-bar mdui-p-a-2"
    v-theme-class="[
      'mdui-color-yellow-100 mdui-text-color-brown-600',
      'mdui-color-yellow-900 mdui-text-color-white',
    ]"
  >
    <div class="mdui-typo"><slot></slot></div>
    <button class="mdui-btn mdui-btn-icon mdui-btn-dense mdui-ripple mdui-m-l-1" @click="close"
      ><i class="mdui-icon material-icons">close</i></button
    >
  </div>
</template>

<script>
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';

const nls = new NamespacedLocalStorage('alertBar');

export default {
  name: 'AlertBar',
  props: {
    flag: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      show: this.shouldShow(),
    };
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

<style>
.alert-bar {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
