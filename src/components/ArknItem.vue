<template>
  <DataImg
    class="arkn-item mdui-m-r-1"
    type="item"
    :name="name"
    :style="{ width: widthCss, height: widthCss }"
    :error-style="true"
  />
</template>

<script>
import { defineComponent } from 'vue';
import DataImg from './DataImg.vue';

export default defineComponent({
  name: 'arkn-item',
  components: { DataImg },
  props: {
    name: [Number, String],
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
});
</script>

<style scoped>
.arkn-item {
  position: relative;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
}
</style>
