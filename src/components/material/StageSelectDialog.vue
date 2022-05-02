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
import mduiDialogMixin from '@/mixins/mduiDialog';

import _ from 'lodash';
import { fullStageTable, sortStageCodes } from '@/store/stage.js';
import { zoneToNameId } from '@/store/zone.js';
import { zoneToRetro } from '@/data/zone.json';

export default {
  mixins: [mduiDialogMixin],
  data: () => ({
    zoneToNameId,
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
      const blackList = new Set(this.$parent.setting.planStageBlacklist);
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
    zone2CodesByServer() {
      const normalCodeTableByServer = _.omit(
        _.mapKeys(fullStageTable.normal, ({ code }) => code),
        this.$parent.unopenedStages,
      );
      const eventCodeTableByServer = _.pickBy(
        _.mapKeys(fullStageTable.event[this.$root.server], ({ code }) => code),
        ({ zoneId }) => zoneId in this.$parent.eventInfo,
      );
      const retroCodeTableByServer = _.pickBy(
        _.mapKeys(fullStageTable.retro[this.$root.server], ({ code }) => code),
        ({ zoneId }) => zoneToRetro[zoneId] in this.$parent.retroInfo,
      );
      const codeTableByServer = {
        ...eventCodeTableByServer,
        ...normalCodeTableByServer,
        ...retroCodeTableByServer,
      };
      return _.mapValues(
        _.groupBy(Object.keys(codeTableByServer), code => {
          const { zoneId } = codeTableByServer[code];
          return zoneToNameId[zoneId] || zoneId;
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
};
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
