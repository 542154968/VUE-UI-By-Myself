# vue无缝滚动
> 源码

```vue
<template>
    <div class="wrap"
        :style="{height}"
        @mouseenter="stopMove"
        @mouseleave="handleMove">
        <div class="wrap-contain"
            ref="wrap">
            <ul ref="ul"
                v-for="(item, i) in dataList"
                :key="i">
                <slot :data="item"></slot>
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
        itemHeight: {
            default: '20px',
            type: String,
            requir: true
        },
        datas: {
            default () {
                return ['李乾坤', '王宇', '夏海洋', '曾丽', '张厚奇', '牛朋朋', '程帧', '排名不分先后', '李乾坤', '王宇', '夏海洋', '曾丽', '张厚奇', '牛朋朋', '程帧', '排名不分先后', '李乾坤', '王宇', '夏海洋', '曾丽', '张厚奇', '牛朋朋', '程帧', '排名不分先后']
            },
            type: Array
        }
    },
    mounted () {
        this.setData()
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
            dataList: []
        }
    },
    methods: {
        // 可能在li的高度被撑开的时候 这个计算有问题  比如 li的高度大于设置的 20  受盒模型影响
        setData () {
            // 如果li的高度 大于 滚动区域的高度 那么就滚动
            const curHeight = this.datas.length * this.getNum(this.itemHeight)
            this.dataList = new Array(curHeight > this.getNum(this.height) ? 2 : 1).fill(this.datas)
            this.startScroll()
        },
        getNum (str) {
            return Number(str.replace(/[a-zA-Z]+/, ''))
        },
        startScroll () {
            if (this.dataList.length > 1) {
                this.$nextTick().then(() => {
                    this.getUlHeight()
                    this.handleMove()
                })
            } else {
                this.stopMove()
            }
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

<style lang="scss" >
</style>


```

> 调用方式

```vue
<template>
    <div class="terminal"
        <VerticalScroll height="256px"
            itemHeight="40px">
            <template slot-scope="datas">
                <li v-for="(item , index) in datas.data"
                    :key="`${item}${index}`">{{item}}</li>
            </template>
        </VerticalScroll>
    </div>
</template>
