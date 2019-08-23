<template>
    <div class="num-item">
        <div class="mdui-valign">
            <arkn-item :t="calcT" :img="img" :width="width" />
            <div class="with-label">
                <label :class="`mdui-textfield-label ${calcColor}`">{{lable}}</label>
                <span v-if="typeof num != 'undefined'" :class="calcColor">{{num}}</span>
                <span v-else :class="calcColor">
                    <slot></slot>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import ArknItem from './ArknItem';
export default {
    name: 'arkn-num-item',
    components: {
        ArknItem
    },
    computed: {
        calcT() {
            if (this.t) return this.t;
            else {
                let search = /-(.+)-/.exec(this.img);
                if (search) return search[1];
                else return false;
            }
        },
        calcColor() {
            if (this.color) return this.color;
            return '';
        }
    },
    props: {
        t: [Number, String],
        img: String,
        lable: String,
        num: [Number, String],
        width: Number,
        color: [String, Boolean]
    }
}
</script>

<style>
.num-item {
    display: inline-block;
}
.num-item-list {
    flex-wrap: wrap;
    display: flex;
}
</style>
