<template>
  <select
    class="mdui-select"
    :mdui-select="disableJs ? undefined : mduiOptions ? JSON.stringify(mduiOptions) : ''"
    :value="value"
    @change="$emit('change', $event.target.value)"
  >
    <template v-for="opt of options">
      <option v-if="typeof opt === 'string'" :key="opt" :value="opt">{{ opt }}</option>
      <option v-else :key="opt.value" :value="opt.value">{{ opt.text }}</option>
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
    mduiOptions: Object,
    disableJs: Boolean,
  },
};
</script>
