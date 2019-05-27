<template>
	<label class="mdui-switch">
		<input type="checkbox" :checked="checked" @change="$emit('change', $event.target.checked)" />
		<i class="mdui-switch-icon mdui-m-r-1"></i>
		<slot></slot>
	</label>
</template>

<script>
export default {
	name: 'mdui-switch',
	model: {
		prop: 'checked',
		event: 'change'
	},
	props: {
		checked: Boolean
	}
}
</script>
