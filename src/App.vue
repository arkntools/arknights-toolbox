<i18n>
{
  "en": {
    "计算": " ",
    "筛选": " "
  }
}
</i18n>

<template>
  <div id="app" :class="`${$root.smallScreen?'mobile-screen mdui-p-t-2':'mdui-p-t-4'} mdui-p-b-5`" :lang="$i18n.locale">
    <div class="mdui-appbar mdui-appbar-fixed mdui-color-grey-900">
      <div id="app-tab" class="mdui-tab mdui-color-theme" :class="{ 'mdui-tab-scrollable mdui-p-l-0': $root.localeNotCN }">
        <router-link to="/" class="mdui-ripple mdui-ripple-white router-root">
          <i class="mdui-icon material-icons">home</i>
        </router-link>
        <router-link to="/hr" class="mdui-ripple mdui-ripple-white"><span>{{$t('公开招募')}}<span class="mdui-hidden-xs">{{$t('计算')}}</span></span></router-link>
        <router-link to="/material" class="mdui-ripple mdui-ripple-white"><span>{{$t('精英材料')}}<span class="mdui-hidden-xs">{{$t('计算')}}</span></span></router-link>
        <router-link to="/level" class="mdui-ripple mdui-ripple-white"><span>{{$t('干员升级')}}<span class="mdui-hidden-xs">{{$t('计算')}}</span></span></router-link>
        <router-link to="/base" class="mdui-ripple mdui-ripple-white"><span>{{$t('基建技能')}}<span class="mdui-hidden-xs">{{$t('筛选')}}</span></span></router-link>
      </div>
    </div>
    <div id="main-container" class="mdui-container">
      <transition name="fade" mode="out-in" @leave="$root.nm = false;" @enter="$root.mutation">
        <router-view />
      </transition>
    </div>
    <img v-if="$root.nm" class="bg-img" src="./assets/img/amiya-nm.gif" />
    <img v-else class="bg-img" src="./assets/img/amiya.gif" />
  </div>
</template>

<script>
export default {
  name: 'app',
  mounted() {
    const $ = this.$root.Mdui.JQ;
    const Tab = this.$root.Mdui.Tab;
    new Tab('#app-tab');
    window.addEventListener('popstate', () => {
      $('#app-tab .mdui-tab-indicator').remove();
      new Tab('#app-tab').handleUpdate();
    });
  },
};
</script>

<style lang="scss">
html,
body {
  scroll-behavior: smooth;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.fadeIn {
  animation-name: fadeIn;
}
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

body {
  &::-webkit-scrollbar,
  &::-webkit-scrollbar-track-piece {
    background: #fafafa;
  }
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
  &::-webkit-scrollbar-thumb:active {
    background: rgba(0, 0, 0, 0.3);
  }
}

.bg-img {
  max-width: 240px;
  width: 35vw;
  position: fixed;
  right: 0;
  bottom: 0;
  opacity: 0.2;
  transform: scaleX(-1);
  mask-image: linear-gradient(transparent, #fff, #fff, #fff);
  z-index: -1;
}

.no-wrap {
  white-space: nowrap;
}
.no-pe {
  pointer-events: none;
}
.no-sl {
  user-select: none;
}
.no-border {
  border: none !important;
}
.block {
  display: block !important;
}
.inline-block {
  display: inline-block;
}
.opacity-0 {
  visibility: hidden;
}
.opacity-5 {
  opacity: 0.5;
}
.hidden {
  display: none !important;
}
.pointer {
  cursor: pointer;
}
.small-ph input::-webkit-input-placeholder {
  font-size: 12px;
}

.with-label {
  display: inline-block;
  line-height: 1.5;
  & > span {
    line-height: 24px;
  }
  & > .mdui-select {
    height: 24px;
  }
  .mdui-textfield-label {
    width: fit-content;
  }
}

.thin-table {
  border-spacing: 0;
  td {
    padding: 0;
  }
}

.mdui-typo {
  $bb: 1px solid rgba(0, 0, 0, 0.1);
  h1 {
    border-bottom: $bb;
    padding-bottom: 9.6px;
  }
  h2 {
    border-bottom: $bb;
    padding-bottom: 7.2px;
  }
  h4.h-ul {
    border-bottom: $bb;
    padding-bottom: 6px;
  }
  h5.h-ul {
    border-bottom: $bb;
    padding-bottom: 5px;
  }
}

.mdui-tooltip {
  max-width: 375px;
}
.mdui-btn.small-btn {
  min-width: unset;
  height: 24px;
  line-height: 24px;
}
.mdui-textfield-has-clear .mdui-textfield-input {
  padding-right: 36px;
}
.mdui-textfield-floating-label-clear {
  position: absolute;
  right: 8px;
  bottom: 11px;
  .mdui-icon {
    padding: 0;
  }
}

#app {
  min-height: calc(100vh - 160px);
  &.mobile-screen {
    min-height: calc(100vh - 160px + 16px);
  }
}
.mobile-screen #main-container {
  width: 100%;
  margin: 0;
}

.mdui-color-grey-500,
.mdui-color-yellow-700,
.mdui-color-lime {
  color: #fff !important;
}
.mdui-chip {
  max-width: 100%;
}
.mdui-chip-title {
  max-width: calc(100% - 52px);
}
.mdui-switch:not(:last-child) {
  margin-right: 16px;
}
.mdui-btn {
  text-transform: capitalize;
}

.blod-text {
  font-weight: 600;
}

.tag-table {
  box-shadow: none;
  border: none;
  white-space: normal;
  background-color: transparent;
  td {
    padding: 0.3em 0.5em !important;
  }
  tr:last-child td {
    border: none;
  }
}
.tag-btn {
  margin: 2px 4px;
  margin-left: 0;
  min-width: 0;
  padding: 0 11px;
  text-transform: unset;
  .mdui-icon {
    font-size: 18px;
    margin-top: -2px;
    margin-left: -2px;
  }
  &:last-child {
    margin-right: 0;
  }
  &[has-avatar] {
    padding-left: 36px;
  }
  .tag-avatar {
    max-height: 28px;
    max-width: 28px;
    position: absolute;
    left: 2px;
    top: 2px;
    border-radius: 2px;
  }
}
</style>
