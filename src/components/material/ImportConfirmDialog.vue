<template>
  <div id="import-confirm" class="mdui-dialog mdui-typo no-sl" ref="dialog">
    <div class="mdui-dialog-title">{{ $t('common.import') }}</div>
    <div class="mdui-dialog-content mdui-p-b-0 stage">
      <div class="num-item-list">
        <arkn-num-item
          v-for="[id, num] in displayItems"
          :key="id"
          :img="id"
          :lable="$t(`material.${id}`)"
          :num="num"
        />
        <!-- 占位 -->
        <div class="num-item" v-for="i in 4" :key="i"></div>
      </div>
    </div>
    <div class="mdui-dialog-actions">
      <mdui-checkbox
        class="float-left mdui-m-l-2"
        v-model="$parent.setting.clearOwnedBeforeImportFromJSON"
        >{{ $t('cultivate.panel.importFromJSON.clearOwnedBeforeImport') }}</mdui-checkbox
      >
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.no') }}</button
      >
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.pinkBtn"
        mdui-dialog-confirm
        >{{ $t('common.yes') }}</button
      >
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { defineComponent } from 'vue';
import { MduiDialogMixin } from '@/mixins/mduiDialog';
import ArknNumItem from '@/components/ArknNumItem.vue';
import { materialTable } from '@/store/material';

export default defineComponent({
  name: 'import-confirm-dialog',
  mixins: [MduiDialogMixin],
  components: { ArknNumItem },
  data: () => ({
    items: {},
  }),
  computed: {
    displayItems() {
      return _.sortBy(
        Object.entries(this.items),
        ([key]) => materialTable[key].sortId[this.$root.server],
      );
    },
  },
  methods: {
    async open(items) {
      this.items = items;
      await this.$nextTick();
      this.dialog.open();
    },
  },
  created() {
    this.$on('confirm', () => {
      this.$emit('import', {
        items: this.items,
        clear: this.$parent.setting.clearOwnedBeforeImportFromJSON,
      });
    });
  },
});
</script>
