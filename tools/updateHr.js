/*eslint-disable */
const get = require('./autoRetryGet');
const Cheerio = require('cheerio');
const pinyin = require("pinyin");
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const joymeURL = 'http://wiki.joyme.com/arknights/%E5%B9%B2%E5%91%98%E6%95%B0%E6%8D%AE%E8%A1%A8';

const needCol = {
	//2: 'camp',
	3: 'job',
	4: 'star',
	5: 'sex',
	/*7: 'gain',
	12: 'redeploy',
	13: 'cost',
	14: 'pcost',
	15: 'stop',
	16: 'speed',*/
	17: 'memo'
};

get(joymeURL).then(r => {
	const $ = Cheerio.load(r, {
		decodeEntities: false
	});
	let $chars = $('#CardSelectTr tr');

	let data = [];
	let imgs = {};

	for (let i = 1; i < $chars.length; i++) {
		let $infos = $($chars[i]).find('td');

		if ($($infos[18]).text().match('实装')) continue;

		let char = {};

		for (let j = 0; j < $infos.length; j++) {
			let $info = $($infos[j]);
			if (needCol[j]) char[needCol[j]] = $info.text().trim();
			switch (j) {
				case 0:
					let src = $info.find('img').attr('src').split('/');
					char.img = src[src.length - 1];
					break;
				case 1:
					char.name = $info.find('a').text().trim();
					break;
				case 7:
					char.pub = $info.text().match('公开招募') ? true : false;
					break;
				case 18:
					char.tags = $info.text().trim().split('、');
					break;
			}
		}

		let fullPY = pinyin(char.name, {
			style: pinyin.STYLE_NORMAL,
			segment: true
		});
		let headPY = pinyin(char.name, {
			style: pinyin.STYLE_FIRST_LETTER,
			segment: true
		});

		char.star = parseInt(char.star);
		imgs[char.name] = {
			img: char.img,
			full: _.flatten(fullPY).join(''),
			head: _.flatten(headPY).join('')
		};
		delete char.img;

		data.push(char);
	}

	Fse.writeJsonSync(Path.join(__dirname, '../src/data/hr.json'), data);
	Fse.writeJsonSync(Path.join(__dirname, '../src/data/addition.json'), imgs);

	console.log('Success.');
});
