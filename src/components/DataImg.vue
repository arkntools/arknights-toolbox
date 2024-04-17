<template>
  <img
    :src="imgSrc"
    :style="imgStyle"
    :loading="loading"
    crossorigin="anonymous"
    @error="isError = true"
  />
</template>

<script>
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useHotUpdateStore } from '@/store/hotUpdate';
import { PNG1P } from '@/utils/constant';
import { IS_IOS } from '@/utils/env';

const defaultErrorStyle = {
  backgroundColor: '#bdbdbd',
  borderRadius: '50%',
};

export default defineComponent({
  name: 'data-item',
  props: {
    type: String,
    name: [Number, String],
    errorStyle: [Boolean, Object],
    lazy: Boolean,
  },
  data: () => ({
    isError: false,
  }),
  watch: {
    src(newVal, oldVal) {
      if (newVal !== oldVal) this.isError = false;
    },
  },
  computed: {
    ...mapState(useHotUpdateStore, ['dataBaseURL']),
    imgSrc() {
      if (!(this.dataBaseURL && this.type && this.name)) return PNG1P;
      return `${this.dataBaseURL}/img/${this.type}/${this.name}.png`;
    },
    imgStyle() {
      if (!this.isError) return;
      return this.errorStyle === true ? defaultErrorStyle : this.errorStyle;
    },
    loading() {
      // iOS PWA image lazy loading failed bug
      return !IS_IOS && this.lazy ? 'lazy' : undefined;
    },
  },
  methods: {
    handleError(e) {
      console.error('[DataImg] loading error', this.imgSrc);
      console.error(e);
    },
  },
});
</script>
