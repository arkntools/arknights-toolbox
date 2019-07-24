<template>
	<div class="mdui-row mdui-typo mdui-center" style="max-width: 1012px;">
		<div class="mdui-col-xs-12">
			<h1 class="mdui-m-t-0">明日方舟工具箱</h1>
			<p>Github: <a href="https://github.com/Tsuk1ko/arknights-toolbox" target="_blank">Tsuk1ko/arknights-toolbox</a></p>
			<p>宗旨是简洁美观且对移动设备友好，以及 Material Design 天下第一（。）</p>
			<p>如果有好的想法、建议、希望增加的功能，或者发现了 BUG，欢迎到项目中提 <a href="https://github.com/Tsuk1ko/arknights-toolbox/issues" target="_blank">issue</a> 或提交 pr</p>
			<h2>添加到主屏幕</h2>
			<p>可将本工具箱添加到主屏幕作为 APP 在离线环境下使用</p>
			<div class="mdui-panel mdui-panel-gapless" mdui-panel>
				<div class="mdui-panel-item">
					<div class="mdui-panel-item-header">
						<div class="mdui-panel-item-title" style="width:auto">各平台添加方法</div>
						<i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
					</div>
					<div class="mdui-panel-item-body">
						<h4 class="mdui-m-t-1 h-ul">Chrome</h4>
						<button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-b-2" @click="$root.installPWA" :disabled="$root.deferredPrompt===false">添加到主屏幕</button>
						<p>请尝试点击（如果可点击的话）</p>
						<h4 class="h-ul">Windows - Chrome</h4>
						<p>点击浏览器右上方的<i class="mdui-icon material-icons">more_vert</i>按钮，选择<code>安装“明日方舟工具箱 - by 神代綺凜”</code></p>
						<h4 class="h-ul">Android - Chrome</h4>
						<p>点击浏览器右上方的<i class="mdui-icon material-icons">more_vert</i>按钮，选择<code>添加到主屏幕</code></p>
						<h4 class="h-ul">iOS ≥ 11.3</h4>
						<p>使用 Safari 浏览器打开本工具箱页面，点击浏览器底部的分享按钮<i class="mdui-icon material-icons">crop_5_4</i><i class="mdui-icon material-icons" style="    margin-left: -24px; margin-top: -20px;">arrow_upward</i>，选择<code>添加到主屏幕</code>，接着点击右上角的“添加”即可</p>
					</div>
				</div>
			</div>
			<h2>主要功能</h2>
			<ol>
				<li>公开招募计算</li>
				<li>精英材料计算 + 导入干员材料预设 + 素材获取最优策略规划</li>
				<li>干员升级计算</li>
			</ol>
			<h2>数据来源及鸣谢</h2>
			<ul>
				<li><a href="http://wiki.joyme.com/arknights" target="_blank">明日方舟 Wiki</a>（干员数据及图片）</li>
				<li><a href="https://github.com/graueneko/graueneko.github.io" target="_blank">一只灰猫</a>（材料合成、干员升级数据）</li>
				<li><a href="https://github.com/Houdou/arkgraph" target="_blank">ark-nights.com</a>（材料图片）</li>
				<li><a href="https://penguin-stats.io/" target="_blank">企鹅物流数据统计</a>（掉落数据）</li>
				<li><a href="https://bbs.nga.cn/read.php?tid=17507710" target="_blank">素材获取最优策略规划</a>（思路）</li>
			</ul>
			<h2>其他</h2>
			<p>
				<button class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-pink-accent mdui-m-r-2" mdui-tooltip="{content:'清除本地保存的设置及输入信息',position:'top'}" @click="clear">清除本地数据</button>已用：{{lsSize}}
			</p>
			<h2>更新日志</h2>
			<h4>2019-07-14</h4>
			<p>【精英材料计算】增加关卡性价比计算</p>
			<h4>2019-07-13</h4>
			<p>【精英材料计算】点击掉落信息可显示相关关卡的掉落详情</p>
			<h4>2019-07-11</h4>
			<p>【公开招募计算】增加“显示非公开招募干员”选项（方便直接筛选干员跳转 WIKI）<br />
				【精英材料计算】增加模拟合成功能<br />
				更新了材料与干员数据，但新干员技能数据不完整（主要是专精技能），请等待 WIKI 数据更新</p>
			<h4>2019-07-08</h4>
			<p>【精英材料计算】增加材料合成所需显示</p>
			<h4>2019-06-29</h4>
			<p>增加公开招募图片识别功能（测试阶段，且有每日使用次数限制）</p>
			<h4>2019-06-27</h4>
			<p>修正“我该刷什么图”的计算逻辑<br />
				部分 UI 调整</p>
			<h4>2019-06-24</h4>
			<p>【精英材料计算】增加“显示掉落概率及期望理智”选项</p>
			<h4>2019-06-17</h4>
			<p>主要功能完工</p>
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
