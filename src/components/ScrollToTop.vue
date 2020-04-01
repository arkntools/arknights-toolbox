<template>
  <button class="mdui-fab mdui-fab-fixed mdui-ripple scroll-to-top" v-theme-class="$root.color.redBtn" :class="{ 'mdui-fab-hide': top < 1000 }" @click="scrollTop"><i class="mdui-icon material-icons">vertical_align_top</i></button>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'scroll-to-top',
  data: () => ({
    top: 0,
    handleScrollDebounce: () => {},
  }),
  methods: {
    scrollTop() {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    },
    handleScroll() {
      this.top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    },
  },
  created() {
    this.handleScrollDebounce = _.debounce(this.handleScroll, 100);
  },
  mounted() {
    window.addEventListener('scroll', this.handleScrollDebounce);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScrollDebounce);
  },
};
</script>

<style scoped>
@media (min-width: 1500px) {
  .scroll-to-top {
    right: calc(50% - 710px);
  }
}
</style>
