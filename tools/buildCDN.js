/*eslint-disable */
const { spawnSync } = require('child_process');
const { resolve } = require('path');
const { readFileSync, writeFileSync, readdirSync } = require('fs-extra');
const { assetsDir } = require('../vue.config');

spawnSync('npm', ['run', 'build'], {
  shell: true,
  env: {
    ...process.env,
    VUE_CLI_SERVICE_CONFIG_PATH: resolve(__dirname, '../vue.cdn.config.js'),
  },
  stdio: 'inherit',
});

console.log('Processing manifest link of index');

const indexFile = resolve(__dirname, '../dist/index.html');
const indexContent = readFileSync(indexFile, 'utf8');
const manifestReg = /<link rel=manifest.+?>/;
if (!manifestReg.test(indexContent)) throw new Error('No manifest link');
writeFileSync(indexFile, indexContent.replace(manifestReg, '<link rel=manifest href=manifest.json>'));

console.log('Processing service worker link of app.js');

const jsFiles = readdirSync(resolve(__dirname, `../dist/${assetsDir}/js`)).filter(file => /app.[^.]+.js/.test(file));
jsFiles.forEach(file => {
  const jsFile = resolve(__dirname, `../dist/${assetsDir}/js`, file);
  const jsContent = readFileSync(jsFile, 'utf8');
  writeFileSync(jsFile, jsContent.replace(/concat\(.*?"service-worker\.js"\)/g, 'concat("service-worker.js")'));
});

console.log('Done\n');
