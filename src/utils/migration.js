import { Base64 } from 'js-base64';
import { each, transform } from 'lodash';

export const [BEFORE_HOST = '', AFTER_HOST = ''] = String(
  process.env.VUE_APP_MIGRATE_CONFIG || '',
).split(',');

export const SHOULD_MIGRATE = window.location.host === BEFORE_HOST;

const getLocalStorageBase64 = (() => {
  let cache;
  const get = () => {
    const prefixes = ['home', 'ireneCalc', 'depot', 'hr', 'level', 'riic', 'material'];
    const keys = Object.keys(window.localStorage || {}).filter(key =>
      prefixes.some(p => key.startsWith(`${p}.`)),
    );
    if (!keys.length) return '';

    const data = transform(
      keys,
      (obj, key) => {
        obj[key] = window.localStorage.getItem(key);
      },
      {},
    );

    return Base64.encodeURI(JSON.stringify(data));
  };
  return () => {
    if (cache !== undefined) return cache;
    cache = get();
    return cache;
  };
})();

const restoreLocalStorageFromBase64 = b64 => {
  const data = JSON.parse(Base64.decode(b64));
  each(data, (v, k) => {
    window.localStorage.setItem(k, v);
  });
};

export const confirmMigration = () => {
  const data = getLocalStorageBase64();
  window.open(`https://${AFTER_HOST}/${data ? `#/?migrate=${data}` : ''}`);
  window.close();
};

export const processMigration = () => {
  if (!window.location.href.includes('/#/?migrate=')) return;
  try {
    const url = new URL(window.location.href.replace('/#/', '/'));
    const data = url.searchParams.get('migrate');
    restoreLocalStorageFromBase64(data);
    window.history.replaceState(
      window.history.state,
      '',
      window.location.href.replace(/\?migrate=.*/, ''),
    );
  } catch (error) {
    console.error(error);
  }
};

try {
  if (SHOULD_MIGRATE && !getLocalStorageBase64() && AFTER_HOST) {
    window.location.replace(window.location.href.replace(BEFORE_HOST, AFTER_HOST));
  } else {
    processMigration();
  }
} catch (error) {
  console.error(error);
}
