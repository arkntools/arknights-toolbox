<template>
  <div class="mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-1">森空岛设置</div>
    <div class="mdui-dialog-content mdui-p-b-0">
      <div class="flex flex-no-wrap">
        <div
          class="mdui-textfield mdui-textfield-has-bottom flex-grow"
          :class="{ 'mdui-textfield-invalid': isCredInvalid }"
        >
          <label class="mdui-textfield-label">Cred</label>
          <input
            class="mdui-textfield-input"
            :class="{ 'security-disc': !isCredVisible }"
            v-model="store.cred"
            type="text"
          />
          <div class="mdui-textfield-error">长度应为 32，当前为 {{ store.cred.length }}</div>
        </div>
        <div class="flex-no-shrink mdui-p-t-5">
          <button class="mdui-btn mdui-btn-icon" @click="isCredVisible = !isCredVisible">
            <i class="mdui-icon material-icons">{{
              isCredVisible ? 'visibility_off' : 'visibility'
            }}</i>
          </button>
        </div>
      </div>
      <h5 class="mdui-m-t-1">Cred 获取方法</h5>
      <ol>
        <li
          >PC 浏览器进入无痕模式，打开<a href="https://www.skland.com/" target="_blank">森空岛</a
          >并登录</li
        >
        <li>按下 <kbd>F12</kbd> 打开 DevTools，上方选项卡切换到 Console（控制台）</li>
        <li>
          粘贴以下代码并回车执行 <a class="pointer" @click="copySkCredCode">复制代码</a>
          <pre class="mdui-m-y-1 mdui-m-p-1"><code>{{ SK_CRED_CODE }}</code></pre>
        </li>
        <li>Cred 将会被复制，粘贴到上方即可</li>
      </ol>
      <p class="mdui-m-b-0"
        >该功能测试中，更多联动功能以及交互仍待补充。如有问题请提
        <a :href="`${$root.githubRepo}/issues`" target="_blank">issue</a> 反馈。</p
      >
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
import { computed, ref } from 'vue';
import { t } from '@/i18n';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { useSklandStore } from '@/store/skland';
import { setText } from '@/utils/clipboard';
import snackbar from '@/utils/snackbar';

const SK_CRED_CODE = "copy(localStorage.getItem('SK_OAUTH_CRED_KEY'))";

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);

const store = useSklandStore();

const isCredVisible = ref(false);
const isCredInvalid = computed(() => store.cred.length > 0 && !store.credValid);

const copySkCredCode = async () => {
  if (await setText(SK_CRED_CODE)) snackbar(t('common.copied'));
};
</script>

<style lang="scss" scoped>
pre,
code {
  user-select: text;
}
.security-disc {
  -webkit-text-security: disc;
}
</style>
