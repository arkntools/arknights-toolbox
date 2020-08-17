<template>
  <div id="arkn-depot">
    <template v-if="imgSrc">
      <!-- 提示 -->
      <div class="mdui-typo-body-2 mdui-m-b-1 no-sl">{{ $t('depot.result.tip') }}</div>
      <!-- 识别结果展示 -->
      <div
        class="result-scrollable"
        @dragover.prevent
        @drop.prevent="e => useImg(e.dataTransfer.files[0])"
        @contextmenu.prevent
        :style="{ 'overflow-x': drProgress ? 'hidden' : '' }"
      >
        <div class="result-wrapper">
          <div
            class="result-container"
            :style="{ backgroundImage: `url(${imgSrc || PNG1P})`, paddingBottom: `${imgRatio * 100}%` }"
          >
            <div
              class="result-square pointer"
              :class="{ disabled: !drSelect[i] }"
              v-for="({ posPct, sim, num }, i) in drData"
              v-show="sim"
              :key="i"
              :style="num2pct(posPct)"
              @click.self="$set(drSelect, i, !drSelect[i])"
              @contextmenu.prevent="editResult(i)"
            >
              <div
                v-if="sim"
                class="result-sim mdui-valign"
                :class="{ 'mdui-ripple mdui-ripple-white': drSelect[i] }"
                @click="editResult(i)"
              >
                <arkn-item
                  class="result-sim-img"
                  :t="materialTable[sim.name].rare"
                  :img="sim.name"
                  width=""
                  style="height: 100%;"
                />
                <div class="result-sim-num no-pe no-sl"
                  >{{ num.value }}<small v-if="num.warn && !num.edit">⚠️</small></div
                >
              </div>
            </div>
          </div>
        </div>
        <div class="debug-checkbox-wrapper">
          <mdui-checkbox class="debug-checkbox" v-model="debug">Debug</mdui-checkbox>
        </div>
        <div v-show="drProgress" class="result-progress">
          <mdui-spinner class="mdui-m-r-1" :colorful="true" /><div
            class="mdui-typo-body-1 mdui-text-color-black-text"
            >{{ drProgress }}</div
          >
        </div>
      </div>
      <!-- 导入 -->
      <div v-if="drData.length" class="mdui-row mdui-m-t-2">
        <div class="mdui-col-xs-6">
          <label
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block"
            for="img-select"
            v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
            @dragover.prevent
            @drop.prevent="e => useImg(e.dataTransfer.files[0])"
            >{{ $t('depot.result.selectImage') }}</label
          >
        </div>
        <div class="mdui-col-xs-6">
          <button
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block"
            v-theme-class="$root.color.pinkBtn"
            @click="importItems"
            >{{ $t('common.import') }}</button
          >
        </div>
      </div>
    </template>
    <!-- 选图提示 -->
    <label
      v-else
      class="image-select pointer mdui-valign mdui-text-center mdui-p-a-4"
      for="img-select"
      @dragover.prevent
      @drop.prevent="e => useImg(e.dataTransfer.files[0])"
    >
      <div class="mdui-typo-display-1-opacity mdui-hidden-xs" v-html="$t('depot.input.title')"></div>
      <div class="mdui-typo-headline mdui-hidden-sm-up" style="opacity: 0.54;" v-html="$t('depot.input.title')"></div>
      <div class="mdui-typo-body-2 mdui-m-t-2">{{ $t('depot.input.notice') }}</div>
    </label>
    <input
      type="file"
      id="img-select"
      accept="image/jpeg,image/png"
      style="display: none;"
      ref="image"
      @change="useImg($refs.image.files[0])"
    />
    <!-- 调试 -->
    <div v-if="debug" id="debug" class="mdui-m-t-4 no-sl">
      <template v-for="({ num }, i) in drData">
        <div v-if="num" :key="i" class="debug-item mdui-m-r-3 mdui-m-b-2">
          <img class="debug-img no-pe mdui-m-r-1" :src="num.img" />
          <pre class="mdui-m-y-0">text: {{ num.text }}</pre>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import safelyParseJSON from '@/utils/safelyParseJSON';
import { PNG1P } from '@/utils/constant';
import ArknItem from '@/components/ArknItem';

import { materialTable } from '@/store/material.js';

import DepotRecognitionWorker from 'comlink-loader!@/utils/dr.worker.js';
const drworker = new DepotRecognitionWorker();

export default {
  name: 'arkn-depot',
  components: { ArknItem },
  data: () => ({
    PNG1P,
    materialTable,
    imgSrc: null,
    imgRatio: 0,
    drData: [],
    drSelect: [],
    drProgress: '',
    debug: false,
  }),
  methods: {
    num2pct(obj) {
      return _.mapValues(obj, num => `${_.round(num * 100, 3)}%`);
    },
    async useImg(file) {
      if (!file || !['image/jpeg', 'image/png'].includes(file.type)) return;
      this.drData = [];
      this.drSelect = [];
      this.drProgress = 'Processing';
      this.imgRatio = 0;
      this.imgSrc = window.URL.createObjectURL(file);
      this.updateRatio(this.imgSrc);
      const data = await drworker.recognize(this.imgSrc);
      this.drData = data;
      this.drSelect = data.map(() => true);
      this.drProgress = '';
    },
    updateRatio(src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.imgRatio = img.height / img.width;
      };
    },
    editResult(i) {
      this.$prompt(
        '材料数量',
        '修改结果',
        value => {
          const num = value.trim();
          if (/^[0-9]+$/.test(num)) {
            this.drData[i].num.value = parseInt(num);
            this.drData[i].num.edit = true;
          } else {
            this.editResult(i);
          }
        },
        () => {},
        {
          history: false,
          confirmOnEnter: true,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.edit'),
          defaultValue: this.drData[i].num.value,
        }
      );
    },
    importItems() {
      if (this.$root.importItemsListening) {
        this.$root.$emit('importItems', this.itemsWillBeImported);
      } else {
        const storageKey = 'depot.imports';
        const items = {
          ...safelyParseJSON(localStorage.getItem(storageKey)),
          ...this.itemsWillBeImported,
        };
        localStorage.setItem(storageKey, JSON.stringify(items));
      }
      this.$snackbar(this.$t('depot.result.imported'));
    },
    // 粘贴图片
    pasteImg({ ctrlKey, altKey, keyCode }) {
      if (keyCode !== 86 || !this.$route.path.startsWith('/depot')) return;
      if (ctrlKey || (navigator && 'platform' in navigator && navigator.platform.startsWith('Mac') && altKey)) {
        this.readClipboardImg()
          .then(this.useImg)
          .catch(e => {
            // eslint-disable-next-line
            console.warn(e);
            if (e.name === 'DataError') this.$snackbar({ message: this.$t('hr.ocr.pasteDataError'), timeout: 6000 });
          });
      }
    },
    // 读取剪贴板图片
    async readClipboardImg() {
      if (!(await this.$requestClipboardPermission('clipboard-read'))) return;
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgTypes = item.types.filter(type => type.startsWith('image/'));
        if (imgTypes.length > 0) {
          const blob = await item.getType(imgTypes[0]);
          return new File([blob], `depot-${Date.now()}.${_.last(imgTypes[0].split('/'))}`, {
            type: imgTypes[0],
          });
        }
      }
    },
  },
  computed: {
    itemsWillBeImported() {
      return _.fromPairs(
        this.drData
          .filter(({ sim, num }, i) => sim && num && this.drSelect[i])
          .map(({ sim: { name }, num: { value } }) => [name, value])
      );
    },
  },
  created() {
    this.$$(window).on('keydown', this.pasteImg);
    drworker.setResourceStaticBaseURL(this.$root.staticBaseURL);
  },
  beforeDestroy() {
    this.$$(window).off('keydown', this.pasteImg);
  },
};
</script>

<style lang="scss">
#arkn-depot {
  .image-select {
    min-height: 300px;
    border: 2px dashed #aaa;
    flex-direction: column;
    justify-content: center;
  }
  .result {
    &-scrollable {
      overflow-x: auto;
      position: relative;
    }
    &-progress {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.9);
    }
    &-wrapper {
      min-width: 1000px;
    }
    &-container {
      position: relative;
      background-size: cover;
    }
    &-square {
      position: absolute;
      border: 2px solid #353535;
      box-sizing: border-box;
      &::before {
        content: '';
        background-color: #fff;
      }
    }
    &-square::before,
    &-sim {
      position: absolute;
      left: -2px;
      top: 100%;
      height: 30%;
      width: 100%;
      padding: 2px;
    }
    &-sim {
      background-color: #353535;
      font-size: 20px;
      color: #fff;
      justify-content: center;
      transition: opacity 0.1s;
      &:hover {
        opacity: 0.87;
      }
      &-img {
        display: inline-block;
        filter: brightness(1);
      }
    }
    &-square.disabled {
      background-color: rgba(199, 199, 199, 0.8);
      border-color: #c7c7c7;
      .result {
        &-sim {
          background-color: #c7c7c7;
          color: #999;
          &:hover {
            opacity: 1;
          }
          &-img {
            opacity: 0.3;
          }
        }
      }
    }
  }
  #debug {
    display: flex;
    flex-wrap: wrap;
    margin-right: -16px;
    .debug {
      &-item {
        display: inline-flex;
        align-items: center;
      }
      &-img {
        border: 2px solid red;
      }
    }
  }
  .debug-checkbox {
    color: #fff;
    &-wrapper {
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 8px 16px;
      background-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(3px);
      border-radius: 26px;
    }
    input:not(:checked) + .mdui-checkbox-icon:after {
      border-color: rgba(255, 255, 255, 0.8);
    }
  }
}
.mdui-theme-layout-dark #arkn-depot {
  .result-container {
    filter: brightness(0.9);
  }
}
</style>
