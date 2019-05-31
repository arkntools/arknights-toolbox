<template>
	<div class="progress">
		<div class="mdui-typo-headline">数据准备中</div>
		<div class="mdui-spinner mdui-spinner-colorful mdui-m-l-1"></div>
	</div>
</template>

<script>
export default {
	name: 'mdui-progress',
}
</script>

<style scoped>
@keyframes show {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
.progress {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100px;
	animation: show 0.5s 0.5s forwards;
	opacity: 0;
}
</style>
