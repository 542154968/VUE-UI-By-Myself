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
  instance._remove = function() {
    document.body.removeChild(instance.$el);
  };
  // 传入参数 props
  instance.msg = options.msg
  instance.type = options.type
  instance.cancel = function() {
        typeof options.cancel === 'function' && options.cancel();
        instance._remove();
    };
    instance.confirm = function() {
        typeof options.confirm === 'function' && options.confirm();
        instance._remove();
    };
  // 添加到dom中
  document.body.appendChild(instance.$el)
}
// 加上这个可以直接在vue全局调用 
Vue.prototype.$Message = Message;

export default Message
