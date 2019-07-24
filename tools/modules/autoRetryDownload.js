/*eslint-disable */
const Axios = require('axios');
const Fse = require('fs-extra');

function saveStream2File(stream, filePath) {
	return new Promise((reslove, reject) => {
		stream.pipe(Fse.createWriteStream(filePath));
		stream.on('end', () => {
			reslove();
		});
		stream.on('error', e => {
			reject(e);
		});
	});
}

function download(url, filePath) {
	if (Fse.existsSync(filePath)) return;
	return Axios.get(url, {
		responseType: 'stream',
		headers: {
			Connection: 'keep-alive',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
		}
	}).then(r => saveStream2File(r.data, filePath)).catch(e => {
		console.log(e);
		Fse.unlinkSync(filePath);
		return download(url, filePath);
	});
}

module.exports = download;
