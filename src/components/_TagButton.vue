<template>
  <label class="mdui-btn mdui-btn-dense mdui-ripple tag-btn" v-theme-class="checked ? selectedColorArr : notSelectedColorArr">
    <input type="checkbox" :checked="checked" @change="canChange ? $emit('change', $event.target.checked) : false" style="display:none" @click="$emit('click')" />
    <slot></slot>
  </label>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'tag-button',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
    selectedColor: [String, Array],
    notSelectedColor: [String, Array],
    canChange: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    selectedColorArr() {
      return _.castArray(this.selectedColor);
    },
    notSelectedColorArr() {
      return _.castArray(this.notSelectedColor);
    },
  },
};
</script>
