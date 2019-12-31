<i18n>
{
  "zh": {
    "mutiSelect": "多选模式",
    "hideIrrelevant": "隐藏同一干员与筛选无关的技能",
    "searchPlaceholder": "搜索（干员中英文名/拼音/拼音首字母）",
    "tableHeaderBuff": "效果（筛选时将按效果由高到低排序）"
  },
  "en": {
    "mutiSelect": "Multi-selection mode",
    "hideIrrelevant": "Hide irrelevant skills when filtering",
    "searchPlaceholder": "Search (type name or chinese phonetic alphabet of an operator)",
    "tableHeaderBuff": "Buff (descending sort when filtering)",
    "解锁": "Unlock",
    "设施": "Building",
    "精1": "Elite 1",
    "精2": "Elite 2",
    "精2": "Elite 2",
    "30级": "Level 30",
    "全能": "Universal",
    "订单效率": "Order Efficiency",
    "订单上限": "Order Limit",
    "心情消耗": "Mood Consumed",
    "群体恢复": "All Operators",
    "单体恢复": "Single Operator",
    "通用生产": "Universal",
    "贵金属": "Precious Metal",
    "作战记录": "Battle Record",
    "源石": "Originium",
    "仓库容量": "Capacity Limit",
    "无特别加成": "Universal",
    "线索1": "Clues 1",
    "线索2": "Clues 2",
    "线索3": "Clues 3",
    "线索4": "Clues 4",
    "线索5": "Clues 5",
    "线索6": "Clues 6",
    "线索7": "Clues 7",
    "任意材料": "Universal",
    "基建材料": "Base Material",
    "精英材料": "Elite Material",
    "技巧概要": "Skill Summary",
    "芯片": "Chip"
  }
}
</i18n>

<template>
  <div id="arkn-base">
    <!-- 标签面板 -->
    <div id="drawer" :class="$root.smallScreen ? 'mdui-drawer mdui-drawer-right mdui-drawer-close' : false">
      <div :class="`mdui-row ${noneSelect ? 'none-select' : ''}`">
        <div class="mdui-col-xs-12 tag-group-outside" v-for="(tagTypeGroup, index) in tagDisplay" :key="index">
          <div class="tag-group" v-for="tagType of tagTypeGroup" :key="tagType">
            <label class="mdui-textfield-label" :style="{ color: color[tagType] ? `var(--${color[tagType]})` : false }">{{ $t(tagType) }}</label>
            <tag-button v-for="tagName in tag[tagType]" :key="tagName" v-model="selected[tagType][tagName]" :notSelectedColor="`${color[tagType] || color.selected} opacity-5`" :selectedColor="color[tagType] || color.selected" :canChange="false" @click="toggleTag(tagType, tagName)">{{ $t(tagName) }}</tag-button>
          </div>
        </div>
      </div>
      <div class="mdui-row mdui-m-t-2">
        <div class="mdui-col-xs-12" style="white-space: normal;">
          <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn mdui-m-r-2" @click="reset">{{$t('重置')}}</button>
          <mdui-switch class="mdui-m-r-2" v-for="(value, key) in setting" :key="key" v-model="setting[key]">{{ $t(key) }}</mdui-switch>
        </div>
      </div>
      <div class="mdui-row">
        <div id="name-filter" class="mdui-col-xs-12 mdui-textfield mdui-textfield-floating-label mdui-textfield-has-clear">
          <label class="mdui-textfield-label">{{$t('searchPlaceholder')}}</label>
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
                <th colspan="2" class="mdui-text-center mdui-hidden-xs-down">{{$t('干员')}}</th>
                <th class="mdui-text-center mdui-hidden-sm-up">{{$t('干员')}}</th>
                <th class="mdui-text-center">{{$t('解锁')}}</th>
                <th class="mdui-text-center mdui-hidden-sm-down">{{$t('设施')}}</th>
                <th class="mdui-text-center">{{$t('技能')}}</th>
                <th>{{$t('tableHeaderBuff')}}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(item) of displayWithNameFilter">
                <tr v-for="(skill, skillIndex) in item.skills" :key="`${item.name}-${skill.name}`">
                  <td :rowspan="item.skills.length" v-if="skillIndex === 0" class="mdui-hidden-xs-down" width="1">
                    <img v-if="loadedImage[item.name]" class="mdui-card-header-avatar" :src="charTable[item.name] ? $root.avatar(charTable[item.name]) : false" crossorigin="anonymous" />
                    <lazy-component v-else :data-name="item.name" @show="lazyloadHandler">
                      <img class="mdui-card-header-avatar" :src="charTable[item.name] ? $root.avatar(charTable[item.name]) : false" crossorigin="anonymous" />
                    </lazy-component>
                  </td>
                  <td v-else class="hidden"></td>
                  <template v-if="skillIndex === 0">
                    <td :rowspan="item.skills.length" class="mdui-hidden-xs-down no-wrap" width="1">{{ $t('operatorName', charTable[item.name]) }}</td>
                    <td :rowspan="item.skills.length" class="mdui-text-center mdui-hidden-sm-up no-wrap">{{ $t('operatorName', charTable[item.name]) }}</td>
                  </template>
                  <td v-else class="hidden"></td>
                  <td class="mdui-text-center no-wrap">{{ $t(skill.unlock) }}</td>
                  <td class="mdui-text-center mdui-hidden-sm-down no-wrap">{{ $t(skill.building) }}</td>
                  <td class="mdui-text-center no-wrap">
                    <span :class="`skill-card ${color[skill.building]}`">{{ skill.name }}</span>
                  </td>
                  <td :class="$root.smallScreen ? 'no-wrap' : false" v-html="skill.description"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 浮动按钮 -->
    <button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer ? null : (drawer = new $root.Mdui.Drawer('#drawer')); drawer.toggle();"><i class="mdui-icon material-icons">sort</i></button>
    <scroll-to-top v-else />
  </div>
</template>

<script>
import ScrollToTop from '../components/ScrollToTop';
import _ from 'lodash';

import HR from '../data/hr.json';
import BASE from '../data/base.json';

const color = {
  notSelected: 'mdui-color-brown-300',
  selected: 'mdui-color-grey-900',
  制造站: 'mdui-color-amber-400',
  贸易站: 'mdui-color-light-blue-700',
  发电站: 'mdui-color-green-600',
  控制中枢: 'mdui-color-green-900',
  宿舍: 'mdui-color-cyan-300',
  会客室: 'mdui-color-orange-900',
  加工站: 'mdui-color-lime-400',
  训练室: 'mdui-color-red-900',
  人力办公室: 'mdui-color-grey-700',
};

const tagDisplay = [['基建设施'], ['制造站', '贸易站', '控制中枢', '宿舍', '会客室', '加工站', '训练室']];

const getSkillsMaxNum = skills =>
  _.transform(
    skills,
    (max, { num }) => {
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
    member: _.transform(
      _.cloneDeep(HR),
      (o, v) => {
        o[v.name] = v;
        delete o[v.name].name;
      },
      {}
    ),
    charTable: _.transform(HR, (r, v) => (r[v.name] = v), {}),
    color,
    tagDisplay,
    setting: {
      mutiSelect: false,
      hideIrrelevant: false,
    },
    settingZh: {
      mutiSelect: '多选模式',
      hideIrrelevant: '隐藏同一干员与筛选无关的技能',
    },
    drawer: null,
    selected: _.transform(
      BASE.tag,
      (obj, arr, key) => {
        obj[key] = _.transform(
          arr,
          (o, v) => {
            o[v] = false;
          },
          {}
        );
      },
      {}
    ),
    nameFilter: '',
    ...BASE,
    loadedImage: {},
  }),
  watch: {
    setting: {
      handler(val) {
        localStorage.setItem('base.setting', JSON.stringify(val));
      },
      deep: true,
    },
  },
  computed: {
    display() {
      const { need, regGroups } = _.transform(
        this.selected,
        ({ need, regGroups }, tags, type) => {
          _.each(tags, (isSelected, tag) => {
            if (isSelected) {
              need.push(this.category[type][tag]);
              regGroups.push(this.regGroupName[type][tag]);
            }
          });
        },
        { need: [], regGroups: [] }
      );
      if (_.isEmpty(need)) return this.base;
      let result = _.map(_.union(...need), index => this.base[index]);
      if (this.setting.hideIrrelevant) {
        const { correlatives, buildings } = _.transform(
          this.selected,
          ({ correlatives, buildings }, tags, type) => {
            _.each(tags, (isSelected, tag) => {
              if (isSelected) {
                if (type === '基建设施') buildings.push(tag);
                else correlatives.push(`${type}-${tag}`);
              }
            });
          },
          { correlatives: [], buildings: [] }
        );
        result = _.cloneDeep(result);
        _.each(result, item => {
          item.skills = _.transform(
            item.skills,
            (arr, skill) => {
              const c1 = !_.isEmpty(correlatives) && correlatives.some(type => skill.is[type]);
              const c2 = !_.isEmpty(buildings) && buildings.includes(skill.building);
              if (c1 || c2) arr.push(skill);
            },
            []
          );
        });
      }
      const sortOrder = _.uniq(_.flatten(regGroups));
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
      return result;
    },
    displayWithNameFilter() {
      if (!this.nameFilter) return this.display;
      return _.filter(this.display, ({ name }) => {
        const input = this.nameFilter.replace(/ /g, '');
        const {
          pinyin: { full, head },
          en,
        } = this.charTable[name];
        const search = [name, full, head, en.toLowerCase().replace(/ /g, '')].map(v => v.indexOf(input));
        return _.some(search, s => s !== -1);
      });
    },
    noneSelect() {
      return _.every(this.selected, obj => _.every(obj, v => !v));
    },
  },
  methods: {
    reset() {
      this.selected = _.mapValues(this.selected, group => _.mapValues(group, () => false));
    },
    toggleTag(type, name) {
      if (this.selected[type][name]) this.selected[type][name] = false;
      else {
        if (!this.setting.mutiSelect) this.reset();
        this.selected[type][name] = true;
      }
    },
    clearNameFilter() {
      this.nameFilter = '';
      this.$root.JQ('#name-filter').removeClass('mdui-textfield-not-empty');
    },
    lazyloadHandler({
      el: {
        dataset: { name },
      },
    }) {
      this.loadedImage[name] = true;
    },
  },
  created() {
    const setting = localStorage.getItem('base.setting');
    if (setting) this.setting = _.assign({}, this.setting, _.pick(JSON.parse(setting), _.keys(this.setting)));

    this.base.forEach(({ skills }) => {
      skills.forEach(skill => {
        skill.description = skill.description
          .replace(/{{(.+?)}}/g, '<span class="mdui-text-color-blue">$1</span>')
          .replace(/\[\[(.+?)\]\]/g, '<span class="mdui-text-color-red">$1</span>');
      });
    });
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
  .none-select .tag-btn {
    opacity: 1;
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
