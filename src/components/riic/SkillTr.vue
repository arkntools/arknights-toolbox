<template>
  <tr>
    <td
      v-if="skill.span"
      class="mdui-ripple no-wrap lh-1"
      width="1"
      :rowspan="skill.span"
      :class="{ 'no-border': skill.spanNoBorder }"
      @click="goToWiki(skill.cid)"
    >
      <div class="mdui-valign">
        <Avatar class="mdui-list-item-avatar mdui-m-a-0" :name="skill.cid" :lazy="true" />
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
      <DataImg
        class="building-skill-icon no-pe"
        type="building_skill"
        :name="buildingBuff.data[skill.id].icon"
        :lazy="true"
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
import DataImg from '@/components/DataImg.vue';
import { useDataStore } from '@/store/data';
import { RIIC_TAG_BTN_COLOR } from '@/utils/constant';
import { richText2HTML } from './richText2HTML';

export default defineComponent({
  name: 'skill-tr',
  components: { DataImg },
  props: {
    skill: Object,
  },
  data: () => ({
    color: RIIC_TAG_BTN_COLOR,
    avatarVisible: false,
  }),
  computed: {
    ...mapState(useDataStore, ['characterTable', 'buildingBuff']),
  },
  methods: {
    richText2HTML,
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
