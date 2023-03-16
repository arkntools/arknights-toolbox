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
        <avatar class="mdui-list-item-avatar mdui-m-a-0" :name="showImg ? skill.cid : ''" />
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
    <td class="mdui-p-y-0">
      <img
        class="building-skill-icon no-pe"
        :src="showImg ? `assets/img/building_skill/${buildingBuff.data[skill.id].icon}.png` : PNG1P"
        @error="handleImgErr"
      />
    </td>
    <td
      class="mdui-typo can-sl"
      v-html="richText2HTML($t(`building.buff.description.${buildingBuff.data[skill.id].desc}`))"
    ></td>
  </tr>
</template>

<script>
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useDataStore } from '@/store/data';
import { PNG1P, RIIC_TAG_BTN_COLOR } from '@/utils/constant';
import { richText2HTML } from './richText2HTML';

const $wrapper = document.getElementById('wrapper');

const getObserveOption = callback => ({
  callback,
  once: true,
  intersection: {
    root: $wrapper,
    rootMargin: '0px 0px 100% 0px',
  },
});

const handleImgErr = e => {
  e.target.style.display = 'none';
};

const loadedAvatar = {};

export default defineComponent({
  props: {
    skill: Object,
  },
  data: () => ({
    PNG1P,
    color: RIIC_TAG_BTN_COLOR,
    avatarVisible: false,
    loadedAvatar,
  }),
  computed: {
    ...mapState(useDataStore, ['characterTable', 'buildingBuff']),
    showImg() {
      return this.avatarVisible || this.loadedAvatar[this.skill.cid];
    },
  },
  methods: {
    handleImgErr,
    richText2HTML,
    getObserveOption,
    getInfoById(id) {
      return this.buildingBuff.info[this.buildingBuff.data[id].desc];
    },
    goToWiki(name) {
      const char = { name, ...this.characterTable[name] };
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
});
</script>

<style lang="scss" scoped>
.placeholder {
  height: 50px;
}
.building-skill-icon {
  display: block;
  width: 24px;
  height: 24px;
  margin: auto;
  background-color: #444;
  border-radius: 50%;
  border: solid #444 3px;
}
</style>
