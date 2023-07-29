<template>
  <div class="mdui-textfield mdui-p-y-0" :class="{ 'mdui-textfield-disabled': disabled }">
    <label class="mdui-textfield-label no-sl"><slot></slot></label>
    <input
      class="mdui-textfield-input mdui-p-y-0"
      type="number"
      :value="value"
      :disabled="disabled"
      @input="$emit('input', format($event.target.value))"
      min="0"
      step="1"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'mdui-number-input',
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: [Number, String],
    placeholder: [Number, String],
    disabled: Boolean,
  },
  methods: {
    format(value) {
      if (!value) return '';
      return String(Math.max(0, Math.floor(Number(value || 0))));
    },
  },
});
</script>

<style scoped>
.mdui-textfield {
  width: 48px;
  display: inline-block;
}
.mdui-textfield-input {
  height: 24px;
}
</style>
