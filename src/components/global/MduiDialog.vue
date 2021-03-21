<template>
  <div class="mdui-dialog" ref="dialog"><slot></slot></div>
</template>

<script>
import mduiDialogMixin from '@/mixins/mduiDialog';

export default {
  name: 'mdui-dialog',
  mixins: [mduiDialogMixin],
};
</script>
