<template>
  <ul class="mdui-typo mdui-m-y-0" style="font-size: 14px;">
    <template v-if="$root.localeCN">
      <li>设置与输入会实时自动保存</li>
      <li>材料卡片的<b>「仍需」</b>中，小字括号中的数字表示可以合成的数量</li>
      <li
        >点击一次材料名字旁边的<b>「{{ $t('common.synthesize') }}」</b>按钮可模拟全部合成（扣除原材料，增加产物）</li
      >
      <li>点击材料卡片右侧的掉落信息可显示相关关卡的详细掉落情况，以及关卡性价比（越高越好，仅供参考）</li>
      <li
        ><span v-theme-class="$root.color.pinkText">粉色字材料</span
        >代表该材料存在原始需求，而不仅仅是上位材料所需的合成材料</li
      >
      <li
        ><b>「预设」</b
        >用于计算干员精英化/技能升级所需材料，添加预设将会丢弃当前所有的<b>「需求」</b>输入，点击已添加的预设可以进行编辑；在<b>「重置需求&amp;已有」</b>或<b>「重置需求」</b>后，预设将一并被清空</li
      >
      <li
        ><b>「{{ $t('cultivate.panel.button.farmCalculation') }}」</b
        >可以计算最优的刷图路线，结果仅供参考，稀有度筛选决定了计算时是否考虑该级材料的向上合成，掉落概率数据来自<a
          href="https://penguin-stats.io/"
          target="_blank"
          >企鹅物流数据统计</a
        ></li
      >
    </template>
    <template v-else-if="$root.localeTW">
      <li>設定與輸入會實時自動保存</li>
      <li>材料卡片的<b>「仍需」</b>中，小字括弧中的數位為可以合成的數量</li>
      <li
        >點擊一次資料名字旁邊的<b>「{{ $t('common.synthesize') }}」</b>按鈕可模擬全部合成（扣除原材料，新增產物）</li
      >
      <li>點擊資料卡片右側的掉落資訊可顯示相關關卡的詳細掉落情况，以及關卡性價比（越高越好，僅供參考）</li>
      <li
        ><span v-theme-class="$root.color.pinkText">粉色字材料</span
        >代表該材料存在原始需求，而不僅僅是上位材料所需的合成材料</li
      >
      <li
        ><b>「預設」</b
        >用於計算幹員精英化/技能升級所需材料，添加預設將會丟棄當前所有的<b>「需求」</b>輸入，點擊已添加的預設可以進行編輯；在<b>「重置需求&amp;已有」</b>或<b>「重置需求」</b>後，預設將一併被清空</li
      >
      <li
        ><b>「{{ $t('cultivate.panel.button.farmCalculation') }}」</b
        >可以計算最佳的刷圖路線，結果僅供參考，稀有度篩選决定了計算時是否考慮該級材料的向上合成，掉落機率資料来自<a
          href="https://penguin-stats.io/"
          target="_blank"
          >企鵝物流資料統計</a
        ></li
      >
    </template>
    <template v-else-if="$root.localeIs('jp')">
      <li>この画面の値はすべて自動セーブです。</li>
      <li>材料カードの<b>「不足」</b>の小さくてカッコの数字は、合成材料必要の数字です。</li>
      <li
        >材料の名前の横に<b>{{ $t('common.synthesize') }}</b
        >ボタンをクリックして、合成必要の材料を表示できます「元材料を抜き、産物を増加」。</li
      >
      <li
        >材料カードの右に「ステージにドロップ詳細」と「ステージの価値」を表示し、高ければ高いほどがいい（参考のみ）。</li
      >
      <li
        ><span v-theme-class="$root.color.pinkText">ピンク色の名前の材料</span
        >は元必要の代表して、上位材料の合成必要材料だけではありません。</li
      >
      <li
        ><b>「プリセット」</b
        >は昇進・スキルアップが必要の材料を計算できますが、設定した後、画面にある<b>必要</b>の値はリッセットになりますので、気をつけてください。追加した後、名前タッグをクリックして、もう一度セットできます。<b>需要をリセット&amp;已有</b>或<b>需要をリセット</b>をクリックして、プリセットもリッセットします。</li
      >
      <li
        ><b>「{{ $t('cultivate.panel.button.farmCalculation') }}」ボタン</b
        >で最優先のルートをご計算できますが、参考のみ。レアリティのフィルタでは、このレアリティの材料の上向き合成が計算で考慮されるかどうかを決定します。オリジナルデータは<a
          href="https://penguin-stats.io/"
          target="_blank"
          >ペンギン急便データ統計処理部門</a
        >から。</li
      >
    </template>
    <template v-else>
      <li>Settings and inputs will be saved automatically.</li>
      <li
        >In <b>"{{ $t('common.lack') }}"</b> on the material card, the number with brackets means the quantity that the
        current material can be synthesized.</li
      >
      <li
        >View some statistical data about a material by clicking the dropping information on the right side of the
        material card.</li
      >
      <li
        >Click the <b>"{{ $t('common.synthesize') }}"</b> button next to a material's name can simulate a synthesis.</li
      >
      <li
        ><span v-theme-class="$root.color.pinkText">Material name with a pink color</span> means it has original demand,
        but not only be used to synthesize.</li
      >
      <li
        >Use <b>"{{ $t('common.preset') }}"</b> to calculate material demand of cultivating operators. Add a preset will
        drop all <b>"{{ $t('common.need') }}"</b> changes. You can edit a preset by clicking its label. All presets will
        be cleared if you click <b>"{{ $t('cultivate.panel.button.resetNeed') }}"</b> or
        <b>"{{ $t('cultivate.panel.button.resetAll') }}"</b>.</li
      >
      <li
        ><b>"{{ $t('cultivate.panel.button.farmCalculation') }}"</b> is a function to calculate the optimal stages by
        linear programming. Rarity filter determines whether the upward synthesis of this rarity of material is
        considered in the calculation. All data come from
        <a href="https://penguin-stats.io/" target="_blank">penguin stats</a>.</li
      >
    </template>
  </ul>
</template>

<script>
export default {
  name: 'material-readme',
};
</script>
