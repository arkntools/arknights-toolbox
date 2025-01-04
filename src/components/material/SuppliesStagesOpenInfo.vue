<template>
  <div v-if="info" class="supplies-info" :class="{ 'is-dark': isDark }">
    <MiniChip
      class="flex-no-shrink"
      :class="{
        'mdui-color-green-700': info.isOpen,
        'mdui-color-grey-600': !info.isOpen,
      }"
      :height="18"
      >{{ $t(`cultivate.suppliesStages.${info.isOpen ? 'open' : 'close'}`) }}</MiniChip
    >
    <div v-if="info.days" class="open-days mdui-m-l-1">
      <div
        v-for="i in 7"
        :key="i"
        class="open-days-item"
        :class="{
          'is-open': info.days.has(i),
          'is-today': store.curDay === i,
        }"
        >{{ i }}</div
      >
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useSuppliesStagesOpenStore } from '@/store/suppliesStagesOpen';

const props = defineProps({
  itemId: [String, Number],
  stageCode: String,
});

const store = useSuppliesStagesOpenStore();

const isDark = inject('isDark')();

const info = computed(() =>
  props.itemId
    ? store.getItemSuppliesStageOpenInfo(props.itemId)
    : props.stageCode
      ? store.getSuppliesStageOpenInfo(props.stageCode)
      : undefined,
);
</script>

<style lang="scss" scoped>
.supplies-info {
  display: flex;
  align-items: center;
}

.open-days {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.open-days-item {
  --text-color: #444;
  --active-text-color: #fff;
  --active-bg-color: #666;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  font-weight: bold;
  width: 14px;
  height: 14px;
  color: var(--text-color);
  border: solid 2px var(--active-bg-color);

  &.is-open {
    background-color: var(--active-bg-color);
    color: var(--active-text-color);
  }

  &.is-today::before {
    content: 'TODAY';
    position: absolute;
    color: var(--text-color);
    top: calc(-100% - 2px);
  }
}

.is-dark {
  .open-days-item {
    --text-color: #ccc;
    --active-text-color: #000;
    --active-bg-color: #aaa;
  }
}
</style>
