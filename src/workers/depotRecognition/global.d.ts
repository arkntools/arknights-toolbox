import _Jimp from 'jimp';
import _ss from 'simple-statistics';
import _JSZip from 'jszip';

declare module '@jimp/core' {
  interface Jimp {
    toBase64(): Promise<string>;
  }
}

declare global {
  function OCRAD(image: ImageData, options: Object): string;

  type Jimp = _Jimp;
  const Jimp: typeof _Jimp;

  const JSZip: typeof _JSZip;

  const ss: typeof _ss;

  function getDrPkg(): _JSZip;
}
