<template>
  <img
    class="arkn-item mdui-m-r-1 no-sl no-pe"
    :src="$root.materialImage(img)"
    :style="{ width: widthCss, height: widthCss }"
    crossorigin="anonymous"
    @error="handleImgErr"
  />
</template>

<script>
export default {
  name: 'arkn-item',
  props: {
    img: String,
    width: {
      type: [Number, String],
      default: 48,
    },
  },
  computed: {
    widthCss() {
      return typeof this.width === 'number' ? `${this.width}px` : this.width;
    },
  },
  methods: {
    handleImgErr(e) {
      e.target.src = this.$root.avatar('no_image');
      e.target.style.backgroundColor = '#bdbdbd';
      e.target.style.borderRadius = '50%';
    },
  },
};
</script>

<style scoped>
.arkn-item {
  position: relative;
  flex-shrink: 0;
}
</style>
