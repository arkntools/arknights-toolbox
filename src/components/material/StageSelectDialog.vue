<template>
  <div id="stage-select" class="mdui-dialog mdui-typo no-sl" ref="dialog">
    <div class="mdui-dialog-title">
      {{ $t('cultivate.panel.plannerSetting.stageSelectTitle') }}
      <div class="select-all">
        <button
          class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
          v-theme-class="$root.color.redBtn"
          @click="batchSelect(false)"
          >{{ $t('common.unselectAll') }}</button
        >
        <button
          class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
          v-theme-class="$root.color.tagBtnHead"
          @click="batchSelect(true)"
          >{{ $t('common.selectAll') }}</button
        >
      </div>
    </div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <div class="zone-wrap" v-for="(codes, zoneId) in zone2CodesByServer" :key="zoneId">
        <div class="zone-header">
          <div class="zone-name mdui-valign">{{
            $t(`zone.${zoneToNameId[zoneId] || zoneId}`)
          }}</div>
          <mdui-checkbox
            class="zone-checkbox"
            v-bind="zoneCheckbox[zoneId]"
            @change="checked => zoneBatchSelect(zoneId, checked)"
          />
        </div>
        <tag-button v-for="code in codes" :key="code" v-model="select[code]" v-bind="color">{{
          code
        }}</tag-button>
      </div>
    </div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.close') }}</button
      >
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { MduiDialogMixin } from '@/mixins/mduiDialog';
import { useDataStore } from '@/store/data';

/**
 * 分割关卡代号
 * @param {string} code
 */
const splitCode = code => {
  const [first = '', second = ''] = code.split('-');
  const firstNum = parseInt(first) || 0;
  const firstCode = first.split(/\d+/)[0];
  return [firstCode, firstNum, parseInt(second) || 0];
};

/**
 * 关卡代号排序
 * @param {string[]} codes
 */
const sortStageCodes = codes =>
  codes.sort((a, b) => {
    const compares = _.zip(splitCode(a), splitCode(b)).map(([av, bv]) => {
      switch (typeof av) {
        case 'string':
          return av.length === bv.length ? bv.localeCompare(av) : av.length - bv.length;
        case 'number':
          return av - bv;
        default:
          return 0;
      }
    });
    return compares.find(result => result !== 0) || 0;
  });

export default defineComponent({
  mixins: [MduiDialogMixin],
  inject: ['parent'],
  data: () => ({
    color: {
      selectedColor: ['mdui-color-green-300', 'mdui-color-green-300'],
      notSelectedColor: [
        'mdui-color-brown-100 mdui-ripple-black',
        'mdui-color-brown-100 mdui-ripple-black',
      ],
    },
    select: {},
  }),
  watch: {
    select: {
      handler(select) {
        if (this.getState() !== 'opened') return;
        const blackList = Object.keys(_.omitBy(select, v => v));
        this.$emit('change', blackList);
      },
      deep: true,
    },
  },
  methods: {
    open() {
      const blackList = new Set(this.parent().setting.planStageBlacklist);
      this.select = _.fromPairs(
        _.flatten(Object.values(this.zone2CodesByServer)).map(code => [code, !blackList.has(code)]),
      );
      this.dialog.open();
    },
    zoneBatchSelect(zoneId, checked) {
      this.zone2CodesByServer[zoneId].forEach(code => (this.select[code] = checked));
    },
    batchSelect(checked) {
      this.select = _.mapValues(this.select, () => checked);
    },
  },
  computed: {
    ...mapState(useDataStore, ['fullStageTable', 'zoneToNameId', 'zoneToRetro']),
    zone2CodesByServer() {
      const normalCodeTableByServer = _.omit(
        _.mapKeys(this.fullStageTable.normal, ({ code }) => code),
        this.parent().unopenedStages,
      );
      const eventCodeTableByServer = _.pickBy(
        _.mapKeys(this.fullStageTable.event[this.$root.server], ({ code }) => code),
        ({ zoneId }) => zoneId in this.parent().eventInfo,
      );
      const retroCodeTableByServer = _.pickBy(
        _.mapKeys(this.fullStageTable.retro[this.$root.server], ({ code }) => code),
        ({ zoneId }) => this.zoneToRetro[zoneId] in this.parent().retroInfo,
      );
      const codeTableByServer = {
        ...eventCodeTableByServer,
        ...normalCodeTableByServer,
        ...retroCodeTableByServer,
      };
      return _.mapValues(
        _.groupBy(Object.keys(codeTableByServer), code => {
          const { zoneId } = codeTableByServer[code];
          return this.zoneToNameId[zoneId] || zoneId;
        }),
        sortStageCodes,
      );
    },
    zoneCheckbox() {
      return _.mapValues(this.zone2CodesByServer, codes => {
        const selectedNum = _.sumBy(codes, code => (this.select[code] ? 1 : 0));
        return {
          checked: selectedNum === codes.length,
          indeterminate: _.inRange(selectedNum, 1, codes.length),
        };
      });
    },
  },
});
</script>

<style lang="scss">
#stage-select {
  .mdui-dialog-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .zone {
    &-wrap {
      position: relative;
      margin: 26px 8px 8px 8px;
      padding: 18px 8px 8px 8px;
      border: solid 1px rgba(0, 0, 0, 0.2);
      border-radius: 2px;
    }
    &-header {
      display: flex;
      justify-content: space-between;
      position: absolute;
      top: -18px;
      left: 8px;
      right: 8px;
    }
    &-name {
      padding: 0 12px;
    }
    &-checkbox {
      padding-left: 42px !important;
      .mdui-checkbox-icon {
        left: 12px;
      }
    }
    &-name,
    &-checkbox {
      background-color: #fff;
    }
  }
}
.mdui-theme-layout-dark #stage-select {
  .zone {
    &-wrap {
      border-color: rgba(255, 255, 255, 0.2);
    }
    &-name,
    &-checkbox {
      background-color: var(--deep-dp-12);
    }
  }
}
</style>
