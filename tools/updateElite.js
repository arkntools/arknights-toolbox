/*eslint-disable */
const get = require('./modules/autoRetryGet');
const cnSort = require('./modules/cnSort');
const Cheerio = require('cheerio');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const joymeURL = 'http://wiki.joyme.com/arknights/%E5%B9%B2%E5%91%98%E6%95%B0%E6%8D%AE%E8%A1%A8';
const materials = _.map(Fse.readJsonSync(Path.join(__dirname, '../src/data/material.json')), m => m.name);

const JSON_ELITE = Path.join(__dirname, '../src/data/elite.json');

get(joymeURL)
    .then(r => {
        const $ = Cheerio.load(r, {
            decodeEntities: false,
        });
        let $chars = $('#CardSelectTr tr');

        let links = [];

        for (let i = 1; i < $chars.length; i++) {
            let $infos = $($chars[i]).find('td');

            if (
                $($infos[18])
                    .text()
                    .match('实装')
            )
                continue;

            let link = $($infos[0])
                .find('a')
                .attr('href');
            let name = $($infos[1])
                .find('a')
                .text()
                .trim();

            links.push({
                name,
                link,
            });
        }

        console.log('Success [list].');

        return links;
    })
    .then(async links => {
        let eliteMaterials = {};

        for (let { link, name } of links) {
            const $ = Cheerio.load(await get(`http://wiki.joyme.com${link}`), {
                decodeEntities: false,
            });
            let $elites = $('table:contains("精英化"):contains("消耗材料") tr:contains("消耗材料") + tr');

            let elites = [];

            for (let i = 0; i < $elites.length; i++) {
                let $needs = $($elites[i]).find('td');
                let need = {};

                for (let j = 0; j < $needs.length; j++) {
                    let search = /【(.+)】(.+)/.exec(
                        $($needs[j])
                            .text()
                            .trim()
                    );
                    if (!search || !materials.includes(search[1])) continue;
                    need[search[1]] = parseInt(search[2]);
                }

                if (_.size(need) == 0) continue;

                elites.push(need);
            }

            let $skills1 = $('table:contains("提升等级") tr:contains("→")');
            let $skills2 = $('table:contains("提升等级") tr:contains("→") + tr');

            let skills = {
                normal: [],
                elite: [],
            };

            let eliteTmp = {};
            let eliteSort = [];

            for (let i = 0; i < $skills1.length; i++) {
                let $skill1 = $($skills1[i]);
                let skill = $skill1
                    .children('th')
                    .text()
                    .trim()
                    .split(' ');

                let need = {};

                let $needs = $skill1.find('center');
                let needsNums = $($skills2[i])
                    .text()
                    .trim()
                    .split('、');

                for (let j = 0; j < $needs.length; j++) {
                    let mName = $($needs[j])
                        .text()
                        .trim();
                    if (!materials.includes(mName)) continue;
                    need[mName] = parseInt(needsNums[j]);
                }

                switch (skill.length) {
                    case 1:
                        skills.normal.push(need);
                        break;
                    case 2:
                        let sName = skill[0];
                        if (!eliteTmp[sName]) {
                            eliteTmp[sName] = [];
                            eliteSort.push(sName);
                        }
                        eliteTmp[sName].push(need);
                        break;
                }
            }

            for (let sName of eliteSort) {
                if (_.sumBy(eliteTmp[sName], _.size) == 0) continue;
                let needTmp = eliteTmp[sName];
                while (needTmp.length > 0 && _.size(_.last(needTmp)) == 0) needTmp.pop();
                if (needTmp.length > 0)
                    skills.elite.push({
                        name: sName,
                        need: eliteTmp[sName],
                    });
            }

            while (skills.normal.length > 0 && _.size(_.last(skills.normal)) == 0) skills.normal.pop();

            if (elites.length + skills.normal.length + _.size(skills.elite) == 0) continue;

            eliteMaterials[name] = {
                elites,
                skills,
            };

            console.log(`Success [${name}].`);
        }

        if (!_.isEqual(Fse.readJsonSync(JSON_ELITE), eliteMaterials)) {
            console.log('Update elite.');
            Fse.writeJsonSync(JSON_ELITE, cnSort.sortObj(eliteMaterials));
        }

        console.log('Success.');
    });
