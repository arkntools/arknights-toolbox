<template>
  <div id="planner" class="mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title">
      {{ $t('cultivate.planner.title') }}
      <p class="mdui-m-b-0 mdui-m-t-2" style="font-size: 15px">
        {{ $t('cultivate.planner.expectedAP') }}<code>{{ plan.cost }}</code
        ><br />
        <span v-theme-class="['mdui-text-color-blue-900', 'mdui-text-color-blue-200']">{{
          $t('common.stage')
        }}</span>
        × <span v-theme-class="$root.color.pinkText">{{ $t('common.times') }}</span
        >&nbsp;&nbsp;(<span
          v-theme-class="['mdui-text-color-yellow-900', 'mdui-text-color-yellow-300']"
          >{{ $t('item.AP_GAMEPLAY') }}</span
        >)&nbsp;&nbsp;{{ $t('cultivate.dropDetail.apEfficiency') }}&nbsp;&nbsp;<span
          class="mdui-text-color-theme-secondary"
          >{{ $t('cultivate.dropDetail.sampleNum') }}</span
        >&nbsp;&nbsp;|&nbsp;&nbsp;<span class="mdui-text-color-theme mdui-btn-bold">{{
          $t('cultivate.planner.targetMaterial')
        }}</span
        >&nbsp;&nbsp;<span class="mdui-text-color-theme-secondary">{{
          $t('cultivate.planner.otherMaterial')
        }}</span>
      </p>
      <PlanSetting
        v-if="parent.plannerShowMiniSetting"
        id="planner-mini-setting"
        class="mdui-dialog-content mdui-m-t-2"
        :setting="parent.setting"
        :is-penguin-data-supported-server="parent.isPenguinDataSupportedServer"
      />
    </div>
    <div class="mdui-dialog-content">
      <div class="stage" v-for="stage in plan.stages" :key="stage.code">
        <h5 class="stage-title h-ul">
          <span class="stage-code"
            ><span v-theme-class="['mdui-text-color-blue-900', 'mdui-text-color-blue-200']">{{
              stage.code
            }}</span>
            × <span v-theme-class="$root.color.pinkText">{{ stage.times }}</span
            >&nbsp;&nbsp;(<span
              v-theme-class="['mdui-text-color-yellow-900', 'mdui-text-color-yellow-200']"
              >{{ stage.cost }}</span
            >)</span
          >
          <small class="stage-efficiency mdui-text-color-theme-text">{{
            parent.stageEfficiency[stage.code]
              ? parent.toPercent(parent.stageEfficiency[stage.code])
              : '-'
          }}</small>
          <small class="stage-sample-num mdui-text-color-theme-secondary">{{
            stage.sampleNum
          }}</small>
          <small
            v-if="stage.code in parent.stageFromNameIdTable"
            class="from-name mdui-text-color-theme-secondary mdui-text-truncate"
            >{{ $t(`zone.${parent.stageFromNameIdTable[stage.code]}`) }}</small
          >
        </h5>
        <div class="num-item-list">
          <ArknNumItem
            v-for="drop in stage.drops"
            :key="`${stage.code}-${drop.name}`"
            v-show="$root.isImplementedMaterial(drop.name)"
            :class="{ 'highlight-bg': parent.highlight[drop.name] && parent.hlGaps[drop.name][0] }"
            :img="drop.name"
            :lable="$t(`material.${drop.name}`)"
            :num="drop.num"
            :color="
              parent.gaps[drop.name][0] > 0
                ? 'mdui-text-color-theme mdui-btn-bold'
                : 'mdui-text-color-theme-secondary'
            "
          />
          <ArknNumItem
            img="4001"
            :lable="$t('item.4001')"
            :num="parent.num100k(stage.money)"
            color="mdui-text-color-theme-secondary"
          />
          <ArknNumItem
            v-if="stage.cardExp > 0"
            img="2001"
            :lable="$t('common.exp')"
            :num="parent.num100k(stage.cardExp)"
            color="mdui-text-color-theme-secondary"
          />
          <!-- 占位 -->
          <div class="num-item" v-for="i in 4" :key="i"></div>
        </div>
      </div>
      <div class="stage" v-if="plan.synthesis.length > 0">
        <h5 class="h-ul">{{ $t('cultivate.planner.needToBeSynthesized') }}</h5>
        <div class="num-item-list">
          <ArknNumItem
            v-for="m in plan.synthesis"
            :key="`synt-${m.name}`"
            :class="{ 'highlight-bg': parent.highlight[m.name] && parent.hlGaps[m.name][0] }"
            :img="m.name"
            :lable="$t(`material.${m.name}`)"
            :num="m.num"
          />
          <ArknNumItem
            img="4001"
            :lable="$t('cultivate.planner.moneyUsed')"
            :num="parent.num100k(plan.synthesisCost)"
          />
          <!-- 占位 -->
          <div class="num-item" v-for="i in 4" :key="i"></div>
        </div>
      </div>
      <div class="stage">
        <h5 class="h-ul">{{ $t('cultivate.planner.obtain') }}</h5>
        <div class="num-item-list">
          <ArknNumItem img="4001" :lable="$t('item.4001')" :num="parent.num100k(plan.money)" />
          <ArknNumItem
            v-if="plan.cardExp > 0"
            img="2001"
            :lable="$t('common.exp')"
            :num="parent.num100k(plan.cardExp)"
          />
          <!-- 占位 -->
          <div class="num-item" v-for="i in 4" :key="i"></div>
        </div>
      </div>
    </div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple float-left"
        v-theme-class="
          parent.plannerShowMiniSetting ? $root.color.pinkBtn : $root.color.dialogTransparentBtn
        "
        @click="
          parent.plannerShowMiniSetting = !parent.plannerShowMiniSetting;
          $nextTick(() => dialog.handleUpdate());
        "
        ><i class="mdui-icon material-icons">settings</i></button
      >
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
import { computed, inject, ref } from 'vue';
import PlanSetting from '@/components/material/PlanSetting.vue';
import ArknNumItem from '@/components/ArknNumItem.vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';

const parent = inject('parent')();
const plan = computed(() => parent.plan);

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);
</script>
