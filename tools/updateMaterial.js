/*eslint-disable */
const Axios = require('axios');
const Cheerio = require('cheerio');
const Fse = require('fs-extra');
const Path = require('path');

const joymeURL = 'http://wiki.joyme.com/arknights/%E6%9D%90%E6%96%99';
const grauenekoURL = 'https://graueneko.github.io/akmaterial.json';

async function handle(r) {
	const $ = Cheerio.load(r.data, {
		decodeEntities: false
	});
	let $materials = $($('#mw-content-text>.wikitable')[2]).find('tr');

	let imgs = {};

	for (let i = 1; i < $materials.length; i++) {
		let $infos = $($materials[i]).find('td');

		let img = $($infos[0]).find('img').attr('src');
		let name = $($infos[1]).text().trim();

		imgs[name] = img;
	}

	let data = await Axios.get(grauenekoURL).then(ret => ret.data);

	for (let material of data) {
		delete material.id;
		material.rare = material.level;
		delete material.level;
		material.img = imgs[material.name] || '';
	}

	Fse.writeJsonSync(Path.join(__dirname, '../public/data/material.json'), data);
}

(async () => {

	while (true) {
		let success = true;

		await Axios.get(joymeURL, {
				headers: {
					Connection: 'keep-alive',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
				}
			})
			.then(handle)
			.catch(() => {
				console.log('Retry.');
				success = false;
			});

		if (success) {
			console.log('Success.');
			break;
		}
	}
})();
