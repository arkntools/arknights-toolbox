<template>
	<div id="app" class="mdui-p-b-5">
		<div class="mdui-appbar mdui-color-grey-900">
			<div class="mdui-tab mdui-color-theme" mdui-tab>
				<router-link to="/" class="mdui-ripple mdui-ripple-white router-root">
					<span class="mdui-hidden-xs">明日方舟工具箱</span>
					<i class="mdui-hidden-sm-up mdui-icon material-icons">home</i>
				</router-link>
				<router-link to="/hr" class="mdui-ripple mdui-ripple-white"><span>公开招募<span class="mdui-hidden-xs">计算</span></span></router-link>
				<router-link to="/material" class="mdui-ripple mdui-ripple-white"><span>精英材料<span class="mdui-hidden-xs">计算</span></span></router-link>
				<router-link to="/level" class="mdui-ripple mdui-ripple-white"><span>干员升级<span class="mdui-hidden-xs">计算</span></span></router-link>
			</div>
		</div>
		<div :class="`mdui-container${$root.smallScreen?' mobile-screen':''}`">
			<router-view />
		</div>
		<img v-if="$root.nm" class="bg-img" src="./assets/img/amiya-nm.gif" />
		<img v-else class="bg-img" src="./assets/img/amiya.gif" />
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
.bg-img {
	max-width: 240px;
	width: 35vw;
	position: fixed;
	left: 0;
	bottom: 0;
	opacity: 0.3;
	mask-image: linear-gradient(transparent, #fff, #fff, #fff);
	z-index: -1;
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
.with-label {
	display: inline-block;
	line-height: 1.5;
}
.with-label > span {
	line-height: 24px;
}
.with-label > .mdui-select {
	height: 24px;
}
.with-label .mdui-textfield-label {
	width: fit-content;
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
	min-height: calc(100vh - 75px);
}
[t] {
	background-size: contain;
}
[t="5"] {
	background-image: url(/img/T5.png);
}
[t="4"] {
	background-image: url(/img/T4.png);
}
[t="3"] {
	background-image: url(/img/T3.png);
}
[t="2"] {
	background-image: url(/img/T2.png);
}
[t="1"] {
	background-image: url(/img/T1.png);
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
	background-color: transparent;
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
