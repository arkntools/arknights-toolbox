<template>
  <div>
    <p>{{ $t('welcome.texts.0') }}<br />{{ $t('welcome.texts.1') }}</p>
    <i18n path="welcome.texts.2">
      <a :href="`${$root.githubRepo}/issues`" target="_blank">issue</a>
      <a :href="`${$root.githubRepo}/discussions`" target="_blank">{{
        $t('welcome.discussionArea')
      }}</a>
    </i18n>
    <p>{{ $t('welcome.texts.3') }}</p>
    <p v-if="$root.localeTW" v-html="$t('welcome.twServer')"></p>
  </div>
</template>
