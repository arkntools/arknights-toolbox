<template>
  <i class="mdui-icon material-icons help no-sl" :mdui-tooltip="tooltip">{{
    $root.dark ? 'info' : 'info_outline'
  }}</i>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'top',
  },
});

const tooltip = computed(() => `{content:'${props.content}',position:'${props.position}'}`);
</script>
