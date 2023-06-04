<template>
  <div>
    <!-- eslint-disable vue/no-mutating-props -->
    <!-- 开关 -->
    <div class="planner-setting-switches flex flex-wrap">
      <mdui-switch v-if="isPenguinDataSupportedServer" v-model="setting.planIncludeEvent">{{
        $t('cultivate.setting.planIncludeEvent')
      }}</mdui-switch>
      <div class="flex flex-grow flex-wrap">
        <mdui-switch v-model="setting.planCardExpFirst">{{
          $t('cultivate.setting.planCardExpFirst')
        }}</mdui-switch>
        <div class="mdui-valign flex-equally" style="min-width: 170px; max-width: 300px">
          <span class="no-wrap mdui-m-r-1">{{ $t('common.threshold') }}</span>
          <span class="no-wrap mdui-m-r-1">0</span>
          <mdui-slider
            :key="openId"
            v-model="setting.planCardExpFirstThreshold"
            :disabled="!setting.planCardExpFirst"
            :step="0.01"
            :min="0"
            :max="1"
          />
          <span class="no-wrap mdui-m-l-1">1</span>
        </div>
      </div>
    </div>
    <!-- 文本框 -->
    <div class="planner-setting-textfields flex flex-wrap">
      <!-- 最小样本数 -->
      <div class="mdui-textfield mdui-p-t-1 mdui-p-b-0">
        <label class="mdui-textfield-label">{{ $t('cultivate.setting.minSampleNum') }}</label>
        <input
          v-model.number="setting.minSampleNum"
          class="mdui-textfield-input"
          type="number"
          min="0"
          step="1"
          placeholder="0"
        />
      </div>
      <!-- 最小理智效率 -->
      <div class="mdui-textfield mdui-p-t-1 mdui-p-b-0">
        <label class="mdui-textfield-label">{{
          $t('cultivate.setting.minApEfficiencyPercent')
        }}</label>
        <input
          v-model.number="setting.minApEfficiencyPercent"
          class="mdui-textfield-input"
          type="number"
          min="0"
          step="1"
          placeholder="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  setting: {
    type: Object,
    required: true,
  },
  isPenguinDataSupportedServer: {
    type: Boolean,
    default: false,
  },
  openId: {
    type: String,
  },
});
</script>
