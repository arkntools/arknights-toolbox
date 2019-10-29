<template>
    <div id="arkn-base">
        <!-- 标签面板 -->
        <div class="mdui-row">
            <div class="mdui-col-xs-12">
                <table class="mdui-table tag-table">
                    <tbody>
                        <tr v-for="(tags, type) in tag" :key="type">
                            <td width="1">
                                <button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{buildingsShort[type]}}</button>
                            </td>
                            <td>
                                <tag-button v-for="tag in tags" :key="tag" v-model="selected[type][tag]" :notSelectedColor="color.notSelected" :selectedColor="color.selected">{{tag}}</tag-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="mdui-row mdui-m-t-4">
            <div class="mdui-col-xs-12">
                <table class="mdui-table">
                    <thead>
                        <tr>
                            <th colspan="2" class="mdui-text-center">干员</th>
                            <th class="mdui-text-center">解锁条件</th>
                            <th class="mdui-text-center">设施</th>
                            <th class="mdui-text-center">技能</th>
                            <th>效果</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="item of display">
                            <tr v-for="(skill, index) in item.skills" :key="index">
                                <td :rowspan="item.skills.length" v-if="index===0">
                                    <img class="mdui-card-header-avatar" :src="addition[item.name]?$root.avatar(addition[item.name]):false" />
                                </td>
                                <td v-else class="hidden"></td>
                                <td nowrap :rowspan="item.skills.length" v-if="index===0">{{item.name}}</td>
                                <td v-else class="hidden"></td>
                                <td nowrap class="mdui-text-center">{{skill.unlock}}</td>
                                <td nowrap class="mdui-text-center">{{skill.building}}</td>
                                <td nowrap class="mdui-text-center"><span :class="`skill-card ${color[skill.building]}`">{{skill.name}}</span></td>
                                <td v-html="skill.display.description"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';

import HR from '../data/hr.json';
import BASESKILL from '../data/baseSkill.json';
import ADDITION from '../data/addition.json';

const color = {
    notSelected: 'mdui-color-brown-300',
    selected: 'mdui-color-grey-900',
    制造站: 'mdui-color-amber-400',
    贸易站: 'mdui-color-light-blue-700',
    发电站: 'mdui-color-green-600',
    控制中枢: 'mdui-color-green-900',
    宿舍: 'mdui-color-cyan-300 mdui-text-color-white-text',
    会客室: 'mdui-color-orange-900',
    加工站: 'mdui-color-lime-400',
    训练室: 'mdui-color-red-900',
    人力办公室: 'mdui-color-grey-700',
};

const buildings = ['制造站', '贸易站', '发电站', '控制中枢', '宿舍', '会客室', '加工站', '训练室', '人力办公室'];
const buildingsShort = {
    基建设施: '设施',
    制造站: '制造',
    贸易站: '贸易',
    发电站: '电厂',
    控制中枢: '中枢',
    宿舍: '宿舍',
    会客室: '会客',
    加工站: '加工',
    训练室: '训练',
    人力办公室: '人力',
};

const keyword = {
    制造站: {
        通用生产: /生产力(首小时)?\+/,
        贵金属: /贵金属/,
        作战记录: /作战记录/,
        源石: /源石/,
        仓库容量: /仓库容量上限\+/,
        心情消耗: /心情(每小时)?消耗-/,
    },
    贸易站: {
        订单效率: /订单(获取)?效率\+/,
        订单上限: /订单上限\+/,
        心情消耗: /心情(每小时)?消耗-/,
    },
    控制中枢: {
        订单效率: /订单(获取)?效率\+/,
        心情消耗: /心情(每小时)?消耗-/,
    },
    宿舍: {
        群体恢复: /所有干员/,
        单体恢复: /某个干员/,
        自身恢复: /自身心情(每小时)?恢复\+/,
    },
    会客室: {
        无特别加成: /^((?!更容易).)*$/,
        线索1: /莱茵生命/,
        线索3: /黑钢国际/,
        线索4: /乌萨斯学生自治团/,
        线索5: /格拉斯哥帮/,
        线索6: /喀兰贸易/,
        线索7: /罗德岛制药/,
    },
    加工站: {
        任意材料: /任意(类?)材料/,
        基建材料: /基建材料/,
        精英材料: /精英材料/,
        技巧概要: /技巧概要/,
        芯片: /芯片/,
    },
    训练室: {
        全能: /，干员/,
        先锋: /先锋/,
        狙击: /狙击/,
        医疗: /医疗/,
        术师: /术师/,
        近卫: /近卫/,
        重装: /重装/,
        辅助: /辅助/,
        特种: /特种/,
    },
};

const skillHightlight = html =>
    html
        .replace(/(?<!消耗)((提升)|(\+))([\d.]+%?)/g, '$2<span class="mdui-text-color-blue">$3$4</span>')
        .replace(/(?<!消耗)-[\d.]+%?(?!心情消耗)|(?<=消耗)\+[\d.]+%?/g, '<span class="mdui-text-color-red">$&</span>')
        .replace(/(?<=消耗)-[\d.]+%?|-[\d.]+%?(?=心情消耗)|(?<![+-\d.])[\d.]+%?|(?<=每个).{1,8}(?=干员)|(?<=更容易获得).*?(?=线索)|(?<=与).*?(?=在同一个)|(贵金属|作战记录|源石)(?=类)|(?<=目标是).*?(?=，则)|(?<=，).*?(?=干员的?专精)/g, '<span class="mdui-text-color-blue">$&</span>');

export default {
    name: 'arkn-base',
    data: () => {
        const data = {
            l: _,
            member: _.transform(
                _.cloneDeep(HR),
                (o, v) => {
                    o[v.name] = v;
                    delete o[v.name].name;
                },
                {}
            ),
            addition: ADDITION,
            baseTable: _.cloneDeep(BASESKILL),
            tag: _.transform(
                keyword,
                (o, v, k) => {
                    o[k] = Object.keys(v);
                },
                { 基建设施: buildings }
            ),
            color,
            buildings,
            buildingsShort,
            setting: {
                hideIrrelevant: false,
            },
            settingZh: {
                hideIrrelevant: '隐藏同一干员与筛选无关的技能',
            },
        };
        data.base = _.transform(
            data.baseTable,
            (arr, skills, name) => {
                skills.forEach(skill => {
                    skill.display = {
                        description: skillHightlight(skill.description),
                    };
                });
                arr.push({ name, skills });
            },
            []
        ).sort((a, b) => a.name.localeCompare(b.name));
        data.selected = _.transform(
            data.tag,
            (obj, arr, key) => {
                obj[key] = _.transform(
                    arr,
                    (o, v) => {
                        o[v] = false;
                    },
                    {}
                );
            },
            {}
        );
        data.category = _.transform(
            data.tag,
            (obj, tags, key) => {
                obj[key] = {};
                tags.forEach(tag => {
                    obj[key][tag] = [];
                    if (key === '基建设施') {
                        data.base.forEach(item => {
                            if (item.skills.some(skill => skill.building === tag)) obj[key][tag].push(item);
                        });
                    } else {
                        obj.基建设施[key].forEach(item => {
                            if (item.skills.some(skill => keyword[key][tag].test(skill.description))) obj[key][tag].push(item);
                        });
                    }
                });
            },
            {}
        );
        return data;
    },
    watch: {
        setting: {
            handler(val) {
                localStorage.setItem('base.setting', JSON.stringify(val));
            },
            deep: true,
        },
    },
    computed: {
        display() {
            const need = _.transform(
                this.selected,
                (arr, tags, key) => {
                    _.each(tags, (isSelect, tag) => {
                        if (isSelect) arr.push(this.category[key][tag]);
                    });
                },
                []
            );
            return need.length > 0 ? _.union(...need) : this.base;
        },
    },
    methods: {},
    created() {
        const setting = localStorage.getItem('base.setting');
        if (setting) this.setting = JSON.parse(setting);
    },
};
</script>

<style>
.hidden {
    display: none !important;
}
.skill-card {
    padding: 4px;
}
</style>
