<template>
  <div id="translation-contributors">
    <ul class="mdui-list mdui-col-md-4 mdui-col-sm-6" v-for="(list, lang) in contributors" :key="lang">
      <li class="mdui-subheader-inset">{{lang}}</li>
      <li class="mdui-list-item mdui-ripple" :class="{ 'cursor-unset': !person.url }" v-for="person in list" :key="person.name" @click="openLink(person)">
        <div class="mdui-list-item-avatar"><img :src="person.avatar" crossorigin="anonymous" /></div>
        <div class="mdui-list-item-content">{{person.name}}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'translation-contributors',
  data: () => ({
    contributors: {
      日本語: [
        {
          name: 'konayuki_kh',
          avatar: 'https://i.loli.net/2020/03/23/uh3sgZty5dQ7rJK.png',
        },
        {
          name: 'viewweiwu',
          avatar: 'https://avatars.githubusercontent.com/u/14287892',
          url: 'https://github.com/viewweiwu',
        },
      ],
    },
  }),
  methods: {
    openLink({ url }) {
      if (url) window.open(url, '_blank');
    },
  },
};
</script>
