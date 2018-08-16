<template>
  <div :class="type">
    <p>{{msg}}<p>
    <button @click="cancel">取消</button>
    <button @click="confirm">确定</button>
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
  },
  methods: {
        cancel() {
        },
        confirm() {
        }
    }
}
</script>

<style lang="scss">
.text-success {
  color: green;
}
</style>
