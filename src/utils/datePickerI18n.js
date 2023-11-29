import { useLocale } from '@/i18n';
import { shallowRef, watch } from 'vue';

const importMap = {
  cn: () => import('vue2-datepicker/locale/zh-cn'),
  us: () => import('vue2-datepicker/locale/en'),
  jp: () => import('vue2-datepicker/locale/ja'),
  kr: () => import('vue2-datepicker/locale/ko'),
  tw: () => import('vue2-datepicker/locale/zh-tw'),
};

export const useDatePickerI18n = () => {
  const localeData = shallowRef();
  const locale = useLocale();

  watch(
    locale,
    async val => {
      if (!(val in importMap)) return;
      localeData.value = (await importMap[val]()).default;
    },
    { immediate: true },
  );

  return localeData;
};
