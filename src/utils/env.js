export const IS_DEV = process.env.NODE_ENV === 'development';

export const IS_MOBILE = /Mobile|Android|Phone|iPad|webOS/.test(navigator.userAgent);

export const IS_IOS = /iPhone|iPad/.test(navigator.userAgent);
