<template>
  <div id="preset-todo" class="mdui-dialog" ref="dialog">
    <template v-if="curPresetName">
      <div class="mdui-dialog-title">
        <avatar class="mdui-card-header-avatar mdui-color-grey-400 no-pe" :name="curPresetName" />
        <div class="mdui-card-header-title">{{ $t(`character.${curPresetName}`) }}</div>
        <div class="mdui-text-color-theme-secondary mdui-m-t-1 no-sl"
          ><small>{{ $t(`cultivate.todos.tips`) }}</small></div
        >
      </div>
      <div class="mdui-dialog-content mdui-p-x-0 mdui-p-y-0 mdui-typo">
        <transition-group
          class="mdui-list mdui-p-y-0 no-sl"
          tag="div"
          name="todo-list-transition"
          @before-leave="$root.transitionBeforeLeave"
          @after-leave="$root.transitionAfterLeaveBeforeEnter"
        >
          <template v-for="group in displayTodoGroup">
            <template v-for="(todo, ti) in group.list">
              <label
                :key="`elite-todo-${todo.name}`"
                class="mdui-list-item mdui-p-l-4"
                :class="{ 'mdui-ripple': ti == 0 }"
                @click="setHighlightFromTodo(todo)"
              >
                <div class="mdui-checkbox" :class="{ 'opacity-0': group.disabled || ti > 0 }">
                  <input
                    v-if="ti == 0"
                    type="checkbox"
                    :disabled="group.disabled || !todoCanFinished(todo)"
                    @change="finishTodo(todo, group)"
                  />
                  <i class="mdui-checkbox-icon"></i>
                </div>
                <div class="mdui-list-item-content mdui-m-l-1">
                  <span
                    class="mdui-m-r-1"
                    :class="{
                      'mdui-text-color-blue': ti == 0,
                      'mdui-text-color-theme-secondary': ti > 0,
                    }"
                    >{{ todo.name }}</span
                  >
                  <div class="preset-todo-materials">
                    <small
                      class="mdui-text-color-grey-600"
                      v-for="(item, i) in todoNeeds(todo)"
                      :key="`elite-need-${i + 1}`"
                    >
                      {{ item.text }}
                      {{ item.have
                      }}<span
                        v-if="item.synt"
                        :class="{
                          'mdui-text-color-theme-accent': todoEnough(todo) && todoNeedSynt(todo),
                        }"
                        >({{ item.synt }})</span
                      >/<span
                        :class="{
                          'mdui-text-color-theme-accent mdui-btn-bold':
                            item.have + item.synt < item.need,
                        }"
                        >{{ item.need }}</span
                      >
                    </small>
                    <small
                      v-if="!todoEnough(todo)"
                      class="mdui-text-color-theme-accent mdui-btn-bold"
                      >{{ $t(`cultivate.todos.cannotFinished`) }}</small
                    >
                    <small v-else-if="todoNeedSynt(todo)" class="mdui-text-color-theme-accent">{{
                      $t(`cultivate.todos.needToSynt`)
                    }}</small>
                  </div>
                </div>
              </label>
            </template>
          </template>
        </transition-group>
      </div>
    </template>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.close') }}</button
      >
    </div>
  </div>
</template>

<script>
import mduiDialogMixin from '@/mixins/mduiDialog';

import _ from 'lodash';

import elite from '@/data/cultivate.json';

export default {
  mixins: [mduiDialogMixin],
  props: {
    constants: {
      type: Object,
      default: () => ({}),
    },
    highlight: Object,
  },
  data: () => ({
    pSetting: null,
    curPreset: null,
    todoGroupList: null,
  }),
  created() {
    this.$on('closed', () => (this.curPreset = null));
  },
  computed: {
    displayTodoGroup() {
      const groups = _.transform(
        this.todoGroupList,
        (list, { type, index, group }) => {
          const l = _.filter(group, todo => !todo.finished);
          if (_.size(l)) list.push({ type, index, list: l, disabled: false });
        },
        [],
      );
      if (groups.some(({ type }) => type === 'normalSkill')) {
        groups
          .filter(({ type }) => type === 'eliteSkill')
          .forEach(group => (group.disabled = true));
      }
      return groups;
    },
    curPresetName() {
      return this.curPreset?.tag?.name;
    },
    curElite() {
      return elite[this.curPresetName];
    },
  },
  methods: {
    showTodoPreset(obj) {
      this.curPreset = obj;
      const setting = obj.tag.setting;
      this.pSetting = _.cloneDeep(setting);
      const todoGroupList = [
        {
          type: 'promotion',
          group: _.map(this.curElite.evolve, (cost, i) => ({
            cost,
            name: `${this.$t('common.promotion')}${i + 1}`,
            index: i,
            check: setting.evolve[i],
          })),
        },
        {
          type: 'normalSkill',
          group: _.map(_.range(setting.skills.normal[1], setting.skills.normal[2]), ski => ({
            name: `${this.$t('common.skill')} ${ski} -> ${ski + 1}`,
            index: ski,
            check: setting.skills.normal[0],
            cost: this.curElite.skills.normal[ski - 1],
          })),
        },
        ..._.map(this.curElite.skills.elite, ({ cost, name }, i) => ({
          type: 'eliteSkill',
          index: i,
          group: _.map(_.range(setting.skills.elite[i][1], setting.skills.elite[i][2]), ski => ({
            name: `${this.$t(`skill.${name}`)} ${ski} -> ${ski + 1}`,
            index: ski,
            check: setting.skills.elite[i][0],
            cost: cost[ski - 7],
          })),
        })),
        ..._.map(this.curElite.uniequip, ({ cost, id }) => ({
          type: 'uniequip',
          group: [
            {
              name: this.$t(`uniequip.${id}`),
              index: id,
              check: setting.uniequip[id],
              cost,
            },
          ],
        })),
      ];
      this.todoGroupList = _.map(todoGroupList, todoGroup => ({
        ...todoGroup,
        group: _.map(
          _.filter(todoGroup.group, todo => todo.check),
          m => _.merge(m, { finished: false }),
        ),
      }));
      this.$nextTick(() => {
        this.open();
        // this.$mutation();
      });
    },
    todoNeeds({ cost }) {
      const that = this.$parent;
      const result = [];
      _.forIn(cost, (num, m) =>
        result.push({
          text: this.$t(`material.${m}`),
          need: num * 1,
          have: that.inputsInt[m].have,
          synt: Math.min(that.gaps[m][1], Math.max(num * 1 - that.inputsInt[m].have, 0)),
        }),
      );
      return result;
    },
    todoCanFinished({ cost }) {
      return _.every(cost, (num, m) => this.$parent.inputsInt[m].have >= num);
    },
    todoEnough({ cost }) {
      const that = this.$parent;
      return _.every(cost, (num, m) => that.inputsInt[m].have + that.gaps[m][1] >= num);
    },
    todoNeedSynt({ cost }) {
      return _.some(cost, (num, m) => this.$parent.inputsInt[m].have < num);
    },
    finishTodo(todo, group) {
      const that = this.$parent;
      todo.finished = true;
      const handle = (obj, init) => {
        const next = todo.index + 1;
        if (next >= obj[2]) _.range(0, 3).forEach(i => (obj[i] = init[i]));
        else obj[1] = next;
      };
      switch (group.type) {
        case 'promotion': // 精英化
          this.pSetting.evolve[todo.index] = false;
          break;
        case 'normalSkill': // 普通技能
          handle(this.pSetting.skills.normal, this.constants.pSettingInit.skills.normal);
          break;
        case 'eliteSkill': // 专精技能
          handle(
            this.pSetting.skills.elite[group.index],
            this.constants.pSettingInit.skills.elite[group.index],
          );
          break;
        case 'uniequip': // 模组
          this.pSetting.uniequip[todo.index] = false;
          break;
      }
      _.forIn(todo.cost, (num, m) => {
        that.inputs[m].have = (that.inputsInt[m].have - num).toString();
        that.inputs[m].need = (that.inputsInt[m].need - num).toString();
      });
      if (!_.size(this.displayTodoGroup)) {
        that.selected.presets.splice(this.curPreset.index, 1);
        this.close();
      } else {
        that.selected.presets[this.curPreset.index].setting = _.cloneDeep(this.pSetting);
      }
      that.usePreset();
    },
    // 从代办设置材料高亮
    setHighlightFromTodo(todo) {
      if (this.todoCanFinished(todo)) {
        if (_.isEqual(this.highlight, todo.cost)) this.$emit('update:highlight', {});
        return;
      }
      this.$emit('update:highlight', _.clone(todo.cost));
      this.close();
      this.$nextTick(() =>
        this.$$('.material.highlight')[0]?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'center',
        }),
      );
    },
  },
};
</script>
