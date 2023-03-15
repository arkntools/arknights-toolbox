import _ from 'lodash';
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useHotUpdateStore } from './hotUpdate';

export const useDataStore = defineStore('data', () => {
  const hotUpdateStore = useHotUpdateStore();
  const getData = name => hotUpdateStore.dataMap[`data/${name}.json`];

  const material = computed(() => getData('item'));
  const materialTable = computed(() =>
    _.mapValues(material.value, (obj, name) => ({ name, ...obj })),
  );

  return {
    materialTable,
  };
});
