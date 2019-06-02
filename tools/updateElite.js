/*eslint-disable */
const get = require('./autoRetryGet');
const Cheerio = require('cheerio');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const joymeURL = 'http://wiki.joyme.com/arknights/%E5%B9%B2%E5%91%98%E6%95%B0%E6%8D%AE%E8%A1%A8';
const materials = _.map(Fse.readJsonSync(Path.join(__dirname, '../public/data/material.json')), m => m.name);

get(joymeURL).then(r => {
	const $ = Cheerio.load(r, { decodeEntities: false });
	let $chars = $('#CardSelectTr tr');

	let links = [];

	for (let i = 1; i < $chars.length; i++) {
		let $infos = $($chars[i]).find('td');

		if ($($infos[18]).text().match('实装')) continue;

		let link = $($infos[0]).find('a').attr('href');
		let name = $($infos[1]).find('a').text().trim();

		links.push({
			name,
			link
		});
	}

	console.log('Success [list].');

	return links;

}).then(async links => {
	let eliteMaterials = {};

	for (let { link, name } of links) {
		const $ = Cheerio.load(await get(`http://wiki.joyme.com${link}`), { decodeEntities: false });
		let $elites = $('table:contains("精英化"):contains("消耗材料") tr:contains("消耗材料") + tr');

		let elites = [];

		for (let i = 0; i < $elites.length; i++) {
			let $needs = $($elites[i]).find('td');
			let need = {};

			for (let j = 0; j < $needs.length; j++) {
				let search = /【(.+)】(.+)/.exec($($needs[j]).text().trim());
				if (!search || !materials.includes(search[1])) continue;
				need[search[1]] = parseInt(search[2]);
			}

			if (_.size(need) == 0) continue;

			elites.push(need);
		}

		let $skills1 = $('table:contains("提升等级") tr:contains("→")');
		let $skills2 = $('table:contains("提升等级") tr:contains("→") + tr');

		let skills = [];

		for (let i = 0; i < $skills1.length; i++) {
			let $skill1 = $($skills1[i]);
			let skill = $skill1.children('th').text().trim().split(' ');
			if (skill.length < 2) continue;

			let need = {};

			let $needs = $skill1.find('center');
			let needsNums = $($skills2[i]).text().trim().split('、');

			for (let j = 0; j < $needs.length; j++) {
				let mName = $($needs[j]).text().trim();
				if (!materials.includes(mName)) continue;
				need[mName] = parseInt(needsNums[j]);
			}

			if (_.size(need) == 0) continue;

			skills.push({
				name: skill[0],
				level: skill[1],
				need
			});
		}

		if (elites.length == 0 && skills.length == 0) continue;

		eliteMaterials[name] = {
			elites,
			skills
		};

		console.log(`Success [${name}].`);
	}

	Fse.writeJsonSync(Path.join(__dirname, '../public/data/elite.json'), eliteMaterials);

	console.log('Success.');
});
