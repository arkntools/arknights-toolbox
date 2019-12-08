<template>
  <select class="mdui-select" mdui-select :value="value" @change="$emit('change', $event.target.value)">
    <template v-if="typeof options[0] == 'string'">
      <option v-for="opt of options" :key="opt" :value="opt">{{opt}}</option>
    </template>
    <template v-else>
      <option v-for="opt of options" :key="opt.value" :value="opt.value">{{opt.text}}</option>
    </template>
  </select>
</template>

<script>
export default {
  name: 'mdui-select',
  model: {
    event: 'change',
  },
  props: {
    value: String,
    options: Array,
  },
};
</script>
