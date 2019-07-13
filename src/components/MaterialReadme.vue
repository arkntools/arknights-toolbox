<template>
	<ul class="mdui-typo mdui-m-y-0" style="font-size:14px">
		<li>设置与输入会实时自动保存</li>
		<li>材料卡片的<code>仍需</code>中，小字括号中的数字表示可以合成的数量</li>
		<li>点击一次材料名字旁边的<code>合成</code>按钮可模拟一次合成行为</li>
		<li>点击材料卡片右侧的掉落信息可显示相关关卡的详细掉落情况，以及关卡性价比（越高越好）</li>
		<li><span class="mdui-text-color-pink-accent">粉色字材料</span>代表该材料存在原始需求，而不仅仅是上位材料所需的合成材料</li>
		<li><code>预设</code>用于计算干员精英化/技能升级所需材料，添加预设将会丢弃当前所有的<code>需求</code>输入，点击已添加的预设可以进行编辑；在<code>重置需求&amp;已有</code>或<code>重置需求</code>后，预设将一并被清空</li>
		<li><code>我该刷什么图</code>可以计算最优的刷图路线，仅供参考，掉落概率数据来自<a href="https://penguin-stats.io/" target="_blank">企鹅物流数据统计</a></li>
	</ul>
</template>

<script>
export default {
	name: 'material-readme',
	mounted() {
		this.$root.mutation();
	}
}
</script>
