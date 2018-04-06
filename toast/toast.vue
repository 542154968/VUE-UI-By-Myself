<template>
    <transition name="hide" >
        <div class="toast" v-show="active" >
            {{msg}}
        </div>
    </transition>
</template>

<script>
export default {
    data(){
        return {
            active: false,
            msg: ''
        }
    }
}
</script>

<style lang="stylus" scoped>
    .toast
        position fixed
        padding 10px 20px
        background rgba(0, 0, 0, 0.7)
        color #fff
        border-radius 4px
        margin 0 auto
        left: 50%
        top 20px
        transition all .3s
        transform translate(-50%, 0px)
        opacity 1
    .hide-enter, .hide-leave-to 
        transform: translate(-50%, -100px)
        opacity 0
        
</style>
