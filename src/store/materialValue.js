import _, { mapValues } from 'lodash';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createInstance } from 'localforage';

const EXPIRE_TIME = 7 * 86400 * 1000;
const MAX_FETCH_TRY = 3;

const dataStorage = createInstance({ name: 'material-data' });

export const useMaterialValueStore = defineStore('materialValue', () => {
  const data = ref({});
  const time = ref(0);

  const dataReady = computed(() => _.size(data.value));
  const dataExpired = computed(() => time.value + EXPIRE_TIME < Date.now());

  let fetchFailed = 0;

  const loadData = async (force = false) => {
    if (force) {
      fetchData();
      return;
    }

    if (dataReady.value && !dataExpired.value) return;

    const stored = await dataStorage.getItems(['data', 'time']);
    if (Array.isArray(stored.data) && stored.data.length && stored.time) {
      data.value = getItemValueMap(stored.data);
      time.value = stored.time;
    }

    if (!dataReady.value || dataExpired.value) {
      fetchData();
    }
  };

  const fetchData = async () => {
    if (fetchFailed >= MAX_FETCH_TRY) return;
    try {
      const res = await fetch(
        'https://ark.yituliu.cn/backend/item/value?expCoefficient=0.625',
      ).then(r => r.json());
      if (!(Array.isArray(res.data) && res.data.length)) {
        console.error('[FetchMaterialValueData] fetch failed', res);
        throw new Error(res.msg);
      }
      const newTime = Date.now();
      dataStorage.setItems({
        data: res.data,
        time: newTime,
      });
      data.value = getItemValueMap(res.data);
      time.value = newTime;
    } catch (error) {
      console.error('[FetchMaterialValueData]', error);
      fetchFailed += 1;
    }
  };

  const calcStageEfficiency = dropTable => {
    if (!dataReady.value) return {};
    return mapValues(dropTable, drops => {
      let ap = 0;
      _.each(drops, (v, k) => {
        if (k in data.value && v > 0) {
          ap += v * data.value[k];
        }
      });
      return ap / drops.cost;
    });
  };

  return {
    loadMaterialValueData: loadData,
    calcStageEfficiency,
  };
});

const getItemValueMap = data =>
  _.fromPairs(data.map(({ itemId, itemValueAp }) => [itemId, itemValueAp]));
