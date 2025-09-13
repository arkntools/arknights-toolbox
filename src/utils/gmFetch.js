import { readonly, ref } from 'vue';
import lib from '@arkntools/userscript-extension';

export const useGmAvailable = () => {
  const available = ref(lib.available());
  if (!available.value) {
    lib.waitAvailable().then(() => {
      available.value = true;
    });
  }
  return readonly(available);
};

export const gmAvailable = () => lib.available();

/**
 * @param {string} url
 * @param {Pick<RequestInit, 'method' | 'headers' | 'body'>} options
 * @returns
 */
export const gmJsonFetch = (url, { method, headers, body } = {}) => {
  if (!lib.available()) throw new Error('ArknTools extension is not available');
  return new Promise((resolve, reject) => {
    lib.request({
      url,
      method,
      headers,
      data: body,
      fetch: true,
      responseType: 'json',
      onload: res => resolve(res.response),
      onerror: res => reject(res.error),
    });
  });
};
