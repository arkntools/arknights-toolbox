import { defineStore } from 'pinia';
import { ref } from 'vue';
import { get as idbGet, set as idbSet, setMany as idbSetMany } from 'idb-keyval';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';

const getPenguinDataStoreKey = server => `penguinData/${server}`;

const migrateDataPromise = (async () => {
  const penguinDataStorage = new NamespacedLocalStorage('penguinData');
  try {
    const stored = penguinDataStorage.entries();
    if (!stored.length) return;
    await idbSetMany(stored.map(([k, v]) => [getPenguinDataStoreKey(k), v]));
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
      ...(await idbGet(getPenguinDataStoreKey(server))),
    };
  };

  const fetchPenguinData = async (server, host = 'penguin-stats.io') => {
    try {
      const data = await fetch(
        `https://${host}/PenguinStats/api/v2/result/matrix?server=${server}`,
      ).then(r => r.json());
      const newData = { time: Date.now(), data };
      idbSet(getPenguinDataStoreKey(server), newData);
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
