<template>
  <DataImg type="avatar" :name="name" :lazy="lazy" />
</template>

<script>
import { defineComponent } from 'vue';
import DataImg from '../DataImg.vue';

export default defineComponent({
  name: 'avatar',
  components: { DataImg },
  props: {
    name: String,
    lazy: Boolean,
  },
});
</script>
