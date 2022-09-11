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
      class="building-skill-icon mdui-p-y-0"
      :style="{
        '--icon-url': `url('assets/img/building_skill/${buff.data[skill.id].icon}.png')`,
      }"
    >
    </td>
    <td
      class="mdui-typo can-sl"
      v-html="richText2HTML($t(`building.buff.description.${buff.data[skill.id].desc}`))"
    ></td>
  </tr>
</template>

<script>
import { characterTable } from '@/store/character';
import { buff } from '@/data/building.json';
import { RIIC_TAG_BTN_COLOR } from '@/utils/constant';
import { richText2HTML } from './richText2HTML';

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
    richText2HTML,
    getObserveOption,
    getInfoById: id => buff.info[buff.data[id].desc],
    goToWiki(name) {
      const char = { name, ...characterTable[name] };
      this.$confirm(
        this.$t('riic.viewOnWiki'),
        this.$t(`character.${name}`),
        () => this.$root.openWikiHref(char),
        () => {},
        {
          confirmText: this.$t('common.yes'),
          cancelText: this.$t('common.no'),
          history: false,
        },
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.placeholder {
  height: 50px;
}
.building-skill-icon {
  width: 40px;
  &::after {
    content: '';
    display: block;
    width: 30px;
    height: 30px;
    margin: auto;
    background-size: 24px;
    background-image: var(--icon-url);
    background-repeat: no-repeat;
    background-position: center;
    background-color: #444;
    border-radius: 50%;
  }
}
</style>
