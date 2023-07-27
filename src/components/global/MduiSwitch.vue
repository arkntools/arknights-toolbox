<template>
  <label class="mdui-switch" :class="{ 'mdui-switch-truncate': truncate }">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      @change="$emit('change', $event.target.checked)"
    />
    <i class="mdui-switch-icon mdui-m-r-1"></i>
    <span v-if="html" v-html="html" :class="{ 'mdui-text-truncate': truncate }"></span>
    <span v-else :class="{ 'mdui-text-truncate': truncate }">
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
    truncate: Boolean,
  },
};
</script>

<style>
.mdui-switch-truncate .mdui-text-truncate {
  display: inline-block;
  vertical-align: bottom;
  max-width: calc(100% - 44px);
}
</style>
