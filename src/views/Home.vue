<i18n>
{
  "zh": {
    "rememberLastPage": "记住最后一次打开的选项卡",
    "imageCDN": "从 CDN 加载图片",
    "imageCDNTip": "若出现图片加载问题请尝试关闭"
  },
  "en": {
    "rememberLastPage": "Remember the Last Tab Opened",
    "imageCDN": "Load Image from CDN (only recommended when visiting from China)",
    "imageCDNTip": "Turn it off if there is a problem with image loading",
    "清除本地数据": "Clear local storage",
    "已用：": "Used: ",
    "更新日志": "Changelog"
  }
}
</i18n>

<template>
  <div class="mdui-row mdui-typo mdui-center" style="max-width: 1012px;">
    <div class="mdui-col-xs-12">
      <h1 class="mdui-m-t-0">{{$t('明日方舟工具箱')}}</h1>
      <p>Github: <a href="https://github.com/Tsuk1ko/arknights-toolbox" target="_blank">Tsuk1ko/arknights-toolbox</a></p>
      <p>宗旨是简洁美观且对移动设备友好，以及 Material Design 天下第一（。）</p>
      <p>如果有好的想法、建议、希望增加的功能，或者发现了 bug，欢迎到项目中提 <a href="https://github.com/Tsuk1ko/arknights-toolbox/issues" target="_blank">issue</a> 或提交 PR</p>
      <h2>{{$t('设置')}}</h2>
      <p id="locale-switch">
        Language:
        <select class="mdui-select" v-model="$root.locale" mdui-select>
          <option v-for="lang in langs" :key="lang.short" :value="lang.short">{{ lang.long }}</option>
        </select>
      </p>
      <p>
        <mdui-switch v-model="setting.rememberLastPage">{{$t('rememberLastPage')}}</mdui-switch>
        <mdui-switch v-model="setting.imageCDN" :mdui-tooltip="`{content:'${$t('imageCDNTip')}',position:'top'}`">{{$t('imageCDN')}}</mdui-switch>
      </p>
      <p>
        <button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-r-2" mdui-tooltip="{content:'清除本地保存的设置及输入信息',position:'top'}" @click="clear">{{$t('清除本地数据')}}</button>{{$t('已用：')}}{{lsSize}}
      </p>
      <add-to-home-screen />
      <h2>主要功能</h2>
      <ul>
        <li>公开招募计算</li>
        <li>精英材料计算 + 导入干员材料预设 + 素材获取最优策略规划</li>
        <li>干员升级计算</li>
        <li>基建技能筛选</li>
      </ul>
      <h2>数据来源及鸣谢</h2>
      <ul>
        <li><a href="http://wiki.joyme.com/arknights" target="_blank">明日方舟 Wiki</a>（干员数据及图片）</li>
        <li><a href="https://github.com/graueneko/graueneko.github.io" target="_blank">一只灰猫</a>（材料合成、干员升级数据）</li>
        <li><a href="https://github.com/Houdou/arkgraph" target="_blank">ark-nights.com</a>（材料图片）</li>
        <li><a href="https://penguin-stats.io/" target="_blank">企鹅物流数据统计</a>（掉落数据）</li>
        <li><a href="https://bbs.nga.cn/read.php?tid=17507710" target="_blank">素材获取最优策略规划</a>（思路）</li>
      </ul>
      <h2>{{$t('更新日志')}}</h2>
      <changelog />
    </div>
  </div>
</template>

<script>
import Changelog from '../components/Changelog';
import AddToHomeScreen from '../components/AddToHomeScreen';
import _ from 'lodash';
import utf8BufferSize from 'utf8-buffer-size';

export default {
  name: 'home',
  components: {
    Changelog,
    AddToHomeScreen,
  },
  data() {
    return {
      lsSize: this.calcLsSize(),
      setting: this.$root.setting,
      langs: [
        {
          short: 'zh',
          long: 'Chinese',
        },
        {
          short: 'en',
          long: 'English',
        },
      ],
    };
  },
  methods: {
    clear() {
      localStorage.clear();
      this.$root.snackbar('清除成功');
      this.lsSize = this.calcLsSize();
    },
    calcLsSize() {
      return this.$root.calcSize(_.sumBy(Object.values(localStorage), utf8BufferSize) * 2);
    },
  },
};
</script>

<style>
#locale-switch .mdui-select-selected {
  text-align: center;
}
</style>
