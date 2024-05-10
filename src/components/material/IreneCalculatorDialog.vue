<template>
  <div class="mdui-dialog no-sl" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-0">{{ $t('ireneCalc.title') }}</div>
    <div ref="dialogContentRef" class="mdui-dialog-content mdui-p-t-3 mdui-p-b-0">
      <!-- 设置 -->
      <div class="mdui-valign flex-wrap settings-wrap">
        <div class="mdui-valign inline-flex flex-no-wrap">
          <mdui-switch v-model="settings.lazyMode" class="mdui-m-r-1" :truncate="true">{{
            $t('ireneCalc.settings.lazyMode')
          }}</mdui-switch>
          <i class="mdui-icon material-icons help no-sl" @click="showLazyModeTip">{{
            $root.dark ? 'info' : 'info_outline'
          }}</i>
        </div>
        <mdui-switch v-model="settings.isGuardOrSniper" :truncate="true">{{
          $t('ireneCalc.settings.isGuardOrSniper')
        }}</mdui-switch>
        <mdui-switch v-if="isAscalonUnreleased" v-model="settings.useAscalon" :truncate="true"
          >{{ $t(`character.${ASCALON_ID}`) }} (+5%)</mdui-switch
        >
        <div class="inline-block">
          <span class="mdui-m-r-1">{{ $t('ireneCalc.settings.initSpLv') }}</span>
          <div class="mdui-btn-group">
            <button
              v-for="{ value, half } in startStageButtons"
              :key="`${value}-${half}`"
              class="mdui-btn"
              :class="{
                'mdui-btn-active': settings.startStage === value && settings.startWithHalf === half,
              }"
              @click="
                () => {
                  settings.startStage = value;
                  settings.startWithHalf = half;
                }
              "
              >{{ value
              }}{{ half || value === 1 ? '' : ` (${$t('ireneCalc.settings.notHalved')})` }}</button
            >
          </div>
        </div>
      </div>
      <div class="mdui-valign flex-wrap settings-wrap mdui-m-t-1">
        <mdui-switch v-model="settingsNotSave.enableCustomStartTime" :truncate="true">{{
          $t('ireneCalc.settings.customStartTime')
        }}</mdui-switch>
        <DatePicker
          v-if="settingsNotSave.enableCustomStartTime"
          v-model="customStartTime"
          type="datetime"
          :lang="dataPickerI18n"
          :show-time-panel="settingsNotSave.showTimePanel"
          :clearable="false"
          :show-second="false"
          :disabled-date="date => curTimeStartOfDay.isAfter(date)"
          @close="settingsNotSave.showTimePanel = false"
        >
          <template v-slot:footer>
            <button
              class="mx-btn mx-btn-text"
              @click="settingsNotSave.showTimePanel = !settingsNotSave.showTimePanel"
            >
              {{
                settingsNotSave.showTimePanel
                  ? $t('ireneCalc.datePicker.selectDate')
                  : $t('ireneCalc.datePicker.selectTime')
              }}
            </button>
          </template>
        </DatePicker>
      </div>
      <div class="mdui-m-t-2">
        <template v-if="settings.lazyMode">
          <mdui-number-input
            class="elite-acc-input"
            v-for="i in settings.eliteAcc.length - 1"
            :key="i"
            :value="settings.isGuardOrSniper ? ELITE_IRENE_ACC * 100 : 0"
            :disabled="true"
            >{{ $t('ireneCalc.settings.spBonus', { i }) }}</mdui-number-input
          >
          <mdui-number-input
            class="elite-acc-input"
            v-model="settings.eliteAcc[settings.eliteAcc.length - 1]"
            placeholder="0"
            >{{
              $t('ireneCalc.settings.spBonus', { i: settings.eliteAcc.length })
            }}</mdui-number-input
          >
        </template>
        <template v-else>
          <mdui-number-input
            class="elite-acc-input"
            v-for="i in settings.eliteAcc.length"
            :key="i"
            v-model="settings.eliteAcc[i - 1]"
            :placeholder="eliteAccPlaceholder[i - 1]"
            >{{ $t('ireneCalc.settings.spBonus', { i }) }}</mdui-number-input
          >
        </template>
      </div>
      <div v-if="!settings.lazyMode" class="mdui-m-t-2">
        ⚠️ {{ $t('ireneCalc.tip.swapIrene') }}
      </div>
      <!-- 表格 -->
      <div class="mdui-table-fluid mdui-m-t-2">
        <table ref="tableRef" class="mdui-table hide-last-tr-border">
          <thead>
            <tr>
              <th>{{ $t('ireneCalc.table.spLv') }}</th>
              <th v-if="!settings.lazyMode">{{ $t('ireneCalc.table.swapTime') }}</th>
              <th>{{ $t('ireneCalc.table.finishTime') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in calcResult.table" :key="row.id">
              <td class="no-wrap">{{ row.id - 1 }}→{{ row.id }}</td>
              <template v-if="!settings.lazyMode">
                <td v-if="row.a" class="time-cell">
                  <span class="time-text">{{ row.a }}</span>
                  <span class="time-text">({{ $t('ireneCalc.timeAfter', { time: row.ad }) }})</span>
                  <span class="time-text">({{ $t('ireneCalc.timeLeft', { time: row.rd }) }})</span>
                </td>
                <td v-else>-</td>
              </template>
              <td class="time-cell">
                <span class="time-text">{{ row.b }}</span>
                <span class="time-text">({{ row.bd }})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mdui-m-t-2">{{ $t('ireneCalc.totalTime') }}{{ calcResult.duration }}</div>
    </div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.close') }}</button
      >
    </div>
    <SimpleAlert ref="alertRef" :html="$t('ireneCalc.tip.lazyMode')" />
  </div>
</template>

<script setup>
import 'vue2-datepicker/index.css';
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import DatePicker from 'vue2-datepicker';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import SimpleAlert from '@/components/SimpleAlert.vue';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import { useDatePickerI18n } from '@/utils/datePickerI18n';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { t } from '@/i18n';

dayjs.extend(duration);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);

const isReleasedChar = inject('isReleasedChar');

const nls = new NamespacedLocalStorage('ireneCalc');

const ELITE_1_TIME = 8 * 3600;
const ELITE_2_TIME = 16 * 3600;
const ELITE_2_TIME_HALF = 8 * 3600;
const ELITE_3_TIME_HALF = 12 * 3600;
const ELITE_IRENE_REAL_TIME = 5 * 3600;
const ELITE_BASIC_ACC = 0.05;
const ELITE_IRENE_ACC = 0.3;
const ELITE_ASCALON_ACC = 0.05;
const FORMAT_STR = 'HH:mm';
const SETTING_STORE_KEY = 'settings';
const ASCALON_ID = '4132_ascln';

const startStageButtons = [
  {
    value: 1,
    half: false,
  },
  {
    value: 2,
    half: false,
  },
  {
    value: 2,
    half: true,
  },
  {
    value: 3,
    half: true,
  },
];

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);

const dataPickerI18n = useDatePickerI18n();

const settings = reactive({
  lazyMode: false,
  isGuardOrSniper: false,
  startStage: 1,
  startWithHalf: false,
  eliteAcc: ['', '', ''],
  useAscalon: false,
});

const settingsNotSave = reactive({
  enableCustomStartTime: false,
  customStartTime: null,
  showTimePanel: false,
});

const isAscalonUnreleased = computed(() => isReleasedChar(ASCALON_ID));
const ascalonAcc = computed(() =>
  settings.useAscalon && isAscalonUnreleased.value ? ELITE_ASCALON_ACC : 0,
);
const ireneAcc = computed(() => (settings.isGuardOrSniper ? ELITE_IRENE_ACC : 0));
const elite2time = computed(() =>
  settings.startStage === 2 && !settings.startWithHalf ? ELITE_2_TIME : ELITE_2_TIME_HALF,
);

const customStartTime = computed({
  get: () => {
    if (settingsNotSave.customStartTime) {
      return settingsNotSave.customStartTime;
    }

    const time = new Date();
    time.setSeconds(0, 0);
    return time;
  },
  set: val => {
    settingsNotSave.customStartTime = val;
  },
});

const restoreSettings = () => {
  if (!nls.has(SETTING_STORE_KEY)) return;
  const storedSettings = nls.getObject(SETTING_STORE_KEY);
  Object.entries(storedSettings).forEach(([k, v]) => {
    if (!(k in settings && typeof settings[k] === typeof v)) return;
    if (Array.isArray(settings[k])) {
      if (!Array.isArray(v) || settings[k].length !== v.length) return;
      if (settings[k].some((sv, i) => typeof sv !== typeof v[i])) return;
    }
    settings[k] = v;
  });
};

const saveSettings = () => {
  nls.setItem(SETTING_STORE_KEY, settings);
};

try {
  restoreSettings();
} catch (error) {
  console.error('[IreneCalculator] restore setting failed:', error);
}

watch(settings, saveSettings, { deep: true });

const eliteAccPlaceholder = computed(() => {
  if (settings.lazyMode) return [0, 0, 0];
  const acc = [];
  settings.eliteAcc.forEach((v, i) => {
    acc.push(Number(v || acc[i - 1]) || 0);
  });
  return acc;
});

// 各阶段加速率
const eliteTimeAccRatio = computed(() => {
  const acc = [];
  if (settings.lazyMode) {
    const acc1and2 = ireneAcc.value * 100;
    acc.push(acc1and2, acc1and2, Number(settings.eliteAcc[2]) || 0);
  } else {
    settings.eliteAcc.forEach((v, i) => {
      acc.push(Number(v || acc[i - 1]) || 0);
    });
  }
  return acc.map(v => 1 + ELITE_BASIC_ACC + ascalonAcc.value + v / 100);
});
// 艾丽妮加速率
const eliteIreneTimeAccRatio = computed(
  () => 1 + ELITE_BASIC_ACC + ascalonAcc.value + ireneAcc.value,
);
// 艾丽妮占用的基本时间
const basicTimeIrene = computed(() => ELITE_IRENE_REAL_TIME * eliteIreneTimeAccRatio.value);

// 专一时加速干员占用的实际时间
const realTime1a = computed(
  () => (ELITE_1_TIME - basicTimeIrene.value) / eliteTimeAccRatio.value[0],
);
// 专一时换艾丽妮的剩余时间
const realTime1r = computed(() => basicTimeIrene.value / eliteTimeAccRatio.value[0]);
// 专二时加速干员占用的实际时间
const realTime2a = computed(
  () => (elite2time.value - basicTimeIrene.value) / eliteTimeAccRatio.value[1],
);
// 专二时换艾丽妮的剩余时间
const realTime2r = computed(() => basicTimeIrene.value / eliteTimeAccRatio.value[1]);
// 专三时加速干员占用的实际时间
const realTime3 = computed(() => ELITE_3_TIME_HALF / eliteTimeAccRatio.value[2]);

// 懒人专一实际时间
const realLazyTime1 = computed(() => ELITE_1_TIME / eliteIreneTimeAccRatio.value);
// 懒人专二实际时间
const realLazyTime2 = computed(() => elite2time.value / eliteIreneTimeAccRatio.value);

const realTimeArrayA = [realTime1a, realTime2a];
const realTimeArrayR = [realTime1r, realTime2r];
const realLazyTimeArray = [realLazyTime1, realLazyTime2];

const curTime = ref(Date.now());
let curTimeUpdateTimer;

const calcStartTime = computed(() =>
  settingsNotSave.enableCustomStartTime && settingsNotSave.customStartTime
    ? settingsNotSave.customStartTime.getTime()
    : curTime.value,
);
const curTimeStartOfDay = computed(() => dayjs(curTime.value).startOf('day'));

/**
 * @param {duration.Duration} dur
 * @param {'floor' | 'round' | 'ceil'} [opt]
 */
const roundDurMinute = (dur, opt = 'round') => dayjs.duration(Math[opt](dur.asMinutes()), 'm');

/**
 * @param {duration.Duration} dur
 * @param {'floor' | 'round' | 'ceil'} [opt]
 */
const formatDuration = (dur, opt) => {
  if (opt) dur = roundDurMinute(dur, opt);
  return dur.format(t(dur.days() > 0 ? 'common.format.durationDHM' : 'common.format.durationHM'));
};

/**
 * @param {dayjs.Dayjs} time
 */
const formatTime = time => {
  const timeStr = time.format(FORMAT_STR);
  if (time.isToday()) return timeStr;
  if (time.isTomorrow()) return t('common.format.tomorrow', { time: timeStr });
  return `${time.date()}${t('common.format.date')} ${timeStr}`;
};

/**
 * @param {dayjs.Dayjs} startTime
 * @param {number} nth
 */
const getTimeTableRow = (startTime, nth) => {
  if (nth < 3) {
    const ad = dayjs.duration(realTimeArrayA[nth - 1].value, 's');
    const bd = ad.add(ELITE_IRENE_REAL_TIME, 's');
    const rd = dayjs.duration(realTimeArrayR[nth - 1].value, 's');
    const a = startTime.add(ad);
    const b = startTime.add(bd);
    return {
      nextStartTime: b,
      row: {
        id: nth,
        a: formatTime(a),
        b: formatTime(b),
        ad: formatDuration(ad),
        bd: formatDuration(bd),
        rd: formatDuration(rd, 'ceil'),
      },
    };
  }
  const bd = dayjs.duration(realTime3.value, 's');
  const b = startTime.add(bd);
  return {
    nextStartTime: b,
    row: {
      id: nth,
      b: formatTime(b),
      bd: formatDuration(bd),
    },
  };
};

/**
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
      b: formatTime(b),
      bd: formatDuration(bd),
    },
  };
};

const calcResult = computed(() => {
  const rows = [];
  const firstStartTIme = dayjs(calcStartTime.value);
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

// 必要时更新 dialog 高度
const tableRef = ref();
const dialogContentRef = ref();
const tableResizeObserver = new ResizeObserver(() => {
  const { clientHeight, scrollHeight } = dialogContentRef.value || {};
  if (scrollHeight > clientHeight) dialog.handleUpdate();
});

const alertRef = ref();
const showLazyModeTip = () => {
  alertRef.value?.open();
};

onMounted(() => {
  tableResizeObserver.observe(tableRef.value);
  curTimeUpdateTimer = setInterval(() => {
    curTime.value = Date.now();
  }, 5000);
});
onBeforeUnmount(() => {
  tableResizeObserver.disconnect(tableRef.value);
  clearInterval(curTimeUpdateTimer);
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
.settings-wrap {
  margin-right: -16px;
  & > * {
    margin-right: 16px;
    margin-bottom: 8px;
  }
}
.time-cell {
  padding-right: 20px;
}
.time-text {
  display: inline-block;
  white-space: nowrap;
  margin-right: 8px;
}

.mdui-table {
  th {
    line-height: 24px;
  }
  td:last-child.time-cell {
    padding-right: 16px;
  }
}

@media screen and (max-width: 650px) {
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
    .time-cell {
      padding-right: 0;
    }
    td:last-child.time-cell {
      padding-right: 8px;
    }
  }
}

@media screen and (max-width: 520px) {
  .time-text {
    display: block;
  }
}
</style>

<style lang="scss">
.mx-datepicker-popup {
  z-index: 7000;
}

.mx-input-wrapper {
  padding: 1px 0;
}

.mx-time-content {
  height: calc(100% - 35px);
}
</style>
