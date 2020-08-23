export const PNG1P =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const TAG_BTN_COMMON_COLOR = {
  notSelected: ['mdui-color-brown-100 mdui-ripple-black', 'mdui-color-grey-900'],
  selected: ['mdui-color-grey-800', 'mdui-color-brown-100 mdui-ripple-black'],
};

export const HR_TAG_BTN_COLOR = {
  ...TAG_BTN_COMMON_COLOR,
  6: ['mdui-color-red-700', 'mdui-color-red-200 mdui-ripple-black'],
  5: ['mdui-color-orange-900', 'mdui-color-orange-200 mdui-ripple-black'],
  4: ['mdui-color-cyan-700', 'mdui-color-cyan-200 mdui-ripple-black'],
  3: ['mdui-color-green-700', 'mdui-color-green-200 mdui-ripple-black'],
  2: ['mdui-color-brown-700', 'mdui-color-brown-200 mdui-ripple-black'],
  1: ['mdui-color-grey-700', 'mdui-color-grey-200 mdui-ripple-black'],
  text: {
    6: ['mdui-text-color-red-700', 'mdui-text-color-red-200'],
    5: ['mdui-text-color-orange-900', 'mdui-text-color-orange-200'],
    4: ['mdui-text-color-cyan-700', 'mdui-text-color-cyan-200'],
    3: ['mdui-text-color-green-700', 'mdui-text-color-green-200'],
    2: ['mdui-text-color-brown-700', 'mdui-text-color-brown-200'],
    1: ['mdui-text-color-grey-700', 'mdui-text-color-grey-200'],
  },
};

export const MATERIAL_TAG_BTN_COLOR = {
  ...TAG_BTN_COMMON_COLOR,
  5: ['mdui-color-yellow-700', 'mdui-color-yellow-200 mdui-ripple-black'],
  4: ['mdui-color-deep-purple-300', 'mdui-color-deep-purple-200 mdui-ripple-black'],
  3: ['mdui-color-blue-600', 'mdui-color-blue-200 mdui-ripple-black'],
  2: ['mdui-color-lime', 'mdui-color-lime-200 mdui-ripple-black'],
  1: ['mdui-color-grey-700', 'mdui-color-grey-200 mdui-ripple-black'],
  SYNT: ['mdui-color-orange-900', 'mdui-color-orange-300'],
  ALWAYS: ['mdui-color-grey-900', 'mdui-color-grey-200'],
  ALMOST: ['mdui-color-grey-700', 'mdui-color-grey-400'],
  USUAL: ['mdui-color-grey-500', 'mdui-color-grey-600'],
  OFTEN: ['mdui-color-grey-300', 'mdui-color-grey-800'],
  SOMETIMES: ['mdui-color-red-900', 'mdui-color-red-200'],
};

export const RIIC_TAG_BTN_COLOR = {
  ...TAG_BTN_COMMON_COLOR,
  BUILDING: TAG_BTN_COMMON_COLOR.selected,
  MANUFACTURE: ['mdui-color-amber-400', 'mdui-color-amber-300'],
  TRADING: ['mdui-color-light-blue-700', 'mdui-color-light-blue-300'],
  POWER: ['mdui-color-green-600', 'mdui-color-green-300'],
  CONTROL: ['mdui-color-green-900', 'mdui-color-green-300'],
  DORMITORY: ['mdui-color-cyan-300', 'mdui-color-cyan-200'],
  MEETING: ['mdui-color-orange-900', 'mdui-color-orange-300'],
  WORKSHOP: ['mdui-color-lime-400', 'mdui-color-lime-300'],
  TRAINING: ['mdui-color-red-900', 'mdui-color-red-300'],
  HIRE: ['mdui-color-grey-700', 'mdui-color-grey-300'],
};
