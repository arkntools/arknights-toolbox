<template>
  <div>
    <h2>{{ $t('a2hs.title') }}</h2>
    <p>{{ $t('a2hs.explains.0') }}</p>
    <p>{{ $t('a2hs.explains.1') }}</p>
    <div class="mdui-panel mdui-panel-gapless" mdui-panel>
      <div class="mdui-panel-item">
        <div class="mdui-panel-item-header">
          <div class="mdui-panel-item-title" style="width: auto">{{ $t('a2hs.guide.title') }}</div>
          <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
        </div>
        <div class="mdui-panel-item-body">
          <h4 class="mdui-m-t-1 h-ul">Chrome</h4>
          <button
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-b-2"
            @click="$root.installPWA"
            :disabled="$root.deferredPrompt === false"
            >{{ $t('a2hs.guide.button') }}</button
          >
          <p>{{ $t('a2hs.guide.buttonTip') }}</p>
          <h4 class="h-ul">Windows - Chrome</h4>
          <i18n path="a2hs.guide.windows" tag="p">
            <i class="mdui-icon material-icons no-sl">more_vert</i>
            <code>{{ $t('a2hs.guide.install', { name: '明日方舟工具箱' }) }}</code>
          </i18n>
          <h4 class="h-ul">Android - Chrome</h4>
          <i18n path="a2hs.guide.android" tag="p">
            <i class="mdui-icon material-icons no-sl">more_vert</i>
            <code>{{ $t('common.a2hs') }}</code>
          </i18n>
          <h4 class="h-ul">iOS ≥ 11.3</h4>
          <i18n path="a2hs.guide.ios" tag="p">
            <span
              ><i class="mdui-icon material-icons no-sl">crop_5_4</i
              ><i
                class="mdui-icon material-icons no-sl"
                style="margin-left: -24px; margin-top: -20px"
                >arrow_upward</i
              ></span
            >
            <code>{{ $t('common.a2hs') }}</code>
          </i18n>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'add-to-home-screen',
};
</script>
