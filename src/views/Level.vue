<template>
  <div id="arkn-level">
    <div class="mdui-row">
      <!-- 输入 -->
      <div class="mdui-col-md-5">
        <table id="input-table" class="mdui-table tag-table" style="overflow-x: hidden">
          <tbody>
            <template v-for="(item, i) in inputs.list">
              <tr :data-index="i" :key="i">
                <td width="1"></td>
                <td class="mdui-valign">
                  <div class="number-select with-label mdui-m-r-3">
                    <label class="mdui-textfield-label">{{ $t('common.stars') }}</label>
                    <mdui-select-num
                      class="mdui-select-width-100p"
                      :options="$_.range(6, 0)"
                      :mdui-options="{ gutter: 72 }"
                      v-model="item.star"
                      @change="updateSelect(item, i)"
                    />
                  </div>
                  <div class="with-label mdui-m-r-3">
                    <label class="mdui-textfield-label">{{ $tt('level.经验本') }}</label>
                    <span>{{ useLS }}</span>
                  </div>
                  <div class="with-label">
                    <label class="mdui-textfield-label">{{ $tt('level.金币本') }}</label>
                    <span>{{ useCE }}</span>
                  </div>
                </td>
              </tr>
              <tr :data-index="i" :key="i">
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
                      :options="$_.range(0, maxElite[item.star - 1] + 1)"
                      v-model="item.current.elite"
                      @change="updateSelect(item, i)"
                    />
                  </div>
                  <div class="mdui-m-r-2 input-with-button">
                    <mdui-number-input v-model.number="item.current.level">{{
                      $t('common.level')
                    }}</mdui-number-input>
                    <button
                      class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1"
                      v-theme-class="$root.color.pinkText"
                      @click="item.current.level = 999"
                      >{{ $t('common.max') }}</button
                    >
                  </div>
                  <mdui-number-input
                    v-model.number="item.current.exp"
                    style="flex-grow: 1; max-width: 80px"
                    >{{ $t('common.exp') }}</mdui-number-input
                  >
                </td>
              </tr>
              <tr :data-index="i" :key="i">
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
                      :options="$_.range(item.current.elite, maxElite[item.star - 1] + 1)"
                      v-model="item.target.elite"
                      @change="updateSelect(item, i)"
                    />
                  </div>
                  <div class="input-with-button">
                    <mdui-number-input v-model.number="item.target.level">{{
                      $t('common.level')
                    }}</mdui-number-input>
                    <button
                      class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1"
                      v-theme-class="$root.color.pinkText"
                      @click="item.target.level = 999"
                      >{{ $t('common.max') }}</button
                    >
                  </div>
                  <div class="input-actions">
                    <button
                      class="mdui-btn mdui-btn-icon mdui-btn-dense mdui-ripple"
                      @click="addItem(i)"
                      ><i class="mdui-icon material-icons">add</i></button
                    >
                    <button
                      v-if="inputs.list.length > 1"
                      class="mdui-btn mdui-btn-icon mdui-btn-dense mdui-ripple"
                      @click="removeItem(i)"
                      ><i class="mdui-icon material-icons">remove</i></button
                    >
                  </div>
                </td>
              </tr>
              <tr v-if="inputs.list.length > 1" :key="i">
                <td class="hr mdui-typo" colspan="2"><hr /></td>
              </tr>
            </template>
            <tr>
              <td width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.owned') }}</button
                ></td
              >
              <td class="mdui-valign" :style="{ marginRight: '-16px', marginBottom: '-8px' }">
                <div
                  class="mdui-m-r-2 mdui-m-b-1 mdui-valign"
                  v-for="i in $_.range(5, 1)"
                  :key="`have-${i}`"
                >
                  <arkn-item :t="i" :img="k2i(i)" />
                  <mdui-number-input class="exp-input" v-model.number="inputs.have[i]">{{
                    $t(`item.${expId[i - 2]}`)
                  }}</mdui-number-input>
                </div>
                <div class="mdui-m-r-2 mdui-m-b-1 mdui-valign">
                  <arkn-item t="4" img="4001" />
                  <mdui-number-input
                    class="exp-input"
                    v-model.number="inputs.money"
                    style="width: 80px"
                    >{{ $t('item.4001') }}</mdui-number-input
                  >
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
        <h2 class="mdui-hidden-sm-down mdui-m-t-0">{{ $tt('level.物资筹备') }}</h2>
        <h2 class="mdui-hidden-md-up">{{ $tt('level.物资筹备') }}</h2>
        <h3 class="mdui-m-t-0"
          >{{ useLS }} <small>× {{ result.ls }}</small></h3
        >
        <div class="num-item-list">
          <arkn-num-item
            t="0"
            img="AP_GAMEPLAY"
            :lable="$t('item.AP_GAMEPLAY')"
            :num="result.ls * useLSData.ap"
            :format="true"
          />
          <arkn-num-item
            v-for="i in $_.range(5, 2)"
            v-show="useLSData.drop[i]"
            :key="`ls-${i}`"
            :t="i"
            :img="k2i(i)"
            :lable="$t(`item.${expId[i - 2]}`)"
            :num="result.ls * useLSData.drop[i]"
            :format="true"
          />
          <arkn-num-item
            t="4"
            img="4001"
            :lable="$t('item.4001')"
            :num="result.ls * useLSData.money"
            :format="true"
          />
        </div>
        <h3
          >{{ useCE }} <small>× {{ result.ce }}</small></h3
        >
        <div class="num-item-list">
          <arkn-num-item
            t="0"
            img="AP_GAMEPLAY"
            :lable="$t('item.AP_GAMEPLAY')"
            :num="result.ce * useCEData.ap"
            :format="true"
          />
          <arkn-num-item
            t="4"
            img="4001"
            :lable="$t('item.4001')"
            :num="result.ce * useCEData.money"
            :format="true"
          />
        </div>
        <h2>{{ $tt('level.预计消耗') }}</h2>
        <div class="num-item-list">
          <arkn-num-item
            t="4"
            img="4001"
            :lable="$t('item.4001')"
            :num="result.cost"
            :format="true"
          />
          <arkn-num-item
            t="5"
            img="5001"
            :lable="$t('common.exp')"
            :num="result.exp"
            :format="true"
          />
          <arkn-num-item
            v-for="i in $_.range(5, 1)"
            v-show="result.use[i]"
            :key="`num-item-${i}`"
            :t="i"
            :img="k2i(i)"
            :lable="$t(`item.${expId[i - 2]}`)"
            :num="result.use[i]"
            :format="true"
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
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import pickClone from '@/utils/pickClone';

import { maxLevel, characterExp, characterUpgradeCost, eliteCost } from '@/data/level.json';
import { unopenedStageSets } from '@/store/stage';

const nls = new NamespacedLocalStorage('level');

const ExpData = {
  5: 2000,
  4: 1000,
  3: 400,
  2: 200,
};
const LSStages = {
  'LS-5': {
    ap: 30,
    exp: 7400,
    drop: {
      5: 3,
      4: 1,
      3: 1,
      2: 0,
    },
    money: 360,
  },
  'LS-6': {
    ap: 36,
    exp: 10000,
    drop: {
      5: 4,
      4: 2,
      3: 0,
      2: 0,
    },
    money: 432,
  },
};
const CEStages = {
  'CE-5': {
    ap: 30,
    money: 7500,
  },
  'CE-6': {
    ap: 36,
    money: 10000,
  },
};

const defaultItemInputs = {
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
};
const defaultInputs = {
  list: [defaultItemInputs],
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
  }),
  watch: {
    inputs: {
      handler(val) {
        const { list } = val;

        list.forEach(item => {
          for (const oPath of ['current', 'target']) {
            const lPath = `${oPath}.level`;
            const v = _.get(item, lPath);
            if (v !== '') {
              const max = maxLevel[item.star - 1][item[oPath].elite];
              if (v < 1) _.set(item, lPath, 1);
              else if (v > max) _.set(item, lPath, max);
            }
          }

          const { current } = item;
          if (current.exp) {
            if (current.exp < 0) current.exp = 0;
            const maxExp = characterExp[current.elite][(current.level || 1) - 1] || 1;
            if (current.exp >= maxExp) current.exp = maxExp - 1;
          }
        });

        _.each(val.have, (v, i, o) => {
          if (v && v < 0) o[i] = 0;
        });

        nls.setItem('inputs', val);
      },
      deep: true,
    },
  },
  computed: {
    useLS() {
      return unopenedStageSets[this.$root.server].has('LS-6') ? 'LS-5' : 'LS-6';
    },
    useCE() {
      return unopenedStageSets[this.$root.server].has('CE-6') ? 'CE-5' : 'CE-6';
    },
    useLSData() {
      return LSStages[this.useLS];
    },
    useCEData() {
      return CEStages[this.useCE];
    },
    result() {
      const { list, have, money } = this.inputs;
      const expHave = _.sum(_.map(have, (v, i) => v * ExpData[i]));

      let expNeed = 0;
      let lmdNeed = 0;
      const expStep = [];
      const use = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
      };

      list.forEach(({ star, current, target }) => {
        if (!(target.elite > current.elite || target.level > current.level)) return;
        const ML = maxLevel[star - 1];
        //计算最初1级所需
        const firstExp = characterExp[current.elite][current.level - 1];
        if (firstExp) {
          const firstNeed = firstExp - current.exp;
          const firstCost =
            (firstNeed / firstExp) * characterUpgradeCost[current.elite][current.level - 1];
          expNeed += firstNeed;
          lmdNeed += firstCost;
        }
        //后续计算
        for (let e = current.elite; e <= target.elite; e++, expStep.push(expNeed)) {
          if (e > current.elite) lmdNeed += eliteCost[star - 1][e - 1];
          const maxL = e == target.elite ? target.level : ML[e];
          for (let l = e == current.elite ? current.level + 1 : 1; l < maxL; l++) {
            expNeed += characterExp[e][l - 1];
            lmdNeed += characterUpgradeCost[e][l - 1];
          }
        }
      });

      let lsNeed = ge0(Math.ceil((expNeed - expHave) / this.useLSData.exp));

      //实际消耗估算
      if (expStep.length > 0) {
        _.forEachRight(expStep, (v, i, a) => {
          if (i > 0) a[i] -= a[i - 1];
        });
        let expRest = _.mapValues(this.useLSData.drop, (v, i) => have[i] + v * lsNeed);
        for (let step of expStep) {
          while (step > 0) {
            if (_.sum(Object.values(expRest)) == 0) {
              lsNeed++;
              expRest = _.cloneDeep(this.useLSData.drop);
            }
            for (let i = 5; i >= 2; i--) {
              while (step >= ExpData[i] && expRest[i] > 0) {
                use[i]++;
                expRest[i]--;
                step -= ExpData[i];
              }
            }
            for (let i = 2; i <= 5; i++) {
              while (step > 0 && expRest[i] > 0) {
                use[i]++;
                expRest[i]--;
                step -= ExpData[i];
              }
            }
          }
        }
      }

      const ceNeed = ge0(
        Math.ceil((lmdNeed - lsNeed * this.useLSData.money - money) / this.useCEData.money),
      );

      return {
        exp: expNeed,
        cost: Math.ceil(lmdNeed),
        ls: lsNeed,
        ce: ceNeed,
        use,
        have: _.mapValues(this.useLSData.drop, (v, i) => have[i] + v * lsNeed),
      };
    },
  },
  methods: {
    ge0,
    updateSelect({ star, current, target }, i) {
      //更新值
      const maxElite = this.maxElite[star - 1];
      if (current.elite > maxElite) current.elite = maxElite;
      if (target.elite > maxElite) target.elite = maxElite;
      if (current.elite > target.elite) target.elite = current.elite;
      //更新下拉选择
      this.$nextTick(() =>
        this.$$(`tr[data-index='${i}'] .select-need-update`).each((i, ele) =>
          new this.$Select(ele).handleUpdate(),
        ),
      );
    },
    reset() {
      this.inputs = _.cloneDeep(defaultInputs);
      this.$nextTick(() =>
        this.$$('.select-need-update').each((i, ele) => new this.$Select(ele).handleUpdate()),
      );
    },
    k2i(id) {
      return id + 1999;
    },
    addItem(i) {
      this.inputs.list.splice(i + 1, 0, _.cloneDeep(defaultItemInputs));
      this.$mutationNextTick(`tr[data-index='${i + 1}']`);
    },
    removeItem(i) {
      this.inputs.list.splice(i, 1);
    },
  },
  created() {
    (obj => obj && (this.inputs = pickClone(this.inputs, obj)))(nls.getItem('inputs'));
  },
};
</script>

<style lang="scss">
#arkn-level {
  #input-table {
    td {
      padding-top: 8px !important;
      padding-bottom: 8px !important;
      border: none;
      flex-wrap: wrap;
      &:nth-child(2) {
        padding-left: 16px !important;
      }
    }
    .hr {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  }
  .input-actions {
    display: flex;
    margin-top: auto;
    flex-direction: row-reverse;
    flex-grow: 1;
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
