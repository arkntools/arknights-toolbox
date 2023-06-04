<template>
  <div id="lang-server-setting" ref="localeSelect">
    <div class="mdui-m-b-2">
      <label>Language:</label>
      <select
        v-model="locale"
        class="mdui-select"
        mdui-select
        @[mduiSelectClosedEventName]="changeLocale"
      >
        <option v-for="locale in $root.locales" :key="locale.short" :value="locale.short">{{
          locale.long
        }}</option>
      </select>
    </div>
    <div id="server-select" class="mdui-m-b-2">
      <label>Server:</label>
      <select
        v-model="server"
        class="mdui-select"
        mdui-select
        @[mduiSelectClosedEventName]="changeServer"
      >
        <option v-for="server in $root.servers" :key="server" :value="server">{{
          server.toUpperCase()
        }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import { mutation } from 'mdui';

export default defineComponent({
  setup() {
    const mduiSelectClosedEventName = 'closed.mdui.select';

    const localeSelect = ref();

    onMounted(() => {
      mutation(localeSelect.value);
    });

    return {
      mduiSelectClosedEventName,
    };
  },
  data() {
    return {
      locale: this.$root.locale,
      server: this.$root.server,
    };
  },
  methods: {
    changeLocale() {
      this.$root.locale = this.locale;
    },
    changeServer() {
      this.$root.server = this.server;
    },
  },
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
