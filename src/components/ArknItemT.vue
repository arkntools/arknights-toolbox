<template>
  <img v-if="1 <= t && t <= 6" class="no-pe item-t" :src="$root.materialImage(`T${t}`)" crossorigin="anonymous" />
</template>

<script>
export default {
  name: 'arkn-item-t',
  props: {
    t: [Number, String],
  },
};
</script>

<style scoped>
.item-t {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
