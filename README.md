# VUE-UI-By-Myself
> 工作中或者自己没事写的一些基础UI组件 一般功能都偏向定制和简单化的 扩展不多

# Toast
![Toast效果图](https://github.com/542154968/VUE-UI-By-Myself/blob/master/toast/%E6%95%88%E6%9E%9C%E5%9B%BE%E7%89%87.jpg)
- 暂时只支持上方的固定title提示 
- duration： 停留时长 默认 4000ms
- msg: 要显示的提示信息
- 调用方式
```javascript
import Vue from 'vue'
import Toast from '../../ui/toast/toast.js'
Vue.use( Toast )

export default {
    data() {
        return {

        }
    },
    mounted() {
        this.$toast('提示框显示了！')；
        // 或者
        this.$toast({ 
                msg: '提示框显示了！',
                duration: 2000
            })
    }
}
```
