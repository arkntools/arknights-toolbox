<template>
  <div class="data-sync mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title">{{ $t('home.migration.title') }}</div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <i18n path="home.migration.contents.0" tag="p">
        <code>{{ AFTER_HOST }}</code>
      </i18n>
      <p>{{ $t('home.migration.contents.1') }}</p>
      <p>{{ $t('home.migration.contents.2') }}</p>
      <p>{{ $t('home.migration.contents.3') }}</p>
    </div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.notNow') }}</button
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
