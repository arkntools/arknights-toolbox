<template>
	<div id="app" class="mdui-p-b-5">
		<div class="mdui-appbar mdui-color-grey-900">
			<div class="mdui-tab mdui-color-theme" mdui-tab>
				<router-link to="/" class="mdui-ripple mdui-ripple-white router-root">明日方舟工具箱</router-link>
				<router-link to="/hr" class="mdui-ripple mdui-ripple-white">公开招募计算</router-link>
				<router-link to="/material" class="mdui-ripple mdui-ripple-white">精英材料计算</router-link>
			</div>
		</div>
		<div :class="`mdui-container${$root.smallScreen?' mobile-screen':''}`">
			<router-view />
		</div>
	</div>
</template>

<script>
export default {
	name: 'app'
}
</script>


<style>
body::-webkit-scrollbar,
body::-webkit-scrollbar-track-piece {
	background: #fafafa;
}
body::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}
body::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
}
body::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.25);
}
body::-webkit-scrollbar-thumb:active {
	background: rgba(0, 0, 0, 0.3);
}
.no-wrap {
	white-space: nowrap;
}
.no-pe {
	pointer-events: none;
}
.no-sl {
	user-select: none;
}
.no-border {
	border: none !important;
}
.inline-block {
	display: inline-block;
}
.opacity-5 {
	opacity: 0.5;
}
.thin-table {
	border-spacing: 0;
}
.thin-table td {
	padding: 0;
}
.mdui-typo h1 {
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	padding-bottom: 9.6px;
}
.mdui-typo h2 {
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	padding-bottom: 7.2px;
}
#app {
	background-color: #fff;
	min-height: calc(100vh - 75px);
}
.mdui-color-grey-500,
.mdui-color-yellow-700,
.mdui-color-lime {
	color: #fff !important;
}
.mdui-chip {
	max-width: 100%;
}
.mdui-chip-title {
	max-width: calc(100% - 52px);
}
.mdui-switch:not(:last-child) {
	margin-right: 16px;
}
.mobile-screen {
	width: 100%;
	margin: 0;
}
.tag-table {
	box-shadow: none;
	border: none;
	white-space: normal;
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
.tag-btn .mdui-icon {
	font-size: 18px;
	margin-top: -2px;
	margin-left: -2px;
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
