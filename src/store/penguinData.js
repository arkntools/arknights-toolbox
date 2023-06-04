import { defineStore } from 'pinia';
import { ref } from 'vue';
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
      console.error(error);
      return false;
    }
  };

  return {
    penguinData,
    curPenguinDataServer,
    loadPenguinData,
    fetchPenguinData,
  };
});
