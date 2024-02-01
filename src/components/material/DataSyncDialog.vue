<template>
  <div class="data-sync mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title">{{ $t('cultivate.panel.sync.cloudSync') }}</div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <h5 class="mdui-m-t-0">{{ $t('cultivate.panel.sync.cloudBackup') }}</h5>
      <div class="mdui-valign-bottom space-8" :class="{ processing: parent.dataSyncing }">
        <button
          class="mdui-btn mdui-ripple"
          v-theme-class="['mdui-color-green-600', 'mdui-color-green-300 mdui-ripple-black']"
          @click="parent.cloudSaveData()"
          ><i class="mdui-icon material-icons mdui-icon-left">cloud_upload</i
          >{{ $t('common.backup') }}</button
        >
        <button
          class="mdui-btn mdui-ripple"
          v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-300 mdui-ripple-black']"
          @click="parent.cloudRestoreData()"
          :disabled="!parent.syncCode"
          ><i class="mdui-icon material-icons mdui-icon-left">cloud_download</i
          >{{ $t('common.restore') }}</button
        >
        <mdui-switch v-model="parent.setting.autoSyncUpload" :disabled="!parent.syncCode">{{
          $t('cultivate.panel.sync.autoSyncUpload')
        }}</mdui-switch>
      </div>
      <table class="sync-options thin-table mdui-m-b-2" style="width: 100%">
        <tbody>
          <tr>
            <td>
              <div class="mdui-textfield">
                <label class="mdui-textfield-label">{{
                  $t('cultivate.panel.sync.syncCode')
                }}</label>
                <input
                  class="mdui-textfield-input"
                  type="text"
                  v-model.trim="parent.syncCode"
                  :disabled="parent.dataSyncing"
                />
              </div>
            </td>
            <td class="va-bottom" width="1">
              <button
                class="mdui-btn mdui-ripple"
                v-theme-class="['mdui-text-color-pink-accent', 'mdui-text-color-indigo-a100']"
                style="min-width: unset"
                :disabled="!parent.syncCode"
                @click="parent.copySyncCode()"
                >{{ $t('common.copy') }}</button
              >
            </td>
          </tr>
        </tbody>
      </table>
      <p>{{ $t('cultivate.panel.sync.cloudSyncReadme') }}</p>
      <p>{{ $t('cultivate.panel.sync.autoSyncUploadTip') }}</p>
      <div class="mdui-divider mdui-m-y-2"></div>
      <h5 class="mdui-m-t-0">{{ $t('cultivate.panel.sync.localBackup') }}</h5>
      <div class="mdui-m-b-1 space-8">
        <button
          class="mdui-btn"
          v-theme-class="['mdui-color-green-600', 'mdui-color-green-300']"
          @click="parent.saveData()"
          ><i class="mdui-icon material-icons mdui-icon-left">file_upload</i
          >{{ $t('common.backup') }}</button
        >
        <button
          class="mdui-btn"
          v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-300']"
          @click="parent.restoreData()"
          ><i class="mdui-icon material-icons mdui-icon-left">file_download</i
          >{{ $t('common.restore') }}</button
        >
      </div>
      <p>{{ $t('cultivate.panel.sync.localBackupReadme') }}</p>
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
import { inject, ref } from 'vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';

const parent = inject('parent')();

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);
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
