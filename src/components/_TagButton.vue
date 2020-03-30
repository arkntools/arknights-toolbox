<template>
  <label class="mdui-btn mdui-btn-dense mdui-ripple tag-btn" :class="checked ? `mdui-color-${selectedColor}` : `mdui-color-${notSelectedColor}`">
    <input type="checkbox" :checked="checked" @change="canChange ? $emit('change', $event.target.checked) : false" style="display:none" @click="$emit('click')" />
    <slot></slot>
  </label>
</template>

<script>
export default {
  name: 'tag-button',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
    selectedColor: String,
    notSelectedColor: String,
    canChange: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
