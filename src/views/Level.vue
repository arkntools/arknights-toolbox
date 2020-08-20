<template>
  <div id="arkn-level">
    <div class="mdui-row">
      <!-- 输入 -->
      <div class="mdui-col-md-5">
        <table class="mdui-table tag-table" style="overflow-x: hidden;">
          <tbody>
            <tr>
              <td width="1"></td>
              <td class="mdui-valign">
                <div class="number-select with-label mdui-m-r-3">
                  <label class="mdui-textfield-label">{{ $t('common.stars') }}</label>
                  <mdui-select-num
                    class="mdui-select-width-100p"
                    :options="$_.range(6, 0)"
                    :mdui-options="{ gutter: 72 }"
                    v-model="inputs.star"
                    @change="updateSelect"
                  />
                </div>
                <div class="with-label mdui-m-r-3">
                  <label class="mdui-textfield-label">{{ $tt('level.经验本') }}</label>
                  <span>LS-5</span>
                </div>
                <div class="with-label">
                  <label class="mdui-textfield-label">{{ $tt('level.金币本') }}</label>
                  <span>CE-5</span>
                </div>
              </td>
            </tr>
            <tr>
              <td width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.current') }}</button
                ></td
              >
              <td class="mdui-valign">
                <div class="number-select with-label mdui-m-r-3">
                  <label class="mdui-textfield-label">{{ $t('common.promotion') }}</label>
                  <mdui-select-num
                    class="mdui-select-width-100p select-need-update"
                    :options="$_.range(0, maxElite[inputs.star - 1] + 1)"
                    v-model="inputs.current.elite"
                    @change="updateSelect"
                  />
                </div>
                <div class="mdui-m-r-2 input-with-button">
                  <mdui-number-input v-model.number="inputs.current.level">{{ $t('common.level') }}</mdui-number-input>
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1"
                    v-theme-class="$root.color.pinkText"
                    @click="inputs.current.level = 999"
                    >{{ $t('common.max') }}</button
                  >
                </div>
                <mdui-number-input v-model.number="inputs.current.exp" style="flex-grow: 1; max-width: 80px;">{{
                  $t('common.exp')
                }}</mdui-number-input>
              </td>
            </tr>
            <tr>
              <td width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.target') }}</button
                ></td
              >
              <td class="mdui-valign">
                <div class="number-select with-label mdui-m-r-3">
                  <label class="mdui-textfield-label">{{ $t('common.promotion') }}</label>
                  <mdui-select-num
                    class="mdui-select-width-100p select-need-update"
                    :options="$_.range(inputs.current.elite, maxElite[inputs.star - 1] + 1)"
                    v-model="inputs.target.elite"
                    @change="updateSelect"
                  />
                </div>
                <div class="input-with-button">
                  <mdui-number-input v-model.number="inputs.target.level">{{ $t('common.level') }}</mdui-number-input>
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1"
                    v-theme-class="$root.color.pinkText"
                    @click="inputs.target.level = 999"
                    >{{ $t('common.max') }}</button
                  >
                </div>
              </td>
            </tr>
            <tr>
              <td width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.owned') }}</button
                ></td
              >
              <td class="mdui-valign" :style="{ marginRight: '-16px', marginBottom: '-8px' }">
                <div class="mdui-m-r-2 mdui-m-b-1 mdui-valign" v-for="i in $_.range(5, 1)" :key="`have-${i}`">
                  <arkn-item :t="i" :img="k2i(i)" />
                  <mdui-number-input class="exp-input" v-model.number="inputs.have[i]">{{
                    $t(`item.${expId[i - 2]}`)
                  }}</mdui-number-input>
                </div>
                <div class="mdui-m-r-2 mdui-m-b-1 mdui-valign">
                  <arkn-item t="4" img="4001" />
                  <mdui-number-input class="exp-input" v-model.number="inputs.money" style="width: 80px;">{{
                    $t('item.4001')
                  }}</mdui-number-input>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2"
                ><button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.redBtn"
                  @click="reset"
                  >{{ $t('common.reset') }}</button
                ></td
              >
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 输出 -->
      <div class="mdui-col-md-7 mdui-p-x-2 mdui-typo">
        <h2 class="mdui-hidden-sm-down mdui-m-t-0">{{ $tt('level.至少需要') }}</h2>
        <h2 class="mdui-hidden-md-up">{{ $tt('level.至少需要') }}</h2>
        <div class="num-item-list">
          <arkn-num-item t="5" img="5001" :lable="$t('common.exp')" :num="result.exp" />
          <arkn-num-item
            t="4"
            img="4001"
            :lable="`${$t('item.4001')}(${$t('common.total')})`"
            :num="result.cost"
            class="mdui-m-r-0"
          />
          <arkn-num-item
            v-if="inputs.money"
            t="4"
            img="4001"
            :lable="`${$t('item.4001')}(${$t('common.lack')})`"
            :num="ge0(result.cost - inputs.money)"
          />
        </div>
        <h2>{{ $tt('level.物资筹备') }}</h2>
        <h3 class="mdui-m-t-0"
          >LS-5 <small>× {{ result.ls5 }}</small></h3
        >
        <div class="num-item-list">
          <arkn-num-item t="0" img="AP_GAMEPLAY" :lable="$t('item.AP_GAMEPLAY')" :num="result.ls5 * 30" />
          <arkn-num-item
            v-for="i in $_.range(5, 2)"
            :key="`ls5-${i}`"
            :t="i"
            :img="k2i(i)"
            :lable="$t(`item.${expId[i - 2]}`)"
            :num="result.ls5 * LS5.drop[i]"
          />
          <arkn-num-item t="4" img="4001" :lable="$t('item.4001')" :num="result.ls5 * LS5.money" />
        </div>
        <h3
          >CE-5 <small>× {{ result.ce5 }}</small></h3
        >
        <div class="num-item-list">
          <arkn-num-item t="0" img="AP_GAMEPLAY" :lable="$t('item.AP_GAMEPLAY')" :num="result.ce5 * 30" />
          <arkn-num-item t="4" img="4001" :lable="$t('item.4001')" :num="result.ce5 * CE5.money" />
        </div>
        <h2
          >{{ $tt('level.预计消耗') }} <small>{{ $t('common.need') }} / {{ $t('common.owned') }}</small></h2
        >
        <div class="num-item-list">
          <arkn-num-item
            v-for="i in $_.range(5, 1)"
            :key="`num-item-${i}`"
            :t="i"
            :img="k2i(i)"
            :lable="$t(`item.${expId[i - 2]}`)"
            :num="`${result.use[i]} / ${result.have[i]}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ArknItem from '@/components/ArknItem';
import ArknNumItem from '@/components/ArknNumItem';
import _ from 'lodash';
import safelyParseJSON from '@/utils/safelyParseJSON';

import { maxLevel, characterExp, characterUpgradeCost, eliteCost } from '@/data/level.json';

const expData = {
  5: 2000,
  4: 1000,
  3: 400,
  2: 200,
};
const LS5 = {
  exp: 7400,
  drop: {
    5: 3,
    4: 1,
    3: 1,
    2: 0,
  },
  money: 360,
};
const CE5 = {
  money: 7500,
};
const defaultInputs = {
  star: 6,
  current: {
    elite: 0,
    level: 1,
    exp: 0,
  },
  target: {
    elite: 0,
    level: 1,
  },
  have: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
  },
  money: 0,
};

function ge0(x) {
  return Math.max(x, 0);
}

export default {
  name: 'arkn-level',
  components: {
    ArknItem,
    ArknNumItem,
  },
  data: () => ({
    inputs: _.cloneDeep(defaultInputs),
    expId: ['2001', '2002', '2003', '2004'],
    maxElite: _.map(eliteCost, a => a.length),
    maxLevel,
    LS5,
    CE5,
  }),
  watch: {
    inputs: {
      handler(val) {
        const { star, current } = val;

        for (const oPath of ['current', 'target']) {
          const lPath = `${oPath}.level`;
          const v = _.get(val, lPath);
          if (v !== '') {
            const max = maxLevel[star - 1][val[oPath].elite];
            if (v < 1) _.set(val, lPath, 1);
            else if (v > max) _.set(val, lPath, max);
          }
        }

        if (current.exp) {
          if (current.exp < 0) current.exp = 0;
          const maxExp = characterExp[current.elite][(current.level || 1) - 1] || 1;
          if (current.exp >= maxExp) current.exp = maxExp - 1;
        }

        _.each(val.have, (v, i, o) => {
          if (v && v < 0) o[i] = 0;
        });

        localStorage.setItem('level.inputs', JSON.stringify(val));
      },
      deep: true,
    },
  },
  computed: {
    result() {
      const { star, current, target, have, money } = this.inputs;
      const ML = maxLevel[star - 1];
      const expHave = _.sum(_.map(have, (v, i) => v * expData[i]));

      let expNeed = 0;
      let expCost = 0;
      const expStep = [];
      const use = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
      };

      if (target.elite > current.elite || target.level > current.level) {
        //计算最初1级所需
        const firstExp = characterExp[current.elite][current.level - 1];
        if (firstExp) {
          const firstNeed = firstExp - current.exp;
          const firstCost = (firstNeed / firstExp) * characterUpgradeCost[current.elite][current.level - 1];
          expNeed += firstNeed;
          expCost += firstCost;
        }
        //后续计算
        for (let e = current.elite; e <= target.elite; e++, expStep.push(expNeed)) {
          if (e > current.elite) expCost += eliteCost[star - 1][e - 1];
          const maxL = e == target.elite ? target.level : ML[e];
          for (let l = e == current.elite ? current.level + 1 : 1; l < maxL; l++) {
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

      const ce5Need = ge0(Math.ceil((expCost - ls5Need * LS5.money - money) / CE5.money));

      return {
        exp: expNeed,
        cost: Math.ceil(expCost),
        ls5: ls5Need,
        ce5: ce5Need,
        use,
        have: _.mapValues(LS5.drop, (v, i) => have[i] + v * ls5Need),
      };
    },
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
      this.$nextTick(() => this.$$('.select-need-update').each((i, ele) => new this.$Select(ele).handleUpdate()));
    },
    reset() {
      this.inputs = _.cloneDeep(defaultInputs);
      this.$nextTick(() => this.$$('.select-need-update').each((i, ele) => new this.$Select(ele).handleUpdate()));
    },
    k2i(id) {
      return id + 1999;
    },
  },
  created() {
    this.inputs = safelyParseJSON(localStorage.getItem('level.inputs'), this.inputs);
  },
};
</script>

<style lang="scss">
#arkn-level {
  .tag-table td {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    border: none;
    flex-wrap: wrap;
    &:nth-child(2) {
      padding-left: 16px !important;
    }
  }
  .input-with-button {
    display: flex;
    align-items: flex-end;
  }
  .num-item-list .num-item {
    margin-bottom: 8px;
    &:not(:last-child) {
      margin-right: 16px;
    }
  }
  .number-select {
    width: 48px;
    .mdui-textfield-label {
      white-space: nowrap;
    }
  }
}
</style>
