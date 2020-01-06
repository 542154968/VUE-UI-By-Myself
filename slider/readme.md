# 基于element-ui的样式实现左右拖拽slider

## 效果图

- ![效果1](https://github.com/542154968/Vue-UI/blob/master/slider/images/eg-1.jpg)
- ![效果2](https://github.com/542154968/Vue-UI/blob/master/slider/images/eg-2.jpg)

### 实现代码

```vue
<template>
  <div class="el-slider split">
    <div class="el-slider__runway" ref="contain">
      <div
        class="el-slider__bar left"
        :style="{
          background: `linear-gradient(90deg, #e4e7ed ${
            barPercent.left
          }%, #ff814a 0%)`
        }"
      ></div>
      <div
        class="el-slider__bar right"
        :style="{
          background: `linear-gradient(90deg, #4a9bff ${
            barPercent.right
          }%, #e4e7ed 0%)`
        }"
      ></div>
      <div
        :class="['el-slider__button-wrapper', { dragging: isMoveing }]"
        :style="{ left: offsetLeft + '%' }"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      >
        <div
          :class="['el-tooltip el-slider__button', { dragging: isMoveing }]"
          ref="sliderBtn"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: "value",
    event: "mousemove"
  },
  props: {
    max: {
      default: 100,
      type: Number
    },
    min: {
      default: -100,
      type: Number
    },
    value: {
      default: 0,
      type: Number
    }
  },
  data() {
    return {
      offsetLeft: 50,
      offsetX: 0,
      parentX: 0,
      isMoveing: false,
      barPercent: {
        // 同时改彩色部分渲染效果不一致 所以左边的改白底部分
        left: 100,
        right: 0
      },
      containWidth: 0
    };
  },
  beforeDestroy() {
    this.removeEvent();
  },
  watch: {
    value: {
      handler(num) {
        this.setSliderBarLeft(num);
      },
      immediate: true
    }
  },
  computed: {},
  methods: {
    formatNum(num) {
      return (isNaN(num) ? 0 : num).toFixed(6);
    },
    handleMouseDown(event) {
      // 先计算出点击的位置 相当于left多少
      // 计算出偏移位置  点击位置 - btn的left
      const $parent = this.$refs.contain;
      const $parentBounding = $parent.getBoundingClientRect();
      const $btn = this.$refs.sliderBtn;
      this.offsetX = event.clientX - $btn.getBoundingClientRect().left;
      this.parentX = $parentBounding.left;
      this.containWidth = $parentBounding.width;
      this.isMoveing = true;
      this.addEvent();
    },
    handleMouseUp() {
      this.isMoveing = false;
      this.removeEvent();
    },
    addEvent() {
      document.addEventListener("mousemove", this.handleMove);
      document.addEventListener("mouseup", this.handleMouseUp);
    },
    removeEvent() {
      document.removeEventListener("mousemove", this.handleMove);
      document.removeEventListener("mouseup", this.handleMouseUp);
    },
    handleMove(event) {
      const { clientX } = event;
      // 为啥这里多了个8  因为按钮是16  偏移到最开始最左边并不在轴最左边 中间位置是16 / 2 就是偏移8
      let left = (
        ((clientX - this.parentX - this.offsetX + 8) / this.containWidth) *
        100
      ).toFixed(6);
      if (left >= 100) {
        left = 100;
      } else if (left <= 0) {
        left = 0;
      }
      this.offsetLeft = left;
      this.setSliderBarColor(left);
      this.triggerChange(left);
    },
    setSliderBarColor(offsetLeft) {
      // 大于50%的时候说明是加的部分
      if (offsetLeft >= 50) {
        // 求出多多少
        const percent = this.formatNum(((100 - offsetLeft) / 50) * 100);

        this.barPercent = {
          left: 100,
          right: 100 - percent
        };
      } else {
        const percent = this.formatNum(((50 - offsetLeft) / 50) * 100);
        this.barPercent = {
          left: 100 - percent,
          right: 0
        };
      }
    },
    getCenterNum() {
      const sum = this.max + this.min;
      // 获取余数
      const remainder = sum % 2;
      return remainder === 0 ? sum / 2 : sum / 2 + remainder;
    },
    triggerChange(offsetLeft) {
      const centerNum = this.getCenterNum();
      this.$emit(
        "mousemove",
        offsetLeft >= 50
          ? ((this.max - centerNum) / 50) * (offsetLeft - 50)
          : ((centerNum - this.min) / 50) * (offsetLeft - 50)
      );
    },
    setSliderBarLeft(num) {
      const offsetLeft = this.formatNum(
        ((num - this.min) / (this.max - this.min)) * 100
      );
      this.setSliderBarColor(offsetLeft);
      this.offsetLeft = offsetLeft;
    }
  }
};
</script>
<style lang="scss">

  .el-slider.split {
    .el-slider__button-wrapper {
      left: 50%;
    }
    .el-slider__button:hover,
    .el-slider__button.hover,
    .el-slider__button.dragging {
      transform: none;
    }
    .el-slider__bar {
      &.left {
        border-radius: 3px 0 0 3px;
        width: 50%;
        left: 0;
      }
      &.right {
        border-radius: 0 3px 3px 0;
        width: 50%;
        right: 0;
      }
    }
  }

</style>

```

#### 使用方式

1. 引入
```javascript
import Slide from "@components/Slide";
```
2. 传值
```template
<Slide :max="16" :min="-16" v-model="value1"></Slide>
```