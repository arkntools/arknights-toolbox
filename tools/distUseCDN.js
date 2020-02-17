require('dotenv').config();
const Path = require('path');
const Fse = require('fs-extra');
const _ = require('lodash');
const { assetsDir } = require('../vue.config');

const distDir = Path.resolve(__dirname, '../dist');

const precacheFile = Path.join(
  distDir,
  _.find(Fse.readdirSync(distDir), file => file.startsWith('precache-manifest'))
);
const precacheContent = Fse.readFileSync(precacheFile, 'utf8');
Fse.writeFileSync(
  precacheFile,
  precacheContent.replace(
    /\);$/,
    `.map(o => ({ ...o, url: o.url.replace(/^assets\\//, 'https://cdn.jsdelivr.net/gh/${process.env.VUE_APP_REPOSITORY}/assets/')})));/*CDN*/`
  )
);

const indexFile = Path.join(distDir, 'index.html');
const indexContent = Fse.readFileSync(indexFile, 'utf8');
Fse.writeFileSync(
  indexFile,
  indexContent.replace(
    /(href|src)=assets\//g,
    `$1=https://cdn.jsdelivr.net/gh/${process.env.VUE_APP_REPOSITORY}/assets/`
  )
);

const jsFiles = Fse.readdirSync(Path.join(distDir, `${assetsDir}/js`)).filter(file => file.startsWith('app.'));
jsFiles.forEach(file => {
  const jsFile = Path.join(distDir, `${assetsDir}/js`, file);
  const jsContent = Fse.readFileSync(jsFile, 'utf8');
  Fse.writeFileSync(
    jsFile,
    jsContent.replace(
      new RegExp(`\\+"${assetsDir}/`, 'g'),
      `+"https://cdn.jsdelivr.net/gh/${process.env.VUE_APP_REPOSITORY}/assets/`
    )
  );
});
