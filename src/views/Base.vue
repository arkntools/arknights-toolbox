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
    </div>
</template>

<script>
import _ from 'lodash';

import HR from '../data/hr.json';
import BASESKILL from '../data/baseSkill.json';

const color = {
    notSelected: 'mdui-color-brown-300',
    selected: 'mdui-color-grey-900',
};

const buildings = ['制造站', '贸易站', '发电站', '控制中枢', '宿舍', '会客室', '加工站', '训练室', '人力办公室'];
const buildingsShort = {
    基建建筑: '建筑',
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
        非特别提升: /^((?!更容易).)*$/,
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
            base: _.cloneDeep(BASESKILL),
            tag: _.transform(
                keyword,
                (o, v, k) => {
                    o[k] = Object.keys(v);
                },
                { 基建建筑: buildings }
            ),
            color,
            buildings,
            buildingsShort,
        };
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
        return data;
    },
};
</script>
