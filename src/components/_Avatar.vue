<template>
  <img
    :src="name ? $root.avatar(name) : defaultAvatar"
    crossorigin="anonymous"
    @error="e => (e.target.src = defaultAvatar)"
  />
</template>

<script>
export default {
  name: 'avatar',
  props: {
    name: String,
  },
  data() {
    return {
      defaultAvatar: this.$root.avatar('no_image'),
    };
  },
};
</script>
