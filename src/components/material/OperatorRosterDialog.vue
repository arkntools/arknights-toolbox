<template>
  <div id="operator-roster-dialog" class="mdui-dialog mdui-typo no-sl" ref="dialogRef">
    <div class="mdui-dialog-title roster-title">
      <span>{{ $t('cultivate.panel.roster.title') }}</span>
      <small v-if="parent.operatorRoster.importedAt" class="mdui-text-color-theme-secondary">
        {{ $t('cultivate.panel.roster.lastImported') }}
        {{ new Date(parent.operatorRoster.importedAt).toLocaleString() }}
      </small>
    </div>
    <div class="mdui-dialog-content">
      <input
        ref="fileInput"
        type="file"
        accept=".json,.csv,application/json,text/csv"
        class="mdui-hidden"
        @change="handleFile"
      />
      <div class="roster-toolbar">
        <button
          class="mdui-btn mdui-ripple mdui-btn-dense"
          v-theme-class="$root.color.blueBtn"
          @click="$refs.fileInput.click()"
        >
          <i class="mdui-icon material-icons mdui-icon-left">file_upload</i>
          {{ $t('cultivate.panel.roster.import') }}
        </button>
        <span class="mdui-text-color-theme-secondary">
          {{ $t('cultivate.panel.roster.ownedCount', [parent.operatorRosterSummary.owned]) }}
        </span>
        <div class="mdui-textfield roster-search">
          <i class="mdui-icon material-icons">search</i>
          <input
            v-model.trim="search"
            class="mdui-textfield-input"
            :placeholder="$t('cultivate.panel.roster.search')"
          />
        </div>
        <select v-model.number="rarity" class="mdui-select">
          <option :value="0">{{ $t('common.rarity') }}</option>
          <option v-for="star in $_.range(6, 0)" :key="star" :value="star">{{ star }}★</option>
        </select>
        <select v-model.number="profession" class="mdui-select">
          <option :value="0">{{ $t('hr.tagType.professions') }}</option>
          <option v-for="tag in $_.range(1, 9)" :key="tag" :value="tag">{{
            $t(`tag.${tag}`)
          }}</option>
        </select>
        <select v-model.number="elite" class="mdui-select">
          <option :value="-1">{{ $t('common.promotion') }}</option>
          <option v-for="phase in $_.range(0, 3)" :key="phase" :value="phase">E{{ phase }}</option>
        </select>
        <label class="mdui-checkbox">
          <input v-model="onlyWithGoal" type="checkbox" />
          <i class="mdui-checkbox-icon"></i>
          {{ $t('cultivate.panel.roster.withGoal') }}
        </label>
      </div>

      <div v-if="preview" class="import-preview mdui-shadow-2">
        <strong>{{ $t('cultivate.panel.roster.importPreview') }}</strong>
        <span>{{ $t('cultivate.panel.roster.totalCount', [preview.summary.total]) }}</span>
        <span>{{ $t('cultivate.panel.roster.ownedCount', [preview.summary.owned]) }}</span>
        <span>{{ $t('cultivate.panel.roster.unownedCount', [preview.summary.unowned]) }}</span>
        <span v-if="preview.summary.invalid" class="mdui-text-color-red">
          {{ $t('cultivate.panel.roster.invalidCount', [preview.summary.invalid]) }}
        </span>
        <span v-if="preview.summary.conflicts" class="mdui-text-color-red">
          {{ $t('cultivate.panel.roster.conflictCount', [preview.summary.conflicts]) }}
        </span>
        <span v-if="preview.summary.unknown" class="mdui-text-color-orange">
          {{ $t('cultivate.panel.roster.unknownCount', [preview.summary.unknown]) }}
        </span>
        <span v-if="preview.summary.unreleased" class="mdui-text-color-orange">
          {{ $t('cultivate.panel.roster.unreleasedCount', [preview.summary.unreleased]) }}
        </span>
        <button class="mdui-btn mdui-ripple" @click="preview = null">{{
          $t('common.cancel')
        }}</button>
        <button
          class="mdui-btn mdui-ripple"
          :disabled="!preview.validOperators.length"
          v-theme-class="$root.color.pinkBtn"
          @click="confirmImport"
          >{{ $t('common.import') }}</button
        >
      </div>

      <div v-if="!parent.operatorRosterSummary.total" class="roster-empty">
        <i class="mdui-icon material-icons">group_add</i>
        <p>{{ $t('cultivate.panel.roster.empty') }}</p>
      </div>
      <div v-else-if="!filteredOperators.length" class="roster-empty">
        <i class="mdui-icon material-icons">search_off</i>
        <p>{{ $t('cultivate.panel.roster.noMatch') }}</p>
      </div>
      <div v-else class="operator-grid">
        <article
          v-for="operator in filteredOperators"
          :key="operator.name"
          class="operator-card mdui-card mdui-hoverable"
          :class="{
            'operator-unreleased': !operator.released,
            'operator-unowned': !operator.own,
          }"
        >
          <button class="operator-main mdui-ripple" @click="openOperator(operator)">
            <Avatar class="operator-avatar" :name="operator.name" :lazy="true" />
            <span class="operator-info">
              <strong class="mdui-text-truncate">{{ operator.text }}</strong>
              <small>E{{ operator.elite }} Lv.{{ operator.level }} · {{ operator.rarity }}★</small>
              <small>
                {{ $t('cultivate.panel.roster.potential', [operator.potential]) }} ·
                {{
                  operator.sources.skills === 'skland'
                    ? $t('cultivate.panel.roster.sklandSynced')
                    : operator.sources.skills === 'manual'
                      ? $t('cultivate.panel.roster.manualProgress')
                      : $t('cultivate.panel.roster.skillUnknown')
                }}
              </small>
              <small v-if="!operator.own" class="mdui-text-color-red">
                <i class="mdui-icon material-icons status-warning">warning</i>
                {{ $t('cultivate.panel.roster.goalNotOwnedWarning') }}
              </small>
            </span>
            <i v-if="operator.hasPreset" class="mdui-icon material-icons goal-mark">task_alt</i>
          </button>
          <div v-if="operator.own" class="operator-quick-actions">
            <button
              v-if="maxElite(operator) >= 2 && operator.elite < 2"
              class="mdui-btn mdui-btn-dense mdui-ripple"
              @click="quick(operator, 'elite2')"
              >E2</button
            >
            <button
              v-if="canRaiseMainSkill(operator)"
              class="mdui-btn mdui-btn-dense mdui-ripple"
              @click="quick(operator, 'skill7')"
              >Skill 7</button
            >
            <button
              v-for="skill in masterySkills(operator)"
              :key="skill.name"
              class="mdui-btn mdui-btn-dense mdui-ripple"
              @click="quick(operator, 'mastery3', skill.index)"
              >S{{ skill.index + 1 }} M3</button
            >
          </div>
        </article>
      </div>
    </div>
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
import { computed, defineComponent, inject, ref } from 'vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { canRaiseOperatorMainSkill } from '@/utils/operatorGoals.mjs';

export default defineComponent({
  emits: MDUI_DIALOG_EMITS,
  setup(props, context) {
    const parent = inject('parent')();
    const dialogRef = ref();
    return {
      parent,
      dialogRef,
      ...useMduiDialog(context.emit, dialogRef),
      supportedOperators: computed(() => parent.rosterOperators),
    };
  },
  data: () => ({
    search: '',
    rarity: 0,
    profession: 0,
    elite: -1,
    onlyWithGoal: false,
    preview: null,
  }),
  computed: {
    filteredOperators() {
      const search = this.$root.pureName(this.search);
      return this.supportedOperators.filter(operator => {
        if (this.onlyWithGoal) {
          if (!operator.hasPreset) return false;
        } else if (!operator.own) return false;
        if (this.rarity && operator.rarity !== this.rarity) return false;
        if (this.profession && operator.profession !== this.profession) return false;
        if (this.elite >= 0 && operator.elite !== this.elite) return false;
        if (!search) return true;
        return this.$root
          .getSearchGroup(this.parent.characterTable[operator.name])
          .some(value => value.includes(search));
      });
    },
  },
  methods: {
    async handleFile(event) {
      const [file] = event.target.files || [];
      event.target.value = '';
      if (!file) return;
      this.preview = await this.parent.previewOperatorRosterFile(file);
    },
    confirmImport() {
      if (!this.parent.commitOperatorRosterImport(this.preview)) return;
      this.preview = null;
      this.$snackbar(this.$t('cultivate.panel.roster.imported'));
    },
    openOperator(operator) {
      if (!operator.released) return;
      this.tempClose();
      this.parent.openOperatorPreset(operator.name, () => this.open());
    },
    quick(operator, kind, skillIndex) {
      if (!operator.released) return;
      const skill = this.parent.elite[operator.name]?.skills?.elite?.[skillIndex];
      const needsProgressPrompt =
        kind !== 'elite2' &&
        (!Number.isInteger(operator.mainSkillLevel) ||
          (kind === 'mastery3' && !Number.isInteger(operator.skills[skill?.name])));
      if (needsProgressPrompt) this.tempClose();
      this.parent.applyOperatorQuickGoal(
        operator.name,
        kind,
        skillIndex,
        needsProgressPrompt ? () => this.open() : undefined,
      );
    },
    masterySkills(operator) {
      return (this.parent.elite[operator.name]?.skills?.elite || [])
        .slice(0, 3)
        .map((skill, index) => ({ ...skill, index }))
        .filter(
          skill =>
            this.parent.isSkillReleased(skill) &&
            (!Number.isInteger(operator.skills[skill.name]) || operator.skills[skill.name] < 3),
        );
    },
    canRaiseMainSkill(operator) {
      return canRaiseOperatorMainSkill(this.parent.elite[operator.name], operator.mainSkillLevel);
    },
    maxElite(operator) {
      return (this.parent.level.maxLevel?.[operator.rarity - 1]?.length || 1) - 1;
    },
  },
});
</script>

<style scoped lang="scss">
#operator-roster-dialog {
  width: calc(100vw - 32px);
  max-width: 1200px;
  height: calc(100vh - 32px);
  max-height: 900px;
}
.roster-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  small {
    font-size: 12px;
  }
}
.roster-toolbar,
.import-preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.roster-search {
  flex: 1 1 180px;
  min-width: 160px;
  padding: 0;
}
.import-preview {
  margin: 12px 0;
  padding: 12px;
  border-radius: 4px;
}
.operator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  padding: 12px 0;
}
.operator-card {
  min-width: 0;
  min-height: 128px;
}
.operator-main {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 12px;
  gap: 12px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.operator-avatar {
  display: block;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  object-fit: cover;
}
.operator-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}
.status-warning {
  font-size: 14px;
  vertical-align: text-bottom;
}
.goal-mark {
  color: #009688;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  overflow: hidden;
  line-height: 24px;
}
.operator-quick-actions {
  display: flex;
  flex-wrap: wrap;
  padding: 0 8px 8px;
}
.operator-unreleased {
  opacity: 0.55;
}
.operator-unowned {
  border: 1px solid rgba(244, 67, 54, 0.55);
}
.roster-empty {
  padding: 64px 16px;
  text-align: center;
  .mdui-icon {
    font-size: 64px;
  }
}
@media (max-width: 600px) {
  #operator-roster-dialog {
    width: 100vw;
    height: 100vh;
    max-height: none;
  }
  .operator-grid {
    grid-template-columns: 1fr;
  }
}
</style>
