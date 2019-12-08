<template>
  <div class="mdui-textfield mdui-p-y-0">
    <label class="mdui-textfield-label no-sl">
      <slot></slot>
    </label>
    <input class="mdui-textfield-input mdui-p-y-0" type="number" :value="value" @input="$emit('input', $event.target.value)" min="0" step="1" :placeholder="placeholder" />
  </div>
</template>

<script>
export default {
  name: 'mdui-number-input',
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: [Number, String],
    placeholder: String,
  },
};
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
