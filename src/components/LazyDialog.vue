<template>
  <component
    v-if="isOpen"
    ref="dialogRef"
    :is="component"
    v-bind="$attrs"
    v-on="$listeners"
    @closed="handleClosed"
    ><slot></slot
  ></component>
</template>

<script setup>
import { getWrapper } from '@/mixins/mduiDialog';
import { sleep } from '@/utils/common';
import { ref } from 'vue';

defineProps({ component: Object });
const emit = defineEmits(['full-closed']);

const isOpen = ref(false);
const dialogRef = ref();

const wrapper = getWrapper(dialogRef);

let isClosing = false;

const handleClosed = async () => {
  if (wrapper.isTempClose()) return;
  isClosing = true;
  await sleep();
  isOpen.value = false;
  isClosing = false;
  emit('full-closed');
};

const open = async (...args) => {
  if (isClosing) return;
  isOpen.value = true;
  await sleep();
  wrapper.open(...args);
};

const close = async (...args) => {
  wrapper.close(...args);
};

const toggle = (...args) => (isOpen.value ? close(...args) : open(...args));

defineExpose({ ...wrapper, open, close, toggle });
</script>
