<template>
  <div id="lang-server-setting" ref="localeSelect">
    <div class="mdui-m-b-2">
      <label>Language:</label>
      <select v-model="$root.locale" mdui-select>
        <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short">{{
          locale.long
        }}</option>
      </select>
    </div>
    <div id="server-select" class="mdui-m-b-2">
      <label>Server:</label>
      <select v-model="$root.server" mdui-select>
        <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short">{{
          locale.short.toUpperCase()
        }}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'lang-server-setting',
  mounted() {
    this.$mutation(this.$refs.localeSelect);
  },
};
</script>

<style lang="scss">
#lang-server-setting {
  label {
    display: inline-block;
    width: 80px;
  }
  .mdui-select-selected {
    text-align: center;
  }
}
#server-select {
  .mdui-select * {
    font-family: 'Roboto Mono', Roboto, Noto, Helvetica, Arial, sans-serif;
  }
}
</style>
