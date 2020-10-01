<template>
  <div class="mdui-row mdui-center" style="max-width: 1012px">
    <div class="mdui-col-xs-12 mdui-typo">
      <h1 class="mdui-m-t-0">{{ $t('app.title') }}</h1>
      <p
        >Github:
        <a href="https://github.com/arkntools/arknights-toolbox" target="_blank">arkntools/arknights-toolbox</a></p
      >
      <welcome />
      <h2>{{ $t('common.setting') }}</h2>
      <div class="no-sl">
        <locale-select :key="$root.localeSelectKey" />
        <theme-select />
        <div class="mdui-m-b-2">
          <mdui-switch v-model="setting.rememberLastPage">{{ $t('home.setting.rememberLastPage') }}</mdui-switch>
          <!-- <mdui-switch
            v-if="$root.canUseCDN"
            v-model="setting.imageCDN"
            :mdui-tooltip="`{content:'${$t('home.setting.imageCDNTip')}',position:'top'}`"
            >{{ $t('home.setting.imageCDN') }}</mdui-switch
          > -->
        </div>
        <div class="mdui-m-b-2">
          <button
            class="mdui-btn mdui-ripple mdui-m-r-1"
            v-theme-class="['mdui-btn-raised mdui-color-pink-accent', 'mdui-color-indigo-a100 mdui-ripple-black']"
            @click="clearStorage"
            >{{ $t('home.setting.clearStorage') }}</button
          ><i
            class="mdui-icon material-icons mdui-m-r-1 help no-sl"
            :mdui-tooltip="`{content:'${$t('home.setting.clearStorageTip')}',position:'top'}`"
            >{{ $root.dark ? 'info' : 'info_outline' }}</i
          >{{ $t('home.used') }}{{ lsSize }}
        </div>
        <div>
          <button
            class="mdui-btn mdui-ripple mdui-m-r-1"
            v-theme-class="['mdui-btn-raised mdui-color-pink-accent', 'mdui-color-indigo-a100 mdui-ripple-black']"
            :disabled="!checkNavigatorStorage()"
            @click="clearCaches"
            >{{ $t('home.setting.clearCaches') }}</button
          ><i
            class="mdui-icon material-icons mdui-m-r-1 help no-sl"
            :mdui-tooltip="`{content:'${$t('home.setting.clearCachesTip')}',position:'top'}`"
            >{{ $root.dark ? 'info' : 'info_outline' }}</i
          >{{ $t('home.used') }}{{ csSize }}
        </div>
      </div>
      <add-to-home-screen />
      <template v-if="$root.localeCN">
        <h2>主要功能</h2>
        <ul>
          <li>公开招募计算 + 词条截图识别</li>
          <li>精英材料计算 + 导入干员材料预设 + 刷图规划</li>
          <li>干员升级计算</li>
          <li>基建技能筛选</li>
        </ul>
        <p
          >※ 如果公招词条识别出现遗漏现象且您愿意帮助我改进结果，请到 GitHub 上提交 issue，附上词条截图和浏览器 console
          中的 OCR 日志</p
        >
      </template>
      <template v-else-if="$root.localeTW">
        <h2>主要功能</h2>
        <ul>
          <li>公開招募計算 + 詞條截圖識別</li>
          <li>精英材料計算 + 導入幹員材料預設 + 材料獲取最優策略規劃</li>
          <li>幹員陞級計算</li>
          <li>基建技能篩選</li>
        </ul>
        <p
          >※ 如果公招詞條識別出現遺漏現象且您願意幫助我改進結果，請到 GitHub 上提交 issue，附上詞條截圖和瀏覽器 console
          中的 OCR 日誌</p
        >
      </template>
      <h2>{{ $t('home.dataSources') }}</h2>
      <ul>
        <li
          ><a href="https://github.com/Kengxxiao/ArknightsGameData" target="_blank">Kengxxiao/ArknightsGameData</a
          >（数据）</li
        >
        <li><a href="https://github.com/graueneko" target="_blank">灰格猫</a>（基础数据）</li>
        <li><a href="http://prts.wiki" target="_blank">PRTS Wiki</a>（干员头像、材料图片）</li>
        <li><a href="https://github.com/Houdou/arkgraph" target="_blank">ark-nights.com</a>（材料图片）</li>
        <li><a href="https://penguin-stats.io/" target="_blank">企鹅物流数据统计</a>（掉落数据）</li>
        <li><a href="https://bbs.nga.cn/read.php?tid=17507710" target="_blank">素材获取最优策略规划</a>（思路）</li>
        <li
          >跳转到 wiki
          <ul>
            <li
              >CN &amp; TW - <a href="http://prts.wiki" target="_blank">PRTS Wiki</a>（很棒的
              wiki，大家有条件可以打钱支持一下）</li
            >
            <li>EN - <a href="https://gamepress.gg/arknights/" target="_blank">GamePress</a></li>
            <li>JP - <a href="https://wiki.gamerclub.jp/anwiki/" target="_blank">GamerClub</a></li>
            <li>KR - <a href="https://namu.wiki/" target="_blank">Namu Wiki</a></li>
          </ul>
        </li>
      </ul>
      <p
        ><a href="https://github.com/arkntools" target="_blank">组织</a>头像及本项目<a
          href="https://github.com/arkntools/arknights-toolbox/tree/master/public/assets/icons"
          target="_blank"
          >应用图标</a
        >由<a href="https://www.pixiv.net/users/8745555" target="_blank">冬夏</a>绘制并授权使用</p
      >
      <p
        >本项目所使用的游戏资源（包括但不限于：游戏图片、文本原文或其转译版本等）仅用于更好地表现游戏资料、增强用户体验，其版权属于上海鹰角网络科技有限公司和其关联公司</p
      >
      <h2>{{ $t('home.contributors') }}</h2>
    </div>
    <div class="mdui-col-xs-12">
      <contributor-list title="Developers" :list="developers" note-prop="work" icon="code" />
    </div>
    <div class="mdui-col-xs-12">
      <contributor-list title="Translators" :list="translators" note-prop="translation" icon="g_translate" />
    </div>
    <div class="mdui-col-xs-12 mdui-typo">
      <h2>{{ $t('home.changelog') }}</h2>
      <changelog />
    </div>
  </div>
</template>

<script>
import Welcome from '@/components/Welcome';
import LocaleSelect from '@/components/LocaleSelect';
import ThemeSelect from '@/components/ThemeSelect';
import AddToHomeScreen from '@/components/AddToHomeScreen';
import Changelog from '@/components/Changelog';
import ContributorList from '@/components/ContributorList';
import _ from 'lodash';
import utf8BufferSize from 'utf8-buffer-size';

import contributors from '../store/contributors';

export default {
  name: 'home',
  components: {
    Welcome,
    LocaleSelect,
    ThemeSelect,
    AddToHomeScreen,
    Changelog,
    ContributorList,
  },
  data() {
    return {
      lsSize: this.calcLsSize(),
      csSize: this.$t('home.calculating'),
      setting: this.$root.setting,
      ...contributors,
    };
  },
  methods: {
    checkNavigatorStorage: () => 'storage' in navigator && 'estimate' in navigator.storage,
    clearStorage() {
      localStorage.clear();
      this.$snackbar(this.$t('common.success'));
      this.lsSize = this.calcLsSize();
    },
    async clearCaches() {
      if (!('serviceWorker' in navigator)) return;
      const cacheKeys = (await caches.keys()).filter(key => _.includes(key, 'runtime'));
      const cacheList = await Promise.all(cacheKeys.map(key => caches.open(key)));
      for (const cache of cacheList) {
        await cache.keys().then(keys => Promise.all(keys.map(key => cache.delete(key))));
      }
      await Promise.all(cacheKeys.map(key => caches.delete(key)));
      this.$snackbar(this.$t('common.success'));
      this.csSize = await this.calcCsSize();
    },
    calcLsSize() {
      return this.$root.calcSize(_.sumBy(Object.values(localStorage), utf8BufferSize) * 2);
    },
    calcCsSize() {
      if (!this.checkNavigatorStorage()) return Promise.resolve('N/A');
      return navigator.storage
        .estimate()
        .then(({ usage }) => this.$root.calcSize(usage))
        .catch(() => 'N/A');
    },
  },
  created() {
    this.calcCsSize().then(size => (this.csSize = size));
  },
};
</script>
