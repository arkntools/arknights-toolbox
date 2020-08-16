import configure from '@jimp/custom';

import jpeg from '@jimp/jpeg';
import png from '@jimp/png';

import circle from '@jimp/plugin-circle';
import color from '@jimp/plugin-color';
import crop from '@jimp/plugin-crop';
import invert from '@jimp/plugin-invert';
import resize from '@jimp/plugin-resize';
import threshold from '@jimp/plugin-threshold';

export default configure({
  types: [jpeg, png],
  plugins: [circle, color, crop, invert, resize, threshold],
});
