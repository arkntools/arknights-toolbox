import _ from 'lodash';
import { defineComponent, computed, markRaw } from 'vue';
import { mapState, mapActions } from 'pinia';
import { Base64 } from 'js-base64';
import Linprog from 'javascript-lp-solver';
import { Drag, DropList } from 'vue-easy-dnd';
import VueTagsInput from '@johmun/vue-tags-input';

import DataImg from '@/components/DataImg.vue';
import LazyDialog from '@/components/LazyDialog.vue';
import CultivateGuide from '@/components/material/CultivateGuide.vue';
import PlannerDialog from '@/components/material/PlannerDialog.vue';
import DropDialog from '@/components/material/DropDialog.vue';
import DataSyncDialog from '@/components/material/DataSyncDialog.vue';
import PresetTodoDialog from '@/components/material/PresetTodoDialog.vue';
import PlanSettingDialog from '@/components/material/PlanSettingDialog.vue';
import StageSelectDialog from '@/components/material/StageSelectDialog.vue';
import ImportConfirmDialog from '@/components/material/ImportConfirmDialog.vue';
import AccountManageDialog from '@/components/material/AccountManageDialog.vue';
import PresetSettingDialog from '@/components/material/PresetSettingDialog.vue';
import IreneCalculatorDialog from '@/components/material/IreneCalculatorDialog.vue';
import SklandSettingDialog from '@/components/material/SklandSettingDialog.vue';

import Ajax from '@/utils/ajax';
import * as clipboard from '@/utils/clipboard';
import pickClone from '@/utils/pickClone';
import { MATERIAL_TAG_BTN_COLOR } from '@/utils/constant';
import MultiAccount from '@/utils/MultiAccount';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import { JSON_STORAGE_SERVER } from '@/utils/env';
import { useDataStore, MaterialTypeEnum, PURCHASE_CERTIFICATE_ID } from '@/store/data';
import { usePenguinDataStore } from '@/store/penguinData';
import { useMaterialValueStore } from '@/store/materialValue';
import { useSklandStore } from '@/store/skland';
import { useSuppliesStagesOpenStore } from '@/store/suppliesStagesOpen';

const multiAccount = new MultiAccount('material');

const SYNC_CODE_VER = 7;

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
    elite: [false, 7, 10],
  },
  uniequip: {},
  state: 'add',
};
Object.freeze(pSettingInit);
const getPresetSettingTemplate = eliteLength => {
  const init = _.cloneDeep(pSettingInit);
  const initElite = init.skills.elite;
  init.skills.elite = new Array(eliteLength).fill().map(() => [...initElite]);
  return init;
};

const uniequipInit = [false, 0, 3];
Object.freeze(uniequipInit);

const min0 = x => (x < 0 ? 0 : x);
const sumGaps = gaps => gaps[0] + gaps[1];

const defaultData = {
  inputs: {},
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
    translucentEnough: true,
    hideEnough: false,
    showDropProbability: false,
    allowChipConversion: true,
    prioritizeNeedsWhenSynt: false,
    planIncludeEvent: true,
    planCardExpFirst: false,
    planCardExpFirstThreshold: 1,
    [`syncCodeV${SYNC_CODE_VER}`]: '',
    autoSyncUpload: false,
    planStageBlacklist: [],
    simpleModeOrderedByRareFirst: false,
    penguinUseCnServer: false,
    minSampleNum: 0,
    clearOwnedBeforeImportFromJSON: true,
    showExcessNum: false,
    minApEfficiencyPercent: 0,
    dropListSortBy: 'expectAP',
  },
};

export default defineComponent({
  name: 'arkn-material',
  components: {
    Drag,
    DropList,
    VueTagsInput,
    CultivateGuide,
    DataImg,
    LazyDialog,
  },
  provide() {
    return {
      setting: computed(() => this.setting),
      parent: () => this,
    };
  },
  setup() {
    const curAccount = computed(() => multiAccount.currentAccount);
    const curAccountName = computed(() => curAccount.value?.name);
    const accountList = computed(() => multiAccount.data.list);
    return {
      curAccount,
      curAccountName,
      accountList,
      switchAccount: multiAccount.switchAccount.bind(multiAccount),
      dialogs: markRaw({
        PlannerDialog,
        DropDialog,
        DataSyncDialog,
        PresetSettingDialog,
        PresetTodoDialog,
        PlanSettingDialog,
        StageSelectDialog,
        ImportConfirmDialog,
        AccountManageDialog,
        IreneCalculatorDialog,
        SklandSettingDialog,
      }),
    };
  },
  data() {
    return {
      ...defaultData,
      showAll: false,
      enumOccPer,
      preset: '',
      selectedPresetName: '',
      selectedPreset: false,
      pSetting: null,
      presetConstants: { pSettingInit: { ...pSettingInit, uniequip: uniequipInit } },
      settingList: [
        [
          'hideIrrelevant',
          'hideEnough',
          'translucentEnough',
          'showDropProbability',
          'showExcessNum',
          'allowChipConversion',
          'prioritizeNeedsWhenSynt',
        ],
        ['planCardExpFirst'],
      ],
      settingDisabled: {
        hideEnough: () => !this.setting.hideIrrelevant,
      },
      color: MATERIAL_TAG_BTN_COLOR,
      plannerInited: false,
      plannerInitedMd5: '',
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
      throttleAutoSyncUpload: () => {},
      ignoreNextInputsChange: false,
      highlightCost: {},
      jsonStorageAvailable: !!JSON_STORAGE_SERVER,
      suppliesStagesCurTimeUpdateTimer: null,
      forceHideMduiTooltip: markRaw(
        _.throttle(() => this.$$('.mdui-tooltip-open').removeClass('mdui-tooltip-open'), 100, {
          trailing: false,
        }),
      ),
    };
  },
  watch: {
    setting: {
      handler(val) {
        multiAccount.storage.setItem('setting', val);
      },
      deep: true,
    },
    selected: {
      handler(val) {
        multiAccount.storage.setItem('selected', val);
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
        multiAccount.storage.setItem('inputs', val);
        if (this.setting.autoSyncUpload && this.syncCode && !this.ignoreNextInputsChange) {
          this.throttleAutoSyncUpload();
        }
        if (this.ignoreNextInputsChange) this.ignoreNextInputsChange = false;
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
    ...mapState(useDataStore, [
      'curDataMd5',
      'characterTable',
      'unopenedStageSets',
      'eventData',
      'eventStageData',
      'retroData',
      'retroStageData',
      'zoneToNameId',
      'zoneToRetro',
      'unopenedStage',
      'drop',
      'materials',
      'materialList',
      'materialTable',
      'materialIdList',
      'materialTypeGroup',
      'materialTypeGroupIdSet',
    ]),
    ...mapState(useDataStore, {
      elite: 'cultivate',
      materialOrder(state) {
        return state.materialOrder[this.$root.server];
      },
      materialRareFirstOrder(state) {
        return state.materialRareFirstOrder[this.$root.server];
      },
    }),
    ...mapState(usePenguinDataStore, [
      'penguinData',
      'penguinDataValidMatrix',
      'curPenguinDataServer',
    ]),
    ...mapState(useSklandStore, {
      sklandReady: 'ready',
      sklandCultivateCharacters: 'cultivateCharacters',
    }),
    importUsedMaterialIdList() {
      return [...this.materialIdList, '2001', '2002', '2003', '2004', '4001'];
    },
    syncCode: {
      get() {
        return this.setting[`syncCodeV${SYNC_CODE_VER}`];
      },
      set(val) {
        this.setting[`syncCodeV${SYNC_CODE_VER}`] = val;
      },
    },
    // TODO: 企鹅物流暂时不支持繁中服
    isPenguinDataSupportedServer() {
      return this.$root.server !== 'tw';
    },
    penguinHost() {
      // 镜像有问题暂时禁用
      // return `penguin-stats.${
      //   this.$root.localeCN && this.setting.penguinUseCnServer ? 'cn' : 'io'
      // }`;
      return 'penguin-stats.io';
    },
    stageTable() {
      return this.getStageTable(this.$root.server);
    },
    eventInfo() {
      return this.eventData[this.$root.server];
    },
    eventStages() {
      return this.eventStageData[this.$root.server];
    },
    retroInfo() {
      return this.retroData[this.$root.server];
    },
    retroStages() {
      return this.retroStageData[this.$root.server];
    },
    stageFromNameIdTable() {
      return _.transform(
        this.dropTable,
        (obj, { zoneId }, code) => {
          if (this.zoneToNameId[zoneId]) obj[code] = this.zoneToNameId[zoneId];
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
      return this.unopenedStage[this.$root.server];
    },
    dropTableByServer() {
      return _.omit(this.dropTable, this.unopenedStages);
    },
    dropTableUsedByPlanner() {
      let result = _.omit(
        this.isPenguinDataSupportedServer && this.setting.planIncludeEvent
          ? this.dropTableByServer
          : _.omitBy(this.dropTableByServer, o => o.event || o.retro),
        this.setting.planStageBlacklist,
      );
      if (this.setting.minSampleNum > 0) {
        result = _.omitBy(result, ({ sampleNum }) => sampleNum < this.setting.minSampleNum);
      }
      if (this.setting.minApEfficiencyPercent > 0) {
        const minApEff = this.setting.minApEfficiencyPercent / 100;
        result = _.omitBy(
          result,
          (v, code) => this.stageEfficiency[code] > 0 && this.stageEfficiency[code] < minApEff,
        );
      }
      return result;
    },
    dropListByServer() {
      let table = _.merge(
        _.mapValues(this.materialTable, ({ drop }) => _.omit(drop, this.unopenedStages)),
        ...Object.values(
          _.pick(
            _.mapKeys(this.drop.retro, (v, id) => this.zoneToRetro[id]),
            Object.keys(this.retroInfo),
          ),
        ),
      );
      if (this.isPenguinDataSupportedServer) {
        table = _.merge(
          {},
          ...Object.values(_.pick(this.drop.event, Object.keys(this.eventInfo))),
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
    unreleasedElite() {
      return _.pickBy(this.elite, (o, name) => this.$root.isReleasedChar(name));
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
      const splitter = localeUS ? ', ' : '、';
      return _.transform(
        this.materialList,
        (o, { name, formula }) => {
          // egg
          if (this.$root.localeCN) {
            if (name === 'mod_unlock_token') {
              o[name] = '获取途径：周常、每月红票兑换、活动';
              return;
            } else if (name.startsWith('mod_update_token')) {
              o[name] = '获取途径：活动、大家都很不喜欢的保全派驻';
              return;
            }
          }
          const text = [];
          _.forIn(formula, (num, m) => text.push(`${this.$t(`material.${m}`)}*${num}`));
          o[name] =
            text.length > 0
              ? `${header}${text.join(splitter)}`
              : this.$t('common.cannotSynthesize');
        },
        {},
      );
    },
    sortedDropDetails() {
      if (!this.dropDetails) return [];
      const sorted = [...this.dropDetails];
      switch (this.setting.dropListSortBy) {
        case 'expectAP':
          sorted.sort((a, b) => a.expectAP - b.expectAP);
          break;
        case 'drop':
          sorted.sort((a, b) => b.drop - a.drop);
          break;
        case 'stageEfficiency':
          if (!_.size(this.stageEfficiency)) return sorted;
          sorted.sort(
            (a, b) => (this.stageEfficiency[b.code] || 0) - (this.stageEfficiency[a.code] || 0),
          );
          break;
      }
      return sorted;
    },
    synthesizable() {
      return _.transform(
        this.materialList,
        (o, { name, type, rare, formula }) => {
          if (
            _.size(formula) === 0 ||
            (!this.setting.allowChipConversion && this.isConvableChip({ type, rare }))
          ) {
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
    excessNum() {
      return _.mapValues(this.inputsInt, ({ have }, key) => Math.max(0, have - this.gaps[key][2]));
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
      return _.mapValues(this.hlGaps, (gaps, id) =>
        Boolean(this.highlightCost[id] || sumGaps(gaps)),
      );
    },
    showMaterials() {
      if (!this.setting.hideIrrelevant || !this.hasInput) {
        return _.mapValues(this.materialTypeGroupIdSet, (set, type) => {
          const items = (() => {
            const rare = Number(type);
            if (rare) return this.selected.rare[rare - 1] ? Array.from(set) : [];
            return this.selected.type[type] ? Array.from(set) : [];
          })();
          return new Set(items.filter(id => this.$root.isReleasedMaterial(id)));
        });
      }
      const result = _.mapValues(this.selected.type, (v, type) => {
        if (!v) return new Set();
        const curGroupIdSet = this.materialTypeGroupIdSet[type];
        const set = new Set(
          Array.from(curGroupIdSet).filter(id => this.shouldShowRelevantMaterial(id)),
        );
        set.forEach(id => {
          if (sumGaps(this.gaps[id]) <= 0) return;
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
          Array.from(this.materialTypeGroupIdSet[rare]).filter(id =>
            this.shouldShowRelevantMaterial(id),
          ),
        );
        (result[rare + 1] || []).forEach(id => {
          if (!sumGaps(this.gaps[id])) return;
          Object.keys(this.materialTable[id]?.formula || {}).forEach(fsid => {
            if (
              this.materialTable[fsid]?.rare === rare &&
              (this.setting.hideEnough ? sumGaps(this.gaps[fsid]) > 0 : true)
            ) {
              set.add(fsid);
            }
          });
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
        ([id, { need }]) => need + sumGaps(this.gaps[id]),
      );
    },
    presetItems() {
      const input = this.$root.pureName(this.preset);
      const result = _.transform(
        Object.keys(this.unreleasedElite),
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
      return _.map(result.slice(0, 10), o => ({
        name: o.name,
        text: this.$t(`character.${o.name}`),
        cultivateText: this.$root.supportSkland ? this.getPresetItemCultivateText(o.name) : null,
      }));
    },
    presetUniequip() {
      return this.sp?.uniequip.filter(
        ({ id }) => this.$root.isReleasedUniequip(id) || this.pSetting.uniequip[id]?.[0],
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
      return this.unopenedStageSets[this.$root.server].has('CE-6')
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
      return this.unopenedStageSets[this.$root.server].has('LS-6')
        ? { cardExp: -7400, lmd: -360, cost: -30 * this.setting.planCardExpFirstThreshold }
        : { cardExp: -10000, lmd: -432, cost: -36 * this.setting.planCardExpFirstThreshold };
    },
    plan() {
      if (!this.plannerInited) return null;

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
              if (this.isPlannerUnavailableItem(k)) return;
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

      if (!result.feasible) return null;
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
      return _.mapValues(this.materialTypeGroup, materials => {
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
          presets: this.selected.presets.map(({ name, setting }) => ({
            name,
            setting: _.omit(setting, 'state'),
          })),
          planStageBlacklist: this.setting.planStageBlacklist,
        };
      },
      set(data) {
        if (typeof data !== 'object') return;
        const { inputs, presets, planStageBlacklist } = data;
        if (inputs) this.compressedInputs = inputs;
        if (Array.isArray(presets)) {
          this.selected.presets = presets.map(({ name, setting }) => ({
            name,
            setting: {
              ...setting,
              state: 'edit',
            },
            tiClasses: ['ti-valid'],
          }));
        }
        if (Array.isArray(planStageBlacklist)) {
          this.setting.planStageBlacklist = planStageBlacklist;
        }
        this.updatePreset();
      },
    },
    stageEfficiency() {
      return this.calcStageEfficiency(this.dropTable);
    },
  },
  methods: {
    ...mapActions(useDataStore, ['getStageTable']),
    ...mapActions(usePenguinDataStore, ['loadPenguinData', 'fetchPenguinData']),
    ...mapActions(useMaterialValueStore, ['loadMaterialValueData', 'calcStageEfficiency']),
    ...mapActions(useSklandStore, [
      'fetchSklandCultivate',
      'updateSklandCultivateIfExpired',
      'getPresetItemCultivateText',
      'handleMultiAccountIdChange',
      'handleMultiAccountIdDelete',
    ]),
    ...mapActions(useSuppliesStagesOpenStore, [
      'setSuppliesStagesCurTime',
      'isItemSuppliesStageOpen',
    ]),
    isPlannerUnavailableItem(id) {
      return (
        this.materialTable[id]?.type === MaterialTypeEnum.MOD_TOKEN ||
        !this.$root.isReleasedMaterial(id)
      );
    },
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
    toPercent(num) {
      return `${(num * 100).toFixed(2)}%`;
    },
    calcGaps(gapsInitFn) {
      const inputs = this.inputsInt;
      const gaps = _.mapValues(inputs, gapsInitFn);
      const totalNeed = _.mapValues(inputs, gapsInitFn);
      const made = _.mapValues(inputs, () => 0);
      const used = _.mapValues(inputs, () => 0);

      // 自顶向下得到需求
      _.forInRight(this.materials, materials => {
        for (const { name, type, rare, formula } of materials) {
          gaps[name] = min0(gaps[name] - inputs[name].have);
          // 屏蔽同级芯片转换
          if (this.isConvableChip({ type, rare })) continue;
          _.forIn(formula, (num, m) => {
            gaps[m] += gaps[name] * num;
            totalNeed[m] += gaps[name] * num;
          });
        }
      });

      // 自底向上计算合成
      _.forIn(this.materials, (materials, rare) => {
        if (!this.selected.rare[rare - 2]) return;
        for (const { name, type, rare, formula } of materials) {
          if (_.size(formula) === 0) continue;
          if (!this.setting.allowChipConversion && this.isConvableChip({ type, rare })) {
            continue;
          }
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

      return _.mapValues(inputs, (v, k) => [gaps[k], made[k], totalNeed[k]]);
    },
    getSynthesizeMaxTimes(name) {
      const num = this.syntProdNum(name);
      if (num === 0) return 0;
      return Math.min(
        Math.ceil(sumGaps(this.autoGaps[name]) / num),
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

      this.$$(dialog.$dialog[0]).one('close.mdui.dialog', () => {
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
      this.ignoreNextInputsChange = true;
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
            this.ignoreNextInputsChange = true;
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
      multiAccount.storage.setItem('selected', this.selected);
    },
    showPresetBeforeAddTag(obj) {
      const isDuplicate = obj.tag.tiClasses.includes('ti-duplicate');
      if (isDuplicate) {
        const tag = this.selected.presets.find(preset => preset.name === obj.tag.name);
        if (tag) {
          this.showPreset({ tag, clearInputAfterEdit: true }, true);
          return;
        }
      }
      this.showPreset(obj);
    },
    showPreset(obj, edit = false) {
      this.selectedPreset =
        edit && typeof obj.index === 'number' ? { tag: this.selected.presets[obj.index] } : obj;
      this.selectedPresetName = this.selectedPreset.tag.name;
      let pSetting;
      if (edit) pSetting = _.cloneDeep(this.selectedPreset.tag.setting);
      else {
        const eliteSkills = this.elite[this.selectedPresetName]?.skills?.elite ?? [];
        pSetting = getPresetSettingTemplate(eliteSkills.length);
        _.each(eliteSkills, ({ cost }, i) => {
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
      this.selectedPreset.tag.setting = _.cloneDeep(this.pSetting);
      if (this.selectedPreset.clearInputAfterEdit) {
        this.preset = '';
      }
      this.usePreset();
    },
    updatePreset() {
      this.selected.presets.forEach(p => {
        this.$set(p, 'text', this.$t(`character.${p.name}`));
        const eliteSkills = this.elite[p.name]?.skills?.elite ?? [];
        const pEliteSkills = p.setting.skills.elite;
        const lenGap = eliteSkills.length - pEliteSkills.length;
        for (let i = 0; i < lenGap; i++) {
          pEliteSkills.push([...pSettingInit.skills.elite]);
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
      if (!JSON_STORAGE_SERVER) return;
      const data = this.dataForSave;
      this.dataSyncing = true;
      if (this.syncCode) {
        Ajax.updateJson(this.syncCode, data)
          .then(success => {
            if (success) {
              if (!silence) this.$snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
              return;
            }
            this.$snackbar(this.$t('cultivate.snackbar.syncCodeInvalid'));
          })
          .catch(e => {
            this.$snackbar(`${this.$t('cultivate.snackbar.backupFailed')} ${e}`);
          })
          .finally(() => {
            this.dataSyncing = false;
          });
      } else {
        Ajax.createJson(data)
          .then(({ id }) => {
            this.syncCode = id;
            this.$snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(e => {
            this.$snackbar(`${this.$t('cultivate.snackbar.backupFailed')} ${e}`);
          })
          .finally(() => {
            this.dataSyncing = false;
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
      if (!this.syncCode || !JSON_STORAGE_SERVER) return;
      this.dataSyncing = true;
      Ajax.getJson(this.syncCode)
        .then(data => {
          if (!data) {
            this.$snackbar(this.$t('cultivate.snackbar.syncCodeInvalid'));
            return;
          }
          this.ignoreNextInputsChange = true;
          this.dataForSave = data;
          this.$snackbar(this.$t('cultivate.snackbar.restoreSucceeded'));
        })
        .catch(e => {
          this.$snackbar(
            `${this.$t('cultivate.snackbar.restoreFailed')} ${e.responseText || e.message || ''}`,
          );
        })
        .finally(() => {
          this.dataSyncing = false;
        });
      this.$gtag.event('material_cloud_restore', {
        event_category: 'material',
        event_label: 'cloud',
      });
    },
    async initPenguinData(force = false) {
      this.loadMaterialValueData(force);

      if (this.curPenguinDataServer !== this.penguinDataServer) {
        await this.loadPenguinData(this.penguinDataServer);
      }
      if (!force && this.penguinData.data && !this.isPenguinDataExpired) {
        return true;
      }

      const tip = this.$snackbar({
        message: this.$t('cultivate.snackbar.penguinDataLoading'),
        timeout: 0,
        closeOnOutsideClick: false,
      });
      const fetchSuccess = await this.fetchPenguinData(this.penguinDataServer, this.penguinHost);
      tip.close();

      if (fetchSuccess) {
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
    async initPlanner(force = false) {
      if (!force && this.plannerInited) return;
      if (force && !(await this.initPenguinData(force))) return;

      // 初始化
      this.dropInfo = {
        expectAP: {},
        stageValue: {},
      };
      this.dropTable = {};
      this.materialConstraints = {};
      this.synthesisTable = {};

      if (!force && !(await this.initPenguinData(force))) return;

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
        ...this.penguinDataValidMatrix,
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
        } else if (
          retro &&
          (!(this.zoneToRetro[zoneId] in this.retroInfo) || !this.retroStages.has(stageId))
        ) {
          continue;
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

      this.plannerInitedMd5 = this.curDataMd5;
      this.plannerInited = true;
    },
    showPlan() {
      if (!this.plan || this.plan.cost === 0) {
        this.$alert(this.$t('cultivate.planner.noNeed'), () => {}, {
          confirmText: this.$t('common.okay'),
        });
      } else {
        this.$nextTick(() => this.$refs.plannerDialog.open());
      }
    },
    async resetPenguinData() {
      await this.initPlanner(true);
    },
    async showDropDetail({ name }) {
      await this.initPlanner();
      this.dropDetails = [];
      this.dropFocus = name;
      for (const code in this.dropListByServer[name]) {
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
          drop: stage[this.dropFocus] || 0,
          drops,
          dropBrs,
          showByNum: code.startsWith('AP-'),
          expectAP: this.dropInfo?.expectAP[name]?.[code],
        });
      }
      this.$refs.dropDialog.open();
    },
    showSyntBtn(material) {
      return this.synthesizable[material.name] && sumGaps(this.autoGaps[material.name]) > 0;
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
    onDropListScroll({ deltaY, currentTarget }) {
      const dPos = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
      const pos =
        Math[{ '-1': 'floor', 0: 'round', 1: 'ceil' }[dPos]](currentTarget.scrollTop / 21) + dPos;
      currentTarget.scrollTop = pos * 21;
    },
    resetSelected(selected = this.selected) {
      selected.rare = Array(this.rareNum).fill(true);
      selected.type = _.mapValues(selected.type, () => true);
    },
    moraleText(morale) {
      const people = Math.floor(morale / 24);
      const remainder = morale % 24;
      return people > 0 ? `${people} * 24` + (remainder ? ` + ${remainder}` : '') : remainder;
    },
    handleImportItemsEvent(type, data) {
      switch (type) {
        case 'import':
          this.importItems(data);
          break;
        case 'reset':
          this.reset('have', false, false);
          break;
      }
    },
    importItems(items) {
      const levelInputs = {
        2001: 0,
        2002: 0,
        2003: 0,
        2004: 0,
        4001: 0,
      };
      _.each(items, (num, name) => {
        const input = this.inputs[name];
        if (input && typeof num === 'number') input.have = String(num);
        else if (name in levelInputs) levelInputs[name] = num;
      });
      // 导入龙门币和狗粮到升级计算
      if (_.sum(Object.values(levelInputs))) {
        if (this.$root.importLevelItemsListening) {
          this.$root.$emit('import-level-items', levelInputs);
        } else {
          const levelNls = new NamespacedLocalStorage('level');
          const inputs = levelNls.getItem('inputs') || {};
          inputs.money = levelInputs[4001];
          inputs.have = {
            5: levelInputs[2004],
            4: levelInputs[2003],
            3: levelInputs[2002],
            2: levelInputs[2001],
          };
          levelNls.setItem('inputs', inputs);
        }
      }
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
    // 从森空岛导入
    async importFromSkland() {
      if (!this.sklandReady) {
        this.$refs.sklandSettingDialog.open();
        return;
      }
      try {
        const items = await this.fetchSklandCultivate();
        const obj = _.fromPairs(
          items.filter(({ count }) => Number(count)).map(({ id, count }) => [id, Number(count)]),
        );
        this.showImportConfirm(obj);
      } catch (e) {
        console.error(e);
        this.$snackbar(String(e));
      }
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
      items = _.pick(items, this.importUsedMaterialIdList);
      if (!_.size(items)) {
        this.$snackbar(this.$t('cultivate.panel.importFromJSON.nothingImported'));
        return;
      }
      this.$refs.importConfirmDialog.open(items);
    },
    async initFromStorage() {
      this.throttleAutoSyncUpload.flush();
      this.ignoreNextInputsChange = true;

      const tmpData = _.cloneDeep(defaultData);
      tmpData.inputs = _.mapValues(this.materialTable, () => ({
        need: '',
        have: '',
      }));
      this.resetSelected(tmpData.selected);
      _.each(tmpData, (v, key) => {
        const value = multiAccount.storage.getItem(key);
        if (value) tmpData[key] = pickClone(tmpData[key], value);
      });
      _.each(tmpData.inputs, val => {
        for (const key in val) {
          if (val[key] == 0) val[key] = '';
        }
      });
      _.each(tmpData, (v, k) => {
        this[k] = v;
      });

      this.updatePreset();

      const server = this.curAccount.server;
      if (server) this.$root.server = server;
    },
    addAccount() {
      this.$prompt(
        this.$t('common.name'),
        this.$t('common.add'),
        value => {
          value = value.trim();
          if (!value) {
            this.addAccount();
            return;
          }
          multiAccount.addAccount(value);
        },
        () => {},
        {
          history: false,
          confirmOnEnter: true,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.add'),
        },
      );
    },
    deleteAccount(id) {
      multiAccount.delAccount(id);
    },
    shouldShowRelevantMaterial(id) {
      const gap = sumGaps(this.gaps[id]);
      return (
        (this.inputsInt[id].need > 0 || gap > 0) &&
        (this.setting.hideEnough ? gap > 0 : true) &&
        this.$root.isReleasedMaterial(id)
      );
    },
    async exportToArkLights() {
      const data = _.flatMap(
        this.selected.presets,
        ({ name, setting: { evolve, skills, uniequip } }) => {
          const list = [];
          // 不支持阿米娅
          if (name === '002_amiya') return list;
          name = this.$root.cnServerMessages.character[name];
          // 精英化
          const maxEvolve = evolve.findLastIndex(v => v) + 1;
          if (maxEvolve > 0) list.push({ name, elite: maxEvolve });
          // 普通技能
          if (skills.normal[0]) list.push({ name, skills: skills.normal[2] });
          // 专精技能
          skills.elite.forEach(([enable, , maxLevel], i) => {
            if (enable) list.push({ name, skill: i + 1, skill_master: maxLevel - 7 });
          });
          // 模组
          _.map(uniequip, ([enable, , maxLevel], id) => {
            if (!enable) return;
            const numberId = parseInt(id.match(/\d+/)[0]);
            if (Number.isNaN(numberId)) return;
            list.push({
              name,
              uniequip_id: numberId,
              uniequip_name: this.$root.cnServerMessages.uniequip[id],
              uniequip_level: maxLevel,
            });
          });
          return list;
        },
      );
      if (await clipboard.setText(JSON.stringify(data))) {
        this.$snackbar(this.$t('common.copied'));
      }
    },
    async updateSklandCultivateIfSupport() {
      if (!this.$root.supportSkland) return;
      await this.updateSklandCultivateIfExpired();
    },
    updateSuppliesStagesCurTime() {
      this.setSuppliesStagesCurTime(Date.now());
    },
  },
  created() {
    this.throttleAutoSyncUpload = _.throttle(() => this.cloudSaveData(true), 5000, {
      leading: false,
      trailing: true,
    });

    this.$root.$on('import-items', this.handleImportItemsEvent);
    this.$root.importItemsListening = true;

    this.initFromStorage();

    const depotLs = new NamespacedLocalStorage('depot');
    if (depotLs.has('imports')) {
      if (depotLs.getItem('reset')) {
        this.reset('have', false, false);
      }
      this.ignoreNextInputsChange = false;
      const items = depotLs.getItem('imports');
      depotLs.removeItem('reset');
      depotLs.removeItem('imports');
      this.importItems(items);
    }
  },
  mounted() {
    this.$refs.presetInput.$el?.querySelector('input')?.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.clearPresetInput();
    });
    multiAccount.emitter.on('change', this.initFromStorage);
    multiAccount.emitter.on('change', this.handleMultiAccountIdChange);
    multiAccount.emitter.on('delete', this.handleMultiAccountIdDelete);
    this.handleMultiAccountIdChange(multiAccount.data.id);
    this.suppliesStagesCurTimeUpdateTimer = setInterval(this.updateSuppliesStagesCurTime, 60e3);
  },
  activated() {
    this.updateSuppliesStagesCurTime();
    if (this.plannerInited && this.plannerInitedMd5 !== this.curDataMd5) {
      this.plannerInited = false;
      this.initPlanner();
    }
  },
  deactivated() {
    this.forceHideMduiTooltip();
  },
  beforeDestroy() {
    this.$root.importItemsListening = false;
    this.$root.$off('import-items', this.handleImportItemsEvent);
    multiAccount.emitter.off('change', this.initFromStorage);
    multiAccount.emitter.off('change', this.handleMultiAccountIdChange);
    multiAccount.emitter.off('delete', this.handleMultiAccountIdDelete);
    if (this.suppliesStagesCurTimeUpdateTimer) {
      clearInterval(this.suppliesStagesCurTimeUpdateTimer);
      this.suppliesStagesCurTimeUpdateTimer = null;
    }
  },
});
