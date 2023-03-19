<template>
  <div id="changelog">
    <p
      >{{ $t('home.lastUpdateDate') }}<code v-if="timestamp">{{ time }}</code></p
    >
    <div v-for="changelog in first" :key="changelog.time">
      <h4>{{ changelog.time }}</h4>
      <ul>
        <li v-for="(change, index) in changelog.changes" :key="index" v-html="change"></li>
      </ul>
    </div>
    <div class="mdui-panel mdui-panel-gapless" mdui-panel>
      <div class="mdui-panel-item">
        <div class="mdui-panel-item-header">
          <div class="mdui-panel-item-title" style="width: auto">{{
            $t('home.earlyChangelog')
          }}</div>
          <i class="mdui-panel-item-arrow mdui-icon material-icons">keyboard_arrow_down</i>
        </div>
        <div class="mdui-panel-item-body">
          <div v-for="changelog in second" :key="changelog.time">
            <h4>{{ changelog.time }}</h4>
            <ul>
              <li v-for="(change, index) in changelog.changes" :key="index" v-html="change"></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { dateTime } from '@/utils/formatter';
import { useHotUpdateStore } from '@/store/hotUpdate';
import changelogs from '@/data/changelog.json';

export default {
  name: 'changelog',
  data: () => ({
    first: changelogs.slice(0, 5),
    second: changelogs.slice(5),
  }),
  computed: {
    ...mapState(useHotUpdateStore, ['timestamp']),
    time() {
      return dateTime.format(this.timestamp);
    },
  },
};
</script>
