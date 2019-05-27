<template>
	<div id="app" class="mdui-p-b-5">
		<div class="mdui-appbar mdui-color-grey-900">
			<div class="mdui-tab mdui-color-theme" mdui-tab>
				<router-link to="/" class="mdui-ripple mdui-ripple-white router-root">明日方舟工具箱</router-link>
				<router-link to="/akhr" class="mdui-ripple mdui-ripple-white">公开招募计算</router-link>
			</div>
		</div>
		<div class="mdui-container">
			<router-view />
		</div>
	</div>
</template>

<style>
@import url("https://cdn.bootcss.com/mdui/0.4.2/css/mdui.min.css");
.no-wrap {
	white-space: nowrap;
}
.no-pe {
	pointer-events: none;
}
.tag-table {
	box-shadow: none;
	border: none;
}
.tag-table td {
	padding: 0.3em 0.5em !important;
}
.tag-table tr:last-child td {
	border: none;
}
.tag-btn {
	margin: 2px 4px;
	margin-left: 0;
	min-width: 0;
	padding: 0 11px;
}
.tag-btn:last-child {
	margin-right: 0;
}
.tag-btn[has-avatar] {
	padding-left: 36px;
}
.tag-avatar {
	max-height: 28px;
	max-width: 28px;
	position: absolute;
	left: 2px;
	top: 2px;
	border-radius: 2px;
}
</style>
