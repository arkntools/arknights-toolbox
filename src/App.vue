<template>
  <div id="app" :class="`${$root.smallScreen?'mobile-screen mdui-p-t-2':'mdui-p-t-4'} mdui-p-b-5`">
    <div class="mdui-appbar mdui-appbar-fixed mdui-color-grey-900">
      <div id="app-tab" class="mdui-tab mdui-color-theme" :class="{ 'mdui-tab-scrollable mdui-p-l-0': $root.localeNotCN }">
        <router-link to="/" class="mdui-ripple mdui-ripple-white router-root">
          <i class="mdui-icon material-icons">home</i>
        </router-link>
        <router-link to="/hr" class="mdui-ripple mdui-ripple-white"><span>{{$tt('app.公开招募')}}<span class="mdui-hidden-xs">{{$tt('app.计算')}}</span></span></router-link>
        <router-link to="/material" class="mdui-ripple mdui-ripple-white"><span>{{$tt('app.精英材料')}}<span class="mdui-hidden-xs">{{$tt('app.计算')}}</span></span></router-link>
        <router-link to="/level" class="mdui-ripple mdui-ripple-white"><span>{{$tt('app.干员升级')}}<span class="mdui-hidden-xs">{{$tt('app.计算')}}</span></span></router-link>
        <router-link to="/base" class="mdui-ripple mdui-ripple-white"><span>{{$tt('app.基建技能')}}<span class="mdui-hidden-xs">{{$tt('app.筛选')}}</span></span></router-link>
      </div>
      <button id="locale-menu-btn" class="mdui-btn mdui-btn-icon mdui-ripple mdui-ripple-white" mdui-menu="{ target: '#locale-menu', covered: false }"><i class="mdui-icon material-icons">language</i></button>
      <ul id="locale-menu" class="mdui-menu">
        <li class="mdui-menu-item mdui-ripple" v-for="locale in $root.locales" :key="locale.short">
          <a class="mdui-ripple pointer" @click="$root.locale = locale.short; refreshAfterLocaleChangeIfNeed();">
            <i class="mdui-menu-item-icon mdui-icon material-icons" :class="{ 'opacity-0': $root.locale !== locale.short }">done</i>{{ locale.long }}
          </a>
        </li>
      </ul>
    </div>
    <div id="main-container" class="mdui-container">
      <transition name="fade" mode="out-in" @after-leave="$root.nm = false; scrollTop();" @after-enter="$mutation">
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
  methods: {
    scrollTop() {
      window.scroll(0, 0);
    },
    refreshAfterLocaleChangeIfNeed() {
      if (this.isHome()) {
        this.$root.localeSelectKey = this.$now();
      }
    },
    isHome() {
      return this.$router.history.current.path === '/';
    },
  },
  mounted() {
    new this.$Tab('#app-tab');
    window.addEventListener('popstate', () => {
      this.$$('#app-tab .mdui-tab-indicator').remove();
      new this.$Tab('#app-tab').handleUpdate();
    });
  },
};
</script>

<style lang="scss">
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

#locale-menu-btn {
  padding: 0;
  width: 48px;
  height: 48px;
  min-width: unset;
  position: absolute;
  top: 0;
  right: 0;
}
#app:not(.mobile-screen) {
  #app-tab {
    width: calc(100% - 48px);
    margin-left: 0;
  }
}
.mobile-screen {
  #locale-menu-btn {
    display: none;
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
.lh-1 {
  line-height: 1 !important;
}
.hidden {
  display: none !important;
}
.pointer {
  cursor: pointer;
}
.help {
  cursor: help;
}
.small-ph input::-webkit-input-placeholder {
  font-size: 12px;
}
.processing {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
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

.mdui-m-l-05 {
  margin-left: 4px !important;
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
.mdui-valign-bottom {
  display: flex !important;
  align-items: flex-end !important;
  flex-wrap: wrap;
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
.mdui-chip-group .mdui-chip:not(:last-child) {
  margin-right: 16px;
}
.mdui-chip-group {
  overflow: auto;
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

.space-8 {
  margin-right: -8px;
  & > * {
    margin: 0 8px 8px 0;
  }
}
</style>
