<template>
    <div id="arkn-base">
        <!-- 标签面板 -->
        <div id="drawer" :class="$root.smallScreen?'mdui-drawer mdui-drawer-right mdui-drawer-close':false">
            <div class="mdui-row">
                <div class="mdui-col-xs-12 tag-group-outside" v-for="(tagTypeGroup, index) in tagDisplay" :key="index">
                    <form class="tag-group" v-for="tagType of tagTypeGroup" :key="tagType">
                        <label class="mdui-textfield-label" :style="{ color: color[tagType] ? `var(--${color[tagType]})` : false }">{{tagType}}</label>
                        <tag-button v-for="tagName in tag[tagType]" :key="tagName" v-model="selected[tagType][tagName]" :notSelectedColor="`${color[tagType] || color.selected} opacity-5`" :selectedColor="color[tagType] || color.selected" :onlyClick="true" @click.native.stop="toggleTag(tagType, tagName)">{{tagName}}</tag-button>
                    </form>
                </div>
            </div>
            <div class="mdui-row mdui-m-t-2">
                <div class="mdui-col-xs-12">
                    <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset">重置</button>
                    <mdui-switch class="mdui-m-l-2" v-for="(zh, en) in settingZh" :key="en" v-model="setting[en]">{{zh}}</mdui-switch>
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
                                <th>效果</th>
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
        <button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer?null:drawer=new $root.Mdui.Drawer('#drawer');drawer.toggle()" style="z-index:10000"><i class="mdui-icon material-icons">sort</i></button>
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
    制造站: {
        通用生产: /(?<!配方的)生产力(首小时)?\+(?<num>[\d.]+)/,
        贵金属: /贵金属.*?(?<num>[\d.]+)/,
        作战记录: /作战记录.*?(?<num>[\d.]+)/,
        源石: /源石.*?(?<num>[\d.]+)/,
        仓库容量: /仓库容量上限\+(?<num>[\d.]+)/,
        // 心情消耗: /心情(每小时)?消耗-/,
    },
    贸易站: {
        订单效率: /(?<!所有贸易站)订单(获取)?效率\+(?<num>[\d.]+)/,
        // 订单上限: /订单上限\+/,
    },
    控制中枢: {
        订单效率: /控制中枢.*订单(获取)?效率\+(?<num>[\d.]+)/,
        心情消耗: /控制中枢.*心情(每小时)?消耗-(?<num>[\d.]+)/,
    },
    宿舍: {
        群体恢复: /宿舍内所有干员.*?(?<num>[\d.]+)/,
        单体恢复: /宿舍内.*?某个干员.*?(?<num>[\d.]+)/,
        // 自身恢复: /自身心情(每小时)?恢复\+/,
    },
    会客室: {
        无特别加成: /线索搜集.*?(?<num>[\d.]+)((?!更容易).)*$/,
        线索1: /线索搜集.*?(?<num>[\d.]+).*莱茵生命/,
        线索3: /线索搜集.*?(?<num>[\d.]+).*黑钢国际/,
        线索4: /线索搜集.*?(?<num>[\d.]+).*乌萨斯学生自治团/,
        线索5: /线索搜集.*?(?<num>[\d.]+).*格拉斯哥帮/,
        线索6: /线索搜集.*?(?<num>[\d.]+).*喀兰贸易/,
        线索7: /线索搜集.*?(?<num>[\d.]+).*罗德岛制药/,
    },
    加工站: {
        任意材料: /任意(类?)材料.*?(?<num>[\d.]+)/,
        基建材料: /基建材料.*?(?<num>[\d.]+)/,
        精英材料: /精英材料.*?(?<num>[\d.]+)/,
        技巧概要: /技巧概要.*?(?<num>[\d.]+)/,
        芯片: /芯片.*?(?<num>[\d.]+)/,
    },
    训练室: {
        全能: /，干员.*?(?<num>[\d.]+)/,
        先锋: /先锋.*?(?<num>[\d.]+)/,
        狙击: /狙击.*?(?<num>[\d.]+)/,
        医疗: /医疗.*?(?<num>[\d.]+)/,
        术师: /术师.*?(?<num>[\d.]+)/,
        近卫: /近卫.*?(?<num>[\d.]+)/,
        重装: /重装.*?(?<num>[\d.]+)/,
        辅助: /辅助.*?(?<num>[\d.]+)/,
        特种: /特种.*?(?<num>[\d.]+)/,
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
            lastTag: {
                type: null,
                name: null,
            },
            color,
            buildings,
            tagDisplay,
            setting: {
                hideIrrelevant: false,
            },
            settingZh: {
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
                            if (item.skills.some(skill => skill.building === key && keyword[key][tag].test(skill.description))) obj[key][tag].push(item);
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
        // selected: {
        //     handler(val) {
        //         let { type, name } = this.lastTag;
        //         if (type && name) {
        //             this.selected[type][name] = false;
        //             this.lastTag.type = null;
        //             this.lastTag.name = null;
        //         }
        //         type = _.findKey(this.selected, group => {
        //             const key = _.findKey(group, isSelected => isSelected);
        //             if (key) name = key;
        //             return !!key;
        //         });
        //         if (type && name) {
        //             this.lastTag = { type, name };
        //         }
        //     },
        //     deep: true,
        // },
    },
    computed: {
        display() {
            const need = _.transform(
                this.selected,
                (arr, tags, type) => {
                    _.each(tags, (isSelected, tag) => {
                        if (isSelected) arr.push(this.category[type][tag]);
                    });
                },
                []
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
            return result;
        },
    },
    methods: {
        reset() {
            this.selected = _.mapValues(this.selected, group => _.mapValues(group, () => false));
        },
        toggleTag(type, name) {
            console.log(type, name, this.selected[type][name]);
            // if (this.selected[type][name]) this.selected[type][name] = false;
            // else {
            //     this.reset();
            //     this.selected[type][name] = true;
            // }
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
.hidden {
    display: none !important;
}
.skill-card {
    padding: 4px;
    font-size: 12px;
}
.tag-group-outside {
    white-space: normal;
    padding-right: 4px;
}
.tag-group {
    display: inline-block;
    padding: 4px 0;
    margin-right: 4px;
    white-space: normal;
}
.mdui-btn.tag-btn:hover {
    opacity: 0.8;
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
#drawer {
    min-width: 290px;
}
#drawer.mdui-drawer {
    padding: 8px;
}
</style>
