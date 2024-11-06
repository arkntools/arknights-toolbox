<template>
  <div id="changelog">
    <ChangelogItem :list="first" />
    <div class="mdui-panel mdui-panel-gapless" mdui-panel>
      <div class="mdui-panel-item">
        <div class="mdui-panel-item-header">
          <div class="mdui-panel-item-title" style="width: auto">{{
            $t('home.earlyChangelog')
          }}</div>
          <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
        </div>
        <div class="mdui-panel-item-body">
          <ChangelogItem :list="second" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import changelogs from '@/data/changelog.json';
import ChangelogItem from './ChangelogItem.vue';

export default {
  name: 'changelog',
  components: { ChangelogItem },
  data: () => ({
    first: changelogs.slice(0, 5),
    second: changelogs.slice(5),
  }),
};
</script>
