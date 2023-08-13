export const IS_DEV = process.env.NODE_ENV === 'development';

export const IS_MOBILE = /Mobile|Android|webOS|iPhone|iPad|Phone/i.test(navigator.userAgent);
