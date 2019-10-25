<template>
    <div id="arkn-base">
        <!-- 标签面板 -->
        <div class="mdui-row">
            <div class="mdui-col-xs-12">
                <div id="drawer" :class="$root.smallScreen?'mdui-drawer mdui-drawer-right mdui-drawer-close':false">
                    <table class="mdui-table tag-table">
                        <tbody>
                            <tr>
                                <td v-if="!$root.smallScreen" width="1">
                                    <button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">基建</button>
                                </td>
                                <td>
                                    <tag-button v-for="building in buildings" :key="building" v-model="selected.building[building]" :notSelectedColor="color.notSelected" :selectedColor="color.selected">{{building}}</tag-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';

import HR from '../data/hr.json';
import BASESKILL from '../data/baseSkill.json';

export default {
    name: 'arkn-base',
    data: () => ({
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
        selected: {
            building: {},
        },
        color: {
            notSelected: 'mdui-color-brown-300',
            selected: 'mdui-color-grey-800',
        },
        buildings: ['制造站', '贸易站', '发电站', '控制中枢', '宿舍', '会客室', '加工站', '训练室', '人力办公室'],
    }),
    created() {
        this.buildings.forEach(v => this.$set(this.selected.building, v, false));
    },
};
</script>
