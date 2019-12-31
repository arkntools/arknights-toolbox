<i18n>
{
  "en": {
    "干员数据最后更新日期：": "Date of last data update: "
  }
}
</i18n>

<template>
  <div id="changelog">
    <p>{{$t('干员数据最后更新日期：')}}<code>{{time}}</code></p>
    <div v-for="changelog in changelogs" :key="changelog.time" lang="zh">
      <h4>{{changelog.time}}</h4>
      <ul>
        <li v-for="(change, index) in changelog.changes" :key="index">{{change}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { time } from '../data/timestamp.json';
import changelogs from '../data/changelog.json';

export default {
  name: 'changelog',
  data: () => ({
    time,
    changelogs,
  }),
};
</script>
