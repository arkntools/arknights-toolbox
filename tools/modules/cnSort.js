const sortArr = (arr, key = null) => {
  // https://github.com/nodejs/node/issues/12529
  if (key) return arr.sort((a, b) => a[key].localeCompare(b[key]));
  return arr.sort((a, b) => a.localeCompare(b));
};

const sortObj = obj => {
  const keys = sortArr(Object.keys(obj));
  const sortedObj = {};

  for (const key of keys) {
    sortedObj[key] = obj[key];
  }

  return sortedObj;
};

module.exports = {
  sortArr,
  sortObj,
};
