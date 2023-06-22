<template>
  <div class="mdui-row mdui-center" style="max-width: 1012px">
    <div class="mdui-col-xs-12 mdui-typo">
      <h1 class="mdui-m-t-0">{{ $t('app.title') }}</h1>
      <p
        >Github: <a :href="$root.githubRepo" target="_blank">arkntools/arknights-toolbox</a> (<a
          :href="`${$root.githubRepo}/discussions`"
          target="_blank"
          >discussions</a
        >)</p
      >
      <Welcome />
      <DataStatus />
      <h2>{{ $t('common.setting') }}</h2>
      <div class="no-sl">
        <!-- 语言和服务器 -->
        <LocaleSelect :key="$root.localeSelectKey" />
        <!-- 外观 -->
        <ThemeSelect />
        <!-- 开关 -->
        <div class="mdui-m-b-2">
          <mdui-switch v-model="setting.rememberLastPage">{{
            $t('app.setting.rememberLastPage')
          }}</mdui-switch>
        </div>
        <!-- LocalStorage -->
        <div class="mdui-m-b-2">
          <button
            class="mdui-btn mdui-ripple mdui-m-r-1"
            v-theme-class="[
              'mdui-btn-raised mdui-color-pink-accent',
              'mdui-color-indigo-a100 mdui-ripple-black',
            ]"
            :disabled="!checkLocalStorage()"
            @click="clearLocalStorage"
            >{{ $t('app.setting.clearLocalStorage') }}</button
          ><i
            class="mdui-icon material-icons mdui-m-r-1 help no-sl"
            :mdui-tooltip="`{content:'${$t('app.setting.clearLocalStorageTip')}',position:'top'}`"
            >{{ $root.dark ? 'info' : 'info_outline' }}</i
          >{{ $t('home.used') }}{{ localStorageSize }}
        </div>
        <!-- CacheStorage -->
        <div class="mdui-m-b-2">
          <button
            class="mdui-btn mdui-ripple mdui-m-r-1"
            v-theme-class="[
              'mdui-btn-raised mdui-color-pink-accent',
              'mdui-color-indigo-a100 mdui-ripple-black',
            ]"
            :disabled="!checkCacheStorage()"
            @click="clearCacheStorage"
            >{{ $t('app.setting.clearCacheStorage') }}</button
          ><i
            class="mdui-icon material-icons mdui-m-r-1 help no-sl"
            :mdui-tooltip="`{content:'${$t('app.setting.clearCacheStorageTip')}',position:'top'}`"
            >{{ $root.dark ? 'info' : 'info_outline' }}</i
          >{{ $t('home.used') }}{{ cacheStorageSize }}
        </div>
        <!-- IndexedDB -->
        <div>
          <button
            class="mdui-btn mdui-ripple mdui-m-r-1"
            v-theme-class="[
              'mdui-btn-raised mdui-color-pink-accent',
              'mdui-color-indigo-a100 mdui-ripple-black',
            ]"
            :disabled="!checkIndexedDB()"
            @click="clearIndexedDB"
            >{{ $t('app.setting.clearIndexedDB') }}</button
          ><i
            class="mdui-icon material-icons mdui-m-r-1 help no-sl"
            :mdui-tooltip="`{content:'${$t('app.setting.clearIndexedDBTip')}',position:'top'}`"
            >{{ $root.dark ? 'info' : 'info_outline' }}</i
          >{{ $t('home.used') }}{{ indexDBSize }}
        </div>
      </div>
      <AddToHomeScreen />
      <template v-if="$root.localeCN">
        <h2>主要功能</h2>
        <ul>
          <li>公开招募计算 + 词条截图识别</li>
          <li>精英材料计算 + 干员材料预设 + 仓库截图识别 + 刷图规划</li>
          <li>干员升级计算</li>
          <li>基建技能筛选</li>
        </ul>
      </template>
      <template v-else-if="$root.localeTW">
        <h2>主要功能</h2>
        <ul>
          <li>公開招募計算 + 詞條截圖識別</li>
          <li>精英材料計算 + 幹員材料預設 + 倉庫截圖識別 + 材料獲取最優策略規劃</li>
          <li>幹員陞級計算</li>
          <li>基建技能篩選</li>
        </ul>
      </template>
      <h2>{{ $t('home.credits') }}</h2>
      <ul>
        <li v-for="({ name, type, url }, i) in creditsList" :key="i">
          <a :href="url" target="_blank">{{ name }}</a
          >（{{ type }}）
        </li>
        <li>
          Wiki
          <ul>
            <li>CN &amp; TW - <a href="http://prts.wiki" target="_blank">PRTS Wiki</a></li>
            <li>EN - <a href="https://gamepress.gg/arknights/" target="_blank">GamePress</a></li>
            <li>JP - <a href="https://arknights.wikiru.jp/" target="_blank">Wikiru</a></li>
            <li>KR - <a href="https://namu.wiki/" target="_blank">Namu Wiki</a></li>
          </ul>
        </li>
      </ul>
      <p
        ><a href="https://github.com/arkntools" target="_blank">组织</a>头像及本项目<a
          :href="`${$root.githubRepo}/tree/master/public/assets/icons`"
          target="_blank"
          >应用图标</a
        >由<a href="https://www.pixiv.net/users/8745555" target="_blank">冬夏</a
        >绘制并授权使用，未经许可不得在本项目外使用</p
      >
      <p
        >本项目所使用的游戏资源（包括但不限于：游戏图片、文本原文或其转译版本等）仅用于更好地表现游戏资料、增强用户体验，其版权属于上海鹰角网络科技有限公司和其关联公司</p
      >
      <h2>{{ $t('home.contributors') }}</h2>
    </div>
    <div class="mdui-col-xs-12">
      <ContributorList title="Developers" :list="developers" note-prop="work" icon="code" />
    </div>
    <div class="mdui-col-xs-12">
      <ContributorList
        title="Translators"
        :list="translators"
        note-prop="translation"
        icon="g_translate"
      />
    </div>
    <div class="mdui-col-xs-12 mdui-typo">
      <h2>{{ $t('home.changelog') }}</h2>
      <Changelog />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { defineComponent } from 'vue';
import utf8BufferSize from 'utf8-buffer-size';
import Welcome from '@/components/home/Welcome.vue';
import DataStatus from '@/components/home/DataStatus.vue';
import LocaleSelect from '@/components/home/LocaleSelect.vue';
import ThemeSelect from '@/components/home/ThemeSelect.vue';
import AddToHomeScreen from '@/components/home/AddToHomeScreen.vue';
import Changelog from '@/components/home/Changelog.vue';
import ContributorList from '@/components/home/ContributorList.vue';
import { humanReadableSize } from '@/utils/formatter';
import contributors from '@/data/contributors';

export default defineComponent({
  name: 'home',
  components: {
    Welcome,
    DataStatus,
    LocaleSelect,
    ThemeSelect,
    AddToHomeScreen,
    Changelog,
    ContributorList,
  },
  data() {
    return {
      localStorageSize: this.$t('home.calculating'),
      cacheStorageSize: this.$t('home.calculating'),
      indexDBSize: this.$t('home.calculating'),
      setting: this.$root.setting,
      ...contributors,
      creditsList: [
        {
          name: 'Kengxxiao/ArknightsGameData',
          type: '数据',
          url: 'https://github.com/Kengxxiao/ArknightsGameData',
        },
        {
          name: 'yuanyan3060/Arknights-Bot-Resource',
          type: '数据、图片',
          url: 'https://github.com/yuanyan3060/Arknights-Bot-Resource',
        },
        {
          name: '灰格猫',
          type: '起源',
          url: 'https://github.com/gneko',
        },
        {
          name: '企鹅物流数据统计',
          type: '掉落数据',
          url: 'https://penguin-stats.io/',
        },
        {
          name: '明日方舟一图流',
          type: '材料价值数据',
          url: 'https://yituliu.site/',
        },
        {
          name: '材料获取最优策略',
          type: '思路',
          url: 'https://bbs.nga.cn/read.php?tid=17507710',
        },
        {
          name: 'OCR Space',
          type: 'OCR',
          url: 'https://ocr.space/',
        },
        {
          name: 'ExtendsClass',
          type: '数据同步',
          url: 'https://extendsclass.com/json-storage.html',
        },
      ],
    };
  },
  methods: {
    checkLocalStorage: () => !!window.localStorage,
    checkCacheStorage: () => !!window.caches,
    checkIndexedDB: () => !!window.indexedDB,
    checkStorageManagerEstimate: () => !!window.navigator?.storage?.estimate,
    async clearLocalStorage() {
      if (!(await this.confirmDelete(this.$t('app.setting.clearLocalStorage')))) return;
      window.localStorage.clear();
      this.$snackbar(this.$t('common.success'));
      this.calcLocalStorageSize();
      setTimeout(() => {
        location.reload();
      }, 2000);
    },
    async clearCacheStorage() {
      if (!(await this.confirmDelete(this.$t('app.setting.clearCacheStorage')))) return;
      const cacheKeys = (await window.caches.keys()).filter(key => key.includes('runtime'));
      const cacheList = await Promise.all(cacheKeys.map(key => window.caches.open(key)));
      await Promise.all(
        cacheList.map(cache =>
          cache.keys().then(keys => Promise.all(keys.map(key => cache.delete(key)))),
        ),
      );
      await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
      this.$snackbar(this.$t('common.success'));
      this.calcStorageSize();
    },
    async clearIndexedDB() {
      if (!(await this.confirmDelete(this.$t('app.setting.clearIndexedDB')))) return;
      const dbs = await window.indexedDB.databases();
      await Promise.allSettled(
        dbs.map(
          db =>
            new Promise((resolve, reject) => {
              const req = window.indexedDB.deleteDatabase(db.name);
              req.onsuccess = resolve;
              req.onerror = reject;
            }),
        ),
      );
      this.$snackbar(this.$t('common.success'));
      this.calcStorageSize();
    },
    calcLocalStorageSize() {
      if (!this.checkLocalStorage()) {
        this.localStorageSize = this.$t('common.unknown');
        return;
      }
      this.localStorageSize = humanReadableSize(
        utf8BufferSize(_.flatten(Object.entries(window.localStorage)).join('')) * 2,
      );
    },
    async calcStorageSize() {
      const { usageDetails = {} } = this.checkStorageManagerEstimate()
        ? await window.navigator.storage.estimate()
        : {};
      const { caches, indexedDB } = usageDetails;
      this.cacheStorageSize =
        caches === undefined ? this.$t('common.unknown') : humanReadableSize(caches);
      this.indexDBSize =
        indexedDB === undefined ? this.$t('common.unknown') : humanReadableSize(indexedDB);
    },
    confirmDelete(text) {
      return new Promise(resolve => {
        this.$confirm(
          text,
          () => {
            resolve(true);
          },
          () => {
            resolve(false);
          },
          {
            history: false,
            modal: true,
            cancelText: this.$t('common.no'),
            confirmText: this.$t('common.yes'),
          },
        );
      });
    },
  },
  activated() {
    this.calcLocalStorageSize();
    this.calcStorageSize();
  },
});
</script>
