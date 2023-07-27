<template>
  <Teleport v-if="isShow" to="body">
    <div
      class="simple-alert-overlay"
      :class="{ 'simple-alert-overlay-show': isShowAnimation }"
      @transitionend="handleOverlayTransitionEnd"
      @click.self="hide"
    >
      <div
        class="simple-alert mdui-dialog mdui-dialog-alert"
        :class="{ 'mdui-dialog-open': isShowAnimation }"
        @transitionend="handleDialogTransitionEnd"
      >
        <div class="mdui-dialog-content" v-html="html"></div>
        <div class="mdui-dialog-actions">
          <a
            href="javascript:void(0)"
            class="mdui-btn mdui-ripple mdui-text-color-primary"
            @click="hide"
            >{{ $t('common.close') }}</a
          >
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { sleep } from '@/utils/common';

defineProps({
  html: String,
});

const isShow = ref(false);
const isShowAnimation = ref(false);

let resolveOverlayTransition;
let resolveDialogTransition;

const handleOverlayTransitionEnd = () => {
  if (isShowAnimation.value) return;
  resolveOverlayTransition?.();
};

const handleDialogTransitionEnd = () => {
  if (isShowAnimation.value) return;
  resolveDialogTransition?.();
};

const show = async () => {
  if (isShow.value) return;
  isShow.value = true;
  await sleep();
  isShowAnimation.value = true;
};
const hide = async () => {
  if (!isShowAnimation.value) return;
  const promises = [
    new Promise(resolve => {
      resolveOverlayTransition = () => {
        resolve();
        resolveOverlayTransition = null;
      };
    }),
    new Promise(resolve => {
      resolveDialogTransition = () => {
        resolve();
        resolveDialogTransition = null;
      };
    }),
  ];
  isShowAnimation.value = false;
  await Promise.race([Promise.all(promises), sleep(500)]);
  isShow.value = false;
};

defineExpose({ show, hide });
</script>

<style lang="scss" scoped>
.simple-alert {
  display: block;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: fit-content;
  max-width: 560px;
  margin: auto;
  opacity: 1;
  &-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition-duration: 0.3s;
    transition-property: opacity;
    backface-visibility: hidden;
    z-index: 8000;
    &-show {
      opacity: 1;
    }
  }
}
</style>
