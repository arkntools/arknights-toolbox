<template>
  <label class="mdui-switch">
    <input type="checkbox" :checked="checked" :disabled="disabled" @change="$emit('change', $event.target.checked)" />
    <i class="mdui-switch-icon mdui-m-r-1"></i>
    <span v-if="html" v-html="html"></span>
    <span v-else>
      <slot></slot>
    </span>
  </label>
</template>

<script>
export default {
  name: 'mdui-switch',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
    html: String,
    disabled: Boolean,
  },
};
</script>
