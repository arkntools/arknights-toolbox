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

let dataReadyResolve;
export const dataReadyAsync = new Promise(resolve => {
  dataReadyResolve = resolve;
});

export const DataStatus = {
  ERROR: 'error',
  EMPTY: 'empty',
  CHECKING: 'checking',
  UPDATING: 'updating',
  ALREADY_UP_TO_DATE: 'alreadyUpToDate',
  UPDATE_COMPLETED: 'updateCompleted',
};

export const useHotUpdateStore = defineStore('hotUpdate', () => {
  const baseURL = ref(process.env.VUE_APP_DATA_BASE_URL?.replace(/\/$/, '') || '/data');
  const mapMd5 = ref('');
  const timestamp = ref(0);
  const md5Map = ref({});
  const dataMap = ref({});
  const dataStatus = ref(DataStatus.EMPTY);
  const isDownloadError = computed(() => dataStatus.value === DataStatus.ERROR);

  const downloadTip = ref('');
  const downloadedDataNum = ref(0);
  const totalDataNum = ref(0);
  const downloadPercent = computed(() =>
    totalDataNum.value ? Math.min(1, downloadedDataNum.value / totalDataNum.value) : 0,
  );

  let isIniting = false;
  let isUpdating = false;
  let checkInterval = null;

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
    if (isIniting) return;
    isIniting = true;

    try {
      await Promise.all([metaStorage.ready(), dataStorage.ready()]);

      const meta = await metaStorage.getItems(['mapMd5', 'md5Map', 'timestamp']);

      if (meta.mapMd5 && _.size(meta.md5Map)) {
        mapMd5.value = meta.mapMd5;
        timestamp.value = meta.timestamp;
        md5Map.value = meta.md5Map;
        dataMap.value = await dataStorage.getItems(await dataStorage.keys());
        updateI18n(dataMap.value);
        console.log('[HotUpdate] check data update');
      }

      await updateData();
      startCheckInterval();
    } catch (error) {
      console.error('[HotUpdate] init data', error);
      dataStatus.value = DataStatus.ERROR;
      downloadTip.value = String(error);
    } finally {
      isIniting = false;
    }
  };

  const updateData = async () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      dataStatus.value = DataStatus.CHECKING;
      const check = await fetchData(`${baseURL.value}/check.json`);
      if (check.mapMd5 === mapMd5.value || !check.version.startsWith(CUR_VERSION)) {
        dataStatus.value = DataStatus.ALREADY_UP_TO_DATE;
        console.log('[HotUpdate] already up to date');
        fetchCache.clear();
        return;
      }

      console.log('[HotUpdate] start update');
      dataStatus.value = DataStatus.UPDATING;
      downloadTip.value = '';
      downloadedDataNum.value = 0;
      totalDataNum.value = 0;

      const newMapMd5 = await fetchData(`${baseURL.value}/map.${check.mapMd5}.json`);
      const needUpdateUrlMap = getDataUrlMap(
        _.pickBy(
          newMapMd5,
          (val, key) =>
            val !== md5Map.value[key] && (key.endsWith('.json') || key.endsWith('.css')),
        ),
      );
      totalDataNum.value = _.size(needUpdateUrlMap);

      const newDataMap = _.fromPairs(
        await Promise.all(
          Object.entries(needUpdateUrlMap).map(async ([key, url]) => {
            const kv = [key, await fetchData(url)];
            if (isDownloadError.value) return;
            downloadTip.value = key;
            downloadedDataNum.value++;
            return kv;
          }),
        ),
      );

      mapMd5.value = check.mapMd5;
      timestamp.value = check.timestamp;
      md5Map.value = newMapMd5;
      dataMap.value = { ...dataMap.value, ...newDataMap };
      updateI18n(newDataMap);

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
      dataStatus.value = DataStatus.UPDATE_COMPLETED;
    } finally {
      isUpdating = false;
    }
  };

  const updateI18n = anyDataMap => {
    const localeDataMap = _.pickBy(anyDataMap, (v, k) => k.startsWith('locales/'));
    if (!_.size(localeDataMap)) return;
    const messageMap = {};
    _.each(localeDataMap, (data, path) => {
      const [, locale, filename] = path.split('/');
      const [key] = filename.split('.');
      if (!(locale in messageMap)) messageMap[locale] = {};
      messageMap[locale][key] = data;
    });
    _.each(messageMap, (message, locale) => {
      if (!_.size(message)) return;
      i18n.setLocaleMessage(locale, _.merge({}, i18n.messages[locale], message));
    });
  };

  const startCheckInterval = () => {
    if (checkInterval) return;
    checkInterval = setInterval(() => {
      updateData();
    }, 600 * 1000);
  };

  const getDataUrl = (key, md5 = md5Map.value[key]) => {
    return `${baseURL.value}/${key}`.replace(/\.[^.]+$/, `.${md5}$&`);
  };

  const getDataUrlMap = targetMap => _.mapValues(targetMap, (md5, key) => getDataUrl(key, md5));

  return {
    dataBaseURL: baseURL,
    mapMd5,
    timestamp,
    md5Map,
    dataMap,
    dataStatus,
    dataReady,
    downloadPercent,
    downloadTip,
    isDownloadError,
    initData,
    getDataUrl,
  };
});
