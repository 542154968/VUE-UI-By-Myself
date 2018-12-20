
```vue
<template>
  <div 
    ref="zan" 
    class="zan">
    <button @click="handleZan"><i class="iconfont icon-zan"/> 赞 <span>({{ likeCount }})</span></button>
  </div>
</template>

<script>
export default {
  props: {
    likeCount: {
      default: 0,
      type: Number
    }
  },
  data() {
    return {
      zan: null
    }
  },
  beforeDestroy() {
    this.zan = null
  },
  methods: {
    handleZan() {
      this.$emit('handleClick', {})
    },
    start() {
      function Zan(opt) {
        if (!(this instanceof Zan)) {
          return new Zan(opt)
        }
        this.curOpt = Object.assign(
          {
            el: document.querySelector('.zan')
          },
          opt
        )
        // 偏移 x
        this.x = 0
        // 当前DOM的el
        this.el = null
        this.timeId = null

        // 初始化
        this._init()
      }
      Zan.prototype = {
        constructor: Zan,
        _init() {
          this._setRange()
          this._createAndAddDom()
          this._start()
          this._remove()
        },
        // 获取范围
        _setRange() {
          // x最大范围 -100% ~ 100%  y最大范围 10 ~ 100% 因为不能往下
          this.x = this._getRandomNumBoth(-30, 50)
        },
        // 获取随机数
        _getRandomNumBoth(Min, Max) {
          var Range = Max - Min
          var Rand = Math.random()
          var num = Min + Math.round(Rand * Range) //四舍五入
          return num
        },
        _getRandomColor() {
          const colorArr = [
            '#67C23A',
            '#E6A23C',
            '#F56C6C',
            '#eb6120',
            '#409EFF',
            '#fefa50',
            '#ff00a8',
            '#fcab11'
          ]
          return colorArr[this._getRandomNumBoth(0, colorArr.length - 1)]
        },
        _createAndAddDom() {
          this.el = document.createElement('i')
          this.el.setAttribute('class', 'iconfont icon-zan item')
          this.curOpt.el.appendChild(this.el)
        },
        _start() {
          // 延迟是为了等待dom添加
          setTimeout(() => {
            this.el.style.transform = `translate(${
              this.x
            }px, -160px) scale(1.6)`
            this.el.style.color = this._getRandomColor()
            this.el.style.opacity = 0
          }, 20)
        },
        _remove() {
          this.timeId = setTimeout(() => {
            this.curOpt.el.removeChild(this.el)
          }, 2000)
        }
      }
      this.zan = new Zan({
        el: this.$refs.zan
      })
    }
  }
}
</script>

<style lang="stylus" >
.news-detail-contain {
  .zan {
    float: left;
    position: relative;

    span {
      display: inline-block;
      font-size: 12px;
      transition: transform 0.15s;
    }

    button {
      position: relative;
      width: 88px;
      height: 40px;
      line-height: 36px;
      margin-top: 52px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      background: $baseC;
      color: #fff;
      cursor: pointer;
      transition: transform 0.15s cubic-bezier(0.3, 0, 0.2, 2);
      z-index: 2;

      &:hover {
        transform: scale(0.96);
      }
    }

    i.item {
      position: absolute;
      z-index: 1;
      left: 36px;
      bottom: 0;
      transform: translateX(-50%);
      font-size: 20px;
      opacity: 1;
      display: inline-block;
      transition: transform 1s ease-in-out, color 0.5s, opacity 1s;
    }
  }
}
</style>

```
