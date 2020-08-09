<template>
  <div id="arkn-depot">
    <!-- 选图提示 -->
    <label
      class="image-select pointer mdui-valign mdui-text-center mdui-p-a-4"
      for="img-select"
      @dragover.prevent
      @drop.prevent="e => useImg(e.dataTransfer.files[0])"
    >
      <div class="mdui-typo-display-1-opacity mdui-hidden-xs">点击选择 / 拖拽图片到此处 / 粘贴截图</div>
      <div class="mdui-typo-headline mdui-hidden-sm-up" style="opacity: 0.54;"
        >点击选择 / 拖拽图片到此处 / 粘贴截图</div
      >
      <div class="mdui-typo-body-2 mdui-m-t-2">注意：请提交上下边完整的屏幕截图，左右边可以裁剪，上下边请勿裁剪</div>
    </label>
    <!-- 识别结果展示 -->
    <div class="prew-scrollable mdui-m-t-2">
      <div class="prew-wrapper">
        <div
          class="prew-container"
          :style="{ backgroundImage: `url(${imgSrc || PNG1P})`, paddingBottom: `${imgRatio * 100}%` }"
        >
          <div
            class="prew-square pointer"
            :class="{ disabled: !drSelect[i] }"
            v-for="({ posPct, sim, num }, i) in drData"
            v-show="sim"
            :key="i"
            :style="num2pct(posPct)"
            @click.self="$set(drSelect, i, !drSelect[i])"
          >
            <div class="prew-sim mdui-valign" :class="{ 'mdui-ripple mdui-ripple-white': drSelect[i] }" v-if="sim">
              <arkn-item
                class="prew-sim-img"
                :t="materialTable[sim.name].rare"
                :img="sim.name"
                width=""
                style="height: 100%;"
              />
              <div class="prew-sim-num no-pe no-sl">{{ num }}</div>
            </div>
          </div>
        </div>
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
        <button class="mdui-btn mdui-btn-raised mdui-ripple mdui-btn-block" v-theme-class="$root.color.pinkBtn"
          >确定导入</button
        >
      </div>
    </div>
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
// import DepotRecognition from 'comlink-loader!@/utils/depotRecognition';
import { PNG1P } from '@/utils/constant';
import ArknItem from '@/components/ArknItem';

import { materialTable } from '@/store/material.js';

import testData from './test';

// const drworker = new DepotRecognition();

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
  }),
  methods: {
    log: console.log,
    num2pct(obj) {
      return _.mapValues(obj, num => `${_.round(num * 100, 3)}%`);
    },
    useImg(file) {
      if (!file) return;
      this.drData = testData;
      this.drSelect = testData.map(() => true);
      this.imgRatio = 0;
      this.imgSrc = window.URL.createObjectURL(file);
      this.updateRatio(this.imgSrc);
      // drworker.recognize(this.imgSrc).then(async ({ data, test, time }) => {
      //   this.drData = data;
      // });
    },
    updateRatio(src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.imgRatio = img.height / img.width;
      };
    },
  },
  computed: {
    itemsWillBeAdd() {
      return this.drData
        .filter(({ sim, num }, i) => sim && num && this.drSelect[i])
        .map(({ sim: { name }, num }) => [name, num]);
    },
  },
  created() {
    // drworker.loadResource(this.$root.staticBaseURL);
    fetch('/test/IMG_7992.jpg').then(async res => this.useImg(await res.blob()));
    window.ipt = arg => this.$root.$emit('importItem', arg);
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
  .prew {
    &-scrollable {
      overflow-x: auto;
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
      .prew {
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
  .prew-container {
    filter: brightness(0.9);
  }
}
</style>
