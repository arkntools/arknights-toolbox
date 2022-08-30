import Vue from 'vue';
import { jQueryStatic, IMduiStatic, Dialog, Drawer, Tab } from 'mdui';

interface MduiDialogsInstance {}
interface MduiDialogsAlertOptions {
  /** 确认按钮的文本。 */
  confirmText?: string;
  /** 是否监听 hashchange 事件，为 true 时可以通过 Android 的返回键或浏览器后退按钮关闭对话框。 */
  history?: boolean;
  /** 是否模态化对话框。为 false 时点击对话框外面的区域时关闭对话框，否则不关闭。 */
  modal?: boolean;
  /** 按下 Esc 键时是否关闭对话框。 */
  closeOnEsc?: boolean;
}
interface MduiDialogsConfirmOptions extends MduiDialogsAlertOptions {
  /** 取消按钮的文本。 */
  cancelText?: string;
}
interface MduiDialogsPromptOptions extends MduiDialogsConfirmOptions {
  /** 文本框的类型。 */
  type?: 'text' | 'textarea';
  /** 最大输入字符数量 */
  maxlength?: number;
  /** 文本框的默认值 */
  defaultValue?: string;
}

class Select {
  constructor(
    selector?: string | HTMLElement,
    options?: {
      /** 选择菜单所处位置。 */
      position?: 'auto' | 'top' | 'bottom';
      /** 选择菜单距离窗口上下边框至少保持多少间距，单位为 px。该参数仅在 `position` 为 `auto` 时有效。 */
      gutter?: number;
    },
  );
  /** 打开下拉菜单。 */
  open(): void;
  /** 关闭下拉菜单。 */
  close(): void;
  /** 切换下拉菜单的打开状态。 */
  toggle(): void;
  /** 当你动态修改了 `<select>` 元素的内容时，需要调用该方法来重新生成下拉菜单。 */
  handleUpdate(): void;
  /** 返回当前下拉菜单的打开状态。 */
  getState(): 'opening' | 'opened' | 'closing' | 'closed';
}

declare module 'vue/types/vue' {
  interface Vue {
    $$: jQueryStatic;
    $mutation(selector?: string | HTMLElement, apiInit?: Function): void;
    $mutationNextTick(selector?: string | HTMLElement, apiInit?: Function): Promise<void>;
    $snackbar: IMduiStatic['snackbar'];
    $Dialog: Dialog;
    $Drawer: Drawer;
    $Tab: Tab;
    $Select: Select;
    /** 打开一个警告框 */
    $alert(
      text: string,
      onConfirm?: (e: MduiDialogsInstance) => void,
      onCancel?: (e: MduiDialogsInstance) => void,
      options?: MduiDialogsAlertOptions,
    ): MduiDialogsInstance;
    $alert(
      text: string,
      title?: string,
      onConfirm?: (e: MduiDialogsInstance) => void,
      onCancel?: (e: MduiDialogsInstance) => void,
      options?: MduiDialogsAlertOptions,
    ): MduiDialogsInstance;
    /** 打开一个提示用户确认的对话框 */
    $confirm(
      label: string,
      onConfirm?: (e: MduiDialogsInstance) => void,
      onCancel?: (e: MduiDialogsInstance) => void,
      options?: MduiDialogsConfirmOptions,
    );
    $confirm(
      label: string,
      title?: string,
      onConfirm?: (e: MduiDialogsInstance) => void,
      onCancel?: (e: MduiDialogsInstance) => void,
      options?: MduiDialogsConfirmOptions,
    );
    /** 打开一个提示用户输入的对话框 */
    $prompt(
      label: string,
      onConfirm?: (v: string, e: MduiDialogsInstance) => void,
      onCancel?: (v: string, e: MduiDialogsInstance) => void,
      options?: MduiDialogsPromptOptions,
    );
    $prompt(
      label: string,
      title?: string,
      onConfirm?: (v: string, e: MduiDialogsInstance) => void,
      onCancel?: (v: string, e: MduiDialogsInstance) => void,
      options?: MduiDialogsPromptOptions,
    );
  }
}
