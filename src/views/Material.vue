<template>
	<div id="arkn-material">
		<template v-if="ready">
			<!-- 选项 -->
			<div class="mdui-row mdui-m-t-4">
				<div class="mdui-col-xs-12">
					<table class="mdui-table tag-table">
						<tbody>
							<tr>
								<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">稀有度</button></td>
								<td>
									<button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn '+(allRare?color.selected:color.notSelected)" @click="selected.rare = l.fill(Array(selected.rare.length), !allRare);">全选</button>
									<tag-button v-for="i in 5" :key="`rare-${rareNum+1-i}`" v-model="selected.rare[rareNum-i]" :notSelectedColor="color.notSelected" :selectedColor="color[rareNum+1-i]">&nbsp;{{rareNum+1-i}}&nbsp;</tag-button>
								</td>
							</tr>
							<tr>
								<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">设置项</button></td>
								<td>
									<button class="mdui-btn mdui-btn-dense mdui-color-red tag-btn mdui-m-r-2" @click="reset">重置</button>
									<mdui-switch v-for="(zh, en) in settingZh" :key="en" v-model="setting[en]">{{zh}}</mdui-switch>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<!-- 提示 -->
			<div class="mdui-chip mdui-m-t-2">
				<span class="mdui-chip-icon mdui-color-blue"><i class="mdui-icon material-icons">info_outline</i></span>
				<span class="mdui-chip-title mdui-text-truncate" :style="$root.screenWidth<350?'font-size:12px':false">设置与输入会自动保存，点击重置按钮可重置</span>
			</div>
			<!-- 素材 -->
			<div class="mdui-row">
				<div class="mdui-col-xs-12" v-for="i in rareNum" :key="`materials-${i}`" v-show="selected.rare[rareNum-i] && !(setting.hideIrrelevant && showMaterials[rareNum+1-i].length==0)">
					<div class="mdui-typo rare-title">
						<h2>稀有度 {{rareNum+1-i}}</h2>
					</div>
					<div v-for="material in materials[rareNum+1-i]" :key="material.name" v-show="!(setting.hideIrrelevant && !showMaterials[rareNum+1-i].includes(material.name))" :class="`mdui-card${$root.smallScreen?'':' mdui-m-r-2'} mdui-m-b-2 material${(hasInput && !showMaterials[rareNum+1-i].includes(material.name)) ? ' opacity-5' : ''}`">
						<div :class="`card-triangle ${color[rareNum+1-i]}`"></div>
						<div class="mdui-card-header">
							<img class="mdui-card-header-avatar" :src="material.img" />
							<div class="mdui-card-header-title">{{material.name}}</div>
							<div class="mdui-m-t-1">
								<mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].need">需求</mdui-number-input>
								<mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].have">已有</mdui-number-input>
								<div class="gap">
									<label class="mdui-textfield-label">仍需</label>
									<span class="gap-num">{{gaps[material.name]}}</span>
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
import Ajax from '@/ajax'
import _ from 'lodash';

function min0(x) {
	return x < 0 ? 0 : x;
}

export default {
	name: "arkn-material",
	data: () => ({
		l: _,
		ready: false,
		showAll: false,
		materials: {},
		inputs: {},
		selected: {
			rare: [],
		},
		setting: {
			hideIrrelevant: false
		},
		settingZh: {
			hideIrrelevant: '隐藏无关素材'
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

			_.forInRight(this.materials, materials => {
				for (let { name, madeof } of materials) {
					gaps[name] = min0(gaps[name] - inputs[name].have);
					_.forIn(madeof, (num, m) => {
						gaps[m] += gaps[name] * num;
					});
				}
			});

			return gaps;
		},
		showMaterials() {
			let r = _.mapValues(this.materials, (materials) => {
				let show = [];
				for (let { name } of materials) {
					if (this.inputsInt[name].need + this.inputsInt[name].have + this.gaps[name] > 0)
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
		}
	},
	methods: {
		reset() {
			this.selected.rare = _.concat([false], _.fill(Array(this.rareNum - 1), true));
			this.setting.hideIrrelevant = false;
			for (let name in this.inputs) {
				let material = this.inputs[name];
				for (let key in material) {
					material[key] = '';
				}
			}
		}
	},
	created: async function () {
		let json = await Ajax.get(`${process.env.BASE_URL}data/material.json`);
		this.materials = _.groupBy(json, m => m.rare);

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
			this[thisKey] = JSON.parse(localStorage.getItem(key));
		}

		for (let name in this.inputs) {
			let material = this.inputs[name];
			for (let key in material) {
				if (material[key] == 0) material[key] = "";
			}
		}

		this.ready = true;
	}
};
</script>

<style>
.material {
	width: 380px;
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
