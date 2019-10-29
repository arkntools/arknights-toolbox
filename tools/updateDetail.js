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
const JSON_BASE_SKILL = Path.join(__dirname, '../src/data/baseSkill.json');

get(joymeURL)
    .then(r => {
        const $ = Cheerio.load(r, {
            decodeEntities: false,
        });
        const $chars = $('#CardSelectTr tr');

        const links = [];

        for (let i = 1; i < $chars.length; i++) {
            const $infos = $($chars[i]).find('td');

            if (
                $($infos[18])
                    .text()
                    .match('实装')
            )
                continue;

            const link = $($infos[0])
                .find('a')
                .attr('href');
            const name = $($infos[1])
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
        const eliteMaterials = {};
        const baseSkill = {};

        for (const { link, name } of links) {
            const $ = Cheerio.load(await get(`http://wiki.joyme.com${link}`), {
                decodeEntities: false,
            });

            const parsedElite = parseElite($);
            if (parsedElite) eliteMaterials[name] = parsedElite;

            const parsedBaseSkill = parseBaseSkill($);
            if (parsedBaseSkill) baseSkill[name] = parsedBaseSkill;

            console.log(`Success [${name}].`);
        }

        if (!Fse.existsSync(JSON_ELITE) || !_.isEqual(Fse.readJsonSync(JSON_ELITE), cnSort.sortObj(eliteMaterials))) {
            console.log('Update elite.');
            Fse.writeJsonSync(JSON_ELITE, eliteMaterials);
        }
        if (!Fse.existsSync(JSON_BASE_SKILL) || !_.isEqual(Fse.readJsonSync(JSON_BASE_SKILL), cnSort.sortObj(baseSkill))) {
            console.log('Update base skill.');
            Fse.writeJsonSync(JSON_BASE_SKILL, baseSkill);
        }

        require('./updateTimestamp');

        console.log('Success.');
    });

function parseElite($) {
    const $elites = $('table:contains("精英化"):contains("消耗材料") tr:contains("消耗材料") + tr');

    const elites = [];

    for (let i = 0; i < $elites.length; i++) {
        const $needs = $($elites[i]).find('td');
        const need = {};

        for (let j = 0; j < $needs.length; j++) {
            const search = /【(.+)】(.+)/.exec(
                $($needs[j])
                    .text()
                    .trim()
            );
            if (!search || !materials.includes(search[1])) continue;
            need[search[1]] = parseInt(search[2]);
        }

        if (_.size(need) === 0) continue;

        elites.push(need);
    }

    const $skills1 = $('table:contains("提升等级") tr:contains("→")');
    const $skills2 = $('table:contains("提升等级") tr:contains("→") + tr');

    const skills = {
        normal: [],
        elite: [],
    };

    const eliteTmp = {};
    const eliteSort = [];

    for (let i = 0; i < $skills1.length; i++) {
        const $skill1 = $($skills1[i]);
        const skill = $skill1
            .children('th')
            .text()
            .trim()
            .split(' ');

        const need = {};

        const $needs = $skill1.find('center');
        const needsNums = $($skills2[i])
            .text()
            .trim()
            .split('、');

        for (let j = 0; j < $needs.length; j++) {
            const mName = $($needs[j])
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
                const sName = skill[0];
                if (!eliteTmp[sName]) {
                    eliteTmp[sName] = [];
                    eliteSort.push(sName);
                }
                eliteTmp[sName].push(need);
                break;
        }
    }

    for (const sName of eliteSort) {
        if (_.sumBy(eliteTmp[sName], _.size) === 0) continue;
        const needTmp = eliteTmp[sName];
        while (needTmp.length > 0 && _.size(_.last(needTmp)) === 0) needTmp.pop();
        if (needTmp.length > 0)
            skills.elite.push({
                name: sName,
                need: eliteTmp[sName],
            });
    }

    while (skills.normal.length > 0 && _.size(_.last(skills.normal)) === 0) skills.normal.pop();

    if (elites.length + skills.normal.length + _.size(skills.elite) === 0) return;

    return { elites, skills };
}

function parseBaseSkill($) {
    const $baseSkill = $('table:contains("效果设施") tr');

    const baseSkill = [];

    for (let i = 0; i < $baseSkill.length; i++) {
        const $needs = $($baseSkill[i]).find('td');
        if ($needs.length !== 4) continue;
        const need = [];

        for (let j = 0; j < $needs.length; j++) {
            need.push(
                $($needs[j])
                    .text()
                    .trim()
            );
        }

        if (!need.every(v => !!v)) continue;

        const [name, unlock, building, description] = need;
        baseSkill.push({
            name,
            unlock,
            building,
            description: description
                .replace(/％/g, '%')
                .replace(/,/g, '，')
                .replace(/\(/g, '（')
                .replace(/\)/g, '）')
                .replace(/\)/g, '）'),
        });
    }

    if (baseSkill.length === 0) return;

    return baseSkill;
}
