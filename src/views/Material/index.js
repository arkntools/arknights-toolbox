import { defineComponent } from '@/utils/vue';

import ArknNumItem from '@/components/ArknNumItem.vue';
import CultivateGuide from '@/components/material/CultivateGuide.vue';
import PresetTodoDialog from '@/components/material/PresetTodoDialog.vue';
import PlanSettingDialog from '@/components/material/PlanSettingDialog.vue';
import StageSelectDialog from '@/components/material/StageSelectDialog.vue';
import ImportConfirmDialog from '@/components/material/ImportConfirmDialog.vue';

import { Drag, DropList } from 'vue-easy-dnd';
import VueTagsInput from '@johmun/vue-tags-input';
import Ajax from '@/utils/ajax';
import safelyParseJSON from '@/utils/safelyParseJSON';
import * as clipboard from '@/utils/clipboard';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import pickClone from '@/utils/pickClone';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import Linprog from 'javascript-lp-solver';
import md5 from 'js-md5';

import elite from '@/data/cultivate.json';
import unopenedStage from '@/data/unopenedStage.json';
import drop from '@/data/drop.json';
import { zoneToRetro } from '@/data/zone.json';

import materialData, { MaterialTypeEnum, PURCHASE_CERTIFICATE_ID } from '@/store/material.js';
import { characterTable } from '@/store/character';
import { unopenedStageSets } from '@/store/stage';
import { getStageTable } from '@/store/stage.js';
import { eventData, eventStageData } from '@/store/event.js';
import { retroData, retroStageData } from '@/store/retro.js';
import { zoneToNameId } from '@/store/zone.js';

import { MATERIAL_TAG_BTN_COLOR } from '@/utils/constant';

const nls = new NamespacedLocalStorage('material');
const pdNls = new NamespacedLocalStorage('penguinData');

const SYNC_CODE_VER = 6;
const SYNC_API_KEY_VER = 1;

const enumOccPer = {
  '-1': 'SYNT',
  0: 'ALWAYS',
  1: 'ALMOST',
  2: 'USUAL',
  3: 'OFTEN',
  4: 'SOMETIMES',
};
Object.freeze(enumOccPer);

const battleRecordIds = ['2001', '2002', '2003', '2004'];
const dropTableOtherFields = [
  'zoneId',
  'sampleNum',
  'event',
  'retro',
  'cost',
  'lmd',
  'cardExp',
  ...battleRecordIds,
];

const pSettingInit = {
  evolve: [false, false],
  skills: {
    normal: [false, 1, 7],
    elite: new Array(_.max(_.map(elite, obj => obj.skills.elite.length)))
      .fill([false, 7, 10])
      .map(a => _.cloneDeep(a)),
  },
  uniequip: {},
  state: 'add',
};
Object.freeze(pSettingInit);

const uniequipInit = [false, 0, 1];
Object.freeze(uniequipInit);

const isPlannerUnavailableItem = id =>
  materialData.materialTable[id]?.type === MaterialTypeEnum.MOD_TOKEN;

const min0 = x => (x < 0 ? 0 : x);

export default defineComponent({
  name: 'arkn-material',
  components: {
    Drag,
    DropList,
    VueTagsInput,
    CultivateGuide,
    ArknNumItem,
    PresetTodoDialog,
    PlanSettingDialog,
    StageSelectDialog,
    ImportConfirmDialog,
  },
  data: () => ({
    showAll: false,
    enumOccPer,
    ..._.omit(materialData, ['materialTypeGroupIdSet', 'materialOrder', 'materialRareFirstOrder']),
    characterTable,
    elite,
    inputs: {},
    preset: '',
    selectedPresetName: '',
    selectedPreset: false,
    pSetting: _.cloneDeep(pSettingInit),
    pSettingInit,
    uniequipInit,
    selected: {
      rare: [],
      presets: [],
      type: {
        mod: true,
        skill: true,
        chip: true,
      },
    },
    setting: {
      simpleMode: false,
      hideIrrelevant: false,
      translucentDisplay: true,
      showDropProbability: false,
      allowChipConversion: true,
      prioritizeNeedsWhenSynt: false,
      planIncludeEvent: true,
      planCardExpFirst: false,
      planCardExpFirstThreshold: 1,
      [`syncCodeV${SYNC_CODE_VER}`]: '',
      [`syncApiKeyV${SYNC_API_KEY_VER}`]: '',
      autoSyncUpload: false,
      planStageBlacklist: [],
      simpleModeOrderedByRareFirst: false,
      penguinUseCnServer: false,
      minSampleNum: 0,
    },
    settingList: [
      [
        'hideIrrelevant',
        'translucentDisplay',
        'showDropProbability',
        'allowChipConversion',
        'prioritizeNeedsWhenSynt',
      ],
      ['planCardExpFirst'],
    ],
    color: MATERIAL_TAG_BTN_COLOR,
    penguinData: {
      time: 0,
      data: null,
    },
    plannerInited: false,
    plannerRequest: false,
    plannerShowMiniSetting: false,
    apbDisabled: false,
    dropDetails: null,
    dropFocus: '',
    dropTable: {},
    dropInfo: {
      expectAP: {},
      stageValue: {},
    },
    synthesisTable: {},
    materialConstraints: {},
    dataSyncing: false,
    throttleAutoSyncUpload: null,
    ignoreInputsChange: false,
    highlightCost: {},
  }),
  watch: {
    setting: {
      handler(val) {
        nls.setItem('setting', val);
      },
      deep: true,
    },
    selected: {
      handler(val) {
        nls.setItem('selected', val);
      },
      deep: true,
    },
    inputs: {
      handler(val) {
        for (const input of Object.values(val)) {
          for (const key of Object.keys(input)) {
            if (!['need', 'have'].includes(key)) {
              delete input[key];
              continue;
            }
            const str = input[key];
            const exec = /[^0-9]/.exec(str);
            if (exec) input[key] = (parseInt(/[0-9]*/.exec(str)[0]) || 0).toString();
          }
        }
        nls.setItem('inputs', val);
        if (this.setting.autoSyncUpload && this.syncCode && this.throttleAutoSyncUpload) {
          if (this.ignoreInputsChange) this.ignoreInputsChange = false;
          else this.throttleAutoSyncUpload();
        }
      },
      deep: true,
    },
    'setting.showDropProbability'(val) {
      if (val) this.initPlanner();
    },
    '$root.locale'() {
      this.updatePreset();
    },
    '$root.server'() {
      this.updatePreset();
      if (this.plannerInited) {
        this.plannerInited = false;
        this.initPlanner();
      }
    },
  },
  computed: {
    materialOrder() {
      return materialData.materialOrder[this.$root.server];
    },
    materialRareFirstOrder() {
      return materialData.materialRareFirstOrder[this.$root.server];
    },
    syncCode: {
      get() {
        return this.setting[`syncCodeV${SYNC_CODE_VER}`];
      },
      set(val) {
        this.setting[`syncCodeV${SYNC_CODE_VER}`] = val;
      },
    },
    syncApiKey: {
      get() {
        return this.setting[`syncApiKeyV${SYNC_API_KEY_VER}`];
      },
      set(val) {
        this.setting[`syncApiKeyV${SYNC_API_KEY_VER}`] = val;
      },
    },
    // TODO: 企鹅物流暂时不支持台服
    isPenguinDataSupportedServer() {
      return this.$root.server !== 'tw';
    },
    penguinURL() {
      return `https://penguin-stats.${
        this.$root.localeCN && this.setting.penguinUseCnServer ? 'cn' : 'io'
      }/PenguinStats/api/v2/result/matrix`;
    },
    stageTable() {
      return getStageTable(this.$root.server);
    },
    eventInfo() {
      return eventData[this.$root.server];
    },
    eventStages() {
      return eventStageData[this.$root.server];
    },
    retroInfo() {
      return retroData[this.$root.server];
    },
    retroStages() {
      return retroStageData[this.$root.server];
    },
    stageFromNameIdTable() {
      return _.transform(
        this.dropTable,
        (obj, { zoneId }, code) => {
          if (zoneToNameId[zoneId]) obj[code] = zoneToNameId[zoneId];
        },
        {},
      );
    },
    isPenguinDataExpired() {
      const now = Date.now();
      const time = this.penguinData.time || 0;
      const isEvent = this.isPenguinDataSupportedServer && _.size(this.eventInfo);
      if (isEvent && _.some(this.eventInfo, ({ valid: { startTs } }) => time < startTs * 1000)) {
        return true;
      }
      const expire = (isEvent ? 3 : 7) * 24 * 60 * 60 * 1000;
      return time + expire < now;
    },
    penguinDataServer() {
      return this.isPenguinDataSupportedServer ? this.$root.server.toUpperCase() : 'CN';
    },
    selectedSynthesisList() {
      return _.filter(this.synthesisTable, (v, k) => {
        if (Number(k)) return this.selected.rare[k];
        if (k === 'chip-conv') return this.selected.type.chip && this.setting.allowChipConversion;
        return this.selected.type[k];
      });
    },
    unopenedStages() {
      return unopenedStage[this.$root.server];
    },
    dropTableByServer() {
      return _.omit(this.dropTable, this.unopenedStages);
    },
    dropTableUsedByPlanner() {
      const result = _.omit(
        this.isPenguinDataSupportedServer && this.setting.planIncludeEvent
          ? this.dropTableByServer
          : _.omitBy(this.dropTableByServer, o => o.event || o.retro),
        this.setting.planStageBlacklist,
      );
      if (this.setting.minSampleNum > 0) {
        return _.omitBy(result, ({ sampleNum }) => sampleNum < this.setting.minSampleNum);
      }
      return result;
    },
    dropListByServer() {
      let table = _.merge(
        _.mapValues(this.materialTable, ({ drop }) => _.omit(drop, this.unopenedStages)),
        ...Object.values(
          _.pick(
            _.mapKeys(drop.retro, (v, id) => zoneToRetro[id]),
            Object.keys(this.retroInfo),
          ),
        ),
      );
      if (this.isPenguinDataSupportedServer) {
        table = _.merge(
          {},
          ...Object.values(_.pick(drop.event, Object.keys(this.eventInfo))),
          table,
        );
      }
      return table;
    },
    syntExceptAPList() {
      return _.mapValues(this.dropListByServer, (v, name) => this.getSyntExceptAP(name));
    },
    syntExceptAPListWithoutEvent() {
      return _.mapValues(this.dropListByServer, (v, name) => this.getSyntExceptAP(name, true));
    },
    displayDropListByServer() {
      const showProbability = this.setting.showDropProbability && this.plannerInited;
      const table = _.cloneDeep(this.dropListByServer);
      Object.keys(table).forEach(name => {
        table[name] = _.mapValues(table[name], (occPer, code) => {
          const info = { occPer };
          // 期望理智
          if (showProbability) info.expectAP = this.dropInfo.expectAP[name][code];
          return info;
        });
        // 排序
        if (showProbability) {
          const row = table[name];
          const syntInfo = this.syntExceptAPList[name];
          if (syntInfo) {
            const { stages, ap } = syntInfo;
            const isSynt = (() => {
              if (stages.length > 1) return true;
              if (stages.length === 1) {
                const [code] = stages;
                if (!(code in row)) return true;
              }
              return false;
            })();
            if (isSynt) row.synt = { occPer: -1, expectAP: ap };
          }
          const sortedCodes = _.sortBy(Object.keys(row), code => row[code].expectAP);
          table[name] = _.transform(
            sortedCodes,
            (obj, code) => {
              obj[code] = row[code];
            },
            {},
          );
        }
      });
      return table;
    },
    implementedElite() {
      return _.pickBy(this.elite, (o, name) => this.$root.isImplementedChar(name));
    },
    compressedInputs: {
      get() {
        return _.transform(
          this.inputsInt,
          (obj, { need, have }, key) => {
            if (need + have > 0) obj[key] = [need, have];
          },
          {},
        );
      },
      set(obj) {
        this.reset(null, false, false);
        _.each(obj, (val, key) => {
          if (Array.isArray(val)) {
            const [need, have] = val;
            this.inputs[key].need = need > 0 ? _.toString(need) : '';
            this.inputs[key].have = have > 0 ? _.toString(have) : '';
          } else {
            const { need, have } = val;
            this.inputs[key].need = need;
            this.inputs[key].have = have;
          }
        });
      },
    },
    formulaTooltips() {
      const localeUS = this.$root.localeIs('us');
      const header = this.$t('cultivate.dropDetail.synthesizeCosts') + (localeUS ? ': ' : '：');
      const spliter = localeUS ? ', ' : '、';
      return _.transform(
        this.materialList,
        (o, { name, formula }) => {
          // egg
          if (this.$root.localeCN) {
            if (name === 'mod_unlock_token') {
              o[name] = '获取途径：周常、每月红票兑换、活动';
              return;
            } else if (name.startsWith('mod_update_token')) {
              o[name] = '获取途径：大家都很不喜欢的保全派驻';
              return;
            }
          }
          const text = [];
          _.forIn(formula, (num, m) => text.push(`${this.$t(`material.${m}`)}*${num}`));
          o[name] =
            text.length > 0 ? `${header}${text.join(spliter)}` : this.$t('common.cannotSynthesize');
        },
        {},
      );
    },
    synthesizable() {
      return _.transform(
        this.materialList,
        (o, { name, formula }) => {
          if (_.size(formula) === 0) {
            o[name] = false;
            return;
          }
          o[name] = _.every(formula, (num, m) => this.inputsInt[m].have >= num);
        },
        {},
      );
    },
    allSelected() {
      return this.allRare && this.allType;
    },
    allType() {
      const selects = Object.values(this.selected.type);
      return _.sum(selects) === selects.length;
    },
    allRare() {
      return _.sum(this.selected.rare) === this.rareNum;
    },
    rareNum() {
      return _.size(this.materials);
    },
    rareArr() {
      return _.range(this.rareNum, 0);
    },
    inputsInt() {
      return _.mapValues(this.inputs, (v, k) =>
        _.mapValues(this.inputs[k], num => parseInt(num) || 0),
      );
    },
    gaps() {
      return this.calcGaps(input => input.need);
    },
    hlGaps() {
      const need = this.highlightCost;
      if (!need) return {};
      return this.calcGaps((v, k) => need[k] || 0);
    },
    autoGaps() {
      return _.mapValues(this.highlight, (hl, id) => (hl ? this.hlGaps[id] : this.gaps[id]));
    },
    highlight() {
      return _.mapValues(this.hlGaps, (gaps, id) => Boolean(this.highlightCost[id] || _.sum(gaps)));
    },
    showMaterials() {
      if (!this.setting.hideIrrelevant || !this.hasInput) {
        return _.mapValues(materialData.materialTypeGroupIdSet, (set, type) => {
          const rare = Number(type);
          if (rare) {
            return this.selected.rare[rare - 1] ? set : new Set();
          }
          return this.selected.type[type] ? set : new Set();
        });
      }
      const result = _.mapValues(this.selected.type, (v, type) => {
        if (!v) return new Set();
        const curGroupIdSet = materialData.materialTypeGroupIdSet[type];
        const set = new Set(
          Array.from(curGroupIdSet).filter(
            id => this.inputsInt[id].need > 0 || _.sum(this.gaps[id]) > 0,
          ),
        );
        set.forEach(id => {
          if (_.sum(this.gaps[id]) <= 0) return;
          const item = this.materialTable[id];
          if (!item?.formula) return;
          if (type === 'chip' && !this.setting.allowChipConversion && this.isConvableChip(item)) {
            return;
          }
          Object.keys(item.formula).forEach(fsid => {
            if (curGroupIdSet.has(fsid)) set.add(fsid);
          });
        });
        return set;
      });
      this.rareArr.forEach(rare => {
        if (!this.selected.rare[rare - 1]) {
          result[rare] = new Set();
          return;
        }
        const set = new Set(
          Array.from(materialData.materialTypeGroupIdSet[rare]).filter(
            id => this.inputsInt[id].need > 0 || _.sum(this.gaps[id]) > 0,
          ),
        );
        (result[rare + 1] || []).forEach(id => {
          if (_.sum(this.gaps[id])) {
            Object.keys(this.materialTable[id]?.formula || {}).forEach(fsid => {
              if (this.materialTable[fsid]?.rare === rare) set.add(fsid);
            });
          }
        });
        result[rare] = set;
      });
      return result;
    },
    showMaterialsFlatten() {
      return new Set(_.flatMap(this.showMaterials, set => Array.from(set)));
    },
    hasInput() {
      return !!_.sumBy(
        Object.entries(this.inputsInt),
        ([id, { need }]) => need + _.sum(this.gaps[id]),
      );
    },
    presetItems() {
      const input = this.$root.pureName(this.preset);
      const result = _.transform(
        Object.keys(this.implementedElite),
        (arr, name) => {
          const search = this.$root
            .getSearchGroup(this.characterTable[name])
            .map(v => v.indexOf(input) + 1 || Infinity);
          if (search.some(s => s !== Infinity)) {
            arr.push({ search, name, nl: this.$t(`character.${name}`).length });
          }
        },
        [],
      );
      result.sort(({ search: a, nl: anl }, { search: b, nl: bnl }) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
          const compare = a[i] - b[i];
          if (!_.isNaN(compare)) return compare || anl - bnl;
        }
        return 0;
      });
      return _.map(result, o => ({ name: o.name, text: this.$t(`character.${o.name}`) })).slice(
        0,
        10,
      );
    },
    presetUniequip() {
      return this.sp?.uniequip.filter(
        ({ id }) => this.$root.isImplementedUniequip(id) || this.pSetting.uniequip[id]?.[0],
      );
    },
    sp() {
      if (!this.selectedPresetName) return;
      return this.elite[this.selectedPresetName];
    },
    checkPSetting() {
      const ps = this.pSetting;
      const check = [
        ...ps.evolve,
        ps.skills.normal[0],
        ..._.map(ps.skills.elite, a => a[0]),
        ..._.map(ps.uniequip, ([val]) => val),
      ];
      return _.sum(check) > 0;
    },
    planConvLmd() {
      return unopenedStageSets[this.$root.server].has('CE-6')
        ? {
            'conv-lmd+': { lmd: 7500, cost: 30 },
            'conv-lmd': { lmd: -7500, cost: -30 },
          }
        : {
            'conv-lmd+': { lmd: 10000, cost: 36 },
            'conv-lmd': { lmd: -10000, cost: -36 },
          };
    },
    planConvCardExp() {
      return unopenedStageSets[this.$root.server].has('LS-6')
        ? { cardExp: -7400, lmd: -360, cost: -30 * this.setting.planCardExpFirstThreshold }
        : { cardExp: -10000, lmd: -432, cost: -36 * this.setting.planCardExpFirstThreshold };
    },
    plan() {
      if (!this.plannerInited) return false;

      this.$gtag.event('material_arkplanner_calc', {
        event_category: 'material',
        event_label: 'arkplanner',
      });

      // 线性规划模型
      const useVariables = [this.dropTableUsedByPlanner, ...this.selectedSynthesisList];
      const model = {
        optimize: 'cost',
        opType: 'min',
        constraints: {
          ...this.materialConstraints,
          ..._.transform(
            this.inputsInt,
            (o, v, k) => {
              // 不支持计算的
              if (isPlannerUnavailableItem(k)) return;
              // 不希望计算的
              const item = this.materialTable[k];
              if (!item) return;
              if (
                !this.selected.type.chip &&
                (item.type === MaterialTypeEnum.CHIP || item.type === MaterialTypeEnum.CHIP_ASS)
              ) {
                return;
              }
              if (!this.selected.type.skill && item.type === MaterialTypeEnum.SKILL_SUMMARY) {
                return;
              }
              if (v.need > 0) o[k] = { min: v.need };
            },
            {},
          ),
          lmd: { equal: 0 },
          init: { equal: 1 },
        },
        variables: Object.assign(
          {
            have: _.transform(
              this.inputsInt,
              (o, v, k) => {
                if (v.have > 0) o[k] = v.have;
              },
              { init: 1 },
            ),
            ...this.planConvLmd,
          },
          ...useVariables,
        ),
      };

      // 需求狗粮
      if (this.setting.planCardExpFirst) {
        model.constraints.cardExp = { equal: 0 };
        model.variables['conv-cardExp'] = this.planConvCardExp;
      }

      const result = Linprog.Solve(model);

      if (!result.feasible) return false;
      delete result.feasible;
      delete result.result;
      delete result.bounded;
      delete result.have;

      const deltaGet = {};

      const stage = _.mapValues(
        _.mapValues(
          _.omitBy(result, (v, k) => k.startsWith('synt-') || k.startsWith('conv-')),
          v => [v < 1 ? 1 : Math.ceil(v), v],
        ),
        ([times, origTimes], code) => {
          const curStageDrop = this.dropTableByServer[code];
          const cost = times * curStageDrop.cost;
          const drop = _.mapValues(_.omit(curStageDrop, dropTableOtherFields), (dropNum, mid) => {
            const num = _.round(times * dropNum, 1);
            if (!deltaGet[mid]) deltaGet[mid] = 0;
            deltaGet[mid] += num - origTimes * dropNum;
            return num;
          });
          const drops = _.transform(
            drop,
            (r, v, k) => {
              if (v > 0) r.push({ name: k, num: v });
            },
            [],
          );
          drops.sort((a, b) => {
            let t = this.materialTable[b.name].rare - this.materialTable[a.name].rare;
            if (t == 0) t = b.num - a.num;
            return t;
          });
          return {
            sampleNum: curStageDrop.sampleNum,
            times: times,
            cost,
            money: cost * 12,
            cardExp: _.round(curStageDrop.cardExp * times),
            drops,
          };
        },
      );

      const stagePairs = _.toPairs(stage);

      const stages = _.transform(stage, (r, v, k) => r.push({ code: k, ...v }), []);
      stages.sort((a, b) => b.code.localeCompare(a.code));

      let synthesisCost = 0;
      const synthesis = _.transform(
        _.pickBy(result, (v, k) => k.startsWith('synt-')),
        (r, v, k) => {
          const name = k.split('synt-')[1];
          v = _.round(deltaGet[name] > 0 ? v - deltaGet[name] : v, 1);
          if (v <= 0) return;
          const curM = this.materialTable[name];
          if (curM.type === MaterialTypeEnum.MATERIAL) {
            synthesisCost += (curM.rare - 1) * 100 * v;
          }
          r.push({
            name,
            num: v,
          });
        },
        [],
      );
      synthesis.sort((a, b) => {
        let t = this.materialTable[b.name].rare - this.materialTable[a.name].rare;
        if (t == 0) t = b.num - a.num;
        return t;
      });
      synthesisCost = _.round(synthesisCost);

      return {
        cost: _.sumBy(stagePairs, p => p[1].cost),
        stages,
        synthesis,
        synthesisCost,
        money: _.sumBy(stagePairs, p => p[1].money) - synthesisCost,
        cardExp: _.sumBy(stagePairs, p => p[1].cardExp),
      };
    },
    synthesisTableApplySetting() {
      if (!this.setting.allowChipConversion) return _.omit(this.synthesisTable, 'chip-conv');
      return this.synthesisTable;
    },
    syntExceptAPlpVariables() {
      return Object.assign(
        {},
        this.isPenguinDataSupportedServer
          ? this.dropTableByServer
          : _.omitBy(this.dropTableByServer, o => o.event),
        ...Object.values(this.synthesisTableApplySetting),
      );
    },
    syntExceptAPlpVariablesWithoutEvent() {
      return Object.assign(
        {},
        _.omitBy(this.dropTableByServer, o => o.event),
        ...Object.values(this.synthesisTableApplySetting),
      );
    },
    materialsCharMap() {
      const presets = _.map(
        this.selected.presets,
        ({
          name,
          setting: {
            evolve,
            skills: { elite, normal },
            uniequip,
          },
        }) =>
          _.merge(
            {
              name,
              evolve,
              normal: _.map(_.range(1, 7), r => !!(normal[0] && r >= normal[1] && r < normal[2])),
              uniequip,
            },
            _.transform(
              elite,
              (o, e, i) => {
                o[`elite_${i}`] = _.map(_.range(7, 10), r => !!(e[0] && r >= e[1] && r < e[2]));
              },
              {},
            ),
          ),
      );
      return _.transform(
        presets,
        (map, preset) => {
          const {
            evolve,
            skills: { elite, normal },
            uniequip,
          } = this.elite[preset.name];
          const char = _.merge(
            { evolve, normal },
            _.transform(
              elite,
              (o, e, i) => {
                o[`elite_${i}`] = e.cost;
              },
              {},
            ),
          );
          _.each(char, (v, k) => {
            const checks = preset[k];
            _.each(v, (cost, i) => {
              if (checks[i]) {
                _.each(cost, (num, m) => {
                  if (!(m in map)) map[m] = new Set();
                  map[m].add(preset.name);
                });
              }
            });
          });
          uniequip.forEach(({ id, cost }) => {
            if (!preset.uniequip[id]?.[0]) return;
            for (let i = preset.uniequip[id][1]; i < preset.uniequip[id][2]; i++) {
              _.each(cost[i], (num, m) => {
                if (!(m in map)) map[m] = new Set();
                map[m].add(preset.name);
              });
            }
          });
        },
        {},
      );
    },
    moraleConsumption() {
      const moraleMap = {
        5: 8,
        4: 4,
        3: 2,
        2: 1,
        1: 0,
      };
      return _.mapValues(materialData.materialTypeGroup, materials => {
        return _.sumBy(materials, ({ name, type, rare, formulaType }) => {
          const calcRare =
            type === MaterialTypeEnum.SKILL_SUMMARY || type === MaterialTypeEnum.CHIP
              ? rare - 1
              : rare;
          return formulaType === 'WORKSHOP' ? this.gaps[name][1] * moraleMap[calcRare] : 0;
        });
      });
    },
    dataForSave: {
      get() {
        return {
          inputs: this.compressedInputs,
          presets: this.selected.presets,
          planStageBlacklist: this.setting.planStageBlacklist,
        };
      },
      set(data) {
        if (typeof data !== 'object') return;
        const { inputs, presets, planStageBlacklist } = data;
        if (inputs) this.compressedInputs = inputs;
        if (presets) this.selected.presets = presets;
        if (planStageBlacklist) this.setting.planStageBlacklist = planStageBlacklist;
        this.updatePreset();
      },
    },
  },
  methods: {
    num10k(num) {
      return num >= 10000
        ? this.$root.localeCN
          ? `${_.round(num / 10000, 2)}w`
          : `${_.round(num / 1000, 1)}k`
        : num;
    },
    num100k(num) {
      return num >= 100000
        ? this.$root.localeCN
          ? `${_.round(num / 10000, 2)}w`
          : `${_.round(num / 1000, 1)}k`
        : num;
    },
    calcMaterialNameTextWidth(material) {
      let width = 245;
      if (this.synthesizable[material.name] && this.gaps[material.name][1] > 0) {
        width -= 40;
      }
      if (!this.$root.smallScreen && _.size(material.drop) >= 4) {
        width -= 85;
      }
      return width;
    },
    calcGaps(gapsInitFn) {
      const inputs = this.inputsInt;
      const gaps = _.mapValues(inputs, gapsInitFn);
      const made = _.mapValues(inputs, () => 0);
      const used = _.mapValues(inputs, () => 0);

      // 自顶向下得到需求
      _.forInRight(this.materials, materials => {
        for (const { name, type, rare, formula } of materials) {
          gaps[name] = min0(gaps[name] - inputs[name].have);
          // 屏蔽同级芯片转换
          if (type === MaterialTypeEnum.CHIP && rare <= 4) continue;
          _.forIn(formula, (num, m) => {
            gaps[m] += gaps[name] * num;
          });
        }
      });

      // 自底向上计算合成
      _.forIn(this.materials, (materials, rare) => {
        if (!this.selected.rare[rare - 2]) return;
        for (const { name, formula } of materials) {
          if (_.size(formula) === 0) continue;
          const num = this.syntProdNum(name);
          if (num === 0) continue;
          while (
            gaps[name] > 0 &&
            _.every(formula, (num, mName) => {
              const available = inputs[mName].have + made[mName] - used[mName] - num;
              const deduction = this.setting.prioritizeNeedsWhenSynt ? inputs[mName].need : 0;
              return available - deduction >= 0;
            })
          ) {
            gaps[name] = min0(gaps[name] - num);
            made[name] += num;
            _.forEach(formula, (num, mName) => (used[mName] += num));
          }
        }
      });

      return _.mergeWith(gaps, made, (a, b) => [a, b]);
    },
    getSynthesizeMaxTimes(name) {
      const num = this.syntProdNum(name);
      if (num === 0) return 0;
      return Math.min(
        Math.ceil(_.sum(this.autoGaps[name]) / num),
        ..._.map(this.materialTable[name].formula, (num, m) =>
          Math.floor(this.inputsInt[m].have / num),
        ),
      );
    },
    isConvableChip({ type, rare }) {
      return type === MaterialTypeEnum.CHIP && (rare === 3 || rare === 4);
    },
    syntProdNum(name) {
      const item = this.materialTable[name];
      if (!item) return 0;
      if (this.isConvableChip(item)) return 2;
      return 1;
    },
    synthesize(name, times) {
      if (!this.synthesizable[name]) return;
      const prodNum = this.syntProdNum(name);
      if (prodNum === 0) return;
      const maxTimes = this.getSynthesizeMaxTimes(name);
      if (times && !_.inRange(times, 1, maxTimes + 1)) return;
      times = times || maxTimes;
      _.forIn(
        this.materialTable[name].formula,
        (num, m) => (this.inputs[m].have = (this.inputsInt[m].have - num * times).toString()),
      );
      this.inputs[name].have = (this.inputsInt[name].have + times * prodNum).toString();
    },
    customSynthesize(name) {
      if (!this.synthesizable[name]) return;
      const maxTimes = this.getSynthesizeMaxTimes(name);
      if (maxTimes <= 1) return;

      let dropFocus = null;
      if (this.dropFocus && this.$refs.dropDialog.getState() === 'opened') {
        dropFocus = this.dropFocus;
        this.$refs.dropDialog.close();
      }

      const dialog = this.$prompt(
        `${this.$t('common.times')} (1~${maxTimes})`,
        `${this.$t('common.synthesizeFull')} ${this.$t(`material.${name}`)} * ${this.syntProdNum(
          name,
        )}`,
        val => {
          const num = Number(val);
          if (num) this.synthesize(name, num);
        },
        undefined,
        {
          history: false,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.synthesizeFull'),
        },
      );

      this.$$(dialog.$dialog[0]).on('close.mdui.dialog', () => {
        if (dropFocus) this.showDropDetail({ name: dropFocus });
      });

      /** @type {HTMLInputElement} */
      const $input = dialog.$dialog[0].querySelector('input');
      $input.setAttribute('type', 'number');
      $input.setAttribute('min', '1');
      $input.setAttribute('max', String(maxTimes));
      $input.setAttribute('step', '1');
    },
    reset(rk, needResetPresets = true, undoTip = true) {
      const backup = undoTip
        ? {
            inputs: _.cloneDeep(this.inputs),
            presets: _.cloneDeep(this.selected.presets),
          }
        : null;
      if (needResetPresets && !(rk && rk === 'have')) this.selected.presets = [];
      this.ignoreInputsChange = true;
      for (const name in this.inputs) {
        const material = this.inputs[name];
        if (rk) {
          material[rk] = '';
        } else {
          for (const key in material) {
            material[key] = '';
          }
        }
      }
      if (undoTip) {
        this.$snackbar({
          message: this.$t('common.reseted'),
          timeout: 0,
          buttonText: this.$t('common.undo'),
          noSkip: true,
          onButtonClick: () => {
            this.ignoreInputsChange = true;
            this.inputs = backup.inputs;
            this.selected.presets = backup.presets;
          },
        });
      }
    },
    clearHighlight() {
      this.highlightCost = {};
    },
    clearPresetInput() {
      this.preset = '';
    },
    addNeed(need) {
      _.each(need, (num, name) => {
        const orig = parseInt(this.inputs[name].need) || 0;
        this.inputs[name].need = (orig + num).toString();
      });
    },
    usePreset(presets) {
      if (presets) this.selected.presets = presets;
      this.clearHighlight();
      this.reset('need', false, false);
      for (const {
        name,
        setting: { evolve, skills, uniequip },
      } of this.selected.presets) {
        const current = this.elite[name];

        current.evolve.forEach((need, i) => {
          if (evolve[i]) this.addNeed(need);
        });

        if (skills.normal[0]) {
          for (let i = skills.normal[1] - 1; i < skills.normal[2] - 1; i++) {
            this.addNeed(current.skills.normal[i]);
          }
        }

        current.skills.elite.forEach((skill, i) => {
          const ses = skills.elite[i];
          if (!ses[0]) return;
          const offset = current.skills.normal.length + 1;
          for (let j = ses[1] - offset; j < ses[2] - offset; j++) {
            this.addNeed(current.skills.elite[i].cost[j]);
          }
        });

        current.uniequip.forEach(({ id, cost }) => {
          if (!uniequip[id]?.[0]) return;
          for (let i = uniequip[id][1]; i < uniequip[id][2]; i++) {
            this.addNeed(cost[i]);
          }
        });
      }
      // ensure
      nls.setItem('selected', this.selected);
    },
    showPreset(obj, edit = false) {
      this.selectedPreset = obj;
      this.selectedPresetName = obj.tag.name;
      let pSetting;
      if (edit) pSetting = _.cloneDeep(this.selected.presets[obj.index].setting);
      else {
        pSetting = _.cloneDeep(pSettingInit);
        _.each(this.elite[this.selectedPresetName]?.skills?.elite ?? [], ({ cost }, i) => {
          pSetting.skills.elite[i][2] -= 3 - cost.length;
        });
      }
      if (!pSetting.uniequip) pSetting.uniequip = {};
      _.each(this.elite[this.selectedPresetName]?.uniequip ?? [], ({ id }) => {
        if (!(id in pSetting.uniequip)) pSetting.uniequip[id] = _.cloneDeep(uniequipInit);
      });
      this.pSetting = pSetting;
      this.$nextTick(() => {
        this.$refs.presetDialog.open();
        this.$mutation();
      });
    },
    addPreset() {
      if (!this.checkPSetting) {
        this.$snackbar(this.$t('cultivate.panel.preset.emptySelect'));
        return;
      }
      this.selectedPreset.tag.setting = _.cloneDeep(this.pSetting);
      this.selectedPreset.tag.setting.state = 'edit';
      this.selectedPreset.addTag();
    },
    editPreset() {
      if (!this.checkPSetting) {
        this.$snackbar(this.$t('cultivate.panel.preset.emptySelect'));
        return;
      }
      this.selected.presets[this.selectedPreset.index].setting = _.cloneDeep(this.pSetting);
      this.usePreset();
    },
    updatePreset() {
      this.selected.presets.forEach(p => {
        p.text = this.$t(`character.${p.name}`);
        const e1 = p.setting.skills.elite;
        const e2 = pSettingInit.skills.elite;
        const lenGap = e2.length - e1.length;
        for (let i = 0; i < lenGap; i++) {
          e1.push(_.cloneDeep(e2[0]));
        }
        if ('uniequip' in p.setting) {
          _.each(p.setting.uniequip, (v, k) => {
            if (typeof v === 'boolean') {
              const init = _.cloneDeep(uniequipInit);
              init[0] = v;
              this.$set(p.setting.uniequip, k, init);
            }
          });
        }
        // ensure uniequip
        else this.$set(p.setting, 'uniequip', {});
      });
    },
    async copySyncCode() {
      if (await clipboard.setText(this.syncCode)) this.$snackbar(this.$t('common.copied'));
    },
    async copySyncApiKey() {
      if (await clipboard.setText(this.syncApiKey)) this.$snackbar(this.$t('common.copied'));
    },
    saveData() {
      this.$refs.dataSyncDialog.close();
      const data = this.dataForSave;
      const str = Base64.encode(JSON.stringify(data));
      this.$prompt(
        this.$t('cultivate.panel.sync.saveDataLabel'),
        this.$t('cultivate.panel.sync.saveDataTitle'),
        async () => {
          if (await clipboard.setText(str)) this.$snackbar(this.$t('common.copied'));
        },
        undefined,
        {
          history: false,
          defaultValue: str,
          cancelText: this.$t('common.close'),
          confirmText: this.$t('cultivate.panel.sync.copy2clipboard'),
        },
      );
    },
    restoreData() {
      this.$refs.dataSyncDialog.close();
      this.$prompt(
        this.$t('cultivate.panel.sync.restoreDataLabel'),
        this.$t('cultivate.panel.sync.restoreDataTitle'),
        value => {
          if (value.length == 0) return;
          try {
            this.dataForSave = JSON.parse(Base64.decode(value));
            this.$snackbar(this.$t('cultivate.snackbar.imported'));
          } catch (error) {
            this.$snackbar(this.$t('cultivate.snackbar.importFailed'));
          }
        },
        undefined,
        {
          history: false,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.import'),
        },
      );
    },
    cloudSaveData(silence = false) {
      const data = this.dataForSave;
      const obj = {
        md5: md5(JSON.stringify(data)),
        data,
      };
      this.dataSyncing = true;
      if (this.syncCode) {
        Ajax.updateJson(this.syncCode, obj, this.syncApiKey)
          .then(() => {
            this.dataSyncing = false;
            if (!silence) this.$snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(e => {
            this.dataSyncing = false;
            this.$snackbar(
              `${this.$t('cultivate.snackbar.backupFailed')} ${e.responseText || e.message || ''}`,
            );
          });
      } else {
        Ajax.createJson(obj, this.syncApiKey)
          .then(id => {
            this.dataSyncing = false;
            this.syncCode = id;
            this.$snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(e => {
            this.dataSyncing = false;
            this.$snackbar(
              `${this.$t('cultivate.snackbar.backupFailed')} ${e.responseText || e.message || ''}`,
            );
          });
      }
      if (!silence) {
        this.$gtag.event('material_cloud_backup', {
          event_category: 'material',
          event_label: 'cloud',
        });
      }
    },
    cloudRestoreData() {
      if (!this.syncCode) return;
      this.dataSyncing = true;
      Ajax.getJson(this.syncCode, this.syncApiKey)
        .then(({ md5: _md5, data }) => {
          if (!_md5 || !data || _md5 !== md5(JSON.stringify(data))) {
            this.dataSyncing = false;
            this.$snackbar(this.$t('cultivate.snackbar.restoreFailed'));
            return;
          }
          this.ignoreInputsChange = true;
          this.dataForSave = data;
          this.$snackbar(this.$t('cultivate.snackbar.restoreSucceeded'));
          this.dataSyncing = false;
        })
        .catch(e => {
          this.dataSyncing = false;
          this.$snackbar(
            `${this.$t('cultivate.snackbar.restoreFailed')} ${e.responseText || e.message || ''}`,
          );
        });
      this.$gtag.event('material_cloud_restore', {
        event_category: 'material',
        event_label: 'cloud',
      });
    },
    async initPenguinData() {
      this.penguinData = {
        time: 0,
        data: null,
        ...pdNls.getObject(this.penguinDataServer),
      };

      if (this.penguinData.data && !this.isPenguinDataExpired) return true;

      const tip = this.$snackbar({
        message: this.$t('cultivate.snackbar.penguinDataLoading'),
        timeout: 0,
        closeOnOutsideClick: false,
      });
      const data = await Ajax.get(
        `${this.penguinURL}?server=${this.penguinDataServer}`,
        true,
      ).catch(() => false);
      tip.close();

      if (data) {
        this.penguinData = { data, time: Date.now() };
        pdNls.setItem(this.penguinDataServer, this.penguinData);
        this.$gtag.event('material_penguinstats_loaded', {
          event_category: 'material',
          event_label: 'penguinstats',
        });
      } else {
        if (this.penguinData.data) {
          this.$snackbar(this.$t('cultivate.snackbar.penguinDataFallback'));
          this.$gtag.event('material_penguinstats_fallback', {
            event_category: 'material',
            event_label: 'penguinstats',
          });
        } else {
          this.$snackbar(this.$t('cultivate.snackbar.penguinDataFailed'));
          this.$gtag.event('material_penguinstats_failed', {
            event_category: 'material',
            event_label: 'penguinstats',
          });
          return false;
        }
      }

      return true;
    },
    async initPlanner() {
      if (this.plannerInited) return;

      // 初始化
      this.dropInfo = {
        expectAP: {},
        stageValue: {},
      };
      this.dropTable = {};
      this.materialConstraints = {};
      this.synthesisTable = {};

      if (!(await this.initPenguinData())) return;

      const eap = this.dropInfo.expectAP;

      // 处理合成列表
      for (const { name, type, formula, rare } of this.materialList) {
        eap[name] = {};
        this.materialConstraints[name] = { min: 0 };
        if (_.size(formula) == 0) continue;
        const result = {
          [name]: this.syntProdNum(name),
          ..._.mapValues(formula, v => -v),
          lmd: type === MaterialTypeEnum.MATERIAL ? -100 * (rare - 1) : 0,
          cost: 0,
        };
        let key;
        switch (type) {
          case MaterialTypeEnum.MATERIAL:
            key = rare - 2;
            break;
          case MaterialTypeEnum.CHIP:
            key = this.isConvableChip({ type, rare }) ? 'chip-conv' : 'chip';
            break;
          case MaterialTypeEnum.SKILL_SUMMARY:
            key = 'skill';
            break;
          case MaterialTypeEnum.CHIP_ASS:
            key = 'chip';
            break;
        }
        if (!this.synthesisTable[key]) this.synthesisTable[key] = {};
        this.synthesisTable[key][`synt-${name}`] = result;
      }

      // 狗粮
      const cardExp = {
        2001: 200,
        2002: 400,
        2003: 1000,
        2004: 2000,
      };

      // 合并磨难与普通的掉落
      const matrixTable = _.fromPairs(
        this.penguinData.data.matrix.map(obj => [`${obj.stageId}_${obj.itemId}`, obj]),
      );
      for (const [key, obj] of Object.entries(matrixTable)) {
        if (!key.startsWith('tough_')) continue;
        const mainObj = matrixTable[key.replace('tough', 'main')];
        if (!mainObj) continue;
        mainObj.times += obj.times;
        mainObj.quantity += obj.quantity;
      }

      // 采购凭证特殊处理
      const extendsData = [
        {
          stageId: 'wk_toxic_5',
          itemId: PURCHASE_CERTIFICATE_ID,
          quantity: 21,
          times: 1,
          sampleNum: Infinity,
        },
      ];

      // 处理掉落信息
      for (const { stageId: origStageId, itemId, quantity, times, sampleNum } of [
        ...this.penguinData.data.matrix,
        ...extendsData,
      ]) {
        if (quantity === 0) continue;
        const stageId = origStageId.replace(/_rep$/, '');
        if (
          !(stageId in this.stageTable && (itemId in this.materialConstraints || itemId in cardExp))
        ) {
          continue;
        }
        const { zoneId, code, cost, event = false, retro = false } = this.stageTable[stageId];
        if (event) {
          if (!(zoneId in this.eventInfo) || !this.eventStages.has(stageId)) continue;
        } else if (retro) {
          if (!(zoneToRetro[zoneId] in this.retroInfo) || !this.retroStages.has(stageId)) continue;
        }
        if (!(code in this.dropTable)) {
          this.dropTable[code] = {
            zoneId,
            sampleNum: 0,
            event,
            retro,
            cost,
            lmd: cost * 12,
            cardExp: 0,
          };
        }
        this.dropTable[code][itemId] = quantity / times;
        this.dropTable[code].sampleNum =
          sampleNum || Math.max(this.dropTable[code].sampleNum, times);
        if (itemId in cardExp) {
          this.dropTable[code].cardExp += (cardExp[itemId] * quantity) / times;
        } else {
          eap[itemId][code] = cost / this.dropTable[code][itemId];
        }
      }

      this.plannerInited = true;

      // 最小期望理智，用于计算价值
      // _.forEach(eap, (item, id) => (item.value = this.syntExceptAPListWithoutEvent[id].ap));

      // 计算关卡性价比
      // _.forEach(this.dropTable, (drop, code) => {
      //   const materialAP = _.sum(
      //     _.map(_.omit(drop, dropTableOtherFields), (p, n) => eap[n].value * p),
      //   );
      //   const brAP = (this.dropTable[code].cardExp / 7400) * 30;
      //   this.dropInfo.stageValue[code] = (materialAP + brAP) / drop.cost;
      // });
    },
    showPlan() {
      if (this.plan.cost === 0) {
        this.$alert(this.$t('cultivate.planner.noNeed'), () => {}, {
          confirmText: this.$t('common.okay'),
        });
      } else {
        this.plannerRequest = true;
        this.$nextTick(() => this.$refs.plannerDialog.open());
      }
    },
    resetPenguinData() {
      this.plannerInited = false;
      pdNls.setItem(this.penguinDataServer, {
        data: null,
        ...this.penguinData,
        time: 0,
      });
      return this.initPlanner();
    },
    async showDropDetail({ name }) {
      await this.initPlanner();
      this.dropDetails = [];
      this.dropFocus = name;
      for (const code in this.displayDropListByServer[name]) {
        if (code === 'synt') continue;
        const stage = this.dropTable[code];
        if (!stage) continue;
        const drops = _.toPairs(_.omit(stage, dropTableOtherFields)).sort((a, b) => {
          const s = this.materialTable[b[0]].rare - this.materialTable[a[0]].rare;
          if (s != 0) return s;
          return b[1] - a[1];
        });
        const dropBrs = _.toPairs(_.pick(stage, battleRecordIds));
        this.dropDetails.push({
          code,
          cost: stage.cost,
          sampleNum: stage.sampleNum,
          drops,
          dropBrs,
          showByNum: code.startsWith('AP-'),
        });
      }
      this.$nextTick(() => this.$refs.dropDialog.open());
    },
    showSyntBtn(material) {
      return this.synthesizable[material.name] && _.sum(this.autoGaps[material.name]) > 0;
    },
    getSyntExceptAP(name, withoutEvent = false) {
      if (!this.plannerInited) return null;

      // 线性规划模型
      const model = {
        optimize: 'cost',
        opType: 'min',
        constraints: {
          ...this.materialConstraints,
          [name]: { min: 1 },
        },
        variables: withoutEvent
          ? this.syntExceptAPlpVariablesWithoutEvent
          : this.syntExceptAPlpVariables,
      };

      const result = Linprog.Solve(model);
      const ap = result.result;
      delete result.feasible;
      delete result.result;
      delete result.bounded;

      return {
        stages: Object.keys(result).filter(k => !k.startsWith('synt-')),
        ap,
      };
    },
    onDropListScroll({ deltaY, path }) {
      const listEl = path?.find?.(el => this.$$(el).hasClass('drop-list'));
      if (!listEl) return;
      const dPos = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
      const pos =
        Math[{ '-1': 'floor', 0: 'round', 1: 'ceil' }[dPos]](listEl.scrollTop / 21) + dPos;
      listEl.scrollTop = pos * 21;
    },
    resetSelected() {
      this.selected.rare = Array(this.rareNum).fill(true);
      this.selected.type = _.mapValues(this.selected.type, () => true);
    },
    moraleText(morale) {
      const people = Math.floor(morale / 24);
      const remainder = morale % 24;
      return people > 0 ? `${people} * 24` + (remainder ? ` + ${remainder}` : '') : remainder;
    },
    importItems(items) {
      _.each(items, (num, name) => {
        const input = this.inputs[name];
        if (input && typeof num === 'number') input.have = String(num);
      });
    },
    handleImgErr(e) {
      e.target.src = this.$root.avatar('no_image');
      e.target.style.backgroundColor = '#bdbdbd';
      e.target.style.borderRadius = '50%';
    },
    isSkillReleased({ isPatch, unlockStages }) {
      return !isPatch || unlockStages.every(stage => !this.unopenedStages.includes(stage));
    },
    // 获取相关材料（合成树内所有材料）
    getRelatedMaterials(mid, obj = {}) {
      obj[mid] = true;
      Object.keys(this.materialTable[mid].formula || {}).forEach(id =>
        this.getRelatedMaterials(id, obj),
      );
      return obj;
    },
    // 从 json 导入
    async importFromJSON() {
      const text = await clipboard.readText();
      if (text) {
        try {
          const items = JSON.parse(text);
          if (_.isPlainObject(items)) {
            this.showImportConfirm(items);
            return;
          }
        } catch {}
      }
      this.showImportJSONPrompt();
    },
    showImportJSONPrompt() {
      this.$prompt(
        this.$t('cultivate.panel.importFromJSON.prompt.label'),
        this.$t('cultivate.panel.importFromJSON.prompt.title'),
        value => {
          value = value.trim();
          if (!value) {
            this.$snackbar(this.$t('cultivate.panel.importFromJSON.nothingImported'));
            return;
          }
          try {
            const items = JSON.parse(value);
            if (_.isPlainObject(items)) {
              this.showImportConfirm(items);
              return;
            }
          } catch (e) {
            this.$snackbar(String(e));
          }
          this.showImportJSONPrompt();
        },
        () => {},
        {
          history: false,
          confirmOnEnter: true,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.import'),
        },
      );
    },
    showImportConfirm(items) {
      items = _.pick(items, materialData.materialIdList);
      if (!_.size(items)) {
        this.$snackbar(this.$t('cultivate.panel.importFromJSON.nothingImported'));
        return;
      }
      this.$refs.importConfirmDialog.open(items);
    },
  },
  created() {
    this.$root.$on('import-items', this.importItems);
    this.$root.importItemsListening = true;

    for (const name of materialData.materialIdList) {
      this.$set(this.inputs, name, {
        need: '',
        have: '',
      });
    }

    this.resetSelected();

    nls.each((value, key) => {
      if (key === 'inputs' && value) this.ignoreInputsChange = true;
      if (value) this[key] = pickClone(this[key], value);
    });

    for (const name in this.inputs) {
      const material = this.inputs[name];
      for (const key in material) {
        if (material[key] == 0) material[key] = '';
      }
    }

    this.updatePreset();

    this.throttleAutoSyncUpload = _.throttle(() => this.cloudSaveData(true), 5000, {
      leading: false,
      trailing: true,
    });

    const itemsImportStorageKey = 'depot.imports';
    if (itemsImportStorageKey in (window.localStorage || {})) {
      this.ignoreInputsChange = false;
      const items = safelyParseJSON(window.localStorage.getItem(itemsImportStorageKey));
      window.localStorage.removeItem(itemsImportStorageKey);
      this.importItems(items);
    }
  },
  mounted() {
    this.$refs.presetInput.$el?.querySelector('input')?.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.clearPresetInput();
    });
  },
  beforeDestroy() {
    this.$root.importItemsListening = false;
    this.$root.$off('import-items');
  },
});
