<template>
	<div id="arkn-level">
		<div class="mdui-row mdui-m-t-4">
			<!-- 输入 -->
			<div class="mdui-col-md-5">
				<table class="mdui-table tag-table">
					<tbody>
						<tr>
							<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">通用</button></td>
							<td class="mdui-valign">
								<div class="with-label mdui-m-r-3">
									<label class="mdui-textfield-label">星级</label>
									<mdui-select-num :options="l.range(6,0)" v-model="inputs.star" @change="updateSelect"></mdui-select-num>
								</div>
								<div class="with-label mdui-m-r-3">
									<label class="mdui-textfield-label">经验本</label>
									<span>LS-5</span>
								</div>
								<div class="with-label mdui-m-r-3">
									<label class="mdui-textfield-label">金币本</label>
									<span>CE-5</span>
								</div>
								<button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset">重置</button>
							</td>
						</tr>
						<tr>
							<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">当前</button></td>
							<td class="mdui-valign">
								<div class="with-label mdui-m-r-3">
									<label class="mdui-textfield-label">精英化</label>
									<mdui-select-num class="select-need-update" :options="l.range(0,maxElite[inputs.star-1]+1)" v-model="inputs.current.elite" @change="updateSelect" />
								</div>
								<mdui-number-input class="mdui-m-r-3" v-model.number="inputs.current.level">等级</mdui-number-input>
								<mdui-number-input v-model.number="inputs.current.exp" style="width:80px">经验</mdui-number-input>
							</td>
						</tr>
						<tr>
							<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">目标</button></td>
							<td class="mdui-valign">
								<div class="with-label mdui-m-r-3">
									<label class="mdui-textfield-label">精英化</label>
									<mdui-select-num class="select-need-update" :options="l.range(inputs.current.elite,maxElite[inputs.star-1]+1)" v-model="inputs.target.elite" @change="updateSelect" />
								</div>
								<mdui-number-input v-model.number="inputs.target.level">等级</mdui-number-input>
							</td>
						</tr>
						<tr>
							<td width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">已有</button></td>
							<td class="mdui-valign">
								<div class="mdui-m-r-2 mdui-m-b-1 mdui-valign" v-for="i in l.range(5,1)" :key="`have-${i}`">
									<arkn-item :t="i" :img="`E-${i}-1`" />
									<mdui-number-input class="exp-input" v-model.number="inputs.have[i]">{{expZh[i-2]}}</mdui-number-input>
								</div>
								<div class="mdui-m-r-2 mdui-m-b-1 mdui-valign">
									<arkn-item t="4" img="G-4-1" />
									<mdui-number-input class="exp-input" v-model.number="inputs.money" style="width:80px">龙门币</mdui-number-input>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<!-- 输出 -->
			<div class="mdui-col-md-7 mdui-p-x-2 mdui-typo">
				<h2 class="mdui-hidden-sm-down mdui-m-t-0">至少需要</h2>
				<h2 class="mdui-hidden-md-up">总需求</h2>
				<div class="num-item-list">
					<arkn-num-item t="5" img="EO-4-1" lable="经验值" :num="result.exp" />
					<arkn-num-item t="4" img="G-4-1" lable="龙门币(总共)" :num="result.cost" class="mdui-m-r-0" />
					<arkn-num-item v-if="inputs.money" t="4" img="G-4-1" lable="龙门币(仍需)" :num="ge0(result.cost-inputs.money)" />
				</div>
				<h2>物资筹备</h2>
				<h3 class="mdui-m-t-0">LS-5 <small>× {{result.ls5}}</small></h3>
				<div class="num-item-list mdui-valign">
					<arkn-num-item t="0" img="AP" lable="理智" :num="result.ls5*30" />
					<arkn-num-item v-for="i in [5,4,3]" :key="`ls5-${i}`" :t="i" :img="`E-${i}-1`" :lable="expZh[i-2]" :num="result.ls5*LS5.drop[i]" />
					<arkn-num-item t="4" img="G-4-1" lable="龙门币" :num="result.ls5*LS5.money" />
				</div>
				<h3>CE-5 <small>× {{result.ce5}}</small></h3>
				<div class="num-item-list mdui-valign">
					<arkn-num-item t="0" img="AP" lable="理智" :num="result.ce5*30" />
					<arkn-num-item t="4" img="G-4-1" lable="龙门币" :num="result.ce5*CE5.money" />
				</div>
				<h2>预计消耗</h2>
				<div class="num-item-list">
					<arkn-num-item v-for="i in [5,4,3,2]" :key="`num-item-${i}`" :t="i" :img="`E-${i}-1`" :lable="expZh[i-2]">
						<span class="mdui-text-color-black-secondary">{{result.use[i]}}</span> / {{result.have[i]}}
					</arkn-num-item>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ArknItem from '../components/ArknItem';
import ArknNumItem from '../components/ArknNumItem';
import _ from 'lodash';
import { maxLevel, characterExp, characterUpgradeCost, eliteCost } from './level.json';

const expData = {
	5: 2000,
	4: 1000,
	3: 400,
	2: 200
};
const LS5 = {
	exp: 7400,
	drop: {
		5: 3,
		4: 1,
		3: 1,
		2: 0
	},
	money: 360
};
const CE5 = {
	money: 7500
};
const defaultInputs = {
	star: 6,
	current: {
		elite: 0,
		level: 1,
		exp: 0
	},
	target: {
		elite: 0,
		level: 1
	},
	have: {
		5: 0,
		4: 0,
		3: 0,
		2: 0
	},
	money: 0
};

function ge0(x) {
	return Math.max(x, 0);
}

export default {
	name: 'arkn-level',
	components: {
		ArknItem,
		ArknNumItem
	},
	data: () => ({
		l: _,
		inputs: _.cloneDeep(defaultInputs),
		expZh: ['基础', '初级', '中级', '高级'],
		maxElite: _.map(eliteCost, a => a.length),
		LS5,
		CE5
	}),
	watch: {
		inputs: {
			handler(val) {
				const { star, current, target, have } = val;

				for (let oPath of ['current', 'target']) {
					let lPath = `${oPath}.level`;
					let v = _.get(val, lPath);
					if (v !== '') {
						let max = maxLevel[star - 1][val[oPath].elite];
						if (v < 1) _.set(val, lPath, 1);
						else if (v > max) _.set(val, lPath, max);
					}
				}

				if (current.exp) {
					if (current.exp < 0) current.exp = 0;
					let maxExp = characterExp[current.elite][(current.level || 1) - 1] || 1;
					if (current.exp >= maxExp) current.exp = maxExp - 1;
				}

				_.each(val.have, (v, i, o) => {
					if (v && v < 0) o[i] = 0;
				});

				localStorage.setItem('level.inputs', JSON.stringify(val))
			},
			deep: true
		}
	},
	computed: {
		result() {
			const { star, current, target, have, money } = this.inputs;
			const ML = maxLevel[star - 1];
			const expHave = _.sum(_.map(have, (v, i) => v * expData[i]));

			let expNeed = 0;
			let expCost = 0;
			let expStep = [];
			let use = {
				5: 0,
				4: 0,
				3: 0,
				2: 0
			}

			if (target.elite > current.elite || target.level > current.level) {
				//计算最初1级所需
				const firstExp = characterExp[current.elite][current.level - 1];
				if (firstExp) {
					let firstNeed = firstExp - current.exp;
					let firstCost = firstNeed / firstExp * characterUpgradeCost[current.elite][current.level - 1];
					expNeed += firstNeed;
					expCost += firstCost;
				}
				//后续计算
				for (let e = current.elite; e <= target.elite; e++ , expStep.push(expNeed)) {
					if (e > current.elite) expCost += eliteCost[star - 1][e - 1];
					let maxL = (e == target.elite ? target.level : ML[e]);
					for (let l = (e == current.elite ? current.level + 1 : 1); l < maxL; l++) {
						expNeed += characterExp[e][l - 1];
						expCost += characterUpgradeCost[e][l - 1];
					}
				}
			}

			let ls5Need = ge0(Math.ceil((expNeed - expHave) / LS5.exp));

			//实际消耗估算
			if (expStep.length > 0) {
				_.forEachRight(expStep, (v, i, a) => {
					if (i > 0) a[i] -= a[i - 1];
				});
				let expRest = _.mapValues(LS5.drop, (v, i) => have[i] + v * ls5Need);
				for (let step of expStep) {
					while (step > 0) {
						if (_.sum(Object.values(expRest)) == 0) {
							ls5Need++;
							expRest = _.cloneDeep(LS5.drop);
						}
						for (let i = 5; i >= 2; i--) {
							while (step >= expData[i] && expRest[i] > 0) {
								use[i]++;
								expRest[i]--;
								step -= expData[i];
							}
						}
						for (let i = 2; i <= 5; i++) {
							while (step > 0 && expRest[i] > 0) {
								use[i]++;
								expRest[i]--;
								step -= expData[i];
							}
						}
					}
				}
			}

			let ce5Need = ge0(Math.ceil((expCost - ls5Need * LS5.money - money) / CE5.money));

			return {
				exp: expNeed,
				cost: Math.ceil(expCost),
				ls5: ls5Need,
				ce5: ce5Need,
				use,
				have: _.mapValues(LS5.drop, (v, i) => have[i] + v * ls5Need)
			}
		}
	},
	methods: {
		ge0,
		updateSelect() {
			//更新值
			const { star, current, target } = this.inputs;
			const maxElite = this.maxElite[star - 1];
			if (current.elite > maxElite) current.elite = maxElite;
			if (target.elite > maxElite) target.elite = maxElite;
			if (current.elite > target.elite) target.elite = current.elite;
			//更新下拉选择
			const $ = this.$root.Mdui.JQ;
			this.$nextTick(() => $('.select-need-update').each((i, ele) => new this.$root.Mdui.Select(ele).handleUpdate()));
		},
		reset() {
			this.inputs = _.cloneDeep(defaultInputs);
			const $ = this.$root.Mdui.JQ;
			this.$nextTick(() => $('.select-need-update').each((i, ele) => new this.$root.Mdui.Select(ele).handleUpdate()));
		}
	},
	created() {
		let inputs = localStorage.getItem('level.inputs');
		if (inputs) this.inputs = JSON.parse(inputs);
	}
}
</script>

<style>
#arkn-level .tag-table td:nth-child(2) {
	padding-left: 16px !important;
}
#arkn-level .tag-table td {
	padding-top: 8px !important;
	padding-bottom: 8px !important;
	border: none;
	flex-wrap: wrap;
}
#arkn-level .num-item-list {
	flex-wrap: wrap;
}
#arkn-level .num-item-list .num-item {
	margin-bottom: 8px;
}
#arkn-level .num-item-list .num-item:not(:last-child) {
	margin-right: 16px;
}
#arkn-level [t] {
	width: 48px;
	height: 48px;
	display: inline-block;
}
</style>
