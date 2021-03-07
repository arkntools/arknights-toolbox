<template>
  <span class="mini-chip"
    ><span class="mini-chip-content"><slot></slot></span
  ></span>
</template>

<style lang="scss" scoped>
.mini-chip {
  align-items: center;
  cursor: default;
  display: inline-flex;
  line-height: 20px;
  max-width: 100%;
  outline: none;
  overflow: hidden;
  padding: 0 8px;
  position: relative;
  text-decoration: none;
  vertical-align: middle;
  white-space: nowrap;
  border-radius: 8px;
  font-size: 10px;
  height: 16px;
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
  }
}
</style>
