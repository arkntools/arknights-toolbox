<template>
    <div id="arkn-base">
        <!-- 标签面板 -->
        <div id="drawer" :class="$root.smallScreen?'mdui-drawer mdui-drawer-right mdui-drawer-close':false">
            <div :class="`mdui-row ${noneSelect ? 'none-select' : ''}`">
                <div class="mdui-col-xs-12 tag-group-outside" v-for="(tagTypeGroup, index) in tagDisplay" :key="index">
                    <div class="tag-group" v-for="tagType of tagTypeGroup" :key="tagType">
                        <label class="mdui-textfield-label" :style="{ color: color[tagType] ? `var(--${color[tagType]})` : false }">{{tagType}}</label>
                        <tag-button v-for="tagName in tag[tagType]" :key="tagName" v-model="selected[tagType][tagName]" :notSelectedColor="`${color[tagType] || color.selected} opacity-5`" :selectedColor="color[tagType] || color.selected" :canChange="false" @click="toggleTag(tagType, tagName)">{{tagName}}</tag-button>
                    </div>
                </div>
            </div>
            <div class="mdui-row mdui-m-t-2">
                <div class="mdui-col-xs-12" style="white-space: normal;">
                    <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn mdui-m-r-2" @click="reset">重置</button>
                    <mdui-switch class="mdui-m-r-2" v-for="(zh, en) in settingZh" :key="en" v-model="setting[en]">{{zh}}</mdui-switch>
                </div>
            </div>
        </div>
        <!-- 技能列表 -->
        <div :class="`mdui-row ${$root.smallScreen?'':'mdui-m-t-4'}`">
            <div class="mdui-col-xs-12">
                <div class="mdui-table-fluid">
                    <table class="mdui-table" id="skill-table">
                        <thead>
                            <tr>
                                <th colspan="2" class="mdui-text-center mdui-hidden-xs-down">干员</th>
                                <th class="mdui-text-center mdui-hidden-sm-up">干员</th>
                                <th class="mdui-text-center">解锁</th>
                                <th class="mdui-text-center mdui-hidden-sm-down">设施</th>
                                <th class="mdui-text-center">技能</th>
                                <th>效果（筛选时将按效果由高到低排序）</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(item, itemIndex) of display">
                                <tr v-for="(skill, skillIndex) in item.skills" :key="`${itemIndex}-${skillIndex}`">
                                    <td :rowspan="item.skills.length" v-if="skillIndex===0" class="mdui-hidden-xs-down" width="1">
                                        <img class="mdui-card-header-avatar" :src="addition[item.name]?$root.avatar(addition[item.name]):false" />
                                    </td>
                                    <td v-else class="hidden"></td>
                                    <template v-if="skillIndex===0">
                                        <td :rowspan="item.skills.length" class="mdui-hidden-xs-down no-wrap" width="1">{{item.name}}</td>
                                        <td :rowspan="item.skills.length" class="mdui-text-center mdui-hidden-sm-up no-wrap">{{item.name}}</td>
                                    </template>
                                    <td v-else class="hidden"></td>
                                    <td class="mdui-text-center no-wrap">{{skill.display.unlock}}</td>
                                    <td class="mdui-text-center mdui-hidden-sm-down no-wrap">{{skill.building}}</td>
                                    <td class="mdui-text-center no-wrap"><span :class="`skill-card ${color[skill.building]}`">{{skill.name}}</span></td>
                                    <td :class="$root.smallScreen ? 'no-wrap' : false" v-html="skill.display.description"></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- 浮动按钮 -->
        <button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer?null:drawer=new $root.Mdui.Drawer('#drawer');drawer.toggle()"><i class="mdui-icon material-icons">sort</i></button>
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

const keyword = {
    基建设施: {
        发电站: /无人机.*?(?<power>[\d.]+)/,
        人力办公室: /人脉资源.*?(?<connect>[\d.]+)/,
    },
    制造站: {
        通用生产: /(?<!配方的)生产力(首小时)?\+(?<product>[\d.]+)/,
        贵金属: /贵金属.*?(?<product>[\d.]+)/,
        作战记录: /作战记录.*?(?<product>[\d.]+)/,
        源石: /源石.*?(?<product>[\d.]+)/,
        仓库容量: /仓库容量上限\+(?<capacity>[\d.]+)/,
        // 心情消耗: /心情(每小时)?消耗-/,
    },
    贸易站: {
        订单效率: /(?<!所有贸易站)订单(获取)?效率\+(?<order>[\d.]+)/,
        订单上限: /订单上限\+(?<orderLimit>[\d.]+)/,
    },
    控制中枢: {
        订单效率: /控制中枢.*订单(获取)?效率\+(?<orderAll>[\d.]+)/,
        心情消耗: /控制中枢.*心情(每小时)?消耗-(?<moodConsume>[\d.]+)/,
    },
    宿舍: {
        群体恢复: /宿舍内所有干员.*?(?<moodRecoveryAll>[\d.]+)/,
        单体恢复: /宿舍内.*?某个干员.*?(?<moodRecoverySingle>[\d.]+)/,
        // 自身恢复: /自身心情(每小时)?恢复\+/,
    },
    会客室: {
        无特别加成: /线索.*?(?<collect>[\d.]+)((?!更容易).)*$/,
        线索1: /线索.*?(?<collect>[\d.]+).*莱茵生命/,
        线索3: /线索.*?(?<collect>[\d.]+).*黑钢国际/,
        线索4: /线索.*?(?<collect>[\d.]+).*乌萨斯学生自治团/,
        线索5: /线索.*?(?<collect>[\d.]+).*格拉斯哥帮/,
        线索6: /线索.*?(?<collect>[\d.]+).*喀兰贸易/,
        线索7: /线索.*?(?<collect>[\d.]+).*罗德岛制药/,
    },
    加工站: {
        任意材料: /任意(类?)材料.*?(?<byproduct>[\d.]+)/,
        基建材料: /基建材料.*?(?<byproduct>[\d.]+)/,
        精英材料: /精英材料.*?(?<byproduct>[\d.]+)/,
        技巧概要: /技巧概要.*?(?<byproduct>[\d.]+)/,
        芯片: /芯片.*?(?<byproduct>[\d.]+)/,
    },
    训练室: {
        全能: /，干员.*?(?<train>[\d.]+)/,
        先锋: /先锋.*?(?<train>[\d.]+)/,
        狙击: /狙击.*?(?<train>[\d.]+)/,
        医疗: /医疗.*?(?<train>[\d.]+)/,
        术师: /术师.*?(?<train>[\d.]+)/,
        近卫: /近卫.*?(?<train>[\d.]+)/,
        重装: /重装.*?(?<train>[\d.]+)/,
        辅助: /辅助.*?(?<train>[\d.]+)/,
        特种: /特种.*?(?<train>[\d.]+)/,
    },
};

const regGroupName = {
    基建设施: {
        制造站: ['product', 'capacity'],
        贸易站: ['order', 'orderLimit'],
        发电站: 'power',
        控制中枢: ['orderAll', 'moodConsume'],
        宿舍: ['moodRecoveryAll', 'moodRecoverySingle'],
        会客室: 'collect',
        加工站: 'byproduct',
        训练室: 'train',
        人力办公室: 'connect',
    },
    制造站: {
        通用生产: 'product',
        贵金属: 'product',
        作战记录: 'product',
        源石: 'product',
        仓库容量: 'capacity',
    },
    贸易站: {
        订单效率: 'order',
        订单上限: 'orderLimit',
    },
    控制中枢: {
        订单效率: 'orderAll',
        心情消耗: 'moodConsume',
    },
    宿舍: {
        群体恢复: 'moodRecovery',
        单体恢复: 'moodRecovery',
    },
    会客室: {
        无特别加成: 'collect',
        线索1: 'collect',
        线索3: 'collect',
        线索4: 'collect',
        线索5: 'collect',
        线索6: 'collect',
        线索7: 'collect',
    },
    加工站: {
        任意材料: 'byproduct',
        基建材料: 'byproduct',
        精英材料: 'byproduct',
        技巧概要: 'byproduct',
        芯片: 'byproduct',
    },
    训练室: {
        全能: 'train',
        先锋: 'train',
        狙击: 'train',
        医疗: 'train',
        术师: 'train',
        近卫: 'train',
        重装: 'train',
        辅助: 'train',
        特种: 'train',
    },
};

const tagDisplay = [['基建设施'], ['制造站', '贸易站', '控制中枢', '宿舍', '会客室', '加工站', '训练室']];

const skillHightlight = html =>
    html
        .replace(/(?<!消耗)((提升)|(\+))([\d.]+%?)/g, '$2<span class="mdui-text-color-blue">$3$4</span>')
        .replace(/(?<!消耗)-[\d.]+%?(?!心情消耗)|(?<=消耗)\+[\d.]+%?/g, '<span class="mdui-text-color-red">$&</span>')
        .replace(/(?<=消耗)-[\d.]+%?|-[\d.]+%?(?=心情消耗)|(?<![+-\d.])[\d.]+%?|(?<=每个).{1,8}(?=干员)|(?<=更容易获得).*?(?=线索)|(?<=与).*?(?=在同一个)|(贵金属|作战记录|源石)(?=类)|(?<=目标是).*?(?=，则)|(?<=，).*?(?=干员的?专精)/g, '<span class="mdui-text-color-blue">$&</span>');

const unlockShort = {
    初始携带: '-',
    等级30: '30级',
    等级30级: '30级',
    精英化1: '精1',
    精英化2: '精2',
};

const getSkillsMaxNum = skills =>
    _.transform(
        skills,
        (max, { num }) => {
            _.each(num, (v, k) => {
                if (!max[k] || max[k] < v) max[k] = v;
            });
        },
        {}
    );

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
                _.omit(keyword, '基建设施'),
                (o, v, k) => {
                    o[k] = Object.keys(v);
                },
                { 基建设施: buildings }
            ),
            lastTag: {
                type: null,
                name: null,
            },
            color,
            buildings,
            tagDisplay,
            setting: {
                mutiSelect: false,
                hideIrrelevant: false,
            },
            settingZh: {
                mutiSelect: '多选模式',
                hideIrrelevant: '隐藏同一干员与筛选无关的技能',
            },
            drawer: null,
        };
        data.base = _.transform(
            data.baseTable,
            (arr, skills, name) => {
                skills.forEach(skill => {
                    skill.display = {
                        description: skillHightlight(skill.description),
                        unlock: unlockShort[skill.unlock] || skill.unlock,
                    };
                    skill.num = {};
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
                            let condition = false;
                            item.skills.forEach(skill => {
                                if (skill.building !== tag) return;
                                condition = true;
                                if (keyword.基建设施[tag]) {
                                    const search = keyword.基建设施[tag].exec(skill.description);
                                    if (search && search.groups) _.assign(skill.num, search.groups);
                                }
                            });
                            if (condition) obj[key][tag].push(item);
                        });
                    } else {
                        obj.基建设施[key].forEach(item => {
                            let condition = false;
                            item.skills.forEach(skill => {
                                if (skill.building !== key) return;
                                const search = keyword[key][tag].exec(skill.description);
                                if (search) condition = true;
                                else return;
                                if (!search.groups) return;
                                _.assign(skill.num, search.groups);
                            });
                            if (condition) obj[key][tag].push(item);
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
            const { need, regGroups } = _.transform(
                this.selected,
                ({ need, regGroups }, tags, type) => {
                    _.each(tags, (isSelected, tag) => {
                        if (isSelected) {
                            need.push(this.category[type][tag]);
                            regGroups.push(regGroupName[type][tag]);
                        }
                    });
                },
                { need: [], regGroups: [] }
            );
            if (_.isEmpty(need)) return this.base;
            let result = _.union(...need);
            if (this.setting.hideIrrelevant) {
                const { regs, buildings } = _.transform(
                    this.selected,
                    ({ regs, buildings }, tags, type) => {
                        _.each(tags, (isSelected, tag) => {
                            if (isSelected) {
                                if (type === '基建设施') buildings.push(tag);
                                else regs.push(keyword[type][tag]);
                            }
                        });
                    },
                    { regs: [], buildings: [] }
                );
                result = _.cloneDeep(result);
                _.each(result, item => {
                    item.skills = _.transform(
                        item.skills,
                        (arr, skill) => {
                            const c1 = !_.isEmpty(regs) && regs.some(reg => reg.test(skill.description));
                            const c2 = !_.isEmpty(buildings) && buildings.includes(skill.building);
                            if (c1 || c2) arr.push(skill);
                        },
                        []
                    );
                });
            }
            const sortOrder = _.uniq(_.flatten(regGroups));
            result.sort((a, b) => {
                const [aMax, bMax] = [getSkillsMaxNum(a.skills), getSkillsMaxNum(b.skills)];
                for (const key of sortOrder) {
                    if (!aMax[key]) aMax[key] = 0;
                    if (!bMax[key]) bMax[key] = 0;
                    if (aMax[key] === 0 && bMax[key] === 0) continue;
                    return bMax[key] - aMax[key];
                }
                return a.name.localeCompare(b.name);
            });
            return result;
        },
        noneSelect() {
            return _.every(this.selected, obj => _.every(obj, v => !v));
        },
    },
    methods: {
        reset() {
            this.selected = _.mapValues(this.selected, group => _.mapValues(group, () => false));
        },
        toggleTag(type, name) {
            if (this.selected[type][name]) this.selected[type][name] = false;
            else {
                if (!this.setting.mutiSelect) this.reset();
                this.selected[type][name] = true;
            }
        },
    },
    created() {
        const setting = localStorage.getItem('base.setting');
        if (setting) this.setting = JSON.parse(setting);
    },
};
</script>

<style>
:root {
    --mdui-color-amber-400: #ffca28;
    --mdui-color-light-blue-700: #0288d1;
    --mdui-color-green-600: #43a047;
    --mdui-color-green-900: #1b5e20;
    --mdui-color-cyan-300: #4dd0e1;
    --mdui-color-orange-900: #e65100;
    --mdui-color-lime-400: #d4e157;
    --mdui-color-red-900: #b71c1c;
    --mdui-color-grey-700: #616161;
}
#arkn-base .skill-card {
    padding: 4px;
    font-size: 12px;
}
#arkn-base .tag-group-outside {
    white-space: normal;
    padding-right: 4px;
}
#arkn-base .tag-group {
    display: inline-block;
    padding: 4px 0;
    margin-right: 4px;
    white-space: normal;
}
#arkn-base .none-select .tag-btn {
    opacity: 1;
}
#skill-table td,
#skill-table th {
    padding: 8px 8px;
}
#skill-table td:first-child,
#skill-table th:first-child {
    padding-right: 0;
    padding-left: 16px;
}
#skill-table td:last-child,
#skill-table th:last-child {
    padding-right: 16px;
}
#arkn-base #drawer {
    min-width: 290px;
    padding: 8px;
}
</style>
