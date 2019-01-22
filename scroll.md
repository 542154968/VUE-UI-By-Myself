# vue无缝滚动
> 源码

```vue
<template>
    <div class="wrap"
        :style="{height}"
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
        // 这个随便false true  用来数据改变后 重新初始化组件
        resetScroll: {
            default: false,
            type: Boolean
        }
    },
    mounted () {
        this.setData()
    },
    beforeDestroy () {
        this.stopMove()
        this.removeDocumentEvent()
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
            // ul的高度
            ulHeight: 0,
            // 当前滚动距离
            curScroll: 0,
            dataList: []
        }
    },
    methods: {
        handleWheel (e) {
            if (this.dataList.length <= 1) {
                return
            }
            this.curScroll = e.wheelDelta > 0 ? this.curScroll - this.mouseScrollSpeed : this.curScroll + this.mouseScrollSpeed
            if (-this.curScroll >= 0) {
                this.curScroll = this.ulHeight
            }
            this.handleWheelMove()
        },
        handleWheelMove () {
            cancelAnimationFrame(this.timeId)
            this.timeId = requestAnimationFrame(this.handelScroll)
        },
        // 可能在li的高度被撑开的时候 这个计算有问题  比如 li的高度大于设置的 20  受盒模型影响
        setData () {
            this.stopMove()
            this.$refs.wrap.style.transform = `translate3d(0, 0, 0)`
            this.curScroll = 0
            // 如果li的高度 大于 滚动区域的高度 那么就滚动
            const curHeight = this.datas.length * this.getNum(this.itemHeight)
            this.ulHeight = curHeight
            this.dataList = new Array(curHeight > this.getNum(this.height) ? 2 : 1).fill(this.datas)
            this.startScroll()
        },
        getNum (str) {
            return Number(str.replace(/[a-zA-Z]+/, ''))
        },
        startScroll (type) {
            this.removeDocumentEvent()

            if (this.dataList.length > 1) {
                this.$nextTick().then(() => {
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
            cancelAnimationFrame(this.timeId)
            this.timeId = requestAnimationFrame(this.handleMove)
            this.curScroll = this.curScroll + this.speed
            this.handelScroll()
        },
        handelScroll () {
            if (this.curScroll > this.ulHeight) {
                this.$refs.wrap.style.transform = `translate3d(0, 0, 0)`
                this.curScroll = 0
            } else {
                this.$refs.wrap.style.transform = `translate3d(0, -${this.curScroll}px, 0)`
            }
        },
        // s鼠标进入
        stopMove (type) {
            this.dataList.length > 1 && type === 'mouseenter' && this.addDocumentEvent()
            cancelAnimationFrame(this.timeId)
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
    .wrap-contain {
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
