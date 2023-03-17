/* eslint-disable no-console */
import _ from 'lodash';
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { createInstance } from 'localforage';
import EventEmitter from 'eventemitter3';
import i18n from '@/i18n';

const CUR_VERSION = '1.';

const dataStorage = createInstance({ name: 'toolbox-data' });
const metaStorage = createInstance({ name: 'toolbox-data-meta' });

export const hotUpdateEmitter = new EventEmitter();

const fetchCache = new Map();

const getExtname = url => /\.([^.]+)$/.exec(url)?.[1];

const fetchData = async url => {
  if (fetchCache.has(url)) {
    console.log('[HotUpdate] fetch from cache', url);
    return fetchCache.get(url);
  }
  console.log('[HotUpdate] fetch', url);
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

let dataReadyResolve;
export const dataReadyAsync = new Promise(resolve => {
  dataReadyResolve = resolve;
});

export const DataStatus = {
  ERROR: -1,
  EMPTY: 0,
  LOADING: 1,
  COMPLETED: 2,
};

export const useHotUpdateStore = defineStore('hotUpdate', () => {
  const baseURL = process.env.VUE_APP_DATA_BASE_URL || '/data';
  const mapMd5 = ref('');
  const timestamp = ref(0);
  const md5Map = ref({});
  const dataMap = ref({});
  const dataStatus = ref(DataStatus.EMPTY);

  const dataReady = computed(() => _.size(dataMap.value) > 0);
  (() => {
    const unwatch = watch(dataReady, val => {
      if (!val) return;
      unwatch();
      dataReadyResolve();
      watch(
        dataMap,
        () => {
          hotUpdateEmitter.emit('update');
        },
        { deep: true },
      );
    });
  })();

  const initData = async () => {
    try {
      await Promise.all([metaStorage.ready(), dataStorage.ready()]);

      const meta = await metaStorage.getItems(['mapMd5', 'md5Map', 'timestamp']);

      if (!meta.mapMd5 || !_.size(meta.md5Map)) {
        await updateData();
        return;
      }

      mapMd5.value = meta.mapMd5;
      timestamp.value = meta.timestamp;
      md5Map.value = meta.md5Map;
      dataMap.value = await dataStorage.getItems(await dataStorage.keys());
      updateI18n();

      console.log('[HotUpdate] check data update');

      await updateData();
    } catch (error) {
      console.error('[HotUpdate] init data', error);
      dataStatus.value = DataStatus.ERROR;
    }
  };

  const updateData = async () => {
    const check = await fetchData(`${baseURL}/check.json`);
    if (check.mapMd5 === mapMd5.value || !check.version.startsWith(CUR_VERSION)) {
      console.log('[HotUpdate] already up to date');
      fetchCache.clear();
      return;
    }

    console.log('[HotUpdate] start update');
    dataStatus.value = DataStatus.LOADING;

    const newMapMd5 = await fetchData(`${baseURL}/map.${check.mapMd5}.json`);
    const needUpdateUrlMap = getUrlMap(
      baseURL,
      _.pickBy(
        newMapMd5,
        (val, key) => val !== md5Map.value[key] && (key.endsWith('.json') || key.endsWith('.css')),
      ),
    );

    const newDataMap = _.fromPairs(
      await Promise.all(
        Object.entries(needUpdateUrlMap).map(async ([key, url]) => [key, await fetchData(url)]),
      ),
    );

    mapMd5.value = check.mapMd5;
    timestamp.value = check.timestamp;
    md5Map.value = newMapMd5;
    dataMap.value = { ...dataMap.value, ...newDataMap };
    updateI18n();

    fetchCache.clear();

    await dataStorage.setItems(newDataMap);
    await metaStorage.setItems({
      mapMd5: check.mapMd5,
      md5Map: newMapMd5,
      timestamp: check.timestamp,
      version: check.version,
    });

    const extraDataKeys = _.pullAll(await dataStorage.keys(), Object.keys(newMapMd5));
    if (extraDataKeys.length) await dataStorage.removeItems(extraDataKeys);

    console.log('[HotUpdate] update completed');
    dataStatus.value = DataStatus.COMPLETED;
  };

  const updateI18n = () => {
    const messageMap = {};
    _.each(
      _.pickBy(dataMap.value, (v, k) => k.startsWith('locales/')),
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
  };

  return {
    mapMd5,
    timestamp,
    dataMap,
    dataStatus,
    dataReady,
    initData,
  };
});
