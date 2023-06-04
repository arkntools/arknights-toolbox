<template>
  <ul class="mdui-typo mdui-m-y-0" style="font-size: 14px">
    <li>{{ $t('cultivateGuide.texts.0') }}</li>
    <i18n path="cultivateGuide.texts.1" tag="li">
      <b>{{ $t('cultivateGuide.b', [$t('common.lack')]) }}</b>
    </i18n>
    <i18n path="cultivateGuide.texts.2" tag="li">
      <b>{{ $t('cultivateGuide.b', [$t('common.synthesize')]) }}</b>
    </i18n>
    <li>{{ $t('cultivateGuide.texts.3') }}</li>
    <i18n path="cultivateGuide.texts.4" tag="li">
      <span v-theme-class="$root.color.pinkText">{{ $t('cultivateGuide.pinkTextMaterial') }}</span>
    </i18n>
    <i18n path="cultivateGuide.texts.5" tag="li">
      <b>{{ $t('cultivateGuide.b', [$t('common.preset')]) }}</b>
      <b>{{ $t('cultivateGuide.b', [$t('common.need')]) }}</b>
      <b>{{ $t('cultivateGuide.b', [$t('cultivate.panel.button.resetAll')]) }}</b>
      <b>{{
        $t('cultivateGuide.b', [$t('cultivate.panel.button.resetNeed').replace(/"/g, '')])
      }}</b>
    </i18n>
    <i18n path="cultivateGuide.texts.6" tag="li">
      <b>{{ $t('cultivateGuide.b', [$t('common.todo')]) }}</b>
    </i18n>
    <i18n path="cultivateGuide.texts.7" tag="li">
      <b>{{ $t('cultivateGuide.b', [$t('cultivate.panel.button.farmCalculation')]) }}</b>
      <a href="https://penguin-stats.io/" target="_blank">{{ $t('cultivateGuide.penguinData') }}</a>
      <a href="https://yituliu.site/" target="_blank">{{ $t('cultivateGuide.yituliu') }}</a>
    </i18n>
  </ul>
</template>

<script>
export default {
  name: 'material-readme',
};
</script>
