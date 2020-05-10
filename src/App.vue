<template>
  <div id="app" :class="`${$root.smallScreen ? 'mobile-screen mdui-p-t-2' : 'mdui-p-t-4'} mdui-p-b-5`">
    <div id="appbar" class="mdui-appbar mdui-appbar-fixed" v-theme-class="['mdui-color-grey-900', 'deep-dp-6']">
      <div
        id="app-tab"
        class="mdui-tab mdui-color-theme"
        :class="{ 'mdui-tab-scrollable mdui-p-l-0': $root.localeNotCN }"
      >
        <router-link to="/" class="mdui-ripple mdui-ripple-white router-root" replace>
          <i class="mdui-icon material-icons">home</i>
        </router-link>
        <router-link to="/hr" class="mdui-ripple mdui-ripple-white" replace
          ><span
            >{{ $tt('app.公开招募') }}<span class="mdui-hidden-xs">{{ $tt('app.计算') }}</span></span
          ></router-link
        >
        <router-link to="/material" class="mdui-ripple mdui-ripple-white" replace
          ><span
            >{{ $tt('app.精英材料') }}<span class="mdui-hidden-xs">{{ $tt('app.计算') }}</span></span
          ></router-link
        >
        <router-link to="/level" class="mdui-ripple mdui-ripple-white" replace
          ><span
            >{{ $tt('app.干员升级') }}<span class="mdui-hidden-xs">{{ $tt('app.计算') }}</span></span
          ></router-link
        >
        <router-link to="/base" class="mdui-ripple mdui-ripple-white" replace
          ><span
            >{{ $tt('app.基建技能') }}<span class="mdui-hidden-xs">{{ $tt('app.筛选') }}</span></span
          ></router-link
        >
      </div>
      <div class="appbar-btn-list">
        <!-- 外观 -->
        <button
          id="theme-menu-btn"
          class="appbar-btn mdui-btn mdui-btn-icon mdui-ripple mdui-ripple-white"
          mdui-menu="{ target: '#theme-menu', covered: false }"
          ><i class="mdui-icon material-icons">{{
            ['brightness_5', 'brightness_4', 'brightness_auto'][$root.themeSetting]
          }}</i></button
        >
        <ul id="theme-menu" class="mdui-menu">
          <li class="mdui-menu-item mdui-ripple" v-for="(value, key) in $root.themeEnum" :key="key">
            <a class="mdui-ripple pointer" @click="$root.themeSetting = value">
              <i
                class="mdui-menu-item-icon mdui-icon material-icons"
                :class="{ 'mdui-invisible': $root.themeSetting !== value }"
                >done</i
              >{{ $t(`home.setting.appearanceList.${key}`) }}
            </a>
          </li>
        </ul>
        <!-- 语言 -->
        <button
          id="locale-menu-btn"
          class="appbar-btn mdui-btn mdui-btn-icon mdui-ripple mdui-ripple-white"
          mdui-menu="{ target: '#locale-menu', covered: false }"
          ><i class="mdui-icon material-icons">language</i></button
        >
        <ul id="locale-menu" class="mdui-menu">
          <li class="mdui-menu-item mdui-ripple" v-for="locale in $root.locales" :key="locale.short">
            <a
              class="mdui-ripple pointer"
              @click="
                $root.locale = locale.short;
                refreshAfterLocaleChangeIfNeed();
              "
            >
              <i
                class="mdui-menu-item-icon mdui-icon material-icons"
                :class="{ 'mdui-invisible': $root.locale !== locale.short }"
                >done</i
              >{{ locale.long }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div id="main-container" class="mdui-container">
      <transition
        name="fade"
        mode="out-in"
        @after-leave="
          $root.nm = false;
          scrollTop();
        "
        @enter="$mutation"
      >
        <router-view />
      </transition>
    </div>
    <template v-if="!$root.dark">
      <img v-if="$root.nm" class="bg-img no-sl" src="./assets/img/amiya-nm.gif" />
      <img v-else class="bg-img no-sl" src="./assets/img/amiya.gif" />
    </template>
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
    this.$$(window).one('mdui-tab-init', () => new this.$Tab('#app-tab'));
    window.addEventListener('popstate', () => {
      this.$$('#app-tab .mdui-tab-indicator').remove();
      new this.$Tab('#app-tab');
    });
  },
};
</script>

<style lang="scss">
:root {
  --mdui-color-amber-400: #ffca28;
  --mdui-color-light-blue-700: #0288d1;
  --mdui-color-green-600: #43a047;
  --mdui-color-green-900: #1b5e20;
  --mdui-color-cyan-300: #4dd0e1;
  --mdui-color-orange-900: #e65100;
  --mdui-color-lime-400: #d4e157;
  --mdui-color-red-900: #b71c1c;
  --mdui-color-grey-700: #616161;
  --mdui-color-indigo-a100: #8c9eff;
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
  overflow-x: hidden;
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

.mdui-textfield {
  .mdui-textfield-label {
    min-width: 133%;
  }
}

#appbar {
  display: flex;
  flex-wrap: nowrap;
}
#app-tab {
  background-color: transparent !important;
  margin-left: 0;
}
.appbar-btn-list {
  flex-shrink: 0;
}
.appbar-btn {
  padding: 0;
  width: 48px;
  height: 48px;
  min-width: unset;
}
@media screen and (max-width: 774px) {
  .appbar-btn {
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
.no-box-shadow {
  box-shadow: none !important;
}
.flex {
  display: flex;
}
.block {
  display: block !important;
}
.inline-block {
  display: inline-block;
}
.opacity-0 {
  opacity: 0;
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
.cursor-unset {
  cursor: unset;
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

@each $fsize in 10, 16 {
  .text-#{$fsize}px {
    font-size: #{$fsize}px;
  }
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
.hr-between-p {
  height: 0 !important;
  margin-bottom: 1.2em !important;
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
  overflow-x: hidden;
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
.mdui-switch {
  padding-left: 3px;
}
.mdui-switch:not(:last-child) {
  margin-right: 16px;
}
.mdui-btn {
  text-transform: capitalize;
}
.mdui-list-item[disabled='disabled'] {
  cursor: default;
  &:hover {
    background-color: unset;
  }
}
.mdui-ripple {
  .mdui-checkbox-icon {
    box-shadow: none !important;
  }
}
.mdui-dialog.content-variable {
  display: flex;
  flex-direction: column;
  .mdui-card-content {
    flex-grow: 1;
  }
}

.tag-table {
  box-shadow: none;
  border: none !important;
  white-space: normal;
  background-color: transparent !important;
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
  &.tag-table-header {
    display: block;
    width: 100%;
  }
}

.space-8 {
  margin-right: -8px;
  & > * {
    margin: 0 8px 8px 0;
  }
}

// 深色模式
:root {
  --deep-dp-1: #1e1e1e;
  --deep-dp-2: #212121;
  --deep-dp-3: #242424;
  --deep-dp-4: #272727;
  --deep-dp-6: #2c2c2c;
  --deep-dp-8: #2d2d2d;
  --deep-dp-12: #323232;
  --deep-dp-16: #353535;
  --deep-dp-24: #373737;
}
body.mdui-theme-layout-dark {
  &::-webkit-scrollbar,
  &::-webkit-scrollbar-track-piece {
    background: #121212;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.6);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.65);
  }
  &::-webkit-scrollbar-thumb:active {
    background: rgba(255, 255, 255, 0.7);
  }
}
.mdui-theme-layout-dark {
  background-color: #121212;
  &,
  .mdui-panel-item,
  .mdui-card,
  .mdui-table td {
    color: #dedede;
  }
  img {
    filter: brightness(0.75);
  }
  @each $depth in 1, 2, 3, 4, 6, 8, 12, 16, 24 {
    .deep-dp-#{$depth} {
      background-color: var(--deep-dp-#{$depth});
    }
  }
  &.mdui-theme-accent-indigo {
    .mdui-radio input[type='radio']:checked + .mdui-radio-icon {
      border-color: var(--mdui-color-indigo-a100);
      &:before {
        background-color: var(--mdui-color-indigo-a100);
      }
    }
    .mdui-select-menu-item[selected] {
      color: var(--mdui-color-indigo-a100);
    }
    .mdui-textfield-focus {
      .mdui-icon,
      .mdui-textfield-label,
      .mdui-textfield-floating-label.mdui-textfield-focus .mdui-textfield-label {
        color: var(--mdui-color-indigo-a100);
      }
      .mdui-textfield-input {
        border-bottom-color: var(--mdui-color-indigo-a100);
        box-shadow: 0 1px 0 0 var(--mdui-color-indigo-a100);
      }
    }
    .mdui-checkbox input[type='checkbox'] {
      &:checked + .mdui-checkbox-icon:after,
      &:indeterminate + .mdui-checkbox-icon:after {
        background-color: var(--mdui-color-indigo-a100);
        border-color: var(--mdui-color-indigo-a100);
      }
    }
    .mdui-dialog-actions .mdui-btn {
      color: var(--mdui-color-indigo-a100);
    }
    .mdui-text-color-theme-accent {
      color: var(--mdui-color-indigo-a100) !important;
    }
  }
  .mdui-typo {
    a {
      color: var(--mdui-color-indigo-a100);
      &:before {
        background-color: var(--mdui-color-indigo-a100);
      }
    }
    h1,
    h2,
    h4.h-ul,
    h5.h-ul {
      border-bottom-color: rgba(255, 255, 255, 0.16);
    }
  }
  .mdui-table-fluid {
    border: none;
  }
  .mdui-table {
    background-color: var(--deep-dp-2);
    border: none;
    tbody tr:last-child td {
      border: none;
    }
  }
  .mdui-menu,
  .mdui-select-menu {
    background-color: var(--deep-dp-12);
  }
  .mdui-menu-item > a:hover,
  .mdui-select-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.09);
  }
  .mdui-panel-item,
  .mdui-card {
    background-color: var(--deep-dp-2);
  }
  .mdui-table-hoverable tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.09);
  }
  .mdui-drawer,
  .mdui-dialog {
    background-color: var(--deep-dp-12);
  }
  .mdui-snackbar,
  .mdui-tooltip {
    background-color: #484848;
  }
  .mdui-btn[disabled],
  .mdui-fab[disabled] {
    &,
    &:active,
    &:focus,
    &:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
  }
}
</style>
