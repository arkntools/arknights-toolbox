/*eslint-disable */
const { spawnSync } = require('child_process');
const { resolve } = require('path');
const { readFileSync, writeFileSync } = require('fs-extra');

spawnSync('npm', ['run', 'build'], {
  env: {
    ...process.env,
    VUE_CLI_SERVICE_CONFIG_PATH: resolve(__dirname, '../vue.cdn.config.js'),
  },
  stdio: 'inherit',
});

console.log('Processing manifest link of index...');

const indexFile = resolve(__dirname, '../dist/index.html');
const indexContent = readFileSync(indexFile, 'utf8');
const manifestReg = /<link rel=manifest.+?>/;
if (!manifestReg.test(indexContent)) throw new Error('No manifest link');
writeFileSync(indexFile, indexContent.replace(manifestReg, '<link rel=manifest href=manifest.json>'));

console.log('Done.\n');
