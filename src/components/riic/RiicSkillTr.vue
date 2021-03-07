<template>
  <tr>
    <td
      v-if="skill.span"
      class="mdui-ripple no-wrap lh-1"
      width="1"
      :rowspan="skill.span"
      :class="{ 'no-border': skill.spanNoBorder }"
      @click="goToWiki(skill.cid)"
      v-observe-visibility="
        !loadedAvatar[skill.cid] &&
        getObserveOption(isVisible => {
          if (!isVisible) return;
          avatarVisible = true;
          $set(loadedAvatar, skill.cid, true);
        })
      "
    >
      <div class="mdui-valign">
        <avatar
          class="mdui-list-item-avatar mdui-m-a-0"
          :name="(avatarVisible || loadedAvatar[skill.cid]) && skill.cid"
        />
        <span class="mdui-m-l-1">{{ $t(`character.${skill.cid}`) }}</span>
      </div>
    </td>
    <td v-else class="hidden"></td>
    <td class="mdui-text-center no-wrap">{{ $t(`riic.table.unlock.${skill.unlock}`) }}</td>
    <td class="mdui-text-center mdui-hidden-sm-down no-wrap">{{
      $t(`building.name.${getInfoById(skill.id).building}`)
    }}</td>
    <td class="mdui-text-center no-wrap">
      <span class="skill-card" v-theme-class="color[getInfoById(skill.id).building]">{{
        $t(`building.buff.name.${skill.id}`)
      }}</span>
    </td>
    <td
      :class="$root.smallScreen ? 'no-wrap' : false"
      v-html="coloredDescription($t(`building.buff.description.${buff.description[skill.id]}`))"
    ></td>
  </tr>
</template>

<script>
import { characterTable } from '@/store/character.js';
import { buff } from '@/data/building.json';
import { RIIC_TAG_BTN_COLOR } from '@/utils/constant';

const descriptionColor = [
  { buff: 'mdui-text-color-blue', debuff: 'mdui-text-color-red' },
  { buff: 'mdui-text-color-blue-200', debuff: 'mdui-text-color-red-200' },
];

const getObserveOption = callback => ({
  callback,
  once: true,
  intersection: {
    rootMargin: '0px 0px 100% 0px',
  },
});

const loadedAvatar = {};

export default {
  props: {
    skill: Object,
  },
  data: () => ({
    buff,
    color: RIIC_TAG_BTN_COLOR,
    avatarVisible: false,
    loadedAvatar,
  }),
  methods: {
    getObserveOption,
    getInfoById: id => buff.info[buff.description[id]],
    goToWiki(name) {
      const char = { name, ...characterTable[name] };
      this.$confirm(
        this.$t('riic.viewOnWiki'),
        this.$t(`character.${name}`),
        () => window.open(this.$root.getWikiHref(char), '_blank'),
        () => {},
        {
          confirmText: this.$t('common.yes'),
          cancelText: this.$t('common.no'),
          history: false,
        },
      );
    },
    coloredDescription(str) {
      const { buff, debuff } = descriptionColor[this.$root.dark ? 1 : 0];
      return str
        .replace(/{{(.+?)}}/g, `<span class="${buff}">$1</span>`)
        .replace(/\[\[(.+?)\]\]/g, `<span class="${debuff}">$1</span>`);
    },
  },
};
</script>

<style lang="scss" scoped>
.placeholder {
  height: 50px;
}
</style>
