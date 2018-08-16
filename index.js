import Msg from './index.vue'
import Vue from 'vue'
// const plugin = {}

// plugin.install = function (Vue, options) {
//   let Parent = Vue.extend(Msg)
//   const instance = new Parent().$mount(document.createElement('div'))
//   document.body.appendChild(instance.$el)
// }

let Message = function (options) {
  // 获取组件内容
  const $msg = Vue.extend(Msg)
  // 实例化并挂载
  const instance = new $msg().$mount(document.createElement('div'))
  // 传入参数 props
  instance.msg = options.msg
  instance.type = options.type
  // 添加到dom中
  document.body.appendChild(instance.$el)
}

export default Message