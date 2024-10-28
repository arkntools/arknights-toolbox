import { computed, inject } from 'vue';

export const useCeobeApiUtils = () => {
  const isLocaleZH = computed(() => inject('getRoot')?.()?.$root.localeZH);

  /**
   * @returns {string}
   */
  const getLocalizedText = obj =>
    obj[isLocaleZH.value ? 'zh_CN' : 'en_US'] ?? obj.zh_CN ?? obj.en_US ?? '';

  return {
    isLocaleZH,
    getLocalizedText,
  };
};
