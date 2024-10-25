<template>
  <div class="mdui-card">
    <div class="mdui-card-header">
      <img class="mdui-card-header-avatar" :src="item.avatar" />
      <div class="mdui-card-header-title">{{ item.name }}</div>
      <div class="mdui-card-header-subtitle">{{ item.slogan }}</div>
    </div>

    <div class="mdui-card-content mdui-p-y-0">
      <div class="link-card-tags">
        <div v-for="(tag, i) of item.tags" :key="i" class="mdui-chip mdui-m-a-0">
          <span class="mdui-chip-title">{{ tag }}</span>
        </div>
      </div>
      <p>{{ item.description }}</p>
    </div>

    <div class="mdui-card-actions">
      <button class="mdui-btn mdui-ripple">action 1</button>
      <button class="mdui-btn mdui-ripple">action 2</button>
    </div>
  </div>
</template>

<script setup>
import { pick } from 'lodash';
import { computed, inject } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const isLocaleZH = computed(() => inject('getRoot')?.()?.$root.localeZH);

const getLocalizedText = obj => obj[isLocaleZH.value ? 'zh_CN' : 'en_US'] || obj.zh_CN || obj.en_US;

const item = computed(() => {
  const data = props.item;

  return {
    name: getLocalizedText(data.localized_name),
    description: getLocalizedText(data.localized_description),
    slogan: getLocalizedText(data.localized_slogan),
    tags: getLocalizedText(data.localized_tags),
    avatar: data.icon_url,
    links: data.links.map(link => ({
      ...pick(link, ['primary', 'regionality', 'url']),
      name: getLocalizedText(link.localized_name),
    })),
  };
});
</script>

<style lang="scss" scoped>
.link-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .mdui-chip {
    cursor: default;

    &:hover,
    &:focus {
      box-shadow: none;
    }
  }
}

.mdui-card {
  display: flex;
  flex-direction: column;
}

.mdui-card-actions {
  margin-top: auto;
}
</style>
