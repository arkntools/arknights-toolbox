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
      </div>
      <div v-if="settings.lazyMode" class="mdui-m-t-2">
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
      </div>
      <div v-else class="mdui-m-t-2">
        <mdui-number-input
          class="elite-acc-input"
          v-for="i in eliteAcc.length"
          :key="i"
          v-model="eliteAcc[i - 1]"
          :placeholder="eliteAccPlaceholder[i - 1]"
          >专{{ i }}加成 %</mdui-number-input
        >
      </div>
      <div class="mdui-table-fluid">
        <table class="mdui-table hide-last-tr-border">
          <thead>
            <tr>
              <th>#</th>
              <th>换人时间</th>
              <th>完成时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in table" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.a }} (+{{ row.ad }})</td>
              <td>{{ row.b }}</td>
            </tr>
          </tbody>
        </table>
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

<script setup>
/* eslint-disable no-unused-vars */
import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';

dayjs.extend(duration);

const ELITE_1_TIME = 8 * 3600;
const ELITE_2_TIME_HALF = 8 * 3600;
const ELITE_3_TIME_HALF = 12 * 3600;
const ELITE_IRENE_REAL_TIME = 5 * 3600;
const ELITE_BASIC_ACC = 0.05;
const ELITE_IRENE_ACC = 0.3;

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);

const settings = reactive({
  lazyMode: false,
  isGuardOrSniper: false,
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
const realTimeLazy1 = computed(() => ELITE_1_TIME / eliteIreneTimeAccRatio.value);
// 懒人专二实际时间
const realTimeLazy2 = computed(() => ELITE_2_TIME_HALF / eliteIreneTimeAccRatio.value);

const curTime = ref(Date.now());

const table = computed(() => {
  const FORMAT_STR = 'HH:mm';
  const DUR_FORMAT_STR = 'H[h]m[m]';
  const curDate = dayjs(curTime.value);
  const date1a = curDate.add(realTime1a.value, 's');
  const duration1a = dayjs.duration(realTime1a.value, 's');
  const date1b = date1a.add(ELITE_IRENE_REAL_TIME, 's');
  return [
    {
      id: 1,
      a: date1a.format(FORMAT_STR),
      ad: duration1a.format(DUR_FORMAT_STR),
      b: date1b.format(FORMAT_STR),
    },
  ];
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
</style>
