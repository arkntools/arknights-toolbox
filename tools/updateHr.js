/*eslint-disable */
const get = require('./modules/autoRetryGet');
const download = require('./modules/autoRetryDownload');
const cnSort = require('./modules/cnSort');
const Cheerio = require('cheerio');
const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const avatarDir = Path.join(__dirname, '../public/assets/img/avatar');
const joymeURL = 'http://wiki.joyme.com/arknights/%E5%B9%B2%E5%91%98%E6%95%B0%E6%8D%AE%E8%A1%A8';

const JSON_HR = Path.join(__dirname, '../src/data/hr.json');
const JSON_ADDITION = Path.join(__dirname, '../src/data/addition.json');

const needCol = {
    // 2: 'camp',
    3: 'job',
    4: 'star',
    5: 'sex',
    // 7: 'gain',
    // 12: 'redeploy',
    // 13: 'cost',
    // 14: 'pcost',
    // 15: 'stop',
    // 16: 'speed',
    17: 'memo',
};

get(joymeURL).then(async r => {
    const $ = Cheerio.load(r, {
        decodeEntities: false,
    });
    const $chars = $('#CardSelectTr tr');

    const data = [];
    const addition = {};

    for (let i = 1; i < $chars.length; i++) {
        const $infos = $($chars[i]).find('td');

        if (
            $($infos[7])
                .text()
                .trim().length === 0 ||
            $($infos[18])
                .text()
                .match('实装')
        )
            continue;

        const char = {};
        let img = '';
        let imgExt = '';

        for (let j = 0; j < $infos.length; j++) {
            const $info = $($infos[j]);
            if (needCol[j]) char[needCol[j]] = $info.text().trim();
            switch (j) {
                case 0:
                    img = $info.find('img').attr('src');
                    if (img) {
                        const tmp = img.split('.');
                        imgExt = tmp[tmp.length - 1];
                    }
                    break;
                case 1:
                    char.name = $info
                        .find('a')
                        .text()
                        .trim();
                    break;
                case 7:
                    char.pub = $info.text().match('公开招募') ? true : false;
                    break;
                case 18:
                    const tags = $info.text().trim();
                    if (tags.length > 0) char.tags = tags.split(/、| /);
                    else char.tags = [];
                    break;
            }
        }

        let check = true;
        for (const field of _.values(_.pick(char, ['job', 'sex']))) {
            if (_.size(field) == 0) {
                check = false;
                break;
            }
        }

        const fullPY = pinyin(char.name, {
            style: pinyin.STYLE_NORMAL,
            segment: true,
        });
        const headPY = pinyin(char.name, {
            style: pinyin.STYLE_FIRST_LETTER,
            segment: true,
        });

        const full = _.flatten(fullPY).join('');
        const head = _.flatten(headPY).join('');

        addition[char.name] = {
            img: imgExt || null,
            full,
            head,
        };

        if (!check) continue;

        console.log(`Download ${img} as ${full}.${imgExt}`);
        await download(img, Path.join(avatarDir, `${full}.${imgExt}`));

        char.star = parseInt(char.star);

        data.push(char);
    }

    if (!_.isEqual(Fse.readJsonSync(JSON_HR), cnSort.sortArr(data, 'name'))) {
        console.log('Update hr.');
        Fse.writeJsonSync(JSON_HR, data);
    }
    if (!_.isEqual(Fse.readJsonSync(JSON_ADDITION), cnSort.sortObj(addition))) {
        console.log('Update addition.');
        Fse.writeJsonSync(JSON_ADDITION, addition);
    }

    require('./updateTimestamp');

    console.log('Success.');
});
