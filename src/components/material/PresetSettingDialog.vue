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
        <avatar
          class="mdui-card-header-avatar mdui-color-grey-400 no-pe"
          :name="selectedPresetName"
        />
        <div class="mdui-card-header-title">{{ $t(`character.${selectedPresetName}`) }}</div>
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
          <mdui-checkbox v-model="pSetting.skills.normal[0]" class="mdui-p-r-2">{{
            $t('common.skill')
          }}</mdui-checkbox>
          <div class="num-select inline-block">
            <mdui-select-num
              v-model="pSetting.skills.normal[1]"
              :options="$_.range(1, sp.skills.normal.length + 1)"
              @change="handleNormalSkillLevelSelect1Change"
            ></mdui-select-num>
            <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
            <span :key="`sn-s-${pSetting.skills.normal[1] + 1}`">
              <mdui-select-num
                v-model="pSetting.skills.normal[2]"
                :options="$_.range(pSetting.skills.normal[1] + 1, sp.skills.normal.length + 2)"
                @change="pSetting.skills.normal[0] = true"
              ></mdui-select-num>
            </span>
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
                ><div class="mdui-text-truncate">{{
                  $t(`skill.${skill.name}`)
                }}</div></mdui-checkbox
              >
              <DataImg
                class="skill-icon no-pe mdui-shadow-4"
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
                @change="() => handleEliteSkillLevelSelect1Change(i)"
              ></mdui-select-num>
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <span :key="`se-s-${pSetting.skills.elite[i][1] + 1}`">
                <mdui-select-num
                  v-model="pSetting.skills.elite[i][2]"
                  :options="
                    $_.range(
                      pSetting.skills.elite[i][1] + 1,
                      sp.skills.normal.length + skill.cost.length + 2,
                    )
                  "
                  @change="pSetting.skills.elite[i][0] = true"
                ></mdui-select-num>
              </span>
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
                    !$root.isUnreleasedUniequip(id) && !val && $nextTick($refs.dialog.handleUpdate)
                "
                >{{ $t(`uniequip.${id}`) }}</mdui-checkbox
              >
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
                $root.isUnreleasedGradedUniequip ||
                pSetting.uniequip[id][1] !== 0 ||
                pSetting.uniequip[id][2] !== 1
              "
              class="num-select inline-block mdui-p-l-3"
            >
              <mdui-select-num
                v-model="pSetting.uniequip[id][1]"
                :options="$_.range(cost.length)"
                @change="() => handleUniequipLevelSelect1Change(id)"
              ></mdui-select-num>
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <span :key="`se-s-${pSetting.uniequip[id][1] + 1}`">
                <mdui-select-num
                  v-model="pSetting.uniequip[id][2]"
                  :options="$_.range(pSetting.uniequip[id][1] + 1, cost.length + 1)"
                  @change="pSetting.uniequip[id][0] = true"
                ></mdui-select-num>
              </span>
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
import { mapState } from 'pinia';
import { debounce } from 'lodash';
import { useDataStore } from '@/store/data';
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
  computed: {
    ...mapState(useDataStore, ['characterTable', 'uniequip']),
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
  },
  created() {
    this.updateOverflowDebounce = markRaw(debounce(this.updateOverflow, 300));
  },
  beforeDestroy() {
    this.unbindEvents();
  },
  methods: {
    open() {
      this.overflow = 'hidden';
      this.$refs.dialog.open();
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
      this.$mutationNextTick();
      const { normal } = this.pSetting.skills;
      normal[0] = true;
      if (normal[1] >= normal[2]) normal[2] = normal[1] + 1;
    },
    handleEliteSkillLevelSelect1Change(i) {
      this.$mutationNextTick();
      const { elite } = this.pSetting.skills;
      elite[i][0] = true;
      if (elite[i][1] >= elite[i][2]) elite[i][2] = elite[i][1] + 1;
    },
    handleUniequipLevelSelect1Change(id) {
      this.$mutationNextTick();
      const { uniequip } = this.pSetting;
      uniequip[id][0] = true;
      if (uniequip[id][1] >= uniequip[id][2]) uniequip[id][2] = uniequip[id][1] + 1;
    },
  },
});
</script>
