<template>
  <div class="num-item">
    <div class="mdui-valign">
      <ArknItem :name="img" :width="width" />
      <div class="num-item-text with-label" :class="color">
        <label class="mdui-textfield-label mdui-text-truncate">{{ label }}</label>
        <span v-if="hasNum">{{ format ? $formatter.number.format(num) : num }}</span>
        <span v-else><slot></slot></span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ArknItem from './ArknItem.vue';

export default defineComponent({
  name: 'arkn-num-item',
  components: {
    ArknItem,
  },
  props: {
    img: String,
    label: String,
    num: [Number, String],
    width: Number,
    color: [String, Boolean],
    format: Boolean,
  },
  computed: {
    hasNum() {
      return typeof this.num !== 'undefined';
    },
  },
});
</script>

<style lang="scss">
.num-item {
  display: inline-block;
  overflow: hidden;
}
// 材料详情
#arkn-material .num-item .mdui-textfield-label {
  color: inherit;
  font-weight: inherit;
  max-width: 100%;
}
.num-item-list {
  flex-wrap: wrap;
  display: flex;
}
.mdui-theme-layout-dark {
  .mdui-dialog-content {
    .num-item {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}
</style>
