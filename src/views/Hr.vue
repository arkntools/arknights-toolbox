<template>
  <div id="arkn-hr">
    <!-- 标签面板 -->
    <div class="mdui-row">
      <div class="mdui-col-xs-12">
        <div
          id="drawer"
          :class="$root.smallScreen ? 'mdui-drawer mdui-drawer-right mdui-drawer-close' : false"
        >
          <table class="mdui-table tag-table">
            <tbody>
              <!-- 星级 -->
              <tr>
                <td v-if="!$root.smallScreen" width="1"
                  ><button
                    class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                    v-theme-class="$root.color.tagBtnHead"
                    >{{ $t('common.stars') }}</button
                  ></td
                >
                <td class="mobile-screen-flex-box tag-btn-wrap">
                  <button
                    class="mdui-btn mdui-btn-dense mdui-ripple tag-btn flex-full"
                    v-theme-class="allStar ? color.selected : color.notSelected"
                    @click="selected.star = $_.fill(Array(selected.star.length), !allStar)"
                    >{{ $t('common.selectAllShorten') }}</button
                  >
                  <tag-button
                    class="flex-equally"
                    v-for="i in 6"
                    :key="`star-${7 - i}`"
                    v-model="selected.star[6 - i]"
                    :notSelectedColor="color.notSelected"
                    :selectedColor="color[7 - i]"
                    v-show="!(6 - i < 2 && setting.hide12)"
                    >{{ 7 - i }}★</tag-button
                  >
                </td>
              </tr>
              <!-- 标签类别 -->
              <tr v-for="tagType in tagList.sort" :key="tagType">
                <td v-if="!$root.smallScreen" width="1">
                  <button
                    class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                    v-theme-class="$root.color.tagBtnHead"
                    >{{ $t(`hr.tagType.${tagType}`) }}</button
                  >
                </td>
                <td class="mobile-screen-flex-box tag-btn-wrap">
                  <tag-button
                    v-for="tag in tagList[tagType]"
                    :key="`${tagType}-${tag}`"
                    :class="{ 'opacity-5': setting.showGuarantees && !guaranteesTagSet.has(tag) }"
                    v-model="selected.tag[tag]"
                    :notSelectedColor="color.notSelected"
                    :selectedColor="color.selected"
                    >{{ $t(`tag.${tag}`) }}</tag-button
                  >
                </td>
              </tr>
              <!-- 设置 -->
              <tr>
                <td v-if="!$root.smallScreen" width="1"
                  ><button
                    class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                    v-theme-class="$root.color.tagBtnHead"
                    >{{ $t('common.setting') }}</button
                  ></td
                >
                <td>
                  <mdui-switch v-for="key in settingList" :key="key" v-model="setting[key]">{{
                    $t(`hr.setting.${key}`)
                  }}</mdui-switch>
                  <mdui-switch
                    v-if="$root.serverNotCN"
                    class="mdui-m-r-2"
                    v-model="setting.showUnreleased"
                    >{{ $t('hr.setting.showUnreleased') }}</mdui-switch
                  >
                </td>
              </tr>
              <!-- 选项 -->
              <tr>
                <td v-if="!$root.smallScreen" width="1"
                  ><button
                    class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                    v-theme-class="$root.color.tagBtnHead"
                    >{{ $t('common.option') }}</button
                  ></td
                >
                <td class="mobile-screen-flex-box tag-btn-wrap">
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                    v-theme-class="$root.color.redBtn"
                    @click="reset"
                    >{{ $t('common.reset') }}</button
                  >
                  <label
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-left"
                    v-theme-class="[
                      'mdui-color-purple',
                      'mdui-color-purple-a100 mdui-ripple-black',
                    ]"
                    for="image-select"
                    :mdui-tooltip="`{content:'${$t('hr.ocr.tip')}',position:'top'}`"
                    @dragover.prevent
                    @drop.prevent="e => handleFilesOCR(e.dataTransfer.files)"
                    >{{ $t('hr.ocr.button') }} ({{ OCRBtnSubText }})</label
                  >
                  <input
                    type="file"
                    id="image-select"
                    accept="image/*"
                    style="display: none"
                    ref="image"
                    @change="
                      ({ target }) => {
                        handleFilesOCR(target.files);
                        target.value = '';
                      }
                    "
                  />
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-right no-grow"
                    v-theme-class="[
                      'mdui-color-purple',
                      'mdui-color-purple-a100 mdui-ripple-black',
                    ]"
                    @click="
                      closeDrawer();
                      $refs.apikeyDialog.open();
                    "
                    ><i class="mdui-icon material-icons">settings</i></button
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 提示 -->
    <div
      v-if="isTagsSelected(['高级资深干员', '资深干员', '支援机械'])"
      class="mdui-chip-group"
      :class="$root.smallScreen ? 'mdui-m-b-1' : 'mdui-m-t-4'"
    >
      <div v-if="isTagsSelected(['高级资深干员', '资深干员'])" class="mdui-chip">
        <span class="mdui-chip-icon mdui-color-red"
          ><i class="mdui-icon material-icons">priority_high</i></span
        >
        <span
          class="mdui-chip-title mdui-text-truncate"
          :style="$root.screenWidth < 360 ? 'font-size:12px' : false"
          >{{ $t('hr.tip.rare') }}</span
        >
      </div>
      <div v-if="isTagsSelected('支援机械')" class="mdui-chip">
        <span class="mdui-chip-icon mdui-color-red"
          ><i class="mdui-icon material-icons">priority_high</i></span
        >
        <span
          class="mdui-chip-title mdui-text-truncate"
          :style="$root.screenWidth < 360 ? 'font-size:12px' : false"
          >{{ $t('hr.tip.robot') }}</span
        >
      </div>
    </div>
    <!-- 结果表格 -->
    <div class="mdui-row" :class="{ 'mdui-m-t-4': !$root.smallScreen }">
      <div class="mdui-col-xs-12">
        <div v-if="!$root.smallScreen" class="comb-large">
          <table class="mdui-table mdui-table-hoverable comb-table hide-last-tr-border">
            <thead>
              <tr :class="{ 'tbody-is-empty': !displayCombinations.length }">
                <th width="1" class="mdui-table-col-numeric">#</th>
                <th width="20%">{{ $t('hr.table.header.tag') }}</th>
                <th width="1" class="mdui-text-center">{{ $t('hr.table.header.minRarity') }}</th>
                <th width="80%">{{ $t('hr.table.header.possibility') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(comb, i) in displayCombinations" :key="`comb-${i}`">
                <td>{{ i + 1 }}</td>
                <td>
                  <button
                    v-for="tag in comb.tags"
                    :key="`comb-${i}-${tag}`"
                    class="mdui-btn mdui-btn-dense no-pe tag-btn"
                    v-theme-class="color.selected"
                    >{{ $t(`tag.${tag}`) }}</button
                  >
                </td>
                <td>
                  <button
                    class="mdui-btn mdui-btn-dense no-pe tag-btn"
                    v-theme-class="color[comb.min]"
                    >{{ comb.min }}★</button
                  >
                </td>
                <td>
                  <!-- 干员 -->
                  <button
                    v-for="char in comb.chars"
                    :key="`comb-${i}-${char.name}`"
                    class="mdui-btn mdui-btn-dense tag-btn"
                    v-theme-class="color[char.star]"
                    :has-avatar="setting.showAvatar"
                    @click="showDetail(char)"
                  >
                    <div v-if="!isPub(char)" class="tag-triangle right-top"></div>
                    <div v-if="isPubOnly(char)" class="tag-triangle right-bottom"></div>
                    <Avatar class="tag-avatar" v-if="setting.showAvatar" :name="char.name" />
                    <span>{{ $t(`character.${char.name}`) }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="comb-small">
          <table
            class="mdui-table comb-table mdui-shadow-0 no-border bg-transparent hide-last-tr-border"
          >
            <thead>
              <tr>
                <th>{{ $t('hr.table.header.tag') }}</th>
                <th>{{ $t('hr.table.header.possibility') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(comb, i) in displayCombinations">
                <tr :key="`comb-${i}-tr1`">
                  <td class="mdui-p-b-0 no-border" colspan="2">
                    <button
                      v-for="tag in comb.tags"
                      :key="`comb-${i}-${tag}`"
                      class="mdui-btn mdui-btn-dense no-pe tag-btn"
                      v-theme-class="color.selected"
                      >{{ $t(`tag.${tag}`) }}</button
                    >
                    <div
                      class="mdui-btn-bold no-sl no-pe mdui-float-right min-star"
                      v-theme-class="color.text[comb.min]"
                      >{{ comb.min }}★</div
                    >
                  </td>
                </tr>
                <tr :key="`comb-${i}-tr2`">
                  <td colspan="2">
                    <!-- 干员 -->
                    <button
                      v-for="char in comb.chars"
                      :key="`comb-${i}-${char.name}`"
                      class="mdui-btn mdui-btn-dense tag-btn"
                      v-theme-class="color[char.star]"
                      :has-avatar="setting.showAvatar"
                      @click="showDetail(char)"
                    >
                      <div v-if="!isPub(char)" class="tag-triangle right-top"></div>
                      <div v-if="isPubOnly(char)" class="tag-triangle right-bottom"></div>
                      <Avatar class="tag-avatar" v-if="setting.showAvatar" :name="char.name" />
                      <span>{{ $t(`character.${char.name}`) }}</span>
                    </button>
                  </td>
                </tr>
              </template>
              <tr v-if="displayCombinations.length == 0">
                <td colspan="2" class="no-border">{{ $t('hr.table.selectTip') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- 详细信息 -->
    <mdui-dialog id="detail" class="mdui-card" ref="detailDialog">
      <div v-if="detail" class="mdui-card-header mdui-p-b-0">
        <Avatar class="mdui-card-header-avatar" :key="`di-${detail.name}`" :name="detail.name" />
        <div class="mdui-card-header-title mdui-m-t-1">
          <span>{{ $t(`character.${detail.name}`) }}</span>
          <button
            class="mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-y-0 mdui-m-l-1"
            v-theme-class="color[detail.star]"
            >{{ detail.star }}★</button
          >
        </div>
        <div class="detail-tags mdui-m-t-1">
          <button
            v-for="tag in [detail.profession, detail.position, ...detail.tags]"
            :key="`detail-${tag}`"
            class="mdui-btn mdui-btn-dense no-pe tag-btn"
            v-theme-class="selected.tag[tag] ? color.selected : color.notSelected"
            >{{ $t(`tag.${tag}`) }}</button
          >
        </div>
      </div>
      <div class="mdui-dialog-actions">
        <a
          v-if="wikiInfo"
          class="mdui-btn mdui-ripple"
          v-theme-class="['mdui-color-teal', 'mdui-color-teal-300 mdui-ripple-black']"
          @click="() => wikiInfo.open()"
          >{{ wikiInfo.btnName }}</a
        >
        <button
          class="mdui-btn mdui-ripple mdui-color-pink"
          v-theme-class="['mdui-color-pink', 'mdui-color-indigo-a100 mdui-ripple-black']"
          mdui-dialog-close
          >{{ $t('common.close') }}</button
        >
      </div>
    </mdui-dialog>
    <!-- OCR setting -->
    <mdui-dialog id="ocr-setting" class="mdui-typo" ref="apikeyDialog">
      <div class="mdui-dialog-title" style="padding-bottom: 12px"
        >OCR {{ $t('common.setting') }}</div
      >
      <div class="mdui-dialog-content mdui-p-b-0">
        <!-- <div class="mdui-m-t-1">
          <mdui-switch v-model="setting.OCRLangTW">{{
            $t('hr.ocr.setting.recognizeTraditionalChineseScreenshot')
          }}</mdui-switch>
        </div>
        <hr /> -->
        <div class="mdui-textfield mdui-p-t-0">
          <label class="mdui-textfield-label">OCR Space API Key</label>
          <input class="mdui-textfield-input" type="text" v-model.trim="setting.ocrspaceApikey" />
        </div>
        <i18n path="hr.ocr.setting.tip" tag="div" class="mdui-m-y-1">
          <a href="https://ocr.space/" target="_blank" rel="noopener">OCR Space</a>
          <a href="https://ocr.space/OCRAPI" target="_blank" rel="noopener">{{
            $t('hr.ocr.setting.applyLink')
          }}</a>
        </i18n>
        <hr />
        <div class="mdui-p-t-0">
          <mdui-switch v-model="setting.useLocalOCR">{{
            $t('hr.ocr.setting.useLocalOCR')
          }}</mdui-switch>
          <mdui-select
            v-if="availableLocalOCREngines.length > 1"
            v-model="curOCREngine"
            :options="availableLocalOCREngines"
            :disable-js="true"
            @change="$nextTick(() => $refs.apikeyDialog.handleUpdate())"
          />
        </div>
        <div class="mdui-m-t-1">{{ $t(`hr.ocr.setting.localOCRTip.${curOCREngine}`) }}</div>
      </div>
      <div class="mdui-dialog-actions">
        <button
          class="mdui-btn mdui-ripple"
          v-theme-class="$root.color.dialogTransparentBtn"
          mdui-dialog-cancel
          >{{ $t('common.close') }}</button
        >
      </div>
    </mdui-dialog>
    <!-- 浮动按钮 -->
    <button
      v-if="$root.smallScreen"
      class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-ripple"
      v-theme-class="$root.color.pinkBtn"
      @click="
        if (!drawer) drawer = new $Drawer('#drawer');
        drawer.toggle();
      "
    >
      <i class="mdui-icon material-icons">sort</i>
    </button>
  </div>
</template>

<script>
import _ from 'lodash';
import 'lodash.combinations';
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import Ajax from '@/utils/ajax';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import pickClone from '@/utils/pickClone';
import resizeImg from '@/utils/resizeImage';
import { filterImgFiles } from '@/utils/file';
import { localTagOCR, preInitLanguage } from '@/workers/tagOCR';
import { paddlePreInit, paddleOCR } from '@/workers/paddlejsOCR';
import { HR_TAG_BTN_COLOR } from '@/utils/constant';
import { useDataStore } from '@/store/data';
import { IS_MOBILE } from '@/utils/env';

const nls = new NamespacedLocalStorage('hr');
const MAX_TAG_NUM = 5;

const tagListInit = {
  professions: Array(8)
    .fill(null)
    .map((v, i) => i + 1),
  sort: ['qualification', 'professions', 'locations', 'abilities'],
};

export default defineComponent({
  name: 'arkn-hr',
  data: () => ({
    showAll: false,
    selected: {
      star: _.fill(Array(6), true),
      tag: {},
    },
    setting: {
      showAvatar: false,
      hide12: false,
      showPrivate: false,
      showUnreleased: false,
      showGuarantees: false,
      ocrspaceApikey: '',
      useLocalOCR: false,
      // OCRLangTW: false,
      OCREngine: '',
    },
    settingList: ['showAvatar', 'hide12', 'showPrivate', 'showGuarantees'],
    color: HR_TAG_BTN_COLOR,
    detail: false,
    drawer: null,
    tagsCache: [],
  }),
  watch: {
    'selected.tag': {
      handler() {
        let tags = _.flatMap(this.selected.tag, (selected, tag) => (selected ? [tag] : []));
        if (tags.length > MAX_TAG_NUM) {
          new this.$alert(this.$tc('hr.tagOverLimit', MAX_TAG_NUM), null, null, {
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
        nls.setItem('setting', val);
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useDataStore, ['enumTagMap', 'characterTable', 'characterList']),
    useCharacterList() {
      return this.characterList
        .filter(char => {
          if (
            !this.$root.serverCN &&
            !this.setting.showUnreleased &&
            !this.$root.isReleasedChar(char.name)
          ) {
            return false;
          }
          if (!this.setting.showPrivate && !this.isPub(char)) return false;
          return true;
        })
        .sort((a, b) => b.star - a.star);
    },
    tagReleaseMap() {
      return {
        [this.enumTagZh.元素]: this.$root.isReleasedChar('4136_phonor'),
      };
    },
    curOCREngine: {
      get() {
        return this.availableLocalOCREngines.includes(this.setting.OCREngine)
          ? this.setting.OCREngine
          : this.availableLocalOCREngines[0];
      },
      set(val) {
        this.setting.OCREngine = val;
      },
    },
    curOCRModule() {
      switch (this.curOCREngine) {
        case 'Paddle':
          return {
            preInit: paddlePreInit,
            recognize: paddleOCR,
          };
        default:
          return {
            preInit: () => preInitLanguage(this.OCRServer),
            /** @param {Blob} file  */
            recognize: file => localTagOCR(this.OCRServer, file),
          };
      }
    },
    canUsePaddleOCR() {
      return !IS_MOBILE && this.$root.serverCN;
    },
    availableLocalOCREngines() {
      const engines = ['Tesseract'];
      if (this.canUsePaddleOCR) engines.unshift('Paddle');
      return engines;
    },
    OCRBlackCharRegexp() {
      const whitelist = _.uniq(Object.keys(this.enumTagMap[this.OCRServer]).join('')).join('');
      return new RegExp(`[^${_.escapeRegExp(whitelist).replace(/-/g, '\\-')}]`, 'g');
    },
    enumTagZh() {
      return this.enumTagMap.cn;
    },
    tagData() {
      const data = {
        tags: {},
        avgCharTag: 0,
        abilities: [],
      };

      const abilities = new Set();
      let charTagSum = 0;

      const star5List = (data.tags[this.enumTagZh.资深干员] = []);
      const star6List = (data.tags[this.enumTagZh.高级资深干员] = []);

      this.useCharacterList.forEach(char => {
        const { profession, position, star } = char;
        let { tags } = char;
        // 过滤未实装标签
        if (!this.$root.serverCN && !this.setting.showUnreleased) {
          tags = tags.filter(tag => this.tagReleaseMap[tag] ?? true);
        }
        // 确定特性标签
        tags.forEach(tag => abilities.add(tag));
        // 资质
        switch (star) {
          case 5:
            star5List.push(char);
            break;
          case 6:
            star6List.push(char);
            break;
        }
        // 加入标签列表
        for (const tag of [...tags, profession, position]) {
          if (!(tag in data.tags)) data.tags[tag] = [];
          data.tags[tag].push(char);
        }
        // 用于计算组合评分
        charTagSum += tags.length + 2;
      });

      const tagCount = _.size(this.tags);
      data.avgCharTag = charTagSum / tagCount;

      abilities.delete(this.enumTagZh.新手);
      abilities.delete(this.enumTagZh.支援机械);
      data.abilities = Array.from(abilities).sort();

      Object.keys(data.tags).forEach(tag => {
        if (!(tag in this.selected.tag)) {
          this.$set(this.selected.tag, tag, false);
        }
      });

      return data;
    },
    tagList() {
      const tag = this.enumTagZh;
      return {
        locations: [tag.近战位, tag.远程位],
        qualification: [tag.高级资深干员, tag.资深干员, tag.新手, tag.支援机械],
        abilities: this.tagData.abilities,
        ...tagListInit,
      };
    },
    allStar() {
      return _.sum(this.selected.star) == this.selected.star.length;
    },
    // 计算词条组合
    combinations() {
      const tags = Object.keys(_.pickBy(this.selected.tag)).map(Number);
      const rares = _.flatMap(this.selected.star, (selected, star) => (selected ? [star + 1] : []));
      const combs = _.flatMap([1, 2, 3], v => _.combinations(tags, v));
      const result = [];
      for (const comb of combs) {
        const need = comb.map(tag => this.tagData.tags[tag]);
        const chars = _.intersection(...need);
        if (!comb.includes(this.enumTagZh.高级资深干员)) _.remove(chars, ({ star }) => star === 6);
        if (chars.length == 0) continue;

        let scoreChars = chars.filter(({ star }) => star >= 3);
        if (scoreChars.length == 0) scoreChars = chars;

        // origin by @gneko
        const score =
          _.sumBy(scoreChars, ({ star }) => star) / scoreChars.length -
          comb.length / 10 -
          scoreChars.length / this.tagData.avgCharTag;

        const minP = _.minBy(scoreChars, ({ recruitment, star }) =>
          this.isPub({ recruitment }) ? star : Infinity,
        );

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
      this.$emit(
        'nm',
        result.some(({ min }) => min >= 5),
      );
      return result;
    },
    displayCombinations() {
      if (this.setting.showGuarantees) {
        const selectedTags = Object.keys(_.pickBy(this.selected.tag)).map(Number);
        if (!selectedTags.length) return this.guarantees;
        return this.guarantees.filter(({ tags }) => selectedTags.every(tag => tags.includes(tag)));
      }
      return this.combinations;
    },
    // 保底组合计算
    guarantees() {
      const guarantees = [];
      const combs = _.flatMap([1, 2, 3], v =>
        _.combinations(
          [...this.tagList.professions, ...this.tagList.abilities, ...this.tagList.locations],
          v,
        ),
      );
      for (const comb of combs) {
        const need = [];
        for (const tag of comb) need.push(this.tagData.tags[tag]);
        const chars = _.intersection(...need).filter(({ star }) => 3 <= star && star < 6);
        if (chars.length == 0) continue;
        const min = _.min(chars.map(({ star }) => star));
        if (min < 4) continue;
        if (
          guarantees.some(
            ({ tags: _tags, chars: _chars }) =>
              _.difference(_chars, chars).length === 0 && _tags.every(tag => comb.includes(tag)),
          )
        ) {
          continue;
        }
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
    guaranteesTagSet() {
      return new Set(_.flatMap(this.guarantees, 'tags'));
    },
    /**
     * 词条名->ID
     * @returns {Record<string, number>}
     */
    enumTag() {
      return this.enumTagMap[this.$root.server];
    },
    /** @returns {string} */
    OCRServer() {
      // return this.setting.OCRLangTW ? 'tw' : this.$root.server;
      return this.$root.server;
    },
    OCRBtnSubText() {
      return this.OCRServer.toUpperCase();
    },
    wikiInfo() {
      if (!this.detail) return null;
      return this.$root.getWikiInfo(this.detail);
    },
  },
  methods: {
    closeDrawer() {
      this.drawer?.close();
    },
    reset() {
      this.selected.star = _.fill(Array(this.selected.star.length), true);
      for (const tag in this.selected.tag) {
        this.selected.tag[tag] = false;
      }
    },
    showDetail(char) {
      this.detail = char;
      this.$nextTick(() => this.$refs.detailDialog.open());
    },
    isTagsSelected(tags) {
      return _.castArray(tags).some(k => this.selected.tag[this.enumTagZh[k]]);
    },
    /**
     * @param {ArrayLike<File>} files
     */
    async handleFilesOCR(files) {
      if (!this.$route.path.startsWith('/hr')) return;
      const imgFiles = filterImgFiles(files);
      if (!imgFiles.length) return;
      this.closeDrawer();
      this.OCR(imgFiles[0]);
      this.$gtag.event('hr_ocr', {
        event_category: 'hr',
        event_label: this.setting.useLocalOCR ? 'ocr_local' : 'ocr',
      });
    },
    /**
     * @param {File} file
     */
    async OCR(file) {
      const words = this.setting.useLocalOCR
        ? await this.localOCR(file)
        : await this.ocrspaceOCR(file);
      if (!words) return;
      // eslint-disable-next-line
      console.log('OCR', JSON.stringify(words));
      this.reset();
      const tags = words
        .map(tag => tag.replace(this.OCRBlackCharRegexp, ''))
        .filter(tag => tag in this.enumTag);
      tags.slice(0, MAX_TAG_NUM).forEach(tag => {
        this.selected.tag[this.enumTag[tag]] = true;
      });
      if (tags.length < MAX_TAG_NUM) {
        this.$snackbar({
          message: this.$tc('hr.ocr.tagNotEnough', MAX_TAG_NUM),
          timeout: 0,
        });
      } else if (tags.length > MAX_TAG_NUM) {
        this.$snackbar({
          message: this.$tc('hr.ocr.tagOverLimit', MAX_TAG_NUM),
          timeout: 0,
        });
      }
    },
    /**
     * @param {File} file
     * @returns {Promise<string[]>}
     */
    async localOCR(file) {
      try {
        return await this.curOCRModule.recognize(file);
      } catch (e) {
        console.error('Local OCR error', e);
        this.$snackbar({
          message: `${this.$t('hr.ocr.error')}${String(e)}`,
          timeout: 0,
          buttonText: this.$t('common.retry'),
          onButtonClick: () => this.OCR(file),
        });
      }
    },
    /**
     * @param {File} file
     * @returns {Promise<string[] | void>}
     */
    async ocrspaceOCR(file) {
      const processingSnackbar = this.$snackbar({
        message: this.$t('hr.ocr.processing'),
        closeOnOutsideClick: false,
        timeout: 0,
      });
      const languageEnum = {
        cn: 'chs',
        tw: 'cht',
        us: 'eng',
        jp: 'jpn',
        kr: 'kor',
      };
      // 调用 ocr.space
      const result = await Ajax.ocrspace(
        {
          file: await resizeImg(file, {
            quality: 0.9,
            maxWidth: 1920,
            maxHeight: 1080,
          }),
          filetype: 'jpg',
          language: languageEnum[this.OCRServer],
        },
        this.setting.ocrspaceApikey,
      ).catch(e => ({
        IsErroredOnProcessing: true,
        ErrorMessage: String(e),
        Error: e,
      }));
      processingSnackbar.close();
      if (result.IsErroredOnProcessing) {
        console.error('ocr.space OCR error', result);
        this.$snackbar({
          message: `${this.$t('hr.ocr.error')}${_.castArray(result.ErrorMessage)
            .map(msg => (msg.endsWith('.') ? msg : `${msg}.`))
            .join(' ')}`,
          timeout: 0,
          buttonText: this.$t('common.retry'),
          onButtonClick: () => this.OCR(file),
        });
        return;
      }
      // 处理识别结果
      const errorList = {
        千员: '干员',
        滅速: '減速',
        枳械: '机械',
        冫口了: '治疗',
      };
      return _.filter(
        _.reduce(
          errorList,
          (cur, correct, error) => cur.replace(new RegExp(error, 'g'), correct),
          result.ParsedResults[0].ParsedText.trim(),
        ).split(/\s*[\r\n]+\s*/),
      );
    },
    // 是否是公招干员
    isPub({ name, recruitment }) {
      return this.$root.serverCN || this.$root.isReleasedChar(name)
        ? this.$root.server in recruitment
        : 'cn' in recruitment;
    },
    // 是否是公招限定干员
    isPubOnly({ recruitment }) {
      return this.$root.serverCN || this.$root.isReleasedChar(name)
        ? recruitment[this.$root.server] === 2
        : recruitment.cn === 2;
    },
  },
  created() {
    (obj => obj && (this.setting = pickClone(this.setting, obj)))(nls.getItem('setting'));

    this.$root.$on('paste-files', this.handleFilesOCR);
  },
  mounted() {
    if (this.setting.useLocalOCR) {
      this.curOCRModule.preInit();
    }
  },
  beforeDestroy() {
    this.$root.$off('paste-files', this.handleFilesOCR);
  },
});
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
    .tbody-is-empty th {
      border: none;
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
  .comb-small {
    .mdui-table {
      td:first-child {
        padding-left: 14px;
      }
      td:last-child {
        padding-right: 14px !important;
      }
    }
    .min-star {
      height: 36px;
      line-height: 36px;
    }
  }
  .tag-triangle {
    width: 16px;
    height: 16px;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.4);
    &.right-top {
      transform: rotate(45deg);
      right: -8px;
      top: -8px;
    }
    &.right-bottom {
      transform: rotate(-45deg);
      right: -8px;
      bottom: -8px;
    }
  }
  .pub-only {
    --stripe-color: rgba(255, 255, 255, 0.18);
    $stripe-width: 6px;
    background-image: repeating-linear-gradient(
      45deg,
      var(--stripe-color),
      var(--stripe-color) $stripe-width,
      transparent 0,
      transparent $stripe-width * 2
    );
  }
}
body:not(.mdui-theme-layout-dark) .mobile-screen {
  #arkn-hr {
    .comb-table {
      background-color: transparent;
    }
  }
}
.mdui-theme-layout-dark {
  #arkn-hr {
    .pub-only {
      --stripe-color: rgba(0, 0, 0, 0.13);
    }
  }
}
</style>
