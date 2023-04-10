<template>
  <div
    v-if="show"
    class="router-loading mdui-typo"
    :class="{ 'mdui-theme-primary-red': isDownloadError }"
  >
    <div class="mdui-typo-display-1 mdui-m-b-2">{{ $t('common.loading') }}</div>
    <img v-if="!$root.dark" class="amiya-img" src="@/assets/img/amiya.gif" />
    <img v-else class="amiya-img" src="@/assets/img/amiya-dark.gif" />
    <div class="mdui-progress mdui-m-t-4 mdui-m-b-1">
      <div class="mdui-progress-determinate" :style="{ width: progressWidth }"></div>
    </div>
    <p :class="{ 'mdui-text-color-red': isDownloadError }">{{ downloadTip }}</p>
    <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.pinkBtn" @click="initData">{{
      $t('common.retry')
    }}</button>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import { useHotUpdateStore } from '@/store/hotUpdate';

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
  computed: {
    ...mapState(useHotUpdateStore, ['downloadPercent', 'downloadTip', 'isDownloadError']),
    progressWidth() {
      return `${(this.downloadPercent * 100).toFixed(2)}%`;
    },
  },
  methods: {
    ...mapActions(useHotUpdateStore, ['initData']),
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
