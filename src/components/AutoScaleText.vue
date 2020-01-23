<template>
  <div class="inline-block" :style="{ maxWidth: maxWidth ? `${maxWidth}px` : false }">
    <span ref="text" class="inline-block scale-text">
      <slot></slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'auto-scale-text',
  props: {
    maxWidth: [String, Number],
  },
  computed: {
    maxWidthInt() {
      return parseInt(this.maxWidth);
    },
  },
  mounted() {
    const $text = this.$refs.text;
    if (this.maxWidthInt && $text.offsetWidth > this.maxWidthInt) {
      $text.style.transform = `scaleX(${this.maxWidthInt / $text.offsetWidth})`;
    }
  },
};
</script>

<style scoped>
.scale-text {
  transform-origin: left;
}
</style>
