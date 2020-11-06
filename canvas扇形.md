

```vue
<template>
  <div class="com-time-chart">
    <canvas width="23px" height="23px" ref="timeCanvas"></canvas>
  </div>
</template>

<script>
import { onBeforeUnmount, onMounted, watch } from '@vue/composition-api';
import TWEEN from '@tweenjs/tween.js';

export default {
  props: {
    isPlaying: {
      default: true,
      type: Boolean
    }
  },
  setup(props, { refs }) {
    // canvas的大小
    const CANVAS_SIZE = 23;
    // 一半canvas的大小 用来平移中心位置和设置半径
    const HALF_CANVAS_SIZE = CANVAS_SIZE / 2;
    // canvas dom 实例
    let timeCanvas = null;
    // canvas 实例对象
    let ctx = null;
    // animate实例
    let timeId = null;
    let tween = null;
    let curDeg = 0;

    watch(
      () => props.isPlaying,
      status => {
        if (status) {
          tween ? statAnimate(curDeg) : statAnimate(0);
        } else {
          tween && tween.stop();
        }
      }
    );

    /**
     * 初始化canvas
     */
    function init() {
      timeCanvas = refs.timeCanvas;
      ctx = timeCanvas.getContext('2d');
      movePieToCenter();
    }

    /**
     * 移动canvas到中心
     */
    function movePieToCenter() {
      ctx.translate(HALF_CANVAS_SIZE, HALF_CANVAS_SIZE);
    }

    /**
     * 每帧的绘制
     * @param {number} deg 绘制角度
     */
    function draw(deg) {
      // 清空画布
      resetCanvas();
      // 设置填充色
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      // 开始
      ctx.beginPath();
      // 位移到圆心，方便绘制
      // ctx.moveTo(w/2,h/2);
      ctx.moveTo(0, 0);
      // 绘制圆弧
      ctx.arc(
        0,
        0,
        HALF_CANVAS_SIZE,
        (-90 * Math.PI) / 180,
        ((-90 + deg) * Math.PI) / 180
      );
      // 闭合路径
      ctx.closePath();
      // 填充
      ctx.fill();
    }

    function statAnimate(startDeg = 0) {
      tween = new TWEEN.Tween({ deg: startDeg })
        .to({ deg: 360 }, 3000)
        .onUpdate(function({ deg }) {
          curDeg = deg;

          // deg > 360 && resetCanvas();

          draw(deg);
        })
        .start();
    }

    function resetCanvas() {
      // clearreact在这里不会清空 通过重设canvas大小来达到强制重新渲染的目的
      timeCanvas.height = CANVAS_SIZE;
      timeCanvas.width = CANVAS_SIZE;
      movePieToCenter();
    }

    function animate() {
      timeId = requestAnimationFrame(animate);
      TWEEN.update();
    }

    onMounted(() => {
      animate();
      init();
      props.isPlaying && statAnimate();
    });

    onBeforeUnmount(() => {
      cancelAnimationFrame(timeId);
    });
  }
};
</script>

<style></style>


```
