import _ from 'lodash';
import { defineStore } from 'pinia';
import { createInstance } from 'localforage';

const CUR_VERSION = '1.';

const dataStorage = createInstance({ name: 'toolbox-data' });
const metaStorage = createInstance({ name: 'toolbox-data-meta' });

const fetchCache = new Map();

const fetchJson = async url => {
  if (fetchCache.has(url)) {
    // eslint-disable-next-line no-console
    console.log('Fetch data from cache:', url);
    return fetchCache.get(url);
  }
  const res = await fetch(url);
  const data = await res.json();
  fetchCache.set(url, data);
  // eslint-disable-next-line no-console
  console.log('Fetch data:', url);
  return data;
};

export const useHotUpdateStore = defineStore('hotUpdate', {
  state: () => ({
    baseURL: process.env.VUE_APP_DATA_BASE_URL || '/data',
    sumMd5: '',
    timestamp: 0,
    /** @type {Record<string, string>} */
    md5Map: {},
    /** @type {Record<string, any>} */
    dataMap: {},
  }),
  getters: {},
  actions: {
    async loadData() {
      await Promise.all([metaStorage.ready(), dataStorage.ready()]);

      const { sumMd5, md5Map } = await dataStorage.getItems(['sumMd5', 'md5Map']);

      if (!sumMd5 || !_.size(md5Map)) {
        await this.updateData();
        await this.loadData();
        return;
      }
    },
    async updateData() {
      const { md5: sumMd5, timestamp, version } = await fetchJson(`${this.baseURL}/check.json`);
      if (sumMd5 === this.sumMd5 || !version.startsWith(CUR_VERSION)) return;

      const md5Map = await fetchJson(`${this.baseURL}/map.json`);
      const needUpdateUrlMap = this.getUrlMap(
        _.pickBy(md5Map, (val, key) => val !== this.md5Map[key]),
      );

      const dataMap = _.fromPairs(
        await Promise.all(
          Object.entries(needUpdateUrlMap).map(async ([key, url]) => [key, await fetchJson(url)]),
        ),
      );

      this.sumMd5 = sumMd5;
      this.timestamp = timestamp;
      this.md5Map = md5Map;
      this.dataMap = { ...this.dataMap, ...dataMap };

      fetchCache.clear();

      await dataStorage.setItems(dataMap);
      await metaStorage.setItems({ sumMd5, md5Map, timestamp, version });

      const extraDataKeys = _.pull(await dataStorage.keys(), Object.keys(md5Map));
      if (extraDataKeys.length) await dataStorage.removeItems(extraDataKeys);
    },
    getUrlMap(md5Map) {
      return _.mapValues(md5Map, (md5, path) =>
        `${this.baseURL}/${path}`.replace(/\..*?$/, `.${md5}$&`),
      );
    },
  },
});
