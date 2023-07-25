<template>
  <div class="mdui-dialog no-sl" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-0">艾丽妮专精计算器</div>
    <div class="mdui-dialog-content mdui-p-t-3">
      <div>
        <mdui-switch
          v-model="settings.lazyMode"
          mdui-tooltip="{content:'普通模式：专精一二时先用其他干员加速，再用艾丽妮凑够 5 小时<br>懒人模式：专精一二全程使用艾丽妮，专三再换其他干员',position:'top'}"
          >懒人模式</mdui-switch
        >
        <mdui-switch v-model="settings.isGuardOrSniper">近卫/狙击</mdui-switch>
        <div class="inline-block">
          <span class="mdui-m-r-1">起始专精</span>
          <div class="mdui-btn-group">
            <button
              v-for="i in 3"
              :key="i"
              class="mdui-btn"
              :class="{ 'mdui-btn-active': settings.startStage === i }"
              @click="settings.startStage = i"
              >{{ i }}</button
            >
          </div>
        </div>
      </div>
      <div class="mdui-m-t-2">
        <template v-if="settings.lazyMode">
          <mdui-number-input
            class="elite-acc-input"
            v-for="i in eliteAcc.length - 1"
            :key="i"
            :value="settings.isGuardOrSniper ? ELITE_IRENE_ACC * 100 : 0"
            :disabled="true"
            >专{{ i }}加成 %</mdui-number-input
          >
          <mdui-number-input
            class="elite-acc-input"
            v-model="eliteAcc[eliteAcc.length - 1]"
            placeholder="0"
            >专{{ eliteAcc.length }}加成 %</mdui-number-input
          >
        </template>
        <template v-else>
          <mdui-number-input
            class="elite-acc-input"
            v-for="i in eliteAcc.length"
            :key="i"
            v-model="eliteAcc[i - 1]"
            :placeholder="eliteAccPlaceholder[i - 1]"
            >专{{ i }}加成 %</mdui-number-input
          >
        </template>
      </div>
      <div class="mdui-table-fluid mdui-m-t-2">
        <table class="mdui-table hide-last-tr-border">
          <thead>
            <tr>
              <th>专精</th>
              <th v-if="!settings.lazyMode">换人时间</th>
              <th>完成时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in calcResult.table" :key="row.id">
              <td>{{ row.id }}</td>
              <template v-if="!settings.lazyMode">
                <td v-if="row.a">
                  <span class="time-text inline-block no-wrap mdui-m-r-1">{{ row.a }}</span>
                  <span class="time-text inline-block no-wrap">({{ row.ad }})</span>
                </td>
                <td v-else>-</td>
              </template>
              <td>
                <span class="time-text inline-block no-wrap mdui-m-r-1">{{ row.b }}</span>
                <span class="time-text inline-block no-wrap">({{ row.bd }})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mdui-m-t-2">总耗时：{{ calcResult.duration }}</div>
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

<script setup>
/* eslint-disable no-unused-vars */
import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { $t } from '@/i18n';

dayjs.extend(duration);

const ELITE_1_TIME = 8 * 3600;
const ELITE_2_TIME_HALF = 8 * 3600;
const ELITE_3_TIME_HALF = 12 * 3600;
const ELITE_IRENE_REAL_TIME = 5 * 3600;
const ELITE_BASIC_ACC = 0.05;
const ELITE_IRENE_ACC = 0.3;
const FORMAT_STR = 'HH:mm';

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);

const settings = reactive({
  lazyMode: false,
  isGuardOrSniper: false,
  startStage: 1,
});
const eliteAcc = ref(['', '', '']);

const eliteAccPlaceholder = computed(() => {
  const acc = [];
  eliteAcc.value.forEach((v, i) => {
    const num = Number(v) || 0;
    if (num || i === 0) acc.push(num);
    else acc.push(acc[i - 1]);
  });
  return acc;
});

// 各阶段加速率
const eliteTimeAccRatio = computed(() => {
  const acc = eliteAcc.value.map((v, i) => {
    if (settings.lazyMode && i < eliteAcc.value.length - 1) {
      return settings.isGuardOrSniper ? ELITE_IRENE_ACC : 0;
    }
    return (Number(v) || 0) / 100;
  });
  return acc.map(v => 1 + ELITE_BASIC_ACC + v);
});
// 艾丽妮加速率
const eliteIreneTimeAccRatio = computed(
  () => 1 + ELITE_BASIC_ACC + (settings.isGuardOrSniper ? ELITE_IRENE_ACC : 0),
);
// 艾丽妮占用的基本时间
const basicTimeIrene = computed(() => ELITE_IRENE_REAL_TIME * eliteIreneTimeAccRatio.value);

// 专一时加速干员占用的实际时间
const realTime1a = computed(
  () => (ELITE_1_TIME - basicTimeIrene.value) / eliteTimeAccRatio.value[0],
);
// 专二时加速干员占用的实际时间
const realTime2a = computed(
  () => (ELITE_2_TIME_HALF - basicTimeIrene.value) / eliteTimeAccRatio.value[1],
);
// 专三时加速干员占用的实际时间
const realTime3 = computed(() => ELITE_3_TIME_HALF / eliteTimeAccRatio.value[2]);

// 懒人专一实际时间
const realLazyTime1 = computed(() => ELITE_1_TIME / eliteIreneTimeAccRatio.value);
// 懒人专二实际时间
const realLazyTime2 = computed(() => ELITE_2_TIME_HALF / eliteIreneTimeAccRatio.value);

const realTimeArray = [realTime1a, realTime2a];
const realLazyTimeArray = [realLazyTime1, realLazyTime2];

/**
 *
 * @param {duration.Duration} dur
 */
const formatDuration = dur =>
  dur.format($t(dur.days() > 0 ? 'common.format.durationDHM' : 'common.format.durationHM'));

/**
 *
 * @param {dayjs.Dayjs} startTime
 * @param {number} nth
 */
const getTimeTableRow = (startTime, nth) => {
  if (nth < 3) {
    const ad = dayjs.duration(realTimeArray[nth - 1].value, 's');
    const bd = ad.add(ELITE_IRENE_REAL_TIME, 's');
    const a = startTime.add(ad);
    const b = startTime.add(bd);
    return {
      nextStartTime: b,
      row: {
        id: nth,
        a: a.format(FORMAT_STR),
        b: b.format(FORMAT_STR),
        ad: formatDuration(ad),
        bd: formatDuration(bd),
      },
    };
  }
  const bd = dayjs.duration(realTime3.value, 's');
  const b = startTime.add(bd);
  return {
    nextStartTime: b,
    row: {
      id: nth,
      b: b.format(FORMAT_STR),
      bd: formatDuration(bd),
    },
  };
};

/**
 *
 * @param {dayjs.Dayjs} startTime
 * @param {number} nth
 */
const getLazyTimeTableRow = (startTime, nth) => {
  const bd = dayjs.duration(nth < 3 ? realLazyTimeArray[nth - 1].value : realTime3.value, 's');
  const b = startTime.add(bd);
  return {
    nextStartTime: b,
    row: {
      id: nth,
      b: b.format(FORMAT_STR),
      bd: formatDuration(bd),
    },
  };
};

const calcResult = computed(() => {
  const rows = [];
  const firstStartTIme = dayjs();
  let finishTime;
  for (let i = settings.startStage, startTime = firstStartTIme; i <= 3; i++) {
    const { nextStartTime, row } = settings.lazyMode
      ? getLazyTimeTableRow(startTime, i)
      : getTimeTableRow(startTime, i);
    startTime = nextStartTime;
    rows.push(row);
    if (i === 3) finishTime = nextStartTime;
  }
  return {
    table: rows,
    duration: formatDuration(dayjs.duration(finishTime.diff(firstStartTIme))),
  };
});
</script>

<style scoped lang="scss">
.inline-valign {
  display: inline-flex;
  align-items: center;
}
.elite-acc-input {
  width: 80px;
  &:not(:last-child) {
    margin-right: 8px;
  }
}
.mdui-table-fluid {
  box-sizing: border-box;
}
.start-stage-select {
  display: inline-block;
  width: 40px;
  ::v-deep .mdui-select {
    width: 100%;
  }
}

@media screen and (max-width: 600px) {
  .mdui-table {
    td,
    th {
      padding: 8px 8px;
      line-height: 24px;
      &:first-child {
        padding-left: 16px;
      }
      &:last-child {
        padding-right: 16px;
      }
    }
  }
}

@media screen and (max-width: 400px) {
  .time-text {
    display: block;
  }
}
</style>
