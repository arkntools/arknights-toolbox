<template>
  <div class="mdui-dialog" ref="dialog"><slot></slot></div>
</template>

<script>
import { MduiDialogMixin } from '@/mixins/mduiDialog';

export default {
  name: 'mdui-dialog',
  mixins: [MduiDialogMixin],
};
</script>
