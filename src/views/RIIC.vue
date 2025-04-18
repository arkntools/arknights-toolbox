<template>
  <div id="arkn-riic">
    <div class="hidden" v-html="richTextStyleHtml"></div>
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
                v-for="(v, tagName) in buildingBuff.numKey[tagType]"
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
              v-model="setting.showUnreleased"
              >{{ $t('riic.setting.showUnreleased') }}</mdui-switch
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
                <th></th>
                <th>
                  {{ $t('riic.table.header.buff') }}
                  <div v-if="$root.smallScreen" class="small-screen-placeholder"></div>
                </th>
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
    <term-dialog ref="termDialog" @search="id => (reset(), setNameFilter($t(`term.${id}.name`)))" />
  </div>
</template>

<script>
import _ from 'lodash';
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import SkillTr from '@/components/riic/SkillTr.vue';
import TermDialog from '@/components/riic/TermDialog.vue';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import pickClone from '@/utils/pickClone';
import { removeRichTextTag, findTerm } from '@/components/riic/richText2HTML';
import { RIIC_TAG_BTN_COLOR } from '@/utils/constant';
import { useDataStore } from '@/store/data';

const nls = new NamespacedLocalStorage('riic');

const tagDisplay = [
  ['BUILDING'],
  ['MANUFACTURE', 'TRADING', 'CONTROL', 'DORMITORY', 'MEETING', 'WORKSHOP', 'TRAINING'],
];

export default defineComponent({
  name: 'arkn-riic',
  components: { SkillTr, TermDialog },
  data: () => ({
    color: RIIC_TAG_BTN_COLOR,
    tagDisplay,
    setting: {
      hideIrrelevant: false,
      showUnreleased: false,
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
    ...mapState(useDataStore, [
      'characterTable',
      'buildingBuff',
      'buildingChar',
      'enumTagMap',
      'richTextStyleHtml',
    ]),
    enumTag() {
      return this.enumTagMap.cn;
    },
    textColor() {
      return _.mapValues(this.color, arr =>
        arr.map(className => className.replace(/mdui-color/g, 'mdui-text-color')),
      );
    },
    display() {
      const result = _.transform(
        this.buildingChar,
        (arr, skills, name) => {
          if (!this.setting.showUnreleased && !this.$root.isReleasedChar(name)) return;
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
        const sortOrder = _.castArray(this.buildingBuff.numKey[selectBuilding][selectType]);
        result.sort((a, b) => {
          const [aMax, bMax] = [this.getSkillsMaxNum(a.skills), this.getSkillsMaxNum(b.skills)];
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
    displaySearchGroup() {
      return _.transform(
        this.display,
        (obj, char) => {
          const skillNames = char.skills.map(({ id }) => this.$t(`building.buff.name.${id}`));
          const skillDescs = char.skills.map(({ id }) =>
            removeRichTextTag(
              this.$t(`building.buff.description.${this.buildingBuff.data[id].desc}`),
            ),
          );
          obj[char.name] = {
            name: this.$root.getSearchGroup(this.characterTable[char.name]),
            skill: [...skillNames, ...skillDescs],
          };
        },
        {},
      );
    },
    displayWithNameFilter() {
      if (!this.nameFilter) return this.display;
      const inputForName = this.$root.pureName(this.nameFilter);
      const inputForSkill = this.nameFilter;
      const result = _.transform(
        this.display,
        (arr, char) => {
          const searchGroup = this.displaySearchGroup[char.name];
          const nameSearch = searchGroup.name.map(v => v.indexOf(inputForName) + 1 || Infinity);
          const skillSearch = searchGroup.skill.map(v => v.indexOf(inputForSkill) + 1 || Infinity);
          const search = [...nameSearch, ...skillSearch];
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
      const { building, is } = this.getInfoById(id);
      return selectBuilding === 'BUILDING'
        ? selectType === building
        : selectBuilding === building && selectType in is;
    },
    handleRiicSkillClick(e) {
      const term = findTerm(e, el => el.tagName === 'TD');
      const id = term?.dataset?.id;
      if (id) this.$refs.termDialog.show(id);
    },
    getInfoById(id) {
      return this.buildingBuff.info[this.buildingBuff.data[id].desc];
    },
    getSkillsMaxNum(skills) {
      return _.transform(
        skills,
        (max, { id }) => {
          const { num } = this.getInfoById(id);
          _.each(num, (v, k) => {
            if (!max[k] || max[k] < v) max[k] = v;
          });
        },
        {},
      );
    },
  },
  created() {
    (obj => obj && (this.setting = pickClone(this.setting, obj)))(nls.getItem('setting'));
  },
});
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
  .small-screen-placeholder {
    width: calc(100vw - 48px);
  }
}
</style>
