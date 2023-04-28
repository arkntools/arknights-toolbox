<template>
  <div class="mdui-dialog no-sl" ref="dialogRef">
    <div class="mdui-dialog-title mdui-p-b-0">{{
      $t('cultivate.multiAccount.accountManagement')
    }}</div>
    <div class="mdui-dialog-content mdui-p-t-3">
      <table class="mdui-table mdui-table-hoverable">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('common.name') }}</th>
            <th>{{ $t('common.server') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in accountList" :key="item.id">
            <td>{{ i + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>
              <MduiSelect
                class="mdui-p-l-1"
                v-model="item.server"
                :options="SERVER_OPTIONS"
                :mdui-options="null"
                @change="server => $emit('changeServer', { id: item.id, server })"
              />
            </td>
            <td class="actions">
              <button
                class="mdui-btn mdui-btn-icon mdui-btn-dense mdui-ripple"
                @click="editName(item)"
              >
                <i class="mdui-icon material-icons">edit</i>
              </button>
              <button
                class="mdui-btn mdui-btn-icon mdui-btn-dense mdui-ripple mdui-m-l-1"
                :class="{ 'mdui-invisible': item.id === DEFAULT_ID }"
                @click="deleteAccount(item)"
              >
                <i class="mdui-icon material-icons">delete</i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mdui-dialog-actions">
      <button
        class="mdui-btn mdui-ripple"
        v-theme-class="$root.color.dialogTransparentBtn"
        mdui-dialog-cancel
        >{{ $t('common.close') }}</button
      >
    </div>
  </div>
</template>

<script>
import { ref, defineComponent } from 'vue';
import { MDUI_DIALOG_EMITS, useMduiDialog } from '@/mixins/mduiDialog';
import { DEFAULT_ID } from '@/utils/MultiAccount';
import { locales } from '@/constant/lang';

const SERVER_OPTIONS = [
  { text: '-', value: '' },
  ...locales.map(({ short }) => ({ text: short.toUpperCase(), value: short })),
];

export default defineComponent({
  props: {
    accountList: {
      type: Array,
      default: () => [],
    },
  },
  emits: [...MDUI_DIALOG_EMITS, 'deleteAccount', 'changeServer'],
  setup(props, context) {
    const dialogRef = ref();
    return {
      DEFAULT_ID,
      SERVER_OPTIONS,
      dialogRef,
      ...useMduiDialog(context.emit, dialogRef),
    };
  },
  methods: {
    editName(item) {
      this.close();
      this.$prompt(
        this.$t('common.name'),
        this.$t('cultivate.multiAccount.editName'),
        value => {
          value = value.trim();
          if (!value) {
            this.editName(item);
            return;
          }
          item.name = value;
          this.open();
        },
        () => {
          this.open();
        },
        {
          defaultValue: item.name,
          history: false,
          modal: true,
          confirmOnEnter: true,
          cancelText: this.$t('common.cancel'),
          confirmText: this.$t('common.edit'),
        },
      );
    },
    deleteAccount(item) {
      if (item.id === DEFAULT_ID) return;
      this.close();
      this.$confirm(
        this.$t('cultivate.multiAccount.deleteConfirm', [item.name]),
        () => {
          this.$emit('deleteAccount', item.id);
          this.open();
        },
        () => {
          this.open();
        },
        {
          history: false,
          modal: true,
          cancelText: this.$t('common.no'),
          confirmText: this.$t('common.yes'),
        },
      );
    },
  },
});
</script>

<style scoped>
.actions {
  width: 0;
  white-space: nowrap;
}
</style>
