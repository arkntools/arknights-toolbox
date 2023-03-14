/* eslint-disable no-console */
import _ from 'lodash';
import { defineStore } from 'pinia';
import { createInstance } from 'localforage';
import i18n from '@/i18n';

const CUR_VERSION = '1.';

const dataStorage = createInstance({ name: 'toolbox-data' });
const metaStorage = createInstance({ name: 'toolbox-data-meta' });

const fetchCache = new Map();

const getExtname = url => /\.([^.]+)$/.exec(url)?.[1];

const fetchData = async url => {
  if (fetchCache.has(url)) {
    console.log('fetch from cache', url);
    return fetchCache.get(url);
  }
  console.log('fetch', url);
  const res = await fetch(url);
  let data;
  switch (getExtname(url)) {
    case 'json':
      data = await res.json();
      break;
    case 'css':
      data = await res.text();
      break;
    default:
      data = await res.arrayBuffer();
      break;
  }
  fetchCache.set(url, data);
  return data;
};

const getUrlMap = (baseURL, md5Map) =>
  _.mapValues(md5Map, (md5, path) => `${baseURL}/${path}`.replace(/\..*?$/, `.${md5}$&`));

export const DataStatus = {
  ERROR: -1,
  EMPTY: 0,
  LOADING: 1,
  COMPLETED: 2,
};

export const useHotUpdateStore = defineStore('hotUpdate', {
  state: () => ({
    baseURL: process.env.VUE_APP_DATA_BASE_URL || '/data',
    mapMd5: '',
    timestamp: 0,
    /** @type {Record<string, string>} */
    md5Map: {},
    /** @type {Record<string, any>} */
    dataMap: {},
    dataStatus: DataStatus.EMPTY,
  }),
  getters: {
    dataReady: state => _.size(state.dataMap) > 0,
  },
  actions: {
    async initData() {
      try {
        await Promise.all([metaStorage.ready(), dataStorage.ready()]);

        const { mapMd5, md5Map, timestamp } = await metaStorage.getItems([
          'mapMd5',
          'md5Map',
          'timestamp',
        ]);

        if (!mapMd5 || !_.size(md5Map)) {
          await this.updateData();
          return;
        }

        this.mapMd5 = mapMd5;
        this.timestamp = timestamp;
        this.md5Map = md5Map;
        this.dataMap = await dataStorage.getItems(await dataStorage.keys());
        this.updateI18n();

        console.log('check data update');

        await this.updateData();
      } catch (error) {
        console.error('[InitDataError]', error);
        this.dataStatus = DataStatus.ERROR;
      }
    },
    async updateData() {
      const { mapMd5, timestamp, version } = await fetchData(`${this.baseURL}/check.json`);
      if (mapMd5 === this.mapMd5 || !version.startsWith(CUR_VERSION)) {
        console.log('already up to date');
        fetchCache.clear();
        return;
      }

      console.log('start update');
      this.dataStatus = DataStatus.LOADING;

      const md5Map = await fetchData(`${this.baseURL}/map.${mapMd5}.json`);
      console.log({ ...md5Map });
      console.log({ ...this.md5Map });
      const needUpdateUrlMap = getUrlMap(
        this.baseURL,
        _.pickBy(
          md5Map,
          (val, key) => val !== this.md5Map[key] && (key.endsWith('.json') || key.endsWith('.css')),
        ),
      );
      console.log(needUpdateUrlMap);

      const dataMap = _.fromPairs(
        await Promise.all(
          Object.entries(needUpdateUrlMap).map(async ([key, url]) => [key, await fetchData(url)]),
        ),
      );

      this.mapMd5 = mapMd5;
      this.timestamp = timestamp;
      this.md5Map = md5Map;
      this.dataMap = { ...this.dataMap, ...dataMap };
      this.updateI18n();

      fetchCache.clear();

      await dataStorage.setItems(dataMap);
      await metaStorage.setItems({ mapMd5, md5Map, timestamp, version });

      const extraDataKeys = _.pullAll(await dataStorage.keys(), Object.keys(md5Map));
      if (extraDataKeys.length) await dataStorage.removeItems(extraDataKeys);

      console.log('update completed');
      this.dataStatus = DataStatus.COMPLETED;
    },
    updateI18n() {
      const messageMap = {};
      _.each(
        _.pickBy(this.dataMap, (v, k) => k.startsWith('locales/')),
        (data, path) => {
          const [, locale, filename] = path.split('/');
          const [key] = filename.split('.');
          if (!(locale in messageMap)) messageMap[locale] = {};
          messageMap[locale][key] = data;
        },
      );
      _.each(messageMap, (message, locale) => {
        i18n.setLocaleMessage(locale, _.merge({}, i18n.messages[locale], message));
      });
    },
  },
});
