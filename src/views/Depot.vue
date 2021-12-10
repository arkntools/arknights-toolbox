<template>
  <div id="arkn-depot">
    <template v-if="drImg.src">
      <!-- 提示 -->
      <div class="mdui-typo-body-2 mdui-m-b-1 no-sl">{{ $t('depot.result.tip') }}</div>
      <!-- 识别结果展示 -->
      <div class="result">
        <div
          class="result-scrollable"
          @dragover.prevent
          @drop.prevent="e => handleUseFiles(e.dataTransfer.files)"
          @contextmenu.prevent
          :style="{ 'overflow-x': isDrProcessing ? 'hidden' : '' }"
          ref="resultScrollable"
          @wheel="onScrollResult"
        >
          <div class="result-wrapper" :style="resultWrapperStyle">
            <div
              class="result-container"
              :style="{
                backgroundImage: `url(${drImg.src || PNG1P})`,
                paddingBottom: `${100 / drImgRatio}%`,
              }"
            >
              <template v-for="({ view, sim, num }, i) in drData">
                <div
                  v-if="sim && num && (sim.diff <= MAX_SHOW_DIFF || isTrustedResult(sim))"
                  class="result-square pointer"
                  :class="{ disabled: !drSelect[i] }"
                  :key="i"
                  :style="viewNumToPct(view)"
                  @click.self="$set(drSelect, i, !drSelect[i])"
                  @contextmenu.prevent="editResult(i)"
                >
                  <div
                    class="result-sim mdui-valign"
                    :class="{ 'mdui-ripple mdui-ripple-white': drSelect[i] }"
                    @click="editResult(i)"
                  >
                    <arkn-item
                      class="result-sim-img"
                      :t="materialTable[sim.name].rare"
                      :img="sim.name"
                      width=""
                    />
                    <div class="result-sim-num no-pe no-sl">{{ num.value }}</div>
                  </div>
                  <div class="result-sim-warn no-sl no-pe" v-if="num.warn && !num.edit">⚠️</div>
                </div>
              </template>
            </div>
          </div>
          <div v-show="$_.size(drData)" class="debug-checkbox-wrapper">
            <mdui-checkbox class="debug-checkbox" v-model="debug">Debug</mdui-checkbox>
          </div>
          <div v-show="isDrProcessing && !drError" class="result-progress">
            <mdui-spinner class="mdui-m-r-1" :colorful="true" /><div
              class="mdui-typo-body-1 mdui-text-color-black-text"
              >{{ $t(`depot.recognitionSteps.${drStep}`) }}</div
            >
          </div>
          <div v-show="drError" class="result-progress">
            <div class="mdui-typo-body-1 mdui-text-color-red mdui-p-x-2">{{ drError }}</div>
          </div>
        </div>
      </div>
      <!-- 导入 -->
      <div v-if="drData || drError" class="mdui-row mdui-m-t-2">
        <div class="mdui-col-xs-6">
          <label
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block"
            for="img-select"
            v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
            @dragover.prevent
            @drop.prevent="e => handleUseFiles(e.dataTransfer.files)"
            >{{ $t('depot.result.selectImage') }}</label
          >
        </div>
        <div class="mdui-col-xs-6">
          <button
            class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block"
            v-theme-class="$root.color.pinkBtn"
            :disabled="!(drData && drData.length)"
            @click="importItems"
            >{{ $t('common.import') }}</button
          >
        </div>
      </div>
    </template>
    <!-- 选图提示 -->
    <label
      v-else
      class="image-select pointer mdui-valign mdui-text-center mdui-p-a-4 no-sl"
      for="img-select"
      @dragover.prevent
      @drop.prevent="e => handleUseFiles(e.dataTransfer.files)"
    >
      <div
        class="mdui-typo-display-1-opacity mdui-hidden-xs"
        v-html="$t('depot.input.title')"
      ></div>
      <div
        class="mdui-typo-headline mdui-hidden-sm-up"
        style="opacity: 0.54"
        v-html="$t('depot.input.title')"
      ></div>
    </label>
    <input
      type="file"
      id="img-select"
      accept="image/jpeg,image/png"
      style="display: none"
      @change="
        ({ target }) => {
          handleUseFiles(target.files);
          target.value = '';
        }
      "
    />
    <!-- 调试 -->
    <div v-if="debug && drData" id="debug" class="mdui-m-t-4 no-sl">
      <template v-for="({ sim, num, pos: { x, y }, debug: { scale } }, i) in drData">
        <div v-if="num" :key="i" class="debug-item mdui-m-b-2">
          <div
            class="debug-img"
            :style="{
              backgroundImage: `url(${drImg.src || PNG1P})`,
              backgroundPosition: `-${x * scale}px -${y * scale}px`,
              backgroundSize: `auto ${drImg.h * scale}px`,
            }"
          ></div>
          <img class="debug-num-img no-pe mdui-m-r-1" :src="num.img" />
          <pre class="mdui-m-y-0">
item: {{ sim.name }}
simi: {{ $_.round((1 - sim.diff) * 100, 2) }}%
text: {{ num.text }}</pre
          >
        </div>
      </template>
    </div>
    <!-- 测试用 -->
    <img class="test-img mdui-m-t-2" v-for="(img, i) in drDebug" :key="i" :src="img" />
  </div>
</template>

<script>
import ArknItem from '@/components/ArknItem';
import _ from 'lodash';
import { PNG1P } from '@/utils/constant';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import { filterImgFiles } from '@/utils/file';
import {
  toSimpleTrustedResult,
  isTrustedResult,
  MAX_SHOW_DIFF,
} from '@arkntools/depot-recognition/tools';
import { getRecognizer } from '@/workers/depotRecognition';
import { proxy as comlinkProxy } from 'comlink';

import { materialTable } from '@/store/material';

const nls = new NamespacedLocalStorage('depot');

export default {
  name: 'arkn-depot',
  components: { ArknItem },
  data: () => ({
    MAX_SHOW_DIFF,
    PNG1P,
    materialTable,
    drImg: {
      src: null,
      w: 0,
      h: 0,
    },
    drData: null,
    drSelect: [],
    drStep: -1,
    drError: '',
    drDebug: [],
    debug: false,
  }),
  computed: {
    itemsWillBeImported() {
      return _.fromPairs(
        this.drData
          .filter(({ sim, num }, i) => sim && num && this.drSelect[i])
          .map(({ sim: { name }, num: { value } }) => [name, value]),
      );
    },
    drImgRatio() {
      return this.drImg.w / this.drImg.h || 0;
    },
    resultWrapperStyle() {
      const ratio = this.drImgRatio;
      if (!ratio || ratio > 4 / 3) return { minWidth: '1000px' };
      if (window.innerWidth > window.innerHeight) {
        return { width: `${ratio * 70}vh`, margin: 'auto' };
      }
      return {};
    },
    isDrProcessing() {
      return this.drStep >= 0;
    },
  },
  methods: {
    isTrustedResult,
    viewNumToPct(obj) {
      return _.mapValues(obj, num => `${_.round(num * 100, 3)}%`);
    },
    updateStep(step = -1) {
      this.drStep = step;
    },
    /**
     * @param {ArrayLike<File>} files
     */
    handleUseFiles(files) {
      if (!this.$route.path.startsWith('/depot')) return;
      const imgFiles = filterImgFiles(files, ['image/jpeg', 'image/png']);
      if (!imgFiles.length) return;
      this.useImg(imgFiles[0]);
    },
    /**
     * @param {File} file
     */
    async useImg(file) {
      if (this.drImg.src) URL.revokeObjectURL(this.drImg.src);
      const forceInit = !!this.drError;
      this.updateStep(0);
      this.drError = '';
      this.drData = null;
      this.drSelect = [];
      this.drDebug = [];
      this.drImg = {
        src: URL.createObjectURL(file),
        w: 0,
        h: 0,
      };
      this.updateImgInfo();
      this.$gtag.event('depot_recognition', {
        event_category: 'depot',
        event_label: 'recognition',
      });
      try {
        const dr = await getRecognizer(forceInit);
        await dr.setDebug(this.debug);
        const { data, debug } = await dr.recognize(this.drImg.src, comlinkProxy(this.updateStep));
        // eslint-disable-next-line no-console
        console.log('[dr-result]', toSimpleTrustedResult(data), data);
        this.drData = _.cloneDeep(data);
        this.drSelect = data.map(isTrustedResult);
        this.drDebug = debug;
        setTimeout(this.updateStep);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[dr-init]', e);
        this.drError = String(e);
        this.updateStep();
      }
    },
    updateImgInfo() {
      const img = new Image();
      img.src = this.drImg.src;
      img.onload = () => {
        this.drImg.w = img.width;
        this.drImg.h = img.height;
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
            this.$set(this.drData[i].num, 'edit', true);
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
        },
      );
    },
    importItems() {
      if (this.$root.importItemsListening) {
        this.$root.$emit('import-items', this.itemsWillBeImported);
      } else {
        const items = {
          ...(nls.getItem('imports') || {}),
          ...this.itemsWillBeImported,
        };
        nls.setItem('imports', items);
      }
      this.$snackbar(this.$t('depot.result.imported'));
    },
    onScrollResult(e) {
      const $div = this.$refs.resultScrollable;
      if (!(e.deltaY && $div.scrollWidth > $div.clientWidth)) return;
      e.preventDefault();
      $div.scrollLeft += e.deltaY;
    },
  },
  created() {
    this.$root.$on('paste-files', this.handleUseFiles);
    this.debug = !!this.$route.query.debug;
  },
  beforeDestroy() {
    this.$root.$off('paste-files', this.handleUseFiles);
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
    // iPhone X bug
    margin: 0 4px;
  }
  .result {
    position: relative;
    &-scrollable {
      overflow-x: auto;
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
    &-container {
      position: relative;
      background-size: cover;
      overflow: hidden;
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
      box-sizing: content-box;
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
        height: 100%;
        filter: brightness(1);
      }
      &-warn {
        display: inline-block;
        position: absolute;
        top: 4px;
        left: 4px;
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
          &-img,
          &-warn {
            opacity: 0.2;
          }
        }
      }
    }
  }
  #debug {
    display: flex;
    flex-wrap: wrap;
    .debug {
      &-item {
        display: inline-flex;
        align-items: center;
        min-width: 315px;
      }
      &-img {
        width: 60px;
        height: 60px;
        border: 2px solid #f00;
        border-right-width: 0;
      }
      &-num-img {
        height: 60px;
        border: 2px solid #f00;
      }
    }
  }
  .debug-checkbox {
    color: #fff;
    &-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      padding: 4px 14px;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(3px);
      border-bottom-right-radius: 4px;
    }
    input:not(:checked) + .mdui-checkbox-icon:after {
      border-color: rgba(255, 255, 255, 0.8);
    }
    .mdui-checkbox-icon {
      box-shadow: none;
    }
  }
  .test-img {
    display: block;
    max-width: 100%;
  }
}
.mdui-theme-layout-dark #arkn-depot {
  .result-container {
    filter: brightness(0.9);
  }
}
</style>
