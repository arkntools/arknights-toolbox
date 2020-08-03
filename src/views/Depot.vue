<template>
  <div id="arkn-depot">
    <div>
      <label
        class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
        v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
        for="img-select"
        @dragover.prevent
        @drop.prevent="e => useImg(e.dataTransfer.files[0])"
        >选择截图</label
      >
      <input
        type="file"
        id="img-select"
        accept="image/*"
        style="display: none;"
        ref="image"
        @change="useImg($refs.image.files[0])"
      />
    </div>
    <div id="prew-container" :style="{ backgroundImage: `url(${imgSrc})`, paddingBottom: `${imgRatio * 100}%` }">
      <div class="prew-square" v-for="({ posPct, sim }, i) in drData" :key="i" :style="num2pct(posPct)">
        <div class="prew-sim mdui-valign" v-if="sim">
          <arkn-item class="prew-sim-img" :t="materialTable[sim.name].rare" :img="sim.name" :width="32" />
          <span class="prew-sim-pct">{{ $_.round(100 * (1 - sim.diff), 2) }}%</span>
        </div>
      </div>
    </div>
    <div>
      <img class="test-img" v-for="(src, i) in testSrc" :key="i" :src="src" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import DepotRecognition from 'comlink-loader!@/utils/depotRecognition';
// import { recognize } from '@/utils/depotRecognition';
import { PNG1P } from '@/utils/constant';
import ArknItem from '@/components/ArknItem';

import { materialTable } from '@/store/material.js';

const drworker = new DepotRecognition();

export default {
  name: 'arkn-depot',
  components: { ArknItem },
  data: () => ({
    materialTable,
    imgSrc: PNG1P,
    imgRatio: 0,
    drData: [],
    testSrc: [PNG1P],
  }),
  methods: {
    num2pct(obj) {
      return _.mapValues(obj, num => `${_.round(num * 100, 3)}%`);
    },
    useImg(file) {
      if (!file) return;
      this.drData = [];
      this.imgRatio = 0;
      this.imgSrc = window.URL.createObjectURL(file);
      this.updateRatio(this.imgSrc);
      drworker.recognize(this.imgSrc).then(async ({ data, test }) => {
        this.drData = data;
        this.testSrc = await Promise.all(test.map(testImg => testImg.getBlobURL()));
      });
    },
    updateRatio(src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.imgRatio = img.height / img.width;
      };
    },
  },
  mounted() {
    fetch('/test/IMG_8014.PNG').then(async res => this.useImg(await res.blob()));
  },
};
</script>

<style lang="scss">
#prew-container {
  position: relative;
  background-size: cover;
}
.prew {
  &-square {
    position: absolute;
    border: 2px solid red;
    box-sizing: border-box;
  }
  &-sim {
    position: absolute;
    bottom: -36px;
    width: 100%;
    justify-content: center;
    &-img {
      display: inline-block;
    }
    &-pct {
      font-size: 18px;
    }
  }
}
.test-img {
  border: 2px solid red;
  margin: 4px;
  width: 183px;
}
.test-img:nth-of-type(2n) {
  position: relative;
  transform: translateX(-195px);
  opacity: 0.5;
}
</style>
