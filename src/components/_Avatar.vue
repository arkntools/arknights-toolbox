<template>
  <img
    :src="name ? $root.avatar(name) : defaultAvatar"
    crossorigin="anonymous"
    @error="e => (e.target.src = $root.avatar('no_image'))"
  />
</template>

<script>
export default {
  name: 'avatar',
  props: {
    name: String,
  },
};
</script>
