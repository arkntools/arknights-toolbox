import _ from 'lodash';
import { defineStore } from 'pinia';
import { createInstance } from 'localforage';
import { extendPrototype } from 'localforage-getitems';

const storage = createInstance({
  name: 'toolbox',
  storeName: 'data',
});

extendPrototype(storage);

export const useHotUpdateStore = defineStore('hotUpdate', {
  state: () => ({
    baseURL: process.env.NODE_ENV === 'development' ? '/gamedata' : '',
    sumMd5: '',
    /** @type {Record<string, string>} */
    md5Map: {},
  }),
  getters: {
    urlMap: state =>
      _.mapValues(state.md5Map, (md5, path) =>
        `${state.baseURL}/${path}`.replace(/\..*?$/, `.${md5}$&`),
      ),
  },
  actions: {
    async loadDate() {
      await storage.ready();

      const { sumMd5, md5Map } = await storage.getItems(['sumMd5', 'md5Map']);
      if (!sumMd5 || !_.size(md5Map)) {
        await this.updateData();
        await this.loadDate();
      }
    },
    async updateData() {},
  },
});
