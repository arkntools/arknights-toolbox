<template>
  <div id="arkn-material">
    <div class="mdui-row">
      <!-- 选项 -->
      <div :class="{ 'mdui-col-lg-6': $root.localeZH, 'mdui-col-xs-12': $root.localeNotZH }">
        <table class="mdui-table tag-table">
          <tbody>
            <!-- 稀有度 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('cultivate.panel.rarity') }}</button
                ></td
              >
              <td class="mobile-screen-flex-box tag-btn-wrap">
                <label v-if="$root.smallScreen" class="mdui-textfield-label flex-full">{{
                  $t('cultivate.panel.rarity')
                }}</label>
                <button
                  class="mdui-btn mdui-btn-dense mdui-ripple tag-btn"
                  v-theme-class="allRare ? color.selected : color.notSelected"
                  @click="selected.rare = $_.fill(Array(selected.rare.length), !allRare)"
                  >{{ $t('common.selectAll') }}</button
                >
                <tag-button
                  class="num-btn"
                  v-for="i in rareArr"
                  :key="`rare-${i}`"
                  v-model="selected.rare[i - 1]"
                  :notSelectedColor="color.notSelected"
                  :selectedColor="color[i]"
                  >{{ i }}</tag-button
                >
                <button
                  class="mdui-btn mdui-btn-dense mdui-color-red tag-btn"
                  v-theme-class="$root.color.redBtn"
                  @click="resetSelectedRare"
                  >{{ $t('common.reset') }}</button
                >
              </td>
            </tr>
            <!-- 预设 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.preset') }}</button
                ></td
              >
              <td>
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{ $t('common.preset') }}</label>
                <vue-tags-input
                  id="preset"
                  ref="presetInput"
                  v-model="preset"
                  :tags="selected.presets"
                  :allow-edit-tags="false"
                  :add-from-paste="false"
                  :add-on-blur="false"
                  :autocomplete-items="presetItems"
                  :add-only-from-autocomplete="true"
                  :autocomplete-always-open="true"
                  :placeholder="$t('cultivate.panel.preset.placeholder')"
                  autocomplete="off"
                  class="tags-input"
                  :class="{ empty: preset.length === 0 }"
                  @tags-changed="usePreset"
                  @before-adding-tag="obj => showPreset(obj)"
                >
                  <div
                    slot="autocomplete-item"
                    slot-scope="props"
                    @click="props.performAdd(props.item)"
                    class="mdui-list-item mdui-p-y-0 mdui-p-x-1"
                  >
                    <div class="mdui-list-item-avatar"
                      ><avatar class="no-pe" :key="`head-${props.item.text}`" :name="props.item.name"
                    /></div>
                    <div class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">{{ props.item.text }}</div>
                  </div>
                  <span class="no-sl" slot="tag-center" slot-scope="props" @click="showPreset(props, true)">{{
                    props.tag.text
                  }}</span>
                </vue-tags-input>
              </td>
            </tr>
            <!-- 待办 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.todo') }}</button
                ></td
              >
              <td>
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{ $t('common.todo') }}</label>
                <span
                  v-if="!selected.presets.length"
                  class="mdui-text-color-theme-secondary mdui-p-x-1 font-size-14 no-sl"
                  >{{ $t('common.none') }}</span
                >
                <div
                  v-for="(char, index) in selected.presets"
                  :key="char.name"
                  class="mdui-chip no-box-shadow mdui-m-r-1"
                  @click="showTodoPreset({ tag: char, index })"
                >
                  <avatar class="mdui-chip-icon" :name="char.name" />
                  <span class="mdui-chip-title">{{ char.text }}</span>
                </div>
              </td>
            </tr>
            <!-- 设置 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.setting') }}</button
                ></td
              >
              <td>
                <mdui-switch v-for="key in settingList[0]" :key="key" v-model="setting[key]">{{
                  $t(`cultivate.setting.${key}`)
                }}</mdui-switch>
              </td>
            </tr>
            <!-- 选项 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.option') }}</button
                ></td
              >
              <td class="mobile-screen-flex-box tag-btn-wrap">
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.redBtn"
                  @click="reset()"
                  >{{ $t('cultivate.panel.button.resetAll') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.redBtn"
                  @click="reset('need')"
                  >{{ $t('cultivate.panel.button.resetNeed') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.redBtn"
                  @click="reset('have')"
                  >{{ $t('cultivate.panel.button.resetOwned') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-a100 mdui-ripple-black']"
                  @click="dataSyncDialog.open()"
                  ><i class="mdui-icon material-icons">cloud</i> {{ $t('cultivate.panel.button.cloudSync') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="['mdui-color-pink', 'mdui-color-pink-a100 mdui-ripple-black']"
                  @click="resetPenguinData"
                  >{{ $t('cultivate.panel.button.forceUpdate') }}</button
                >
              </td>
            </tr>
            <!-- 计算 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.planner') }}</button
                ></td
              >
              <td class="mobile-screen-flex-box tag-btn-wrap">
                <button
                  id="ark-planner-btn"
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-left"
                  v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
                  :disabled="apbDisabled"
                  @click="
                    apbDisabled = true;
                    initPlanner().then(() => {
                      showPlan();
                      apbDisabled = false;
                    });
                  "
                  >{{ $t('cultivate.panel.button.farmCalculation') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-right no-grow"
                  v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
                  :disabled="apbDisabled"
                  @click="planSettingDialog.open()"
                  ><i class="mdui-icon material-icons">settings</i></button
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- /选项 -->
      <!-- 说明 -->
      <div :class="{ 'mdui-col-lg-6': $root.localeZH, 'mdui-col-xs-12': $root.localeNotZH }">
        <material-readme v-if="$root.localeZH" class="mdui-hidden-md-down" />
        <div
          class="mdui-panel mdui-panel-gapless mdui-m-t-2"
          :class="{ 'mdui-hidden-lg-up': $root.localeZH }"
          mdui-panel
        >
          <div class="mdui-panel-item">
            <div class="mdui-panel-item-header">
              <div class="mdui-panel-item-title">{{ $t('common.guide') }}</div>
              <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
            </div>
            <div class="mdui-panel-item-body mdui-p-l-0">
              <material-readme />
            </div>
          </div>
        </div>
      </div>
      <!-- /说明 -->
    </div>
    <!-- 素材 -->
    <div id="material-main" class="mdui-row" :class="{ rendering: $root.materialListRendering }">
      <!-- 简洁模式 -->
      <div id="material-simple" class="mdui-col-xs-12 mdui-m-t-4" v-if="setting.simpleMode">
        <transition-group
          class="material-group-wrap"
          tag="div"
          name="material-group-wrap-transition"
          @before-leave="transitionBeforeLeave"
          @after-leave="transitionAfterLeaveBeforeEnter"
        >
          <!-- 素材卡片 -->
          <div
            class="material-simple-grid mdui-m-b-2 mdui-m-r-2"
            v-for="materialName in materialOrder"
            :key="`${materialName}-simple`"
            v-show="showMaterialsFlatten.has(materialName) && $root.isImplementedMaterial(materialName)"
          >
            <div
              class="mdui-card material material-simple"
              :class="{ 'opacity-5': setting.translucentDisplay && hasInput && gaps[materialName][0] == 0 }"
            >
              <div class="card-triangle-small" v-theme-class="color[materialTable[materialName].rare]"></div>
              <div class="mdui-card-header" :name="materialName">
                <!-- 图片 -->
                <div
                  class="mdui-card-header-avatar mdui-valign pointer no-sl"
                  @click="showDropDetail(materialTable[materialName])"
                >
                  <img
                    class="material-image no-pe"
                    :src="$root.materialImage(materialTable[materialName].name)"
                    crossorigin="anonymous"
                    @error="handleImgErr"
                  />
                  <div
                    class="material-simple-name mdui-text-truncate"
                    v-theme-class="inputs[materialName].need > 0 ? $root.color.pinkText : []"
                    >{{ $t(`material.${materialName}`) }}</div
                  >
                </div>
                <!-- 输入面板 -->
                <div class="input-panel">
                  <mdui-number-input
                    class="block mdui-m-b-1"
                    v-model="inputs[materialName].need"
                    :placeholder="$t('common.need')"
                  ></mdui-number-input>
                  <mdui-number-input
                    class="block mdui-m-b-1"
                    v-model="inputs[materialName].have"
                    :placeholder="$t('common.owned')"
                  ></mdui-number-input>
                  <div class="gap block">
                    <span class="gap-num no-sl"
                      >{{ gaps[materialName][0]
                      }}<small v-if="gaps[materialName][1] > 0">({{ gaps[materialName][1] }})</small></span
                    >
                  </div>
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
          </div>
          <!-- 占位 -->
          <div class="material-simple-grid mdui-m-r-2" v-for="pIndex in 6" :key="pIndex"></div>
          <!-- /素材卡片 -->
        </transition-group>
      </div>
      <!-- /简洁模式 -->
      <!-- 正常模式 -->
      <transition-group
        v-else
        id="material-normal"
        tag="div"
        name="material-group-wrap-transition"
        @before-leave="transitionBeforeLeave"
        @after-leave="transitionAfterLeaveBeforeEnter"
        @before-enter="transitionAfterLeaveBeforeEnter"
      >
        <div class="mdui-col-xs-12" v-for="i in rareArr" :key="`materials-${i}`" v-show="showMaterials[i].size > 0">
          <div class="mdui-typo rare-title">
            <h2
              >{{ $t('common.rarity') }} {{ i
              }}<small v-if="moraleConsumption[i]" class="mdui-m-l-2"
                >{{ $t('common.morale') }} {{ moraleText(moraleConsumption[i]) }}</small
              ></h2
            >
          </div>
          <transition-group
            class="material-group-wrap"
            tag="div"
            name="material-group-wrap-transition"
            @before-leave="transitionBeforeLeave"
            @after-leave="transitionAfterLeaveBeforeEnter"
            @before-enter="transitionAfterLeaveBeforeEnter"
          >
            <!-- 素材卡片 -->
            <div
              v-for="material in materials[i]"
              :key="material.name"
              v-show="showMaterials[i].has(material.name) && $root.isImplementedMaterial(material.name)"
              class="mdui-card material"
              :class="{
                'mdui-p-b-2': $root.smallScreen,
                'mdui-m-b-2 mdui-m-r-2': !$root.smallScreen,
                'opacity-5': setting.translucentDisplay && hasInput && gaps[material.name][0] == 0,
              }"
            >
              <div class="card-triangle" v-theme-class="color[i]"></div>
              <div
                class="mdui-card-header"
                :name="material.name"
                :mdui-tooltip="
                  $root.smallScreen ? false : `{content:'${madeofTooltips[material.name]}',position:'top'}`
                "
              >
                <!-- 图片 -->
                <div
                  class="mdui-card-header-avatar mdui-valign pointer no-sl"
                  @click="showDropDetail(materialTable[material.name])"
                >
                  <img
                    class="material-image no-pe"
                    :src="$root.materialImage(material.name)"
                    crossorigin="anonymous"
                    @error="handleImgErr"
                  />
                </div>
                <!-- 材料名 -->
                <div
                  class="mdui-card-header-title no-sl"
                  v-theme-class="inputs[material.name].need > 0 ? $root.color.pinkText : []"
                >
                  <div class="material-name-wrap mdui-valign">
                    <div class="mdui-text-truncate material-name">{{ $t(`material.${material.name}`) }}</div>
                    <button
                      v-if="showSyntBtn(material)"
                      @click="synthesize(material.name, 1)"
                      class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
                      v-theme-class="$root.color.pinkText"
                      >{{ $t('common.synthesize') }} 1</button
                    >
                    <button
                      v-if="showSyntBtn(material)"
                      @click="synthesize(material.name)"
                      class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
                      v-theme-class="$root.color.pinkText"
                      >{{ $t('common.synthesize') }} all</button
                    >
                  </div>
                  <p
                    v-if="$root.smallScreen"
                    class="material-made-of mdui-m-y-0 mdui-text-color-theme-disabled mdui-text-truncate"
                    >{{ madeofTooltips[material.name] }}</p
                  >
                </div>
                <!-- 输入面板 -->
                <div class="input-panel" :class="{ 'mdui-m-t-1': !$root.smallScreen }">
                  <mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].need">{{
                    $t('common.need')
                  }}</mdui-number-input>
                  <mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].have">{{
                    $t('common.owned')
                  }}</mdui-number-input>
                  <div class="gap">
                    <label class="mdui-textfield-label no-sl">{{ $t('common.lack') }}</label>
                    <span class="gap-num no-sl"
                      >{{ gaps[material.name][0]
                      }}<small v-if="gaps[material.name][1] > 0">({{ gaps[material.name][1] }})</small></span
                    >
                  </div>
                  <!-- 掉落信息 -->
                  <ul
                    class="drop-list no-sl pointer"
                    :length="$_.size(displayDropListByServer[material.name])"
                    v-if="$_.size(displayDropListByServer[material.name]) > 0"
                    @click="showDropDetail(material)"
                    @wheel.prevent="onDropListScroll"
                  >
                    <li
                      class="drop-item"
                      v-for="({ occPer, expectAP }, code) in displayDropListByServer[material.name]"
                      :key="`${material.name}-${code}`"
                    >
                      <span class="code">{{ code === 'synt' ? $t('common.synthesize') : code }}</span>
                      <span
                        v-if="setting.showDropProbability && plannerInited"
                        class="probability"
                        v-theme-class="color[enumOccPer[occPer]]"
                        >{{
                          expectAP ? (1000 > expectAP ? expectAP.toPrecision(3) : expectAP.toFixed()) : 'N/A'
                        }}⚡</span
                      >
                      <span v-else class="probability" v-theme-class="color[enumOccPer[occPer]]">{{
                        $t(`cultivate.occPer.${enumOccPer[occPer]}`)
                      }}</span>
                    </li>
                  </ul>
                  <div
                    class="drop-list-more"
                    v-show="$root.smallScreen && $_.size(displayDropListByServer[material.name]) > 2"
                    >></div
                  >
                  <!-- /掉落信息 -->
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
            <!-- 占位 -->
            <div class="material" :class="{ 'mdui-m-r-2': !$root.smallScreen }" v-for="pIndex in 2" :key="pIndex"></div>
            <!-- /素材卡片 -->
          </transition-group>
        </div>
      </transition-group>
      <!-- /正常模式 -->
    </div>
    <!-- /素材 -->
    <!-- 预设设置 -->
    <div id="preset-setting" class="mdui-dialog mdui-card">
      <template v-if="sp">
        <div class="mdui-card-header mdui-p-b-0">
          <avatar
            class="mdui-card-header-avatar mdui-color-grey-400 no-pe"
            :name="selectedPresetName ? selectedPresetName : false"
          />
          <div class="mdui-card-header-title">{{ $t(`character.${selectedPresetName}`) }}</div>
        </div>
        <div class="mdui-card-content preset-list mdui-p-x-3">
          <!-- 精英化选框 -->
          <div class="elite-cb-list">
            <mdui-checkbox v-for="(o, i) in sp.evolve" :key="`elite-${i + 1}`" v-model="pSetting.evolve[i]"
              >{{ $t('common.promotion') }}{{ i + 1 }}</mdui-checkbox
            >
          </div>
          <!-- 普通技能选框 -->
          <div class="skill-normal" v-if="sp.skills.normal.length >= 2">
            <mdui-checkbox v-model="pSetting.skills.normal[0]" class="skill-cb">{{ $t('common.skill') }}</mdui-checkbox>
            <div class="inline-block">
              <mdui-select-num
                v-model="pSetting.skills.normal[1]"
                :options="$_.range(1, sp.skills.normal.length + 1)"
                @change="
                  $mutationNextTick();
                  pSetting.skills.normal[0] = true;
                  if (pSetting.skills.normal[1] >= pSetting.skills.normal[2])
                    pSetting.skills.normal[2] = pSetting.skills.normal[1] + 1;
                "
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
          <template v-if="sp.skills.elite.length > 0">
            <div
              class="skill-elite"
              v-for="(skill, i) in sp.skills.elite"
              :key="`se-${skill.name}`"
              v-show="isSkillReleased(skill)"
            >
              <mdui-checkbox v-model="pSetting.skills.elite[i][0]" class="skill-cb">{{
                $t(`skill.${skill.name}`)
              }}</mdui-checkbox>
              <div class="inline-block">
                <mdui-select-num
                  v-model="pSetting.skills.elite[i][1]"
                  :options="$_.range(sp.skills.normal.length + 1, sp.skills.normal.length + skill.cost.length + 1)"
                  @change="
                    $mutationNextTick();
                    pSetting.skills.elite[i][0] = true;
                    if (pSetting.skills.elite[i][1] >= pSetting.skills.elite[i][2])
                      pSetting.skills.elite[i][2] = pSetting.skills.elite[i][1] + 1;
                  "
                ></mdui-select-num>
                <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
                <span :key="`se-s-${pSetting.skills.elite[i][1] + 1}`">
                  <mdui-select-num
                    v-model="pSetting.skills.elite[i][2]"
                    :options="
                      $_.range(pSetting.skills.elite[i][1] + 1, sp.skills.normal.length + skill.cost.length + 2)
                    "
                    @change="pSetting.skills.elite[i][0] = true"
                  ></mdui-select-num>
                </span>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <a
          v-if="sp"
          class="mdui-btn mdui-ripple"
          v-theme-class="$root.color.dialogTransparentBtn"
          :href="$root.getWikiHref({ name: selectedPresetName, ...characterTable[selectedPresetName] })"
          target="_blank"
          style="float: left"
          >{{ $t('common.viewOnWiki') }}</a
        >
        <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.dialogTransparentBtn" mdui-dialog-cancel>{{
          $t('common.cancel')
        }}</button>
        <button
          v-if="this.pSetting.state == 'add'"
          class="mdui-btn mdui-ripple"
          v-theme-class="['mdui-color-pink', 'mdui-color-indigo-a100 mdui-ripple-black']"
          mdui-dialog-confirm
          @click="addPreset"
          >{{ $t('common.add') }}</button
        >
        <button
          v-if="this.pSetting.state == 'edit'"
          class="mdui-btn mdui-ripple"
          v-theme-class="['mdui-color-teal', 'mdui-color-teal-200 mdui-ripple-black']"
          mdui-dialog-confirm
          @click="editPreset"
          >{{ $t('common.edit') }}</button
        >
      </div>
    </div>
    <!-- /预设设置 -->
    <!-- Planner -->
    <div id="planner" class="mdui-dialog mdui-typo">
      <template v-if="plannerRequest && plan">
        <div class="mdui-dialog-title">
          {{ $t('cultivate.planner.title') }}
          <p class="mdui-m-b-0 mdui-m-t-2" style="font-size: 15px">
            {{ $t('cultivate.planner.expectedAP') }}<code>{{ plan.cost }}</code
            ><br />
            <span v-theme-class="['mdui-text-color-blue-900', 'mdui-text-color-blue-200']">{{
              $t('common.stage')
            }}</span>
            × <span v-theme-class="$root.color.pinkText">{{ $t('common.times') }}</span
            >&nbsp;&nbsp;(<span v-theme-class="['mdui-text-color-yellow-900', 'mdui-text-color-yellow-300']">{{
              $t('item.AP_GAMEPLAY')
            }}</span
            >)&nbsp;&nbsp;<span class="mdui-text-color-theme mdui-btn-bold">{{
              $t('cultivate.planner.targetMaterial')
            }}</span
            >&nbsp;&nbsp;<span class="mdui-text-color-theme-secondary">{{
              $t('cultivate.planner.otherMaterial')
            }}</span>
          </p>
        </div>
        <div class="mdui-dialog-content">
          <div class="stage" v-for="stage in plan.stages" :key="stage.code">
            <h5 class="h-ul">
              <span v-theme-class="['mdui-text-color-blue-900', 'mdui-text-color-blue-200']">{{ stage.code }}</span> ×
              <span v-theme-class="$root.color.pinkText">{{ stage.times }}</span
              >&nbsp;&nbsp;(<span v-theme-class="['mdui-text-color-yellow-900', 'mdui-text-color-yellow-200']">{{
                stage.cost
              }}</span
              >)
            </h5>
            <div class="num-item-list">
              <arkn-num-item
                v-for="drop in stage.drops"
                :key="`${stage.code}-${drop.name}`"
                v-show="$root.isImplementedMaterial(drop.name)"
                :t="materialTable[drop.name].rare"
                :img="drop.name"
                :lable="$t(`material.${drop.name}`)"
                :num="drop.num"
                :color="
                  gaps[drop.name][0] > 0 ? 'mdui-text-color-theme mdui-btn-bold' : 'mdui-text-color-theme-secondary'
                "
              />
              <arkn-num-item
                t="4"
                img="4001"
                :lable="$t('item.4001')"
                :num="num10k(stage.money)"
                color="mdui-text-color-theme-secondary"
              />
              <arkn-num-item
                v-if="stage.cardExp > 0"
                t="2"
                img="2001"
                :lable="$t('common.exp')"
                :num="num10k(stage.cardExp)"
                color="mdui-text-color-theme-secondary"
              />
            </div>
          </div>
          <div class="stage" v-if="plan.synthesis.length > 0">
            <h5 class="h-ul">{{ $t('cultivate.planner.needToBeSynthesized') }}</h5>
            <div class="num-item-list">
              <arkn-num-item
                v-for="m in plan.synthesis"
                :key="`合成-${m.name}`"
                :t="materialTable[m.name].rare"
                :img="m.name"
                :lable="$t(`material.${m.name}`)"
                :num="m.num"
              />
              <arkn-num-item
                t="4"
                img="4001"
                :lable="$t('cultivate.planner.moneyUsed')"
                :num="num10k(plan.synthesisCost)"
              />
            </div>
          </div>
          <div class="stage">
            <h5 class="h-ul">{{ $t('cultivate.planner.obtain') }}</h5>
            <div class="num-item-list">
              <arkn-num-item t="4" img="4001" :lable="$t('item.4001')" :num="num10k(plan.money)" />
              <arkn-num-item
                v-if="plan.cardExp > 0"
                t="2"
                img="2001"
                :lable="$t('common.exp')"
                :num="num10k(plan.cardExp)"
              />
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.dialogTransparentBtn" mdui-dialog-cancel>{{
          $t('common.close')
        }}</button>
      </div>
    </div>
    <!-- /Planner -->
    <!-- 关卡掉落详情 -->
    <div id="drop-detail" class="mdui-dialog mdui-typo">
      <template v-if="dropDetails">
        <div class="mdui-dialog-title mdui-p-b-1">
          {{ $t(`material.${dropFocus}`) }}
          <small class="mdui-p-l-1 mdui-text-color-theme-secondary"
            >{{ inputs[dropFocus].need || 0 }} | {{ inputs[dropFocus].have || 0 }} |
            <span v-theme-class="$root.color.pinkText"
              >{{ gaps[dropFocus][0] || 0
              }}<small v-if="gaps[dropFocus][1] > 0"> ({{ gaps[dropFocus][1] }})</small></span
            ></small
          >
          <span class="mdui-p-l-1">
            <button
              v-if="showSyntBtn(materialTable[dropFocus])"
              @click="synthesize(dropFocus, 1)"
              class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
              v-theme-class="$root.color.pinkText"
              >{{ $t('common.synthesize') }} 1</button
            >
            <button
              v-if="showSyntBtn(materialTable[dropFocus])"
              @click="synthesize(dropFocus)"
              class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
              v-theme-class="$root.color.pinkText"
              >{{ $t('common.synthesize') }} all</button
            >
          </span>
          <div class="mdui-text-color-theme-secondary text-10px">{{ madeofTooltips[dropFocus] }}</div>
          <div
            v-if="materialsCharMap[dropFocus] && materialsCharMap[dropFocus].length > 0"
            class="mdui-text-color-theme-secondary text-10px"
            >{{ $t('cultivate.dropDetail.relatedOperators') }}：<span
              v-for="char in materialsCharMap[dropFocus]"
              :key="`mater_${char}`"
              class="mdui-m-r-1"
              >{{ $t(`character.${char}`) }}</span
            ></div
          >
          <p v-if="dropDetails.length > 0" class="mdui-m-b-0 mdui-m-t-1 text-16px"
            >{{ $t('common.stage') }} | {{ $t('cultivate.dropDetail.expectedAP') }}⚡ | ${{
              $t('cultivate.dropDetail.costPerformanceOfStage')
            }}</p
          >
        </div>
        <div class="mdui-dialog-content mdui-p-b-0">
          <div class="stage" v-for="dropDetail in dropDetails" :key="`dd-${dropDetail.code}`">
            <h5 class="h-ul">
              {{ dropDetail.code }}&nbsp;&nbsp;<code
                >{{ $_.round(dropInfo.expectAP[dropFocus][dropDetail.code], 1).toPrecision(3) }}⚡</code
              >&nbsp;&nbsp;<code>${{ dropInfo.stageValue[dropDetail.code].toPrecision(4) }}</code>
            </h5>
            <div class="num-item-list">
              <arkn-num-item
                v-for="drop in dropDetail.drops"
                :key="`detail-${dropDetail.code}-${drop[0]}`"
                v-show="$root.isImplementedMaterial(drop[0])"
                :t="materialTable[drop[0]].rare"
                :img="drop[0]"
                :lable="$t(`material.${drop[0]}`)"
                :num="$_.round(drop[1] * 100, 2) + '%'"
                :color="
                  dropFocus == drop[0] ? 'mdui-text-color-theme mdui-btn-bold' : 'mdui-text-color-theme-secondary'
                "
              />
              <arkn-num-item
                v-for="drop in dropDetail.dropBrs"
                :key="`detail-${dropDetail.code}-${drop[0]}`"
                :t="drop[0] - 1999"
                :img="drop[0]"
                :lable="$t(`item.${drop[0]}`)"
                :num="$_.round(drop[1] * 100, 2) + '%'"
                color="mdui-text-color-theme-secondary"
              />
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.dialogTransparentBtn" mdui-dialog-cancel>{{
          $t('common.close')
        }}</button>
      </div>
    </div>
    <!-- /关卡掉落详情 -->
    <!-- 云端数据同步 -->
    <div id="data-sync" class="mdui-dialog mdui-typo">
      <div class="mdui-dialog-title">{{ $t('cultivate.panel.sync.cloudSync') }}</div>
      <div class="mdui-dialog-content mdui-p-b-0">
        <h5 class="mdui-m-t-0">{{ $t('cultivate.panel.sync.cloudBackup') }}</h5>
        <div class="mdui-valign-bottom space-8" :class="{ processing: dataSyncing }">
          <button
            class="mdui-btn mdui-ripple tag-btn"
            v-theme-class="['mdui-color-green-600', 'mdui-color-green-300 mdui-ripple-black']"
            @click="cloudSaveData()"
            ><i class="mdui-icon material-icons">cloud_upload</i> {{ $t('common.backup') }}</button
          >
          <button
            class="mdui-btn mdui-ripple tag-btn"
            v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-300 mdui-ripple-black']"
            @click="cloudRestoreData"
            :disabled="!setting.syncCodeV2"
            ><i class="mdui-icon material-icons">cloud_download</i> {{ $t('common.restore') }}</button
          >
          <mdui-switch v-model="setting.autoSyncUpload" :disabled="!setting.syncCodeV2">{{
            $t('cultivate.panel.sync.autoSyncUpload')
          }}</mdui-switch>
        </div>
        <table class="thin-table mdui-m-b-1" style="width: 100%">
          <tbody>
            <tr>
              <td>
                <div id="sync-code" class="mdui-textfield">
                  <input
                    class="mdui-textfield-input"
                    type="text"
                    v-model.trim="setting.syncCodeV2"
                    :placeholder="$t('cultivate.panel.sync.syncCode')"
                  />
                </div>
              </td>
              <td width="1">
                <button
                  class="mdui-btn mdui-ripple"
                  v-theme-class="['mdui-text-color-pink-accent', 'mdui-text-color-indigo-a100']"
                  style="min-width: unset"
                  :disabled="!setting.syncCodeV2"
                  @click="copySyncCode"
                  >{{ $t('common.copy') }}</button
                >
              </td>
            </tr>
          </tbody>
        </table>
        <p>{{ $t('cultivate.panel.sync.cloudSyncReadme') }}</p>
        <p>{{ $t('cultivate.panel.sync.autoSyncUploadTip') }}</p>
        <p>Powered by <a href="https://jsonstorage.net/" target="_blank">JsonStorage</a>.</p>
        <div class="mdui-divider mdui-m-y-2"></div>
        <h5 class="mdui-m-t-0">{{ $t('cultivate.panel.sync.localBackup') }}</h5>
        <div class="mdui-m-b-2">
          <button
            class="mdui-btn tag-btn"
            v-theme-class="['mdui-color-green-600', 'mdui-color-green-300']"
            @click="saveData"
            ><i class="mdui-icon material-icons">file_upload</i> {{ $t('common.backup') }}</button
          >
          <button
            class="mdui-btn tag-btn"
            v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-300']"
            @click="restoreData"
            ><i class="mdui-icon material-icons">file_download</i> {{ $t('common.restore') }}</button
          >
        </div>
        <p>{{ $t('cultivate.panel.sync.localBackupReadme') }}</p>
      </div>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.dialogTransparentBtn" mdui-dialog-cancel>{{
          $t('common.close')
        }}</button>
      </div>
    </div>
    <!-- /云端数据同步 -->
    <!-- 预设待办 -->
    <div id="preset-todo" class="mdui-dialog">
      <template v-if="sp">
        <div class="mdui-dialog-title">
          <avatar
            class="mdui-card-header-avatar mdui-color-grey-400 no-pe"
            :name="selectedPresetName ? selectedPresetName : false"
          />
          <div class="mdui-card-header-title">{{ $t(`character.${selectedPresetName}`) }}</div>
          <div class="mdui-text-color-theme-secondary mdui-m-t-1 no-sl"
            ><small>{{ $t(`cultivate.todos.tips`) }}</small></div
          >
        </div>
        <div class="mdui-dialog-content mdui-p-x-0 mdui-p-y-0 mdui-typo">
          <transition-group
            class="mdui-list mdui-p-y-0 no-sl"
            tag="div"
            name="todo-list-transition"
            @before-leave="transitionBeforeLeave"
            @after-leave="transitionAfterLeaveBeforeEnter"
          >
            <template v-for="group in displayTodoGroup">
              <template v-for="(todo, ti) in group.list">
                <label
                  :key="`elite-todo-${todo.name}`"
                  class="mdui-list-item mdui-p-l-4"
                  :class="{ 'mdui-ripple': ti == 0 }"
                  :disabled="group.disabled || ti > 0"
                >
                  <div class="mdui-checkbox" :class="{ 'opacity-0 cursor-default': group.disabled || ti > 0 }">
                    <input
                      v-if="ti == 0"
                      type="checkbox"
                      :disabled="group.disabled || !todoCanFinished(todo.cost)"
                      @change="finishTodo(todo, group.gi)"
                    />
                    <i class="mdui-checkbox-icon"></i>
                  </div>
                  <div class="mdui-list-item-content mdui-m-l-1">
                    <span
                      class="mdui-m-r-1"
                      :class="{ 'mdui-text-color-blue': ti == 0, 'mdui-text-color-theme-secondary': ti > 0 }"
                      >{{ todo.name }}</span
                    >
                    <div class="preset-todo-materials">
                      <small
                        class="mdui-text-color-grey-600"
                        v-for="(item, i) in todoNeeds(todo.cost)"
                        :key="`elite-need-${i + 1}`"
                      >
                        {{ item.text }}
                        {{ item.have
                        }}<span
                          v-if="item.synt"
                          :class="{ 'mdui-text-color-theme-accent': todoEnough(todo.cost) && todoNeedSynt(todo.cost) }"
                          >({{ item.synt }})</span
                        >/<span
                          :class="{ 'mdui-text-color-theme-accent mdui-btn-bold': item.have + item.synt < item.need }"
                          >{{ item.need }}</span
                        >
                      </small>
                      <small v-if="!todoEnough(todo.cost)" class="mdui-text-color-theme-accent mdui-btn-bold">{{
                        $t(`cultivate.todos.cannotFinished`)
                      }}</small>
                      <small v-else-if="todoNeedSynt(todo.cost)" class="mdui-text-color-theme-accent">{{
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
        <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.dialogTransparentBtn" mdui-dialog-cancel>{{
          $t('common.close')
        }}</button>
      </div>
    </div>
    <!-- /预设待办 -->
    <!-- 刷图设置 -->
    <div id="planner-setting" class="mdui-dialog mdui-typo">
      <div class="mdui-dialog-title">{{ $t('cultivate.panel.plannerSetting.title') }}</div>
      <div class="mdui-dialog-content mdui-p-b-0">
        <div>
          <mdui-switch v-for="key in settingList[1]" :key="key" v-model="setting[key]">{{
            $t(`cultivate.setting.${key}`)
          }}</mdui-switch>
          <mdui-switch v-if="isPenguinDataSupportedServer" v-model="setting.planIncludeEvent">{{
            $t('cultivate.setting.planIncludeEvent')
          }}</mdui-switch>
        </div>
        <h5>{{ $t('cultivate.panel.plannerSetting.stageBlacklist') }}</h5>
        <p class="mdui-m-b-1">{{ $t('cultivate.panel.plannerSetting.stageBlacklistExplain') }}</p>
        <vue-tags-input
          id="planner-stage-blacklist"
          v-model="planStageBlacklist.input"
          :tags="planStageBlacklistTags"
          :validation="planStageBlacklist.validation"
          :allow-edit-tags="false"
          :add-from-paste="false"
          :placeholder="$t('cultivate.panel.plannerSetting.stageBlacklistInputPlaceholder')"
          autocomplete="off"
          @tags-changed="tags => (setting.planStageBlacklist = $_.uniq(tags.map(({ text }) => text.toUpperCase())))"
        />
      </div>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" v-theme-class="$root.color.dialogTransparentBtn" mdui-dialog-cancel>{{
          $t('common.close')
        }}</button>
      </div>
    </div>
    <!-- /刷图设置 -->
  </div>
</template>

<script>
import ArknNumItem from '@/components/ArknNumItem';
import MaterialReadme from '@/components/MaterialReadme';
import { createTags } from '@johmun/vue-tags-input';
import Ajax from '@/utils/ajax';
import safelyParseJSON from '@/utils/safelyParseJSON';
import * as clipboard from '@/utils/clipboard';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import linprog from 'javascript-lp-solver/src/solver';
import md5 from 'md5';

import elite from '@/data/cultivate.json';
import unopenedStage from '@/data/unopenedStage.json';
import eventData from '@/data/event.json';

import materialData from '@/store/material.js';
import { characterTable } from '@/store/character.js';
import { stageTable } from '@/store/stage.js';

import { MATERIAL_TAG_BTN_COLOR } from '@/utils/constant';

const enumOccPer = {
  '-1': 'SYNT',
  0: 'ALWAYS',
  1: 'ALMOST',
  2: 'USUAL',
  3: 'OFTEN',
  4: 'SOMETIMES',
};
Object.freeze(enumOccPer);

const battleRecordIds = ['2001', '2002', '2003', '2004'];
const dropTableOtherFields = ['cost', 'event', 'cardExp', ...battleRecordIds];

const pSettingInit = {
  evolve: [false, false],
  skills: {
    normal: [false, 1, 7],
    elite: new Array(_.max(_.map(elite, obj => obj.skills.elite.length))).fill([false, 7, 10]).map(a => _.cloneDeep(a)),
  },
  state: 'add',
};
Object.freeze(pSettingInit);

const min0 = x => (x < 0 ? 0 : x);

export default {
  name: 'arkn-material',
  components: {
    // VueTagsInput,
    MaterialReadme,
    ArknNumItem,
  },
  data: () => ({
    showAll: false,
    enumOccPer,
    ...materialData,
    characterTable,
    elite,
    inputs: {},
    preset: '',
    selectedPresetName: '',
    selectedPreset: false,
    pSetting: _.cloneDeep(pSettingInit),
    presetDialog: false,
    selected: {
      rare: [],
      presets: [],
    },
    setting: {
      simpleMode: false,
      hideIrrelevant: false,
      translucentDisplay: true,
      showDropProbability: false,
      prioritizeNeedsWhenSynt: false,
      planIncludeEvent: true,
      planCardExpFirst: false,
      syncCodeV2: '',
      autoSyncUpload: false,
      planStageBlacklist: [],
    },
    settingList: [
      ['simpleMode', 'hideIrrelevant', 'translucentDisplay', 'showDropProbability', 'prioritizeNeedsWhenSynt'],
      ['planCardExpFirst'],
    ],
    color: MATERIAL_TAG_BTN_COLOR,
    penguinData: {
      time: 0,
      data: null,
    },
    plannerInited: false,
    plannerRequest: false,
    plannerDialog: false,
    apbDisabled: false,
    dropDialog: false,
    dropDetails: false,
    dropFocus: '',
    dropTable: {},
    dropInfo: {
      expectAP: {},
      stageValue: {},
    },
    synthesisTable: [],
    materialConstraints: {},
    dataSyncDialog: false,
    dataSyncing: false,
    throttleAutoSyncUpload: null,
    ignoreInputsChange: false,
    todoGroupList: false,
    planSettingDialog: false,
    planStageBlacklist: {
      input: '',
      validation: [
        {
          rule: /^([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9])?$/,
          disableAdd: true,
        },
      ],
    },
  }),
  watch: {
    setting: {
      handler: val => localStorage.setItem('material.setting', JSON.stringify(val)),
      deep: true,
    },
    selected: {
      handler: val => localStorage.setItem('material.selected', JSON.stringify(val)),
      deep: true,
    },
    inputs: {
      handler(val) {
        for (const input of Object.values(val)) {
          for (const key of Object.keys(input)) {
            if (!['need', 'have'].includes(key)) {
              delete input[key];
              continue;
            }
            const str = input[key];
            const exec = /[^0-9]/.exec(str);
            if (exec) input[key] = (parseInt(/[0-9]*/.exec(str)[0]) || 0).toString();
          }
        }
        localStorage.setItem('material.inputs', JSON.stringify(val));
        if (this.setting.autoSyncUpload && this.setting.syncCodeV2 && this.throttleAutoSyncUpload) {
          if (this.ignoreInputsChange) this.ignoreInputsChange = false;
          else this.throttleAutoSyncUpload();
        }
      },
      deep: true,
    },
    'setting.showDropProbability'(val) {
      if (val) this.initPlanner();
    },
    '$root.locale'() {
      this.updatePreset();
      if (this.plannerInited) {
        this.plannerInited = false;
        this.initPlanner();
      }
    },
  },
  computed: {
    arkplannerReportValue() {
      const cardExpFirst = this.planCardExpFirst ? 1 : 0;
      const includeEvent = this.planIncludeEvent ? 1 << 1 : 0;
      return cardExpFirst | includeEvent;
    },
    // TODO: 企鹅物流暂时不支持台服
    isPenguinDataSupportedServer() {
      return !this.$root.localeTW;
    },
    eventInfo() {
      return eventData[this.$root.locale];
    },
    isPenguinDataExpired() {
      const now = Date.now();
      const time = this.penguinData.time || 0;
      const isEvent =
        this.isPenguinDataSupportedServer &&
        _.some(this.eventInfo, ({ valid: { startTs, endTs } }) => startTs * 1000 <= now && now < endTs * 1000);
      if (isEvent && _.some(this.eventInfo, ({ valid: { startTs } }) => time < startTs * 1000)) return true;
      const expire = (isEvent ? 3 : 7) * 24 * 60 * 60 * 1000;
      return time + expire < now;
    },
    penguinDataServer() {
      return this.isPenguinDataSupportedServer ? this.$root.locale.toUpperCase() : 'CN';
    },
    selectedSynthesisTable() {
      return this.synthesisTable.filter((v, i) => this.selected.rare[i]);
    },
    unopenedStages() {
      return unopenedStage[this.$root.locale];
    },
    // canShowDropDetail() {
    //   return _.mapValues(this.displayDropListByServer, list => !(_.size(list) === 1 && 'synt' in list));
    // },
    dropTableByServer() {
      return _.omit(this.dropTable, this.unopenedStages);
    },
    dropTableUsedByPlanner() {
      return _.omit(
        this.isPenguinDataSupportedServer && this.setting.planIncludeEvent
          ? this.dropTableByServer
          : _.omitBy(this.dropTableByServer, o => o.event),
        this.setting.planStageBlacklist
      );
    },
    dropListByServer() {
      let table = _.mapValues(this.materialTable, ({ drop }) => _.omit(drop, this.unopenedStages));
      if (this.isPenguinDataSupportedServer) {
        const now = Date.now();
        const validEvent = _.pickBy(
          this.eventInfo,
          ({ valid: { startTs, endTs } }) => startTs * 1000 <= now && now < endTs * 1000
        );
        table = _.merge({}, ..._.map(validEvent, ({ drop }) => drop), table);
      }
      return table;
    },
    syntExceptAPList() {
      return _.mapValues(this.dropListByServer, (v, name) => this.getSyntExceptAP(name));
    },
    syntExceptAPListWithoutEvent() {
      return _.mapValues(this.dropListByServer, (v, name) => this.getSyntExceptAP(name, true));
    },
    displayDropListByServer() {
      const showProbability = this.setting.showDropProbability && this.plannerInited;
      const table = _.cloneDeep(this.dropListByServer);
      Object.keys(table).forEach(name => {
        table[name] = _.mapValues(table[name], (occPer, code) => {
          const info = { occPer };
          // 期望理智
          if (showProbability) info.expectAP = this.dropInfo.expectAP[name][code];
          return info;
        });
        // 排序
        if (showProbability) {
          const row = table[name];
          const syntInfo = this.syntExceptAPList[name];
          if (syntInfo) {
            const { stages, ap } = syntInfo;
            const isSynt = (() => {
              if (stages.length > 1) return true;
              if (stages.length === 1) {
                const [code] = stages;
                if (!(code in row)) return true;
              }
              return false;
            })();
            if (isSynt) row.synt = { occPer: -1, expectAP: ap };
          }
          const sortedCodes = _.sortBy(Object.keys(row), code => row[code].expectAP);
          table[name] = _.transform(
            sortedCodes,
            (obj, code) => {
              obj[code] = row[code];
            },
            {}
          );
        }
      });
      return table;
    },
    implementedElite() {
      return _.pickBy(this.elite, (o, name) => this.$root.isImplementedChar(name));
    },
    compressedInputs: {
      get() {
        return _.transform(
          this.inputsInt,
          (obj, { need, have }, key) => {
            if (need + have > 0) obj[key] = [need, have];
          },
          {}
        );
      },
      set(obj) {
        this.reset(null, false, false);
        _.each(obj, (val, key) => {
          if (Array.isArray(val)) {
            const [need, have] = val;
            this.inputs[key].need = need > 0 ? _.toString(need) : '';
            this.inputs[key].have = have > 0 ? _.toString(have) : '';
          } else {
            const { need, have } = val;
            this.inputs[key].need = need;
            this.inputs[key].have = have;
          }
        });
      },
    },
    madeofTooltips() {
      const localeUS = this.$root.localeIs('us');
      const header = this.$t('cultivate.dropDetail.synthesizeCosts') + (localeUS ? ': ' : '：');
      const spliter = localeUS ? ', ' : '、';
      return _.transform(
        this.materialList,
        (o, { name, madeof }) => {
          const text = [];
          _.forIn(madeof, (num, m) => text.push(`${this.$t(`material.${m}`)}*${num}`));
          o[name] = text.length > 0 ? `${header}${text.join(spliter)}` : this.$t('common.cannotSynthesize');
        },
        {}
      );
    },
    synthesizable() {
      return _.transform(
        this.materialList,
        (o, { name, madeof }) => {
          if (_.size(madeof) == 0) {
            o[name] = false;
            return;
          }
          o[name] = _.every(madeof, (num, m) => this.inputsInt[m].have >= num);
        },
        {}
      );
    },
    allRare() {
      return _.sum(this.selected.rare) == this.rareNum;
    },
    rareNum() {
      return _.size(this.materials);
    },
    rareArr() {
      return _.range(this.rareNum, 0);
    },
    inputsInt() {
      const inputsInt = {};
      for (const key in this.inputs) {
        inputsInt[key] = _.mapValues(this.inputs[key], num => parseInt(num) || 0);
      }
      return inputsInt;
    },
    gaps() {
      const inputs = this.inputsInt;
      const gaps = _.mapValues(inputs, input => input.need);
      const made = _.mapValues(inputs, () => 0);
      const used = _.mapValues(inputs, () => 0);

      // 自顶向下得到需求
      _.forInRight(this.materials, materials => {
        for (const { name, madeof } of materials) {
          gaps[name] = min0(gaps[name] - inputs[name].have);
          _.forIn(madeof, (num, m) => {
            gaps[m] += gaps[name] * num;
          });
        }
      });

      // 自底向上计算合成
      _.forIn(this.materials, (materials, rare) => {
        if (!this.selected.rare[rare - 2]) return;
        for (const { name, madeof } of materials) {
          if (_.size(madeof) === 0) continue;
          while (
            gaps[name] > 0 &&
            _.every(madeof, (num, mName) => {
              const available = this.inputsInt[mName].have + made[mName] - used[mName] - num;
              const deduction = this.setting.prioritizeNeedsWhenSynt ? this.inputsInt[mName].need : 0;
              return available - deduction >= 0;
            })
          ) {
            gaps[name]--;
            made[name]++;
            _.forEach(madeof, (num, mName) => (used[mName] += num));
          }
        }
      });

      return _.mergeWith(gaps, made, (a, b) => [a, b]);
    },
    showMaterials() {
      if (!this.setting.hideIrrelevant || !this.hasInput) {
        return _.mapValues(this.materials, (list, rare) =>
          this.selected.rare[rare - 1] ? new Set(list.map(({ name }) => name)) : new Set()
        );
      }
      const result = {};
      const rares = Object.keys(this.materials).sort().reverse();
      rares.forEach(rare => {
        if (!this.selected.rare[rare - 1]) {
          result[rare] = new Set();
          return;
        }
        const list = this.materials[rare].map(({ name }) => name);
        const set = new Set(list.filter(id => this.inputsInt[id].need > 0 || _.sum(this.gaps[id]) > 0));
        (result[parseInt(rare) + 1] || new Set()).forEach(id => {
          if (_.sum(this.gaps[id])) {
            Object.keys(this.materialTable[id].madeof).forEach(moid => set.add(moid));
          }
        });
        result[rare] = set;
      });
      return result;
    },
    showMaterialsFlatten() {
      if (!this.setting.hideIrrelevant || !this.hasInput) {
        return new Set(this.materialOrder.filter(id => this.selected.rare[this.materialTable[id].rare - 1]));
      }
      return new Set(_.map(this.showMaterials, set => Array.from(set)).flat());
    },
    hasInput() {
      return !!_.sumBy(Object.entries(this.inputsInt), ([id, { need }]) => need + _.sum(this.gaps[id]));
    },
    presetItems() {
      const input = this.$root.pureName(this.preset);
      const result = _.transform(
        Object.keys(this.implementedElite),
        (arr, name) => {
          const search = this.$root
            .getSearchGroup(this.characterTable[name])
            .map(v => v.indexOf(input) + 1 || Infinity);
          if (search.some(s => s !== Infinity)) arr.push({ search, name, nl: this.$t(`character.${name}`).length });
        },
        []
      );
      result.sort(({ search: a, nl: anl }, { search: b, nl: bnl }) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
          const compare = a[i] - b[i];
          if (!_.isNaN(compare)) return compare || anl - bnl;
        }
        return 0;
      });
      return _.map(result, o => ({ name: o.name, text: this.$t(`character.${o.name}`) })).slice(0, 10);
    },
    sp() {
      if (!this.selectedPresetName) return false;
      return this.elite[this.selectedPresetName];
    },
    checkPSetting() {
      const ps = this.pSetting;
      const check = [...ps.evolve, ps.skills.normal[0], ..._.map(ps.skills.elite, a => a[0])];
      return _.sum(check) > 0;
    },
    plan() {
      if (!this.plannerInited) return false;

      this.$gtag.event('material_arkplanner_calc', {
        event_category: 'material',
        event_label: 'arkplanner',
        value: this.arkplannerReportValue,
      });

      // 线性规划模型
      const useVariables = [this.dropTableUsedByPlanner, ...this.selectedSynthesisTable];
      const model = {
        optimize: 'cost',
        opType: 'min',
        constraints: {
          ...this.materialConstraints,
          ..._.transform(
            this.inputsInt,
            (o, v, k) => {
              if (v.need > 0) o[k] = { min: v.need };
            },
            {}
          ),
          cardExp: { min: 0 },
          init: { equal: 1 },
        },
        variables: Object.assign(
          {
            have: _.transform(
              this.inputsInt,
              (o, v, k) => {
                if (v.have > 0) o[k] = v.have;
              },
              { init: 1 }
            ),
          },
          ...useVariables
        ),
      };

      // 需求狗粮
      if (this.setting.planCardExpFirst) model.variables['转换-经验值'] = { cardExp: -7400, cost: -30 };

      const result = linprog.Solve(model);

      if (!result.feasible) return false;
      delete result.feasible;
      delete result.result;
      delete result.bounded;
      delete result.have;

      const stage = _.mapValues(
        _.mapValues(
          _.omitBy(result, (v, k) => k.startsWith('合成-') || k.startsWith('转换-')),
          v => (v < 1 ? 1 : Math.ceil(v))
        ),
        (v, k) => {
          const cost = v * this.dropTableByServer[k].cost;
          const drop = _.mapValues(_.omit(this.dropTableByServer[k], dropTableOtherFields), e => _.round(v * e, 1));
          const drops = _.transform(
            drop,
            (r, v, k) => {
              if (v > 0) r.push({ name: k, num: v });
            },
            []
          );
          drops.sort((a, b) => {
            let t = this.materialTable[b.name].rare - this.materialTable[a.name].rare;
            if (t == 0) t = b.num - a.num;
            return t;
          });
          return {
            times: v,
            cost,
            money: cost * 12,
            cardExp: _.round(this.dropTableByServer[k].cardExp * v),
            drops,
          };
        }
      );

      const stagePairs = _.toPairs(stage);

      const stages = _.transform(stage, (r, v, k) => r.push({ code: k, ...v }), []);
      stages.sort((a, b) => b.code.localeCompare(a.code));

      let synthesisCost = 0;
      const synthesis = _.transform(
        _.pickBy(result, (v, k) => k.startsWith('合成-')),
        (r, v, k) => {
          const name = k.split('合成-')[1];
          synthesisCost += (this.materialTable[name].rare - 1) * 100 * v;
          r.push({
            name,
            num: _.round(v, 1),
          });
        },
        []
      );
      synthesis.sort((a, b) => {
        let t = this.materialTable[b.name].rare - this.materialTable[a.name].rare;
        if (t == 0) t = b.num - a.num;
        return t;
      });
      synthesisCost = _.round(synthesisCost);

      return {
        cost: _.sumBy(stagePairs, p => p[1].cost),
        stages,
        synthesis,
        synthesisCost,
        money: _.sumBy(stagePairs, p => p[1].money) - synthesisCost,
        cardExp: _.sumBy(stagePairs, p => p[1].cardExp),
      };
    },
    syntExceptAPlpVariables() {
      return Object.assign(
        {},
        this.isPenguinDataSupportedServer ? this.dropTableByServer : _.omitBy(this.dropTableByServer, o => o.event),
        ...this.synthesisTable
      );
    },
    syntExceptAPlpVariablesWithoutEvent() {
      return Object.assign(
        {},
        _.omitBy(this.dropTableByServer, o => o.event),
        ...this.synthesisTable
      );
    },
    materialsCharMap() {
      const presets = _.map(this.selected.presets, ({ name, setting: { evolve, skills: { elite, normal } } }) =>
        _.merge(
          { name, evolve, normal: _.map(_.range(1, 7), r => !!(normal[0] && r >= normal[1] && r < normal[2])) },
          _.transform(
            elite,
            (map, e, i) => {
              map[`elite_${i}`] = _.map(_.range(7, 10), r => !!(e[0] && r >= e[1] && r < e[2]));
            },
            {}
          )
        )
      );
      return _.transform(
        presets,
        (map, preset) => {
          const {
            evolve,
            skills: { elite, normal },
          } = this.elite[preset.name];
          const char = _.merge(
            { evolve, normal },
            _.transform(
              elite,
              (map, e, i) => {
                map[`elite_${i}`] = e.cost;
              },
              {}
            )
          );
          _.forIn(char, (v, k) => {
            const checks = preset[k];
            _.each(v, (cost, i) => {
              if (checks[i]) {
                _.forIn(cost, (num, m) => {
                  map[m] = _.uniq([...(map[m] || []), preset.name]);
                });
              }
            });
          });
        },
        {}
      );
    },
    displayTodoGroup() {
      const groups = _.transform(
        this.todoGroupList,
        (list, { type, group }, gi) => {
          const l = _.filter(group, todo => !todo.finished);
          if (_.size(l)) list.push({ type, list: l, gi, disabled: false });
        },
        []
      );
      if (groups.some(({ type }) => type === 'normalSkill')) {
        groups.filter(({ type }) => type === 'eliteSkill').forEach(group => (group.disabled = true));
      }
      return groups;
    },
    moraleConsumption() {
      const moraleMap = {
        5: 8,
        4: 4,
        3: 2,
        2: 1,
        1: 0,
      };
      return _.mapValues(this.materials, (materials, rare) => {
        return _.sumBy(materials, ({ name }) => this.gaps[name][1] * moraleMap[rare]);
      });
    },
    planStageBlacklistTags() {
      return createTags(this.setting.planStageBlacklist, this.planStageBlacklist.validation);
    },
  },
  methods: {
    num10k(num) {
      return num > 100000 ? (this.$root.localeCN ? `${_.round(num / 10000, 2)}w` : `${_.round(num / 1000, 1)}k`) : num;
    },
    calcMaterialNameTextWidth(material) {
      let width = 245;
      if (this.synthesizable[material.name] && this.gaps[material.name][1] > 0) {
        width -= 40;
      }
      if (!this.$root.smallScreen && _.size(material.drop) >= 4) {
        width -= 85;
      }
      return width;
    },
    synthesize(name, times) {
      if (!this.synthesizable[name]) return;
      const { madeof } = this.materialTable[name];
      times =
        times ||
        Math.min(_.sum(this.gaps[name]), ..._.map(madeof, (num, m) => Math.floor(this.inputsInt[m].have / num)));
      _.forIn(madeof, (num, m) => (this.inputs[m].have = (this.inputsInt[m].have - num * times).toString()));
      this.inputs[name].have = (this.inputsInt[name].have + times).toString();
    },
    reset(rk, needResetPresets = true, undoTip = true) {
      const backup = undoTip
        ? {
            inputs: _.cloneDeep(this.inputs),
            presets: _.cloneDeep(this.selected.presets),
          }
        : null;
      if (needResetPresets && !(rk && rk === 'have')) this.selected.presets = [];
      this.ignoreInputsChange = true;
      for (const name in this.inputs) {
        const material = this.inputs[name];
        if (rk) {
          material[rk] = '';
        } else
          for (const key in material) {
            material[key] = '';
          }
      }
      if (undoTip) {
        this.$snackbar({
          message: this.$t('common.reseted'),
          timeout: 0,
          buttonText: this.$t('common.undo'),
          onButtonClick: () => {
            this.ignoreInputsChange = true;
            this.inputs = backup.inputs;
            this.selected.presets = backup.presets;
          },
        });
      }
    },
    addNeed(need) {
      _.each(need, (num, name) => {
        const orig = parseInt(this.inputs[name].need) || 0;
        this.inputs[name].need = (orig + num).toString();
      });
    },
    usePreset(presets) {
      if (presets) this.selected.presets = presets;
      this.reset('need', false, false);
      for (const {
        name,
        setting: { evolve, skills },
      } of this.selected.presets) {
        const current = this.elite[name];

        current.evolve.forEach((need, i) => {
          if (evolve[i]) this.addNeed(need);
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
            this.addNeed(current.skills.elite[i].cost[j]);
          }
        });
      }
      // ensure
      localStorage.setItem('material.selected', JSON.stringify(this.selected));
    },
    showPreset(obj, edit = false) {
      this.selectedPreset = obj;
      this.selectedPresetName = obj.tag.name;
      if (edit) this.pSetting = _.cloneDeep(this.selected.presets[obj.index].setting);
      else {
        this.pSetting = _.cloneDeep(pSettingInit);
        _.each(this.elite[this.selectedPresetName]?.skills?.elite ?? [], ({ cost }, i) => {
          this.pSetting.skills.elite[i][2] -= 3 - cost.length;
        });
      }
      this.$nextTick(() => {
        this.presetDialog.open();
        this.$mutation();
      });
    },
    addPreset() {
      if (!this.checkPSetting) {
        this.$snackbar(this.$t('cultivate.panel.preset.emptySelect'));
        return;
      }
      this.selectedPreset.tag.setting = _.cloneDeep(this.pSetting);
      this.selectedPreset.tag.setting.state = 'edit';
      this.selectedPreset.addTag();
    },
    editPreset() {
      if (!this.checkPSetting) {
        this.$snackbar(this.$t('cultivate.panel.preset.emptySelect'));
        return;
      }
      this.selected.presets[this.selectedPreset.index].setting = _.cloneDeep(this.pSetting);
      this.usePreset();
    },
    updatePreset() {
      this.selected.presets.forEach(p => {
        p.text = this.$t(`character.${p.name}`);
        const e1 = p.setting.skills.elite;
        const e2 = pSettingInit.skills.elite;
        const lenGap = e2.length - e1.length;
        for (let i = 0; i < lenGap; i++) {
          e1.push(_.cloneDeep(e2[0]));
        }
      });
    },
    async copySyncCode() {
      if (await clipboard.setText(this.setting.syncCodeV2)) this.$snackbar(this.$t('common.copied'));
    },
    saveData() {
      this.dataSyncDialog.close();
      const data = {
        inputs: this.compressedInputs,
        presets: this.selected.presets,
      };
      const str = Base64.encode(JSON.stringify(data));
      this.$prompt(
        this.$t('cultivate.panel.sync.saveDataLable'),
        this.$t('cultivate.panel.sync.saveDataTitle'),
        async () => {
          if (await clipboard.setText(str)) this.$snackbar(this.$t('common.copied'));
        },
        () => {},
        {
          history: false,
          defaultValue: str,
          cancelText: this.$t('common.close'),
          confirmText: this.$t('cultivate.panel.sync.copy2clipboard'),
        }
      );
    },
    restoreData() {
      this.dataSyncDialog.close();
      this.$prompt(
        this.$t('cultivate.panel.sync.restoreDataLable'),
        this.$t('cultivate.panel.sync.restoreDataTitle'),
        value => {
          if (value.length == 0) return;
          try {
            const { inputs, presets } = JSON.parse(Base64.decode(value));
            this.compressedInputs = inputs;
            this.selected.presets = presets;
            this.$snackbar(this.$t('cultivate.snackbar.imported'));
          } catch (error) {
            this.$snackbar(this.$t('cultivate.snackbar.importFailed'));
          }
        },
        () => {},
        {
          history: false,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.import'),
        }
      );
    },
    cloudSaveData(silence = false) {
      const snackbar = silence ? () => {} : this.$snackbar;
      const data = {
        inputs: this.compressedInputs,
        presets: this.selected.presets,
      };
      const obj = {
        md5: md5(JSON.stringify(data)),
        data,
      };
      this.dataSyncing = true;
      if (this.setting.syncCodeV2) {
        Ajax.updateJson(this.$root.jsonstorageURL, this.setting.syncCodeV2, obj)
          .then(() => {
            this.dataSyncing = false;
            snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(() => {
            this.dataSyncing = false;
            snackbar(this.$t('cultivate.snackbar.backupFailed'));
          });
      } else {
        Ajax.createJson(this.$root.jsonstorageURL, obj)
          .then(id => {
            this.dataSyncing = false;
            this.setting.syncCodeV2 = id;
            snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(() => {
            this.dataSyncing = false;
            snackbar(this.$t('cultivate.snackbar.backupFailed'));
          });
      }
      if (!silence) {
        this.$gtag.event('material_cloud_backup', {
          event_category: 'material',
          event_label: 'cloud',
        });
      }
    },
    cloudRestoreData() {
      if (!this.setting.syncCodeV2) return;
      this.dataSyncing = true;
      Ajax.getJson(this.$root.jsonstorageURL, this.setting.syncCodeV2)
        .then(({ md5: _md5, data }) => {
          if (!_md5 || !data || _md5 !== md5(JSON.stringify(data))) {
            this.dataSyncing = false;
            this.$snackbar(this.$t('cultivate.snackbar.restoreFailed'));
            return;
          }
          this.ignoreInputsChange = true;
          this.compressedInputs = data.inputs;
          this.selected.presets = data.presets;
          this.$snackbar(this.$t('cultivate.snackbar.restoreSucceeded'));
          this.dataSyncing = false;
        })
        .catch(() => {
          this.dataSyncing = false;
          this.$snackbar(this.$t('cultivate.snackbar.restoreFailed'));
        });
      this.$gtag.event('material_cloud_restore', {
        event_category: 'material',
        event_label: 'cloud',
      });
    },
    async initPlanner() {
      if (this.plannerInited) return;

      // 初始化
      this.dropInfo = {
        expectAP: {},
        stageValue: {},
      };
      this.dropTable = {};
      this.materialConstraints = {};
      this.synthesisTable = [];
      this.penguinData = {
        time: 0,
        data: null,
        ...safelyParseJSON(localStorage.getItem(`penguinData.${this.penguinDataServer}`)),
      };

      if (!this.penguinData.data || this.isPenguinDataExpired) {
        const tip = this.$snackbar({
          message: this.$t('cultivate.snackbar.penguinDataLoading'),
          timeout: 0,
          closeOnOutsideClick: false,
        });
        const data = await Ajax.get(`${this.$root.penguinURL}?server=${this.penguinDataServer}`, true).catch(
          () => false
        );
        tip.close();
        if (data) {
          this.penguinData = { data, time: Date.now() };
          localStorage.setItem(`penguinData.${this.penguinDataServer}`, JSON.stringify(this.penguinData));
          this.$gtag.event('material_penguinstats_loaded', {
            event_category: 'material',
            event_label: 'penguinstats',
          });
        } else {
          if (this.penguinData.data) {
            this.$snackbar(this.$t('cultivate.snackbar.penguinDataFallback'));
            this.$gtag.event('material_penguinstats_fallback', {
              event_category: 'material',
              event_label: 'penguinstats',
            });
          } else {
            this.$snackbar(this.$t('cultivate.snackbar.penguinDataFailed'));
            this.$gtag.event('material_penguinstats_failed', {
              event_category: 'material',
              event_label: 'penguinstats',
            });
            return;
          }
        }
      }

      const eap = this.dropInfo.expectAP;

      // 处理合成列表
      for (const { name, madeof, rare } of this.materialList) {
        eap[name] = {};
        this.materialConstraints[name] = { min: 0 };
        if (_.size(madeof) == 0) continue;
        const product = {};
        product[name] = 1;
        if (!this.synthesisTable[rare - 2]) this.synthesisTable[rare - 2] = {};
        this.synthesisTable[rare - 2][`合成-${name}`] = {
          ...product,
          ..._.mapValues(madeof, v => -v),
          cost: 0,
        };
      }

      // 狗粮
      const cardExp = {
        2001: 200,
        2002: 400,
        2003: 1000,
        2004: 2000,
      };

      // 处理掉落信息
      for (const { stageId: origStageId, itemId, quantity, times } of this.penguinData.data.matrix) {
        if (quantity === 0) continue;
        const stageId = origStageId.replace(/_rep$/, '');
        if (!(stageId in stageTable && (itemId in this.materialConstraints || itemId in cardExp))) continue;
        const { code, cost, event = false } = stageTable[stageId];
        if (!this.dropTable[code]) this.dropTable[code] = { cost, event, cardExp: 0 };
        this.dropTable[code][itemId] = quantity / times;
        if (itemId in cardExp) {
          this.dropTable[code].cardExp += (cardExp[itemId] * quantity) / times;
        } else {
          eap[itemId][code] = cost / this.dropTable[code][itemId];
        }
      }

      this.plannerInited = true;

      // 最小期望理智，用于计算价值
      _.forEach(eap, (item, id) => (item.value = this.syntExceptAPListWithoutEvent[id].ap));

      // 计算关卡性价比
      _.forEach(this.dropTable, (drop, code) => {
        const materialAP = _.sum(_.map(_.omit(drop, dropTableOtherFields), (p, n) => eap[n].value * p));
        const brAP = (this.dropTable[code].cardExp / 7400) * 30;
        this.dropInfo.stageValue[code] = (materialAP + brAP) / drop.cost;
      });
    },
    showPlan() {
      if (this.plan.cost === 0)
        this.$alert(this.$t('cultivate.planner.noNeed'), () => {}, { confirmText: this.$t('common.okay') });
      else {
        this.plannerRequest = true;
        this.$nextTick(() => this.plannerDialog.open());
      }
    },
    resetPenguinData() {
      this.plannerInited = false;
      localStorage.removeItem(`penguinData.${this.penguinDataServer}`);
      return this.initPlanner();
    },
    async showDropDetail({ name }) {
      await this.initPlanner();
      this.dropDetails = [];
      this.dropFocus = name;
      for (const code in this.displayDropListByServer[name]) {
        if (code === 'synt') continue;
        const stage = this.dropTable[code];
        if (!stage) continue;
        const drops = _.toPairs(_.omit(stage, dropTableOtherFields)).sort((a, b) => {
          const s = this.materialTable[b[0]].rare - this.materialTable[a[0]].rare;
          if (s != 0) return s;
          return b[1] - a[1];
        });
        const dropBrs = _.toPairs(_.pick(stage, battleRecordIds));
        this.dropDetails.push({
          code,
          cost: stage.cost,
          drops,
          dropBrs,
        });
      }
      this.$nextTick(() => this.dropDialog.open());
    },
    transitionBeforeLeave(el) {
      const paRect = el.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0 };
      const elRect = el.getBoundingClientRect();
      this.$$(el).css({
        top: `${elRect.top - paRect.top}px`,
        left: `${elRect.left - paRect.left}px`,
        width: `${elRect.width}px`,
      });
    },
    transitionAfterLeaveBeforeEnter(el) {
      this.$$(el).css({
        top: '',
        left: '',
        width: '',
      });
    },
    showSyntBtn(material) {
      return this.synthesizable[material.name] && _.sum(this.gaps[material.name]) > 0;
    },
    getSyntExceptAP(name, withoutEvent = false) {
      if (!this.plannerInited) return null;

      // 线性规划模型
      const model = {
        optimize: 'cost',
        opType: 'min',
        constraints: {
          ...this.materialConstraints,
          [name]: { min: 1 },
        },
        variables: withoutEvent ? this.syntExceptAPlpVariablesWithoutEvent : this.syntExceptAPlpVariables,
      };

      const result = linprog.Solve(model);
      const ap = result.result;
      delete result.feasible;
      delete result.result;
      delete result.bounded;

      return {
        stages: Object.keys(result).filter(k => !k.startsWith('合成-')),
        ap,
      };
    },
    onDropListScroll({ deltaY, path }) {
      const dPos = deltaY / Math.abs(deltaY);
      const listEl = path.find(el => this.$$(el).hasClass('drop-list'));
      const pos = Math[{ '-1': 'floor', 0: 'round', 1: 'ceil' }[dPos]](listEl.scrollTop / 21) + dPos;
      listEl.scrollTop = pos * 21;
    },
    showTodoPreset(obj) {
      this.selectedPreset = obj;
      this.selectedPresetName = obj.tag.name;
      const setting = obj.tag.setting;
      this.pSetting = _.cloneDeep(setting);
      const todoGroupList = [
        {
          type: 'promotion',
          group: _.map(this.sp.evolve, (cost, i) => ({
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
            cost: this.sp.skills.normal[ski - 1],
          })),
        },
        ..._.map(this.sp.skills.elite, ({ cost, name }, i) => ({
          type: 'eliteSkill',
          group: _.map(_.range(setting.skills.elite[i][1], setting.skills.elite[i][2]), ski => ({
            name: `${this.$t(`skill.${name}`)} ${ski} -> ${ski + 1}`,
            index: ski,
            check: setting.skills.elite[i][0],
            cost: cost[ski - 7],
          })),
        })),
      ];
      this.todoGroupList = _.map(todoGroupList, ({ type, group }) => ({
        type,
        group: _.map(
          _.filter(group, todo => todo.check),
          m => _.merge(m, { finished: false })
        ),
      }));
      this.$nextTick(() => {
        this.todoPresetDialog.open();
        this.$mutation();
      });
    },
    todoNeeds(needs) {
      const result = [];
      _.forIn(needs, (num, m) =>
        result.push({
          text: this.$t(`material.${m}`),
          need: num * 1,
          have: this.inputsInt[m].have,
          synt: Math.min(this.gaps[m][1], Math.max(num * 1 - this.inputsInt[m].have, 0)),
        })
      );
      return result;
    },
    todoCanFinished(needs) {
      return _.every(needs, (num, m) => this.inputsInt[m].have >= num);
    },
    todoEnough(needs) {
      return _.every(needs, (num, m) => this.inputsInt[m].have + this.gaps[m][1] >= num);
    },
    todoNeedSynt(needs) {
      return _.some(needs, (num, m) => this.inputsInt[m].have < num);
    },
    finishTodo(todo, gi) {
      todo.finished = true;
      const handle = (obj, init) => {
        const next = todo.index + 1;
        if (next >= obj[2]) _.range(0, 3).forEach(i => (obj[i] = init[i]));
        else obj[1] = next;
      };
      if (gi == 0) {
        // 精英化
        this.pSetting.evolve[todo.index] = false;
      } else if (gi == 1) {
        // 普通技能
        handle(this.pSetting.skills.normal, pSettingInit.skills.normal);
      } else {
        // 专精技能
        handle(this.pSetting.skills.elite[gi - 2], pSettingInit.skills.elite[gi - 2]);
      }
      _.forIn(todo.cost, (num, m) => {
        this.inputs[m].have = (this.inputsInt[m].have - num).toString();
        this.inputs[m].need = (this.inputsInt[m].need - num).toString();
      });
      if (!_.size(this.displayTodoGroup)) {
        this.selected.presets.splice(this.selectedPreset.index, 1);
        this.todoPresetDialog.close();
      } else {
        this.selected.presets[this.selectedPreset.index].setting = _.cloneDeep(this.pSetting);
      }
      this.usePreset();
    },
    resetSelectedRare() {
      this.selected.rare = _.concat([false], _.fill(Array(this.rareNum - 1), true));
    },
    moraleText(morale) {
      const people = Math.floor(morale / 24);
      const remainder = morale % 24;
      return people > 0 ? `${people} * 24` + (remainder ? ` + ${remainder}` : '') : remainder;
    },
    importItems(items) {
      _.each(items, (num, name) => {
        const input = this.inputs[name];
        if (input && typeof num === 'number') input.have = String(num);
      });
    },
    handleImgErr(e) {
      e.target.src = this.$root.avatar('no_image');
      e.target.style.backgroundColor = '#bdbdbd';
      e.target.style.borderRadius = '50%';
    },
    isSkillReleased({ isPatch, unlockStages }) {
      return !isPatch || unlockStages.every(stage => !this.unopenedStages.includes(stage));
    },
  },
  created() {
    this.$root.$on('import-items', this.importItems);
    this.$root.importItemsListening = true;
    window.importItems = this.importItems;

    for (const name of this.materialOrder) {
      this.$set(this.inputs, name, {
        need: '',
        have: '',
      });
    }

    this.resetSelectedRare();

    for (const key in localStorage) {
      if (!key.startsWith('material.')) continue;
      const thisKey = key.split('.')[1];
      if (thisKey === 'inputs') this.ignoreInputsChange = true;
      this[thisKey] = _.assign(
        {},
        this[thisKey],
        _.pick(safelyParseJSON(localStorage.getItem(key)), _.keys(this[thisKey]))
      );
    }

    for (const name in this.inputs) {
      const material = this.inputs[name];
      for (const key in material) {
        if (material[key] == 0) material[key] = '';
      }
    }

    this.updatePreset();

    this.throttleAutoSyncUpload = _.throttle(() => this.cloudSaveData(true), 5000, { leading: false, trailing: true });

    const itemsImportStorageKey = 'depot.imports';
    if (itemsImportStorageKey in localStorage) {
      this.ignoreInputsChange = false;
      const items = safelyParseJSON(localStorage.getItem(itemsImportStorageKey));
      localStorage.removeItem(itemsImportStorageKey);
      this.importItems(items);
    }
  },
  mounted() {
    this.presetDialog = new this.$Dialog('#preset-setting', { history: false });
    this.$$('#preset-setting').on('closed.mdui.dialog', () => (this.selectedPresetName = ''));
    this.plannerDialog = new this.$Dialog('#planner', { history: false });
    this.$$('#planner').on('closed.mdui.dialog', () => (this.plannerRequest = false));
    this.dropDialog = new this.$Dialog('#drop-detail', { history: false });
    this.$$('#drop-detail').on('closed.mdui.dialog', () => (this.dropDetails = false));
    this.dataSyncDialog = new this.$Dialog('#data-sync', { history: false });
    this.todoPresetDialog = new this.$Dialog('#preset-todo', { history: false });
    this.$$('#preset-todo').on('closed.mdui.dialog', () => (this.selectedPresetName = ''));
    this.planSettingDialog = new this.$Dialog('#planner-setting', { history: false });
    if (this.$root.materialListRendering) {
      setTimeout(() => {
        this.$root.materialListRendering = false;
      }, 700);
    }
  },
  beforeDestroy() {
    this.$root.importItemsListening = false;
    this.$root.$off('import-items');
  },
};
</script>

<style lang="scss">
#app:not(.mobile-screen) #arkn-material {
  .num-btn {
    min-width: 40px;
  }
  .material {
    flex: 1;
    &:not(.material-simple) {
      min-width: 370px;
      width: unset;
      .input-panel {
        padding-right: 120px;
        display: flex;
        & > * {
          width: unset;
          flex: 1;
        }
      }
      .drop-list {
        width: 110px;
        right: 10px;
        position: absolute;
        &:not([length='1']):not([length='2']) {
          height: 42px;
          overflow-y: auto;
          padding-right: 1px;
        }
      }
    }
  }
}
#arkn-material {
  #material-main {
    overflow: hidden;
    transition: all 0.5s;
    &.rendering {
      opacity: 0;
    }
  }
  #preset-setting {
    overflow: visible;
    max-width: 400px;
    min-width: 320px;
    .mdui-card-header {
      height: auto;
    }
    .mdui-card-header-title {
      font-size: 24px;
      line-height: 40px;
    }
    .mdui-select {
      min-width: 60px;
    }
  }
  .preset-list > div:not(:first-child) {
    margin-top: 8px;
  }
  .elite-cb-list {
    display: flex;
    .mdui-checkbox {
      width: 130px;
      flex-shrink: 1;
    }
  }
  .skill-cb {
    min-width: 130px;
  }
  #preset.vue-tags-input {
    .ti-tag {
      margin-left: 0;
      margin-right: 4px;
    }
    .ti-input {
      border: none;
      padding: 0;
      z-index: 30;
      position: relative;
    }
    .ti-selected-item:hover {
      background-color: unset;
      color: unset;
    }
    .ti-autocomplete {
      border: none;
      max-height: calc(90vh - 150px);
      max-width: 400px;
      overflow-y: auto;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .ti-new-tag-input {
      font-size: 14px;
      &-wrapper {
        margin: 3px;
      }
    }
  }
  .vue-tags-input.empty .ti-autocomplete {
    display: none;
  }
  .material {
    min-width: 250px;
    display: inline-block;
    &:not(.material-simple) {
      width: 375px;
    }
    .mdui-btn.small-btn {
      margin: -4px 0;
    }
    &,
    .mdui-card-header-title {
      transition: all 0.3s;
    }
    .mdui-card-header {
      height: auto;
      padding-right: 0;
      & > div:not(.mdui-card-header-avatar) {
        margin-left: 92px;
      }
      &-avatar {
        width: 80px;
        height: 80px;
        transform: scale(1.1);
        justify-content: center;
        .material-image {
          width: 100%;
        }
      }
      &-title {
        font-size: 23px;
        padding: 3px 0;
        line-height: 1;
      }
    }
    .material {
      &-name {
        line-height: 26px;
        margin-top: -2px;
        &-wrap {
          padding-right: 16px;
          display: flex;
          flex-wrap: nowrap;
        }
      }
      &-made-of {
        font-size: 12px;
        font-weight: 400;
      }
    }
    .synt-btn {
      flex-shrink: 0;
    }
  }
  .material-simple-grid {
    flex: 1;
    min-width: 165px;
  }
  .material-simple {
    width: 100%;
    min-width: 168px;
    .mdui-card-header-avatar {
      transform: scale(1);
    }
    .mdui-card-header {
      padding: 8px 16px 8px 8px;
    }
    .mdui-card-header-avatar {
      margin-top: -2px;
    }
    .input-panel > * {
      width: 100%;
    }
  }
  .material-simple-name {
    position: absolute;
    bottom: -12px;
    font-size: 12px;
    max-width: 100%;
  }
  .drop-list {
    display: inline-block;
    position: relative;
    margin: 0;
    vertical-align: top;
    padding: 0;
    font-size: 16px;
    line-height: 20px;
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .drop-item {
      list-style-type: none;
      padding-bottom: 1px;
    }
  }
  .drop-list-more {
    position: absolute;
    left: 300px;
    top: 88px;
    transform: rotate(90deg) scaleY(2) scaleX(0.7);
  }
  .code {
    display: inline-block;
    width: 45px;
    text-align: right;
    padding-right: 4px;
  }
  .probability {
    display: inline-block;
    padding: 0 5px;
    height: 20px;
    line-height: 20px;
    border-radius: 2px;
    font-size: 12px;
    position: relative;
  }
  .code,
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
    height: 24px;
    small {
      font-size: 12px;
    }
  }
  .card-triangle {
    width: 40px;
    height: 40px;
    position: absolute;
    transform: rotate(45deg);
    right: -20px;
    top: -20px;
  }
  .card-triangle-small {
    width: 30px;
    height: 30px;
    position: absolute;
    transform: rotate(45deg);
    right: -15px;
    top: -15px;
  }
  @media screen and (max-width: 359px) {
    .drop-list {
      left: -92px;
      width: calc(100% + 92px);
      border-left: 4px solid rgba(0, 0, 0, 0.2);
      margin-top: 8px;
    }
    .drop-list li {
      display: inline-block;
    }
    .drop-list-more {
      display: none;
    }
  }
  .stage {
    &:first-child h5 {
      margin-top: 0;
    }
    .num-item {
      margin-bottom: 8px;
      width: 130px;
      &-text {
        max-width: 98px;
      }
    }
  }
  #data-sync {
    .tag-btn {
      padding: 0 14px;
    }
    #sync-code {
      display: block;
      padding: 0;
    }
  }
  #material-normal > div {
    transition: all 0.5s;
  }
  .material-group-wrap {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    margin-right: -16px;
    & > div {
      transition: all 0.5s;
    }
  }
  .material-group-wrap-transition,
  .todo-list-transition {
    &-enter,
    &-leave-to {
      opacity: 0;
    }
    &-leave-active {
      position: absolute;
    }
    &-enter {
      transition-property: opacity !important;
    }
  }
  .todo-list-transition {
    &-leave-active {
      z-index: -1;
    }
    &-leave-to {
      transform: translateX(-100px);
    }
  }
  #material-normal {
    .material-group-wrap-transition-enter {
      transform: translateX(-200px);
    }
  }
  #material-simple {
    .material-group-wrap-transition-enter {
      transform: translateX(-50px);
    }
  }
  #preset-todo {
    .mdui-dialog-title {
      font-size: unset;
      font-weight: unset;
      line-height: unset;
    }
    .mdui-card-header-title {
      font-size: 24px;
      line-height: 40px;
    }
    .preset-todo-materials {
      display: inline-block;
      margin-right: -8px;
      & > * {
        display: inline-block;
        margin-right: 8px;
      }
    }
    .mdui-list-item {
      transition: all 0.5s, background-color 0.3s;
    }
    .mdui-checkbox {
      transition: all 0.5s;
    }
  }
  #planner-stage-blacklist.vue-tags-input {
    .ti-input {
      border-radius: 2px;
    }
    .ti-new-tag-input {
      text-transform: uppercase;
      &::placeholder {
        text-transform: none;
      }
      &.ti-invalid {
        color: #ff0000;
      }
    }
  }
}
.mobile-screen #arkn-material {
  #material-normal {
    .material-group-wrap {
      margin-right: 0;
    }
  }
  .rare-title {
    margin-left: 8px;
  }
  .material:not(.material-simple) {
    box-shadow: none;
    width: 100%;
    background: transparent;
    .mdui-card-header {
      padding: 0;
    }
    .mdui-card-header-avatar {
      transform: scale(1);
    }
    @media screen and (min-width: 360px) {
      .drop-list:not([length='1']):not([length='2']) {
        height: 42px;
        overflow-y: auto;
        padding-right: 1px;
      }
    }
    @media screen and (min-width: 360px) and (max-width: 374px) {
      .input-panel .mdui-textfield {
        width: calc((48px * 2 - (376px - 100vw)) / 2);
      }
    }
    @media screen and (max-width: 359px) {
      .drop-list .drop-item {
        width: 110px;
      }
    }
  }
}
.mdui-theme-layout-dark #arkn-material {
  #preset.vue-tags-input {
    .ti-autocomplete {
      background-color: var(--deep-dp-12);
    }
    .ti-tag {
      filter: brightness(0.9);
    }
  }
  #planner-stage-blacklist.vue-tags-input {
    .ti-new-tag-input {
      &.ti-invalid {
        color: #ff6666;
      }
    }
  }
}
</style>
