<template>
  <div id="lang-server-setting" ref="localeSelect">
    <div class="mdui-m-b-2">
      <label>Language:</label>
      <select v-model="$root.locale" class="mdui-select" mdui-select>
        <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short">{{
          locale.long
        }}</option>
      </select>
    </div>
    <div id="server-select" class="mdui-m-b-2">
      <label>Server:</label>
      <select v-model="$root.server" class="mdui-select" mdui-select>
        <option v-for="server in $root.servers" :key="server" :value="server">{{
          server.toUpperCase()
        }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { mutation } from 'mdui';

const localeSelect = ref();

onMounted(() => {
  mutation(localeSelect.value);
});
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
