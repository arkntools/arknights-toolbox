export default (str, defaultVal = {}) => {
  if (!str || typeof str !== 'string') return defaultVal;
  try {
    return JSON.parse(str);
  } catch (error) {
    // eslint-disable-next-line
    console.error(error);
  }
  return defaultVal;
};
