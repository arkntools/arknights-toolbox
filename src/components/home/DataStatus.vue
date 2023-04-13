<template>
  <div>
    <h2>{{ $t('home.dataState') }}</h2>
    <div class="mdui-valign">
      <span :style="{ whiteSpace: 'pre-wrap' }">{{ $t('home.currentState') }}</span>
      <span v-show="store.isUpdateRunning" class="mdui-spinner mdui-spinner-colorful"></span>
      <i
        v-show="store.isUpdateComplete"
        class="status-icon mdui-icon material-icons mdui-text-color-green"
        >check</i
      >
      <i
        v-show="store.isUpdateError"
        class="status-icon mdui-icon material-icons mdui-text-color-red"
        >clear</i
      >
      {{ $t(`home.dataStatus.${store.dataStatus}`) }}
      <span class="mdui-m-l-1" v-if="store.downloadTip">{{ store.downloadTip }}</span>
    </div>
    <p
      >{{ $t('home.dataUpdateDate') }}<code>{{ dataUpdateDate }}</code></p
    >
    <button
      v-if="store.isUpdateError"
      class="mdui-btn mdui-ripple mdui-btn-raised"
      v-theme-class="$root.color.pinkBtn"
      @click="store.initData"
      >{{ $t('common.retry') }}</button
    >
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHotUpdateStore } from '@/store/hotUpdate';
import { dateTime } from '@/utils/formatter';

const store = useHotUpdateStore();

const dataUpdateDate = computed(() => (store.timestamp ? dateTime.format(store.timestamp) : '*'));
</script>

<style lang="scss" scoped>
.mdui-spinner {
  width: 1em;
  height: 1em;
  margin-right: 4px;
}
.status-icon {
  font-size: 1.4em;
  margin-right: 4px;
}
</style>
