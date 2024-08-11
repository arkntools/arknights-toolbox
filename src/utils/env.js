export const IS_DEV = process.env.NODE_ENV === 'development';

export const IS_MOBILE = /Mobile|Android|Phone|iPad|webOS/.test(navigator.userAgent);

export const IS_IOS = /iPhone|iPad/.test(navigator.userAgent);

export const JSON_STORAGE_SERVER = process.env.VUE_APP_JSON_STORAGE_SERVER;

export const PROXY_SERVER = process.env.VUE_APP_PROXY_SERVER;
