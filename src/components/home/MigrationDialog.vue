<template>
  <div class="data-sync mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title">域名变更</div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <p
        >本站最近终于决定要更换到一个较为正式的域名了
        <code>{{ AFTER_HOST }}</code>
      </p>
      <p
        >原域名将在一个月内停止访问并重定向到新域名，本次变更仅更换域名，除此之外没有任何变动，点击下方确认按钮即可带上当前所有设置一键迁移到新站点</p
      >
      <p>如果您已将本站添加到主屏幕，请在迁移后重新添加，旧站点可以删除</p>
    </div>
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
        @click="confirmMigration"
        >GO</button
      >
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { AFTER_HOST, confirmMigration } from '@/utils/migration';

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);

defineExpose(dialog);

onMounted(() => {
  dialog.open();
});
</script>

<style lang="scss" scoped>
.data-sync {
  .tag-btn {
    padding: 0 14px;
  }
}
.sync-options {
  .mdui-textfield {
    display: block;
    padding: 0;
  }
}
</style>
