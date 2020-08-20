import _ from 'lodash';

export const requestPermission = async name => {
  if (!(navigator && 'permissions' in navigator && 'clipboard' in navigator)) return false;
  const permission = (await navigator.permissions.query({ name })).state;
  if (!(permission === 'granted' || permission === 'prompt')) return false;
  return true;
};

export const setText = async txt => {
  if (await requestPermission('clipboard-write')) {
    navigator.clipboard.writeText(txt);
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
  const items = await navigator.clipboard.read();
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
