<template>
  <img
    :src="name ? $root.avatar(name) : PNG1P"
    crossorigin="anonymous"
    @error="e => (e.target.src = $root.avatar('no_image'))"
  />
</template>

<script>
import { PNG1P } from '@/utils/constant';

export default {
  name: 'avatar',
  props: {
    name: String,
  },
  data: () => ({
    PNG1P,
  }),
};
</script>
