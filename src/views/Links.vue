<template>
  <div id="recommended-links">
    <div class="link-list">
      <LinkCard v-for="item in linkList" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, shallowRef } from 'vue';
import { createInstance } from 'localforage';
import LinkCard from '@/components/links/LinkCard.vue';

const storage = createInstance({ name: 'recommended-links' });

const linkList = shallowRef([]);

onMounted(() => {
  initLinkList();
});

const initLinkList = async () => {
  const { data, timestamp } = storage.getItems(['data', 'timestamp']);

  if (Array.isArray(data)) {
    linkList.value = data;
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

  linkList.value = data;
};
</script>

<style lang="scss" scoped>
.link-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
}

@media screen and (max-width: 600px) {
  .link-list {
    grid-template-columns: 1fr;
  }
}
</style>
