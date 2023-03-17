<template>
  <div v-if="show" class="router-loading mdui-typo">
    <div class="mdui-typo-display-1 mdui-m-b-2">Loading</div>
    <img v-if="!$root.dark" class="amiya-img" src="@/assets/img/amiya.gif" />
    <img v-else class="amiya-img" src="@/assets/img/amiya-dark.gif" />
    <div class="mdui-progress mdui-m-t-4">
      <div class="mdui-progress-determinate" style="width: 30%"></div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'router-loading',
  data: () => ({
    show: false,
  }),
  mounted() {
    setTimeout(() => {
      this.show = true;
    }, 200);
  },
});
</script>

<style lang="scss" scoped>
.router-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mdui-progress {
  max-width: 400px;
}
.amiya-img {
  transform: translateX(12.5%);
  pointer-events: none;
  mask-image: linear-gradient(transparent, #fff, #fff, #fff);
}
</style>
