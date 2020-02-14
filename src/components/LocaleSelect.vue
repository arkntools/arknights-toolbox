<template>
  <p id="locale-select">
    Language:
    <select v-model="$root.locale" mdui-select>
      <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short">{{ locale.long }}</option>
    </select>
  </p>
</template>

<script>
export default {
  name: 'locale-select',
  mounted() {
    this.$mutation();
  },
};
</script>

<style>
#locale-select .mdui-select-selected {
  text-align: center;
}
</style>
