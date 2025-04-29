import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { createInstance } from 'localforage';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';

const dataStorage = createInstance({ name: 'penguin-data' });

const migrateDataPromise = (async () => {
  const penguinDataStorage = new NamespacedLocalStorage('penguinData');
  try {
    const stored = penguinDataStorage.entries();
    if (!stored.length) return;
    await dataStorage.setItems(stored.map(([key, value]) => ({ key, value })));
  } finally {
    penguinDataStorage.clear();
  }
})();

export const usePenguinDataStore = defineStore('penguinData', () => {
  const penguinData = ref({ time: 0, data: null });
  const curPenguinDataServer = ref('');

  const penguinDataValidMatrix = computed(() => {
    const now = Date.now();

    // 排除掉已过期的限时掉落
    const matrix = penguinData.value.data?.matrix?.filter(({ end }) => !end || end > now);

    if (!matrix?.length) return matrix;

    const toughMap = new Map(
      matrix
        .filter(({ stageId }) => stageId.startsWith('tough_'))
        .map(item => [`${item.stageId.replace('tough', 'main')}_${item.itemId}`, item]),
    );

    return matrix
      .map(item => {
        // 合并磨难与普通的掉落
        if (item.stageId.startsWith('main_')) {
          const toughItem = toughMap.get(`${item.stageId}_${item.itemId}`);
          if (toughItem) {
            return {
              ...item,
              times: item.times + toughItem.times,
              quantity: item.quantity + toughItem.quantity,
            };
          }
        }
        return item;
      })
      .filter(({ stageId }) => !stageId.startsWith('tough_'));
  });

  const loadPenguinData = async server => {
    if (curPenguinDataServer.value === server) return;
    await migrateDataPromise;
    curPenguinDataServer.value = server;
    penguinData.value = {
      time: 0,
      data: null,
      ...(await dataStorage.getItem(server)),
    };
  };

  const fetchPenguinData = async (server, host = 'penguin-stats.io') => {
    try {
      const data = await fetch(
        `https://${host}/PenguinStats/api/v2/result/matrix?server=${server}`,
      ).then(r => r.json());
      const newData = { time: Date.now(), data };
      dataStorage.setItem(server, newData);
      penguinData.value = newData;
      curPenguinDataServer.value = server;
      return true;
    } catch (error) {
      console.error('[FetchPenguinData]', error);
      return false;
    }
  };

  return {
    penguinData,
    penguinDataValidMatrix,
    curPenguinDataServer,
    loadPenguinData,
    fetchPenguinData,
  };
});
