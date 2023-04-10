<template>
  <div>
    <h2>{{ $t('home.dataState') }}</h2>
    <p>{{ $t('home.currentState') }}{{ $t(`home.dataStatus.${store.dataStatus}`) }}</p>
    <p
      >{{ $t('home.dataUpdateDate') }}<code v-if="store.timestamp">{{ dataUpdateDate }}</code></p
    >
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useHotUpdateStore } from '@/store/hotUpdate';
import { dateTime } from '@/utils/formatter';

const store = useHotUpdateStore();

const dataUpdateDate = computed(() => dateTime.format(store.timestamp));
</script>
