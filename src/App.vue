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
.no-border {
	border: none !important;
}
#app {
	background-color: #fff;
	min-height: calc(100vh - 75px);
}
</style>
