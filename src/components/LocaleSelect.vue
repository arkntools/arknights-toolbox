<template>
  <div id="locale-select" class="mdui-m-b-2" ref="localeSelect">
    <span class="inline-block mdui-m-r-2">Server &amp; Language:</span>
    <select v-model="$root.locale" mdui-select>
      <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short"
        >{{ locale.short.toUpperCase() }} {{ locale.long }}</option
      >
    </select>
  </div>
</template>

<script>
export default {
  name: 'locale-select',
  mounted() {
    this.$mutation(this.$refs.localeSelect);
  },
};
</script>

<style lang="scss">
#locale-select {
  .mdui-select * {
    font-family: 'Roboto Mono', Roboto, Noto, Helvetica, Arial, sans-serif;
  }
  .mdui-select-selected {
    text-align: center;
  }
}
</style>
