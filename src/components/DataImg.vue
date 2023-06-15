<template>
  <img
    v-show="!(hideWhenError && isError)"
    :src="imgSrc"
    :style="imgStyle"
    :loading="lazy ? 'lazy' : undefined"
    crossorigin="anonymous"
    @error="isError = true"
  />
</template>

<script>
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { useHotUpdateStore } from '@/store/hotUpdate';
import { PNG1P } from '@/utils/constant';
import NO_IMAGE from '@/assets/img/no-image.png';

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
    hideWhenError: Boolean,
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
      if (!(this.type && this.name)) return PNG1P;
      if (this.isError && !this.hideWhenError) return NO_IMAGE;
      return `${this.dataBaseURL}/img/${this.type}/${this.name}.png`;
    },
    imgStyle() {
      if (!this.isError) return;
      return this.errorStyle === true ? defaultErrorStyle : this.errorStyle;
    },
  },
});
</script>
