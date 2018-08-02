<template>
  <div :class="type">
    {{msg}}
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: '提示文字'
    },
    type: {
      type: String,
      default: ''
    }
  },
  mounted () {
    console.log('可以获取dom了')
  },
  data () {
    return {}
  }
}
</script>

<style lang="scss">
.text-success {
  color: green;
}
</style>
