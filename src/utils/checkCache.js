let runtimeCache = null;

const loadRuntimeCache = async () => {
  const runtimeCacheKey = (await caches.keys()).find(key => key.includes('-runtime-'));
  runtimeCache = await caches.open(runtimeCacheKey);
};

export const checkCache = async urls => {
  if (!('caches' in window)) return urls.map(() => false);
  if (!runtimeCache) await loadRuntimeCache();
  const results = await Promise.all(urls.map(url => runtimeCache.match(url)));
  return results.map(r => !!r);
};
