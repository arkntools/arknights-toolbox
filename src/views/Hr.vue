<template>
	<div id="arkn-hr">
		<!-- 标签面板 -->
		<div class="mdui-row">
			<div class="mdui-col-xs-12">
				<div id="drawer" :class="$root.smallScreen?'mdui-drawer mdui-drawer-right mdui-drawer-close':false">
					<table class="mdui-table tag-table">
						<tbody>
							<tr>
								<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">星级</button></td>
								<td>
									<button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn '+(allStar?color.selected:color.notSelected)" @click="selected.star = l.fill(Array(selected.star.length), !allStar);">全选</button>
									<tag-button v-for="i in 6" :key="`star-${7-i}`" v-model="selected.star[6-i]" :notSelectedColor="color.notSelected" :selectedColor="color[7-i]">{{7-i}}★</tag-button>
								</td>
							</tr>
							<tr v-for="tagType in tagList.sort" :key="tagType.en">
								<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{tagType.zh}}</button></td>
								<td>
									<tag-button v-for="tag in tagList[tagType.en]" :key="`${tagType.en}-${tag}`" v-model="selected.tag[tag]" :notSelectedColor="color.notSelected" :selectedColor="color.selected" @click.capture="test">{{tag}}</tag-button>
								</td>
							</tr>
							<tr>
								<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">设置</button></td>
								<td>
									<mdui-switch v-for="(zh, en) in settingZh" :key="en" v-model="setting[en]">{{zh}}</mdui-switch>
								</td>
							</tr>
							<tr>
								<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">操作</button></td>
								<td>
									<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset">重置</button>
									<label class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-purple tag-btn" for="image-select" mdui-tooltip="{content:'PC上可直接将图片拖至此处',position:'top'}" @dragover.prevent @drop.prevent="e => tagImg = e.dataTransfer.files[0]" >识别词条截图</label>
									<input type="file" id="image-select" accept="image/*" style="display:none" ref="image" @change="tagImg = $refs.image.files[0]" />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<!-- 提示 -->
		<div v-if="selected.tag['高级资深干员']||selected.tag['资深干员']" class="mdui-chip mdui-m-t-4">
			<span class="mdui-chip-icon mdui-color-red"><i class="mdui-icon material-icons">priority_high</i></span>
			<span class="mdui-chip-title mdui-text-truncate" :style="$root.screenWidth<360?'font-size:12px':false">请拉满 9 个小时以保证词条不被划掉</span>
		</div>
		<!-- 结果表格 -->
		<div :class="`mdui-row ${$root.smallScreen?'':'mdui-m-t-4'}`">
			<div class="mdui-col-xs-12">
				<div v-if="!$root.smallScreen" class="comb-large">
					<table class="mdui-table mdui-table-hoverable comb-table">
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
								<td><button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{tag}}</button></td>
								<td><button :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color[comb.min]}`">{{comb.min}}★</button></td>
								<td>
									<button v-for="ci in comb.chars" :key="`comb-${i}-${ci}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[hr[ci].star]}`" :has-avatar="setting.showAvatar" @click="showDetail(ci)">
										<img class="tag-avatar no-pe" v-if="setting.showAvatar" :src="$root.avatar(addition[hr[ci].name])" />
										{{hr[ci].name}}
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div v-else class="comb-small">
					<table class="mdui-table comb-table mdui-shadow-0 no-border">
						<thead>
							<tr>
								<th>词条</th>
								<th>可能出现（点击干员查看详情）</th>
							</tr>
						</thead>
						<tbody>
							<template v-for="(comb,i) in combinations">
								<tr :key="`comb-${i}-tr1`">
									<td class="mdui-p-b-0 no-border" colspan="2"><button v-for="tag in comb.tags" :key="`comb-${i}-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${color.selected}`">{{tag}}</button></td>
								</tr>
								<tr :key="`comb-${i}-tr2`">
									<td colspan="2">
										<button v-for="ci in comb.chars" :key="`comb-${i}-${ci}`" :class="`mdui-btn mdui-btn-dense tag-btn ${color[hr[ci].star]}`" :has-avatar="setting.showAvatar" @click="showDetail(ci)">
											<img class="tag-avatar no-pe" v-if="setting.showAvatar" :src="$root.avatar(addition[hr[ci].name])" />
											{{hr[ci].name}}
										</button>
									</td>
								</tr>
							</template>
							<tr v-if="combinations.length==0">
								<td colspan="2" class="no-border">请点击右下角的按钮选择词条</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<!-- 详细信息 -->
		<div id="detail" class="mdui-dialog mdui-card">
			<div class="mdui-card-header mdui-p-b-0">
				<img class="mdui-card-header-avatar no-pe" :key="`di-${detail.name}`" :src="addition[detail.name]?$root.avatar(addition[detail.name]):false" />
				<div class="mdui-card-header-title">
					<span>{{detail.name}}</span>
					<button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-l-1 mdui-m-y-0 ${color.selected}`">{{detail.job}}</button>
					<button :class="`mdui-btn mdui-btn-dense no-pe tag-btn mdui-m-y-0 ${color[detail.star]}`">{{detail.star}}★</button>
				</div>
				<div class="mdui-card-header-subtitle">{{detail.memo}}</div>
				<div class="detail-tags">
					<button v-for="tag in detail.tags" :key="`detail-${tag}`" :class="`mdui-btn mdui-btn-dense no-pe tag-btn ${selected.tag[tag]?color.selected:color.notSelected}`">{{tag}}</button>
				</div>
			</div>
			<div class="mdui-dialog-actions">
				<a class="mdui-btn mdui-ripple mdui-color-teal" :href="`http://wiki.joyme.com/arknights/${detail.name}`" target="_blank">在 Wiki 查看</a>
				<button class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-close>关闭</button>
			</div>
		</div>
		<!-- 浮动按钮 -->
		<button v-if="$root.smallScreen" class="mdui-fab mdui-fab-fixed mdui-fab-mini mdui-color-pink-accent mdui-ripple" @click="drawer?null:drawer=new $root.Mdui.Drawer('#drawer');drawer.toggle()" style="z-index:10000"><i class="mdui-icon material-icons">sort</i></button>
	</div>
</template>

<script>
import 'lodash.combinations';
import _ from 'lodash';
import Ajax from '../ajax';

import ADDITION from '../data/addition.json';
import HR from '../data/hr.json';

let tagsCache = [];

export default {
	name: "arkn-hr",
	data: () => ({
		l: _,
		showAll: false,
		hr: HR,
		addition: ADDITION,
		tags: {
			'资深干员': [],
			'高级资深干员': []
		},
		selected: {
			star: _.fill(Array(6), true),
			tag: {}
		},
		setting: {
			showAvatar: false,
			hide12: false,
			hideSingleFemale: false
		},
		settingZh: {
			showAvatar: '显示头像',
			hide12: '隐藏1★2★',
			hideSingleFemale: '隐藏单独的“女性干员”词条'
		},
		avgCharTag: 0,
		tagList: {
			sex: ['男性干员', '女性干员'],
			location: ['近战位', '远程位'],
			credentials: ['新手', '资深干员', '高级资深干员'],
			job: ['先锋干员', '狙击干员', '医疗干员', '术师干员', '近卫干员', '重装干员', '辅助干员', '特种干员'],
			features: new Set(),
			sort: [
				{ zh: '资质', en: 'credentials' },
				{ zh: '位置', en: 'location' },
				{ zh: '性别', en: 'sex' },
				{ zh: '职业', en: 'job' },
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
		detail: 0,
		drawer: false,
		tagImg: false
	}),
	watch: {
		'selected.tag': {
			handler() {
				//nm
				if (_.filter(['高级资深干员', '资深干员', '爆发', '控场', '召唤'], t => this.selected.tag[t]).length > 0) this.$root.nm = true;
				else this.$root.nm = false;
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
		},
		setting: {
			handler(val) {
				localStorage.setItem('hr.setting', JSON.stringify(val));
			},
			deep: true
		},
		tagImg(file) {
			this.ocr(file);
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
				if (this.setting.hideSingleFemale && comb.length == 1 && comb[0] == '女性干员') continue;

				let need = [];
				for (let tag of comb) need.push(this.tags[tag]);
				let chars = _.intersection(...need);
				if (!comb.includes('高级资深干员')) _.remove(chars, i => this.hr[i].star == 6);
				if (chars.length == 0) continue;

				let scoreChars = _.filter(chars, i => this.hr[i].star >= 3);
				if (scoreChars.length == 0) scoreChars = chars;
				let score = _.sumBy(scoreChars, i => this.hr[i].star) / scoreChars.length - comb.length / 10 - scoreChars.length / this.avgCharTag;

				let minI = _.minBy(scoreChars, i => this.hr[i].star);

				_.remove(chars, i => !rares.includes(this.hr[i].star));
				if (this.setting.hide12) _.remove(chars, i => this.hr[i].star < 3);
				if (chars.length == 0) continue;

				result.push({
					tags: comb,
					chars,
					min: this.hr[minI].star,
					score
				});
			}
			result.sort((a, b) => (a.min == b.min ? b.score - a.score : b.min - a.min));
			return result;
		}
	},
	methods: {
		reset() {
			this.selected.star = _.fill(Array(this.selected.star.length), true);
			for (let tag in this.selected.tag) {
				this.selected.tag[tag] = false;
			}
		},
		showDetail(i) {
			this.detail = this.hr[i];
			this.$nextTick(() => new this.$root.Mdui.Dialog('#detail', { history: false }).open());
		},
		async ocr(file, old) {
			const snackbar = this.$root.snackbar;
			let sb = snackbar({
				message: '识别词条中，请耐心等待',
				timeout: 0
			});
			// 上传图片至 sm.ms
			let smms = old || await Ajax.smms(file).catch(e => {
				console.error(e);
				return { code: 'error', msg: e };
			});
			if (smms.code == 'error') {
				sb.close();
				snackbar({
					message: `错误：${smms.msg}`,
					timeout: 0,
					buttonText: '重试',
					onButtonClick: () => this.ocr(file)
				});
				return;
			}
			// 调用 ocr.space
			let result = await Ajax.corsGet(`https://api.ocr.space/parse/imageurl?apikey=helloworld&language=chs&scale=true&url=${smms.data.url}`).catch(e => {
				console.error(e);
				return { IsErroredOnProcessing: true, ErrorMessage: e };
			});
			if (result.IsErroredOnProcessing) {
				sb.close();
				snackbar({
					message: `错误：${result.ErrorMessage}`,
					timeout: 0,
					buttonText: '重试',
					onButtonClick: () => this.ocr(file, smms)
				});
				return;
			}
			// 删除上传的图片
			Ajax.get(smms.data.delete);
			// 处理识别结果
			this.reset();
			let words = result.ParsedResults[0].ParsedText.split('\r\n');
			console.log('识别结果：', words);
			for (let word of words) {
				if (word in this.selected.tag) this.selected.tag[word] = true;
			}
			sb.close();
		}
	},
	created() {
		this.hr.sort((a, b) => b.star - a.star);

		let charTagSum = 0;
		const notFeaturesTag = this.tagList.location.concat(this.tagList.credentials, this.tagList.job, this.tagList.sex);

		this.hr.forEach(({ pub, sex, tags, job, star }, i) => {
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

		let setting = localStorage.getItem('hr.setting');
		if (setting) this.setting = JSON.parse(setting);
	}
};
</script>

<style>
#drawer {
	min-width: 290px;
}
.comb-table th,
.comb-table td {
	padding-top: 0.5em;
	padding-bottom: 0.5em;
}
.comb-table th:not(:first-child):not(:last-child),
.comb-table td:not(:first-child):not(:last-child) {
	padding-right: 0;
}
#detail .mdui-card-header {
	height: auto;
}
#detail .mdui-card-header > div {
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
.comb-small .mdui-table td:first-child {
	padding-left: 14px;
}
.comb-small .mdui-table td:last-child {
	padding-right: 14px !important;
}
</style>
