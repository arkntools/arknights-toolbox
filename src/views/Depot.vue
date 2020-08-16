<template>
  <div id="arkn-depot">
    <div class="mdui-typo-body-2 mdui-m-b-1 no-sl">⚠️ There are still some issues with mobile devices.</div>
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
                <div class="result-sim-num no-pe no-sl">{{ num }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-show="drProgress" class="result-progress">
          <mdui-spinner class="mdui-m-r-1" :colorful="true" /><div
            class="mdui-typo-body-1 mdui-text-color-black-text"
            >{{ drProgress }}</div
          >
        </div>
      </div>
      <!-- 导入 -->
      <div class="mdui-row mdui-m-t-2">
        <div class="mdui-col-xs-6">
          <label
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block"
            for="img-select"
            v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
            @dragover.prevent
            @drop.prevent="e => useImg(e.dataTransfer.files[0])"
            >选择截图</label
          >
        </div>
        <div class="mdui-col-xs-6">
          <button
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block"
            v-theme-class="$root.color.pinkBtn"
            @click="importItems"
            >确定导入</button
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
      accept="image/*"
      style="display: none;"
      ref="image"
      @change="useImg($refs.image.files[0])"
    />
  </div>
</template>

<script>
import _ from 'lodash';
import safelyParseJSON from '@/utils/safelyParseJSON';
import { PNG1P } from '@/utils/constant';
import ArknItem from '@/components/ArknItem';

import { materialTable } from '@/store/material.js';

import DepotRecognition from 'comlink-loader!@/utils/depotRecognition';
const drworker = new DepotRecognition();
// import { Recognizer, loadResource } from '@/utils/depotRecognition';

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
  }),
  methods: {
    num2pct(obj) {
      return _.mapValues(obj, num => `${_.round(num * 100, 3)}%`);
    },
    async useImg(file) {
      if (!file) return;
      this.drData = [];
      this.drSelect = [];
      this.drProgress = 'Loading images';
      this.imgRatio = 0;
      this.imgSrc = window.URL.createObjectURL(file);
      this.updateRatio(this.imgSrc);
      // const recognizer = new Recognizer();
      const recognizer = await new drworker.Recognizer();
      const updateProgress = setInterval(async () => {
        this.drProgress = await recognizer.getProgress();
      }, 100);
      recognizer.recognize(this.imgSrc).then(({ data }) => {
        clearInterval(updateProgress);
        this.drData = data;
        this.drSelect = data.map(() => true);
        this.drProgress = '';
      });
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
            this.drData[i].num = parseInt(num);
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
          defaultValue: this.drData[i].num,
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
          .map(({ sim: { name }, num }) => [name, num])
      );
    },
  },
  created() {
    this.$$(window).on('keydown', this.pasteImg);
    // loadResource(this.$root.staticBaseURL);
    drworker.loadResource(this.$root.staticBaseURL);
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
}
.mdui-theme-layout-dark #arkn-depot {
  .result-container {
    filter: brightness(0.9);
  }
}
</style>
