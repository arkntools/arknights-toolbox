/*eslint-disable */
const Axios = require('axios');

function get(url) {
	return Axios.get(url, {
		headers: {
			Connection: 'keep-alive',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
		}
	}).then(r => r.data).catch(() => {
		console.log('Retry.');
		return get(url);
	});
}

module.exports = get;
