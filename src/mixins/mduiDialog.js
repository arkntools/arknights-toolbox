import _ from 'lodash';
import { defineComponent, markRaw, onBeforeUnmount, onMounted } from 'vue';
import { JQ as $, Dialog } from 'mdui';

const EVENT_NAMES = Object.freeze(
  /** @type {const} */ (['open', 'opened', 'close', 'closed', 'cancel', 'confirm']),
);
const METHOD_NAMES = Object.freeze(
  /** @type {const} */ (['open', 'close', 'toggle', 'getState', 'destroy', 'handleUpdate']),
);

export const MduiDialogMixin = defineComponent({
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

export const MDUI_DIALOG_PROPS = {
  options: {
    type: Object,
    default: () => ({}),
  },
};

export const MDUI_DIALOG_EMITS = EVENT_NAMES;

/**
 * @template T
 * @typedef {T[keyof T]} ValueOf<T>
 */

/**
 * @param {Readonly<import('vue').ExtractPropTypes<typeof MDUI_DIALOG_PROPS>>} props
 * @param {import('vue/types/v3-setup-context').EmitFn} emit
 * @param {import('vue').Ref<HTMLElement>} dialogRef
 */
export const useMduiDialog = (props, emit, dialogRef) => {
  /** @type {InstanceType<Dialog>} */
  let dialog;

  onMounted(() => {
    dialog = markRaw(new Dialog(dialogRef.value, { history: false, ...props.options }));
    const $dialog = $(dialogRef.value);
    EVENT_NAMES.forEach(name =>
      $dialog.on(`${name}.mdui.dialog`, (...args) => emit(name, ...args)),
    );
  });

  onBeforeUnmount(() => {
    dialog.destroy();
    $(dialogRef.value).off('.mdui.dialog');
  });

  const getDialogInstance = () => dialog;
  /** @type {Record<ValueOf<Omit<typeof METHOD_NAMES, 'length'>>, Function>} */
  const methods = _.fromPairs(METHOD_NAMES.map(name => [name, (...args) => dialog[name](...args)]));

  return { getDialogInstance, ...methods };
};
