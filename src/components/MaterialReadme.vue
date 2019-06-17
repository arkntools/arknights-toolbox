<template>
	<ul class="mdui-typo mdui-m-y-0" style="font-size:14px">
		<li>设置与输入会自动保存，点击对应的重置按钮可重置输入</li>
		<li>在材料卡片的<code>仍需</code>中，小字括号中的数字表示可以合成的数量</li>
		<li><span class="mdui-text-color-pink-accent">粉色字材料</span>代表该材料存在原始需求，而不仅仅是上位材料所需的合成材料</li>
		<li>在<code>预设</code>中可通过输入干员名字（汉字、拼音或拼音首字母）选择干员，然后选择精英化及技能来添加预设，将自动统计所需材料</li>
		<li>可添加多个预设，点击已添加的预设可以进行编辑；添加预设将会丢弃当前所有的<code>需求</code>输入</li>
		<li>在<code>重置需求&amp;已有</code>或<code>仅重置需求</code>后，预设将一并被清空</li>
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
