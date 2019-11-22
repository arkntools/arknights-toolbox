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
const materialData = Fse.readJsonSync(Path.join(__dirname, '../src/data/material.json'));
const materials = _.map(materialData, m => m.name);
const materialPinyin = _.transform(
    materialData,
    (o, { name, pinyin }) => {
        o[pinyin] = name;
    },
    {}
);

const JSON_HR = Path.join(__dirname, '../src/data/hr.json');
const JSON_ADDITION = Path.join(__dirname, '../src/data/addition.json');
const JSON_ELITE = Path.join(__dirname, '../src/data/elite.json');
const JSON_BASE_SKILL = Path.join(__dirname, '../src/data/baseSkill.json');

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

const hrNeed = {
    // name: '干员代号',
    job: '职业',
    star: '星级',
    sex: '性别',
    pub: '获取途径',
    memo: '特性',
    tags: '标签',
};

function getPinyin(word, style = pinyin.STYLE_NORMAL) {
    const fullPY = pinyin(word, {
        style,
        segment: true,
    });
    return _.flatten(fullPY)
        .join('')
        .toLowerCase();
}

get(joymeURL).then(async r => {
    const $list = Cheerio.load(r, {
        decodeEntities: false,
    });
    const $chars = $list('#CardSelectTr tr');

    const data = [];
    const addition = {};

    for (let i = 1; i < $chars.length; i++) {
        const $infos = $list($chars[i]).find('td');

        // 跳过未实装干员
        if (
            $list($infos[7])
                .text()
                .trim().length === 0 ||
            $list($infos[18])
                .text()
                .match('实装')
        )
            continue;

        const char = {};

        // 获取头像和名字
        const name = $list($infos[1])
            .find('a')
            .text()
            .trim();
        char.name = name;
        const [full, head] = [getPinyin(name), getPinyin(name, pinyin.STYLE_FIRST_LETTER)];
        addition[name] = { full, head };
        const img = $list($infos[0])
            .find('img')
            .attr('src');
        if (img) {
            const imgExt = _.last(img.split('.'));
            addition[name].imgExt = imgExt;
            await download(img, Path.join(avatarDir, `${full}.${imgExt}`), `Download ${img} as ${full}.${imgExt}`);
        }

        // 获取详细信息
        const $detail = Cheerio.load(await get(`http://wiki.joyme.com/arknights/index.php?title=${encodeURIComponent(name)}&action=edit`), {
            decodeEntities: false,
        });
        const data = _.transform(
            $detail('#wpTextbox1')
                .text()
                .split('\n')
                .map(code => code.trim())
                .filter(code => code.startsWith('|') && !code.endsWith('=')),
            (obj, code) => {
                const {
                    groups: { key, value },
                } = /^\|(?<key>.+?)=(?<value>.+)$/.exec(code);
                obj[key] = value;
            },
            {}
        );
        _.forEach(hrNeed, (value, key) => {
            char[key] = data[value];
        });

        data.push(char);
    }

    if (!_.isEqual(Fse.readJsonSync(JSON_HR), cnSort.sortArr(data, 'name'))) {
        Fse.writeJsonSync(JSON_HR, data);
        require('./updateTimestamp');
        console.log('HR data updated.');
    } else console.log('No need to update HR data.');
    if (!_.isEqual(Fse.readJsonSync(JSON_ADDITION), cnSort.sortObj(addition))) {
        Fse.writeJsonSync(JSON_ADDITION, addition);
        require('./updateTimestamp');
        console.log('Addition data updated.');
    } else console.log('No need to update addition data.');
});
