import _ from 'lodash';
import snackbar from '@/utils/snackbar';
import i18n from '../i18n';

const showError = (...args) => snackbar({ message: i18n.t(...args), timeout: 6000 });

// TODO: Firefox 87 support clipboard
export const requestPermission = async name => {
  try {
    if (!(navigator && 'permissions' in navigator && 'clipboard' in navigator)) {
      showError('common.clipboard.notSupport', { name });
      return false;
    }
    const permission = (await navigator.permissions.query({ name })).state;
    if (!(permission === 'granted' || permission === 'prompt')) {
      showError('common.clipboard.permissionDenied', { name });
      return false;
    }
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
    showError('common.clipboard.notSupport', { name });
    return false;
  }
  return true;
};

export const setText = async txt => {
  if (await requestPermission('clipboard-write')) {
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
      showError('common.clipboard.writeFailed');
    }
    return true;
  }
  return false;
};

export const isPastePressed = ({ ctrlKey, metaKey, keyCode }) => {
  if (keyCode !== 86) return false;
  if (ctrlKey || (navigator?.platform?.startsWith('Mac') && metaKey)) return true;
  return false;
};

export const readImg = async () => {
  if (!(await requestPermission('clipboard-read'))) return;
  const items = await navigator.clipboard.read().catch(e => {
    // eslint-disable-next-line
    console.error(e);
    if (e.name === 'DataError') showError('common.clipboard.readDataError');
    else showError('common.clipboard.readFailed');
    return [];
  });
  for (const item of items) {
    const imgTypes = item.types.filter(type => type.startsWith('image/'));
    if (imgTypes.length > 0) {
      const blob = await item.getType(imgTypes[0]);
      return new File([blob], `clipboard-${Date.now()}.${_.last(imgTypes[0].split('/'))}`, {
        type: imgTypes[0],
      });
    }
  }
};
