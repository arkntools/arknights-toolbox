<template>
  <div class="num-item">
    <div class="mdui-valign">
      <arkn-item :img="img" :width="width" />
      <div class="num-item-text with-label" :class="color">
        <label class="mdui-textfield-label mdui-text-truncate">{{ lable }}</label>
        <span v-if="typeof num != 'undefined'">{{ num }}</span>
        <span v-else><slot></slot></span>
      </div>
    </div>
  </div>
</template>

<script>
import ArknItem from './ArknItem';
export default {
  name: 'arkn-num-item',
  components: {
    ArknItem,
  },
  computed: {
    calcT() {
      if (this.t) return this.t;
      else {
        let search = /-(.+)-/.exec(this.img);
        if (search) return search[1];
        else return false;
      }
    },
  },
  props: {
    img: String,
    lable: String,
    num: [Number, String],
    width: Number,
    color: [String, Boolean],
  },
};
</script>

<style lang="scss">
.num-item {
  display: inline-block;
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
