/*eslint-disable */
const get = require('./autoRetryGet');
const Cheerio = require('cheerio');
const Fse = require('fs-extra');
const Path = require('path');

const joymeURL = 'http://wiki.joyme.com/arknights/%E6%9D%90%E6%96%99';
const grauenekoURL = 'https://graueneko.github.io/akmaterial.json';

get(joymeURL).then(async r => {
	const $ = Cheerio.load(r, {
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

	let data = await get(grauenekoURL);

	for (let material of data) {
		delete material.id;
		material.rare = material.level;
		delete material.level;
		material.img = imgs[material.name] || '';
	}

	Fse.writeJsonSync(Path.join(__dirname, '../public/data/material.json'), data);
});
