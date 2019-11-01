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
                                    <td class="mdui-text-center no-wrap">{{skill.unlock}}</td>
                                    <td class="mdui-text-center mdui-hidden-sm-down no-wrap">{{skill.building}}</td>
                                    <td class="mdui-text-center no-wrap"><span :class="`skill-card ${color[skill.building]}`">{{skill.name}}</span></td>
                                    <td :class="$root.smallScreen ? 'no-wrap' : false" v-html="skill.description"></td>
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
import BASE from '../data/base.json';
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

const tagDisplay = [['基建设施'], ['制造站', '贸易站', '控制中枢', '宿舍', '会客室', '加工站', '训练室']];

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
    data: () => ({
        member: _.transform(
            _.cloneDeep(HR),
            (o, v) => {
                o[v.name] = v;
                delete o[v.name].name;
            },
            {}
        ),
        addition: ADDITION,
        color,
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
        selected: _.transform(
            BASE.tag,
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
        ),
        ...BASE,
    }),
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
                            regGroups.push(this.regGroupName[type][tag]);
                        }
                    });
                },
                { need: [], regGroups: [] }
            );
            if (_.isEmpty(need)) return this.base;
            let result = _.map(_.union(...need), index => this.base[index]);
            if (this.setting.hideIrrelevant) {
                const { correlatives, buildings } = _.transform(
                    this.selected,
                    ({ correlatives, buildings }, tags, type) => {
                        _.each(tags, (isSelected, tag) => {
                            if (isSelected) {
                                if (type === '基建设施') buildings.push(tag);
                                else correlatives.push(`${type}-${tag}`);
                            }
                        });
                    },
                    { correlatives: [], buildings: [] }
                );
                result = _.cloneDeep(result);
                _.each(result, item => {
                    item.skills = _.transform(
                        item.skills,
                        (arr, skill) => {
                            const c1 = !_.isEmpty(correlatives) && correlatives.some(type => skill.is[type]);
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
