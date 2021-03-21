<template>
  <div id="planner-setting" class="mdui-dialog mdui-typo no-sl" ref="dialog">
    <div class="mdui-dialog-title" style="padding-bottom: 12px">{{
      $t('cultivate.panel.plannerSetting.title')
    }}</div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <div class="mdui-p-t-1">
        <mdui-switch v-for="key in settingList" :key="key" v-model="$parent.setting[key]">{{
          $t(`cultivate.setting.${key}`)
        }}</mdui-switch>
        <mdui-switch
          v-if="$parent.isPenguinDataSupportedServer"
          v-model="$parent.setting.planIncludeEvent"
          >{{ $t('cultivate.setting.planIncludeEvent') }}</mdui-switch
        >
      </div>
      <div class="mdui-m-t-2 mdui-valign flex-wrap">
        <button
          class="mdui-btn mdui-ripple mdui-btn-dense tag-btn mdui-m-r-1"
          v-theme-class="$root.color.tagBtnHead"
          @click="
            close();
            $emit('open-stage-select');
          "
        >
          <i class="mdui-icon material-icons">select_all</i>
          {{ $t('cultivate.panel.plannerSetting.stageSelectTitle') }}
        </button>
        <div class="mdui-valign" style="padding: 6px 0">
          <i class="mdui-icon material-icons" style="margin-right: 4px">do_not_disturb</i>
          <span class="no-wrap">{{
            $tc(
              'cultivate.panel.plannerSetting.excludedStageNumber',
              $parent.setting.planStageBlacklist.length,
            )
          }}</span>
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
<script>
import mduiDialogMixin from '@/mixins/mduiDialog';

export default {
  mixins: [mduiDialogMixin],
  data: () => ({
    settingList: ['planCardExpFirst'],
  }),
};
</script>
