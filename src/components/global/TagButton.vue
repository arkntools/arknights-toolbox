<template>
  <label
    class="mdui-btn mdui-btn-dense mdui-ripple tag-btn"
    v-theme-class="checked ? selectedColorArr : notSelectedColorArr"
  >
    <input
      type="checkbox"
      :checked="checked"
      @change="canChange ? $emit('change', $event.target.checked) : false"
      style="display: none"
      @click="$emit('click')"
    />
    <slot></slot>
  </label>
</template>

<script>
import _ from 'lodash';
import { TAG_BTN_COMMON_COLOR } from '@/utils/constant';

export default {
  name: 'tag-button',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
    selectedColor: {
      type: [String, Array],
      default: () => TAG_BTN_COMMON_COLOR.selected,
    },
    notSelectedColor: {
      type: [String, Array],
      default: () => TAG_BTN_COMMON_COLOR.notSelected,
    },
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
