const sortArr = (arr, key = null) => {
	// https://github.com/nodejs/node/issues/12529
	if (key) return arr.sort((a, b) => a[key].localeCompare(b[key]));
	return arr.sort((a, b) => a.localeCompare(b));
};

const sortObj = obj => {
	let keys = sortArr(Object.keys(obj));
	let sortedObj = {};

	for (let key of keys) {
		sortedObj[key] = obj[key];
	}

	return sortedObj;
};

module.exports = {
	sortArr,
	sortObj
};
