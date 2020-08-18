<template>
  <img
    class="arkn-item mdui-m-r-1 no-sl no-pe"
    :src="$root.materialImage(img)"
    :style="{ width: widthCss, height: widthCss }"
    crossorigin="anonymous"
  />
</template>

<script>
export default {
  name: 'arkn-item',
  computed: {
    widthCss() {
      return typeof this.width === 'number' ? `${this.width}px` : this.width;
    },
  },
  props: {
    img: String,
    width: {
      type: [Number, String],
      default: 48,
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
