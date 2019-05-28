/*eslint-disable */
const Axios = require('axios');
const Cheerio = require('cheerio');
const Fse = require('fs-extra');
const Path = require('path');

const dataURL = 'http://wiki.joyme.com/arknights/%E5%B9%B2%E5%91%98%E6%95%B0%E6%8D%AE%E8%A1%A8';

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
	17: 'characteristic'
};

function handle(r) {
	const $ = Cheerio.load(r.data, {
		decodeEntities: false
	});
	let $chars = $('#CardSelectTr tr');

	let data = [];

	for (let i = 1; i < $chars.length; i++) {
		let $infos = $($chars[i]).find('td');

		if ($($infos[18]).html().match('实装')) continue;

		let char = {};

		for (let j = 0; j < $infos.length; j++) {
			let $info = $($infos[j]);
			if (needCol[j]) char[needCol[j]] = $info.html().trim();
			switch (j) {
				case 0:
					char.link = $info.find('a').attr('href');
					char.img = $info.find('img').attr('src');
					break;
				case 1:
					char.name = $info.find('a').html().trim();
					break;
				case 7:
					char.pub = $info.html().match('公开招募') ? true : false;
					break;
				case 18:
					char.tags = $info.html().trim().split('、');
					break;
			}
		}

		char.star = parseInt(char.star);

		data.push(char);
	}

	Fse.writeJsonSync(Path.join(__dirname, '../public/data/hr.json'), data);
}

(async () => {
	while (true) {
		let success = true;

		await Axios.get(dataURL, {
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
