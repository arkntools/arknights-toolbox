<template>
  <div id="arkn-riic">
    <!-- 标签面板 -->
    <div
      id="drawer"
      :class="{ 'mdui-drawer mdui-drawer-right mdui-drawer-close': $root.smallScreen }"
    >
      <div id="filter-panel">
        <div class="mdui-row">
          <div
            class="mdui-col-xs-12 tag-group-outside"
            v-for="(tagTypeGroup, index) in tagDisplay"
            :key="index"
          >
            <div
              class="tag-group mobile-screen-flex-box equally"
              v-for="tagType of tagTypeGroup"
              :key="tagType"
            >
              <label class="mdui-textfield-label flex-full" v-theme-class="textColor[tagType]">{{
                tagType === 'BUILDING'
                  ? $tt(`riic.select.${tagType}`)
                  : $t(`building.name.${tagType}`)
              }}</label>
              <tag-button
                v-for="(v, tagName) in buff.numKey[tagType]"
                :class="{
                  'opacity-5': selected && !(selected[0] === tagType && selected[1] === tagName),
                }"
                :key="`${tagType}-${tagName}`"
                :notSelectedColor="color[tagType] || color.selected"
                :selectedColor="color[tagType] || color.selected"
                :canChange="false"
                @click="toggleTag(tagType, tagName)"
                >{{
                  tagType === 'BUILDING'
                    ? $t(`building.name.${tagName}`)
                    : tagType === 'TRAINING' && tagName !== '全能'
                    ? $t(`tag.${enumTag[`${tagName}干员`]}`)
                    : $tt(`riic.select.${tagName}`)
                }}</tag-button
              >
            </div>
          </div>
        </div>
        <div class="mdui-row mdui-m-t-2">
          <div class="mdui-col-xs-12" style="white-space: normal">
            <button
              class="mdui-btn mdui-ripple mdui-btn-dense tag-btn mdui-m-r-2"
              v-theme-class="$root.color.redBtn"
              @click="reset"
              >{{ $t('common.reset') }}</button
            >
            <mdui-switch
              class="mdui-m-r-2"
              v-for="key in settingList"
              :key="key"
              v-model="setting[key]"
              >{{ $t(`riic.setting.${key}`) }}</mdui-switch
            >
            <mdui-switch
              v-if="$root.serverNotCN"
              class="mdui-m-r-2"
              v-model="setting.showNotImplemented"
              >{{ $t('riic.setting.showNotImplemented') }}</mdui-switch
            >
          </div>
        </div>
        <div class="mdui-row">
          <div
            id="name-filter"
            class="mdui-col-xs-12 mdui-textfield mdui-textfield-floating-label mdui-textfield-has-clear"
          >
            <label class="mdui-textfield-label mdui-text-truncate">{{
              $t('riic.searchPlaceholder')
            }}</label>
            <input
              class="mdui-textfield-input"
              type="text"
              v-model.trim="nameFilterInput"
              @keydown.esc="nameFilterInput = ''"
            />
            <button
              class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense mdui-textfield-floating-label-clear"
              @click="clearNameFilter"
              ><i class="mdui-icon material-icons">close</i></button
            >
          </div>
        </div>
      </div>
    </div>
    <!-- 技能列表 -->
    <div :class="`mdui-row ${$root.smallScreen ? '' : 'mdui-m-t-4'}`">
      <div class="mdui-col-xs-12">
        <div class="mdui-table-fluid">
          <table class="mdui-table hide-last-tr-border" id="skill-table">
            <thead>
              <tr>
                <th class="mdui-text-center">{{ $t('riic.table.header.operator') }}</th>
                <th class="mdui-text-center">{{ $t('riic.table.header.unlock') }}</th>
                <th class="mdui-text-center mdui-hidden-sm-down">{{
                  $t('riic.table.header.building')
                }}</th>
                <th class="mdui-text-center">{{ $t('riic.table.header.skill') }}</th>
                <th>{{ $t('riic.table.header.buff') }}</th>
              </tr>
            </thead>
            <tbody @click="handleRiicSkillClick">
              <skill-tr
                v-for="skill in displaySkills"
                :key="`${skill.cid}-${skill.id}`"
                :skill="skill"
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 浮动按钮 -->
    <button
      v-if="$root.smallScreen"
      class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-ripple"
      v-theme-class="$root.color.pinkBtn"
      @click="
        if (!drawer) drawer = new $Drawer('#drawer');
        drawer.toggle();
      "
      ><i class="mdui-icon material-icons">sort</i></button
    >
    <scroll-to-top v-else />
    <term-dialog ref="termDialog" @search="id => (reset(), setNameFilter($t(`term.${id}.name`)))" />
  </div>
</template>

<script>
import ScrollToTop from '@/components/ScrollToTop';
import SkillTr from '@/components/riic/SkillTr';
import TermDialog from '@/components/riic/TermDialog';

import _ from 'lodash';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import pickClone from '@/utils/pickClone';
import { removeRichTextTag, findTerm } from '@/components/riic/richText2HTML';

import { characterTable } from '@/store/character';
import { char, buff } from '@/data/building.json';
import localeTagCN from '@/locales/cn/tag.json';

import { RIIC_TAG_BTN_COLOR } from '@/utils/constant';

const nls = new NamespacedLocalStorage('riic');

const enumTag = _.mapValues(_.invert(localeTagCN), parseInt);
Object.freeze(enumTag);

const tagDisplay = [
  ['BUILDING'],
  ['MANUFACTURE', 'TRADING', 'CONTROL', 'DORMITORY', 'MEETING', 'WORKSHOP', 'TRAINING'],
];

const getInfoById = id => buff.info[buff.description[id]];
const getSkillsMaxNum = skills =>
  _.transform(
    skills,
    (max, { id }) => {
      const { num } = getInfoById(id);
      _.each(num, (v, k) => {
        if (!max[k] || max[k] < v) max[k] = v;
      });
    },
    {},
  );

export default {
  name: 'arkn-riic',
  components: { ScrollToTop, SkillTr, TermDialog },
  data: () => ({
    enumTag,
    buff,
    characterTable,
    color: RIIC_TAG_BTN_COLOR,
    tagDisplay,
    setting: {
      hideIrrelevant: false,
      showNotImplemented: false,
    },
    settingList: ['hideIrrelevant'],
    drawer: null,
    selected: null,
    nameFilterInput: '',
    nameFilter: '',
    updateNameFilter: _.debounce(function (val) {
      this.nameFilter = val;
    }, 500),
  }),
  watch: {
    setting: {
      handler(val) {
        nls.setItem('setting', val);
      },
      deep: true,
    },
    nameFilterInput(val) {
      this.updateNameFilter(val);
      if (!val) this.updateNameFilter.flush();
    },
  },
  computed: {
    textColor() {
      return _.mapValues(this.color, arr =>
        arr.map(className => className.replace(/mdui-color/g, 'mdui-text-color')),
      );
    },
    display() {
      const result = _.transform(
        char,
        (arr, skills, name) => {
          if (!this.setting.showNotImplemented && !this.$root.isImplementedChar(name)) return;
          if (this.selected) {
            const relevantSkills = skills.filter(this.isSkillRelevant);
            if (relevantSkills.length > 0) {
              if (this.setting.hideIrrelevant) arr.push({ name, skills: relevantSkills });
              else arr.push({ name, skills });
            }
          } else arr.push({ name, skills });
        },
        [],
      ).reverse();
      if (this.selected) {
        const [selectBuilding, selectType] = this.selected;
        const sortOrder = _.castArray(buff.numKey[selectBuilding][selectType]);
        result.sort((a, b) => {
          const [aMax, bMax] = [getSkillsMaxNum(a.skills), getSkillsMaxNum(b.skills)];
          for (const key of sortOrder) {
            if (!aMax[key]) aMax[key] = 0;
            if (!bMax[key]) bMax[key] = 0;
            if (aMax[key] === 0 && bMax[key] === 0) continue;
            return bMax[key] - aMax[key];
          }
          return a.name.localeCompare(b.name);
        });
      }
      return result;
    },
    displayWithNameFilter() {
      if (!this.nameFilter) return this.display;
      const result = _.transform(
        this.display,
        (arr, char) => {
          const input = this.nameFilter.replace(/ /g, '');
          const skillIds = char.skills.map(({ id }) => this.$t(`building.buff.name.${id}`));
          const skillDescs = char.skills.map(({ id }) =>
            removeRichTextTag(this.$t(`building.buff.description.${buff.description[id]}`)),
          );
          const search = [
            ...this.$root.getSearchGroup(characterTable[char.name]),
            ...skillIds,
            ...skillDescs,
          ].map(v => v.indexOf(input) + 1 || Infinity);
          if (search.some(s => s !== Infinity)) {
            arr.push({ ...char, search, nl: this.$t(`character.${char.name}`).length });
          }
        },
        [],
      );
      if (!this.selected && result.length) {
        result.sort(({ search: a, nl: anl }, { search: b, nl: bnl }) => {
          for (let i = 0; i < Math.min(a.length, b.length); i++) {
            const compare = a[i] - b[i];
            if (!_.isNaN(compare)) return compare || anl - bnl;
          }
          return 0;
        });
      }
      return result;
    },
    displaySkills() {
      return _.flatMap(this.displayWithNameFilter, (item, itemIndex) =>
        item.skills.map((skill, index) => ({
          cid: item.name,
          index,
          ...skill,
          span: index === 0 ? item.skills.length : 0,
          spanNoBorder: itemIndex === this.displayWithNameFilter.length - 1,
        })),
      );
    },
  },
  methods: {
    reset() {
      this.selected = null;
    },
    toggleTag(...needSelect) {
      if (_.isEqual(this.selected, needSelect)) this.selected = null;
      else this.selected = needSelect;
    },
    setNameFilter(text) {
      this.nameFilterInput = text;
      this.$$('#name-filter').addClass('mdui-textfield-not-empty');
    },
    clearNameFilter() {
      this.nameFilterInput = '';
      this.$$('#name-filter').removeClass('mdui-textfield-not-empty');
    },
    isSkillRelevant({ id }) {
      const [selectBuilding, selectType] = this.selected;
      const { building, is } = getInfoById(id);
      return selectBuilding === 'BUILDING'
        ? selectType === building
        : selectBuilding === building && selectType in is;
    },
    handleRiicSkillClick(e) {
      const term = findTerm(e, el => el.tagName === 'TD');
      const id = term?.dataset?.id;
      if (id) this.$refs.termDialog.show(id);
    },
  },
  created() {
    (obj => obj && (this.setting = pickClone(this.setting, obj)))(nls.getItem('setting'));
  },
};
</script>

<style lang="scss">
#arkn-riic {
  .skill-card {
    padding: 4px;
    font-size: 12px;
  }
  .tag-group-outside {
    white-space: normal;
    padding-right: 4px;
  }
  .tag-group {
    display: inline-block;
    padding: 4px 0;
    white-space: normal;
  }
  .mdui-color-cyan-300 {
    color: #fff !important;
  }
  #skill-table {
    td,
    th {
      padding: 8px 8px;
      &:first-child {
        padding-left: 16px;
      }
      &:last-child {
        padding-right: 16px;
      }
    }
  }
  #drawer {
    min-width: 305px;
    &.mdui-drawer-right {
      transform: translateX(305px);
    }
  }
  .mdui-drawer #filter-panel {
    padding: 8px;
  }
  .riic-term {
    cursor: pointer;
    .riic-rt {
      position: relative;
      display: inline-block;
      overflow: hidden;
      vertical-align: top;
      transition: all 0.2s;
      &::before {
        content: '';
        position: absolute;
        top: auto;
        bottom: 1px;
        left: 0;
        width: 100%;
        height: 1px;
      }
      &:hover {
        filter: brightness(1.15);
      }
    }
  }
}
</style>
