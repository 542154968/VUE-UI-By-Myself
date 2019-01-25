# vue无缝滚动
> 源码

```vue
<template>
    <div class="wrap"
        :style="{height}"
        ref="wrapContain"
        @mouseenter="stopMove('mouseenter')"
        @mouseleave="startScroll('mouseenter')"
        @wheel="handleWheel">
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
        // 滚动区域高度
        height: {
            default: '40px',
            type: String
        },
        // 每个LI的高度
        itemHeight: {
            default: '20px',
            type: String,
            requir: true
        },
        // 数据数组
        datas: {
            default () {
                return []
            },
            type: Array
        },
        // 滚动速率  数字越大 滚动越快
        speed: {
            default: 0.5,
            type: Number
        },
        // 鼠标滚动系数 越大 滚动越快
        mouseScrollSpeed: {
            default: 8,
            type: Number
        },
        // 是否间隔滚动 每几秒翻滚一次
        intervalScroll: {
            default: false,
            type: Boolean
        },
        // 间隔滚动时间
        intervalTime: {
            default: 5000,
            type: Number
        },
        // 这个随便false true  用来数据改变后 重新初始化组件
        resetScroll: {
            default: false,
            type: Boolean
        }
    },
    mounted () {
        // this.setData()
    },
    beforeDestroy () {
        this.stopMove()
        this.removeDocumentEvent()
        cancelAnimationFrame(this.intervalAnimatTimeId)
    },
    watch: {
        resetScroll () {
            this.setData()
        }
    },
    data () {
        return {
            // 每次滚动时间Id
            timeId: null,
            //
            intervalAnimatTimeId: null,
            // 间隔滚动时间
            intervalTimeId: null,
            // ul的高度
            ulHeight: 0,
            // 当前滚动距离
            curScroll: 0,
            // 间隔滚动 下次要滚动的距离
            targetScroll: 0,
            dataList: [],
            // 是否正在滚动  避免鼠标重复触发滚动 在滚动没完成时再触发会乱掉 滚动距离
            scrollStaus: false,
            activeIndex: 0
        }
    },
    methods: {
        // 鼠标滚动的时候
        handleWheel (e) {
            if (this.dataList.length <= 1) {
                return
            }
            if (this.intervalScroll) {
                this.intervalMouseMove(e)
            } else {
                this.curScroll = e.deltaY < 0 ? this.curScroll - this.mouseScrollSpeed : this.curScroll + this.mouseScrollSpeed
                if (-this.curScroll >= 0) {
                    this.curScroll = this.ulHeight
                }
                this.handleWheelMove()
            }
        },
        intervalMouseMove (e) {
            if (this.scrollStaus === true) {
                return
            }
            // this.intervalMoveFun(e.deltaY < 0 ? 'down' : 'up')
            if (e.deltaY > 0) {
                // 向下滚动
                this.intervalMoveDownFun()
            } else {
                // 向上滚动
                // this.intervalMoveUpFun()
            }
        },
        // 鼠标滚动
        handleWheelMove () {
            cancelAnimationFrame(this.timeId)
            this.timeId = requestAnimationFrame(this.handelScroll)
        },
        // 可能在li的高度被撑开的时候 这个计算有问题  比如 li的高度大于设置的 20  受盒模型影响
        setData () {
            const itemHeight = this.getNum(this.itemHeight)
            this.stopMove()
            this.$refs.wrapContain.style.transform = `translate3d(0, 0, 0)`
            this.curScroll = 0
            // 如果li的高度 大于 滚动区域的高度 那么就滚动
            const curHeight = this.datas.length * itemHeight
            this.ulHeight = curHeight
            this.dataList = new Array(curHeight > this.getNum(this.height) ? 2 : 1).fill(this.datas)
            this.startScroll()
        },
        // 序列成数字
        getNum (str) {
            return Number(str.replace(/[a-zA-Z]+/, ''))
        },
        // 开始滚动
        startScroll (type) {
            this.removeDocumentEvent()
            if (this.dataList.length > 1) {
                this.$nextTick().then(() => {
                    this.intervalScroll ? this.intervalMove() : this.handleMove()
                })
            } else {
                this.stopMove()
            }
        },
        // 每次滚动 50px 等待3s
        intervalMove () {
            this.intervalTimeId = setInterval(() => {
                this.intervalMoveDownFun()
            }, this.intervalTime)
        },
        intervalMoveFun (type) {
            const itemHeight = this.getNum(this.itemHeight)
            this.targetScroll = type === 'up' ? this.curScroll - itemHeight : this.curScroll + itemHeight
            if (Math.abs(this.targetScroll) > Math.abs(this.ulHeight)) {
                this.$refs.wrapContain.style.transform = `translate3d(0, 0, 0)`
                this.curScroll = 0
                this.targetScroll = this.curScroll - itemHeight
            }
            this.scrollStaus = true
            type === 'up' ? this.handleIntervalUpMove() : this.handleIntervalMove()
        },
        intervalMoveUpFun () {
            const itemHeight = this.getNum(this.itemHeight)
            this.targetScroll = this.curScroll - itemHeight
            if (Math.abs(this.targetScroll) > Math.abs(this.ulHeight)) {
                this.$refs.wrapContain.style.transform = `translate3d(0, 0, 0)`
                this.curScroll = 0
                this.targetScroll = this.curScroll - itemHeight
            }
            this.scrollStaus = true
            this.handleIntervalUpMove()
        },
        intervalMoveDownFun () {
            const itemHeight = this.getNum(this.itemHeight)
            this.activeIndex++
            this.targetScroll = itemHeight * this.activeIndex
            // 如果下次目标滚动距离 大于 最大可滚动距离的话
            if (this.targetScroll > this.ulHeight) {
                this.$refs.wrapContain.style.transform = `translate3d(0, 0, 0)`
                this.curScroll = 0
                this.activeIndex = 1
                this.targetScroll = itemHeight * this.activeIndex
            }
            this.scrollStaus = true
            this.handleIntervalMove()
        },
        handleIntervalUpMove () {
            cancelAnimationFrame(this.timeId)
            this.timeId = requestAnimationFrame(this.handleIntervalUpMove)
            this.curScroll = this.curScroll - this.speed
            if (this.curScroll <= this.targetScroll) {
                this.curScroll = this.targetScroll
                cancelAnimationFrame(this.timeId)
                this.scrollStaus = false
            }

            this.$refs.wrapContain.style.transform = `translate3d(0, ${this.curScroll}px, 0)`
        },

        handleIntervalMove () {
            cancelAnimationFrame(this.timeId)
            this.intervalAnimatTimeId = requestAnimationFrame(this.handleIntervalMove)
            this.curScroll = this.curScroll + this.speed
            if (this.curScroll >= this.targetScroll) {
                this.curScroll = this.targetScroll
                cancelAnimationFrame(this.intervalAnimatTimeId)
                this.scrollStaus = false
            }
            this.handelScroll()
        },
        handleMove () {
            cancelAnimationFrame(this.timeId)
            this.timeId = requestAnimationFrame(this.handleMove)
            this.curScroll = this.curScroll + this.speed
            this.handelScroll()
        },
        handelScroll () {
            if (this.curScroll > this.ulHeight) {
                // this.$refs.wrap.style.transform = `translate3d(0, 0, 0)`
                // this.$refs.wrapContain.scrollTo(0, Max)
                // 计算一下偏差 避免 轻微抖动
                const Max = this.curScroll - this.ulHeight
                this.scrollTo(0, Max)
                this.curScroll = 0
            } else {
                // this.$refs.wrap.style.transform = `translate3d(0, -${this.curScroll}px, 0)`
                // this.$refs.wrapContain.scrollTo(0, this.curScroll)
                this.scrollTo(0, this.curScroll)
            }
        },
        scrollTo (x, y) {
            const $el = this.$refs.wrapContain
            $el.scrollTo ? $el.scrollTo(x, y) : ($el.scrollTop = y)
        },
        // s鼠标进入
        stopMove (type) {
            this.dataList.length > 1 && type === 'mouseenter' && this.addDocumentEvent()
            cancelAnimationFrame(this.timeId)
            this.intervalScroll && clearInterval(this.intervalTimeId)
        },
        addDocumentEvent () {
            document.addEventListener('mousewheel', this.stopWheel)
            document.addEventListener('DOMMouseScroll', this.stopWheel)
        },
        removeDocumentEvent () {
            document.removeEventListener('mousewheel', this.stopWheel)
            document.removeEventListener('DOMMouseScroll', this.stopWheel)
        },
        stopWheel (event) {
            event.preventDefault()
        }
    }
}
</script>

<style lang="scss" >
.wrap {
    transform-style: preserve-3d;
    .wrap-contain {
        perspective: 1000;
        backface-visibility: hidden;
    }
}
</style>
```

> 调用方式

```vue
<template>
    <div class="terminal"
        <VerticalScroll :datas="dataList"
                :resetScroll="resetScroll"
                height="186px"
                itemHeight="30px"
                v-loading="pageLoading">
                <template slot-scope="datas">
                    <li class="tabs"
                        v-for="(item) in datas.data"
                        :key="item.id">
                        <span>{{item.date}}</span>
                        <span>{{item.count}}</span>
                        <span>{{item.percent}}</span></li>
                </template>
            </VerticalScroll>
    </div>
</template>

<script>
export default {
    data () {
        return {
            resetScroll: false,
            pageLoading: false,
            dataList: []
        }
    },
    created () {
        this.loadData()
    },
    methods: {
        loadData (type = 'renew') {
            this.pageLoading = true
            getTerminal({
                type
            }).then(res => {
                this.pageLoading = false
                res = res.data
                this.dataList = Array.isArray(res.contentList) ? res.contentList : []
                // 初始化该组件
                this.resetScroll = !this.resetScroll
            }).catch(() => {
                this.pageLoading = false
            })
        },
    }
}
</script>
