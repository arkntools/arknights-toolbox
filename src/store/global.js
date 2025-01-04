import { defineStore } from 'pinia';
import { locales } from '@/constant/lang';

export const useGlobalStore = defineStore('globalData', {
  state: () => ({
    server: locales[0].short,
  }),
});
