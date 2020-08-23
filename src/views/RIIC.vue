<template>
  <div id="arkn-base">
    <!-- 标签面板 -->
    <div id="drawer" :class="$root.smallScreen ? 'mdui-drawer mdui-drawer-right mdui-drawer-close' : false">
      <div class="mdui-row">
        <div class="mdui-col-xs-12 tag-group-outside" v-for="(tagTypeGroup, index) in tagDisplay" :key="index">
          <div class="tag-group mobile-screen-flex-box equally" v-for="tagType of tagTypeGroup" :key="tagType">
            <label class="mdui-textfield-label flex-full" v-theme-class="textColor[tagType]">{{
              tagType === 'BUILDING' ? $tt(`riic.select.${tagType}`) : $t(`building.name.${tagType}`)
            }}</label>
            <tag-button
              v-for="(v, tagName) in buff.numKey[tagType]"
              :class="{ 'opacity-5': selected && !(selected[0] === tagType && selected[1] === tagName) }"
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
        <div class="mdui-col-xs-12" style="white-space: normal;">
          <button
            class="mdui-btn mdui-ripple mdui-btn-dense tag-btn mdui-m-r-2"
            v-theme-class="$root.color.redBtn"
            @click="reset"
            >{{ $t('common.reset') }}</button
          >
          <mdui-switch class="mdui-m-r-2" v-for="key in settingList" :key="key" v-model="setting[key]">{{
            $t(`riic.setting.${key}`)
          }}</mdui-switch>
          <mdui-switch v-if="$root.localeNotZH" class="mdui-m-r-2" v-model="setting.showNotImplemented">{{
            $t('riic.setting.showNotImplemented')
          }}</mdui-switch>
        </div>
      </div>
      <div class="mdui-row">
        <div
          id="name-filter"
          class="mdui-col-xs-12 mdui-textfield mdui-textfield-floating-label mdui-textfield-has-clear"
        >
          <label class="mdui-textfield-label">{{ $t('riic.searchPlaceholder') }}</label>
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
    <!-- 技能列表 -->
    <div :class="`mdui-row ${$root.smallScreen ? '' : 'mdui-m-t-4'}`">
      <div class="mdui-col-xs-12">
        <div class="mdui-table-fluid">
          <table class="mdui-table hide-last-tr-border" id="skill-table">
            <thead>
              <tr>
                <th class="mdui-text-center">{{ $t('riic.table.header.operator') }}</th>
                <th class="mdui-text-center">{{ $t('riic.table.header.unlock') }}</th>
                <th class="mdui-text-center mdui-hidden-sm-down">{{ $t('riic.table.header.building') }}</th>
                <th class="mdui-text-center">{{ $t('riic.table.header.skill') }}</th>
                <th>{{ $t('riic.table.header.buff') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(item, itemIndex) of displayWithNameFilter">
                <tr
                  v-for="(skill, skillIndex) in item.skills"
                  :key="`${item.name}-${skill.id}`"
                  :skill-index="skillIndex"
                  :class="{ 'last-item': itemIndex == displayWithNameFilter.length - 1 }"
                >
                  <td
                    :rowspan="item.skills.length"
                    v-if="skillIndex === 0"
                    class="mdui-ripple no-wrap lh-1"
                    width="1"
                    @click="goToWiki(item.name)"
                  >
                    <div class="mdui-valign">
                      <avatar
                        v-if="loadedImage[item.name]"
                        class="mdui-list-item-avatar mdui-m-a-0"
                        :name="item.name"
                      />
                      <lazy-component v-else class="lazy-avatar" :data-name="item.name" @show="lazyloadHandler">
                        <avatar class="mdui-list-item-avatar mdui-m-a-0" :name="item.name" />
                      </lazy-component>
                      <span class="mdui-m-l-1">{{ $t(`character.${item.name}`) }}</span>
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
        drawer ? null : (drawer = new $Drawer('#drawer'));
        drawer.toggle();
      "
      ><i class="mdui-icon material-icons">sort</i></button
    >
    <scroll-to-top v-else />
  </div>
</template>

<script>
import ScrollToTop from '@/components/ScrollToTop';
import _ from 'lodash';
import safelyParseJSON from '@/utils/safelyParseJSON';

import { characterTable } from '@/store/character.js';
import { char, buff } from '@/data/building.json';
import localeZhTag from '@/locales/cn/tag.json';

import { RIIC_TAG_BTN_COLOR } from '@/utils/constant';

const enumTag = _.mapValues(_.invert(localeZhTag), parseInt);
Object.freeze(enumTag);

const color = {
  notSelected: ['mdui-color-brown-300 mdui-ripple-black', 'mdui-color-grey-800'],
  selected: ['mdui-color-grey-800', 'mdui-color-brown-100 mdui-ripple-black'],
  MANUFACTURE: ['mdui-color-amber-400', 'mdui-color-amber-300'],
  TRADING: ['mdui-color-light-blue-700', 'mdui-color-light-blue-300'],
  POWER: ['mdui-color-green-600', 'mdui-color-green-300'],
  CONTROL: ['mdui-color-green-900', 'mdui-color-green-300'],
  DORMITORY: ['mdui-color-cyan-300', 'mdui-color-cyan-200'],
  MEETING: ['mdui-color-orange-900', 'mdui-color-orange-300'],
  WORKSHOP: ['mdui-color-lime-400', 'mdui-color-lime-300'],
  TRAINING: ['mdui-color-red-900', 'mdui-color-red-300'],
  HIRE: ['mdui-color-grey-700', 'mdui-color-grey-300'],
};
color.BUILDING = color.selected;

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
    {}
  );

export default {
  name: 'arkn-base',
  components: { ScrollToTop },
  data: () => ({
    enumTag,
    char,
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
    loadedImage: {},
    descriptionColor: [
      { buff: 'mdui-text-color-blue', debuff: 'mdui-text-color-red' },
      { buff: 'mdui-text-color-blue-200', debuff: 'mdui-text-color-red-200' },
    ],
  }),
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('riic.setting', JSON.stringify(val));
      },
      deep: true,
    },
    displayWithNameFilter() {
      this.$nextTick(this.$Lazyload.lazyLoadHandler);
    },
    nameFilterInput(val) {
      this.updateNameFilter(val);
      if (!val) this.updateNameFilter.flush();
    },
  },
  computed: {
    textColor() {
      return _.mapValues(this.color, arr => arr.map(className => className.replace(/mdui-color/g, 'mdui-text-color')));
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
        []
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
          const search = this.$root
            .getSearchGroup(this.characterTable[char.name])
            .map(v => v.indexOf(input) + 1 || Infinity);
          if (search.some(s => s !== Infinity))
            arr.push({ ...char, search, nl: this.$t(`character.${char.name}`).length });
        },
        []
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
  },
  methods: {
    getInfoById,
    reset() {
      this.selected = null;
    },
    toggleTag(...needSelect) {
      if (_.isEqual(this.selected, needSelect)) this.selected = null;
      else this.selected = needSelect;
    },
    clearNameFilter() {
      this.nameFilter = '';
      this.$$('#name-filter').removeClass('mdui-textfield-not-empty');
    },
    lazyloadHandler({
      el: {
        dataset: { name },
      },
    }) {
      this.loadedImage[name] = true;
    },
    coloredDescription(str) {
      const { buff, debuff } = this.descriptionColor[this.$root.dark ? 1 : 0];
      return str
        .replace(/{{(.+?)}}/g, `<span class="${buff}">$1</span>`)
        .replace(/\[\[(.+?)\]\]/g, `<span class="${debuff}">$1</span>`);
    },
    isSkillRelevant({ id }) {
      const [selectBuilding, selectType] = this.selected;
      const { building, is } = getInfoById(id);
      return selectBuilding === 'BUILDING' ? selectType === building : selectBuilding === building && selectType in is;
    },
    goToWiki(name) {
      const char = { name, ...this.characterTable[name] };
      this.$confirm(
        this.$t('riic.viewOnWiki'),
        this.$t(`character.${name}`),
        () => window.open(this.$root.getWikiHref(char), '_blank'),
        () => {},
        {
          confirmText: this.$t('common.yes'),
          cancelText: this.$t('common.no'),
          history: false,
        }
      );
    },
  },
  created() {
    const setting = localStorage.getItem('riic.setting');
    if (setting) this.setting = _.assign({}, this.setting, _.pick(safelyParseJSON(setting), _.keys(this.setting)));
  },
};
</script>

<style lang="scss">
#arkn-base {
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
    .last-item td[rowspan] {
      border: none;
    }
  }
  #drawer {
    min-width: 305px;
    padding: 8px;
    &.mdui-drawer-right {
      transform: translateX(305px);
    }
  }
  .lazy-avatar {
    line-height: 0;
    width: 40px;
    height: 40px;
  }
}
</style>
