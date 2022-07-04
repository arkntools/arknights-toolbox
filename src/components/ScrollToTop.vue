<template>
  <button
    class="mdui-fab mdui-fab-fixed mdui-ripple scroll-to-top"
    v-theme-class="$root.color.redBtn"
    :class="{
      'mdui-fab-mini': $root.smallScreen,
      'mdui-fab-hide': !this.show,
      'need-offset': offset,
    }"
    @click="scrollTop"
    ><i class="mdui-icon material-icons">vertical_align_top</i></button
  >
</template>

<script>
import _ from 'lodash';

const SHOW_TOP = 1000;

const $container = document.getElementById('wrapper');

export default {
  name: 'scroll-to-top',
  data: () => ({
    show: false,
    offset: false,
    updateShowDebounce: () => {},
  }),
  methods: {
    scrollTop() {
      $container.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    },
    updateShow() {
      const show = $container.scrollTop > SHOW_TOP;
      if (show !== this.show) {
        this.show = show;
        this.offset = !!document.querySelector('#main-container .mdui-fab-fixed');
      }
    },
  },
  created() {
    this.updateShowDebounce = _.debounce(this.updateShow, 200);
  },
  mounted() {
    $container.addEventListener('scroll', this.updateShowDebounce);
    this.updateShow();
  },
  destroyed() {
    $container.removeEventListener('scroll', this.updateShowDebounce);
  },
};
</script>

<style lang="scss" scoped>
@media (min-width: 1500px) {
  .scroll-to-top {
    right: calc(50% - 710px);
  }
}
.scroll-to-top {
  margin-bottom: 0;
  &.need-offset {
    margin-bottom: 56px;
  }
}
</style>
