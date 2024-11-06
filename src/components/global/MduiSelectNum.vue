<template>
  <select
    ref="el"
    class="mdui-select"
    :value="value"
    @change="$emit('change', parseInt($event.target.value))"
  >
    <option v-for="opt of options" :key="`opt-${opt}`" :value="opt">{{
      display ? display(opt) : opt
    }}</option>
  </select>
</template>

<script>
import { markRaw } from 'vue';

export default {
  name: 'mdui-select-num',
  model: {
    event: 'change',
  },
  props: {
    value: [Number, String],
    options: Array,
    mduiOptions: Object,
    disableJs: Boolean,
    display: Function,
  },
  data: () => ({
    inst: null,
    updateTimer: null,
  }),
  computed: {
    optionsKey() {
      return this.options.join(',');
    },
  },
  mounted() {
    if (!this.disableJs) {
      this.inst = markRaw(new this.$Select(this.$refs.el, this.mduiOptions));
    }
  },
  watch: {
    async value(value) {
      if (this.inst && String(value) !== this.inst.value) {
        this.handleUpdate();
      }
    },
    optionsKey() {
      this.handleUpdate();
    },
  },
  methods: {
    handleUpdate() {
      if (this.updateTimer) return;
      this.updateTimer = setTimeout(() => {
        this.inst?.handleUpdate();
        this.updateTimer = null;
      });
    },
  },
};
</script>

<style lang="scss">
.mdui-select-width-100p + div.mdui-select {
  width: 100%;
}
</style>
