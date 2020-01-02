<i18n>
{
  "zh": {
    "possibility": "可能出现（点击干员查看详情）",
    "showAvatar": "显示头像",
    "hide12": "隐藏1★2★",
    "showPrivate": "显示非公开招募干员",
    "rareTip": "请拉满 9 个小时以保证词条不被划掉",
    "ocrTip": "PC上可直接将图片拖至此处",
    "ocrProcessing": "识别词条中，请耐心等待",
    "ocrUploadError": "上传错误：",
    "ocrError": "识别错误：",
    "ocrTagOverLimit": "识别词条超出6个，仅取前6个"
  },
  "en": {
    "词条": "Tags",
    "可保底": "Min Rarity",
    "possibility": "Possible Result (click to show details)",
    "识别词条截图": "OCR",
    "查看保底标签组合": "Show All Combinations with ★ ≥ 4",
    "资质": "Credentials",
    "位置": "Places",
    "职业": "Jobs",
    "特性": "Features",
    "请点击右下角的按钮选择词条": "Please click the button on the right bottom corner and select tags.",
    "showAvatar": "Show Avatar",
    "hide12": "Hide 1★2★",
    "showPrivate": "Also Show the Operators who Can Only Be Obtained from Gacha",
    "rareTip": "Please set to 9 hours to ensure obtaining!",
    "在 Wiki 查看": "View on Wiki",
    "ocrTip": "Support drag and drop image to here on PC",
    "ocrProcessing": "Processing, please wait",
    "ocrUploadError": "Upload Error: ",
    "ocrError": "OCR Error: ",
    "ocrTagOverLimit": "There are more than 6 tags, only use first 6 tags"
  }
}
</i18n>

<template>
  <div id="arkn-hr">
    <!-- 标签面板 -->
    <div class="mdui-row">
      <div class="mdui-col-xs-12">
        <div id="drawer" :class="$root.smallScreen ? 'mdui-drawer mdui-drawer-right mdui-drawer-close' : false">
          <table class="mdui-table tag-table">
            <tbody>
              <tr>
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('星级')}}</button></td>
                <td>
                  <button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn ' + (allStar ? color.selected : color.notSelected)" @click="selected.star = l.fill(Array(selected.star.length), !allStar)">{{$t('全选')}}</button>
                  <tag-button v-for="i in 6" :key="`star-${7 - i}`" v-model="selected.star[6 - i]" :notSelectedColor="color.notSelected" :selectedColor="color[7 - i]" v-show="!(6 - i < 2 && setting.hide12)">{{ 7 - i }}★</tag-button>
                </td>
              </tr>
              <tr v-for="tagType in tagList.sort" :key="tagType.en">
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right">
                  <button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{ $t(tagType.zh) }}</button>
                </td>
                <td>
                  <tag-button v-for="tag in tagList[tagType.en]" :key="`${tagType.en}-${tag}`" v-model="selected.tag[tag]" :notSelectedColor="color.notSelected" :selectedColor="color.selected">{{ $t(tag) }}</tag-button>
                </td>
              </tr>
              <tr>
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('设置')}}</button></td>
                <td>
                  <mdui-switch v-for="(value, key) in setting" :key="key" v-model="setting[key]">{{ $t(key) }}</mdui-switch>
                </td>
              </tr>
              <tr>
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('选项')}}</button></td>
                <td>
                  <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset">{{$t('重置')}}</button>
                  <!-- <label class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-purple tag-btn" for="image-select" :mdui-tooltip="`{content:'${$t('ocrTip')}',position:'top'}`" @dragover.prevent @drop.prevent="e => (tagImg = e.dataTransfer.files[0])">{{$t('识别词条截图')}}</label>
                  <input type="file" id="image-select" accept="image/*" style="display:none" ref="image" @change="tagImg = $refs.image.files[0]" /> -->
                  <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-blue-600 tag-btn" @click="reset(); $nextTick(() => (showGuarantees = true));">{{$t('查看保底标签组合')}}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 提示 -->
    <div v-if="selected.tag['高级资深干员'] || selected.tag['资深干员']" class="mdui-chip mdui-m-t-4">
      <span class="mdui-chip-icon mdui-color-red"><i class="mdui-icon material-icons">priority_high</i></span>
      <span class="mdui-chip-title mdui-text-truncate" :style="$root.screenWidth < 360 ? 'font-size:12px' : false">{{$t('rareTip')}}</span>
    </div>
    <!-- 结果表格 -->
    <div :class="`mdui-row ${$root.smallScreen ? '' : 'mdui-m-t-4'}`">
      <div class="mdui-col-xs-12">
        <div v-if="!$root.smallScreen" class="comb-large">
          <table class="mdui-table mdui-table-hoverable comb-table">
            <thead>
              <tr>
                <th width="1" class="mdui-table-col-numeric">#</th>
                <th width="20%">{{$t('词条')}}</th>
                <th width="1" class="mdui-text-center">{{$t('可保底')}}</th>
                <th width="80%">{{$t('possibility')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(comb, i) in combinations" :key="`comb-${i}`">
                <td>{{ i + 1 }}</td>
                <td>
                  <button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{ tag }}</button>
                </td>
                <td>
                  <button :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color[comb.min]}`">{{ comb.min }}★</button>
                </td>
                <td>
                  <!-- 干员 -->
                  <button v-for="char in comb.chars" :key="`comb-${i}-${char.name}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[char.star]}`" :has-avatar="setting.showAvatar" @click="showDetail(char)">
                    <div v-if="!char.pub" class="tag-triangle"></div>
                    <img class="tag-avatar no-pe" v-if="setting.showAvatar" :src="$root.avatar(char)" crossorigin="anonymous" />
                    <span v-t="{ path: 'operatorName', args: char }"></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="comb-small">
          <table class="mdui-table comb-table mdui-shadow-0 no-border">
            <thead>
              <tr>
                <th>{{$t('词条')}}</th>
                <th>{{$t('possibility')}}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(comb, i) in combinations">
                <tr :key="`comb-${i}-tr1`">
                  <td class="mdui-p-b-0 no-border" colspan="2">
                    <button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{ tag }}</button>
                  </td>
                </tr>
                <tr :key="`comb-${i}-tr2`">
                  <td colspan="2">
                    <!-- 干员 -->
                    <button v-for="char in comb.chars" :key="`comb-${i}-${char.name}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[char.star]}`" :has-avatar="setting.showAvatar" @click="showDetail(char)">
                      <div v-if="!char.pub" class="tag-triangle"></div>
                      <img class="tag-avatar no-pe" v-if="setting.showAvatar" :src="$root.avatar(char)" crossorigin="anonymous" />
                      <span v-t="{ path: 'operatorName', args: char }"></span>
                    </button>
                  </td>
                </tr>
              </template>
              <tr v-if="combinations.length == 0">
                <td colspan="2" class="no-border">{{$t('请点击右下角的按钮选择词条')}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 详细信息 -->
    <div id="detail" class="mdui-dialog mdui-card">
      <div v-if="detail" class="mdui-card-header mdui-p-b-0">
        <img class="mdui-card-header-avatar no-pe" :key="`di-${detail.name}`" :src="$root.avatar(detail)" crossorigin="anonymous" />
        <div class="mdui-card-header-title">
          <span v-t="{ path: 'operatorName', args: detail }"></span>
          <button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-l-1 mdui-m-y-0 ${color.selected}`">{{ $t(detail.job) }}</button>
          <button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-y-0 ${color[detail.star]}`">{{ detail.star }}★</button>
        </div>
        <div class="mdui-card-header-subtitle">{{ detail.memo }}</div>
        <div class="detail-tags">
          <button v-for="tag in detail.tags" :key="`detail-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${selected.tag[tag] ? color.selected : color.notSelected}`">{{ $t(tag) }}</button>
        </div>
      </div>
      <div class="mdui-dialog-actions">
        <a class="mdui-btn mdui-ripple mdui-color-teal" :href="`http://wiki.joyme.com/arknights/${detail.name}`" target="_blank">{{$t('在 Wiki 查看')}}</a>
        <button class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-close>{{$t('关闭')}}</button>
      </div>
    </div>
    <!-- 浮动按钮 -->
    <button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer ? null : (drawer = new $root.Mdui.Drawer('#drawer')); drawer.toggle();">
      <i class="mdui-icon material-icons">sort</i>
    </button>
  </div>
</template>

<script>
import 'lodash.combinations';
import _ from 'lodash';
import Ajax from '../utils/ajax';

import HR from '../data/hr.json';

export default {
  name: 'arkn-hr',
  data: () => ({
    l: _,
    showAll: false,
    hr: _.cloneDeep(HR),
    tags: {
      资深干员: [],
      高级资深干员: [],
    },
    pubs: [],
    selected: {
      star: _.fill(Array(6), true),
      tag: {},
    },
    setting: {
      showAvatar: false,
      hide12: false,
      showPrivate: false,
    },
    avgCharTag: 0,
    tagList: {
      location: ['近战位', '远程位'],
      credentials: ['新手', '资深干员', '高级资深干员'],
      job: ['先锋干员', '狙击干员', '医疗干员', '术师干员', '近卫干员', '重装干员', '辅助干员', '特种干员'],
      features: new Set(),
      sort: [
        { zh: '资质', en: 'credentials' },
        { zh: '位置', en: 'location' },
        { zh: '职业', en: 'job' },
        { zh: '特性', en: 'features' },
      ],
    },
    color: {
      notSelected: 'mdui-color-brown-300',
      selected: 'mdui-color-grey-800',
      6: 'mdui-color-red-700',
      5: 'mdui-color-orange-900',
      4: 'mdui-color-cyan-700',
      3: 'mdui-color-green-700',
      2: 'mdui-color-brown-700',
      1: 'mdui-color-grey-700',
    },
    detail: false,
    drawer: false,
    tagImg: false,
    tagsCache: [],
    showGuarantees: false,
  }),
  watch: {
    'selected.tag': {
      handler() {
        this.showGuarantees = false;
        let tags = _.flatMap(this.selected.tag, (selected, tag) => (selected ? [tag] : []));
        if (tags.length > 6) {
          new this.$root.Mdui.alert('最多只能同时选择 6 个词条噢！', null, null, {
            confirmText: '好吧',
            history: false,
          });
          for (const tag in this.selected.tag) {
            this.selected.tag[tag] = this.tagsCache.includes(tag);
          }
          tags = this.tagsCache;
        } else this.tagsCache = tags;
      },
      deep: true,
    },
    setting: {
      handler(val) {
        localStorage.setItem('hr.setting', JSON.stringify(val));
      },
      deep: true,
    },
    tagImg(file) {
      this.ocr(file);
    },
  },
  computed: {
    allStar() {
      return _.sum(this.selected.star) == this.selected.star.length;
    },
    // 计算词条组合
    combinations() {
      if (this.showGuarantees) return this.guarantees;
      const tags = _.flatMap(this.selected.tag, (selected, tag) => (selected ? [tag] : []));
      const rares = _.flatMap(this.selected.star, (selected, star) => (selected ? [star + 1] : []));
      const combs = _.flatMap([1, 2, 3], v => _.combinations(tags, v));
      let result = [];
      for (const comb of combs) {
        const need = [];
        for (const tag of comb) need.push(this.tags[tag]);
        if (!this.setting.showPrivate) need.push(this.pubs);
        const chars = _.intersection(...need);
        if (!comb.includes('高级资深干员')) _.remove(chars, ({ star }) => star === 6);
        if (chars.length == 0) continue;

        let scoreChars = _.filter(chars, ({ star }) => star >= 3);
        if (scoreChars.length == 0) scoreChars = chars;
        const score =
          _.sumBy(scoreChars, ({ star }) => star) / scoreChars.length -
          comb.length / 10 -
          scoreChars.length / this.avgCharTag;

        const minP = _.minBy(scoreChars, ({ pub, star }) => (pub ? star : Infinity));

        _.remove(chars, ({ star }) => !rares.includes(star));
        if (this.setting.hide12) _.remove(chars, ({ star }) => star < 3);
        if (chars.length == 0) continue;

        result.push({
          tags: comb,
          chars,
          min: minP.star,
          score,
        });
      }
      // eslint-disable-next-line
      this.$root.nm = result.some(({ min }) => min >= 5);
      result.sort((a, b) => (a.min == b.min ? b.score - a.score : b.min - a.min));
      return result;
    },
    // 保底组合计算
    guarantees() {
      const guarantees = [];
      const combs = _.flatMap([1, 2, 3], v => _.combinations([...this.tagList.job, ...this.tagList.features], v));
      for (const comb of combs) {
        const need = [this.pubs];
        for (const tag of comb) need.push(this.tags[tag]);
        const chars = _.intersection(...need).filter(({ star }) => star < 6);
        if (chars.length == 0) continue;
        const min = _.min(chars.map(({ star }) => star));
        if (min < 4) continue;
        if (guarantees.some(({ tags, min: _min }) => _min === min && tags.every(tag => comb.includes(tag)))) continue;
        guarantees.push({ tags: comb, min, chars });
      }
      return guarantees.sort((a, b) => {
        for (const [path, ratio] of [['tags.length', 1], ['min', -1]]) {
          const compare = ratio * (_.at(a, path) - _.at(b, path));
          if (compare != 0) return compare;
        }
        return 0;
      });
    },
  },
  methods: {
    reset() {
      this.showGuarantees = false;
      this.selected.star = _.fill(Array(this.selected.star.length), true);
      for (const tag in this.selected.tag) {
        this.selected.tag[tag] = false;
      }
    },
    showDetail(char) {
      this.detail = char;
      this.$nextTick(() => new this.$root.Mdui.Dialog('#detail', { history: false }).open());
    },
    // 需要帮助：一个免费可跨域的图像上传 API
    // async ocr(file, old) {
    //   const snackbar = this.$root.snackbar;
    //   const sb = snackbar({
    //     message: this.$t('ocrProcessing'),
    //     timeout: 0,
    //   });
    //   // 上传图片至 sm.ms
    //   const smms = old || (await Ajax.smms(file).catch(e => ({ code: 'error', msg: e })));
    //   if (smms.code == 'error') {
    //     sb.close();
    //     snackbar({
    //       message: `${this.$t('ocrUploadError')}${smms.msg}`,
    //       timeout: 0,
    //       buttonText: this.$t('重试'),
    //       onButtonClick: () => this.ocr(file),
    //     });
    //     return;
    //   }
    //   // 调用 ocr.space
    //   const result = await Ajax.corsGet(
    //     `https://api.ocr.space/parse/imageurl?apikey=helloworld&language=chs&scale=true&url=${smms.data.url}`
    //   ).catch(e => ({ IsErroredOnProcessing: true, ErrorMessage: e }));
    //   if (result.IsErroredOnProcessing) {
    //     sb.close();
    //     snackbar({
    //       message: `${this.$t('ocrError')}${result.ErrorMessage}`,
    //       timeout: 0,
    //       buttonText: this.$t('重试'),
    //       onButtonClick: () => this.ocr(file, smms),
    //     });
    //     return;
    //   }
    //   // 删除上传的图片
    //   Ajax.get(smms.data.delete);
    //   // 处理识别结果
    //   this.reset();
    //   const words = result.ParsedResults[0].ParsedText.split(/[\r\n]+/);
    //   // eslint-disable-next-line
    //   console.log('OCR', words);
    //   let tagCount = 0;
    //   for (const word of words) {
    //     if (word in this.selected.tag) {
    //       tagCount++;
    //       if (tagCount > 6) {
    //         sb.close();
    //         snackbar({ message: this.$t('ocrTagOverLimit') });
    //         return;
    //       }
    //       this.selected.tag[word] = true;
    //     }
    //   }
    //   sb.close();
    // },
  },
  created() {
    this.hr.sort((a, b) => b.star - a.star);

    let charTagSum = 0;
    const notFeaturesTag = this.tagList.location.concat(this.tagList.credentials, this.tagList.job, this.tagList.sex);

    this.hr.forEach(char => {
      const { pub, tags, job, star } = char;
      if (pub) this.pubs.push(char);
      for (const tag of tags) {
        if (!notFeaturesTag.includes(tag)) this.tagList.features.add(tag);
      }
      switch (star) {
        case 5:
          this.tags['资深干员'].push(char);
          break;
        case 6:
          this.tags['高级资深干员'].push(char);
          break;
      }
      if (job && job.length > 0) tags.push(`${job}干员`);
      for (const tag of tags) {
        if (!this.tags[tag]) this.tags[tag] = [];
        this.tags[tag].push(char);
      }
      charTagSum += tags.length;
    });

    const tagCount = _.size(this.tags);
    this.avgCharTag = charTagSum / tagCount;

    this.tagList.features = Array.from(this.tagList.features).sort((a, b) => {
      if (a.length == b.length) return a.localeCompare(b);
      return a.length - b.length;
    });

    this.selected.tag = _.transform(this.tags, (o, v, k) => (o[k] = false), {});

    const setting = localStorage.getItem('hr.setting');
    if (setting) this.setting = _.assign({}, this.setting, _.pick(JSON.parse(setting), _.keys(this.setting)));
  },
};
</script>

<style lang="scss">
#arkn-hr {
  #drawer {
    min-width: 290px;
  }
  .comb-table {
    th,
    td {
      padding-top: 0.5em;
      padding-bottom: 0.5em;
    }
    th:not(:first-child):not(:last-child),
    td:not(:first-child):not(:last-child) {
      padding-right: 0;
    }
  }
  #detail {
    .mdui-card-header {
      height: auto;
      & > div {
        margin-left: 92px;
      }
    }
    .mdui-card-header-avatar {
      width: 80px;
      height: 80px;
    }
    .mdui-card-header-title {
      font-size: 23px;
      line-height: 28px;
      display: flex;
    }
    .mdui-card-header-subtitle {
      font-size: 16px;
      line-height: 24px;
      margin-top: 3px;
      white-space: normal;
    }
    .mdui-card-header-title .tag-btn {
      height: 28px;
      line-height: 28px;
    }
  }
  .comb-small .mdui-table {
    td:first-child {
      padding-left: 14px;
    }
    td:last-child {
      padding-right: 14px !important;
    }
  }
  .tag-triangle {
    width: 16px;
    height: 16px;
    position: absolute;
    transform: rotate(45deg);
    right: -8px;
    top: -8px;
    background-color: rgba(0, 0, 0, 0.4);
  }
}
</style>
