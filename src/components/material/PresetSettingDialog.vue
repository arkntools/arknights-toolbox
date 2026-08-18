<template>
  <mdui-dialog
    id="preset-setting"
    class="mdui-card"
    ref="dialog"
    :style="{ overflow }"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <template v-if="sp">
      <div class="mdui-card-header mdui-p-b-0">
        <Avatar class="mdui-card-header-avatar mdui-color-grey-400" :name="selectedPresetName" />
        <div class="mdui-valign flex-nowrap">
          <div class="mdui-card-header-title flex-nowrap flex-equally" style="margin-left: 12px">
            <span class="mdui-text-truncate">{{ $t(`character.${selectedPresetName}`) }}</span>
            <small v-if="curSklandCultivate" class="mdui-text-color-theme-secondary mdui-m-l-1">{{
              getCultivateCharLevelText(selectedPresetName)
            }}</small>
            <small
              v-if="parent().isPresetOperatorUnowned(selectedPresetName)"
              class="mdui-text-color-red mdui-m-l-1"
            >
              <i class="mdui-icon material-icons">warning</i>
              {{ $t('cultivate.panel.roster.goalNotOwnedWarning') }}
            </small>
          </div>
          <mdui-checkbox class="mdui-m-l-2 flex-no-shrink" v-model="pSetting.focus">{{
            $t('cultivate.panel.preset.focus')
          }}</mdui-checkbox>
        </div>
      </div>
      <div class="mdui-card-content preset-list mdui-p-x-3">
        <div class="level-goal cb-with-num-select">
          <mdui-checkbox v-model="pSetting.level.enabled" class="mdui-p-r-2">
            {{ $t('cultivate.panel.roster.levelGoal') }}
          </mdui-checkbox>
          <div class="level-goal-fields">
            <span class="mdui-text-color-theme-secondary">{{ $t('common.current') }}</span>
            <mdui-select-num
              v-model="pSetting.level.current.elite"
              :options="$_.range(0, maxElite + 1)"
              @change="handleLevelChange(true)"
            />
            <mdui-number-input
              v-model.number="pSetting.level.current.level"
              :min="1"
              :max="maxCurrentLevel"
              @change="handleLevelChange(true)"
              >{{ $t('common.level') }}</mdui-number-input
            >
            <mdui-number-input
              v-model.number="pSetting.level.current.exp"
              :min="0"
              @change="handleCurrentExpChange"
              >{{ $t('common.exp') }}</mdui-number-input
            >
          </div>
          <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
          <div class="level-goal-fields">
            <span class="mdui-text-color-theme-secondary">{{ $t('common.target') }}</span>
            <mdui-select-num
              v-model="pSetting.level.target.elite"
              :options="$_.range(pSetting.level.current.elite, maxElite + 1)"
              @change="handleLevelChange(false)"
            />
            <mdui-number-input
              v-model.number="pSetting.level.target.level"
              :min="1"
              :max="maxTargetLevel"
              @change="handleLevelChange(false)"
              >{{ $t('common.level') }}</mdui-number-input
            >
          </div>
        </div>
        <small class="mdui-text-color-theme-secondary">{{
          $t('cultivate.panel.roster.expConservativeTip')
        }}</small>
        <small
          v-if="currentOperatorProgress.sources.skills === 'unknown'"
          class="mdui-text-color-orange mdui-m-l-1"
          >{{ $t('cultivate.panel.roster.skillUnknownTip') }}</small
        >
        <div class="preset-hr"></div>
        <!-- 精英化选框 -->
        <div class="elite-cb-list">
          <mdui-checkbox
            v-for="(o, i) in sp.evolve"
            :key="`elite-${i + 1}`"
            v-model="pSetting.evolve[i]"
            :disabled="pSetting.level.current.elite >= i + 1"
            @change="checked => checked && ensurePromotionPrerequisite(i + 1, 1)"
            >{{ $t('common.promotion') }}{{ i + 1 }}</mdui-checkbox
          >
        </div>
        <!-- 普通技能选框 -->
        <div class="skill-normal cb-with-num-select" v-if="sp.skills.normal.length >= 2">
          <mdui-checkbox
            v-model="pSetting.skills.normal[0]"
            class="mdui-p-r-2"
            :class="{ 'mdui-text-color-theme-disabled': normalSkillComplete }"
            :disabled="normalSkillComplete"
            @change="checked => checked && ensurePromotionPrerequisite(1, 1)"
          >
            <span>{{ $t('common.skill') }}</span>
            <span
              v-if="curSklandCultivate.mainSkillLevel"
              class="mdui-text-color-theme-secondary mdui-m-l-1"
              >({{ curSklandCultivate.mainSkillLevel }})</span
            >
          </mdui-checkbox>
          <div class="num-select inline-block">
            <mdui-select-num
              v-model="pSetting.skills.normal[1]"
              :options="normalSkillLevelOptions(false)"
              @change="handleNormalSkillLevelSelect1Change"
            />
            <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
            <mdui-select-num
              v-model="pSetting.skills.normal[2]"
              :options="normalSkillLevelOptions(true)"
              @change="pSetting.skills.normal[0] = true"
            />
          </div>
        </div>
        <!-- 精英技能选框 -->
        <template v-if="sp.skills.elite.length">
          <div class="preset-hr"></div>
          <div
            class="skill-elite cb-with-num-select"
            v-for="(skill, i) in sp.skills.elite"
            :key="`se-${skill.name}`"
            v-show="parent().isSkillReleased(skill)"
          >
            <div class="flex flex-grow mw-100p">
              <mdui-checkbox
                v-model="pSetting.skills.elite[i][0]"
                class="skill-elite-cb mdui-p-r-2"
                :class="{ 'mdui-text-color-theme-disabled': eliteSkillComplete(i) }"
                :disabled="eliteSkillComplete(i)"
                :custom-slot="true"
                @change="checked => checked && ensurePromotionPrerequisite(2, 1)"
              >
                <div class="mdui-valign flex-nowrap no-wrap of-hidden">
                  <span class="mdui-text-truncate">{{ $t(`skill.${skill.name}`) }}</span>
                  <span
                    v-if="curSklandCultivate.skills"
                    class="mdui-text-color-theme-secondary mdui-m-l-1"
                    >({{ curSklandCultivate.skills[skill.name] }})</span
                  >
                </div>
              </mdui-checkbox>
              <DataImg
                class="skill-icon mdui-shadow-4"
                type="skill"
                :name="skill.icon || skill.name"
              />
            </div>
            <div class="num-select inline-block mdui-p-l-3">
              <mdui-select-num
                v-model="pSetting.skills.elite[i][1]"
                :options="eliteSkillLevelOptions(i, false)"
                :display="minus7"
                @change="() => handleEliteSkillLevelSelect1Change(i)"
              />
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <mdui-select-num
                v-model="pSetting.skills.elite[i][2]"
                :options="eliteSkillLevelOptions(i, true)"
                :display="minus7"
                @change="pSetting.skills.elite[i][0] = true"
              />
            </div>
          </div>
        </template>
        <!-- 模组选框 -->
        <template v-if="presetUniequip.length">
          <div class="preset-hr"></div>
          <small class="mdui-text-color-theme-secondary">{{
            $t('cultivate.panel.roster.modulePrerequisiteTip')
          }}</small>
          <div
            v-for="{ id } in presetUniequip"
            class="uniequip cb-with-num-select"
            :key="`uniequip-${id}`"
          >
            <div class="flex flex-grow mw-100p">
              <mdui-checkbox
                v-model="pSetting.uniequip[id][0]"
                class="mdui-p-r-2"
                :class="{ 'mdui-text-color-theme-disabled': uniequipComplete(id) }"
                :disabled="uniequipComplete(id)"
                @change="
                  val => {
                    if (val) ensureModulePrerequisite();
                    if (!$root.isReleasedUniequip(id) && !val) $nextTick($refs.dialog.handleUpdate);
                  }
                "
              >
                <div class="mdui-valign flex-nowrap no-wrap of-hidden">
                  <span class="mdui-text-truncate">{{ $t(`uniequip.${id}`) }}</span>
                  <span
                    v-if="curSklandCultivate.equips"
                    class="mdui-text-color-theme-secondary mdui-m-l-1"
                    >({{ curSklandCultivate.equips[id] }})</span
                  >
                </div>
              </mdui-checkbox>
              <div class="uniequip-icon no-pe mdui-shadow-4">
                <DataImg
                  class="uniequip-icon-img"
                  :class="uniequipIconClass(uniequip[id].typeIcon)"
                  type="uniequip"
                  :name="uniequip[id].typeIcon"
                />
              </div>
            </div>
            <div
              v-show="
                $root.isGradedUniequipReleased ||
                pSetting.uniequip[id][1] !== 0 ||
                pSetting.uniequip[id][2] !== 1
              "
              class="num-select inline-block mdui-p-l-3"
            >
              <mdui-select-num
                v-model="pSetting.uniequip[id][1]"
                :options="uniequipLevelOptions(id, false)"
                @change="() => handleUniequipLevelSelect1Change(id)"
              />
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <mdui-select-num
                v-model="pSetting.uniequip[id][2]"
                :options="uniequipLevelOptions(id, true)"
                @change="pSetting.uniequip[id][0] = true"
              />
            </div>
          </div>
        </template>
      </div>
    </template>
    <div class="mdui-dialog-actions" ref="actions">
      <a
        v-if="sp && wikiInfo"
        class="mdui-btn mdui-ripple float-left"
        v-theme-class="$root.color.dialogTransparentBtn"
        @click="() => wikiInfo.open()"
        >{{ wikiInfo.btnName }}</a
      >
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.cancel') }}</button
      >
      <button
        v-show="this.pSetting?.state == 'add'"
        class="mdui-btn mdui-ripple"
        v-theme-class="['mdui-color-pink', 'mdui-color-indigo-a100 mdui-ripple-black']"
        mdui-dialog-confirm
        @click="parent().addPreset()"
        >{{ $t('common.add') }}</button
      >
      <button
        v-show="this.pSetting?.state == 'edit'"
        class="mdui-btn mdui-ripple"
        v-theme-class="['mdui-color-teal', 'mdui-color-teal-200 mdui-ripple-black']"
        mdui-dialog-confirm
        @click="parent().editPreset()"
        >{{ $t('common.edit') }}</button
      >
    </div>
  </mdui-dialog>
</template>

<script>
import { defineComponent, markRaw } from 'vue';
import { mapState, mapActions } from 'pinia';
import { debounce } from 'lodash';
import { useDataStore } from '@/store/data';
import { useSklandStore } from '@/store/skland';
import { synchronizeProgressSelect } from '@/utils/operatorGoals.mjs';
import DataImg from '@/components/DataImg.vue';

const offsetUniequipIcons = new Set([
  'sum-x',
  'sum-y',
  'ins-x',
  'ins-y',
  'dea-x',
  'dea-y',
  'rin-x',
  'rin-y',
  'exe-x',
  'exe-y',
  'cha-x',
  'cha-y',
  'swo-x',
  'swo-y',
  'chg-x',
  'chg-y',
  'dre-x',
  'dre-y',
  'mer-x',
  'art-y',
  'spc-x',
  'spc-y',
  'dec-x',
  'dec-y',
  'pum-y',
  'pro-y',
  'hes-y',
]);

export default defineComponent({
  components: { DataImg },
  inject: ['parent'],
  emits: ['close'],
  data: () => ({
    overflow: 'hidden',
    updateOverflowDebounce: null,
  }),
  watch: {
    currentOperatorProgress: {
      handler() {
        this.initSettingDefaultValue();
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    ...mapState(useDataStore, ['characterTable', 'uniequip', 'level']),
    ...mapState(useSklandStore, {
      sklandCredValid: 'credValid',
      sklandCultivateCharacters: 'cultivateCharacters',
    }),
    selectedPresetName() {
      return this.parent().selectedPresetName;
    },
    sp() {
      return this.parent().sp;
    },
    pSetting() {
      return this.parent().pSetting;
    },
    currentOperatorProgress() {
      return this.parent().getOperatorProgress(this.selectedPresetName);
    },
    presetUniequip() {
      return this.parent().presetUniequip;
    },
    curSklandCultivate() {
      return this.sklandCultivateCharacters[this.selectedPresetName] || {};
    },
    wikiInfo() {
      if (!this.selectedPresetName) return null;
      return this.$root.getWikiInfo({
        name: this.selectedPresetName,
        ...this.characterTable[this.selectedPresetName],
      });
    },
    maxElite() {
      const star = this.characterTable[this.selectedPresetName]?.star;
      return Math.max(0, (this.level.maxLevel?.[star - 1]?.length || 1) - 1);
    },
    maxCurrentLevel() {
      const star = this.characterTable[this.selectedPresetName]?.star;
      return this.level.maxLevel?.[star - 1]?.[this.pSetting.level.current.elite] || 1;
    },
    maxTargetLevel() {
      const star = this.characterTable[this.selectedPresetName]?.star;
      return this.level.maxLevel?.[star - 1]?.[this.pSetting.level.target.elite] || 1;
    },
    normalSkillComplete() {
      const max = (this.sp?.skills?.normal?.length || 0) + 1;
      return max > 1 && this.pSetting?.skills?.normal?.[1] >= max;
    },
  },
  created() {
    this.updateOverflowDebounce = markRaw(debounce(this.updateOverflow, 300));
  },
  beforeDestroy() {
    this.unbindEvents();
  },
  methods: {
    ...mapActions(useSklandStore, ['updateSklandCultivateIfExpired', 'getCultivateCharLevelText']),
    open() {
      this.overflow = 'hidden';
      this.$refs.dialog.open();
      if (this.$root.supportSkland) this.updateSklandCultivateIfExpired();
    },
    updateOverflow() {
      const dialogRect = this.$refs.dialog.$el.getBoundingClientRect();
      const actionsRect = this.$refs.actions.getBoundingClientRect();
      this.overflow = actionsRect.bottom - dialogRect.bottom > 1 ? 'auto' : 'visible';
    },
    handleOpened() {
      this.updateOverflow();
      this.bindEvents();
    },
    handleClosed() {
      this.parent().selectedPresetName = '';
      this.unbindEvents();
      this.$emit('closed');
    },
    bindEvents() {
      window.addEventListener('resize', this.updateOverflowDebounce);
      window.addEventListener('orientationchange', this.updateOverflow);
    },
    unbindEvents() {
      window.removeEventListener('resize', this.updateOverflowDebounce);
      window.removeEventListener('orientationchange', this.updateOverflow);
    },
    uniequipIconClass(icon) {
      return offsetUniequipIcons.has(icon) ? 'uniequip-icon-img-offset' : '';
    },
    normalSkillLevelOptions(target) {
      const max = this.sp.skills.normal.length + 1;
      const current = this.pSetting.skills.normal[1];
      if (current >= max) return [max];
      return target ? this.$_.range(current + 1, max + 1) : this.$_.range(1, max);
    },
    eliteSkillComplete(i) {
      const max = 7 + this.sp.skills.elite[i].cost.length;
      return this.pSetting.skills.elite[i][1] >= max;
    },
    eliteSkillLevelOptions(i, target) {
      const config = this.pSetting.skills.elite[i];
      const max = 7 + this.sp.skills.elite[i].cost.length;
      if (config[1] >= max) return [max];
      return target ? this.$_.range(config[1] + 1, max + 1) : this.$_.range(7, max);
    },
    uniequipComplete(id) {
      const max = this.presetUniequip.find(item => item.id === id)?.cost?.length || 0;
      return max > 0 && this.pSetting.uniequip[id][1] >= max;
    },
    uniequipLevelOptions(id, target) {
      const config = this.pSetting.uniequip[id];
      const max = this.presetUniequip.find(item => item.id === id)?.cost?.length || 0;
      if (config[1] >= max) return [max];
      return target ? this.$_.range(config[1] + 1, max + 1) : this.$_.range(max);
    },
    handleNormalSkillLevelSelect1Change() {
      const { normal } = this.pSetting.skills;
      normal[0] = true;
      if (normal[1] >= normal[2]) normal[2] = normal[1] + 1;
      this.parent().updateOperatorProgressOverride(this.selectedPresetName, {
        mainSkillLevel: normal[1],
      });
      this.ensurePromotionPrerequisite(1, 1);
    },
    handleLevelChange(currentChanged) {
      const setting = this.pSetting.level;
      if (currentChanged && setting.target.elite < setting.current.elite) {
        setting.target.elite = setting.current.elite;
      }
      setting.current.level = Math.min(
        Math.max(1, setting.current.level || 1),
        this.maxCurrentLevel,
      );
      setting.target.level = Math.min(Math.max(1, setting.target.level || 1), this.maxTargetLevel);
      if (
        setting.target.elite < setting.current.elite ||
        (setting.target.elite === setting.current.elite &&
          setting.target.level <= setting.current.level)
      ) {
        setting.target.level = Math.min(this.maxTargetLevel, setting.current.level + 1);
      }
      this.pSetting.evolve = this.pSetting.evolve.map(
        (_, index) => index + 1 > setting.current.elite && index + 1 <= setting.target.elite,
      );
      setting.enabled = true;
    },
    handleCurrentExpChange() {
      this.pSetting.level.current.exp = Math.max(0, this.pSetting.level.current.exp || 0);
      this.parent().updateOperatorProgressOverride(this.selectedPresetName, {
        currentExp: this.pSetting.level.current.exp,
      });
    },
    handleEliteSkillLevelSelect1Change(i) {
      const { elite } = this.pSetting.skills;
      elite[i][0] = true;
      if (elite[i][1] >= elite[i][2]) elite[i][2] = elite[i][1] + 1;
      const skillName = this.sp.skills.elite[i].name;
      this.parent().updateOperatorProgressOverride(this.selectedPresetName, {
        skills: {
          ...(this.parent().operatorProgressOverrides[this.selectedPresetName]?.skills || {}),
          [skillName]: elite[i][1] - 7,
        },
      });
      this.ensurePromotionPrerequisite(2, 1);
    },
    handleUniequipLevelSelect1Change(id) {
      const { uniequip } = this.pSetting;
      uniequip[id][0] = true;
      if (uniequip[id][1] >= uniequip[id][2]) uniequip[id][2] = uniequip[id][1] + 1;
      this.parent().updateOperatorProgressOverride(this.selectedPresetName, {
        equips: {
          ...(this.parent().operatorProgressOverrides[this.selectedPresetName]?.equips || {}),
          [id]: uniequip[id][1],
        },
      });
      this.ensureModulePrerequisite();
    },
    ensurePromotionPrerequisite(targetElite, targetLevel) {
      const setting = this.pSetting.level;
      if (
        setting.current.elite > targetElite ||
        (setting.current.elite === targetElite && setting.current.level >= targetLevel)
      ) {
        return;
      }
      setting.enabled = true;
      if (setting.target.elite < targetElite) {
        setting.target = { elite: targetElite, level: targetLevel };
      } else if (setting.target.elite === targetElite) {
        setting.target.level = Math.max(setting.target.level, targetLevel);
      }
      this.pSetting.evolve = this.pSetting.evolve.map(
        (checked, index) =>
          checked || (index + 1 > setting.current.elite && index + 1 <= targetElite),
      );
    },
    ensureModulePrerequisite() {
      const star = this.characterTable[this.selectedPresetName]?.star;
      this.ensurePromotionPrerequisite(2, { 4: 40, 5: 50, 6: 60 }[star] || 1);
    },
    minus7(num) {
      return num - 7;
    },
    initSettingDefaultValue() {
      if (!this.sp || !this.pSetting) return;

      const { mainSkillLevel, skills, equips } = this.currentOperatorProgress;

      // 普通技能 (1~7)
      if (this.sp.skills.normal.length >= 2) {
        const synced = synchronizeProgressSelect(
          this.pSetting.skills.normal,
          mainSkillLevel,
          this.sp.skills.normal.length + 1,
        );
        this.pSetting.skills.normal.splice(0, 3, ...synced);
      }

      // 精英技能 (0~3)
      if (skills && this.sp.skills.elite.length) {
        this.sp.skills.elite.forEach(({ name, cost }, i) => {
          const synced = synchronizeProgressSelect(
            this.pSetting.skills.elite[i],
            skills[name],
            cost.length,
            7,
          );
          this.pSetting.skills.elite[i].splice(0, 3, ...synced);
        });
      }

      // 模组 (0~3)
      if (equips && this.presetUniequip?.length) {
        this.presetUniequip.forEach(({ id, cost }) => {
          const synced = synchronizeProgressSelect(
            this.pSetting.uniequip[id],
            equips[id],
            cost.length,
          );
          this.pSetting.uniequip[id].splice(0, 3, ...synced);
        });
      }
    },
  },
});
</script>
