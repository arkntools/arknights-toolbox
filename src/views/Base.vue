<template>
  <div id="arkn-base">
    <!-- 标签面板 -->
    <div id="drawer" :class="$root.smallScreen ? 'mdui-drawer mdui-drawer-right mdui-drawer-close' : false">
      <div class="mdui-row">
        <div class="mdui-col-xs-12 tag-group-outside" v-for="(tagTypeGroup, index) in tagDisplay" :key="index">
          <div class="tag-group" v-for="tagType of tagTypeGroup" :key="tagType">
            <label class="mdui-textfield-label" :style="{ color: color[tagType] ? `var(--${color[tagType]})` : false }">{{ tagType === 'BUILDING' ? $tt(`base.select.${tagType}`) : $t(`building.name.${tagType}`) }}</label>
            <tag-button v-for="(v, tagName) in buff.numKey[tagType]" :class="{ 'opacity-5': selected && !(selected[0] === tagType && selected[1] === tagName) }" :key="`${tagType}-${tagName}`" :notSelectedColor="color[tagType] || color.selected" :selectedColor="color[tagType] || color.selected" :canChange="false" @click="toggleTag(tagType, tagName)">{{ 
              tagType === 'BUILDING'
                ? $t(`building.name.${tagName}`)
                : (
                  tagType === 'TRAINING' && tagName !== '全能'
                    ? $t(`tag.${enumTag[`${tagName}干员`]}`)
                    : $tt(`base.select.${tagName}`)
                )
            }}</tag-button>
          </div>
        </div>
      </div>
      <div class="mdui-row mdui-m-t-2">
        <div class="mdui-col-xs-12" style="white-space: normal;">
          <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn mdui-m-r-2" @click="reset">{{$t('common.reset')}}</button>
          <mdui-switch class="mdui-m-r-2" v-for="(value, key) in setting" :key="key" v-model="setting[key]">{{ $t(`base.setting.${key}`) }}</mdui-switch>
        </div>
      </div>
      <div class="mdui-row">
        <div id="name-filter" class="mdui-col-xs-12 mdui-textfield mdui-textfield-floating-label mdui-textfield-has-clear">
          <label class="mdui-textfield-label">{{$t('base.searchPlaceholder')}}</label>
          <input class="mdui-textfield-input" type="text" v-model.trim="nameFilter" @keydown.esc="nameFilter = ''" />
          <button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense mdui-textfield-floating-label-clear" @click="clearNameFilter"><i class="mdui-icon material-icons ">close</i></button>
        </div>
      </div>
    </div>
    <!-- 技能列表 -->
    <div :class="`mdui-row ${$root.smallScreen ? '' : 'mdui-m-t-4'}`">
      <div class="mdui-col-xs-12">
        <div class="mdui-table-fluid">
          <table class="mdui-table" id="skill-table">
            <thead>
              <tr>
                <th colspan="2" class="mdui-text-center mdui-hidden-xs-down">{{$t('base.table.header.operators')}}</th>
                <th class="mdui-text-center mdui-hidden-sm-up">{{$t('base.table.header.operators')}}</th>
                <th class="mdui-text-center">{{$t('base.table.header.unlock')}}</th>
                <th class="mdui-text-center mdui-hidden-sm-down">{{$t('base.table.header.building')}}</th>
                <th class="mdui-text-center">{{$t('base.table.header.skill')}}</th>
                <th>{{$t('base.table.header.buff')}}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="item of displayWithNameFilter">
                <tr v-for="(skill, skillIndex) in item.skills" :key="`${item.name}-${skill.id}`">
                  <td :rowspan="item.skills.length" v-if="skillIndex === 0" class="mdui-hidden-xs-down" width="1">
                    <img v-if="loadedImage[item.name]" class="mdui-card-header-avatar" :src="charTable[item.name] ? $root.avatar(charTable[item.name]) : false" crossorigin="anonymous" />
                    <lazy-component v-else :data-name="item.name" @show="lazyloadHandler">
                      <img class="mdui-card-header-avatar" :src="charTable[item.name] ? $root.avatar(charTable[item.name]) : false" crossorigin="anonymous" />
                    </lazy-component>
                  </td>
                  <td v-else class="hidden"></td>
                  <template v-if="skillIndex === 0">
                    <td :rowspan="item.skills.length" class="mdui-hidden-xs-down no-wrap" width="1">{{ $t(`character.${item.name}`) }}</td>
                    <td :rowspan="item.skills.length" class="mdui-text-center mdui-hidden-sm-up no-wrap">{{ $t(`character.${item.name}`) }}</td>
                  </template>
                  <td v-else class="hidden"></td>
                  <td class="mdui-text-center no-wrap">{{ $t(`base.table.unlock.${skill.unlock}`) }}</td>
                  <td class="mdui-text-center mdui-hidden-sm-down no-wrap">{{ $t(`building.name.${getInfoById(skill.id).building}`) }}</td>
                  <td class="mdui-text-center no-wrap">
                    <span :class="`skill-card ${color[getInfoById(skill.id).building]}`">{{ $t(`building.buff.name.${skill.id}`) }}</span>
                  </td>
                  <td :class="$root.smallScreen ? 'no-wrap' : false" v-html="coloredDescription($t(`building.buff.description.${buff.description[skill.id]}`))"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 浮动按钮 -->
    <button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer ? null : (drawer = new $Drawer('#drawer')); drawer.toggle();"><i class="mdui-icon material-icons">sort</i></button>
    <scroll-to-top v-else />
  </div>
</template>

<script>
import ScrollToTop from '../components/ScrollToTop';
import _ from 'lodash';

import character from '../data/character.json';
import { char, buff } from '../data/building.json';
import localeZhTag from '../locales/zh/tag.json';

const enumTag = _.mapValues(_.invert(localeZhTag), parseInt);
Object.freeze(enumTag);

const color = {
  notSelected: 'mdui-color-brown-300',
  selected: 'mdui-color-grey-900',
  MANUFACTURE: 'mdui-color-amber-400',
  TRADING: 'mdui-color-light-blue-700',
  POWER: 'mdui-color-green-600',
  CONTROL: 'mdui-color-green-900',
  DORMITORY: 'mdui-color-cyan-300',
  MEETING: 'mdui-color-orange-900',
  WORKSHOP: 'mdui-color-lime-400',
  TRAINING: 'mdui-color-red-900',
  HIRE: 'mdui-color-grey-700',
};

const tagDisplay = [
  ['BUILDING'],
  ['MANUFACTURE', 'TRADING', 'CONTROL', 'DORMITORY', 'MEETING', 'WORKSHOP', 'TRAINING'],
];

const toArray = sth => (Array.isArray(sth) ? sth : [sth]);
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
    charTable: character,
    color,
    tagDisplay,
    setting: {
      hideIrrelevant: false,
    },
    drawer: null,
    selected: null,
    nameFilter: '',
    loadedImage: {},
  }),
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('base.setting', JSON.stringify(val));
      },
      deep: true,
    },
    displayWithNameFilter() {
      this.$nextTick(this.$Lazyload.lazyLoadHandler);
    },
  },
  computed: {
    display() {
      const result = _.transform(
        char,
        (arr, skills, name) => {
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
        const sortOrder = toArray(buff.numKey[selectBuilding][selectType]);
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
      const result = _.filter(this.display, char => {
        const { name } = char;
        const input = this.nameFilter.replace(/ /g, '');
        const {
          pinyin: { full, head },
        } = this.charTable[name];
        const search = [
          full,
          head,
          this.$t(`character.${name}`)
            .toLowerCase()
            .replace(/ /g, ''),
        ].map(v => v.indexOf(input));
        char.search = search;
        return _.some(search, s => s !== -1);
      });
      if (!this.selected) {
        result.sort(({ search: sa }, { search: sb }) => {
          const compares = sa.map((v, i) => v - sb[i]);
          for (const compare of compares) {
            if (compare !== 0) return compare;
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
    coloredDescription: str =>
      str
        .replace(/{{(.+?)}}/g, '<span class="mdui-text-color-blue">$1</span>')
        .replace(/\[\[(.+?)\]\]/g, '<span class="mdui-text-color-red">$1</span>'),
    isSkillRelevant({ id }) {
      const [selectBuilding, selectType] = this.selected;
      const { building, is } = getInfoById(id);
      return selectBuilding === 'BUILDING' ? selectType === building : selectBuilding === building && selectType in is;
    },
  },
  created() {
    const setting = localStorage.getItem('base.setting');
    if (setting) this.setting = _.assign({}, this.setting, _.pick(JSON.parse(setting), _.keys(this.setting)));
  },
};
</script>

<style lang="scss">
:root {
  --mdui-color-amber-400: #ffca28;
  --mdui-color-light-blue-700: #0288d1;
  --mdui-color-green-600: #43a047;
  --mdui-color-green-900: #1b5e20;
  --mdui-color-cyan-300: #4dd0e1;
  --mdui-color-orange-900: #e65100;
  --mdui-color-lime-400: #d4e157;
  --mdui-color-red-900: #b71c1c;
  --mdui-color-grey-700: #616161;
}
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
    margin-right: 4px;
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
        padding-right: 0;
        padding-left: 16px;
      }
      &:last-child {
        padding-right: 16px;
      }
    }
  }
  #drawer {
    min-width: 290px;
    padding: 8px;
  }
}
</style>
