<template>
  <div>
    <h2>{{ $t('home.dataState') }}</h2>
    <p
      >{{ $t('home.currentState')
      }}<span v-show="showLoadingIcon" class="mdui-spinner mdui-spinner-colorful"></span
      ><i
        v-show="showCompleteIcon"
        class="status-icon mdui-icon material-icons mdui-text-color-green"
        >check</i
      >{{ $t(`home.dataStatus.${store.dataStatus}`) }}</p
    >
    <p
      >{{ $t('home.dataUpdateDate') }}<code v-if="store.timestamp">{{ dataUpdateDate }}</code></p
    >
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DataStatus, useHotUpdateStore } from '@/store/hotUpdate';
import { dateTime } from '@/utils/formatter';

const store = useHotUpdateStore();

const dataUpdateDate = computed(() => dateTime.format(store.timestamp));
const showLoadingIcon = computed(
  () => store.dataStatus === DataStatus.CHECKING || store.dataStatus === DataStatus.UPDATING,
);
const showCompleteIcon = computed(
  () =>
    store.dataStatus === DataStatus.ALREADY_UP_TO_DATE ||
    store.dataStatus === DataStatus.UPDATE_COMPLETED,
);
// const showErrorIcon = computed(() => store.dataStatus === DataStatus.ERROR);
</script>

<style lang="scss" scoped>
.mdui-spinner {
  margin-right: 4px;
  width: 1em;
  height: 1em;
  vertical-align: text-top;
}
.status-icon {
  font-size: 1.2em;
  margin-right: 4px;
  vertical-align: text-top;
}
</style>
