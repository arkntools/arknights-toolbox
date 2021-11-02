import snackbar from '@/utils/snackbar';
import i18n from '../i18n';

const Permission = {
  WRITE: 'clipboard-write',
  READ: 'clipboard-read',
};

const showError = (...args) => snackbar({ message: i18n.t(...args), timeout: 6000 });

// TODO: Firefox 87 support clipboard
export const requestPermission = async (name, silence = true) => {
  try {
    if (!(navigator && 'permissions' in navigator && 'clipboard' in navigator)) {
      if (!silence) showError('common.clipboard.notSupport', { name });
      return false;
    }
    const permission = (await navigator.permissions.query({ name })).state;
    if (!(permission === 'granted' || permission === 'prompt')) {
      if (!silence) showError('common.clipboard.permissionDenied', { name });
      return false;
    }
  } catch (e) {
    // eslint-disable-next-line
    console.error(e);
    if (!silence) showError('common.clipboard.notSupport', { name });
    return false;
  }
  return true;
};

/*! clipboard-copy. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
const copyExecCommand = text => {
  // Put the text to copy into a <span>
  const span = document.createElement('span');
  span.textContent = text;

  // Preserve consecutive spaces and newlines
  span.style.whiteSpace = 'pre';
  span.style.userSelect = 'all';

  // Add the <span> to the page
  document.body.appendChild(span);

  // Make a selection object representing the range of text selected by the user
  const selection = window.getSelection();
  const range = window.document.createRange();
  selection.removeAllRanges();
  range.selectNode(span);
  selection.addRange(range);

  // Copy text to the clipboard
  let success = false;
  try {
    success = window.document.execCommand('copy');
  } finally {
    // Cleanup
    selection.removeAllRanges();
    window.document.body.removeChild(span);
  }

  return success;
};

export const setText = async txt => {
  if (await requestPermission(Permission.WRITE)) {
    try {
      await navigator.clipboard.writeText(txt);
      return true;
    } catch (e) {
      // eslint-disable-next-line
      console.error(e);
    }
  }
  const success = copyExecCommand(txt);
  if (!success) showError('common.clipboard.notSupport', { name: Permission.WRITE });
  return success;
};

export const isPastePressed = ({ ctrlKey, metaKey, keyCode }) => {
  if (keyCode !== 86) return false;
  if (ctrlKey || (navigator?.platform?.startsWith('Mac') && metaKey)) return true;
  return false;
};

export const readImg = async () => {
  if (!(await requestPermission(Permission.READ, false))) return;
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
      return new Blob([blob], { type: imgTypes[0] });
    }
  }
};
