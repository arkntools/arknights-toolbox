<template>
  <span class="mini-chip"
    ><span class="mini-chip-content"><slot></slot></span
  ></span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  height: {
    type: Number,
    default: 16,
  },
  fontSize: {
    type: Number,
    default: 12,
  },
});

const heightCss = computed(() => `${props.height}px`);
const fontSizeCss = computed(() => `${props.fontSize}px`);
</script>

<style lang="scss" scoped>
.mini-chip {
  align-items: center;
  cursor: default;
  display: inline-flex;
  max-width: 100%;
  outline: none;
  overflow: hidden;
  padding: 0 8px;
  position: relative;
  text-decoration: none;
  vertical-align: middle;
  white-space: nowrap;
  border-radius: 100px;
  font-size: v-bind(fontSizeCss);
  height: v-bind(heightCss);
  &::before {
    background-color: currentColor;
    bottom: 0;
    border-radius: inherit;
    content: '';
    left: 0;
    opacity: 0;
    position: absolute;
    pointer-events: none;
    right: 0;
    top: 0;
  }
  &::after,
  &::before {
    text-decoration: inherit;
    vertical-align: inherit;
  }
  &-content {
    align-items: center;
    display: inline-flex;
    height: 100%;
    max-width: 100%;
    line-height: v-bind(heightCss);
  }
}
</style>
