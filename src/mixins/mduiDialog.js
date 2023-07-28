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
 * @param {import('vue/types/v3-setup-context').EmitFn} emit
 * @param {import('vue').Ref<HTMLElement>} dialogRef
 * @param {ConstructorParameters<Dialog>['1']} [options]
 */
export const useMduiDialog = (emit, dialogRef, options) => {
  /** @type {InstanceType<Dialog>} */
  let dialog;
  let isTempClose = false;

  onMounted(() => {
    dialog = markRaw(new Dialog(dialogRef.value, { history: false, ...options }));
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

  return {
    getDialogInstance,
    ...methods,
    tempClose: (...args) => {
      isTempClose = true;
      methods.close(...args);
    },
    isTempClose: () => {
      const result = isTempClose;
      isTempClose = false;
      return result;
    },
  };
};

/**
 * @param {import('vue').Ref<ReturnType<typeof useMduiDialog>>} dialogRef
 * @returns {Record<ValueOf<Omit<typeof METHOD_NAMES, 'length'>> | 'isTempClose', Function>}
 */
export const getWrapper = dialogRef =>
  _.fromPairs(
    [...METHOD_NAMES, 'isTempClose'].map(name => [
      name,
      (...args) => dialogRef.value?.[name](...args),
    ]),
  );
