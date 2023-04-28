<template>
  <div class="mdui-dialog no-sl" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-0">艾丽妮专精计算器</div>
    <div class="mdui-dialog-content mdui-p-t-3">
      <div>
        <mdui-switch
          v-model="lazyMode"
          mdui-tooltip="{content:'普通模式：专精一二时先用其他干员加速，再用艾丽妮凑够 5 小时<br>懒人模式：专精一二全程使用艾丽妮，专三再换其他干员',position:'top'}"
          >懒人模式</mdui-switch
        >
        <mdui-switch v-model="isGuardOrSniper">近卫/狙击</mdui-switch>
      </div>
      <div class="mdui-m-t-2">
        <mdui-number-input class="elite-acc-input" v-model="eliteAcc[0]"
          >专一加成 %</mdui-number-input
        >
        <mdui-number-input class="elite-acc-input" v-model="eliteAcc[1]"
          >专二加成 %</mdui-number-input
        >
        <mdui-number-input class="elite-acc-input" v-model="eliteAcc[2]"
          >专三加成 %</mdui-number-input
        >
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
import { computed, ref } from 'vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';

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

const lazyMode = ref(false);
const isGuardOrSniper = ref(false);
const eliteAcc = ref(['0', '0', '0']);

// 各阶段加速率
const eliteTimeAccRatio = computed(() =>
  eliteAcc.value.map(v => 1 + ELITE_BASIC_ACC + (Number(v) || 0) / 100),
);
// 艾丽妮加速率
const eliteIreneTimeAccRatio = computed(
  () => 1 + ELITE_BASIC_ACC + (isGuardOrSniper.value ? ELITE_IRENE_ACC : 0),
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
</style>
