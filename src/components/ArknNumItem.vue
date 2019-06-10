<template>
	<div class="num-item">
		<div class="mdui-valign">
			<arkn-item :t="t" :img="img" />
			<div class="with-label">
				<label class="mdui-textfield-label">{{lable}}</label>
				<span>{{num}}</span>
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
	props: {
		t: [Number, String],
		img: String,
		lable: String,
		num: [Number, String]
	}
}
</script>

<style>
.num-item {
	display: inline-block;
}
</style>
