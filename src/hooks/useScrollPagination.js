import { shallowRef, computed, watch, onMounted, onScopeDispose } from 'vue';

export const useScrollPagination = ({ data, pageSize = 20, intersectionTarget }) => {
  const curPage = shallowRef(1);
  const displayData = computed(() => data.value.slice(0, curPage.value * pageSize));

  watch(data, () => {
    curPage.value = 1;
  });

  const nextPage = () => {
    if (data.value.length <= curPage.value * pageSize) return;
    curPage.value++;
  };

  const observer = new IntersectionObserver(nextPage, {
    rootMargin: '400px',
  });

  onMounted(() => {
    observer.observe(intersectionTarget.value);
  });

  onScopeDispose(() => {
    observer.disconnect();
  });

  return displayData;
};
