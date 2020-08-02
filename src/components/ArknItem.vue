<template>
  <div class="arkn-item no-sl mdui-m-r-1 mdui-valign" :style="{ width: widthPx, height: widthPx }">
    <arkn-item-t :t="t" />
    <div class="mdui-valign item-img-div" :style="{ width: widthPx, height: widthPx }">
      <img
        class="no-pe item-img"
        :src="$root.materialImage(img)"
        :style="`transform:scale(${scale})`"
        crossorigin="anonymous"
      />
    </div>
  </div>
</template>

<script>
import ArknItemT from './ArknItemT';

export default {
  name: 'arkn-item',
  components: { ArknItemT },
  computed: {
    scale() {
      return this.width / 180;
    },
    widthPx() {
      return `${this.width}px`;
    },
  },
  props: {
    t: [Number, String],
    img: String,
    width: {
      type: Number,
      default: 48,
    },
  },
};
</script>

<style scoped>
.arkn-item {
  position: relative;
}
.item-t {
  position: absolute;
  width: 100%;
  height: 100%;
}
.item-img {
  max-width: unset;
}
.item-img-div {
  justify-content: center;
}
</style>
