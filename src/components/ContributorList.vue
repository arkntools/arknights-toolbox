<template>
  <ul class="mdui-list">
    <li class="mdui-subheader-inset" v-if="title"
      ><i v-if="icon" class="mdui-icon material-icons">{{ icon }}</i
      >{{ title }}</li
    >
    <a
      class="mdui-list-item mdui-ripple"
      :class="{ 'cursor-unset': !person.url }"
      v-for="person in list"
      :key="person.name"
      :href="person.url"
      target="_blank"
    >
      <div class="mdui-list-item-avatar"><img :src="person.avatar" crossorigin="anonymous" /></div>
      <div class="mdui-list-item-content">{{ person.name }}</div>
    </a>
    <li v-for="i in 4" :key="`placeholder-${i}`" class="mdui-list-placeholder"></li>
  </ul>
</template>

<script>
export default {
  name: 'contributor-list',
  props: {
    title: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    icon: {
      type: String,
      default: '',
    },
  },
  methods: {
    openLink({ url }) {
      if (url) window.open(url, '_blank');
    },
  },
};
</script>

<style lang="scss" scoped>
.mdui {
  &-list {
    display: flex;
    flex-wrap: wrap;
    &-item,
    &-placeholder {
      min-width: 190px;
      flex-grow: 1;
    }
  }
  &-subheader-inset {
    flex-basis: 100%;
    .mdui-icon {
      position: absolute;
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
