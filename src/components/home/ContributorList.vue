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
      :data-note="getNote(person)"
    >
      <div class="mdui-list-item-avatar"><img :src="person.avatar" crossorigin="anonymous" /></div>
      <div class="mdui-list-item-content">{{ person.name }}</div>
    </a>
    <li v-for="i in 6" :key="`placeholder-${i}`" class="mdui-list-placeholder mdui-p-x-1"></li>
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
    noteProp: {
      type: String,
      default: '',
    },
  },
  methods: {
    openLink({ url }) {
      if (url) window.open(url, '_blank');
    },
    getNote(person) {
      return (this.noteProp && (person[this.noteProp] || []).join(' ')) || false;
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
      min-width: 155px;
      flex: 1;
    }
    &-placeholder {
      box-sizing: border-box;
    }
    &-item {
      padding: 0 8px;
      &::before {
        content: attr(data-note);
        position: absolute;
        top: 2px;
        right: 2px;
        font-size: 12px;
        text-transform: uppercase;
        transform: scale(0.9);
        opacity: 0.5;
      }
      &-avatar {
        min-width: 32px;
        max-width: 32px;
        height: 32px;
        line-height: 32px;
      }
    }
  }
  &-subheader-inset {
    flex-basis: 100%;
    padding-left: 56px;
    .mdui-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
