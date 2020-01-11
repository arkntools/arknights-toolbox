<i18n>
{
  "zh": {
    "resetAll": "重置需求&已有",
    "simpleMode": "简洁模式",
    "hideIrrelevant": "隐藏无关素材",
    "translucentDisplay": "半透明显示已满足需求的素材",
    "stopSynthetiseLE3": "不计算稀有度3及以下材料的合成需求",
    "showDropProbability": "显示掉落概率(%)及期望理智(⚡)",
    "planIncludeEvent": "包括活动关卡",
    "planCardExpFirst": "需求狗粮",
    "presetPlaceholder": "输入干员中英文名/拼音/拼音首字母",
    "presetEmptyOption": "什么也没勾选呢……",
    "saveDataTitle": "导出备份",
    "saveDataLable": "请保存文本框中的所有内容",
    "restoreDataTitle": "导入备份",
    "restoreDataLable": "请在文本框中粘贴上次保存的内容",
    "copy2clipboard": "复制到剪贴板",
    "copied": "已复制",
    "imported": "导入成功",
    "importFailed": "导入失败，输入有误",
    "penguinDataLoading": "正在从企鹅物流加载/更新数据",
    "penguinDataFallback": "数据更新失败，使用旧数据进行计算",
    "penguinDataFailed": "数据加载失败，请检查网络连接",
    "cloudSyncReadme": "当同步码为空时，点击备份将会自动生成同步码，并将当前预设及材料需求已有数据备份到云端，在其他设备上的此处输入同步码便可方便地通过云端备份恢复数据。",
    "localBackupReadme": "旧的备份方式，每次都必须复制代码到其他设备恢复，可以用于临时备份。",
    "autoSyncUpload": "自动备份",
    "autoSyncUploadTip": "自动备份：每当材料输入变化时都会自动备份到云端（节流 3 秒），考虑到数据安全所以没有自动恢复，恢复需要自行点击。"
  },
  "en": {
    "simpleMode": "Thin Mode",
    "hideIrrelevant": "Hide Irrelevant Materials",
    "translucentDisplay": "Display translucently when a material is enough",
    "stopSynthetiseLE3": "Ignore Materials with a Rarity ≤ 3",
    "showDropProbability": "Show Drop Probability (%) and Expected Stamina Consumption (⚡)",
    "planIncludeEvent": "Include Event Mission (only avaliable for CN)",
    "planCardExpFirst": "Need More EXP Cards",
    "presetPlaceholder": "Type Name or Chinese Phonetic Alphabet of an Operator",
    "稀有": "Rarity",
    "稀有度": "Rare",
    "预设": "Preset",
    "计算": "Calculation",
    "resetAll": "Reset All",
    "重置需求": "Reset \"Need\"",
    "重置已有": "Reset \"Have\"",
    "强制更新掉落数据": "Update Data Manually",
    "我该刷什么图": "What Missions Should I Operate Repeatedly",
    "需求": "Need",
    "已有": "Have",
    "仍需": "Lack",
    "合成": "Synthesize",
    "关卡": "Mission",
    "期望理智": "Expected Stamina Consumption",
    "关卡性价比": "Cost Performance",
    "结果仅供参考": "Results Are for Reference Only",
    "预计消耗理智：": "Expected Stamina Consumption: ",
    "需求产物": "Target Material",
    "副产物": "Other Material",
    "需要合成": "Need to Synthesize",
    "总计获得": "Obtain",
    "精": "Elite ",
    "消耗龙门币": "Used Money",
    "狗粮经验值": "EXP",
    "合成需要：": "Made of: ",
    "无法合成": "Cannot be synthesized",
    "固定": "Fixed",
    "小概率": "Low",
    "中概率": "Med",
    "大概率": "High",
    "罕见": "Rare",
    "presetEmptyOption": "Noting selected",
    "saveDataTitle": "Backup",
    "saveDataLable": "Please save the code below",
    "restoreDataTitle": "Restore",
    "restoreDataLable": "Please paste code below",
    "copy2clipboard": "Copy to Clipboard",
    "copied": "Copied",
    "imported": "Imported",
    "importFailed": "Import failed, please check your code",
    "penguinDataLoading": "Loading data from penguin stats",
    "penguinDataFallback": "Loading failed, use old data instead",
    "penguinDataFailed": "Loading failed, please check your network",
    "cloudSyncReadme": "When the sync code is empty, clicking \"Backup\" will automatically generate a sync code and backup current preset and inputs to the cloud. Entering the sync code on other devices, then you can restore data through the cloud backup easily.",
    "localBackupReadme": "This is an old backup method which can be used for local temporary backup. Backup code must be copied for next restore every time.",
    "autoSyncUpload": "Auto Upload",
    "autoSyncUploadTip": "Auto Upload: Auto backup to cloud when inputs change (throttle 3s), but will not auto restore because of data security.",
    "云端数据同步": "Cloud Sync",
    "云端备份恢复": "Cloud Backup",
    "离线备份恢复": "Local Backup",
    "同步码": "Sync Code",
    "备份成功": "Backup succeeded",
    "备份失败": "Backup failed",
    "恢复成功": "Restore succeeded",
    "恢复失败": "Restore failed"
  }
}
</i18n>

<template>
  <div id="arkn-material">
    <div class="mdui-row">
      <!-- 选项 -->
      <div :class="{ 'mdui-col-lg-6': $root.localeCN }">
        <table class="mdui-table tag-table">
          <tbody>
            <tr>
              <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('稀有')}}</button></td>
              <td>
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{$t('稀有度')}}</label>
                <button :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn ' + (allRare ? color.selected : color.notSelected)" @click="selected.rare = l.fill(Array(selected.rare.length), !allRare)">{{$t('全选')}}</button>
                <tag-button v-for="i in 5" :key="`rare-${rareNum + 1 - i}`" v-model="selected.rare[rareNum - i]" :notSelectedColor="color.notSelected" :selectedColor="color[rareNum + 1 - i]">&nbsp;{{ rareNum + 1 - i }}&nbsp;</tag-button>
                <button class="mdui-btn mdui-btn-dense mdui-color-red tag-btn" @click="selected.rare = l.concat([false], l.fill(Array(rareNum - 1), true))">{{$t('重置')}}</button>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('预设')}}</button></td>
              <td>
                <label v-if="$root.smallScreen" class="mdui-textfield-label">{{$t('预设')}}</label>
                <!-- 预设 -->
                <vue-tags-input id="preset" ref="presetInput" v-model="preset" :tags="selected.presets" :allow-edit-tags="false" :add-from-paste="false" :add-on-blur="false" :autocomplete-items="presetItems" :add-only-from-autocomplete="true" :autocomplete-always-open="true" :placeholder="$t('presetPlaceholder')" autocomplete="off" :class="`tags-input${preset.length === 0 ? ' empty' : ''}`" @tags-changed="usePreset" @before-adding-tag="obj => showPreset(obj)">
                  <div slot="autocomplete-item" slot-scope="props" @click="props.performAdd(props.item)" class="mdui-list-item mdui-p-y-0 mdui-p-x-1">
                    <div class="mdui-list-item-avatar"><img class="no-pe" :key="`head-${props.item.text}`" :src="$root.avatar(charTable[props.item.name])" crossorigin="anonymous" /></div>
                    <div class="mdui-list-item-content mdui-p-y-0 mdui-m-l-1">{{ props.item.text }}</div>
                  </div>
                  <span class="no-sl" slot="tag-center" slot-scope="props" @click="showPreset(props, true)">{{ props.tag.text }}</span>
                </vue-tags-input>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('选项')}}</button></td>
              <td>
                <mdui-switch v-for="key in settingList[0]" :key="key" v-model="setting[key]">{{$t(key)}}</mdui-switch>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('操作')}}</button></td>
              <td>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset()">{{$t('resetAll')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('need')">{{$t('重置需求')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-red tag-btn" @click="reset('have')">{{$t('重置已有')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-blue-600 tag-btn" @click="dataSyncDialog.open()"><i class="mdui-icon material-icons">cloud</i> {{$t('云端数据同步')}}</button>
                <button class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-pink tag-btn" @click="resetPenguinData">{{$t('强制更新掉落数据')}}</button>
              </td>
            </tr>
            <tr>
              <td v-if="!$root.smallScreen" width="1" class="mdui-text-right"><button class="mdui-btn mdui-btn-dense mdui-color-teal no-pe tag-btn">{{$t('计算')}}</button></td>
              <td>
                <button id="ark-planner-btn" class="mdui-btn mdui-ripple mdui-btn-dense mdui-color-purple tag-btn mdui-m-r-2" :disabled="apbDisabled" @click="apbDisabled = true; initPlanner().then(() => { showPlan(); apbDisabled = false; });">{{$t('我该刷什么图')}}</button>
                <mdui-switch v-for="key in settingList[1]" :key="key" v-model="setting[key]">{{$t(key)}}</mdui-switch>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- /选项 -->
      <!-- 说明 -->
      <div :class="{ 'mdui-col-lg-6': $root.localeCN }">
        <material-readme v-if="$root.localeCN" class="mdui-hidden-md-down" />
        <div class="mdui-panel mdui-panel-gapless mdui-m-t-2" :class="{ 'mdui-hidden-lg-up': $root.localeCN }" mdui-panel>
          <div class="mdui-panel-item">
            <div class="mdui-panel-item-header">
              <div class="mdui-panel-item-title">{{$t('说明')}}</div>
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
    <div class="mdui-row">
      <!-- 简洁模式 -->
      <div id="material-simple" class="mdui-col-xs-12 mdui-m-t-4" v-if="setting.simpleMode">
        <div class="material-group-wrap">
          <!-- 素材卡片 -->
          <div :class="$root.smallScreen ? 'mdui-col-xs-6 material-simple-wrap' : 'inline-block'" v-for="materialName in materialsOrder" :key="materialName + '-simple'" v-show="showMaterialsFlatten.includes(materialName)">
            <div :class="`mdui-card ${$root.smallScreen ? 'mdui-center' : 'mdui-m-r-2'} mdui-m-b-2 material material-simple${setting.translucentDisplay && hasInput && gaps[materialName][0] == 0 ? ' opacity-5' : ''}`">
              <div :class="`card-triangle-small ${color[materialsTable[materialName].rare]}`"></div>
              <div class="mdui-card-header" :name="materialName">
                <!-- 图片 -->
                <div :class="`mdui-card-header-avatar mdui-valign no-sl ${l.size(materialsTable[materialName].source) > 0 ? 'pointer' : ''}`" @click="l.size(materialsTable[materialName].source) > 0 ? showDropDetail(materialsTable[materialName]) : false">
                  <arkn-item-t :t="materialsTable[materialName].rare" />
                  <img class="material-image no-pe" :src="$root.materialImage(materialsTable[materialName].img)" crossorigin="anonymous" />
                  <div :class="`material-simple-name${inputs[materialName].need > 0 ? ' mdui-text-color-pink-accent' : ''}`">{{ materialName }}</div>
                </div>
                <!-- 输入面板 -->
                <div>
                  <mdui-number-input class="block mdui-m-b-1" :class="{ 'small-ph': $root.localeEN }" v-model="inputs[materialName].need" :placeholder="$t('需求')"></mdui-number-input>
                  <mdui-number-input class="block mdui-m-b-1" :class="{ 'small-ph': $root.localeEN }" v-model="inputs[materialName].have" :placeholder="$t('已有')"></mdui-number-input>
                  <div class="gap block">
                    <span class="gap-num no-sl">{{ gaps[materialName][0] }}<small v-if="gaps[materialName][1] > 0">({{ gaps[materialName][1] }})</small></span>
                  </div>
                </div>
                <!-- /输入面板 -->
              </div>
            </div>
          </div>
          <!-- /素材卡片 -->
        </div>
      </div>
      <!-- /简洁模式 -->
      <!-- 正常模式 -->
      <div id="material-normal" class="mdui-col-xs-12" v-else v-for="i in rareNum" :key="`materials-${i}`" v-show="showMaterials[rareNum + 1 - i].length > 0">
        <div class="mdui-typo rare-title">
          <h2>{{$t('稀有度')}} {{ rareNum + 1 - i }}</h2>
        </div>
        <div class="material-group-wrap">
          <!-- 素材卡片 -->
          <div v-for="material in materials[rareNum + 1 - i]" :key="material.name" v-show="showMaterials[rareNum + 1 - i].includes(material.name)" :class="`mdui-card${$root.smallScreen ? '' : ' mdui-m-r-2'} mdui-m-b-2 material${setting.translucentDisplay && hasInput && gaps[material.name][0] == 0 ? ' opacity-5' : ''}`">
            <div :class="`card-triangle ${color[rareNum + 1 - i]}`"></div>
            <div class="mdui-card-header" :name="material.name" :mdui-tooltip="$root.isMobile() ? false : `{content:'${$t('合成需要：')}${madeofTooltips[material.name]}',position:'top'}`">
              <!-- 图片 -->
              <div class="mdui-card-header-avatar mdui-valign no-sl">
                <arkn-item-t :t="rareNum + 1 - i" />
                <img class="material-image no-pe" :src="$root.materialImage(material.img)" crossorigin="anonymous" />
              </div>
              <!-- 材料名 -->
              <div :class="`mdui-card-header-title no-sl${inputs[material.name].need > 0 ? ' mdui-text-color-pink-accent' : ''}`">
                {{ material.name }}
                <button v-if="synthesizable[material.name]" @click="synthesize(material.name)" class="mdui-btn mdui-ripple mdui-btn-dense small-btn mdui-text-color-pink-accent mdui-p-x-1">{{$t('合成')}}</button>
                <p v-if="$root.isMobile()" class="mdui-m-y-0 mdui-text-color-black-disabled" style="font-size:12px;font-weight:400">{{ madeofTooltips[material.name] }}</p>
              </div>
              <!-- 输入面板 -->
              <div :class="$root.isMobile() ? false : 'mdui-m-t-1'">
                <mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].need">{{$t('需求')}}</mdui-number-input>
                <mdui-number-input class="mdui-m-r-1" v-model="inputs[material.name].have">{{$t('已有')}}</mdui-number-input>
                <div class="gap">
                  <label class="mdui-textfield-label no-sl">{{$t('仍需')}}</label>
                  <span class="gap-num no-sl">{{ gaps[material.name][0] }}<small v-if="gaps[material.name][1] > 0">({{ gaps[material.name][1] }})</small></span>
                </div>
                <!-- 掉落信息 -->
                <ul class="source-list no-sl pointer" :length="l.size(material.source)" v-if="l.size(material.source) > 0" @click="showDropDetail(material)">
                  <li class="source" v-for="(probability, code) in material.source" :key="`${material.name}-${code}`">
                    <span class="code">{{ code }}</span>
                    <span v-if="setting.showDropProbability && plannerInited && showDPFlag" :class="`probability with-show ${color[probability]}`">
                      <span :class="`show-0${dropTable[code] ? ' opacity-0' : ''}`" v-html="'&nbsp;&nbsp;N/A&nbsp;&nbsp;'"></span>
                      <template v-if="dropTable[code]">
                        <span class="show-1">{{ l.padEnd(l.round(dropTable[code][material.name] * 100, 1).toPrecision(3), 5, '&nbsp;') }}%</span>
                        <span class="show-2" v-if="dropInfo.expectAP[material.name][code] < 1000">{{ dropInfo.expectAP[material.name][code].toPrecision(3) }}⚡</span>
                        <span class="show-2" v-else>{{ dropInfo.expectAP[material.name][code].toFixed() }}⚡</span>
                      </template>
                    </span>
                    <span v-else :class="`probability ${color[probability]}`">{{ $t(probability) }}</span>
                  </li>
                </ul>
                <!-- /掉落信息 -->
              </div>
              <!-- /输入面板 -->
            </div>
          </div>
          <!-- /素材卡片 -->
        </div>
      </div>
      <!-- /正常模式 -->
    </div>
    <!-- 详细信息 -->
    <div id="preset-setting" class="mdui-dialog mdui-card">
      <template v-if="sp">
        <div class="mdui-card-header mdui-p-b-0">
          <img class="mdui-card-header-avatar no-pe" :src="charTable[selectedPresetName] ? $root.avatar(charTable[selectedPresetName]) : false" crossorigin="anonymous" />
          <div class="mdui-card-header-title">{{ $t('operatorName', charTable[selectedPresetName]) }}</div>
        </div>
        <div class="mdui-card-content preset-list mdui-p-x-3">
          <div class="elite-cb-list">
            <mdui-checkbox v-for="(o, i) in sp.elites" :key="`elite-${i + 1}`" v-model="pSetting.elites[i]">{{$t('精')}}{{ i + 1 }}</mdui-checkbox>
          </div>
          <div class="skill-normal" v-if="sp.skills.normal.length >= 2">
            <mdui-checkbox v-model="pSetting.skills.normal[0]" class="skill-cb">{{$t('技能')}}</mdui-checkbox>
            <div class="inline-block">
              <mdui-select-num v-model="pSetting.skills.normal[1]" :options="l.range(1, sp.skills.normal.length + 1)" @change="$root.mutation(); if (pSetting.skills.normal[1] >= pSetting.skills.normal[2]) pSetting.skills.normal[2] = pSetting.skills.normal[1] + 1;"></mdui-select-num>
              <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
              <span :key="`sn-s-${pSetting.skills.normal[1] + 1}`">
                <mdui-select-num v-model="pSetting.skills.normal[2]" :options="l.range(pSetting.skills.normal[1] + 1, sp.skills.normal.length + 2)"></mdui-select-num>
              </span>
            </div>
          </div>
          <template v-if="sp.skills.elite.length > 0">
            <div class="skill-elite" v-for="(skill, i) in sp.skills.elite" :key="`se-${skill.name}`">
              <mdui-checkbox v-model="pSetting.skills.elite[i][0]" class="skill-cb">{{ skill.name }}</mdui-checkbox>
              <div class="inline-block">
                <mdui-select-num v-model="pSetting.skills.elite[i][1]" :options="l.range(sp.skills.normal.length + 1, sp.skills.normal.length + skill.need.length + 1)" @change="$root.mutation(); if (pSetting.skills.elite[i][1] >= pSetting.skills.elite[i][2]) pSetting.skills.elite[i][2] = pSetting.skills.elite[i][1] + 1;"></mdui-select-num>
                <i class="mdui-icon material-icons mdui-m-x-2">arrow_forward</i>
                <span :key="`se-s-${pSetting.skills.elite[i][1] + 1}`">
                  <mdui-select-num v-model="pSetting.skills.elite[i][2]" :options="l.range(pSetting.skills.elite[i][1] + 1, sp.skills.normal.length + skill.need.length + 2)"></mdui-select-num>
                </span>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('取消')}}</button>
        <button v-if="this.pSetting.state == 'add'" class="mdui-btn mdui-ripple mdui-color-pink" mdui-dialog-confirm @click="addPreset">{{$t('添加')}}</button>
        <button v-if="this.pSetting.state == 'edit'" class="mdui-btn mdui-ripple mdui-color-teal" mdui-dialog-confirm @click="editPreset">{{$t('修改')}}</button>
      </div>
    </div>
    <!-- /详细信息 -->
    <!-- Planner -->
    <div id="planner" class="mdui-dialog mdui-typo">
      <template v-if="plan">
        <div class="mdui-dialog-title">
          {{$t('结果仅供参考')}}
          <p class="mdui-m-b-0 mdui-m-t-2" style="font-size:15px">
            {{$t('预计消耗理智：')}}<code>{{ plan.cost }}</code><br />
            <span class="mdui-text-color-blue-900">{{$t('关卡')}}</span> × <span class="mdui-text-color-pink-accent">{{$t('次数')}}</span>&nbsp;&nbsp;(<span class="mdui-text-color-yellow-900">{{$t('理智')}}</span>)&nbsp;&nbsp;<span class="mdui-text-color-black blod-text">{{$t('需求产物')}}</span>&nbsp;&nbsp;<span style="color:rgba(0,0,0,.7);">{{$t('副产物')}}</span>
          </p>
        </div>
        <div class="mdui-dialog-content">
          <div class="stage" v-for="stage in plan.stages" :key="stage.code">
            <h5 class="h-ul">
              <span class="mdui-text-color-blue-900">{{ stage.code }}</span> × <span class="mdui-text-color-pink-accent">{{ stage.times }}</span>&nbsp;&nbsp;(<span class="mdui-text-color-yellow-900">{{ stage.cost }}</span>)
            </h5>
            <div class="num-item-list">
              <arkn-num-item v-for="drop in stage.drops" :key="`${stage.code}-${drop.name}`" :t="materialsTable[drop.name].rare" :img="materialsTable[drop.name].img" :lable="drop.name" :num="drop.num" :color="gaps[drop.name][0] > 0 ? 'mdui-text-color-black blod-text' : false" />
              <arkn-num-item t="4" img="G-4-1" :lable="$t('龙门币')" :num="num10k(stage.money)" />
              <arkn-num-item v-if="stage.cardExp > 0" t="5" img="E-5-1" :lable="$t('狗粮经验值')" :num="num10k(stage.cardExp)" />
            </div>
          </div>
          <div class="stage" v-if="plan.synthesis.length > 0">
            <h5 class="h-ul">{{$t('需要合成')}}</h5>
            <div class="num-item-list">
              <arkn-num-item v-for="m in plan.synthesis" :key="`合成-${m.name}`" :t="materialsTable[m.name].rare" :img="materialsTable[m.name].img" :lable="m.name" :num="m.num" />
              <arkn-num-item t="4" img="G-4-1" :lable="$t('消耗龙门币')" :num="num10k(plan.synthesisCost)" />
            </div>
          </div>
          <div class="stage">
            <h5 class="h-ul">{{$t('总计获得')}}</h5>
            <div class="num-item-list">
              <arkn-num-item t="4" img="G-4-1" :lable="$t('龙门币')" :num="num10k(plan.money)" />
              <arkn-num-item v-if="plan.cardExp > 0" t="5" img="E-5-1" :lable="$t('狗粮经验值')" :num="num10k(plan.cardExp)" />
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('关闭')}}</button>
      </div>
    </div>
    <!-- /Planner -->
    <!-- 关卡掉落详情 -->
    <div id="drop-detail" class="mdui-dialog mdui-typo">
      <template v-if="dropDetails">
        <div class="mdui-dialog-title mdui-p-b-1">
          {{ dropFocus }}
          <p class="mdui-m-b-0 mdui-m-t-1" style="font-size:16px">{{$t('关卡')}} | {{$t('期望理智')}}⚡ | ${{$t('关卡性价比')}}</p>
        </div>
        <div class="mdui-dialog-content mdui-p-b-0">
          <div class="stage" v-for="dropDetail in dropDetails" :key="`dd-${dropDetail.code}`">
            <h5 class="h-ul">
              {{ dropDetail.code }}&nbsp;&nbsp;<code>{{ l.round(dropInfo.expectAP[dropFocus][dropDetail.code], 1).toPrecision(3) }}⚡</code>&nbsp;&nbsp;<code>${{ dropInfo.stageValue[dropDetail.code].toPrecision(4) }}</code>
            </h5>
            <div class="num-item-list">
              <arkn-num-item v-for="drop in dropDetail.drops" :key="`detail-${dropDetail.code}-${drop[0]}`" :t="materialsTable[drop[0]].rare" :img="materialsTable[drop[0]].img" :lable="drop[0]" :num="l.round(drop[1] * 100, 2) + '%'" :color="dropFocus == drop[0] ? 'mdui-text-color-black blod-text' : false" />
            </div>
          </div>
        </div>
      </template>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('关闭')}}</button>
      </div>
    </div>
    <!-- /关卡掉落详情 -->
    <!-- 云端数据同步 -->
    <div id="data-sync" class="mdui-dialog mdui-typo">
      <div class="mdui-dialog-title">{{$t('云端数据同步')}}</div>
      <div class="mdui-dialog-content mdui-p-b-0">
        <h5 class="mdui-m-t-0">{{$t('云端备份恢复')}}</h5>
        <div class="mdui-valign-bottom mdui-m-b-1 space-8" :class="{ 'processing': dataSyncing }">
          <button class="mdui-btn mdui-ripple mdui-color-green-600 tag-btn" @click="cloudSaveData()"><i class="mdui-icon material-icons">cloud_upload</i> {{$t('备份')}}</button>
          <button class="mdui-btn mdui-ripple mdui-color-blue-600 tag-btn" @click="cloudRestoreData" :disabled="!setting.syncCode"><i class="mdui-icon material-icons">cloud_download</i> {{$t('恢复')}}</button>
          <div id="sync-code" class="mdui-textfield mdui-m-r-1">
            <input class="mdui-textfield-input" type="text" v-model.trim="setting.syncCode" :placeholder="$t('同步码')" />
          </div>
          <mdui-switch v-model="setting.autoSyncUpload" :disabled="!setting.syncCode">{{$t('autoSyncUpload')}}</mdui-switch>
        </div>
        <p>{{$t('cloudSyncReadme')}}</p>
        <p>{{$t('autoSyncUploadTip')}}</p>
        <p>Powered by <a href="http://myjson.com/" target="_blank">myjson</a>.</p>
        <div class="mdui-divider mdui-m-y-2"></div>
        <h5 class="mdui-m-t-0">{{$t('离线备份恢复')}}</h5>
        <div class="mdui-m-b-2">
          <button class="mdui-btn mdui-ripple mdui-color-green-600 tag-btn" @click="saveData"><i class="mdui-icon material-icons">file_upload</i> {{$t('备份')}}</button>
          <button class="mdui-btn mdui-ripple mdui-color-blue-600 tag-btn" @click="restoreData"><i class="mdui-icon material-icons">file_download</i> {{$t('恢复')}}</button>
        </div>
        <p>{{$t('localBackupReadme')}}</p>
      </div>
      <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" mdui-dialog-cancel>{{$t('关闭')}}</button>
      </div>
    </div>
    <!-- /云端数据同步 -->
  </div>
</template>

<script>
import ArknNumItem from '../components/ArknNumItem';
import ArknItemT from '../components/ArknItemT';
import MaterialReadme from '../components/MaterialReadme';
import VueTagsInput from '@johmun/vue-tags-input';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import Ajax from '../utils/ajax';
import linprog from 'javascript-lp-solver/src/solver';
import md5 from 'md5';

import HR from '../data/hr.json';
import ELITE from '../data/elite.json';
import MATERIAL from '../data/material.json';
import MATERIAL_ORDER from '../data/materialOrder.json';

const penguinURL =
  'https://penguin-stats.io/PenguinStats/api/result/matrix?show_stage_details=true&show_item_details=true';

const dropTableOtherFields = ['cost', 'event', 'cardExp'];

const pSettingInit = {
  elites: [false, false],
  skills: {
    normal: [false, 1, 7],
    elite: [[false, 7, 10], [false, 7, 10], [false, 7, 10]],
  },
  state: 'add',
};

function min0(x) {
  return x < 0 ? 0 : x;
}

export default {
  name: 'arkn-material',
  components: {
    VueTagsInput,
    MaterialReadme,
    ArknNumItem,
    ArknItemT,
  },
  data: () => ({
    l: _,
    showAll: false,
    materials: _.cloneDeep(MATERIAL),
    materialsTable: _.transform(MATERIAL, (r, v) => (r[v.name] = v), {}),
    materialsOrder: _.cloneDeep(MATERIAL_ORDER),
    charTable: _.transform(HR, (r, v) => (r[v.name] = v), {}),
    elite: _.cloneDeep(ELITE),
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
      ['planIncludeEvent', 'planCardExpFirst'],
    ],
    color: {
      notSelected: 'mdui-color-brown-300',
      selected: 'mdui-color-grey-800',
      5: 'mdui-color-yellow-700',
      4: 'mdui-color-deep-purple-300',
      3: 'mdui-color-blue-600',
      2: 'mdui-color-lime',
      1: 'mdui-color-grey-700',
      固定: 'mdui-color-grey-900',
      小概率: 'mdui-color-grey-300',
      中概率: 'mdui-color-grey-500',
      大概率: 'mdui-color-grey-700',
      罕见: 'mdui-color-red-900',
    },
    penguinData: {
      expire: 0,
      data: false,
    },
    plannerInited: false,
    dropTable: {},
    plannerResult: {},
    plannerDialog: false,
    apbDisabled: false,
    showDPFlag: true,
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
    lastShowMaterials: [],
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
  },
  computed: {
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
        MATERIAL,
        (o, { name, madeof }) => {
          const text = [];
          _.forIn(madeof, (num, m) => text.push(`${m}*${num}`));
          o[name] = text.length > 0 ? `${text.join('、')}` : this.$t('无法合成');
        },
        {}
      );
    },
    synthesizable() {
      return _.transform(
        MATERIAL,
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

      if (!_.isEqual(this.lastShowMaterials, result)) {
        // eslint-disable-next-line
        this.lastShowMaterials = _.cloneDeep(result);
        // 刷新动画，否则动画不同步
        // eslint-disable-next-line
        this.showDPFlag = false;
        // eslint-disable-next-line
        this.$nextTick(() => (this.showDPFlag = true));
      }

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
            )
              showMaterials.push(name);
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
      for (const name in this.elite) {
        const {
          pinyin: { full, head },
          en,
        } = this.charTable[name];
        const search = [name, full, head, en.toLowerCase().replace(/ /g, '')].map(v => v.indexOf(input));
        if (_.every(search, s => s === -1)) continue;
        result.push({
          pos: _.min(search.filter(v => v >= 0)),
          name,
        });
      }
      result.sort((a, b) => (a.pos == b.pos ? a.name.length - b.name.length : a.pos - b.pos));
      return _.map(result, o => ({ name: o.name, text: this.$t('operatorName', this.charTable[o.name]) })).slice(0, 10);
    },
    sp() {
      if (this.selectedPresetName.length === 0) return false;
      return this.elite[this.selectedPresetName];
    },
    checkPSetting() {
      const ps = this.pSetting;
      const check = [...ps.elites, ps.skills.normal[0], ..._.map(ps.skills.elite, a => a[0])];
      return _.sum(check) > 0;
    },
    plan() {
      if (!this.plannerInited) return false;

      // 线性规划模型
      const useVariables = [
        this.setting.planIncludeEvent ? this.dropTable : _.omitBy(this.dropTable, o => o.event),
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
        _.mapValues(_.omitBy(result, (v, k) => k.startsWith('合成-') || k.startsWith('转换-')), v =>
          v < 1 ? 1 : Math.ceil(v)
        ),
        (v, k) => {
          const cost = v * this.dropTable[k].cost;
          const drop = _.mapValues(_.omit(this.dropTable[k], dropTableOtherFields), e => _.round(v * e, 1));
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
            cardExp: _.round(this.dropTable[k].cardExp * v),
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
      return num > 100000 ? `${_.round(num / 10000, 2)}w` : num;
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
        this.$root.snackbar({
          message: this.$t('已重置'),
          timeout: 0,
          buttonText: this.$t('撤销'),
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
        text: name,
        setting: { elites, skills },
      } of this.selected.presets) {
        const current = this.elite[name];

        current.elites.forEach((need, i) => {
          if (elites[i]) this.addNeed(need);
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
            this.addNeed(current.skills.elite[i].need[j]);
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
        _.each(this.elite[this.selectedPresetName].skills.elite, ({ need }, i) => {
          this.pSetting.skills.elite[i][2] -= 3 - need.length;
        });
      }
      this.$nextTick(() => {
        this.presetDialog.open();
        this.$root.mutation();
      });
    },
    addPreset() {
      if (!this.checkPSetting) {
        this.$root.snackbar(this.$t('presetEmptyOption'));
        return;
      }
      this.selectedPreset.tag.setting = _.cloneDeep(this.pSetting);
      this.selectedPreset.tag.setting.state = 'edit';
      this.selectedPreset.addTag();
    },
    editPreset() {
      if (!this.checkPSetting) {
        this.$root.snackbar(this.$t('presetEmptyOption'));
        return;
      }
      this.selected.presets[this.selectedPreset.index].setting = _.cloneDeep(this.pSetting);
      this.usePreset();
    },
    saveData() {
      this.dataSyncDialog.close();
      const Mdui = this.$root.Mdui;
      const data = {
        inputs: this.compressedInputs,
        presets: this.selected.presets,
      };
      const str = Base64.encode(JSON.stringify(data));
      Mdui.prompt(this.$t('saveDataLable'), this.$t('saveDataTitle'), this.copyDialogInputText, () => {}, {
        history: false,
        defaultValue: str,
        cancelText: this.$t('关闭'),
        confirmText: this.$t('copy2clipboard'),
      });
    },
    restoreData() {
      this.dataSyncDialog.close();
      const Mdui = this.$root.Mdui;
      Mdui.prompt(
        this.$t('restoreDataLable'),
        this.$t('restoreDataTitle'),
        value => {
          if (value.length == 0) return;
          try {
            const { inputs, presets } = JSON.parse(Base64.decode(value));
            this.compressedInputs = inputs;
            this.selected.presets = presets;
            Mdui.snackbar(this.$t('imported'));
          } catch (error) {
            Mdui.snackbar(this.$t('importFailed'));
          }
        },
        () => {},
        {
          history: false,
          cancelText: this.$t('取消'),
          confirmText: this.$t('导入'),
        }
      );
    },
    cloudSaveData(silence = false) {
      const snackbar = silence ? () => {} : this.$root.snackbar;
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
            snackbar(this.$t('备份成功'));
          })
          .catch(() => {
            this.dataSyncing = false;
            snackbar(this.$t('备份失败'));
          });
      } else {
        Ajax.createMyjson(obj)
          .then(({ uri }) => {
            this.dataSyncing = false;
            this.setting.syncCode = _.last(uri.split('/'));
            snackbar(this.$t('备份成功'));
          })
          .catch(() => {
            this.dataSyncing = false;
            snackbar(this.$t('备份失败'));
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
            this.$root.snackbar(this.$t('恢复失败'));
            return;
          }
          this.ignoreInputsChange = true;
          this.compressedInputs = data.inputs;
          this.selected.presets = data.presets;
          this.$root.snackbar(this.$t('恢复成功'));
          this.dataSyncing = false;
        })
        .catch(() => {
          this.dataSyncing = false;
          this.$root.snackbar(this.$t('恢复失败'));
        });
    },
    copyDialogInputText() {
      const Mdui = this.$root.Mdui;
      Mdui.JQ('.mdui-dialog-open input')[0].select();
      document.execCommand('copy');
      Mdui.snackbar(this.$t('copied'));
    },
    async initPlanner() {
      if (this.plannerInited) return;

      if (!this.penguinData.data || this.penguinData.expire < _.now()) {
        const tip = this.$root.snackbar({
          message: this.$t('penguinDataLoading'),
          timeout: 0,
          closeOnOutsideClick: false,
        });
        const data = await Ajax.get(penguinURL, true).catch(() => false);
        tip.close();
        if (data) {
          this.penguinData.data = data;
          this.penguinData.expire = _.now() + 3 * 24 * 60 * 60 * 1000;
          localStorage.setItem('material.penguinData', JSON.stringify(this.penguinData));
        } else {
          if (this.penguinData.data) this.$root.snackbar(this.$t('penguinDataFallback'));
          else {
            this.$root.snackbar(this.$t('penguinDataFailed'));
            return;
          }
        }
      }

      const eap = this.dropInfo.expectAP;

      // 处理合成列表
      for (const { name, madeof, rare } of MATERIAL) {
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
        基础作战记录: 200,
        初级作战记录: 400,
        中级作战记录: 1000,
        高级作战记录: 2000,
      };

      // 处理掉落信息
      for (const {
        item: { name, itemType },
        stage: { apCost, code, stageType },
        quantity,
        times,
      } of this.penguinData.data.matrix) {
        if (quantity === 0) continue;
        if (!(name in this.materialConstraints) && itemType !== 'CARD_EXP') continue;
        if (!this.dropTable[code]) this.dropTable[code] = { cost: apCost, event: stageType === 'ACTIVITY', cardExp: 0 };
        if (itemType === 'CARD_EXP') {
          this.dropTable[code].cardExp += (cardExp[name] * quantity) / times;
        } else {
          this.dropTable[code][name] = quantity / times;
          eap[name][code] = apCost / this.dropTable[code][name];
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
      const Mdui = this.$root.Mdui;
      if (this.plan.cost === 0) Mdui.alert('根本不需要计算啦~', () => {}, { confirmText: '好吧' });
      else this.$nextTick(() => this.plannerDialog.open());
    },
    resetPenguinData() {
      localStorage.removeItem('material.penguinData');
      window.location.reload();
    },
    async showDropDetail({ name, source }) {
      await this.initPlanner();
      this.dropDetails = [];
      this.dropFocus = name;
      for (const code in source) {
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

    this.selected.presets.forEach(p => (p.text = this.$t('operatorName', this.charTable[p.name])));

    this.throttleAutoSyncUpload = _.throttle(() => this.cloudSaveData(true), 3000, { leading: false, trailing: true });
  },
  mounted() {
    const Dialog = this.$root.Mdui.Dialog;
    this.presetDialog = new Dialog('#preset-setting', { history: false });
    this.$root.Mdui.JQ('#preset-setting')[0].addEventListener(
      'closed.mdui.dialog',
      () => (this.selectedPresetName = '')
    );
    this.plannerDialog = new Dialog('#planner', { history: false });
    this.dropDialog = new Dialog('#drop-detail', { history: false });
    this.dataSyncDialog = new Dialog('#data-sync', { history: false });
  },
};
</script>

<style lang="scss">
#app:not(.mobile-screen) #arkn-material {
  .material-group-wrap {
    margin-right: -16px;
  }
  .source-list[length='3'] {
    position: absolute;
    bottom: 16px;
  }
  .source-list[length='4'] {
    position: absolute;
    bottom: 11px;
  }
  .source-list[length='5'] {
    position: absolute;
    bottom: 3px;
  }
}
#arkn-material {
  .material .mdui-btn.small-btn {
    margin: -4px 0;
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
      background-color: #fff;
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
    &,
    .mdui-card-header-title {
      transition: all 0.3s;
    }
    .mdui-card-header {
      height: auto;
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
  .mobile-screen {
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
  }
  .source-list {
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
  .source {
    width: 95px;
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
  @media screen and (max-width: 354px) {
    .source-list {
      left: -92px;
      width: calc(100% + 92px);
      border-left: 4px solid rgba(0, 0, 0, 0.2);
      margin-top: 8px;
    }
    .source-list li {
      display: inline-block;
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
        width: max-content;
      }
    }
  }
  @keyframes show-1 {
    0% {
      opacity: 0;
    }
    3% {
      opacity: 1;
    }
    47% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
  @keyframes show-2 {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    53% {
      opacity: 1;
    }
    97% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  .probability {
    .show-1 {
      animation: show-1 16s infinite;
    }
    .show-2 {
      animation: show-2 16s infinite;
    }
    .show-1,
    .show-2 {
      position: absolute;
      left: 4px;
      top: 1px;
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
}
</style>
