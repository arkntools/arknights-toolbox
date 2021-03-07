<template>
  <div class="mdui-spinner" :class="{ 'mdui-spinner-colorful': colorful }" ref="spinner"></div>
</template>

<script>
export default {
  props: {
    colorful: Boolean,
  },
  mounted() {
    this.$mutation(this.$refs.spinner);
  },
};
</script>
