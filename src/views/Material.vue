<template>
  <div id="arkn-material">
    <div class="mdui-row">
      <!-- 选项 -->
      <div :class="{ 'mdui-col-lg-6': $root.localeCN, 'mdui-col-xs-12': $root.localeNotCN }">
        <table class="mdui-table tag-table">
          <tbody>
            <tr>
              <td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn tag-table-header">{{$t('cultivate.panel.rarity')}}</button></td>
              <td>
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{$t('cultivate.panel.rarity')}}</label>
                <button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn ' + (allRare ? color.selected : color.notSelected)" @click="selected.rare = l.fill(Array(selected.rare.length), !allRare)">{{$t('common.selectAll')}}</button>
                <tag-button v-for="i in 5" :key="`rare-${rareNum + 1 - i}`" v-model="selected.rare[rareNum - i]" :notSelectedColor="color.notSelected" :selectedColor="color[rareNum + 1 - i]">&nbsp;{{ rareNum + 1 - i }}&nbsp;</tag-button>
                <button class="mdui-btn mdui-btn-dense mdui-color-red tag-btn" @click="selected.rare = l.concat([false], l.fill(Array(rareNum - 1), true))">{{$t('common.reset')}}</button>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn tag-table-header">{{$t('common.preset')}}</button></td>
              <td>
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{$t('common.preset')}}</label>
                <!-- 预设 -->
                <vue-tags-input id="preset" ref="presetInput" v-model="preset" :tags="selected.presets" :allow-edit-tags="false" :add-from-paste="false" :add-on-blur="false" :autocomplete-items="presetItems" :add-only-from-autocomplete="true" :autocomplete-always-open="true" :placeholder="$t('cultivate.panel.preset.placeholder')" autocomplete="off" :class="`tags-input${preset.length === 0 ? ' empty' : ''}`" @tags-changed="usePreset" @before-adding-tag="obj => showPreset(obj)">
                  <div slot="autocomplete-item" slot-scope="props" @click="props.performAdd(props.item)" class="mdui-list-item mdui-p-y-0 mdui-p-x-1">
                    <div class="mdui-list-item-avatar"><img class="no-pe" :key="`head-${props.item.text}`" :src="$root.avatar(props.item.name)" crossorigin="anonymous" /></div>
                    <div class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">{{ props.item.text }}</div>
                  </div>
                  <span class="no-sl" slot="tag-center" slot-scope="props" @click="showPreset(props, true)">{{ props.tag.text }}</span>
                </vue-tags-input>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn tag-table-header">{{$t('common.setting')}}</button></td>
              <td>
                <mdui-switch v-for="key in settingList[0]" :key="key" v-model="setting[key]">{{$t(`cultivate.setting.${key}`)}}</mdui-switch>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn tag-table-header">{{$t('common.option')}}</button></td>
              <td>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset()">{{$t('cultivate.panel.button.resetAll')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('need')">{{$t('cultivate.panel.button.resetNeed')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('have')">{{$t('cultivate.panel.button.resetHave')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-blue-600 tag-btn" @click="dataSyncDialog.open()"><i class="mdui-icon material-icons">cloud</i> {{$t('cultivate.panel.button.cloudSync')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-pink tag-btn" @click="resetPenguinData">{{$t('cultivate.panel.button.forceUpdate')}}</button>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn tag-table-header">{{$t('common.calculation')}}</button></td>
              <td>
                <button id="ark-planner-btn" class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-purple tag-btn mdui-m-r-2" :disabled="apbDisabled" @click="apbDisabled = true; initPlanner().then(() => { showPlan(); apbDisabled = false; });">{{$t('cultivate.panel.button.farmCalculation')}}</button>
                <mdui-switch v-for="key in settingList[1]" :key="key" v-model="setting[key]">{{$t(`cultivate.setting.${key}`)}}</mdui-switch>
                <mdui-switch v-if="$root.localeCN" v-model="setting.planIncludeEvent">{{$t('cultivate.setting.planIncludeEvent')}}</mdui-switch>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- /选项 -->
      <!-- 说明 -->
      <div :class="{ 'mdui-col-lg-6': $root.localeCN, 'mdui-col-xs-12': $root.localeNotCN }">
        <material-readme v-if="$root.localeCN" class="mdui-hidden-md-down" />
        <div class="mdui-panel mdui-panel-gapless mdui-m-t-2" :class="{ 'mdui-hidden-lg-up': $root.localeCN }" mdui-panel>
          <div class="mdui-panel-item">
            <div class="mdui-panel-item-header">
              <div class="mdui-panel-item-title">{{$t('common.guide')}}</div>
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
        <transition-group class="material-group-wrap" tag="div" name="material-group-wrap-transition" @before-leave="transitionBeforeLeave" @after-leave="transitionAfterLeave">
          <!-- 素材卡片 -->
          <div :class="$root.smallScreen ? 'mdui-col-xs-6 material-simple-wrap' : 'inline-block'" v-for="materialName in materialsOrder" :key="`${materialName}-simple`" v-show="showMaterialsFlatten.includes(materialName) && $root.isImplementedMaterial(materialName)">
            <div :class="`mdui-card ${$root.smallScreen ? 'mdui-center' : 'mdui-m-r-2'} mdui-m-b-2 material material-simple${setting.translucentDisplay && hasInput && gaps[materialName][0] == 0 ? ' opacity-5' : ''}`">
              <div :class="`card-triangle-small ${color[materialsTable[materialName].rare]}`"></div>
              <div class="mdui-card-header" :name="materialName">
                <!-- 图片 -->
                <div :class="`mdui-card-header-avatar mdui-valign no-sl ${l.size(materialsTable[materialName].drop) > 0 ? 'pointer' : ''}`" @click="l.size(materialsTable[materialName].drop) > 0 ? showDropDetail(materialsTable[materialName]) : false">
                  <arkn-item-t :t="materialsTable[materialName].rare" />
                  <img class="material-image no-pe" :src="$root.materialImage(materialsTable[materialName].name)" crossorigin="anonymous" />
                  <div class="material-simple-name mdui-text-truncate" :class="{ 'mdui-text-color-pink-accent': inputs[materialName].need > 0 }">{{ $t(`material.${materialName}`) }}</div>
                </div>
                <!-- 输入面板 -->
                <div>
                  <mdui-number-input class="block mdui-m-b-1" :class="{ 'small-ph': $root.localeNot(['zh', 'ja']) }" v-model="inputs[materialName].need" :placeholder="$t('common.need')"></mdui-number-input>
                  <mdui-number-input class="block mdui-m-b-1" :class="{ 'small-ph': $root.localeNot(['zh', 'ja']) }" v-model="inputs[materialName].have" :placeholder="$t('common.have')"></mdui-number-input>
                  <div class="gap block">
                    <span class="gap-num no-sl">{{ gaps[materialName][0] }}<small v-if="gaps[materialName][1] > 0">({{ gaps[materialName][1] }})</small></span>
                  </div>
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
          </div>
          <!-- /素材卡片 -->
        </transition-group>
      </div>
      <!-- /简洁模式 -->
      <!-- 正常模式 -->
      <transition-group v-else id="material-normal" tag="div" name="material-group-wrap-transition" @before-leave="transitionBeforeLeave" @after-leave="transitionAfterLeave">
        <div class="mdui-col-xs-12" v-for="i in rareNum" :key="`materials-${i}`" v-show="showMaterials[rareNum + 1 - i].length > 0">
          <div class="mdui-typo rare-title">
            <h2>{{$t('common.rarity')}} {{ rareNum + 1 - i }}</h2>
          </div>
          <transition-group class="material-group-wrap" tag="div" name="material-group-wrap-transition" @before-leave="transitionBeforeLeave" @after-leave="transitionAfterLeave">
            <!-- 素材卡片 -->
            <div v-for="material in materials[rareNum + 1 - i]" :key="material.name" v-show="showMaterials[rareNum + 1 - i].includes(material.name) && $root.isImplementedMaterial(material.name)" :class="`mdui-card ${$root.smallScreen ? 'mdui-p-b-2' : 'mdui-m-b-2 mdui-m-r-2'} material${setting.translucentDisplay && hasInput && gaps[material.name][0] == 0 ? ' opacity-5' : ''}`">
              <div :class="`card-triangle ${color[rareNum + 1 - i]}`"></div>
              <div class="mdui-card-header" :name="material.name" :mdui-tooltip="$root.smallScreen ? false : `{content:'${madeofTooltips[material.name]}',position:'top'}`">
                <!-- 图片 -->
                <div class="mdui-card-header-avatar mdui-valign no-sl">
                  <arkn-item-t :t="rareNum + 1 - i" />
                  <img class="material-image no-pe" :src="$root.materialImage(material.name)" crossorigin="anonymous" />
                </div>
                <!-- 材料名 -->
                <div class="mdui-card-header-title no-sl" :class="{ 'mdui-text-color-pink-accent': inputs[material.name].need > 0 }">
                  <auto-scale-text :key="`${$t(`material.${material.name}`)}-${calcMaterialNameTextWidth(material)}`" :max-width="calcMaterialNameTextWidth(material)">{{ $t(`material.${material.name}`) }}</auto-scale-text>
                  <button v-if="synthesizable[material.name] && gaps[material.name][1] > 0" @click="synthesize(material.name)" class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-text-color-pink-accent mdui-p-x-1 mdui-m-l-05">{{$t('common.synthesize')}}</button>
                  <p v-if="$root.smallScreen" class="mdui-m-y-0 mdui-text-color-theme-disabled mdui-text-truncate" style="font-size:12px;font-weight:400">{{ madeofTooltips[material.name] }}</p>
                </div>
                <!-- 输入面板 -->
                <div :class="$root.smallScreen ? false : 'mdui-m-t-1'">
                  <mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].need">{{$t('common.need')}}</mdui-number-input>
                  <mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].have">{{$t('common.have')}}</mdui-number-input>
                  <div class="gap">
                    <label class="mdui-textfield-label no-sl">{{$t('common.lack')}}</label>
                    <span class="gap-num no-sl">{{ gaps[material.name][0] }}<small v-if="gaps[material.name][1] > 0">({{ gaps[material.name][1] }})</small></span>
                  </div>
                  <!-- 掉落信息 -->
                  <ul class="drop-list no-sl pointer" :length="l.size(dropListByServer[material.name])" v-if="l.size(dropListByServer[material.name]) > 0" @click="showDropDetail(material)">
                    <li class="drop" v-for="(probability, code) in dropListByServer[material.name]" :key="`${material.name}-${code}`">
                      <span class="code">{{ code }}</span>
                      <span v-if="setting.showDropProbability && plannerInited" :class="`probability ${color[enumOccPer[probability]]}`">
                        <template v-if="dropTable[code]">
                          <span v-if="dropInfo.expectAP[material.name][code] < 1000">{{ dropInfo.expectAP[material.name][code].toPrecision(3) }}⚡</span>
                          <span v-else>{{ dropInfo.expectAP[material.name][code].toFixed() }}⚡</span>
                        </template>
                        <span v-else :class="`show-0${dropTable[code] ? ' opacity-0' : ''}`">N/A</span>
                      </span>
                      <span v-else :class="`probability ${color[enumOccPer[probability]]}`">{{ $t(`cultivate.occPer.${enumOccPer[probability]}`) }}</span>
                    </li>
                  </ul>
                  <div class="drop-list-more" v-show="$root.smallScreen && l.size(dropListByServer[material.name]) > 2">></div>
                  <!-- /掉落信息 -->
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
            <!-- /素材卡片 -->
          </transition-group>
        </div>
      </transition-group>
      <!-- /正常模式 -->
    </div>
    <!-- 预设设置 -->
    <div id="preset-setting" class="mdui-dialog mdui-card">
      <template v-if="sp">
        <div class="mdui-card-header mdui-p-b-0">
          <img class="mdui-card-header-avatar no-pe" :src="selectedPresetName ? $root.avatar(selectedPresetName) : false" crossorigin="anonymous" />
          <div class="mdui-card-header-title">{{ $t(`character.${selectedPresetName}`) }}</div>
        </div>
        <div class="mdui-card-content preset-list mdui-p-x-3">
          <div class="elite-cb-list">
            <mdui-checkbox v-for="(o, i) in sp.evolve" :key="`elite-${i + 1}`" v-model="pSetting.evolve[i]">{{$t('common.promotion')}}{{ i + 1 }}</mdui-checkbox>
          </div>
          <div class="skill-normal" v-if="sp.skills.normal.length >= 2">
            <mdui-checkbox v-model="pSetting.skills.normal[0]" class="skill-cb">{{$t('common.skill')}}</mdui-checkbox>
            <div class="inline-block">
              <mdui-select-num v-model="pSetting.skills.normal[1]" :options="l.range(1, sp.skills.normal.length + 1)" @change="$mutationNextTick(); if (pSetting.skills.normal[1] >= pSetting.skills.normal[2]) pSetting.skills.normal[2] = pSetting.skills.normal[1] + 1;"></mdui-select-num>
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <span :key="`sn-s-${pSetting.skills.normal[1] + 1}`">
                <mdui-select-num v-model="pSetting.skills.normal[2]" :options="l.range(pSetting.skills.normal[1] + 1, sp.skills.normal.length + 2)"></mdui-select-num>
              </span>
            </div>
          </div>
          <template v-if="sp.skills.elite.length > 0">
            <div class="skill-elite" v-for="(skill, i) in sp.skills.elite" :key="`se-${skill.name}`">
              <mdui-checkbox v-model="pSetting.skills.elite[i][0]" class="skill-cb">{{ $t(`skill.${skill.name}`) }}</mdui-checkbox>
              <div class="inline-block">
                <mdui-select-num v-model="pSetting.skills.elite[i][1]" :options="l.range(sp.skills.normal.length + 1, sp.skills.normal.length + skill.cost.length + 1)" @change="$mutationNextTick(); if (pSetting.skills.elite[i][1] >= pSetting.skills.elite[i][2]) pSetting.skills.elite[i][2] = pSetting.skills.elite[i][1] + 1;"></mdui-select-num>
                <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
                <span :key="`se-s-${pSetting.skills.elite[i][1] + 1}`">
                  <mdui-select-num v-model="pSetting.skills.elite[i][2]" :options="l.range(pSetting.skills.elite[i][1] + 1, sp.skills.normal.length + skill.cost.length + 2)"></mdui-select-num>
                </span>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('common.cancel')}}</button>
        <button v-if="this.pSetting.state == 'add'" class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-confirm @click="addPreset">{{$t('common.add')}}</button>
        <button v-if="this.pSetting.state == 'edit'" class="mdui-btn mdui-ripple mdui-color-teal" mdui-dialog-confirm @click="editPreset">{{$t('common.edit')}}</button>
      </div>
    </div>
    <!-- /预设设置 -->
    <!-- Planner -->
    <div id="planner" class="mdui-dialog mdui-typo">
      <template v-if="plannerRequest && plan">
        <div class="mdui-dialog-title">
          {{$t('cultivate.planner.title')}}
          <p class="mdui-m-b-0 mdui-m-t-2" style="font-size:15px">
            {{$t('cultivate.planner.expectedAP')}}<code>{{ plan.cost }}</code><br />
            <span class="mdui-text-color-blue-900">{{$t('common.mission')}}</span> × <span class="mdui-text-color-pink-accent">{{$t('common.times')}}</span>&nbsp;&nbsp;(<span class="mdui-text-color-yellow-900">{{$t('item.AP_GAMEPLAY')}}</span>)&nbsp;&nbsp;<span class="mdui-text-color-theme blod-text">{{$t('cultivate.planner.targetMaterial')}}</span>&nbsp;&nbsp;<span style="color:rgba(0,0,0,.7);">{{$t('cultivate.planner.otherMaterial')}}</span>
          </p>
        </div>
        <div class="mdui-dialog-content">
          <div class="stage" v-for="stage in plan.stages" :key="stage.code">
            <h5 class="h-ul">
              <span class="mdui-text-color-blue-900">{{ stage.code }}</span> × <span class="mdui-text-color-pink-accent">{{ stage.times }}</span>&nbsp;&nbsp;(<span class="mdui-text-color-yellow-900">{{ stage.cost }}</span>)
            </h5>
            <div class="num-item-list">
              <arkn-num-item v-for="drop in stage.drops" :key="`${stage.code}-${drop.name}`" v-show="$root.isImplementedMaterial(drop.name)" :t="materialsTable[drop.name].rare" :img="drop.name" :lable="$t(`material.${drop.name}`)" :num="drop.num" :color="gaps[drop.name][0] > 0 ? 'mdui-text-color-theme blod-text' : false" />
              <arkn-num-item t="4" img="G-4-1" :lable="$t('item.4001')" :num="num10k(stage.money)" />
              <arkn-num-item v-if="stage.cardExp > 0" t="5" img="E-5-1" :lable="$t('common.exp')" :num="num10k(stage.cardExp)" />
            </div>
          </div>
          <div class="stage" v-if="plan.synthesis.length > 0">
            <h5 class="h-ul">{{$t('cultivate.planner.needToBeSynthesized')}}</h5>
            <div class="num-item-list">
              <arkn-num-item v-for="m in plan.synthesis" :key="`合成-${m.name}`" :t="materialsTable[m.name].rare" :img="m.name" :lable="$t(`material.${m.name}`)" :num="m.num" />
              <arkn-num-item t="4" img="G-4-1" :lable="$t('cultivate.planner.moneyUsed')" :num="num10k(plan.synthesisCost)" />
            </div>
          </div>
          <div class="stage">
            <h5 class="h-ul">{{$t('cultivate.planner.obtain')}}</h5>
            <div class="num-item-list">
              <arkn-num-item t="4" img="G-4-1" :lable="$t('item.4001')" :num="num10k(plan.money)" />
              <arkn-num-item v-if="plan.cardExp > 0" t="5" img="E-5-1" :lable="$t('common.exp')" :num="num10k(plan.cardExp)" />
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('common.close')}}</button>
      </div>
    </div>
    <!-- /Planner -->
    <!-- 关卡掉落详情 -->
    <div id="drop-detail" class="mdui-dialog mdui-typo">
      <template v-if="dropDetails">
        <div class="mdui-dialog-title mdui-p-b-1">
          {{ $t(`material.${dropFocus}`) }}
          <p class="mdui-m-b-0 mdui-m-t-1" style="font-size:16px">{{$t('common.mission')}} | {{$t('cultivate.dropDetail.expectedAP')}}⚡ | ${{$t('cultivate.dropDetail.costPerformanceOfMission')}}</p>
        </div>
        <div class="mdui-dialog-content mdui-p-b-0">
          <div class="stage" v-for="dropDetail in dropDetails" :key="`dd-${dropDetail.code}`">
            <h5 class="h-ul">
              {{ dropDetail.code }}&nbsp;&nbsp;<code>{{ l.round(dropInfo.expectAP[dropFocus][dropDetail.code], 1).toPrecision(3) }}⚡</code>&nbsp;&nbsp;<code>${{ dropInfo.stageValue[dropDetail.code].toPrecision(4) }}</code>
            </h5>
            <div class="num-item-list">
              <arkn-num-item v-for="drop in dropDetail.drops" :key="`detail-${dropDetail.code}-${drop[0]}`" v-show="$root.isImplementedMaterial(drop[0])" :t="materialsTable[drop[0]].rare" :img="drop[0]" :lable="$t(`material.${drop[0]}`)" :num="l.round(drop[1] * 100, 2) + '%'" :color="dropFocus == drop[0] ? 'mdui-text-color-theme blod-text' : false" />
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('common.close')}}</button>
      </div>
    </div>
    <!-- /关卡掉落详情 -->
    <!-- 云端数据同步 -->
    <div id="data-sync" class="mdui-dialog mdui-typo">
      <div class="mdui-dialog-title">{{$t('cultivate.panel.sync.cloudSync')}}</div>
      <div class="mdui-dialog-content mdui-p-b-0">
        <h5 class="mdui-m-t-0">{{$t('cultivate.panel.sync.cloudBackup')}}</h5>
        <div class="mdui-valign-bottom mdui-m-b-1 space-8" :class="{ 'processing': dataSyncing }">
          <button class="mdui-btn mdui-ripple mdui-color-green-600 tag-btn" @click="cloudSaveData()"><i class="mdui-icon material-icons">cloud_upload</i> {{$t('common.backup')}}</button>
          <button class="mdui-btn mdui-ripple mdui-color-blue-600 tag-btn" @click="cloudRestoreData" :disabled="!setting.syncCode"><i class="mdui-icon material-icons">cloud_download</i> {{$t('common.restore')}}</button>
          <div id="sync-code" class="mdui-textfield mdui-m-r-1">
            <input class="mdui-textfield-input" type="text" v-model.trim="setting.syncCode" :placeholder="$t('cultivate.panel.sync.syncCode')" />
          </div>
          <mdui-switch v-model="setting.autoSyncUpload" :disabled="!setting.syncCode">{{$t('cultivate.panel.sync.autoSyncUpload')}}</mdui-switch>
        </div>
        <p>{{$t('cultivate.panel.sync.cloudSyncReadme')}}</p>
        <p>{{$t('cultivate.panel.sync.autoSyncUploadTip')}}</p>
        <p>Powered by <a href="http://myjson.com/" target="_blank">myjson</a>.</p>
        <div class="mdui-divider mdui-m-y-2"></div>
        <h5 class="mdui-m-t-0">{{$t('cultivate.panel.sync.localBackup')}}</h5>
        <div class="mdui-m-b-2">
          <button class="mdui-btn mdui-ripple mdui-color-green-600 tag-btn" @click="saveData"><i class="mdui-icon material-icons">file_upload</i> {{$t('common.backup')}}</button>
          <button class="mdui-btn mdui-ripple mdui-color-blue-600 tag-btn" @click="restoreData"><i class="mdui-icon material-icons">file_download</i> {{$t('common.restore')}}</button>
        </div>
        <p>{{$t('cultivate.panel.sync.localBackupReadme')}}</p>
      </div>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('common.close')}}</button>
      </div>
    </div>
    <!-- /云端数据同步 -->
  </div>
</template>

<script>
import ArknNumItem from '../components/ArknNumItem';
import ArknItemT from '../components/ArknItemT';
import MaterialReadme from '../components/MaterialReadme';
// import VueTagsInput from '@johmun/vue-tags-input';
import AutoScaleText from '../components/AutoScaleText';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import Ajax from '../utils/ajax';
import linprog from 'javascript-lp-solver/src/solver';
import md5 from 'md5';

import character from '../data/character.json';
import cultivate from '../data/cultivate.json';
import material from '../data/item.json';
import unopenedStage from '../data/unopenedStage.json';

const materialsList = _.transform(
  material,
  (arr, val, key) => {
    val.name = key;
    arr.push(val);
  },
  []
);

const enumOccPer = {
  0: 'ALWAYS',
  1: 'ALMOST',
  2: 'USUAL',
  3: 'OFTEN',
  4: 'SOMETIMES',
};
Object.freeze(enumOccPer);

const penguinURL =
  'https://penguin-stats.io/PenguinStats/api/result/matrix?show_stage_details=true&show_item_details=true';

const penguinDataExpireDays = 7;

const dropTableOtherFields = ['cost', 'event', 'cardExp'];

const pSettingInit = {
  evolve: [false, false],
  skills: {
    normal: [false, 1, 7],
    elite: [
      [false, 7, 10],
      [false, 7, 10],
      [false, 7, 10],
    ],
  },
  state: 'add',
};

const min0 = x => (x < 0 ? 0 : x);

export default {
  name: 'arkn-material',
  components: {
    // VueTagsInput,
    MaterialReadme,
    ArknNumItem,
    ArknItemT,
    AutoScaleText,
  },
  data: () => ({
    l: _,
    showAll: false,
    enumOccPer,
    materials: materialsList,
    materialsList,
    materialsTable: material,
    materialsOrder: _.sortBy(_.clone(materialsList), 'sortId').map(({ name }) => name),
    charTable: character,
    elite: cultivate,
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
      stopSynthetiseLE3: false,
      showDropProbability: false,
      planIncludeEvent: true,
      planCardExpFirst: false,
      syncCode: '',
      autoSyncUpload: false,
    },
    settingList: [
      ['simpleMode', 'hideIrrelevant', 'translucentDisplay', 'stopSynthetiseLE3', 'showDropProbability'],
      ['planCardExpFirst'],
    ],
    color: {
      notSelected: 'mdui-color-brown-300',
      selected: 'mdui-color-grey-800',
      5: 'mdui-color-yellow-700',
      4: 'mdui-color-deep-purple-300',
      3: 'mdui-color-blue-600',
      2: 'mdui-color-lime',
      1: 'mdui-color-grey-700',
      ALWAYS: 'mdui-color-grey-900',
      ALMOST: 'mdui-color-grey-700',
      USUAL: 'mdui-color-grey-500',
      OFTEN: 'mdui-color-grey-300',
      SOMETIMES: 'mdui-color-red-900',
    },
    penguinData: {
      expire: 0,
      data: false,
    },
    plannerInited: false,
    dropTable: {},
    plannerRequest: false,
    plannerDialog: false,
    apbDisabled: false,
    dropDialog: false,
    dropDetails: false,
    dropFocus: '',
    dropInfo: {
      expectAP: {},
      stageValue: {},
    },
    synthesisTable: {
      le3: {},
      gt3: {},
    },
    materialConstraints: {},
    dataSyncDialog: false,
    dataSyncing: false,
    throttleAutoSyncUpload: null,
    ignoreInputsChange: false,
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
        if (this.setting.autoSyncUpload && this.setting.syncCode && this.throttleAutoSyncUpload) {
          if (this.ignoreInputsChange) this.ignoreInputsChange = false;
          else this.throttleAutoSyncUpload();
        }
      },
      deep: true,
    },
    'setting.showDropProbability': function(val) {
      if (val) this.initPlanner();
    },
    '$root.locale': function() {
      this.updatePreset();
    },
  },
  computed: {
    unopenedStages() {
      return unopenedStage[this.$root.locale];
    },
    dropTableByServer() {
      return _.omit(this.dropTable, this.unopenedStages);
    },
    dropListByServer() {
      return _.mapValues(this.materialsTable, ({ drop }) => _.omit(drop, this.unopenedStages));
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
      return _.transform(
        this.materialsList,
        (o, { name, madeof }) => {
          const text = [];
          _.forIn(madeof, (num, m) => text.push(`${this.$t(`material.${m}`)}*${num}`));
          o[name] = text.length > 0 ? `${text.join('、')}` : this.$t('common.cannotSynthesize');
        },
        {}
      );
    },
    synthesizable() {
      return _.transform(
        this.materialsList,
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
      _.forInRight(this.materials, (materials, i) => {
        for (const { name, madeof } of materials) {
          gaps[name] = min0(gaps[name] - inputs[name].have);
          if (this.setting.stopSynthetiseLE3 && i <= 3) continue;
          _.forIn(madeof, (num, m) => {
            gaps[m] += gaps[name] * num;
          });
        }
      });

      // 自底向上计算合成
      _.forIn(this.materials, (materials, i) => {
        for (const { name, madeof } of materials) {
          if (_.size(madeof) == 0 || (this.setting.stopSynthetiseLE3 && i <= 3)) continue;
          while (
            gaps[name] > 0 &&
            _.every(madeof, (num, mName) => this.inputsInt[mName].have + made[mName] - used[mName] - num >= 0)
          ) {
            gaps[name]--;
            made[name]++;
            _.forEach(madeof, (num, mName) => (used[mName] += num));
          }
        }
      });

      return _.mergeWith(gaps, made, (a, b) => [a, b]);
    },
    hasDataMaterials() {
      return _.mapValues(this.materials, materials => {
        const show = [];
        for (const { name } of materials) {
          if (this.inputsInt[name].need + this.inputsInt[name].have + this.gaps[name][0] + this.gaps[name][1] > 0)
            show.push(name);
        }
        return show;
      });
    },
    showMaterials() {
      const result = _.mapValues(this.materials, (materials, rareNum) => {
        const show = [];
        for (const { name } of materials) {
          if (
            this.inputsInt[name].need > 0 ||
            (this.inputsInt[name].need == 0 &&
              this.selected.rare[rareNum - 1] &&
              (this.hasDataMaterials[rareNum].includes(name) ||
                (!this.hasDataMaterials[rareNum].includes(name) && !(this.setting.hideIrrelevant && this.hasInput))))
          )
            show.push(name);
        }
        return show;
      });

      return result;
    },
    showMaterialsFlatten() {
      return _.transform(
        this.materials,
        (showMaterials, materials, rareNum) => {
          for (const { name } of materials) {
            if (
              this.inputsInt[name].need > 0 ||
              (this.inputsInt[name].need == 0 &&
                this.selected.rare[rareNum - 1] &&
                (this.hasDataMaterials[rareNum].includes(name) ||
                  (!this.hasDataMaterials[rareNum].includes(name) && !(this.setting.hideIrrelevant && this.hasInput))))
            ) {
              showMaterials.push(name);
            }
          }
        },
        []
      );
    },
    hasInput() {
      let sum = 0;
      for (let i = 1; i <= this.rareNum; i++) {
        sum += this.hasDataMaterials[i].length;
      }
      return sum;
    },
    presetItems() {
      const input = this.preset.toLowerCase().replace(/ /g, '');
      const result = [];
      for (const name in this.implementedElite) {
        const {
          pinyin: { full, head },
        } = this.charTable[name];
        const search = [
          full,
          head,
          this.$t(`character.${name}`)
            .toLowerCase()
            .replace(/ /g, ''),
        ].map(v => v.indexOf(input));
        if (_.every(search, s => s === -1)) continue;
        result.push({
          pos: _.min(search.filter(v => v >= 0)),
          name,
        });
      }
      result.sort((a, b) => (a.pos == b.pos ? a.name.length - b.name.length : a.pos - b.pos));
      return _.map(result, o => ({ name: o.name, text: this.$t(`character.${o.name}`) })).slice(0, 10);
    },
    sp() {
      if (this.selectedPresetName.length === 0) return false;
      return this.elite[this.selectedPresetName];
    },
    checkPSetting() {
      const ps = this.pSetting;
      const check = [...ps.evolve, ps.skills.normal[0], ..._.map(ps.skills.elite, a => a[0])];
      return _.sum(check) > 0;
    },
    plan() {
      if (!this.plannerInited) return false;

      // 线性规划模型
      const useVariables = [
        this.$root.localeCN && this.setting.planIncludeEvent
          ? this.dropTableByServer
          : _.omitBy(this.dropTableByServer, o => o.event),
        this.synthesisTable.gt3,
      ];
      if (!this.setting.stopSynthetiseLE3) useVariables.push(this.synthesisTable.le3);
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
            let t = this.materialsTable[b.name].rare - this.materialsTable[a.name].rare;
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
          synthesisCost += (this.materialsTable[name].rare - 1) * 100 * v;
          r.push({
            name,
            num: _.round(v, 1),
          });
        },
        []
      );
      synthesis.sort((a, b) => {
        let t = this.materialsTable[b.name].rare - this.materialsTable[a.name].rare;
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
    synthesize(name) {
      if (!this.synthesizable[name]) return;
      const times = this.gaps[name][1];
      const { madeof } = this.materialsTable[name];
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
        _.each(this.elite[this.selectedPresetName].skills.elite, ({ cost }, i) => {
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
      this.selected.presets.forEach(p => (p.text = this.$t(`character.${p.name}`)));
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
        this.copyDialogInputText,
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
      if (this.setting.syncCode) {
        Ajax.updateMyjson(this.setting.syncCode, obj)
          .then(() => {
            this.dataSyncing = false;
            snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(() => {
            this.dataSyncing = false;
            snackbar(this.$t('cultivate.snackbar.backupFailed'));
          });
      } else {
        Ajax.createMyjson(obj)
          .then(({ uri }) => {
            this.dataSyncing = false;
            this.setting.syncCode = _.last(uri.split('/'));
            snackbar(this.$t('cultivate.snackbar.backupSucceeded'));
          })
          .catch(() => {
            this.dataSyncing = false;
            snackbar(this.$t('cultivate.snackbar.backupFailed'));
          });
      }
    },
    cloudRestoreData() {
      if (!this.setting.syncCode) return;
      this.dataSyncing = true;
      Ajax.getMyjson(this.setting.syncCode)
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
    },
    copyDialogInputText() {
      this.$$('.mdui-dialog-open input')[0].select();
      document.execCommand('copy');
      this.$snackbar(this.$t('cultivate.snackbar.copied'));
    },
    async initPlanner() {
      if (this.plannerInited) return;

      if (!this.penguinData.data || this.penguinData.expire < _.now()) {
        const tip = this.$snackbar({
          message: this.$t('cultivate.snackbar.penguinDataLoading'),
          timeout: 0,
          closeOnOutsideClick: false,
        });
        const data = await Ajax.get(penguinURL, true).catch(() => false);
        tip.close();
        if (data) {
          this.penguinData.data = data;
          this.penguinData.expire = _.now() + penguinDataExpireDays * 24 * 60 * 60 * 1000;
          localStorage.setItem('material.penguinData', JSON.stringify(this.penguinData));
        } else {
          if (this.penguinData.data) this.$snackbar(this.$t('cultivate.snackbar.penguinDataFallback'));
          else {
            this.$snackbar(this.$t('cultivate.snackbar.penguinDataFailed'));
            return;
          }
        }
      }

      const eap = this.dropInfo.expectAP;

      // 处理合成列表
      for (const { name, madeof, rare } of this.materialsList) {
        eap[name] = {};
        this.materialConstraints[name] = { min: 0 };
        if (_.size(madeof) == 0) continue;
        const product = {};
        product[name] = 1;
        this.synthesisTable[rare <= 3 ? 'le3' : 'gt3'][`合成-${name}`] = {
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
      for (const {
        item: { itemId, itemType },
        stage: { apCost, code, stageType },
        quantity,
        times,
      } of this.penguinData.data.matrix) {
        if (quantity === 0) continue;
        if (!(itemId in this.materialConstraints) && itemType !== 'CARD_EXP') continue;
        if (!this.dropTable[code]) this.dropTable[code] = { cost: apCost, event: stageType === 'ACTIVITY', cardExp: 0 };
        if (itemType === 'CARD_EXP') {
          this.dropTable[code].cardExp += (cardExp[itemId] * quantity) / times;
        } else {
          this.dropTable[code][itemId] = quantity / times;
          eap[itemId][code] = apCost / this.dropTable[code][itemId];
        }
      }

      // 最小期望理智，用于计算价值
      _.forEach(eap, eapm => (eapm.value = _.min(_.values(eapm)) || Infinity));

      // 计算实际价值
      _.forIn(this.materials, materials => {
        for (const { name, madeof } of materials) {
          if (_.size(madeof) == 0) continue;
          eap[name].value = Math.min(eap[name].value, _.sum(_.map(madeof, (num, mName) => num * eap[mName].value)));
        }
      });

      // 计算关卡性价比
      _.forEach(this.dropTable, (drop, code) => {
        this.dropInfo.stageValue[code] =
          _.sum(_.map(_.omit(drop, dropTableOtherFields), (p, n) => eap[n].value * p)) / drop.cost;
      });

      this.plannerInited = true;
    },
    showPlan() {
      if (this.plan.cost === 0) this.$alert('根本不需要计算啦~', () => {}, { confirmText: '好吧' });
      else {
        this.plannerRequest = true;
        this.$nextTick(() => this.plannerDialog.open());
      }
    },
    resetPenguinData() {
      localStorage.removeItem('material.penguinData');
      window.location.reload();
    },
    async showDropDetail({ name, drop }) {
      await this.initPlanner();
      this.dropDetails = [];
      this.dropFocus = name;
      for (const code in drop) {
        const stage = this.dropTable[code];
        const drops = _.toPairs(_.omit(stage, dropTableOtherFields)).sort((a, b) => {
          const s = this.materialsTable[b[0]].rare - this.materialsTable[a[0]].rare;
          if (s != 0) return s;
          return b[1] - a[1];
        });
        this.dropDetails.push({
          code,
          cost: stage.cost,
          drops,
        });
      }
      this.$nextTick(() => this.dropDialog.open());
    },
    transitionBeforeLeave(el) {
      el.style.top = `${el.offsetTop}px`;
      el.style.left = `${el.offsetLeft}px`;
    },
    transitionAfterLeave(el) {
      el.style.top = 'unset';
      el.style.left = 'unset';
    },
  },
  created() {
    for (const { name } of this.materials) {
      //this.materialList.push(name);
      this.$set(this.inputs, name, {
        need: '',
        have: '',
      });
    }

    this.materials = _.groupBy(this.materials, m => m.rare);

    this.selected.rare = _.concat([false], _.fill(Array(this.rareNum - 1), true));

    for (const key in localStorage) {
      if (!key.startsWith('material.')) continue;
      const thisKey = key.split('.')[1];
      if (thisKey === 'inputs') this.ignoreInputsChange = true;
      this[thisKey] = _.assign({}, this[thisKey], _.pick(JSON.parse(localStorage.getItem(key)), _.keys(this[thisKey])));
    }

    for (const name in this.inputs) {
      const material = this.inputs[name];
      for (const key in material) {
        if (material[key] == 0) material[key] = '';
      }
    }

    this.updatePreset();

    this.throttleAutoSyncUpload = _.throttle(() => this.cloudSaveData(true), 5000, { leading: false, trailing: true });
  },
  mounted() {
    this.presetDialog = new this.$Dialog('#preset-setting', { history: false });
    this.$$('#preset-setting').on('closed.mdui.dialog', () => (this.selectedPresetName = ''));
    this.plannerDialog = new this.$Dialog('#planner', { history: false });
    this.$$('#planner').on('closed.mdui.dialog', () => (this.plannerRequest = false));
    this.dropDialog = new this.$Dialog('#drop-detail', { history: false });
    this.dataSyncDialog = new this.$Dialog('#data-sync', { history: false });
    if (this.$root.materialListRendering) {
      setTimeout(() => {
        this.$root.materialListRendering = false;
      }, 700);
    }
  },
};
</script>

<style lang="scss">
#app:not(.mobile-screen) #arkn-material {
  .material-group-wrap {
    margin-right: -16px;
  }
  .drop-list[length='3'] {
    position: absolute;
    bottom: 10px;
  }
  .drop-list[length='4'] {
    position: absolute;
    bottom: 10px;
  }
  .drop-list[length='5'] {
    position: absolute;
    bottom: 3px;
  }
}
#arkn-material {
  #material-main {
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
  .elite-cb-list .mdui-checkbox:not(:first-child) {
    margin-left: 40px;
  }
  .skill-cb {
    min-width: 130px;
  }
  #preset {
    &.vue-tags-input {
      max-width: none;
      background-color: transparent;
    }
    .ti-tag {
      margin-left: 0;
      margin-right: 4px;
    }
    .ti-input {
      border: none;
      padding: 0;
      z-index: 30;
      position: relative;
      background-color: transparent;
      input {
        background-color: transparent;
      }
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
    }
  }
  .vue-tags-input.empty .ti-autocomplete {
    display: none;
  }
  .material {
    min-width: 275px;
    display: inline-block;
    &:not(.material-simple) {
      width: 375px;
    }
    .mdui-btn.small-btn {
      margin: -4px 0;
    }
    &,
    .mdui-card-header-title {
      // max-width: 160px;
      transition: all 0.3s;
    }
    .mdui-card-header {
      height: auto;
      padding-right: 0;
    }
    .mdui-card-header > div:not(.mdui-card-header-avatar) {
      margin-left: 92px;
    }
    .mdui-card-header-avatar {
      width: 80px;
      height: 80px;
      transform: scale(1.1);
      justify-content: center;
    }
    .mdui-card-header-avatar .material-image {
      transform: scale(0.44);
    }
    .mdui-card-header-title {
      font-size: 23px;
      padding: 3px 0;
    }
  }
  .material-simple,
  .material-simple-wrap {
    min-width: 165px;
  }
  .material-simple {
    .mdui-card-header-avatar {
      transform: scale(1);
    }
    .mdui-card-header {
      padding: 8px 16px 8px 8px;
    }
    .mdui-card-header-avatar {
      margin-top: -2px;
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
    li {
      list-style-type: none;
    }
  }
  .drop-list-more {
    position: absolute;
    left: 300px;
    top: 88px;
    transform: rotate(90deg) scaleY(2) scaleX(0.7);
  }
  .drop {
    padding-bottom: 1px;
  }
  .code {
    display: inline-block;
    width: 45px;
    text-align: right;
    padding-right: 4px;
  }
  .probability {
    padding: 3px 5px;
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
  @media screen and (max-width: 365px) {
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
      .mdui-textfield-label {
        width: 99px;
      }
    }
  }
  #data-sync {
    .tag-btn {
      padding: 0 14px;
    }
    #sync-code {
      display: inline-block;
      padding: 0;
      width: 100px;
    }
  }
  #material-normal,
  .material-group-wrap {
    position: relative;
    & > div {
      transition: all 0.5s;
    }
  }
  .material-group-wrap-transition-enter,
  .material-group-wrap-transition-leave-to {
    opacity: 0;
  }
  .material-group-wrap-transition-leave-active {
    position: absolute;
  }
  .material-group-wrap-transition-enter {
    transition-property: opacity !important;
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
}
.mobile-screen #arkn-material {
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
    .drop-list[length='3'],
    .drop-list[length='4'],
    .drop-list[length='5'] {
      overflow-y: auto;
      height: 42px;
      padding-right: 4px;
    }
  }
}
</style>
