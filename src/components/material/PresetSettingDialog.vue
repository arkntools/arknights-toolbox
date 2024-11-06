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
        <div class="mdui-card-header-title flex-nowrap">
          <span class="mdui-text-truncate">{{ $t(`character.${selectedPresetName}`) }}</span>
          <small v-if="curSklandCultivate" class="mdui-text-color-theme-secondary mdui-m-l-1">{{
            getCultivateCharLevelText(selectedPresetName)
          }}</small>
        </div>
      </div>
      <div class="mdui-card-content preset-list mdui-p-x-3">
        <!-- 精英化选框 -->
        <div class="elite-cb-list">
          <mdui-checkbox
            v-for="(o, i) in sp.evolve"
            :key="`elite-${i + 1}`"
            v-model="pSetting.evolve[i]"
            >{{ $t('common.promotion') }}{{ i + 1 }}</mdui-checkbox
          >
        </div>
        <!-- 普通技能选框 -->
        <div class="skill-normal cb-with-num-select" v-if="sp.skills.normal.length >= 2">
          <mdui-checkbox v-model="pSetting.skills.normal[0]" class="mdui-p-r-2">
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
              :options="$_.range(1, sp.skills.normal.length + 1)"
              @change="handleNormalSkillLevelSelect1Change"
            />
            <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
            <mdui-select-num
              v-model="pSetting.skills.normal[2]"
              :options="$_.range(pSetting.skills.normal[1] + 1, sp.skills.normal.length + 2)"
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
                :custom-slot="true"
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
                :options="
                  $_.range(
                    sp.skills.normal.length + 1,
                    sp.skills.normal.length + skill.cost.length + 1,
                  )
                "
                :display="minus7"
                @change="() => handleEliteSkillLevelSelect1Change(i)"
              />
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <mdui-select-num
                v-model="pSetting.skills.elite[i][2]"
                :options="
                  $_.range(
                    pSetting.skills.elite[i][1] + 1,
                    sp.skills.normal.length + skill.cost.length + 2,
                  )
                "
                :display="minus7"
                @change="pSetting.skills.elite[i][0] = true"
              />
            </div>
          </div>
        </template>
        <!-- 模组选框 -->
        <template v-if="presetUniequip.length">
          <div class="preset-hr"></div>
          <div
            v-for="{ id, cost } in presetUniequip"
            class="uniequip cb-with-num-select"
            :key="`uniequip-${id}`"
          >
            <div class="flex flex-grow mw-100p">
              <mdui-checkbox
                v-model="pSetting.uniequip[id][0]"
                class="mdui-p-r-2"
                @change="
                  val =>
                    !$root.isReleasedUniequip(id) && !val && $nextTick($refs.dialog.handleUpdate)
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
                :options="$_.range(cost.length)"
                @change="() => handleUniequipLevelSelect1Change(id)"
              />
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <mdui-select-num
                v-model="pSetting.uniequip[id][2]"
                :options="$_.range(pSetting.uniequip[id][1] + 1, cost.length + 1)"
                @change="pSetting.uniequip[id][0] = true"
              />
            </div>
          </div>
        </template>
      </div>
    </template>
    <div class="mdui-dialog-actions" ref="actions">
      <a
        v-if="sp"
        class="mdui-btn mdui-ripple float-left"
        v-theme-class="$root.color.dialogTransparentBtn"
        @click="
          $root.openWikiHref({
            name: selectedPresetName,
            ...characterTable[selectedPresetName],
          })
        "
        >{{ $t('common.viewOnWiki') }}</a
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
import { debounce, size } from 'lodash';
import { useDataStore } from '@/store/data';
import { useSklandStore } from '@/store/skland';
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
    curSklandCultivate: {
      handler() {
        this.initSettingDefaultValue();
      },
      immediate: true,
    },
  },
  computed: {
    ...mapState(useDataStore, ['characterTable', 'uniequip']),
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
    presetUniequip() {
      return this.parent().presetUniequip;
    },
    curSklandCultivate() {
      return this.sklandCultivateCharacters[this.selectedPresetName] || {};
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
    handleNormalSkillLevelSelect1Change() {
      const { normal } = this.pSetting.skills;
      normal[0] = true;
      if (normal[1] >= normal[2]) normal[2] = normal[1] + 1;
    },
    handleEliteSkillLevelSelect1Change(i) {
      const { elite } = this.pSetting.skills;
      elite[i][0] = true;
      if (elite[i][1] >= elite[i][2]) elite[i][2] = elite[i][1] + 1;
    },
    handleUniequipLevelSelect1Change(id) {
      const { uniequip } = this.pSetting;
      uniequip[id][0] = true;
      if (uniequip[id][1] >= uniequip[id][2]) uniequip[id][2] = uniequip[id][1] + 1;
    },
    minus7(num) {
      return num - 7;
    },
    initSettingDefaultValue() {
      if (!this.sp || !this.pSetting || !size(this.curSklandCultivate)) return;

      const { mainSkillLevel, skills, equips } = this.curSklandCultivate;

      // 普通技能 (1~7)
      if (mainSkillLevel && mainSkillLevel < 7 && this.sp.skills.normal.length >= 2) {
        const config = this.pSetting.skills.normal;
        if (!config[0]) {
          config[1] = mainSkillLevel;
          config[2] = 7;
        }
      }

      // 精英技能 (0~3)
      if (skills && this.sp.skills.elite.length) {
        this.sp.skills.elite.forEach(({ name }, i) => {
          const config = this.pSetting.skills.elite[i];
          const curLevel = skills[name];
          if (!config[0] && curLevel < 3) {
            config[1] = curLevel + 7;
            config[2] = 10;
          }
        });
      }

      // 模组 (0~3)
      if (equips && this.presetUniequip?.length) {
        this.presetUniequip.forEach(({ id }) => {
          const config = this.pSetting.uniequip[id];
          const curLevel = equips[id];
          if (!config[0] && curLevel < 3) {
            config[1] = curLevel;
            config[2] = 3;
          }
        });
      }
    },
  },
});
</script>
