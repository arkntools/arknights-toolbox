<template>
  <div class="mdui-dialog" ref="dialog"><slot></slot></div>
</template>

<script>
const EVENT_NAMES = ['open', 'opened', 'close', 'closed', 'cancel', 'confirm'];
const METHOD_NAMES = ['open', 'close', 'toggle', 'getState', 'destroy', 'handleUpdate'];

export default {
  name: 'mdui-dialog',
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    const dialog = new this.$Dialog(this.$refs.dialog, { history: false, ...this.options });
    METHOD_NAMES.forEach(name =>
      Object.defineProperty(this, name, {
        value: dialog[name].bind(dialog),
        writable: false,
      }),
    );
    const $dialog = this.$$(this.$refs.dialog);
    EVENT_NAMES.forEach(name => $dialog.on(`${name}.mdui.dialog`, this.$emit.bind(this, name)));
  },
  beforeDestroy() {
    this.destroy();
    this.$$(this.$refs.dialog).off('.mdui.dialog');
  },
};
</script>
