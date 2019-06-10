<template>
	<div class="no-sl mdui-m-r-1" :t="t">
		<div class="mdui-valign" style="height: 100%;">
			<img class="no-pe item-img" :src="`/img/${img}.png`" />
		</div>
	</div>
</template>

<script>
export default {
	name: 'arkn-item',
	props: {
		t: [Number, String],
		img: String
	}
}
</script>

<style scoped>
.item-img {
	max-width: 100%;
	max-height: 100%;
}
</style>
