<template>
  <div
    id="app"
    :class="`${$root.smallScreen ? 'mobile-screen mdui-p-t-2' : 'mdui-p-t-4'} mdui-p-b-5`"
  >
    <!-- 应用栏 -->
    <div
      id="appbar"
      class="mdui-appbar mdui-appbar-fixed"
      v-theme-class="['mdui-color-grey-900', 'deep-dp-6']"
    >
      <!-- Tab -->
      <div
        id="app-tab"
        class="mdui-tab mdui-tab-scrollable mdui-p-l-0 mdui-m-l-0 mdui-color-theme mdui-hidden-xs"
      >
        <router-link to="/" class="mdui-ripple mdui-ripple-white router-root" replace>
          <i v-if="showWarningIcon" class="mdui-icon material-icons mdui-text-color-yellow"
            >warning</i
          >
          <i v-else class="mdui-icon material-icons">home</i>
        </router-link>
        <router-link
          v-for="{ path, name } in routes.slice(1).filter(({ name }) => name in routeMeta)"
          :key="name"
          :to="path"
          class="mdui-ripple mdui-ripple-white flex-dr"
          replace
          >{{ $t(`app.route.${name}`)
          }}<mini-chip
            v-if="routeMeta[name].chip"
            class="mdui-color-blue-a400"
            style="margin-left: 4px"
            >{{ routeMeta[name].chip }}</mini-chip
          ></router-link
        >
      </div>
      <!-- Toolbar -->
      <button
        class="appbar-btn mdui-btn mdui-btn-icon mdui-ripple mdui-ripple-white mdui-hidden-sm-up"
        mdui-drawer="{ target: '#app-drawer', overlay: true, swipe: true }"
      >
        <i v-if="showWarningIcon" class="mdui-icon material-icons mdui-text-color-yellow"
          >warning</i
        >
        <i v-else class="mdui-icon material-icons">menu</i>
      </button>
      <div class="appbar-title mdui-typo-headline mdui-valign mdui-m-l-2 no-sl mdui-hidden-sm-up"
        >ArknTools</div
      >
      <div class="mdui-toolbar-spacer mdui-hidden-sm-up"></div>
      <!-- 语言（开发用） -->
      <template v-if="isDev">
        <button
          id="locale-menu-btn"
          class="appbar-btn mdui-btn mdui-btn-icon mdui-ripple mdui-ripple-white"
          mdui-menu="{ target: '#locale-menu', covered: false }"
          ><i class="mdui-icon material-icons">translate</i></button
        >
        <ul id="locale-menu" class="mdui-menu" @[mduiMenuClosedEventName]="changeLocale">
          <li
            class="mdui-menu-item mdui-ripple"
            v-for="locale in $root.locales"
            :key="locale.short"
          >
            <a class="mdui-ripple pointer" @click="nextLocale = locale.short">
              <i
                class="mdui-menu-item-icon mdui-icon material-icons"
                :class="{ 'mdui-invisible': $root.locale !== locale.short }"
                >done</i
              >{{ locale.long }}
            </a>
          </li>
        </ul>
      </template>
      <!-- 按钮 -->
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
        <ul id="theme-menu" class="mdui-menu" @[mduiMenuClosedEventName]="changeTheme">
          <li class="mdui-menu-item mdui-ripple" v-for="(value, key) in $root.themeEnum" :key="key">
            <a class="mdui-ripple pointer" @click="nextTheme = value">
              <i
                class="mdui-menu-item-icon mdui-icon material-icons"
                :class="{ 'mdui-invisible': $root.themeSetting !== value }"
                >done</i
              >{{ $t(`app.setting.appearanceList.${key}`) }}
            </a>
          </li>
        </ul>
        <!-- 服务器 -->
        <button
          id="server-menu-btn"
          class="appbar-btn mdui-btn mdui-btn-icon mdui-ripple mdui-ripple-white"
          mdui-menu="{ target: '#server-menu', covered: false }"
          ><i class="mdui-icon material-icons">dns</i
          ><mini-chip
            id="server-chip"
            class="mdui-color-blue-a400 mdui-text-uppercase pointer font-mono"
            >{{ nextServer || $root.server }}</mini-chip
          ></button
        >
        <ul
          id="server-menu"
          class="mdui-menu mdui-text-uppercase"
          @[mduiMenuClosedEventName]="changeServer"
        >
          <li
            class="mdui-menu-item mdui-ripple font-mono"
            v-for="server in $root.servers"
            :key="server"
          >
            <a class="mdui-ripple pointer" @click="nextServer = server">
              <i
                class="mdui-menu-item-icon mdui-icon material-icons"
                :class="{ 'mdui-invisible': $root.server !== server }"
                >done</i
              >{{ server }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <!-- /应用栏 -->
    <!-- 抽屉 -->
    <div id="app-drawer" class="mdui-drawer mdui-drawer-close mdui-hidden-sm-up">
      <div class="app-drawer-logo" @click="enterDebugMode">Arknights<br />Toolbox</div>
      <div class="mdui-list mdui-p-t-0">
        <router-link
          v-for="{ path, name } in routes.filter(({ name }) => name in routeMeta)"
          :key="name"
          :to="path"
          class="mdui-list-item mdui-ripple"
          :class="{ 'mdui-list-item-active': $route.path === path }"
          replace
          mdui-drawer-close
        >
          <i
            v-if="showWarningIcon && name === 'home'"
            class="mdui-list-item-icon mdui-icon material-icons mdui-text-color-amber-600"
            >warning</i
          >
          <i v-else class="mdui-list-item-icon mdui-icon material-icons">{{
            routeMeta[name].icon
          }}</i>
          <div class="mdui-list-item-content mdui-valign"
            >{{ $t(`app.route.${name}`)
            }}<mini-chip v-if="routeMeta[name].chip" class="mdui-color-blue-a400 mdui-m-l-1">{{
              routeMeta[name].chip
            }}</mini-chip></div
          >
        </router-link>
      </div>
    </div>
    <!-- /抽屉 -->
    <div id="main-container" class="mdui-container">
      <transition name="fade" mode="out-in" @after-leave="scrollTop" @enter="$mutation">
        <keep-alive>
          <router-view @nm="nm => ($root.nm = nm)" />
        </keep-alive>
      </transition>
    </div>
    <template v-if="dataReady">
      <template v-if="!$root.dark">
        <img
          v-if="$root.nm && $root.routeIs('hr')"
          class="bg-img no-sl"
          src="@/assets/img/amiya-nm.gif"
        />
        <img v-else class="bg-img no-sl" src="@/assets/img/amiya.gif" />
      </template>
      <template v-else>
        <img
          v-if="$root.nm && $root.routeIs('hr')"
          class="bg-img no-sl"
          src="@/assets/img/amiya-nm-dark.gif"
        />
        <img v-else class="bg-img no-sl" src="@/assets/img/amiya-dark.gif" />
      </template>
    </template>

    <paste-capturer />
    <scroll-to-top />

    <MigrationDialog v-if="showMigrationDialog" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import PasteCapturer from '@/components/PasteCapturer.vue';
import ScrollToTop from '@/components/ScrollToTop.vue';
import MigrationDialog from './components/home/MigrationDialog.vue';
import { router, meta as routeMeta } from './router';
import { vConsoleLoaded, loadVConsole } from '@/utils/vConsole';
import MduiTab from '@/utils/MduiTab';
import { IS_DEV } from '@/utils/env';
import { mapState } from 'pinia';
import { useHotUpdateStore } from './store/hotUpdate';
import { SHOULD_MIGRATE } from './utils/migration';

const mduiTab = new MduiTab('#app-tab');

router.afterEach(to => {
  mduiTab.show(router.options.routes.findIndex(({ path }) => path === to.path));
});

export default defineComponent({
  name: 'app',
  components: { PasteCapturer, ScrollToTop, MigrationDialog },
  setup() {
    return {
      routeMeta,
      mduiMenuClosedEventName: 'closed.mdui.menu',
    };
  },
  data: () => ({
    debugClickCount: 0,
    nextServer: null,
    nextTheme: null,
    nextLocale: null,
    showMigrationDialog: SHOULD_MIGRATE,
  }),
  computed: {
    ...mapState(useHotUpdateStore, ['dataReady', 'showWarningIcon']),
    routes() {
      return this.$router.options.routes;
    },
    isDev() {
      return IS_DEV;
    },
  },
  methods: {
    scrollTop() {
      document.getElementById('wrapper').scroll(0, 0);
    },
    enterDebugMode() {
      if (vConsoleLoaded()) return;
      this.debugClickCount++;
      if (this.debugClickCount === 5) loadVConsole();
    },
    changeServer() {
      if (this.nextServer === null) return;
      this.$root.server = this.nextServer;
      this.nextServer = null;
    },
    changeTheme() {
      if (this.nextTheme === null) return;
      this.$root.themeSetting = this.nextTheme;
      this.nextTheme = null;
    },
    changeLocale() {
      if (this.nextLocale === null) return;
      this.$root.locale = this.nextLocale;
      this.nextLocale = null;
    },
  },
  mounted() {
    mduiTab.init();
    this.$$('#app-drawer').on('close.mdui.drawer', () => {
      this.debugClickCount = 0;
    });
  },
  beforeDestroy() {
    this.$$('#app-drawer').off('close.mdui.drawer');
  },
});
</script>

<style lang="scss">
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
  src: url(./assets/fonts/roboto-mono-latin.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F,
    U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

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

html,
body {
  height: 100%;
  overflow: hidden;
  touch-action: manipulation;
}
body {
  box-sizing: border-box;
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
  *:not(input) {
    user-select: none;
  }
}
a {
  -webkit-user-drag: none;
}

#wrapper {
  height: 100%;
  overflow: hidden auto;
}
#container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.mdui-textfield {
  &:not(.mdui-textfield-floating-label),
  &.mdui-textfield-focus {
    .mdui-textfield-label {
      min-width: 133%;
    }
  }
}

#appbar {
  display: flex;
  flex-wrap: nowrap;
}
#app-tab {
  background-color: transparent !important;
  a {
    text-transform: none;
  }
}
.appbar-btn-list {
  flex-shrink: 0;
}
.appbar-btn {
  padding: 0;
  width: 48px;
  height: 48px;
  min-width: unset;
  flex-shrink: 0;
}
.appbar-title {
  font-weight: 100;
  letter-spacing: 4px;
  flex-shrink: 1;
  overflow: hidden;
}
#app-drawer {
  .mdui-list-item-icon ~ .mdui-list-item-content {
    margin-left: 16px;
  }
}
.app-drawer-logo {
  text-align: center;
  padding: 24px 0;
  font-weight: 100;
  letter-spacing: 4px;
  font-size: 40px;
}

#server-menu {
  width: 95px;
  .mdui-menu-item-icon {
    width: 32px;
    padding-right: 8px;
  }
}

#server-chip {
  position: absolute;
  padding: 0 5px 0.5px 5px;
  right: 2px;
  transform: scale(0.8);
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
  pointer-events: none;
  filter: none !important;
}

.of-hidden {
  overflow: hidden;
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
.can-sl {
  &,
  & * {
    user-select: text;
  }
}
.no-border {
  border: none !important;
}
.no-bs {
  box-shadow: none !important;
}
.inline-flex {
  display: inline-flex;
}
.flex {
  display: flex;
  &-full {
    flex-basis: 100% !important;
  }
  &-equally {
    flex: 1;
  }
  &-grow {
    flex-grow: 1;
  }
  &-no-shrink {
    flex-shrink: 0;
  }
  &-dr {
    flex-direction: row !important;
  }
  &-wrap {
    flex-wrap: wrap;
  }
  &-no-wrap {
    flex-wrap: nowrap;
  }
  &-space-between {
    justify-content: space-between;
  }
}
.block {
  display: block !important;
}
.inline-block {
  display: inline-block !important;
}
.opacity-0 {
  opacity: 0 !important;
}
.opacity-5 {
  opacity: 0.5 !important;
}
.lh-0 {
  line-height: 0 !important;
}
.lh-1 {
  line-height: 1 !important;
}
.hidden {
  display: none !important;
}
.cursor-unset {
  cursor: unset !important;
}
.pointer {
  cursor: pointer !important;
}
.help {
  cursor: help !important;
}
.va-middle {
  vertical-align: middle;
}
.va-bottom {
  vertical-align: bottom;
}
.font-mono {
  font-family: 'Roboto Mono', Roboto, Noto, Helvetica, Arial, sans-serif;
}
.float-left {
  float: left;
}
.mw-100p {
  max-width: 100%;
}

.small-ph input::-webkit-input-placeholder {
  font-size: 12px;
}
.processing {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.btn-group {
  display: inline-flex;
  flex-wrap: nowrap;
  vertical-align: middle;
  margin: 2px 4px 2px 0;
  & > .mdui-btn {
    margin: 0 !important;
  }
  &-left {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &-right {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: rgba(0, 0, 0, 0.13) 1px solid;
  }
}

#app .vue-tags-input {
  max-width: none;
  background-color: transparent;
  .ti-input {
    background-color: transparent;
  }
  .ti-new-tag-input {
    background-color: transparent;
    color: inherit;
  }
}

@each $fsize in 10, 14, 16 {
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

.hide-last-tr-border > tbody > tr:last-child > td {
  border: none !important;
}

.mdui-m-l-auto {
  margin-left: auto !important;
}

.mdui-m-l-05 {
  margin-left: 4px !important;
}

.mdui-p-b-05 {
  padding-bottom: 4px !important;
}

body.mdui-locked {
  width: unset !important;
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
  hr {
    height: 0.8em;
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
.mdui-textfield-has-clear {
  &:not(.mdui-textfield-focus) {
    .mdui-textfield-label {
      padding-right: 32px;
      box-sizing: border-box;
    }
  }
  .mdui-textfield-input {
    padding-right: 32px;
  }
}
.mdui-textfield-floating-label-clear {
  position: absolute;
  right: 8px;
  bottom: 11px;
  .mdui-icon {
    padding: 0;
  }
}
.mdui-menu {
  min-width: min-content;
}

#app {
  overflow-x: hidden;
  flex-grow: 1;
  &.mobile-screen {
    #main-container {
      width: 100%;
      margin: 0;
    }
    .mobile-screen-flex-box {
      display: flex;
      flex-wrap: wrap;
      & > *:not(.no-grow),
      & .btn-group > *:not(.no-grow) {
        flex-grow: 1;
      }
      .no-grow {
        flex-shrink: 0;
      }
      &.equally > * {
        flex: 1;
        min-width: min-content;
      }
    }
  }
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
  margin: 2px 4px 2px 0;
  min-width: 0;
  padding: 0 11px;
  text-transform: unset;
  &-wrap {
    margin-right: -4px;
  }
  .mdui-icon {
    font-size: 17px;
    line-height: inherit;
    float: left;
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
    margin-right: 0;
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
  .mdui-btn[disabled]:not(.mdui-btn-transparent),
  .mdui-fab[disabled] {
    &,
    &:active,
    &:focus,
    &:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
  }
}

// iPhone 异形屏
@supports (height: env(safe-area-inset-bottom)) {
  #container {
    padding-left: calc(env(safe-area-inset-left) * 0.62);
    padding-right: calc(env(safe-area-inset-right) * 0.62);
  }
  #appbar {
    padding-left: env(safe-area-inset-left);
    .appbar-btn-list {
      padding-right: env(safe-area-inset-right);
    }
  }
  .mdui-snackbar-bottom {
    transition-property: transform, padding-bottom;
    &[style*='translate'][style*='0px'] {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
  .mdui-drawer {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.vc-switch {
  left: 0 !important;
  right: unset !important;
}
</style>
