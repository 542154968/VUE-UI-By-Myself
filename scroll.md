# vue无缝滚动
```vue
<template>
    <div class="wrap"
        :style="{height}">
        <div class="wrap-contain"
            ref="wrap">
            <ul ref="ul"
                @mouseenter="stopMove"
                @mouseleave="handleMove"
                v-for="(v, k) in dataList"
                :key="k">
                <li v-for="(item , index) in v"
                    :key="`${item}${index}`">{{item}}</li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        height: {
            default: '40px',
            type: String
        },
        datas: {
            default () {
                return []
            }
        }
    },
    mounted () {
        this.startScroll()
    },
    beforeDestroy () {
        this.stopMove()
    },
    data () {
        return {
            // 每次滚动时间Id
            timeId: null,
            // ul的高度
            ulHeight: 0,
            // 当前滚动距离
            curScroll: 0,
            // 滚动速率
            speed: 0.5,
			// 数据
            dataList: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
        }
    },
    methods: {
        startScroll () {
            this.$nextTick().then(() => {
                this.getUlHeight()
                this.handleMove()
            })
        },
        getUlHeight () {
            this.ulHeight = this.$refs.ul[0].offsetHeight
        },
        handleMove () {
            this.timeId = requestAnimationFrame(this.handleMove)
            this.curScroll = this.curScroll + this.speed
            if (this.curScroll >= this.ulHeight) {
                this.$refs.wrap.style.transform = `translate3d(0, 0, 0)`
                this.curScroll = 0
            } else {
                this.$refs.wrap.style.transform = `translate3d(0, -${this.curScroll}px, 0)`
            }
        },
        stopMove () {
            cancelAnimationFrame(this.timeId)
        }
    }
}
</script>

<style lang="scss" scoped>
.wrap {
    background: #fff;
    overflow: hidden;
}
.wrap-contain {
    ul {
        overflow: hidden;
        li {
            height: 20px;
            line-height: 20px;
        }
    }
}
</style>

```
