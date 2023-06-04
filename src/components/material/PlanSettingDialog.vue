<template>
  <div id="planner-setting" class="mdui-dialog mdui-typo no-sl" ref="dialog">
    <div class="mdui-dialog-title" style="padding-bottom: 12px">{{
      $t('cultivate.panel.plannerSetting.title')
    }}</div>
    <div class="mdui-dialog-content mdui-p-t-1 mdui-p-b-0">
      <PlanSetting
        :setting="$parent.setting"
        :is-penguin-data-supported-server="$parent.isPenguinDataSupportedServer"
        :open-id="openId"
      />
      <!-- 关卡选择 -->
      <div class="mdui-m-t-2 mdui-valign flex-wrap">
        <button
          class="mdui-btn mdui-ripple mdui-m-r-1"
          v-theme-class="$root.color.tagBtnHead"
          @click="
            close();
            $emit('open-stage-select');
          "
        >
          <i class="mdui-icon material-icons mdui-icon-left">select_all</i
          >{{ $t('cultivate.panel.plannerSetting.stageSelectTitle') }}
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
import { defineComponent } from 'vue';
import { v4 as uuid } from 'uuid';
import { MduiDialogMixin } from '@/mixins/mduiDialog';
import PlanSetting from './PlanSetting.vue';

export default defineComponent({
  components: { PlanSetting },
  mixins: [MduiDialogMixin],
  data: () => ({
    openId: 'init',
  }),
  created() {
    this.$on('open', () => {
      this.openId = uuid();
    });
  },
});
</script>

<style lang="scss">
#planner-setting {
  .mdui-dialog-content {
    overflow: visible;
  }
}
</style>
