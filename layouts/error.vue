<template lang="pug">
  div
    h1 Error {{ error.statusCode }}
    p {{ error.message }}
</template>

<script>
export default {
  props: ['error']
}
</script>

<style lang="sass" scoped>

</style>

