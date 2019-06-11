<template>
	<div class="mdui-row mdui-typo mdui-center" style="max-width: 1012px;">
		<div class="mdui-col-xs-12">
			<h1>明日方舟工具箱</h1>
			<p>Github: <a href="https://github.com/Tsuk1ko/arknights-toolbox" target="_blank">Tsuk1ko/arknights-toolbox</a></p>
			<p>开发中……宗旨是简洁美观且对移动设备友好</p>
			<p>本应用使用 Service Worker 缓存加载过的图片以及应用本身，因此甚至可以离线使用</p>
			<p>如果有好的想法、建议、希望增加的功能，以及 BUG，欢迎到项目中提 <a href="https://github.com/Tsuk1ko/arknights-toolbox/issues" target="_blank">issue</a></p>
			<h2>主要计划功能</h2>
			<ol>
				<li>公开招募计算【已完成】</li>
				<li>精英材料计算【已完成】</li>
				<li>干员升级计算【已完成】</li>
			</ol>
			<h2>数据来源</h2>
			<ul>
				<li><a href="http://wiki.joyme.com/arknights" target="_blank">明日方舟 Wiki</a>（干员数据及图片）</li>
				<li><a href="https://github.com/graueneko/graueneko.github.io" target="_blank">graueneko.github.io</a>（材料合成、干员升级数据）</li>
				<li><a href="https://github.com/Houdou/arkgraph" target="_blank">ark-nights.com</a>（材料图片）</li>
			</ul>
			<h2>其他</h2>
			<p>
				<button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-r-2" @click="clear">清除本地数据</button>已用：{{lsSize}}
			</p>
		</div>
	</div>
</template>

<script>
import _ from 'lodash';
import utf8BufferSize from 'utf8-buffer-size';

export default {
	name: 'home',
	data() {
		return {
			lsSize: this.calcLsSize()
		}
	},
	methods: {
		clear() {
			localStorage.clear();
			this.$root.snackbar('清除成功');
			this.lsSize = this.calcLsSize();
		},
		calcLsSize() {
			return this.$root.calcSize(_.sumBy(Object.values(localStorage), utf8BufferSize));
		}
	}
}
</script>
