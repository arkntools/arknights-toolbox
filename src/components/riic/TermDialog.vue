<template>
  <mdui-dialog ref="dialog" @closed="ids = []">
    <div
      class="mdui-dialog-content mdui-typo mdui-p-y-0"
      @click="handleDialogClick"
      ref="dialogContent"
    >
      <div class="term-item" v-for="id in ids" :key="id" :ref="id">
        <h4 class="term-title"
          >{{ $t(`term.${id}.name`) }}
          <button class="mdui-btn mdui-btn-icon mdui-ripple" @click="emitSearch(id)">
            <i class="mdui-icon material-icons">search</i>
          </button>
        </h4>
        <div class="term-desc can-sl" v-html="richText2HTML($t(`term.${id}.desc`))"></div>
      </div>
    </div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.close') }}</button
      >
    </div>
  </mdui-dialog>
</template>

<script>
import _ from 'lodash';
import { richText2HTML, findTerm } from './richText2HTML';

export default {
  data: () => ({
    ids: [],
  }),
  methods: {
    richText2HTML,
    show(id) {
      this.ids = _.castArray(id);
      this.$nextTick(this.$refs.dialog.open);
    },
    handleDialogClick(e) {
      const term = findTerm(e, el => el.classList?.contains('mdui-dialog-content'));
      const id = term?.dataset?.id;
      if (!id) return;
      if (this.ids.includes(id)) {
        this.$refs[id]?.[0]?.scrollIntoView?.({
          behavior: 'smooth',
          block: 'center',
        });
      } else {
        this.ids.push(id);
        this.$nextTick(() => {
          this.$refs.dialog.handleUpdate();
          const $ct = this.$refs.dialogContent;
          $ct.scrollTop = $ct.scrollHeight;
        });
      }
    },
    emitSearch(id) {
      this.$refs.dialog.close();
      this.$emit('search', id);
    },
  },
};
</script>

<style lang="scss" scoped>
.term {
  &-item {
    &:not(:last-child) {
      margin-bottom: 1.2rem;
    }
    & + & {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
  }
  &-title {
    font-weight: 600;
  }
}
</style>
