/*eslint-disable */
const { resolve } = require('path');
const { readFileSync, writeFileSync, readdirSync, writeJsonSync } = require('fs-extra');
const { assetsDir } = require('../vue.config');

const distDir = resolve(__dirname, '../dist');

if (process.env.HOME !== '/vercel') writeJsonSync(resolve(distDir, 'vercel.json'), { github: { enabled: false } });

if (process.env.USE_CDN !== 'true') process.exit();

console.log('Processing index.html');

const indexFile = resolve(distDir, 'index.html');
const indexContent = readFileSync(indexFile, 'utf8');
const manifestReg = /<link rel=manifest.+?>/;
if (!manifestReg.test(indexContent)) throw new Error('No manifest link');
writeFileSync(indexFile, indexContent.replace(manifestReg, '<link rel=manifest href=manifest.json>'));

console.log('Processing app.*.js');

const jsFiles = readdirSync(resolve(distDir, `${assetsDir}/js`)).filter(file => /app\.[^\/]+\.js/.test(file));
jsFiles.forEach(file => {
  const jsFile = resolve(distDir, `${assetsDir}/js`, file);
  const jsContent = readFileSync(jsFile, 'utf8');
  writeFileSync(
    jsFile,
    jsContent
      .replace(/concat\(.+?"service-worker\.js"\)/g, 'concat("service-worker.js")')
      .replace(/new Worker\(.+?(".+?")\)/g, 'new Worker($1)')
  );
});

console.log('Processing precache-manifest.js');

const precacheFile = resolve(
  distDir,
  readdirSync(distDir).find(file => file.startsWith('precache-manifest'))
);
const precacheContent = readFileSync(precacheFile, 'utf8');
writeFileSync(
  precacheFile,
  precacheContent.replace(/[^"]+index\.html/g, 'index.html').replace(/[^"]+(assets\/(?:.+?)\.worker\.js)/g, '$1')
);

console.log('Done\n');
