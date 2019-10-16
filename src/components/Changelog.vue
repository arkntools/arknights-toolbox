<template>
	<div id="changelog">
		<p>干员数据最后更新日期：<code>{{time}}</code></p>
		<div v-for="changelog in changelogs" :key="changelog.time">
			<h4>{{changelog.time}}</h4>
			<p v-html="changelog.changes.join('<br>')"></p>
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
