import { dialog } from 'mdui';
import snackbar from '@/utils/snackbar';
import i18n from '@/i18n';

export class Snackbar {
  constructor(msgKey) {
    this.msgKey = msgKey;
  }
  open() {
    if (this.inst) return;
    this.inst = snackbar({
      message: i18n.t(this.msgKey),
      closeOnOutsideClick: false,
      timeout: 0,
    });
  }
  close() {
    if (!this.inst) return;
    this.inst.close();
    this.inst = null;
  }
}

/** @returns {Promise<boolean>} */
export const loadConfirmLoading = async size =>
  new Promise(resolve => {
    dialog({
      title: i18n.t('common.notice'),
      content: i18n.t('hr.ocr.loadingConfirm', { size }),
      history: false,
      buttons: [
        {
          text: i18n.t('common.no'),
          onClick: () => resolve(false),
        },
        {
          text: i18n.t('common.yes'),
          onClick: () => resolve(true),
        },
      ],
    });
  });
