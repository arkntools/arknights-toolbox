<template>
  <div class="arkn-item no-sl mdui-m-r-1 mdui-valign" :t="$root.materialT(t)">
    <div class="mdui-valign item-img-div" :style="`width:${width}px;height:${width}px`">
      <img class="no-pe item-img" :src="$root.materialImage(img)" :style="`transform:scale(${scale})`" crossorigin="anonymous" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'arkn-item',
  computed: {
    scale() {
      return this.width / 180;
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
.item-img {
  max-width: unset;
}
.item-img-div {
  justify-content: center;
}
</style>
