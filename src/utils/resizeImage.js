/*
https://github.com/ericnograles/browser-image-resizer

Copyright (c) 2017-2021 Eric Nograles and others

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { initializeOrGetImg } from 'browser-image-resizer/src/browser_operations';
import { scaleImage } from 'browser-image-resizer/src/scaling_operations';

const DEFAULT_CONFIG = {
  quality: 0.9,
  maxWidth: 1920,
  maxHeight: 1080,
  debug: false,
  mimeType: 'image/jpeg',
};

export default (file, userConfig) =>
  new Promise((resolve, reject) => {
    const img = initializeOrGetImg();
    const reader = new FileReader();
    const config = Object.assign({}, DEFAULT_CONFIG, userConfig);

    reader.onload = e => {
      img.src = e.target.result;
      img.onload = () => {
        try {
          const blob = scaleImage({ img, config });
          resolve(blob);
        } catch (err) {
          reject(err);
        }
      };
    };

    try {
      reader.readAsDataURL(file);
    } catch (err) {
      reject(err);
    }
  });
