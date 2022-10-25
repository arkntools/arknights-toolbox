import { defineComponent } from 'vue';

const EVENT_NAMES = ['open', 'opened', 'close', 'closed', 'cancel', 'confirm'];
const METHOD_NAMES = ['open', 'close', 'toggle', 'getState', 'destroy', 'handleUpdate'];

export default defineComponent({
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    dialog: null,
  }),
  mounted() {
    this.dialog = new this.$Dialog(this.$refs.dialog, { history: false, ...this.options });
    METHOD_NAMES.filter(name => !(name in this)).forEach(
      name => (this[name] = this.dialog[name].bind(this.dialog)),
    );
    const $dialog = this.$$(this.$refs.dialog);
    EVENT_NAMES.forEach(name => $dialog.on(`${name}.mdui.dialog`, this.$emit.bind(this, name)));
  },
  beforeDestroy() {
    this.destroy();
    this.$$(this.$refs.dialog).off('.mdui.dialog');
  },
});
