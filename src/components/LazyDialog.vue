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
};

const open = async () => {
  if (isClosing) return;
  isOpen.value = true;
  await sleep();
  wrapper.open();
};

const close = async () => {
  wrapper.close();
};

const toggle = () => (isOpen.value ? close() : open());

defineExpose({ ...wrapper, open, close, toggle });
</script>
