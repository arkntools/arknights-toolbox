<template>
  <div id="arkn-material">
    <div class="mdui-row">
      <!-- 选项 -->
      <div class="mdui-col-xs-12">
        <table class="mdui-table tag-table">
          <tbody>
            <!-- 筛选 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.filter') }}</button
                ></td
              >
              <td class="mobile-screen-flex-box tag-btn-wrap">
                <label v-if="$root.smallScreen" class="mdui-textfield-label flex-full">{{
                  $t('common.filter')
                }}</label>
                <button
                  class="mdui-btn mdui-btn-dense mdui-ripple tag-btn"
                  v-theme-class="allSelected ? color.selected : color.notSelected"
                  @click="
                    const result = !allSelected;
                    selected.rare = $_.fill(Array(selected.rare.length), result);
                    selected.type = $_.mapValues(selected.type, () => result);
                  "
                  >{{ $t('common.selectAllShorten') }}</button
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
                <div v-if="$root.smallScreen" style="width: 100%"></div>
                <tag-button
                  class="num-btn"
                  v-for="k in Object.keys(selected.type)"
                  :key="`type-${k}`"
                  v-model="selected.type[k]"
                  :notSelectedColor="color.notSelected"
                  :selectedColor="color[k]"
                  >{{ $t(`cultivate.itemType.${k}`) }}</tag-button
                >
                <button
                  class="mdui-btn mdui-btn-dense mdui-color-red tag-btn"
                  v-theme-class="$root.color.redBtn"
                  @click="resetSelected()"
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
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{
                  $t('common.preset')
                }}</label>
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
                    <div class="mdui-list-item-avatar lh-0"
                      ><avatar
                        class="no-pe"
                        :key="`head-${props.item.text}`"
                        :name="props.item.name"
                    /></div>
                    <div class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">{{
                      props.item.text
                    }}</div>
                  </div>
                  <span
                    class="no-sl"
                    slot="tag-center"
                    slot-scope="props"
                    @click="showPreset(props, true)"
                    >{{ props.tag.text }}</span
                  >
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
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{
                  $t('common.todo')
                }}</label>
                <span
                  v-if="!selected.presets.length"
                  class="mdui-text-color-theme-secondary mdui-p-x-1 font-size-14 no-sl"
                  >{{ $t('common.none') }}</span
                >
                <drop-list
                  v-else
                  :items="selected.presets"
                  @reorder="$event.apply(selected.presets)"
                >
                  <template v-slot:item="{ item: char, index }">
                    <drag
                      :key="char.name"
                      class="mdui-chip no-bs mdui-m-r-1 pointer"
                      :class="{ 'opacity-5': !$root.isImplementedChar(char.name) }"
                      @click="$refs.presetTodoDialog.showTodoPreset({ tag: char, index })"
                    >
                      <avatar class="mdui-chip-icon no-pe" :name="char.name" />
                      <span class="mdui-chip-title">{{ char.text }}</span>
                    </drag>
                  </template>
                  <template v-slot:reordering-feedback>
                    <div class="todo-reordering-feedback" key="reordering-feedback"></div>
                  </template>
                </drop-list>
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
                <mdui-switch v-model="setting.simpleMode">{{
                  $t('cultivate.setting.simpleMode')
                }}</mdui-switch>
                <mdui-switch
                  v-show="setting.simpleMode"
                  v-model="setting.simpleModeOrderedByRareFirst"
                  >{{ $t('cultivate.setting.simpleModeOrderedByRareFirst') }}</mdui-switch
                >
                <mdui-switch
                  v-for="key in settingList[0]"
                  :key="key"
                  v-model="setting[key]"
                  :disabled="key in settingDisabled ? settingDisabled[key]() : false"
                  >{{ $t(`cultivate.setting.${key}`) }}</mdui-switch
                >
                <mdui-switch v-if="$root.localeCN" v-model="setting.penguinUseCnServer"
                  ><span mdui-tooltip="{content:'可能反而会更慢，请酌情使用',position:'top'}">{{
                    $t('cultivate.setting.penguinUseCnServer')
                  }}</span></mdui-switch
                >
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
                  v-theme-class="$root.color.blueBtn"
                  @click="$refs.dataSyncDialog.open()"
                  ><i class="mdui-icon material-icons mdui-icon-left">cloud</i
                  >{{ $t('cultivate.panel.button.cloudSync') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.blueBtn"
                  @click="importFromJSON"
                  ><i class="mdui-icon material-icons mdui-icon-left">archive</i
                  >{{ $t('cultivate.panel.button.importFromJSON') }}</button
                >
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="['mdui-color-pink', 'mdui-color-pink-a100 mdui-ripple-black']"
                  @click="resetPenguinData"
                  >{{ $t('cultivate.panel.button.forceUpdate') }}</button
                >
                <button
                  v-show="selected.presets.length"
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="['mdui-color-pink', 'mdui-color-pink-a100 mdui-ripple-black']"
                  @click="usePreset()"
                  >{{ $t('cultivate.panel.button.forceUpdateNeedFromPreset') }}</button
                >
                <button
                  v-show="$_.size(highlightCost)"
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.pinkBtn"
                  @click="clearHighlight"
                  >{{ $t('cultivate.panel.button.clearHighlight') }}</button
                >
              </td>
            </tr>
            <!-- 计算 -->
            <tr>
              <td v-if="!$root.smallScreen" width="1"
                ><button
                  class="mdui-btn mdui-btn-dense no-pe tag-btn tag-table-header"
                  v-theme-class="$root.color.tagBtnHead"
                  >{{ $t('common.function') }}</button
                ></td
              >
              <td class="mobile-screen-flex-box tag-btn-wrap">
                <!-- 刷图规划 -->
                <div class="btn-group">
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-left"
                    v-theme-class="[
                      'mdui-color-purple',
                      'mdui-color-purple-a100 mdui-ripple-black',
                    ]"
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
                    v-theme-class="[
                      'mdui-color-purple',
                      'mdui-color-purple-a100 mdui-ripple-black',
                    ]"
                    :disabled="apbDisabled"
                    @click="$refs.planSettingDialog.open()"
                    ><i class="mdui-icon material-icons">settings</i></button
                  >
                </div>
                <!-- 多账号切换 -->
                <div class="btn-group" style="max-width: calc(100vw - 31px)">
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-left"
                    v-theme-class="$root.color.blueBtn"
                    mdui-menu="{ target: '#multi-account-menu', covered: false }"
                    ><div class="mdui-text-truncate"
                      >{{ $t('cultivate.multiAccount.button')
                      }}{{ accountList.length > 1 ? ` (${curAccountName})` : '' }}</div
                    ></button
                  >
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-right no-grow"
                    v-theme-class="$root.color.blueBtn"
                    @click="$refs.accountManageDialog.open()"
                    ><i class="mdui-icon material-icons">settings</i></button
                  >
                  <ul id="multi-account-menu" class="mdui-menu">
                    <li
                      class="mdui-menu-item mdui-ripple"
                      v-for="{ id, name } in accountList"
                      :key="id"
                    >
                      <a class="mdui-ripple pointer" @click="switchAccount(id)">
                        <i
                          class="mdui-menu-item-icon mdui-icon material-icons"
                          :class="{ 'mdui-invisible': curAccount.id !== id }"
                          >done</i
                        >{{ name }}
                      </a>
                    </li>
                    <li class="mdui-menu-item mdui-ripple">
                      <a class="mdui-ripple pointer" @click="addAccount">
                        <i class="mdui-menu-item-icon mdui-icon material-icons">add</i
                        >{{ $t('common.add') }}
                      </a>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- /选项 -->
      <!-- 说明 -->
      <div class="mdui-col-xs-12">
        <div class="mdui-panel mdui-panel-gapless mdui-m-t-2" mdui-panel>
          <div class="mdui-panel-item">
            <div class="mdui-panel-item-header">
              <div class="mdui-panel-item-title">{{ $t('common.guide') }}</div>
              <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
            </div>
            <div class="mdui-panel-item-body mdui-p-l-0">
              <cultivate-guide />
            </div>
          </div>
        </div>
      </div>
      <!-- /说明 -->
    </div>
    <!-- 材料 -->
    <div id="material-main" class="mdui-row">
      <!-- 简洁模式 -->
      <div id="material-simple" class="mdui-col-xs-12 mdui-m-t-4" v-if="setting.simpleMode">
        <transition-group
          class="material-group-wrap"
          tag="div"
          name="material-group-wrap-transition"
          @before-leave="$root.transitionBeforeLeave"
          @after-leave="$root.transitionAfterLeaveBeforeEnter"
        >
          <!-- 材料卡片 -->
          <div
            class="material-simple-grid mdui-m-b-2 mdui-m-r-2"
            v-for="materialName in setting.simpleModeOrderedByRareFirst
              ? materialRareFirstOrder
              : materialOrder"
            :key="`${materialName}-simple`"
            v-show="showMaterialsFlatten.has(materialName)"
          >
            <div
              class="mdui-card material material-simple"
              :name="materialName"
              :rare="materialTable[materialName].rare"
              :class="{
                'opacity-5':
                  setting.translucentEnough && hasInput && autoGaps[materialName][0] == 0,
                highlight: highlight[materialName],
              }"
            >
              <div
                class="card-triangle-small"
                v-theme-class="color[materialTable[materialName].rare]"
              ></div>
              <div class="mdui-card-header" :name="materialName">
                <!-- 图片 -->
                <div
                  class="mdui-card-header-avatar mdui-valign pointer no-sl"
                  @click="showDropDetail(materialTable[materialName])"
                >
                  <DataImg
                    class="material-image no-pe"
                    type="item"
                    :name="materialTable[materialName].name"
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
                    <span
                      v-if="setting.showExcessNum && excessNum[materialName]"
                      class="gap-num no-sl mdui-text-color-green-a700"
                      >{{ excessNum[materialName] }}</span
                    >
                    <span v-else class="gap-num no-sl"
                      >{{ num10k(autoGaps[materialName][0])
                      }}<small v-if="autoGaps[materialName][1] > 0"
                        >({{ num10k(autoGaps[materialName][1]) }})</small
                      ></span
                    >
                  </div>
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
          </div>
          <!-- 占位 -->
          <div class="material-simple-grid mdui-m-r-2" v-for="pIndex in 6" :key="pIndex"></div>
          <!-- /材料卡片 -->
        </transition-group>
      </div>
      <!-- /简洁模式 -->
      <!-- 正常模式 -->
      <transition-group
        v-else
        id="material-normal"
        tag="div"
        name="material-group-wrap-transition"
        @before-leave="$root.transitionBeforeLeave"
        @after-leave="$root.transitionAfterLeaveBeforeEnter"
        @before-enter="$root.transitionAfterLeaveBeforeEnter"
      >
        <div
          class="mdui-col-xs-12"
          v-for="i in rareArr.concat(Object.keys(selected.type))"
          :key="`materials-${i}`"
          v-show="showMaterials[i].size > 0"
        >
          <div class="mdui-typo rare-title">
            <h2
              >{{ Number(i) ? `${$t('common.rarity')} ${i}` : $t(`cultivate.itemType.${i}`)
              }}<small v-if="moraleConsumption[i]" class="mdui-m-l-2"
                >{{ $t('common.morale') }} {{ moraleText(moraleConsumption[i]) }}</small
              ></h2
            >
          </div>
          <transition-group
            class="material-group-wrap"
            tag="div"
            name="material-group-wrap-transition"
            @before-leave="$root.transitionBeforeLeave"
            @after-leave="$root.transitionAfterLeaveBeforeEnter"
            @before-enter="$root.transitionAfterLeaveBeforeEnter"
          >
            <!-- 材料卡片 -->
            <div
              v-for="material in materialTypeGroup[i]"
              :key="material.name"
              v-show="showMaterials[i].has(material.name)"
              class="mdui-card material"
              :name="material.name"
              :rare="material.rare"
              :class="{
                'mdui-p-b-2': $root.smallScreen,
                'mdui-m-b-2 mdui-m-r-2': !$root.smallScreen,
                'opacity-5':
                  setting.translucentEnough && hasInput && autoGaps[material.name][0] == 0,
                highlight: highlight[material.name],
              }"
            >
              <div class="card-triangle" v-theme-class="color[material.rare]"></div>
              <div
                class="mdui-card-header"
                :mdui-tooltip="
                  $root.smallScreen
                    ? false
                    : `{content:'${formulaTooltips[material.name]}',position:'top'}`
                "
              >
                <!-- 图片 -->
                <div
                  class="mdui-card-header-avatar mdui-valign pointer no-sl"
                  @click="showDropDetail(materialTable[material.name])"
                >
                  <DataImg class="material-image no-pe" type="item" :name="material.name" />
                </div>
                <!-- 材料名 -->
                <div
                  class="mdui-card-header-title no-sl"
                  v-theme-class="inputs[material.name].need > 0 ? $root.color.pinkText : []"
                >
                  <div class="material-name-wrap mdui-valign">
                    <div class="mdui-text-truncate material-name">{{
                      $t(`material.${material.name}`)
                    }}</div>
                    <button
                      v-if="showSyntBtn(material) && getSynthesizeMaxTimes(material.name) > 1"
                      v-longpress="() => customSynthesize(material.name)"
                      @click="synthesize(material.name)"
                      @contextmenu.prevent="customSynthesize(material.name)"
                      class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
                      v-theme-class="$root.color.pinkText"
                      >{{ $t('common.synthesize') }}
                      {{
                        getSynthesizeMaxTimes(material.name) * syntProdNum(material.name)
                      }}</button
                    >
                    <button
                      v-if="showSyntBtn(material)"
                      v-longpress="() => customSynthesize(material.name)"
                      @click="synthesize(material.name, 1)"
                      @contextmenu.prevent="customSynthesize(material.name)"
                      class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
                      v-theme-class="$root.color.pinkText"
                      >{{ $t('common.synthesize') }} {{ syntProdNum(material.name) }}</button
                    >
                  </div>
                  <p
                    v-if="$root.smallScreen"
                    class="material-made-of mdui-m-y-0 mdui-text-color-theme-disabled mdui-text-truncate"
                    >{{ formulaTooltips[material.name] }}</p
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
                  <div v-if="setting.showExcessNum && excessNum[material.name]" class="gap">
                    <label class="mdui-textfield-label no-sl">{{ $t('common.excess') }}</label>
                    <span class="gap-num no-sl mdui-text-color-green-a700">{{
                      excessNum[material.name]
                    }}</span>
                  </div>
                  <div v-else class="gap">
                    <label class="mdui-textfield-label no-sl">{{ $t('common.lack') }}</label>
                    <span class="gap-num no-sl"
                      >{{ num10k(autoGaps[material.name][0])
                      }}<small v-if="autoGaps[material.name][1] > 0"
                        >({{ num10k(autoGaps[material.name][1]) }})</small
                      ></span
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
                      <span class="code">{{
                        code === 'synt' ? $t('common.synthesize') : code
                      }}</span>
                      <span
                        v-if="setting.showDropProbability && plannerInited"
                        class="probability"
                        v-theme-class="color[enumOccPer[occPer]]"
                        >{{
                          expectAP
                            ? 1000 > expectAP
                              ? expectAP.toPrecision(3)
                              : expectAP.toFixed()
                            : 'N/A'
                        }}⚡</span
                      >
                      <span v-else class="probability" v-theme-class="color[enumOccPer[occPer]]">{{
                        $t(`cultivate.occPer.${enumOccPer[occPer]}`)
                      }}</span>
                    </li>
                  </ul>
                  <div
                    class="drop-list-more"
                    v-show="
                      $root.smallScreen && $_.size(displayDropListByServer[material.name]) > 2
                    "
                    >></div
                  >
                  <!-- /掉落信息 -->
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
            <!-- 占位 -->
            <div
              class="material"
              :class="{ 'mdui-m-r-2': !$root.smallScreen }"
              v-for="pIndex in 2"
              :key="pIndex"
            ></div>
            <!-- /材料卡片 -->
          </transition-group>
        </div>
      </transition-group>
      <!-- /正常模式 -->
    </div>
    <!-- /材料 -->
    <!-- 预设设置 -->
    <mdui-dialog
      id="preset-setting"
      class="mdui-card"
      ref="presetDialog"
      @closed="selectedPresetName = ''"
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
          <template v-if="sp.skills.elite.length">
            <div class="preset-hr"></div>
            <div
              class="skill-elite cb-with-num-select"
              v-for="(skill, i) in sp.skills.elite"
              :key="`se-${skill.name}`"
              v-show="isSkillReleased(skill)"
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
              <mdui-checkbox
                v-model="pSetting.uniequip[id][0]"
                class="mdui-p-r-2"
                @change="
                  val =>
                    !$root.isImplementedUniequip(id) &&
                    !val &&
                    $nextTick($refs.presetDialog.handleUpdate)
                "
                >{{ $t(`uniequip.${id}`) }}</mdui-checkbox
              >
              <div
                v-show="
                  $root.isImplementedGradedUniequip ||
                  pSetting.uniequip[id][1] !== 0 ||
                  pSetting.uniequip[id][2] !== 1
                "
                class="num-select inline-block"
              >
                <mdui-select-num
                  v-model="pSetting.uniequip[id][1]"
                  :options="$_.range(cost.length)"
                  @change="
                    $mutationNextTick();
                    pSetting.uniequip[id][0] = true;
                    if (pSetting.uniequip[id][1] >= pSetting.uniequip[id][2])
                      pSetting.uniequip[id][2] = pSetting.uniequip[id][1] + 1;
                  "
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
      <div class="mdui-dialog-actions">
        <a
          v-if="sp"
          class="mdui-btn mdui-ripple float-left"
          v-theme-class="$root.color.dialogTransparentBtn"
          @click="
            $root.openWikiHref({ name: selectedPresetName, ...characterTable[selectedPresetName] })
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
          @click="addPreset"
          >{{ $t('common.add') }}</button
        >
        <button
          v-show="this.pSetting?.state == 'edit'"
          class="mdui-btn mdui-ripple"
          v-theme-class="['mdui-color-teal', 'mdui-color-teal-200 mdui-ripple-black']"
          mdui-dialog-confirm
          @click="editPreset"
          >{{ $t('common.edit') }}</button
        >
      </div>
    </mdui-dialog>
    <!-- /预设设置 -->
    <!-- Planner -->
    <mdui-dialog
      id="planner"
      class="mdui-typo"
      ref="plannerDialog"
      @closed="plannerRequest = false"
    >
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
            >&nbsp;&nbsp;(<span
              v-theme-class="['mdui-text-color-yellow-900', 'mdui-text-color-yellow-300']"
              >{{ $t('item.AP_GAMEPLAY') }}</span
            >)&nbsp;&nbsp;{{ $t('cultivate.dropDetail.apEfficiency') }}&nbsp;&nbsp;<span
              class="mdui-text-color-theme-secondary"
              >{{ $t('cultivate.dropDetail.sampleNum') }}</span
            >&nbsp;&nbsp;|&nbsp;&nbsp;<span class="mdui-text-color-theme mdui-btn-bold">{{
              $t('cultivate.planner.targetMaterial')
            }}</span
            >&nbsp;&nbsp;<span class="mdui-text-color-theme-secondary">{{
              $t('cultivate.planner.otherMaterial')
            }}</span>
          </p>
          <PlanSetting
            v-if="plannerShowMiniSetting"
            id="planner-mini-setting"
            class="mdui-dialog-content mdui-m-t-2"
            :setting="setting"
            :is-penguin-data-supported-server="isPenguinDataSupportedServer"
          />
        </div>
        <div class="mdui-dialog-content">
          <div class="stage" v-for="stage in plan.stages" :key="stage.code">
            <h5 class="stage-title h-ul">
              <span class="stage-code"
                ><span v-theme-class="['mdui-text-color-blue-900', 'mdui-text-color-blue-200']">{{
                  stage.code
                }}</span>
                × <span v-theme-class="$root.color.pinkText">{{ stage.times }}</span
                >&nbsp;&nbsp;(<span
                  v-theme-class="['mdui-text-color-yellow-900', 'mdui-text-color-yellow-200']"
                  >{{ stage.cost }}</span
                >)</span
              >
              <small class="stage-efficiency mdui-text-color-theme-text">{{
                stageEfficiency[stage.code] ? toPercent(stageEfficiency[stage.code]) : '-'
              }}</small>
              <small class="stage-sample-num mdui-text-color-theme-secondary">{{
                stage.sampleNum
              }}</small>
              <small
                v-if="stage.code in stageFromNameIdTable"
                class="from-name mdui-text-color-theme-secondary mdui-text-truncate"
                >{{ $t(`zone.${stageFromNameIdTable[stage.code]}`) }}</small
              >
            </h5>
            <div class="num-item-list">
              <arkn-num-item
                v-for="drop in stage.drops"
                :key="`${stage.code}-${drop.name}`"
                v-show="$root.isImplementedMaterial(drop.name)"
                :class="{ 'highlight-bg': highlight[drop.name] && hlGaps[drop.name][0] }"
                :img="drop.name"
                :lable="$t(`material.${drop.name}`)"
                :num="drop.num"
                :color="
                  gaps[drop.name][0] > 0
                    ? 'mdui-text-color-theme mdui-btn-bold'
                    : 'mdui-text-color-theme-secondary'
                "
              />
              <arkn-num-item
                img="4001"
                :lable="$t('item.4001')"
                :num="num100k(stage.money)"
                color="mdui-text-color-theme-secondary"
              />
              <arkn-num-item
                v-if="stage.cardExp > 0"
                img="2001"
                :lable="$t('common.exp')"
                :num="num100k(stage.cardExp)"
                color="mdui-text-color-theme-secondary"
              />
              <!-- 占位 -->
              <div class="num-item" v-for="i in 4" :key="i"></div>
            </div>
          </div>
          <div class="stage" v-if="plan.synthesis.length > 0">
            <h5 class="h-ul">{{ $t('cultivate.planner.needToBeSynthesized') }}</h5>
            <div class="num-item-list">
              <arkn-num-item
                v-for="m in plan.synthesis"
                :key="`synt-${m.name}`"
                :class="{ 'highlight-bg': highlight[m.name] && hlGaps[m.name][0] }"
                :img="m.name"
                :lable="$t(`material.${m.name}`)"
                :num="m.num"
              />
              <arkn-num-item
                img="4001"
                :lable="$t('cultivate.planner.moneyUsed')"
                :num="num100k(plan.synthesisCost)"
              />
              <!-- 占位 -->
              <div class="num-item" v-for="i in 4" :key="i"></div>
            </div>
          </div>
          <div class="stage">
            <h5 class="h-ul">{{ $t('cultivate.planner.obtain') }}</h5>
            <div class="num-item-list">
              <arkn-num-item img="4001" :lable="$t('item.4001')" :num="num100k(plan.money)" />
              <arkn-num-item
                v-if="plan.cardExp > 0"
                img="2001"
                :lable="$t('common.exp')"
                :num="num100k(plan.cardExp)"
              />
              <!-- 占位 -->
              <div class="num-item" v-for="i in 4" :key="i"></div>
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button
          class="mdui-btn mdui-ripple float-left"
          v-theme-class="
            plannerShowMiniSetting ? $root.color.pinkBtn : $root.color.dialogTransparentBtn
          "
          @click="
            plannerShowMiniSetting = !plannerShowMiniSetting;
            $nextTick(() => $refs.plannerDialog.handleUpdate());
          "
          ><i class="mdui-icon material-icons">settings</i></button
        >
        <button
          class="mdui-btn mdui-ripple"
          v-theme-class="$root.color.dialogTransparentBtn"
          mdui-dialog-cancel
          >{{ $t('common.close') }}</button
        >
      </div>
    </mdui-dialog>
    <!-- /Planner -->
    <!-- 关卡掉落详情 -->
    <mdui-dialog
      id="drop-detail"
      class="mdui-typo"
      ref="dropDialog"
      @closed="
        dropFocus = '';
        dropDetails = null;
      "
    >
      <template v-if="dropFocus && dropDetails">
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
              v-if="showSyntBtn(materialTable[dropFocus]) && getSynthesizeMaxTimes(dropFocus) > 1"
              v-longpress="() => customSynthesize(dropFocus)"
              @click="synthesize(dropFocus)"
              @contextmenu.prevent="customSynthesize(dropFocus)"
              class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
              v-theme-class="$root.color.pinkText"
              >{{ $t('common.synthesize') }} {{ getSynthesizeMaxTimes(dropFocus) }}</button
            >
            <button
              v-if="showSyntBtn(materialTable[dropFocus])"
              v-longpress="() => customSynthesize(dropFocus)"
              @click="synthesize(dropFocus, 1)"
              @contextmenu.prevent="customSynthesize(dropFocus)"
              class="synt-btn mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-p-x-1 mdui-m-l-05"
              v-theme-class="$root.color.pinkText"
              >{{ $t('common.synthesize') }} 1</button
            >
          </span>
          <div class="mdui-text-color-theme-secondary text-10px">{{
            formulaTooltips[dropFocus]
          }}</div>
          <div
            v-if="materialsCharMap[dropFocus] && materialsCharMap[dropFocus].size > 0"
            class="mdui-text-color-theme-secondary text-10px"
            >{{ $t('cultivate.dropDetail.relatedOperators') }}：<span
              v-for="char in materialsCharMap[dropFocus]"
              :key="`mater_${char}`"
              class="mdui-m-r-1"
              >{{ $t(`character.${char}`) }}</span
            ></div
          >
          <p v-if="dropDetails.length > 0" class="mdui-m-b-0 mdui-m-t-1 text-16px"
            >{{ $t('common.stage') }} | {{ $t('cultivate.dropDetail.expectedAP') }}⚡ |
            {{ $t('cultivate.dropDetail.apEfficiency') }} |
            <span class="mdui-text-color-theme-secondary">{{
              $t('cultivate.dropDetail.sampleNum')
            }}</span></p
          >
        </div>
        <div class="mdui-dialog-content mdui-p-b-0">
          <div class="stage" v-for="dropDetail in dropDetails" :key="`dd-${dropDetail.code}`">
            <h5 class="stage-title h-ul">
              <span class="stage-code">{{ dropDetail.code }}</span>
              <code class="stage-expect-ap"
                >{{
                  $_.round(dropInfo.expectAP[dropFocus][dropDetail.code], 1).toPrecision(3)
                }}⚡</code
              >
              <small class="stage-efficiency mdui-text-color-theme-text">{{
                stageEfficiency[dropDetail.code] ? toPercent(stageEfficiency[dropDetail.code]) : '-'
              }}</small>
              <small class="stage-sample-num mdui-text-color-theme-secondary">{{
                dropDetail.sampleNum
              }}</small>
              <small
                v-if="dropDetail.code in stageFromNameIdTable"
                class="from-name mdui-text-color-theme-secondary mdui-text-truncate"
                >{{ $t(`zone.${stageFromNameIdTable[dropDetail.code]}`) }}</small
              >
            </h5>
            <div class="num-item-list">
              <arkn-num-item
                v-for="drop in dropDetail.drops"
                :key="`detail-${dropDetail.code}-${drop[0]}`"
                v-show="$root.isImplementedMaterial(drop[0])"
                :img="drop[0]"
                :lable="$t(`material.${drop[0]}`)"
                :num="dropDetail.showByNum ? drop[1] : $_.round(drop[1] * 100, 2) + '%'"
                :color="
                  dropFocus == drop[0]
                    ? 'mdui-text-color-theme mdui-btn-bold'
                    : 'mdui-text-color-theme-secondary'
                "
              />
              <arkn-num-item
                v-for="drop in dropDetail.dropBrs"
                :key="`detail-${dropDetail.code}-${drop[0]}`"
                :img="drop[0]"
                :lable="$t(`item.${drop[0]}`)"
                :num="$_.round(drop[1] * 100, 2) + '%'"
                color="mdui-text-color-theme-secondary"
              />
              <!-- 占位 -->
              <div class="num-item" v-for="i in 4" :key="i"></div>
            </div>
          </div>
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
    </mdui-dialog>
    <!-- /关卡掉落详情 -->
    <!-- 云端数据同步 -->
    <mdui-dialog id="data-sync" class="mdui-typo" ref="dataSyncDialog">
      <div class="mdui-dialog-title">{{ $t('cultivate.panel.sync.cloudSync') }}</div>
      <div class="mdui-dialog-content mdui-p-b-0">
        <h5 class="mdui-m-t-0">{{ $t('cultivate.panel.sync.cloudBackup') }}</h5>
        <div class="mdui-valign-bottom space-8" :class="{ processing: dataSyncing }">
          <button
            class="mdui-btn mdui-ripple"
            v-theme-class="['mdui-color-green-600', 'mdui-color-green-300 mdui-ripple-black']"
            @click="cloudSaveData()"
            ><i class="mdui-icon material-icons mdui-icon-left">cloud_upload</i
            >{{ $t('common.backup') }}</button
          >
          <button
            class="mdui-btn mdui-ripple"
            v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-300 mdui-ripple-black']"
            @click="cloudRestoreData"
            :disabled="!syncCode"
            ><i class="mdui-icon material-icons mdui-icon-left">cloud_download</i
            >{{ $t('common.restore') }}</button
          >
          <mdui-switch v-model="setting.autoSyncUpload" :disabled="!syncCode">{{
            $t('cultivate.panel.sync.autoSyncUpload')
          }}</mdui-switch>
        </div>
        <table id="sync-options" class="thin-table mdui-m-b-2" style="width: 100%">
          <tbody>
            <tr>
              <td>
                <div class="mdui-textfield">
                  <label class="mdui-textfield-label">{{
                    $t('cultivate.panel.sync.syncCode')
                  }}</label>
                  <input
                    class="mdui-textfield-input"
                    type="text"
                    v-model.trim="syncCode"
                    :disabled="dataSyncing"
                  />
                </div>
              </td>
              <td class="va-bottom" width="1">
                <button
                  class="mdui-btn mdui-ripple"
                  v-theme-class="['mdui-text-color-pink-accent', 'mdui-text-color-indigo-a100']"
                  style="min-width: unset"
                  :disabled="!syncCode"
                  @click="copySyncCode"
                  >{{ $t('common.copy') }}</button
                >
              </td>
            </tr>
            <tr>
              <td class="mdui-p-t-1">
                <div class="mdui-textfield">
                  <label class="mdui-textfield-label">{{
                    $t('cultivate.panel.sync.apiKey')
                  }}</label>
                  <input
                    class="mdui-textfield-input"
                    type="text"
                    v-model.trim="syncApiKey"
                    :disabled="dataSyncing"
                    placeholder="noaccount"
                  />
                </div>
              </td>
              <td class="va-bottom" width="1">
                <button
                  class="mdui-btn mdui-ripple"
                  v-theme-class="['mdui-text-color-pink-accent', 'mdui-text-color-indigo-a100']"
                  style="min-width: unset"
                  :disabled="!syncApiKey"
                  @click="copySyncApiKey"
                  >{{ $t('common.copy') }}</button
                >
              </td>
            </tr>
          </tbody>
        </table>
        <p>{{ $t('cultivate.panel.sync.cloudSyncReadme') }}</p>
        <p>{{ $t('cultivate.panel.sync.apiKeyReadme') }}</p>
        <p>{{ $t('cultivate.panel.sync.autoSyncUploadTip') }}</p>
        <p
          >Powered by
          <a href="https://extendsclass.com/json-storage.html" target="_blank">ExtendsClass</a>.</p
        >
        <div class="mdui-divider mdui-m-y-2"></div>
        <h5 class="mdui-m-t-0">{{ $t('cultivate.panel.sync.localBackup') }}</h5>
        <div class="mdui-m-b-1 space-8">
          <button
            class="mdui-btn"
            v-theme-class="['mdui-color-green-600', 'mdui-color-green-300']"
            @click="saveData"
            ><i class="mdui-icon material-icons mdui-icon-left">file_upload</i
            >{{ $t('common.backup') }}</button
          >
          <button
            class="mdui-btn"
            v-theme-class="['mdui-color-blue-600', 'mdui-color-blue-300']"
            @click="restoreData"
            ><i class="mdui-icon material-icons mdui-icon-left">file_download</i
            >{{ $t('common.restore') }}</button
          >
        </div>
        <p>{{ $t('cultivate.panel.sync.localBackupReadme') }}</p>
      </div>
      <div class="mdui-dialog-actions">
        <button
          class="mdui-btn mdui-ripple"
          v-theme-class="$root.color.dialogTransparentBtn"
          mdui-dialog-cancel
          >{{ $t('common.close') }}</button
        >
      </div>
    </mdui-dialog>
    <!-- /云端数据同步 -->
    <!-- 预设待办 -->
    <preset-todo-dialog
      ref="presetTodoDialog"
      :constants="presetConstants"
      :highlight.sync="highlightCost"
    />
    <!-- 刷图设置 -->
    <plan-setting-dialog
      ref="planSettingDialog"
      @open-stage-select="$refs.stageSelectDialog.open()"
    />
    <!-- 刷图关卡选择 -->
    <stage-select-dialog
      ref="stageSelectDialog"
      @change="list => (setting.planStageBlacklist = list)"
      @closed="$refs.planSettingDialog.open()"
    />
    <!-- JSON 导入确认 -->
    <ImportConfirmDialog
      ref="importConfirmDialog"
      @import="
        ({ items, clear }) => {
          if (clear) reset('have', false, false);
          importItems(items);
        }
      "
    />
    <!-- 多账号管理 -->
    <AccountManageDialog
      ref="accountManageDialog"
      :account-list="accountList"
      @deleteAccount="deleteAccount"
      @changeServer="
        ({ id, server }) => {
          if (id === curAccount.id && server) $root.server = server;
        }
      "
    />
  </div>
</template>

<script src="./index.js"></script>

<style lang="scss" src="./index.scss"></style>
