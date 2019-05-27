<template>
	<div v-if="ready" id="akhr">
		<!-- 标签面板 -->
		<div class="mdui-row mdui-m-t-4">
			<div class="mdui-col-xs-12">
				<table class="mdui-table tag-table">
					<tbody>
						<tr>
							<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">星级</button></td>
							<td>
								<button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn '+(allStar?color.selected:color.notSelected)" @click="selected.star = l.fill(Array(selected.star.length), !allStar);">全选</button>
								<tag-button v-for="i in 6" :key="`star-${7-i}`" v-model="selected.star[6-i]" :notSelectedColor="color.notSelected" :selectedColor="color[7-i]">{{7-i}}★</tag-button>
							</td>
						</tr>
						<tr v-for="tagType in tagList.sort" :key="tagType.en">
							<td><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{tagType.zh}}</button></td>
							<td>
								<tag-button v-for="tag in tagList[tagType.en]" :key="tag" v-model="selected.tag[tag]" :notSelectedColor="color.notSelected" :selectedColor="color.selected" @click.capture="test">{{tag}}</tag-button>
							</td>
						</tr>
						<tr>
							<td><button class="mdui-btn mdui-btn-dense mdui-color-red tag-btn" @click="reset">重置</button></td>
							<td>
								<mdui-switch v-model="showAvatar">显示头像</mdui-switch>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<!-- 结果表格 -->
		<div class="mdui-row mdui-m-t-4">
			<div class="mdui-col-xs-12">
				<div class="mdui-table-fluid">
					<table id="comb-table" class="mdui-table mdui-table-hoverable">
						<thead>
							<tr>
								<th width="1" class="mdui-table-col-numeric">#</th>
								<th width="20%">词条</th>
								<th width="1" class="mdui-text-center">可保底</th>
								<th width="80%">可能出现（点击干员查看详细信息）</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(comb,i) in combinations" :key="`comb-${i}`">
								<td>{{i+1}}</td>
								<td :class="$root.screenWidth<=450?'no-wrap':false"><button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{tag}}</button></td>
								<td><button :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color[comb.min]}`">{{comb.min}}★</button></td>
								<td :class="$root.screenWidth<=450?'no-wrap':false">
									<button v-for="ci in comb.chars" :key="`comb-${i}-${ci}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[akhr[ci].star]}`" :has-avatar="showAvatar">
										<img class="tag-avatar" v-if="showAvatar" :src="akhr[ci].img" />
										{{akhr[ci].name}}
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<!-- 详细信息 -->
		<div id="detail" class="mdui-dialog mdui-card">
			<div class="mdui-card-header detail-header mdui-p-b-0">
				<img class="mdui-card-header-avatar" :src="detail.img" />
				<div class="mdui-card-header-title">
					<span>{{detail.name}}</span>
					<button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-l-1 mdui-m-y-0 ${color.selected}`">{{detail.job}}</button>
					<button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-y-0 ${color[detail.star]}`">{{detail.star}}★</button>
				</div>
				<div class="mdui-card-header-subtitle">{{detail.characteristic}}</div>
				<div class="detail-tags">
					<button v-for="tag in detail.tags" :key="`detail-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${selected.tag[tag]?color.selected:color.notSelected}`">{{tag}}</button>
				</div>
			</div>
			<div class="mdui-dialog-actions">
				<a class="mdui-btn mdui-ripple mdui-color-teal" :href="`http://wiki.joyme.com${detail.link}`" target="_blank">在 Wiki 查看</a>
				<button class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-close>关闭</button>
			</div>
		</div>
	</div>
</template>

<script>
import Ajax from '@/ajax'
import 'lodash.combinations';
import _ from 'lodash';

let tagsCache = [];

export default {
	name: "akhr",
	data: () => ({
		l: _,
		ready: false,
		showAll: false,
		akhr: [],
		tags: {
			'资深干员': [],
			'高级资深干员': []
		},
		selected: {
			star: _.fill(Array(6), true),
			tag: {}
		},
		showAvatar: false,
		avgCharTag: 0,
		tagList: {
			sex: ['男性干员', '女性干员'],
			location: ['近战位', '远程位'],
			credentials: ['新手', '资深干员', '高级资深干员'],
			class: ['先锋干员', '狙击干员', '医疗干员', '术师干员', '近卫干员', '重装干员', '辅助干员', '特种干员'],
			features: new Set(),
			sort: [
				{ zh: '资质', en: 'credentials' },
				{ zh: '位置', en: 'location' },
				{ zh: '性别', en: 'sex' },
				{ zh: '职阶', en: 'class' },
				{ zh: '特性', en: 'features' }
			],
		},
		color: {
			notSelected: 'mdui-color-brown-300',
			selected: 'mdui-color-grey-800',
			6: 'mdui-color-red-700',
			5: 'mdui-color-orange-900',
			4: 'mdui-color-cyan-700',
			3: 'mdui-color-green-700',
			2: 'mdui-color-brown-700',
			1: 'mdui-color-grey-700'
		},
		detail: 0
	}),
	watch: {
		'selected.tag': {
			handler: function () {
				let tags = _.flatMap(this.selected.tag, (selected, tag) => selected ? [tag] : []);
				if (tags.length > 6) {
					new this.$root.Mdui.alert('最多只能同时选择 6 个词条噢！', null, null, {
						confirmText: '好吧',
						history: false
					});
					for (let tag in this.selected.tag) {
						this.selected.tag[tag] = tagsCache.includes(tag);
					}
					tags = tagsCache;
				} else tagsCache = tags;
			},
			deep: true
		}
	},
	computed: {
		allStar() {
			return _.sum(this.selected.star) == this.selected.star.length;
		},
		combinations() {
			let tags = _.flatMap(this.selected.tag, (selected, tag) => selected ? [tag] : []);
			let rares = _.flatMap(this.selected.star, (selected, star) => selected ? [star + 1] : []);
			let combs = _.flatMap([1, 2, 3], v => _.combinations(tags, v));
			let result = [];
			for (let comb of combs) {
				let need = [];
				for (let tag of comb) need.push(this.tags[tag]);
				let chars = _.intersection(...need);
				if (!comb.includes('高级资深干员')) _.remove(chars, i => this.akhr[i].star == 6);
				if (chars.length == 0) continue;

				let scoreChars = _.filter(chars, i => this.akhr[i].star >= 3);
				if (scoreChars.length == 0) scoreChars = chars;
				let score = _.sumBy(scoreChars, i => this.akhr[i].star) / scoreChars.length - comb.length / 10 - scoreChars.length / this.avgCharTag;

				let minI = _.minBy(scoreChars, i => this.akhr[i].star);

				_.remove(chars, i => !rares.includes(this.akhr[i].star));
				if (chars.length == 0) continue;

				result.push({
					tags: comb,
					chars,
					min: this.akhr[minI].star,
					score
				});
			}
			result.sort((a, b) => (a.min == b.min ? b.score - a.score : b.min - a.min));
			return result;
		}
	},
	methods: {
		reset() {
			this.selected.star = _.fill(Array(6), true);
			for (let tag in this.selected.tag) {
				this.selected.tag[tag] = false;
			}
		},
		showDetail(i) {
			this.detail = this.akhr[i];
			this.$root.$nextTick(() => new this.$root.Mdui.Dialog('#detail', { history: false }).open());
		}
	},
	created: async function () {
		this.akhr = await Ajax.get(`${process.env.BASE_URL}data/akhr.json`);
		this.akhr.sort((a, b) => b.star - a.star);

		let charTagSum = 0;
		const notFeaturesTag = this.tagList.location.concat(this.tagList.credentials);

		this.akhr.forEach(({ pub, sex, tags, job, star }, i) => {
			if (!pub) return;
			for (let tag of tags) {
				if (!notFeaturesTag.includes(tag)) this.tagList.features.add(tag);
			}
			switch (star) {
				case 5: this.tags['资深干员'].push(i); break;
				case 6: this.tags['高级资深干员'].push(i); break;
			}
			tags.push(`${sex}性干员`);
			tags.push(`${job}干员`);
			for (let tag of tags) {
				if (!this.tags[tag]) this.tags[tag] = [];
				this.tags[tag].push(i);
			}
			charTagSum += tags.length;
		});

		let tagCount = _.size(this.tags);
		this.avgCharTag = charTagSum / tagCount;

		this.tagList.features = Array.from(this.tagList.features).sort((a, b) => {
			if (a.length == b.length) return a.localeCompare(b);
			return a.length - b.length;
		});

		for (let tag in this.tags) {
			this.$set(this.selected.tag, tag, false);
		}

		this.ready = true;
	}
};
</script>

<style>
#comb-table th,
#comb-table td {
	padding-top: 0.5em;
	padding-bottom: 0.5em;
}
#comb-table th:not(:first-child):not(:last-child),
#comb-table td:not(:first-child):not(:last-child) {
	padding-right: 0;
}
.detail-header {
	height: auto;
}
.detail-header div {
	margin-left: 92px;
}
#detail .mdui-card-header-avatar {
	width: 80px;
	height: 80px;
}
#detail .mdui-card-header-title {
	font-size: 23px;
	line-height: 28px;
	display: flex;
}
#detail .mdui-card-header-subtitle {
	font-size: 16px;
	line-height: 24px;
	margin-top: 3px;
	white-space: normal;
}
#detail .mdui-card-header-title .tag-btn {
	height: 28px;
	line-height: 28px;
}
</style>
