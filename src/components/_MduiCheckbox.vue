<template>
	<label class="mdui-checkbox mdui-p-l-3">
		<input type="checkbox" :checked="checked" @change="$emit('change', $event.target.checked)" v-bind="$attrs" />
		<i class="mdui-checkbox-icon"></i><span class="cb-text"><slot></slot></span>
	</label>
</template>

<script>
export default {
	name: 'mdui-checkbox',
	model: {
		prop: 'checked',
		event: 'change'
	},
	props: {
		checked: Boolean
	}
}
</script>

<style scoped>
.cb-text {
	white-space: nowrap;
}
</style>
