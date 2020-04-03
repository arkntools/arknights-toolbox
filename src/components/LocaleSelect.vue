<template>
  <div id="locale-select" class="mdui-m-b-2">
    <span class="inline-block mdui-m-r-2">Language:</span>
    <select v-model="$root.locale" mdui-select>
      <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short">{{ locale.long }}</option>
    </select>
  </div>
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
