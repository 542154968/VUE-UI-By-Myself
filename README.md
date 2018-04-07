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

# showImgWithRadius
> 模仿QQ空间移动客户端的随着屏幕滚动图片呈现半圆形展现的效果 用`range`模仿窗口滚动

- ![变化效果1](https://github.com/542154968/Vue-UI/blob/master/showImgWithRadius/demoImg/1.jpg)
- ![变化效果2](https://github.com/542154968/Vue-UI/blob/master/showImgWithRadius/demoImg/2.jpg)
- ![变化效果3](https://github.com/542154968/Vue-UI/blob/master/showImgWithRadius/demoImg/3.jpg)
- ![变化效果4](https://github.com/542154968/Vue-UI/blob/master/showImgWithRadius/demoImg/4.jpg)
- ![变化效果5](https://github.com/542154968/Vue-UI/blob/master/showImgWithRadius/demoImg/5.jpg)
