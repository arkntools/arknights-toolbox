<template>
	<div id="arkn-material">
		<template v-if="ready">
			<div class="mdui-row mdui-m-t-4">
				<!-- 选项 -->
				<div class="mdui-col-xs-12 mdui-col-md-7 mdui-col-lg-6">
					<table class="mdui-table tag-table">
						<tbody>
							<tr>
								<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">稀有</button></td>
								<td>
									<button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn '+(allRare?color.selected:color.notSelected)" @click="selected.rare = l.fill(Array(selected.rare.length), !allRare);">全选</button>
									<tag-button v-for="i in 5" :key="`rare-${rareNum+1-i}`" v-model="selected.rare[rareNum-i]" :notSelectedColor="color.notSelected" :selectedColor="color[rareNum+1-i]">&nbsp;{{rareNum+1-i}}&nbsp;</tag-button>
									<button class="mdui-btn mdui-btn-dense mdui-color-red tag-btn" @click="selected.rare = l.concat([false], l.fill(Array(rareNum - 1), true))">重置</button>
								</td>
							</tr>
							<tr>
								<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">预设</button></td>
								<td>
									<!-- 预设 -->
									<vue-tags-input id="preset" ref="presetInput" v-model="preset" :tags="selected.presets" :allow-edit-tags="false" :autocomplete-items="presetItems" :add-only-from-autocomplete="true" :autocomplete-always-open="true" placeholder="输入干员名/拼音/拼音首字母" autocomplete="off" :class="`tags-input${preset.length===0?' empty':''}`" @tags-changed="usePreset">
										<div slot="autocomplete-header" class="mdui-list-item mdui-p-y-0 mdui-p-x-1">
											<i @click="addSelectedPresets" class="mdui-list-item-avatar mdui-icon material-icons">add</i>
											<div @click="addSelectedPresets" class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">
												<div class="mdui-list-item-title">添加所有选中的预设</div>
											</div>
											<label class="mdui-checkbox">
												<input type="checkbox" id="pcb-all" @change="e=>$root.Mdui.JQ('.pcb').prop('checked',e.target.checked)" />
												<i class="mdui-checkbox-icon"></i>
											</label>
										</div>
										<div slot="autocomplete-item" slot-scope="props" class="mdui-list-item mdui-p-y-0 mdui-p-x-1">
											<div @click="props.performAdd(props.item)" class="mdui-list-item-avatar"><img class="no-pe" :src="$root.qhimg(addition[props.item.name].img)" /></div>
											<div @click="props.performAdd(props.item)" class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">
												<div class="mdui-list-item-title">{{ props.item.name }}</div>
												<div class="mdui-list-item-text mdui-list-item-one-line">{{ props.item.info }}</div>
											</div>
											<label class="mdui-checkbox">
												<input type="checkbox" class="pcb" :key="`pcb-${props.item.text}`" :index="props.index" />
												<i class="mdui-checkbox-icon"></i>
											</label>
										</div>
									</vue-tags-input>
								</td>
							</tr>
							<tr>
								<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">选项</button></td>
								<td>
									<mdui-switch v-for="(zh, en) in settingZh" :key="en" v-model="setting[en]">{{zh}}</mdui-switch>
								</td>
							</tr>
							<tr>
								<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">操作</button></td>
								<td>
									<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-green-600 tag-btn" @click="saveData"><i class="mdui-icon material-icons">file_upload</i>备份</button>
									<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-blue-600 tag-btn" @click="restoreData"><i class="mdui-icon material-icons">file_download</i>恢复</button>
									<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset()">重置需求&amp;已有</button>
									<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('need')">仅重置需求</button>
									<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('have')">仅重置已有</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<!-- 说明 -->
				<div class="mdui-col-xs-12 mdui-col-md-5 mdui-col-lg-6 mdui-typo">
					<h4 class="mdui-hidden-md-up">说明</h4>
					<ul style="font-size:14px">
						<li>设置与输入会自动保存，点击对应的重置按钮可重置输入</li>
						<li><code>仍需</code>里，小字括号中的数字表示可以合成的数量</li>
						<li>在<code>预设</code>中可通过输入干员名字（汉字、拼音或拼音首字母）选择干员精英化或专精技能，将自动统计所需材料；点击单个预设将添加单个，也可批量选中一次添加多个预设</li>
						<li>添加预设将会丢弃当前所有的<code>需求</code>输入，在点击<code>重置需求&amp;已有</code>或<code>仅重置需求</code>按钮后，预设将被清空</li>
					</ul>
				</div>
			</div>
			<!-- 素材 -->
			<div class="mdui-row">
				<div class="mdui-col-xs-12" v-for="i in rareNum" :key="`materials-${i}`" v-show="selected.rare[rareNum-i] && !(setting.hideIrrelevant && showMaterials[rareNum+1-i].length==0)">
					<div class="mdui-typo rare-title">
						<h2>稀有度 {{rareNum+1-i}}</h2>
					</div>
					<div v-for="material in materials[rareNum+1-i]" :key="material.name" v-show="!(setting.hideIrrelevant && !showMaterials[rareNum+1-i].includes(material.name))" :class="`mdui-card${$root.smallScreen?'':' mdui-m-r-2'} mdui-m-b-2 material${(setting.translucentDisplay && hasInput && gaps[material.name][0]==0) ? ' opacity-5' : ''}`">
						<div :class="`card-triangle ${color[rareNum+1-i]}`"></div>
						<div class="mdui-card-header">
							<img class="mdui-card-header-avatar no-pe" :src="material.img" />
							<div class="mdui-card-header-title">{{material.name}}</div>
							<div class="mdui-m-t-1">
								<mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].need">需求</mdui-number-input>
								<mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].have">已有</mdui-number-input>
								<div class="gap">
									<label class="mdui-textfield-label">仍需</label>
									<span class="gap-num">{{gaps[material.name][0]}}<small v-if="gaps[material.name][1]>0">({{gaps[material.name][1]}})</small></span>
								</div>
								<ul class="source-list" v-if="l.size(material.source)>0">
									<li v-if="superSmallScreen" class="drop-point">掉落地点</li>
									<li class="source" v-for="(probability, point) in material.source" :key="`${material.name}-${point}`">
										<span class="point">{{point}}</span>
										<span :class="`probability ${color[probability]}`">{{probability}}</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
		<mdui-progress v-else></mdui-progress>
	</div>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input';
import _ from 'lodash';
import { Base64 } from 'js-base64';

function min0(x) {
	return x < 0 ? 0 : x;
}

export default {
	name: "arkn-material",
	components: {
		VueTagsInput,
	},
	data: () => ({
		l: _,
		ready: false,
		showAll: false,
		materials: {},
		addition: {},
		elite: {},
		inputs: {},
		preset: '',
		allPresets: [],
		selected: {
			rare: [],
			presets: []
		},
		setting: {
			hideIrrelevant: false,
			translucentDisplay: true
		},
		settingZh: {
			hideIrrelevant: '隐藏无关素材',
			translucentDisplay: '半透明显示已满足需求的素材'
		},
		color: {
			notSelected: 'mdui-color-brown-300',
			selected: 'mdui-color-grey-800',
			5: 'mdui-color-yellow-700',
			4: 'mdui-color-deep-purple-300',
			3: 'mdui-color-blue-600',
			2: 'mdui-color-lime',
			1: 'mdui-color-grey-700',
			'固定': 'mdui-color-grey-900',
			'小概率': 'mdui-color-grey-300',
			'中概率': 'mdui-color-grey-500',
			'大概率': 'mdui-color-grey-700',
			'罕见': 'mdui-color-red-900'
		}
	}),
	watch: {
		setting: {
			handler: val => localStorage.setItem('material.setting', JSON.stringify(val)),
			deep: true
		},
		selected: {
			handler: val => localStorage.setItem('material.selected', JSON.stringify(val)),
			deep: true
		},
		inputs: {
			handler(val) {
				for (let input of Object.values(val)) {
					for (let key of Object.keys(input)) {
						if (!['need', 'have'].includes(key)) {
							delete input[key];
							continue;
						}
						let str = input[key];
						let exec = /[^0-9]/.exec(str);
						if (exec) input[key] = (parseInt(/[0-9]*/.exec(str)[0]) || 0).toString();
					}
				}
				localStorage.setItem('material.inputs', JSON.stringify(val))
			},
			deep: true
		}
	},
	computed: {
		allRare() {
			return _.sum(this.selected.rare) == this.rareNum;
		},
		superSmallScreen() {
			return this.$root.screenWidth <= 354;
		},
		rareNum() {
			return _.size(this.materials);
		},
		inputsInt() {
			let inputsInt = {};
			for (let key in this.inputs) {
				inputsInt[key] = _.mapValues(this.inputs[key], num => parseInt(num) || 0);
			}
			return inputsInt;
		},
		gaps() {
			let inputs = this.inputsInt;
			let gaps = _.mapValues(inputs, input => input.need);
			let made = _.mapValues(inputs, () => 0);
			let used = _.mapValues(inputs, () => 0);

			// 自顶向下得到需求
			_.forInRight(this.materials, materials => {
				for (let { name, madeof } of materials) {
					gaps[name] = min0(gaps[name] - inputs[name].have);
					_.forIn(madeof, (num, m) => {
						gaps[m] += gaps[name] * num;
					});
				}
			});

			// 自底向上计算合成
			_.forIn(this.materials, materials => {
				for (let { name, madeof } of materials) {
					if (_.size(madeof) == 0) continue;
					while (gaps[name] > 0 && _.every(madeof, (num, mName) => this.inputsInt[mName].have + made[mName] - used[mName] - num >= 0)) {
						gaps[name]--;
						made[name]++
						_.forEach(madeof, (num, mName) => used[mName] += num);
					}
				}
			});

			return _.mergeWith(gaps, made, (a, b) => [a, b]);
		},
		showMaterials() {
			let r = _.mapValues(this.materials, (materials) => {
				let show = [];
				for (let { name } of materials) {
					if (this.inputsInt[name].need + this.inputsInt[name].have + this.gaps[name][0] + this.gaps[name][1] > 0)
						show.push(name);
				}
				return show;
			});
			return r;
		},
		hasInput() {
			let sum = 0;
			for (let i = 1; i <= this.rareNum; i++) {
				sum += this.showMaterials[i].length;
			}
			return sum;
		},
		presetItems() {
			this.$nextTick(() => {
				const $ = this.$root.Mdui.JQ;
				let all = $('.pcb');
				let checked = all.filter((i, e) => e.checked);
				$('#pcb-all').prop('checked', all.length == checked.length && all.length != 0);
			});
			let input = this.preset.toLowerCase();
			let result = [];
			this.allPresets.forEach(preset => {
				let { full, head } = this.addition[preset.name];
				let search = [
					preset.name.indexOf(input),
					full.indexOf(input),
					head.indexOf(input)
				];
				if (_.every(search, s => s === -1)) return;
				result.push({
					pos: _.min(search.filter(v => v >= 0)),
					preset
				});
			});
			result.sort((a, b) => a.pos == b.pos ? a.preset.name.length - b.preset.name.length : a.pos - b.pos);
			return _.map(result, 'preset').slice(0, 24);
		}
	},
	methods: {
		reset(rk, resetSetting = true) {
			if (resetSetting) {
				//this.selected.rare = _.concat([false], _.fill(Array(this.rareNum - 1), true));
				//this.setting.hideIrrelevant = false;
				if (!(rk && rk == 'have')) this.selected.presets = [];
			}
			for (let name in this.inputs) {
				let material = this.inputs[name];
				if (rk) {
					material[rk] = '';
				} else for (let key in material) {
					material[key] = '';
				}
			}
		},
		usePreset(presets) {
			this.selected.presets = presets;
			this.reset('need', false);
			for (let { need } of presets) {
				_.forEach(need, (num, name) => {
					let orig = parseInt(this.inputs[name].need) || 0;
					this.inputs[name].need = (orig + num).toString();
				});
			}
		},
		saveData() {
			const Mdui = this.$root.Mdui;
			let obj = {
				inputs: this.inputs,
				presets: this.selected.presets
			};
			let str = Base64.encode(JSON.stringify(obj));
			Mdui.prompt('请保存文本框中的所有内容', '导出备份',
				() => { },
				() => {
					Mdui.JQ('.mdui-dialog input')[0].select();
					document.execCommand('copy');
					Mdui.snackbar('复制成功');
				}, {
					history: false,
					defaultValue: str,
					cancelText: '复制到剪贴板',
					confirmText: '关闭'
				}
			);
		},
		restoreData() {
			const Mdui = this.$root.Mdui;
			Mdui.prompt('请在文本框中粘贴上次保存的内容', '导入备份',
				value => {
					if (value.length == 0) return;
					try {
						let { inputs, presets } = JSON.parse(Base64.decode(value));
						this.inputs = inputs;
						this.selected.presets = presets;
						Mdui.snackbar('导入成功');
					} catch (error) {
						Mdui.snackbar('导入失败，输入有误');
					}
				},
				() => { },
				{
					history: false,
					cancelText: '取消',
					confirmText: '导入'
				}
			);
		},
		addSelectedPresets() {
			this.$root.Mdui.JQ('.pcb')
				.filter((i, e) => e.checked)
				.map((i, e) => this.presetItems[e.attributes.index.value])
				.each((i, e) => this.$refs.presetInput.performAddTags(e));
		}
	},
	created: async function () {
		window.$$ = this.$root.Mdui.JQ;
		this.addition = await this.$root.getData('addition');
		this.elite = await this.$root.getData('elite');

		let json = await this.$root.getData('material');
		this.materials = _.groupBy(json, m => m.rare);

		// 材料数据初始化

		for (let { name } of json) {
			this.$set(this.inputs, name, {
				need: '',
				have: ''
			});
		}

		this.selected.rare = _.concat([false], _.fill(Array(this.rareNum - 1), true));

		for (let key in localStorage) {
			if (!key.startsWith('material.')) continue;
			let thisKey = key.split('.')[1];
			this[thisKey] = Object.assign({}, this[thisKey], JSON.parse(localStorage.getItem(key)));
		}

		for (let name in this.inputs) {
			let material = this.inputs[name];
			for (let key in material) {
				if (material[key] == 0) material[key] = "";
			}
		}

		// 预设方案初始化

		_.forEach(this.elite, ({ elites, skills }, name) => {
			elites.forEach((need, i) => {
				this.allPresets.push({
					text: `${name} 精${i + 1}`,
					info: `精${i + 1}`,
					name,
					need
				});
			});
			// 调整顺序
			let tempName = [];
			let temp = {};
			for (let { name: sName, level, need } of skills) {
				if (!tempName.includes(sName)) {
					tempName.push(sName);
					temp[sName] = [];
				}
				temp[sName].push({
					text: `${name} ${sName} ${level}`,
					info: `${sName} ${level}`,
					name,
					need
				});
			}
			for (let sName of tempName) {
				this.allPresets.push(...temp[sName]);
			}
		});

		this.ready = true;
	}
};
</script>

<style>
#preset.vue-tags-input {
	max-width: none;
	background-color: transparent;
}
#preset .ti-tag {
	margin-left: 0;
	margin-right: 4px;
}
#preset .ti-input {
	border: none;
	padding: 0;
	z-index: 30;
	position: relative;
	background-color: #fff;
}
#preset .ti-selected-item {
	background-color: unset;
	color: unset;
}
#preset .ti-autocomplete {
	border: none;
	min-height: 200px;
	max-height: calc(90vh - 150px);
	max-width: 400px;
	overflow-y: auto;
	box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
		0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}
#preset .ti-new-tag-input {
	font-size: 14px;
}
.vue-tags-input.empty .ti-autocomplete {
	display: none;
}
.material {
	width: 375px;
	min-width: 275px;
	display: inline-block;
}
.mobile-screen .rare-title {
	margin-left: 8px;
}
.mobile-screen .material {
	box-shadow: none;
	width: 100%;
}
.mobile-screen .material .mdui-card-header {
	padding: 0;
}
.material .mdui-card-header {
	height: auto;
}
.material .mdui-card-header > div {
	margin-left: 92px;
}
.material .mdui-card-header-avatar {
	width: 80px;
	height: 80px;
}
.material .mdui-card-header-title {
	font-size: 23px;
	line-height: 26px;
}
.source-list {
	display: inline-block;
	position: relative;
	margin: 0;
	vertical-align: top;
	padding: 0;
	font-size: 16px;
	line-height: 20px;
}
.source-list li {
	list-style-type: none;
}
.source {
	width: 95px;
	padding-bottom: 1px;
}
.point {
	vertical-align: middle;
	display: inline-block;
	width: 45px;
	text-align: right;
	padding-right: 4px;
}
.probability {
	padding: 3px 5px;
	border-radius: 2px;
	font-size: 12px;
}
.gap {
	display: inline-block;
	vertical-align: top;
	width: 40px;
}
.gap-num {
	font-size: 20px;
	line-height: 24px;
	display: inline-block;
}
.gap-num small {
	font-size: 12px;
}
.card-triangle {
	width: 40px;
	height: 40px;
	position: absolute;
	transform: rotate(45deg);
	right: -20px;
	top: -20px;
}
.drop-point {
	padding: 1px 12px;
	border-radius: 2px;
	font-size: 14px;
	line-height: 19px;
	background-color: #c7c7c7;
	color: #666;
}
@media screen and (max-width: 354px) {
	.source-list {
		left: -92px;
		width: calc(100% + 92px);
	}
	.source-list li {
		margin-top: 8px;
		display: inline-block;
	}
}
</style>
