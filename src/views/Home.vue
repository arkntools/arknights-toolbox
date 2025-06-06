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
          ><InfoHoverTip
            class="mdui-m-r-1"
            :content="$t('app.setting.clearLocalStorageTip')"
          /><span>{{ $t('home.used') }}{{ localStorageSize }}</span>
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
          ><InfoHoverTip
            class="mdui-m-r-1"
            :content="$t('app.setting.clearCacheStorageTip')"
          /><span>{{ $t('home.used') }}{{ cacheStorageSize }}</span>
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
          ><InfoHoverTip class="mdui-m-r-1" :content="$t('app.setting.clearIndexedDBTip')" /><span
            >{{ $t('home.used') }}{{ indexDBSize }}</span
          >
        </div>
      </div>
      <AddToHomeScreen />
      <template v-if="$root.localeCN || $root.localeTW">
        <h2>主要功能</h2>
        <ul>
          <li>
            <b>公开招募计算</b>
            <ul>
              <li>支持截图识别</li>
              <li>快捷跳转至 Wiki</li>
            </ul>
          </li>
          <li>
            <b>精英材料计算</b>
            <ul>
              <li>支持搜索干员，选择精英化、技能、模组，快速添加所需材料，快捷跳转至 Wiki</li>
              <li
                >支持从森空岛导入仓库材料数量
                <sup class="mdui-text-color-pink-accent"><b>NEW</b></sup></li
              >
              <li>支持仓库截图识别</li>
              <li>支持刷图规划，由企鹅物流提供掉落数据</li>
            </ul>
          </li>
          <li>
            <b>干员升级计算</b>
            <ul>
              <li>计算将干员升级至指定等级所需狗粮和龙门币，以及需要打多少次资源本</li>
              <li>支持多个需求合并计算</li>
            </ul>
          </li>
          <li>
            <b>基建技能筛选</b>
            <ul>
              <li>通过选择设施或技能类型以及文字搜索来筛选技能，并按效果排序</li>
              <li>快捷跳转至 Wiki</li>
            </ul>
          </li>
        </ul>
      </template>
      <h2>{{ $t('home.credits') }}</h2>
      <ul>
        <li v-for="({ name, type, url, deprecated }, i) in creditsList" :key="i">
          <a :href="url" target="_blank"
            ><component :is="deprecated ? 'del' : 'span'">{{ name }}</component></a
          ><component :is="deprecated ? 'del' : 'span'">（{{ type }}）</component>
        </li>
        <li>
          Wiki
          <ul class="mdui-m-t-0">
            <li>CN - <a href="http://prts.wiki/" target="_blank">PRTS Wiki</a></li>
            <li
              >EN -
              <a href="https://arknights.wiki.gg/" target="_blank">Arknights Terra Wiki</a></li
            >
            <li>JP - <a href="https://arknights.wikiru.jp/" target="_blank">Wikiru</a></li>
            <li
              >KR -
              <a href="https://namu.wiki/w/%EB%AA%85%EC%9D%BC%EB%B0%A9%EC%A3%BC" target="_blank"
                >Namu Wiki</a
              ></li
            >
          </ul>
        </li>
      </ul>
      <p
        ><a href="https://github.com/arkntools" target="_blank">本组织</a>头像及本项目<a
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
import InfoHoverTip from '@/components/InfoHoverTip.vue';
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
    InfoHoverTip,
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
          name: '灰格猫',
          type: '起源',
          url: 'https://github.com/gneko',
        },
        {
          name: 'Kengxxiao/ArknightsGameData',
          type: '数据',
          url: 'https://github.com/Kengxxiao/ArknightsGameData',
          deprecated: true,
        },
        {
          name: 'yuanyan3060/Arknights-Bot-Resource',
          type: '数据、图片',
          url: 'https://github.com/yuanyan3060/Arknights-Bot-Resource',
          deprecated: true,
        },
        {
          name: 'MooncellWiki/OpenArknightsFBS',
          type: '数据FBS',
          url: 'https://github.com/MooncellWiki/OpenArknightsFBS',
        },
        {
          name: '企鹅物流数据统计',
          type: '掉落数据',
          url: 'https://penguin-stats.io/',
        },
        {
          name: '明日方舟一图流',
          type: '材料价值数据',
          url: 'https://ark.yituliu.cn/',
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
