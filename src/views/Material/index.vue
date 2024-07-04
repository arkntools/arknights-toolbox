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
                  :autocomplete-filter-duplicates="false"
                  :placeholder="$t('cultivate.panel.preset.placeholder')"
                  autocomplete="off"
                  class="tags-input"
                  :class="{ empty: preset.length === 0 }"
                  @tags-changed="usePreset"
                  @before-adding-tag="showPresetBeforeAddTag"
                >
                  <div
                    slot="autocomplete-item"
                    slot-scope="props"
                    @click="props.performAdd(props.item)"
                    class="mdui-list-item mdui-p-y-0 mdui-p-x-1"
                  >
                    <div class="mdui-list-item-avatar lh-0"
                      ><Avatar
                        v-if="preset"
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
                      :class="{ 'opacity-5': !$root.isReleasedChar(char.name) }"
                      @click="$refs.presetTodoDialog.open({ tag: char, index })"
                    >
                      <Avatar class="mdui-chip-icon" :name="char.name" />
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
                <div class="btn-group">
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-left"
                    v-theme-class="$root.color.blueBtn"
                    mdui-menu="{ target: '#material-import-menu', covered: false }"
                    ><i class="mdui-icon material-icons mdui-icon-left">archive</i
                    >{{ $t('common.import') }}</button
                  >
                  <button
                    class="mdui-btn mdui-ripple mdui-btn-dense tag-btn btn-group-right no-grow"
                    v-theme-class="$root.color.blueBtn"
                    @click="$refs.sklandSettingDialog.open()"
                    ><i class="mdui-icon material-icons">settings</i></button
                  >
                  <ul id="material-import-menu" class="mdui-menu">
                    <li class="mdui-menu-item mdui-ripple">
                      <a class="mdui-ripple pointer" @click="restoreData">{{
                        $t('common.restore')
                      }}</a>
                    </li>
                    <li class="mdui-menu-item mdui-ripple">
                      <a class="mdui-ripple pointer" @click="importFromJSON">{{
                        $t('cultivate.panel.button.importFromJSON')
                      }}</a>
                    </li>
                    <li v-if="$root.serverCN" class="mdui-menu-item mdui-ripple">
                      <a class="mdui-ripple pointer" @click="importFromSkland">{{
                        $t('cultivate.panel.button.importFromSkland')
                      }}</a>
                    </li>
                  </ul>
                </div>
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="$root.color.blueBtn"
                  mdui-menu="{ target: '#material-export-menu', covered: false }"
                  ><i class="mdui-icon material-icons mdui-icon-left">unarchive</i
                  >{{ $t('common.export') }}</button
                >
                <ul id="material-export-menu" class="mdui-menu">
                  <li class="mdui-menu-item mdui-ripple">
                    <a class="mdui-ripple pointer" @click="saveData">{{ $t('common.backup') }}</a>
                  </li>
                  <li class="mdui-menu-item mdui-ripple">
                    <a
                      v-if="$root.serverCN"
                      class="mdui-ripple pointer"
                      @click="exportToArkLights"
                      >{{ $t('cultivate.panel.button.exportToArkLights') }}</a
                    >
                  </li>
                </ul>
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
            <!-- 功能 -->
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
                <!-- 艾丽妮专精计算器 -->
                <button
                  class="mdui-btn mdui-ripple mdui-btn-dense tag-btn"
                  v-theme-class="['mdui-color-purple', 'mdui-color-purple-a100 mdui-ripple-black']"
                  @click="$refs.ireneCalcDialog.open()"
                  >{{ $t('ireneCalc.title') }}</button
                >
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
              <div class="mdui-card-header mdui-p-b-05" :name="materialName">
                <!-- 图片 -->
                <div
                  class="mdui-card-header-avatar mdui-valign pointer no-sl"
                  @click="showDropDetail(materialTable[materialName])"
                >
                  <DataImg
                    class="material-image"
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
                      v-if="
                        setting.showExcessNum &&
                        !(materialName in highlightCost) &&
                        excessNum[materialName]
                      "
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
              <!-- 合成按钮 -->
              <div class="mdui-container-fluid">
                <div v-if="!showSyntBtn(materialTable[materialName])" class="mdui-row-xs-1">
                  <button
                    class="mdui-btn mdui-btn-dense small-btn mdui-btn-block mdui-btn-transparent"
                    disabled
                  >
                    <i class="mdui-icon material-icons mdui-typo-subheading">gavel</i>
                    <i class="mdui-icon material-icons mdui-typo-subheading">block</i>
                  </button>
                </div>
                <div v-else class="mdui-row-xs-2 mdui-row-gapless">
                  <div class="mdui-col">
                    <button
                      v-if="
                        showSyntBtn(materialTable[materialName]) &&
                        getSynthesizeMaxTimes(materialName) > 1
                      "
                      v-longpress="() => customSynthesize(materialName)"
                      @click="synthesize(materialName)"
                      @contextmenu.prevent="customSynthesize(materialName)"
                      class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-btn-block mdui-p-a-0"
                      v-theme-class="$root.color.pinkText"
                      ><i class="mdui-icon material-icons mdui-typo-subheading">gavel</i>
                      {{ getSynthesizeMaxTimes(materialName) * syntProdNum(materialName) }}</button
                    >
                  </div>
                  <div class="mdui-col">
                    <button
                      v-if="showSyntBtn(materialTable[materialName])"
                      v-longpress="() => customSynthesize(materialName)"
                      @click="synthesize(materialName, 1)"
                      @contextmenu.prevent="customSynthesize(materialName)"
                      class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-btn-block mdui-p-a-0"
                      v-theme-class="$root.color.pinkText"
                      ><i class="mdui-icon material-icons mdui-typo-subheading">gavel</i>
                      {{ syntProdNum(materialName) }}</button
                    >
                  </div>
                </div>
              </div>
            </div>
            <!-- /合成按钮 -->
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
                  <DataImg class="material-image" type="item" :name="material.name" />
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
                  <div
                    v-if="
                      setting.showExcessNum &&
                      !(material.name in highlightCost) &&
                      excessNum[material.name]
                    "
                    class="gap"
                  >
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
    <LazyDialog ref="presetDialog" :component="dialogs.PresetSettingDialog" />
    <!-- Planner -->
    <LazyDialog ref="plannerDialog" :component="dialogs.PlannerDialog" />
    <!-- 关卡掉落详情 -->
    <LazyDialog
      ref="dropDialog"
      :component="dialogs.DropDialog"
      @full-closed="
        dropFocus = '';
        dropDetails = null;
      "
    />
    <!-- 云端数据同步 -->
    <LazyDialog ref="dataSyncDialog" :component="dialogs.DataSyncDialog" />
    <!-- 预设待办 -->
    <LazyDialog
      ref="presetTodoDialog"
      :component="dialogs.PresetTodoDialog"
      :constants="presetConstants"
      :highlight.sync="highlightCost"
    />
    <!-- 刷图设置 -->
    <LazyDialog
      ref="planSettingDialog"
      :component="dialogs.PlanSettingDialog"
      @open-stage-select="$refs.stageSelectDialog.open()"
    />
    <!-- 刷图关卡选择 -->
    <LazyDialog
      ref="stageSelectDialog"
      :component="dialogs.StageSelectDialog"
      @change="list => (setting.planStageBlacklist = list)"
      @closed="$refs.planSettingDialog.open()"
    />
    <!-- JSON 导入确认 -->
    <LazyDialog
      ref="importConfirmDialog"
      :component="dialogs.ImportConfirmDialog"
      @import="
        ({ items, clear }) => {
          if (clear) reset('have', false, false);
          importItems(items);
        }
      "
    />
    <!-- 多账号管理 -->
    <LazyDialog
      ref="accountManageDialog"
      :component="dialogs.AccountManageDialog"
      :account-list="accountList"
      @deleteAccount="deleteAccount"
      @changeServer="
        ({ id, server }) => {
          if (id === curAccount.id && server) $root.server = server;
        }
      "
    />
    <!-- 艾丽妮专精计算器 -->
    <LazyDialog ref="ireneCalcDialog" :component="dialogs.IreneCalculatorDialog" />
    <!-- 森空岛设置 -->
    <LazyDialog ref="sklandSettingDialog" :component="dialogs.SklandSettingDialog" />
  </div>
</template>

<script src="./index.js"></script>

<style lang="scss" src="./index.scss"></style>
