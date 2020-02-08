<template>
  <div id="arkn-hr">
    <!-- 标签面板 -->
    <div class="mdui-row">
      <div class="mdui-col-xs-12">
        <div id="drawer" :class="$root.smallScreen ? 'mdui-drawer mdui-drawer-right mdui-drawer-close' : false">
          <table class="mdui-table tag-table">
            <tbody>
              <tr>
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('common.stars')}}</button></td>
                <td>
                  <button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn ' + (allStar ? color.selected : color.notSelected)" @click="selected.star = l.fill(Array(selected.star.length), !allStar)">{{$t('common.selectAll')}}</button>
                  <tag-button v-for="i in 6" :key="`star-${7 - i}`" v-model="selected.star[6 - i]" :notSelectedColor="color.notSelected" :selectedColor="color[7 - i]" v-show="!(6 - i < 2 && setting.hide12)">{{ 7 - i }}★</tag-button>
                </td>
              </tr>
              <tr v-for="tagType in tagList.sort" :key="tagType">
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right">
                  <button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{ $t(`hr.tagType.${tagType}`) }}</button>
                </td>
                <td>
                  <tag-button v-for="tag in tagList[tagType]" :key="`${tagType}-${tag}`" v-model="selected.tag[tag]" :notSelectedColor="color.notSelected" :selectedColor="color.selected">{{ $t(`tag.${tag}`) }}</tag-button>
                </td>
              </tr>
              <tr>
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('common.setting')}}</button></td>
                <td>
                  <mdui-switch v-for="(value, key) in setting" :key="key" v-model="setting[key]">{{ $t(`hr.setting.${key}`) }}</mdui-switch>
                </td>
              </tr>
              <tr>
                <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('common.option')}}</button></td>
                <td>
                  <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset">{{$t('common.reset')}}</button>
                  <label v-if="$root.localeCN" class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-purple tag-btn" for="image-select" mdui-tooltip="{content:'PC上可直接将图片拖至此处',position:'top'}" @dragover.prevent @drop.prevent="e => (tagImg = e.dataTransfer.files[0])">识别词条截图（仅国服）</label>
                  <input type="file" id="image-select" accept="image/*" style="display:none" ref="image" @change="tagImg = $refs.image.files[0]" />
                  <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-blue-600 tag-btn" @click="reset(); $nextTick(() => (showGuarantees = true));">{{$t('hr.showBaoDi')}}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 提示 -->
    <div v-if="selected.tag[enumTag.高级资深干员] || selected.tag[enumTag.资深干员] || selected.tag[enumTag.支援机械]" class="mdui-chip-group mdui-m-t-4">
      <div v-if="selected.tag[enumTag.高级资深干员] || selected.tag[enumTag.资深干员]" class="mdui-chip">
        <span class="mdui-chip-icon mdui-color-red"><i class="mdui-icon material-icons">priority_high</i></span>
        <span class="mdui-chip-title mdui-text-truncate" :style="$root.screenWidth < 360 ? 'font-size:12px' : false">{{$t('hr.tip.rare')}}</span>
      </div>
      <div v-if="selected.tag[enumTag.支援机械]" class="mdui-chip">
        <span class="mdui-chip-icon mdui-color-red"><i class="mdui-icon material-icons">priority_high</i></span>
        <span class="mdui-chip-title mdui-text-truncate" :style="$root.screenWidth < 360 ? 'font-size:12px' : false">{{$t('hr.tip.robot')}}</span>
      </div>
    </div>
    <!-- 结果表格 -->
    <div :class="`mdui-row ${$root.smallScreen ? '' : 'mdui-m-t-4'}`">
      <div class="mdui-col-xs-12">
        <div v-if="!$root.smallScreen" class="comb-large">
          <table class="mdui-table mdui-table-hoverable comb-table">
            <thead>
              <tr>
                <th width="1" class="mdui-table-col-numeric">#</th>
                <th width="20%">{{$t('hr.table.header.tag')}}</th>
                <th width="1" class="mdui-text-center">{{$t('hr.table.header.minRarity')}}</th>
                <th width="80%">{{$t('hr.table.header.possibility')}}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(comb, i) in combinations" :key="`comb-${i}`">
                <td>{{ i + 1 }}</td>
                <td>
                  <button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{ $t(`tag.${tag}`) }}</button>
                </td>
                <td>
                  <button :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color[comb.min]}`">{{ comb.min }}★</button>
                </td>
                <td>
                  <!-- 干员 -->
                  <button v-for="char in comb.chars" :key="`comb-${i}-${char.name}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[char.star]}`" :has-avatar="setting.showAvatar" @click="showDetail(char)">
                    <div v-if="!char.recruitment" class="tag-triangle"></div>
                    <img class="tag-avatar no-pe" v-if="setting.showAvatar" :src="$root.avatar(char.name)" crossorigin="anonymous" />
                    <span>{{$t(`character.${char.name}`)}}</span>
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
                <th>{{$t('hr.table.header.tag')}}</th>
                <th>{{$t('hr.table.header.possibility')}}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(comb, i) in combinations">
                <tr :key="`comb-${i}-tr1`">
                  <td class="mdui-p-b-0 no-border" colspan="2">
                    <button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{ $t(`tag.${tag}`) }}</button>
                  </td>
                </tr>
                <tr :key="`comb-${i}-tr2`">
                  <td colspan="2">
                    <!-- 干员 -->
                    <button v-for="char in comb.chars" :key="`comb-${i}-${char.name}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[char.star]}`" :has-avatar="setting.showAvatar" @click="showDetail(char)">
                      <div v-if="!char.recruitment" class="tag-triangle"></div>
                      <img class="tag-avatar no-pe" v-if="setting.showAvatar" :src="$root.avatar(char.name)" crossorigin="anonymous" />
                      <span>{{$t(`character.${char.name}`)}}</span>
                    </button>
                  </td>
                </tr>
              </template>
              <tr v-if="combinations.length == 0">
                <td colspan="2" class="no-border">{{$t('hr.table.selectTip')}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 详细信息 -->
    <div id="detail" class="mdui-dialog mdui-card">
      <div v-if="detail" class="mdui-card-header mdui-p-b-0">
        <img class="mdui-card-header-avatar no-pe" :key="`di-${detail.name}`" :src="$root.avatar(detail.name)" crossorigin="anonymous" />
        <div class="mdui-card-header-title mdui-m-t-1">
          <span>{{$t(`character.${detail.name}`)}}</span>
          <button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-y-0 mdui-m-l-1 ${color[detail.star]}`">{{ detail.star }}★</button>
        </div>
        <div class="detail-tags mdui-m-t-1">
          <button v-for="tag in [detail.profession, detail.position, ...detail.tags]" :key="`detail-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${selected.tag[tag] ? color.selected : color.notSelected}`">{{ $t(`tag.${tag}`) }}</button>
        </div>
      </div>
      <div class="mdui-dialog-actions">
        <a class="mdui-btn mdui-ripple mdui-color-teal" :href="`http://ak.mooncell.wiki/w/${localeZhCharacter[detail.name]}`" target="_blank">{{$t('hr.viewOnWiki')}}</a>
        <button class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-close>{{$t('common.close')}}</button>
      </div>
    </div>
    <!-- 浮动按钮 -->
    <button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer ? null : (drawer = new $Drawer('#drawer')); drawer.toggle();">
      <i class="mdui-icon material-icons">sort</i>
    </button>
  </div>
</template>

<script>
import 'lodash.combinations';
import _ from 'lodash';
import Ajax from '../utils/ajax';

import character from '../data/character.json';
import localeZhTag from '../locales/zh/tag.json';
import localeZhCharacter from '../locales/zh/character.json';
Object.freeze(localeZhCharacter);

const enumTag = _.mapValues(_.invert(localeZhTag), parseInt);
Object.freeze(enumTag);

export default {
  name: 'arkn-hr',
  data: () => ({
    l: _,
    showAll: false,
    character,
    hr: _.transform(
      character,
      (arr, obj, k) => {
        arr.push({ name: k, ...obj });
      },
      []
    ),
    localeZhCharacter,
    enumTag,
    tags: {
      [enumTag.资深干员]: [],
      [enumTag.高级资深干员]: [],
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
      locations: [enumTag.近战位, enumTag.远程位],
      credentials: [enumTag.新手, enumTag.资深干员, enumTag.高级资深干员],
      professions: Array(8)
        .fill(null)
        .map((v, i) => i + 1),
      abilities: new Set(),
      sort: ['credentials', 'locations', 'professions', 'abilities'],
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
          new this.$alert(this.$t('hr.tagOverLimit'), null, null, {
            confirmText: this.$t('common.okay'),
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
      if (this.canUsePrivateOCR) this.privateOCR(file);
      else this.OCR(file);
    },
  },
  computed: {
    canUsePrivateOCR() {
      return window.location.hostname.endsWith('lolicon.app');
    },
    allStar() {
      return _.sum(this.selected.star) == this.selected.star.length;
    },
    // 计算词条组合
    combinations() {
      if (this.showGuarantees) return this.guarantees;
      const tags = _.flatMap(this.selected.tag, (selected, tag) => (selected ? [tag] : []));
      const rares = _.flatMap(this.selected.star, (selected, star) => (selected ? [star + 1] : []));
      const combs = _.flatMap([1, 2, 3], v => _.combinations(tags, v)).map(comb => comb.map(tag => parseInt(tag)));
      let result = [];
      for (const comb of combs) {
        const need = [];
        for (const tag of comb) need.push(this.tags[tag]);
        if (!this.setting.showPrivate) need.push(this.pubs);
        const chars = _.intersection(...need);
        if (!comb.includes(enumTag.高级资深干员)) _.remove(chars, ({ star }) => star === 6);
        if (chars.length == 0) continue;

        let scoreChars = _.filter(chars, ({ star }) => star >= 3);
        if (scoreChars.length == 0) scoreChars = chars;
        const score =
          _.sumBy(scoreChars, ({ star }) => star) / scoreChars.length -
          comb.length / 10 -
          scoreChars.length / this.avgCharTag;

        const minP = _.minBy(scoreChars, ({ recruitment, star }) => (recruitment ? star : Infinity));

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
      result.sort((a, b) => (a.min == b.min ? b.score - a.score : b.min - a.min));
      // 彩蛋
      // eslint-disable-next-line
      this.$root.nm = result.some(({ min }) => min >= 5);
      return result;
    },
    // 保底组合计算
    guarantees() {
      const guarantees = [];
      const combs = _.flatMap([1, 2, 3], v =>
        _.combinations([...this.tagList.professions, ...this.tagList.abilities, ...this.tagList.locations], v)
      );
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
        for (const [path, ratio] of [
          ['tags.length', 1],
          ['min', -1],
        ]) {
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
      this.$nextTick(() => new this.$Dialog('#detail', { history: false }).open());
    },
    async privateOCR(file) {
      const snackbar = this.$snackbar;
      snackbar(this.$t('hr.ocr.processing'));
      const { code, msg, words } = await Ajax.tagOCR(file).catch(e => ({ code: -1, msg: e }));
      if (code !== 0) {
        snackbar({
          message: `${this.$t('hr.ocr.uploadError')}${msg}`,
          timeout: 0,
          buttonText: this.$t('common.retry'),
          onButtonClick: () => this.ocr(file),
        });
        return;
      }
      // 处理识别结果
      this.reset();
      // eslint-disable-next-line
      console.log('OCR', words);
      let tagCount = 0;
      for (const word of words) {
        if (word in enumTag) {
          tagCount++;
          if (tagCount > 6) {
            snackbar(this.$t('hr.ocr.tagOverLimit'));
            return;
          }
          this.selected.tag[enumTag[word]] = true;
        }
      }
    },
    async OCR(file, old) {
      const snackbar = this.$snackbar;
      snackbar(this.$t('hr.ocr.processing'));
      // 上传图片至 lsky
      const lsky = old || (await Ajax.lsky(file).catch(e => ({ code: -1, msg: e })));
      if (lsky.code !== 200) {
        snackbar({
          message: `${this.$t('hr.ocr.uploadError')}${lsky.msg}`,
          timeout: 0,
          buttonText: this.$t('common.retry'),
          onButtonClick: () => this.ocr(file),
        });
        return;
      }
      // 调用 ocr.space
      const result = await Ajax.corsGet(
        `https://api.ocr.space/parse/imageurl?apikey=helloworld&language=chs&scale=true&url=${lsky.data.url}`
      ).catch(e => ({ IsErroredOnProcessing: true, ErrorMessage: e }));
      if (result.IsErroredOnProcessing) {
        snackbar({
          message: `${this.$t('hr.ocr.error')}${result.ErrorMessage}`,
          timeout: 0,
          buttonText: this.$t('common.retry'),
          onButtonClick: () => this.ocr(file, lsky),
        });
        return;
      }
      // 处理识别结果
      this.reset();
      const words = result.ParsedResults[0].ParsedText.split(/[\r\n]+/);
      // eslint-disable-next-line
      console.log('OCR', words);
      let tagCount = 0;
      for (const word of words) {
        if (word in enumTag) {
          tagCount++;
          if (tagCount > 6) {
            snackbar(this.$t('hr.ocr.tagOverLimit'));
            return;
          }
          this.selected.tag[enumTag[word]] = true;
        }
      }
    },
  },
  created() {
    this.hr.sort((a, b) => b.star - a.star);

    let charTagSum = 0;

    this.hr.forEach(char => {
      const { recruitment, tags, profession, position, star } = char;
      // 公招列表
      if (recruitment) this.pubs.push(char);
      // 确定特性标签
      for (const tag of tags) {
        if (tag !== enumTag.新手) this.tagList.abilities.add(tag);
      }
      // 资质
      switch (star) {
        case 5:
          this.tags[enumTag.资深干员].push(char);
          break;
        case 6:
          this.tags[enumTag.高级资深干员].push(char);
          break;
      }
      // 加入标签列表
      for (const tag of [...tags, profession, position]) {
        if (!this.tags[tag]) this.tags[tag] = [];
        this.tags[tag].push(char);
      }
      // 用于计算组合评分
      charTagSum += tags.length + 2;
    });

    const tagCount = _.size(this.tags);
    this.avgCharTag = charTagSum / tagCount;

    this.tagList.abilities = Array.from(this.tagList.abilities).sort();
    // .sort((a, b) => {
    //   if (a.length == b.length) return a.localeCompare(b);
    //   return a.length - b.length;
    // });

    this.selected.tag = _.mapValues(this.tags, () => false);

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
      background-color: #bdbdbd;
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
