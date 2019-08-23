<template>
    <div class="no-sl mdui-m-r-1 mdui-valign" :t="t">
        <div class="mdui-valign item-img-div" :style="`width:${width}px;height:${width}px`">
            <img class="no-pe item-img" :src="`/assets/img/material/${calcImg}`" :style="`transform:scale(${scale})`" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'arkn-item',
    computed: {
        calcImg() {
            return this.img.endsWith('.png') ? this.img : `${this.img}.png`;
        },
        scale() {
            return this.width / 180;
        }
    },
    props: {
        t: [Number, String],
        img: String,
        width: {
            type: Number,
            default: 48
        }
    }
}
</script>

<style scoped>
.item-img {
    max-width: unset;
}
.item-img-div {
    justify-content: center;
}
</style>
