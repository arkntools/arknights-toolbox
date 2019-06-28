<template>
	<div id="arkn-material">
		<div class="mdui-row">
			<!-- 选项 -->
			<div class="mdui-col-lg-6">
				<table class="mdui-table tag-table">
					<tbody>
						<tr>
							<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">稀有</button></td>
							<td>
								<label v-if="$root.smallScreen" class="mdui-textfield-label">稀有度</label>
								<button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn '+(allRare?color.selected:color.notSelected)" @click="selected.rare = l.fill(Array(selected.rare.length), !allRare);">全选</button>
								<tag-button v-for="i in 5" :key="`rare-${rareNum+1-i}`" v-model="selected.rare[rareNum-i]" :notSelectedColor="color.notSelected" :selectedColor="color[rareNum+1-i]">&nbsp;{{rareNum+1-i}}&nbsp;</tag-button>
								<button class="mdui-btn mdui-btn-dense mdui-color-red tag-btn" @click="selected.rare = l.concat([false], l.fill(Array(rareNum - 1), true))">重置</button>
							</td>
						</tr>
						<tr>
							<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">预设</button></td>
							<td>
								<label v-if="$root.smallScreen" class="mdui-textfield-label">预设</label>
								<!-- 预设 -->
								<vue-tags-input id="preset" ref="presetInput" v-model="preset" :tags="selected.presets" :allow-edit-tags="false" :add-from-paste="false" :add-on-blur="false" :autocomplete-items="presetItems" :add-only-from-autocomplete="true" :autocomplete-always-open="true" placeholder="输入干员名/拼音/拼音首字母" autocomplete="off" :class="`tags-input${preset.length===0?' empty':''}`" @tags-changed="usePreset" @before-adding-tag="obj=>showPreset(obj)">
									<div slot="autocomplete-item" slot-scope="props" @click="props.performAdd(props.item)" class="mdui-list-item mdui-p-y-0 mdui-p-x-1">
										<div class="mdui-list-item-avatar"><img class="no-pe" :key="`head-${props.item.text}`" :src="$root.avatar(addition[props.item.text])" /></div>
										<div class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">{{ props.item.text }}</div>
									</div>
									<span class="no-sl" slot="tag-center" slot-scope="props" @click="showPreset(props,true)">{{ props.tag.text }}</span>
								</vue-tags-input>
							</td>
						</tr>
						<tr>
							<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">选项</button></td>
							<td>
								<mdui-switch v-for="(zh, en) in settingZh" :key="en" v-model="setting[en]" :html="zh"></mdui-switch>
							</td>
						</tr>
						<tr>
							<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">操作</button></td>
							<td>
								<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset()">重置需求&amp;已有</button>
								<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('need')">仅重置需求</button>
								<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('have')">仅重置已有</button>
								<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-green-600 tag-btn" @click="saveData"><i class="mdui-icon material-icons">file_upload</i>备份</button>
								<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-blue-600 tag-btn" @click="restoreData"><i class="mdui-icon material-icons">file_download</i>恢复</button>
							</td>
						</tr>
						<tr>
							<td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">计算</button></td>
							<td>
								<button id="ark-planner-btn" class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-purple tag-btn" :disabled="apbDisabled" @click="apbDisabled=true;initPlanner().then(()=>{showPlan();apbDisabled=false;});">我该刷什么图</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- 说明 -->
			<div class="mdui-col-lg-6">
				<material-readme class="mdui-hidden-md-down" />
				<div class="mdui-panel mdui-panel-gapless mdui-hidden-lg-up mdui-m-t-2" mdui-panel>
					<div class="mdui-panel-item">
						<div class="mdui-panel-item-header">
							<div class="mdui-panel-item-title">说明</div>
							<i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
						</div>
						<div class="mdui-panel-item-body mdui-p-l-0">
							<material-readme />
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 素材 -->
		<div class="mdui-row">
			<div class="mdui-col-xs-12" v-for="i in rareNum" :key="`materials-${i}`" v-show="showMaterials[rareNum+1-i].length>0">
				<div class="mdui-typo rare-title">
					<h2>稀有度 {{rareNum+1-i}}</h2>
				</div>
				<div v-for="material in materials[rareNum+1-i]" :key="material.name" v-show="showMaterials[rareNum+1-i].includes(material.name)" :class="`mdui-card${$root.smallScreen?'':' mdui-m-r-2'} mdui-m-b-2 material${(setting.translucentDisplay && hasInput && gaps[material.name][0]==0) ? ' opacity-5' : ''}`">
					<div :class="`card-triangle ${color[rareNum+1-i]}`"></div>
					<div class="mdui-card-header">
						<div class="mdui-card-header-avatar mdui-valign no-sl" :t="rareNum+1-i">
							<img class="no-pe" :src="`/assets/img/material/${material.img}`" />
						</div>
						<div :class="`mdui-card-header-title${inputs[material.name].need>0?' mdui-text-color-pink-accent':''}`">{{material.name}}</div>
						<div class="mdui-m-t-1">
							<mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].need">需求</mdui-number-input>
							<mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].have">已有</mdui-number-input>
							<div class="gap">
								<label class="mdui-textfield-label">仍需</label>
								<span class="gap-num">{{gaps[material.name][0]}}<small v-if="gaps[material.name][1]>0">({{gaps[material.name][1]}})</small></span>
							</div>
							<ul class="source-list" v-if="l.size(material.source)>0">
								<li v-if="superSmallScreen" class="drop-point">掉落信息</li>
								<li class="source" v-for="(probability, point) in material.source" :key="`${material.name}-${point}`">
									<span class="point">{{point}}</span>
									<span v-if="setting.showDropProbability && plannerInited && showDPFlag" :class="`probability with-show ${color[probability]}`">
										<span class="show-1">{{l.padEnd(l.round(dropTable[point][material.name]*100,1).toPrecision(3),5,'&nbsp;')}}%</span>
										<span class="show-2">{{(dropTable[point].cost/dropTable[point][material.name]).toPrecision(3)}}⚡</span>
									</span>
									<span v-else :class="`probability ${color[probability]}`">{{probability}}</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 详细信息 -->
		<div id="preset-setting" class="mdui-dialog mdui-card">
			<template v-if="sp">
				<div class="mdui-card-header mdui-p-b-0">
					<img class="mdui-card-header-avatar no-pe" :src="addition[selectedPresetName]?$root.avatar(addition[selectedPresetName]):false" />
					<div class="mdui-card-header-title">{{selectedPresetName}}</div>
				</div>
				<div class="mdui-card-content preset-list mdui-p-x-3">
					<div class="elite-cb-list">
						<mdui-checkbox v-for="(o,i) in sp.elites" :key="`elite-${i+1}`" v-model="pSetting.elites[i]">精{{i+1}}</mdui-checkbox>
					</div>
					<div class="skill-normal" v-if="sp.skills.normal.length>=2">
						<mdui-checkbox v-model="pSetting.skills.normal[0]" class="skill-cb">技能</mdui-checkbox>
						<div class="inline-block">
							<mdui-select-num v-model="pSetting.skills.normal[1]" :options="l.range(1,sp.skills.normal.length+1)" @change="$root.mutation();if(pSetting.skills.normal[1]>=pSetting.skills.normal[2]) pSetting.skills.normal[2]=pSetting.skills.normal[1]+1"></mdui-select-num>
							<i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
							<span :key="`sn-s-${pSetting.skills.normal[1]+1}`">
								<mdui-select-num v-model="pSetting.skills.normal[2]" :options="l.range(pSetting.skills.normal[1]+1,sp.skills.normal.length+2)"></mdui-select-num>
							</span>
						</div>
					</div>
					<template v-if="sp.skills.elite.length>0">
						<div class="skill-elite" v-for="(skill, i) in sp.skills.elite" :key="`se-${skill.name}`">
							<mdui-checkbox v-model="pSetting.skills.elite[i][0]" class="skill-cb">{{skill.name}}</mdui-checkbox>
							<div class="inline-block">
								<mdui-select-num v-model="pSetting.skills.elite[i][1]" :options="l.range(sp.skills.normal.length+1,sp.skills.normal.length+skill.need.length+1)" @change="$root.mutation();if(pSetting.skills.elite[i][1]>=pSetting.skills.elite[i][2]) pSetting.skills.elite[i][2]=pSetting.skills.elite[i][1]+1"></mdui-select-num>
								<i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
								<span :key="`se-s-${pSetting.skills.elite[i][1]+1}`">
									<mdui-select-num v-model="pSetting.skills.elite[i][2]" :options="l.range(pSetting.skills.elite[i][1]+1,sp.skills.normal.length+skill.need.length+2)"></mdui-select-num>
								</span>
							</div>
						</div>
					</template>
				</div>
			</template>
			<div class="mdui-dialog-actions">
				<button class="mdui-btn mdui-ripple" mdui-dialog-cancel>取消</button>
				<button v-if="this.pSetting.state=='add'" class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-confirm @click="addPreset">添加</button>
				<button v-if="this.pSetting.state=='edit'" class="mdui-btn mdui-ripple mdui-color-teal" mdui-dialog-confirm @click="editPreset">修改</button>
			</div>
		</div>
		<!-- Planner -->
		<div id="planner" class="mdui-dialog mdui-typo">
			<template v-if="plan">
				<div class="mdui-dialog-title">
					结果仅供参考
					<p class="mdui-m-b-0 mdui-m-t-2" style="font-size:15px">
						预计消耗理智：<code>{{plan.cost}}</code><br />
						<span class="mdui-text-color-blue-900">关卡</span> × <span class="mdui-text-color-pink-accent">次数</span>&nbsp;&nbsp;(<span class="mdui-text-color-yellow-900">理智</span>)&nbsp;&nbsp;<span class="mdui-text-color-black blod-text">需求产物</span>&nbsp;&nbsp;<span style="color:rgba(0,0,0,.7);">副产物</span>
					</p>
				</div>
				<div class="mdui-dialog-content">
					<div class="stage" v-for="stage in plan.stages" :key="stage.code">
						<h5 class="h-ul"><span class="mdui-text-color-blue-900">{{stage.code}}</span> × <span class="mdui-text-color-pink-accent">{{stage.times}}</span>&nbsp;&nbsp;(<span class="mdui-text-color-yellow-900">{{stage.cost}}</span>)</h5>
						<div class="num-item-list">
							<arkn-num-item v-for="drop in stage.drops" :key="`${stage.code}-${drop.name}`" :t="materialsTable[drop.name].rare" :img="materialsTable[drop.name].img" :lable="drop.name" :num="drop.num" :color="gaps[drop.name][0]>0?'mdui-text-color-black blod-text':false" />
						</div>
					</div>
					<div class="stage" v-if="plan.synthesis.length>0">
						<h5 class="h-ul">需要合成</h5>
						<div class="num-item-list">
							<arkn-num-item v-for="m in plan.synthesis" :key="`合成-${m.name}`" :t="materialsTable[m.name].rare" :img="materialsTable[m.name].img" :lable="m.name" :num="m.num" />
						</div>
					</div>
				</div>
			</template>
			<div class="mdui-dialog-actions">
				<button class="mdui-btn mdui-ripple" mdui-dialog-cancel>关闭</button>
			</div>
		</div>
	</div>
</template>

<script>
import ArknNumItem from '../components/ArknNumItem';
import MaterialReadme from '../components/MaterialReadme';
import VueTagsInput from '@johmun/vue-tags-input';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import Ajax from '../ajax';
import linprog from 'javascript-lp-solver/src/solver';

import ADDITION from '../data/addition.json';
import ELITE from '../data/elite.json';
import MATERIAL from '../data/material.json';

const penguinURL = 'https://penguin-stats.io/PenguinStats/api/result/matrix?show_stage_details=true&show_item_details=true';

const synthesisTable = {
	le3: {},
	gt3: {}
};
const materialConstraints = {};
const dropTable = {};

let pSettingInit = {
	elites: [false, false],
	skills: {
		normal: [false, 1, 7],
		elite: [
			[false, 7, 10],
			[false, 7, 10],
			[false, 7, 10]
		]
	},
	state: 'add'
};

let lastShowMaterials = [];

function min0(x) {
	return x < 0 ? 0 : x;
}

export default {
	name: "arkn-material",
	components: {
		VueTagsInput,
		MaterialReadme,
		ArknNumItem
	},
	data: () => ({
		l: _,
		showAll: false,
		materials: MATERIAL,
		materialsTable: _.transform(MATERIAL, (r, v) => r[v.name] = v, {}),
		//materialList: [],
		addition: ADDITION,
		elite: ELITE,
		inputs: {},
		preset: '',
		selectedPresetName: '',
		selectedPreset: false,
		pSetting: _.cloneDeep(pSettingInit),
		presetDialog: false,
		selected: {
			rare: [],
			presets: []
		},
		setting: {
			hideIrrelevant: false,
			translucentDisplay: true,
			stopSynthetiseLE3: false,
			showDropProbability: false
		},
		settingZh: {
			hideIrrelevant: '隐藏无关素材',
			translucentDisplay: '半透明显示已满足需求的素材',
			stopSynthetiseLE3: '不计算<span class="mdui-text-color-blue-600">稀有度3</span>及以下材料的合成需求',
			showDropProbability: '显示掉落概率(%)及期望理智(⚡)'
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
		},
		penguinData: {
			expire: 0,
			data: false
		},
		plannerInited: false,
		dropTable: {},
		plannerResult: {},
		plannerDialog: false,
		apbDisabled: false,
		showDPFlag: true
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
		},
		'setting.showDropProbability': function (val) {
			if (val) this.initPlanner();
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
			_.forInRight(this.materials, (materials, i) => {
				for (let { name, madeof } of materials) {
					gaps[name] = min0(gaps[name] - inputs[name].have);
					if (this.setting.stopSynthetiseLE3 && i <= 3) continue;
					_.forIn(madeof, (num, m) => {
						gaps[m] += gaps[name] * num;
					});
				}
			});

			// 自底向上计算合成
			_.forIn(this.materials, (materials, i) => {
				for (let { name, madeof } of materials) {
					if (_.size(madeof) == 0 || (this.setting.stopSynthetiseLE3 && i <= 3)) continue;
					while (gaps[name] > 0 && _.every(madeof, (num, mName) => this.inputsInt[mName].have + made[mName] - used[mName] - num >= 0)) {
						gaps[name]--;
						made[name]++
						_.forEach(madeof, (num, mName) => used[mName] += num);
					}
				}
			});

			return _.mergeWith(gaps, made, (a, b) => [a, b]);
		},
		hasDataMaterials() {
			return _.mapValues(this.materials, (materials) => {
				let show = [];
				for (let { name } of materials) {
					if (this.inputsInt[name].need + this.inputsInt[name].have + this.gaps[name][0] + this.gaps[name][1] > 0)
						show.push(name);
				}
				return show;
			});
		},
		showMaterials() {
			let result = _.mapValues(this.materials, (materials, rareNum) => {
				let show = [];
				for (let { name } of materials) {
					if (this.inputsInt[name].need > 0 || (this.inputsInt[name].need == 0 && this.selected.rare[rareNum - 1] && (this.hasDataMaterials[rareNum].includes(name) || (!this.hasDataMaterials[rareNum].includes(name) && !(this.setting.hideIrrelevant && this.hasInput)))))
						show.push(name);
				}
				return show;
			});

			if (!_.isEqual(lastShowMaterials, result)) {
				lastShowMaterials = _.cloneDeep(result);
				// 刷新动画，否则动画不同步
				this.showDPFlag = false;
				this.$nextTick(() => this.showDPFlag = true)
			}

			return result;
		},
		hasInput() {
			let sum = 0;
			for (let i = 1; i <= this.rareNum; i++) {
				sum += this.hasDataMaterials[i].length;
			}
			return sum;
		},
		presetItems() {
			let input = this.preset.toLowerCase();
			let result = [];
			for (let name in this.elite) {
				let { full, head } = this.addition[name];
				let search = [
					name.indexOf(input),
					full.indexOf(input),
					head.indexOf(input)
				];
				if (_.every(search, s => s === -1)) continue;
				result.push({
					pos: _.min(search.filter(v => v >= 0)),
					name
				});
			}
			result.sort((a, b) => a.pos == b.pos ? a.name.length - b.name.length : a.pos - b.pos);
			return _.map(result, o => ({ text: o.name })).slice(0, 10);
		},
		sp() {
			if (this.selectedPresetName.length === 0) return false;
			return this.elite[this.selectedPresetName];
		},
		checkPSetting() {
			const ps = this.pSetting;
			let check = [
				...ps.elites,
				ps.skills.normal[0],
				..._.map(ps.skills.elite, a => a[0])
			];
			return _.sum(check) > 0;
		},
		plan() {
			if (!this.plannerInited) return false;

			let useVariables = [dropTable, synthesisTable.gt3];
			if (!this.setting.stopSynthetiseLE3) useVariables.push(synthesisTable.le3);
			let model = {
				optimize: 'cost',
				opType: 'min',
				constraints: {
					...materialConstraints,
					..._.transform(this.inputsInt, (o, v, k) => {
						if (v.need > 0) o[k] = { min: v.need };
					}, {}),
					init: { equal: 1 }
				},
				variables: Object.assign({
					have: _.transform(this.inputsInt, (o, v, k) => {
						if (v.have > 0) o[k] = v.have;
					}, { init: 1 })
				}, ...useVariables)
			};

			let result = linprog.Solve(model);

			if (!result.feasible) return false;
			delete result.feasible;
			delete result.result;
			delete result.bounded;
			delete result.have;

			let stage = _.omitBy(result, (v, k) => k.startsWith('合成-'));
			stage = _.mapValues(stage, v => v < 1 ? 1 : Math.ceil(v));
			let cost = _.sumBy(_.toPairs(stage), ([k, v]) => v * dropTable[k].cost);
			stage = _.mapValues(stage, (v, k) => {
				let cost = v * dropTable[k].cost;
				let drop = _.mapValues(_.omit(dropTable[k], 'cost'), e => _.round(v * e, 1));
				let drops = _.transform(drop, (r, v, k) => {
					if (v > 0) r.push({ name: k, num: v });
				}, []);
				drops.sort((a, b) => {
					let t = this.materialsTable[b.name].rare - this.materialsTable[a.name].rare;
					if (t == 0) t = b.num - a.num;
					return t;
				});
				return {
					times: v,
					cost,
					drops
				}
			});
			let stages = _.transform(stage, (r, v, k) => r.push({ code: k, ...v }), []);
			stages.sort((a, b) => b.code.localeCompare(a.code));

			let synthesis = _.pickBy(result, (v, k) => k.startsWith('合成-'));
			synthesis = _.transform(synthesis, (r, v, k) => {
				r.push({
					name: k.split('合成-')[1],
					num: _.round(v, 1)
				});
			}, []);
			synthesis.sort((a, b) => {
				let t = this.materialsTable[b.name].rare - this.materialsTable[a.name].rare;
				if (t == 0) t = b.num - a.num;
				return t;
			});

			return {
				cost,
				stages,
				synthesis
			}
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
		addNeed(need) {
			_.each(need, (num, name) => {
				let orig = parseInt(this.inputs[name].need) || 0;
				this.inputs[name].need = (orig + num).toString();
			});
		},
		usePreset(presets) {
			if (presets) this.selected.presets = presets;
			this.reset('need', false);
			for (let { text: name, setting: { elites, skills } } of this.selected.presets) {
				const current = this.elite[name];

				current.elites.forEach((need, i) => {
					if (elites[i]) this.addNeed(need);
				});

				if (skills.normal[0]) {
					for (let i = skills.normal[1] - 1; i < skills.normal[2] - 1; i++) {
						this.addNeed(current.skills.normal[i]);
					}
				}

				current.skills.elite.forEach((skill, i) => {
					const ses = skills.elite[i];
					if (!ses[0]) return;
					const offset = current.skills.normal.length + 1;
					for (let j = ses[1] - offset; j < ses[2] - offset; j++) {
						this.addNeed(current.skills.elite[i].need[j]);
					}
				});
			}
			// ensure
			localStorage.setItem('material.selected', JSON.stringify(this.selected));
		},
		showPreset(obj, edit = false) {
			this.selectedPreset = obj;
			this.selectedPresetName = obj.tag.text;
			if (edit) this.pSetting = _.cloneDeep(this.selected.presets[obj.index].setting);
			else this.pSetting = _.cloneDeep(pSettingInit);
			this.$nextTick(() => {
				this.presetDialog.open();
				this.$root.mutation();
			});
		},
		addPreset() {
			if (!this.checkPSetting) {
				this.$root.snackbar('什么也没勾选呢……');
				return;
			}
			this.selectedPreset.tag.setting = _.cloneDeep(this.pSetting);
			this.selectedPreset.tag.setting.state = 'edit';
			this.selectedPreset.addTag();
		},
		editPreset() {
			if (!this.checkPSetting) {
				this.$root.snackbar('什么也没勾选呢……');
				return;
			}
			this.selected.presets[this.selectedPreset.index].setting = _.cloneDeep(this.pSetting);
			this.usePreset();
		},
		saveData() {
			const Mdui = this.$root.Mdui;
			let obj = {
				inputs: this.inputs,
				presets: this.selected.presets
			};
			let str = Base64.encode(JSON.stringify(obj));
			Mdui.prompt('请保存文本框中的所有内容', '导出备份',
				() => {
					Mdui.JQ('.mdui-dialog input')[0].select();
					document.execCommand('copy');
					Mdui.snackbar('复制成功');
				},
				() => { },
				{
					history: false,
					defaultValue: str,
					cancelText: '关闭',
					confirmText: '复制到剪贴板'
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
		async initPlanner() {
			if (this.plannerInited) return;

			if (!this.penguinData.data || this.penguinData.expire < _.now()) {
				let tip = this.$root.snackbar('正在从企鹅物流加载/更新数据');
				let data = await Ajax.get(penguinURL, true).catch(() => false);
				tip.close();
				if (data) {
					this.penguinData.data = data;
					this.penguinData.expire = _.now() + 3 * 24 * 60 * 60 * 1000;
					localStorage.setItem('material.penguinData', JSON.stringify(this.penguinData));
				}
				else {
					if (this.penguinData.data) this.$root.snackbar('数据更新失败，使用旧数据进行计算');
					else {
						this.$root.snackbar('数据加载失败，请检查网络连接');
						return;
					}
				}
			}

			// 处理合成列表
			for (let { name, madeof, rare } of MATERIAL) {
				materialConstraints[name] = { min: 0 };
				if (_.size(madeof) == 0) continue;
				let product = {};
				product[name] = 1;
				synthesisTable[rare <= 3 ? 'le3' : 'gt3'][`合成-${name}`] = {
					...product,
					..._.mapValues(madeof, v => -v),
					cost: 0
				};
			}

			// 处理掉落信息
			for (let m of this.penguinData.data.matrix) {
				if (!(m.item.name in materialConstraints)) continue;
				let {
					item: { name },
					stage: { apCost, code },
					quantity,
					times
				} = m;
				if (!dropTable[code]) dropTable[code] = { cost: apCost };
				dropTable[code][name] = quantity / times;
			}
			this.dropTable = dropTable;

			this.plannerInited = true;
		},
		showPlan() {
			this.$nextTick(() => this.plannerDialog.open());
		}
	},
	created() {
		for (let { name } of this.materials) {
			//this.materialList.push(name);
			this.$set(this.inputs, name, {
				need: '',
				have: ''
			});
		}

		this.materials = _.groupBy(this.materials, m => m.rare);

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
	},
	mounted() {
		window.mutation = this.$root.mutation;

		this.presetDialog = new this.$root.Mdui.Dialog('#preset-setting', { history: false });
		this.$root.Mdui.JQ('#preset-setting')[0]
			.addEventListener('closed.mdui.dialog', () => this.selectedPresetName = '');

		this.plannerDialog = new this.$root.Mdui.Dialog('#planner', { history: false });
	}
};
</script>

<style>
#preset-setting {
	overflow: visible;
	max-width: 400px;
	min-width: 320px;
}
#preset-setting .mdui-card-header {
	height: auto;
}
#preset-setting .mdui-card-header-title {
	font-size: 24px;
	line-height: 40px;
}
#preset-setting .mdui-select {
	min-width: 60px;
}
.preset-list > div:not(:first-child) {
	margin-top: 8px;
}
.elite-cb-list .mdui-checkbox:not(:first-child) {
	margin-left: 40px;
}
.skill-cb {
	min-width: 130px;
}
#preset.vue-tags-input {
	max-width: none;
	background-color: transparent;
}
#preset .ti-tag {
	margin-left: 0;
	margin-right: 4px;
}
#preset .ti-tag-center {
	cursor: pointer;
}
#preset .ti-input {
	border: none;
	padding: 0;
	z-index: 30;
	position: relative;
	background-color: #fff;
}
#preset .ti-selected-item:hover {
	background-color: unset;
	color: unset;
}
#preset .ti-autocomplete {
	border: none;
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
.material,
.material .mdui-card-header-title {
	transition: all 0.3s;
}
.mobile-screen .rare-title {
	margin-left: 8px;
}
.mobile-screen .material {
	box-shadow: none;
	width: 100%;
}
.mobile-screen .material {
	background: transparent;
}
.mobile-screen .material .mdui-card-header {
	padding: 0;
}
.material .mdui-card-header {
	height: auto;
}
.material .mdui-card-header > div:not(.mdui-card-header-avatar) {
	margin-left: 92px;
}
.material .mdui-card-header-avatar {
	width: 80px;
	height: 80px;
	transform: scale(1.1);
	justify-content: center;
}
.mobile-screen .material .mdui-card-header-avatar {
	transform: scale(1);
}
.material .mdui-card-header-avatar img {
	transform: scale(0.44);
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
	display: inline-block;
	width: 45px;
	text-align: right;
	padding-right: 4px;
}
.probability {
	padding: 3px 5px;
	border-radius: 2px;
	font-size: 12px;
	position: relative;
}
.point,
.probability {
	vertical-align: top;
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
.stage:first-child h5 {
	margin-top: 0;
}
.stage .num-item {
	margin-bottom: 8px;
	width: 130px;
}
.stage .num-item .mdui-textfield-label {
	width: max-content;
}
@keyframes show-1 {
	0% {
		opacity: 0;
	}
	3% {
		opacity: 1;
	}
	47% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
	100% {
		opacity: 0;
	}
}
@keyframes show-2 {
	0% {
		opacity: 0;
	}
	50% {
		opacity: 0;
	}
	53% {
		opacity: 1;
	}
	97% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
.probability .show-1 {
	animation: show-1 10s infinite;
}
.probability .show-2 {
	animation: show-2 10s infinite;
	position: absolute;
	left: 5px;
	top: 1px;
}
</style>
