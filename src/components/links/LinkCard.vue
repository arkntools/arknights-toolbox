<template>
  <div class="mdui-card">
    <div class="mdui-card-header">
      <img class="mdui-card-header-avatar no-pe" :src="item.avatar" />
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

    <div class="mdui-card-actions mdui-p-t-0">
      <button
        class="mdui-btn mdui-ripple"
        v-for="(link, i) in item.links"
        :key="i"
        :class="link.primary ? 'mdui-text-color-theme-accent' : 'mdui-text-color-theme-secondary'"
        @click="() => openLink(link)"
        >{{ link.name }}</button
      >
    </div>
  </div>
</template>

<script setup>
import { omit } from 'lodash';
import { computed } from 'vue';
import { useCeobeApiUtils } from '@/utils/ceobeCanteen';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const { getLocalizedText } = useCeobeApiUtils();

const item = computed(() => {
  const data = props.item;

  return {
    name: getLocalizedText(data.localized_name),
    description: getLocalizedText(data.localized_description),
    slogan: getLocalizedText(data.localized_slogan),
    tags: getLocalizedText(data.localized_tags),
    avatar: data.icon_url,
    links: data.links.map(link => ({
      ...omit(link, ['localized_name']),
      name: getLocalizedText(link.localized_name),
    })),
  };
});

const openLink = ({ url }) => {
  window.open(url, '_blank');
};
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

.mdui-card-header {
  height: unset;
}

.mdui-card-header-subtitle {
  white-space: normal;
}

.mdui-card-actions {
  margin-top: auto;
}

.mdui-card-header-avatar {
  object-fit: cover;
}
</style>
