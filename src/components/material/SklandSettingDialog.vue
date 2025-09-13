<template>
  <div class="mdui-dialog mdui-typo" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-0">森空岛设置</div>
    <div class="mdui-dialog-content mdui-p-b-0 mdui-p-t-2">
      <div v-if="store.oauthAvailable">
        <mdui-switch v-model="store.useOAuth">使用 Token（推荐）</mdui-switch>
        <InfoHoverTip :content="SK_TOKEN_TIP" />
      </div>
      <!-- Token -->
      <template v-if="showOAuthContent">
        <div class="flex flex-no-wrap">
          <div
            class="mdui-textfield mdui-textfield-has-bottom flex-grow"
            :class="{ 'mdui-textfield-invalid': isTokenInvalid }"
          >
            <label class="mdui-textfield-label">Token</label>
            <input
              class="mdui-textfield-input"
              :class="{ 'security-disc': !isInputVisible }"
              v-model="store.oauthToken"
              type="text"
            />
            <div class="mdui-textfield-error"
              >长度应为 24，当前为 {{ store.oauthToken.length }}</div
            >
          </div>
          <div class="flex-no-shrink mdui-p-t-5">
            <button class="mdui-btn mdui-btn-icon" @click="isInputVisible = !isInputVisible">
              <i class="mdui-icon material-icons">{{
                isInputVisible ? 'visibility_off' : 'visibility'
              }}</i>
            </button>
          </div>
        </div>
        <h5 class="mdui-m-t-1">Token 获取方法</h5>
        <ol>
          <li
            >PC 浏览器进入无痕模式，打开<a href="https://www.skland.com/" target="_blank">森空岛</a
            >并登录</li
          >
          <li
            >访问
            <a href="https://web-api.skland.com/account/info/hg" target="_blank"
              >https://web-api.skland.com/account/info/hg</a
            >，复制 <code>content</code> 中的值，粘贴到上方</li
          >
        </ol>
        <h5 class="mdui-m-t-1">推荐安装油猴脚本</h5>
        <div class="mdui-valign">
          <button
            class="mdui-btn mdui-ripple mdui-btn-raised"
            v-theme-class="$root.color.pinkBtn"
            @click="openUserscriptInstallWeb"
            >前往安装“Arkntools 扩展”脚本</button
          >
          <span class="mdui-m-l-2">当前状态：{{ store.gmAvailable ? '已安装' : '未安装' }}</span>
          <i
            v-if="store.gmAvailable"
            class="script-install-status-icon mdui-icon material-icons mdui-text-color-green"
            >check</i
          >
          <i v-else class="script-install-status-icon mdui-icon material-icons mdui-text-color-red"
            >clear</i
          >
        </div>
        <ul class="mdui-m-t-2">
          <li>森空岛跨域请求可直接在本机进行，不再需要依赖本站的反代服务，更安全，更快速</li>
          <li>安装完成后，<a class="pointer" @click="refreshPage">刷新页面</a>生效</li>
        </ul>
      </template>
      <!-- Cred -->
      <template v-else>
        <div class="flex flex-no-wrap">
          <div
            class="mdui-textfield mdui-textfield-has-bottom flex-grow"
            :class="{ 'mdui-textfield-invalid': isCredInvalid }"
          >
            <label class="mdui-textfield-label">Cred</label>
            <input
              class="mdui-textfield-input"
              :class="{ 'security-disc': !isInputVisible }"
              v-model="store.cred"
              type="text"
            />
            <div class="mdui-textfield-error">长度应为 32，当前为 {{ store.cred.length }}</div>
          </div>
          <div class="flex-no-shrink mdui-p-t-5">
            <button class="mdui-btn mdui-btn-icon" @click="isInputVisible = !isInputVisible">
              <i class="mdui-icon material-icons">{{
                isInputVisible ? 'visibility_off' : 'visibility'
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
      </template>
      <hr style="height: 0" />
      <p class="mdui-m-b-0"
        >实验性功能，更多联动功能未来可期。如有问题请提
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
import { computed, nextTick, ref, watch } from 'vue';
import { t } from '@/i18n';
import InfoHoverTip from '@/components/InfoHoverTip.vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { useSklandStore } from '@/store/skland';
import { setText } from '@/utils/clipboard';
import snackbar from '@/utils/snackbar';

const SK_CRED_CODE = "copy(localStorage.getItem('SK_OAUTH_CRED_KEY'))";
const SK_TOKEN_TIP =
  'Cred 有效期较短，可能需要频繁更换 Cred，但仅需要在本机进行请求；Token 有效期超长，基本上一次设置终身无忧，但如果没有安装“Arkntools 扩展”脚本，则偶尔需要依靠本站提供的反代服务进行跨域请求。';

const emit = defineEmits(MDUI_DIALOG_EMITS);
const dialogRef = ref();
const dialog = useMduiDialog(emit, dialogRef);
defineExpose(dialog);

const store = useSklandStore();

const isInputVisible = ref(false);
const isTokenInvalid = computed(() => store.oauthToken.length > 0 && !store.oauthTokenValid);
const isCredInvalid = computed(() => store.cred.length > 0 && !store.credValid);

const showOAuthContent = computed(() => store.oauthAvailable && store.useOAuth);

watch(showOAuthContent, async () => {
  await nextTick();
  dialog.handleUpdate();
});

const copySkCredCode = async () => {
  if (await setText(SK_CRED_CODE)) snackbar(t('common.copied'));
};

const openUserscriptInstallWeb = () => {
  window.open('https://greasyfork.org/scripts/548700', '_blank');
};

const refreshPage = () => {
  window.location.reload();
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
.script-install-status-icon {
  font-size: 20px;
  margin-left: 4px;
}
</style>
