<template>
  <mdui-checkbox
    class="mdui-m-l-2 flex-no-shrink"
    :checked="preset.setting.focus"
    @change="parent.togglePresetFocus(preset)"
    >{{ $t('cultivate.panel.preset.focus') }}</mdui-checkbox
  >
</template>

<script setup>
import { inject } from 'vue';

defineProps({
  preset: {
    type: Object,
    required: true,
  },
});

const parent = inject('parent')();
</script>
