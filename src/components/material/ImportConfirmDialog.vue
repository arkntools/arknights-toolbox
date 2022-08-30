<template>
  <div id="import-confirm" class="mdui-dialog mdui-typo no-sl" ref="dialog">
    <div class="mdui-dialog-title">{{ $t('common.import') }}</div>
    <div class="mdui-dialog-content mdui-p-b-0"></div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.no') }}</button
      >
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.pinkBtn"
        mdui-dialog-confirm
        >{{ $t('common.yes') }}</button
      >
    </div>
  </div>
</template>

<script>
import mduiDialogMixin from '@/mixins/mduiDialog';

export default {
  mixins: [mduiDialogMixin],
  methods: {
    open() {
      this.dialog.open();
    },
  },
};
</script>

<style lang="scss">
#planner-setting {
  .mdui-dialog-content {
    overflow: visible;
  }
}
</style>
