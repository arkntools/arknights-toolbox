<template>
  <div
    ref="capturer"
    class="paste-capturer"
    contenteditable="true"
    @paste.prevent="pasteHandler"
    @copy.prevent
    @cut.prevent
    @keypress.prevent
  ></div>
</template>

<script>
export default {
  name: 'paste-capturer',
  mounted() {
    document.addEventListener('keydown', this.focus);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.focus);
  },
  methods: {
    /**
     * @param {KeyboardEvent} e
     */
    focus(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      const curFocus = document.activeElement;
      if (
        // 如果当前 focus 的是可编辑元素（包括 input 和 contenteditable 的元素）则不改变焦点
        !curFocus ||
        curFocus.tagName === 'INPUT' ||
        curFocus.getAttribute('contenteditable') === 'true' ||
        // 如果当前选中了什么东西，也不改变焦点
        window.getSelection()?.type === 'Range'
      ) {
        return;
      }
      this.$refs.capturer.focus();
    },
    /**
     * @param {ClipboardEvent} e
     */
    pasteHandler(e) {
      const files = e.clipboardData?.files;
      if (files?.length) this.$root.$emit('paste-files', files);
    },
  },
};
</script>

<style scoped>
.paste-capturer {
  position: fixed;
  left: 0;
  top: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  z-index: -999;
  outline: none;
}
</style>
