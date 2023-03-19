<template>
  <DataImg type="avatar" :name="name" />
</template>

<script>
import { defineComponent } from 'vue';
import DataImg from '../DataImg.vue';

export default defineComponent({
  name: 'avatar',
  components: { DataImg },
  props: {
    name: String,
  },
});
</script>
