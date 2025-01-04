import { ref, computed, markRaw } from 'vue';
import { defineStore } from 'pinia';
import { mapValues, transform } from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useGlobalStore } from './global';

dayjs.extend(utc);

/** @type {Record<string, Set<number>>} */
const stageOpenTable = mapValues(
  {
    AP: [1, 4, 6, 7],
    CA: [2, 3, 5, 7],
    'PR-A': [1, 4, 5, 7],
    'PR-B': [1, 2, 5, 6],
    'PR-C': [3, 4, 6, 7],
    'PR-D': [2, 3, 6, 7],
  },
  v => markRaw(new Set(v)),
);

const stageItemTable = {
  // 采购凭证
  AP: [4006],
  // 技巧概要
  CA: [3301, 3302, 3303],
  // 重装、医疗
  'PR-A': [3231, 3232, 3261, 3262],
  // 狙击、术师
  'PR-B': [3241, 3242, 3251, 3252],
  // 先锋、辅助
  'PR-C': [3211, 3212, 3271, 3272],
  // 近卫、特种
  'PR-D': [3221, 3222, 3281, 3282],
};

/** @type {Record<string, Set<number>>} */
const itemOpenTable = transform(
  stageItemTable,
  (obj, items, stage) => {
    items.forEach(item => {
      obj[item] = stageOpenTable[stage];
    });
  },
  {},
);

const serverHourOffsetMap = {
  cn: 8,
  tw: 8,
  us: -5,
  jp: 9,
  kr: 9,
};

export const useSuppliesStagesOpenStore = defineStore('suppliesStagesOpen', () => {
  const globalData = useGlobalStore();

  const curTime = ref(Date.now());
  // 考虑各服务器时区，并且游戏日起始时间为凌晨4点
  const serverHourOffset = computed(() => (serverHourOffsetMap[globalData.server] ?? 0) - 4);
  // 游戏实际使用星期
  const curDay = computed(() => {
    const day = dayjs.utc(curTime.value).add(serverHourOffset.value, 'hour').day();
    return day === 0 ? 7 : day;
  });

  const setSuppliesStagesCurTime = ts => {
    curTime.value = ts;
  };
  const isItemSuppliesStageOpen = id => itemOpenTable[id]?.has(curDay.value);
  const getItemSuppliesStageOpenInfo = id => {
    const daySet = itemOpenTable[id];
    if (!daySet) return;
    return {
      isOpen: daySet.has(curDay.value),
      days: daySet,
    };
  };
  const getSuppliesStageOpenInfo = code => {
    const prefix = code.substring(0, code.lastIndexOf('-'));
    const daySet = stageOpenTable[prefix];
    if (!daySet) return;
    return {
      isOpen: daySet.has(curDay.value),
      days: daySet,
    };
  };

  return {
    curDay,
    setSuppliesStagesCurTime,
    isItemSuppliesStageOpen,
    getItemSuppliesStageOpenInfo,
    getSuppliesStageOpenInfo,
  };
});
