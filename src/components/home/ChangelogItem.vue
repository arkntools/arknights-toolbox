<template>
  <div>
    <div v-for="item in list" :key="item.time">
      <h4>{{ item.time }}</h4>
      <ul>
        <template v-for="(change, index) in item.changes">
          <li v-if="typeof change === 'string'" :key="index" v-html="change"></li>
          <li v-else :key="index">
            {{ change.title }}
            <ul class="mdui-m-t-0">
              <li v-for="(content, cIndex) in change.contents" :key="cIndex" v-html="content"></li>
            </ul>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});
</script>
