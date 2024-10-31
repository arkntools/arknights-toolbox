<template>
  <div id="recommended-links">
    <div class="link-list">
      <LinkCard v-for="item in sortedLinkList" :key="item.id" :item="item" />
    </div>
    <div v-show="sortedLinkList.length" class="mdui-m-t-2">
      <small class="mdui-typo"
        >Powered by <a href="https://www.ceobecanteen.top/" target="_blank">Ceobe Canteen</a></small
      >
    </div>
  </div>
</template>

<script setup>
import { onMounted, shallowRef, computed } from 'vue';
import { groupBy, isEqual } from 'lodash';
import { createInstance } from 'localforage';
import LinkCard from '@/components/links/LinkCard.vue';
import { useCeobeApiUtils } from '@/utils/ceobeCanteen';

const { getLocalizedText } = useCeobeApiUtils();

const storage = createInstance({ name: 'recommended-links' });

const linkList = shallowRef([]);

const sortedLinkList = computed(() => {
  const startWithAlphabetRegexp = /^[a-z]/i;
  const { true: first = [], false: second = [] } = groupBy(linkList.value, item =>
    startWithAlphabetRegexp.test(getLocalizedText(item.localized_name)),
  );
  const sortMethod = (a, b) =>
    getLocalizedText(a.localized_name).localeCompare(getLocalizedText(b.localized_name));

  return [first, second].flatMap(list => list.sort(sortMethod));
});

onMounted(() => {
  initLinkList();
});

const initLinkList = async () => {
  const { data, timestamp } = await storage.getItems(['data', 'timestamp']);

  if (Array.isArray(data)) {
    setLinkList(data);
  }
  if (!Array.isArray(data) || !data.length || timestamp < Date.now() - 3600e3) {
    await fetchToolLinks();
  }
};

const fetchToolLinks = async () => {
  const { code, message, data } = await fetch(
    'https://server-cdn.ceobecanteen.top/api/v1/cdn/operate/toolLink/list',
  ).then(r => r.json());

  if (!Array.isArray(data) || !data.length) {
    if (Number(code) !== 0) throw new Error(`(${code})${message}`);
    console.warn('[FetchToolLinks] no data');
    return;
  }

  storage.setItem('data', data);
  storage.setItem('timestamp', Date.now());

  setLinkList(data);
};

const setLinkList = data => {
  const myId = '8be8bfc0-43ed-4bbc-b6da-450804f2bd5b';
  const ceobeCanteenId = '7811feb6-b473-4ee7-b83c-c8fabe4d1c4d';
  const ceobeCanteenSlogan = {
    zh_CN: '赋能小刻，万物皆为饼',
    en_US: 'Empower Ceobe, where everything is a cookie',
  };
  const emptySlogan = {
    zh_CN: '',
    en_US: '',
  };

  linkList.value = data
    .filter(item => item.id !== myId)
    .map(item =>
      item.id !== ceobeCanteenId && isEqual(item.localized_slogan, ceobeCanteenSlogan)
        ? { ...item, localized_slogan: emptySlogan }
        : item,
    );
};
</script>

<style lang="scss" scoped>
.link-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

@media screen and (max-width: 600px) {
  .link-list {
    grid-template-columns: 1fr;
  }
}
</style>
