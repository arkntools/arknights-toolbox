<template>
    <button class="mdui-fab mdui-fab-fixed mdui-color-pink-accent mdui-ripple scroll-to-top" :class="top > 1000 ? '' : 'mdui-fab-hide'" @click="scrollTop"><i class="mdui-icon material-icons">vertical_align_top</i></button>
</template>

<script>
export default {
    name: 'scroll-to-top',
    data: () => ({
        top: 0,
    }),
    methods: {
        scrollTop() {
            window.scroll(0, 0);
        },
        handleScroll() {
            this.top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        },
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
        window.removeEventListener('scroll', this.handleScroll);
    },
};
</script>

<style scoped>
@media (min-width: 1500px) {
    .scroll-to-top {
        right: calc(50% - 710px);
    }
}
</style>
