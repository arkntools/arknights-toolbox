<template>
  <div class="mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-1">
      {{ $t(`material.${dropFocus}`) }}
      <small class="mdui-p-l-1 mdui-text-color-theme-secondary"
        >{{ parent.inputs[dropFocus].need || 0 }} | {{ parent.inputs[dropFocus].have || 0 }} |
        <span v-theme-class="$root.color.pinkText"
          >{{ parent.gaps[dropFocus][0] || 0
          }}<small v-if="parent.gaps[dropFocus][1] > 0">
            ({{ parent.gaps[dropFocus][1] }})</small
          ></span
        ></small
      >
      <span class="mdui-p-l-1">
        <button
          v-if="
            parent.showSyntBtn(materialTable[dropFocus]) &&
            parent.getSynthesizeMaxTimes(dropFocus) > 1
          "
          v-longpress="() => parent.customSynthesize(dropFocus)"
          @click="parent.synthesize(dropFocus)"
          @contextmenu.prevent="parent.customSynthesize(dropFocus)"
          class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
          v-theme-class="$root.color.pinkText"
          >{{ $t('common.synthesize') }} {{ parent.getSynthesizeMaxTimes(dropFocus) }}</button
        >
        <button
          v-if="parent.showSyntBtn(materialTable[dropFocus])"
          v-longpress="() => parent.customSynthesize(dropFocus)"
          @click="parent.synthesize(dropFocus, 1)"
          @contextmenu.prevent="parent.customSynthesize(dropFocus)"
          class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
          v-theme-class="$root.color.pinkText"
          >{{ $t('common.synthesize') }} 1</button
        >
      </span>
      <div class="mdui-text-color-theme-secondary text-10px">{{
        parent.formulaTooltips[dropFocus]
      }}</div>
      <div
        v-if="parent.materialsCharMap[dropFocus] && parent.materialsCharMap[dropFocus].size > 0"
        class="mdui-text-color-theme-secondary text-10px"
        >{{ $t('cultivate.dropDetail.relatedOperators') }}：<span
          v-for="char in parent.materialsCharMap[dropFocus]"
          :key="`mater_${char}`"
          class="mdui-m-r-1"
          >{{ $t(`character.${char}`) }}</span
        ></div
      >
      <p v-if="parent.dropDetails.length > 0" class="mdui-m-b-0 mdui-m-t-1 text-16px"
        >{{ $t('common.stage') }} | {{ $t('cultivate.dropDetail.expectedAP') }}⚡ |
        {{ $t('cultivate.dropDetail.apEfficiency') }} |
        <span class="mdui-text-color-theme-secondary">{{
          $t('cultivate.dropDetail.sampleNum')
        }}</span></p
      >
    </div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <div class="stage" v-for="dropDetail in parent.dropDetails" :key="`dd-${dropDetail.code}`">
        <h5 class="stage-title h-ul">
          <span class="stage-code">{{ dropDetail.code }}</span>
          <code class="stage-expect-ap"
            >{{
              $_.round(parent.dropInfo.expectAP[dropFocus][dropDetail.code], 1).toPrecision(3)
            }}⚡</code
          >
          <small class="stage-efficiency mdui-text-color-theme-text">{{
            parent.stageEfficiency[dropDetail.code]
              ? parent.toPercent(parent.stageEfficiency[dropDetail.code])
              : '-'
          }}</small>
          <small class="stage-sample-num mdui-text-color-theme-secondary">{{
            dropDetail.sampleNum
          }}</small>
          <small
            v-if="dropDetail.code in parent.stageFromNameIdTable"
            class="from-name mdui-text-color-theme-secondary mdui-text-truncate"
            >{{ $t(`zone.${parent.stageFromNameIdTable[dropDetail.code]}`) }}</small
          >
        </h5>
        <div class="num-item-list">
          <ArknNumItem
            v-for="drop in dropDetail.drops"
            :key="`detail-${dropDetail.code}-${drop[0]}`"
            v-show="$root.isUnreleasedMaterial(drop[0])"
            :img="drop[0]"
            :lable="$t(`material.${drop[0]}`)"
            :num="dropDetail.showByNum ? drop[1] : $_.round(drop[1] * 100, 2) + '%'"
            :color="
              dropFocus == drop[0]
                ? 'mdui-text-color-theme mdui-btn-bold'
                : 'mdui-text-color-theme-secondary'
            "
          />
          <ArknNumItem
            v-for="drop in dropDetail.dropBrs"
            :key="`detail-${dropDetail.code}-${drop[0]}`"
            :img="drop[0]"
            :lable="$t(`item.${drop[0]}`)"
            :num="$_.round(drop[1] * 100, 2) + '%'"
            color="mdui-text-color-theme-secondary"
          />
          <!-- 占位 -->
          <div class="num-item" v-for="i in 4" :key="i"></div>
        </div>
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
import { computed, inject, ref } from 'vue';
import ArknNumItem from '@/components/ArknNumItem.vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { useDataStore } from '@/store/data';

const parent = inject('parent')();
const dropFocus = computed(() => parent.dropFocus);

const store = useDataStore();
const materialTable = computed(() => store.materialTable);

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);
</script>
