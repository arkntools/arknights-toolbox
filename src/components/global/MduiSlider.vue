<template>
  <label
    ref="slider"
    class="mdui-slider mdui-slider-discrete"
    :class="{ 'mdui-slider-disabled': disabled }"
  >
    <input
      type="range"
      :step="step"
      :min="min"
      :max="max"
      :value="value"
      :disabled="disabled"
      @change="$emit('change', Number($event.target.value))"
    />
  </label>
</template>

<script>
export default {
  name: 'mdui-slider',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Number,
    disabled: Boolean,
    min: Number,
    max: Number,
    step: Number,
  },
  mounted() {
    this.$mutation(this.$refs.slider);
  },
};
</script>
