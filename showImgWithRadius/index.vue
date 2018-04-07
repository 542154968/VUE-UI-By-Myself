<template>
    <div>
        <div class="img-contain">
            <div class="img-bottom">
                <img src="./1.jpg" alt="" srcset="" ref="baseImg" @load="setImgHeight">
                <div class="img-top" 
                    :style="{   'height': height + 'px', 
                                'width': width + 'px', 
                                'top': '-' +  top + 'px', 
                                'left': '-' +  left + 'px', 
                                'background-origin' :  '-' +  top + 'px' + ' ' + '-' +  left + 'px',
                                'background-size': '100%' + bgImgHeight + 'px'
                            }">
                    
                </div>
            </div>
        </div>
        <input type="range" v-model="range">
        {{range}}
    </div>
    
</template>

<script>
export default {
    data(){
        return {
            range: 0,
            height: 0,
            width: 0,
            top: 0,
            left: 0,
            bgImgHeight: 0
        }
    },
    watch: {
        range( newVal, oldVal ){
            this.changeImg( newVal )
        }
    },
    mounted(){
        let timeId = null;
        timeId = setTimeout( ()=>{
            window.onresize = () => {
                clearTimeout( timeId )
                this.range = 0;
                this.changeImg(0)
                this.setImgHeight()
            }
        }, 200 )
    },
    methods: {
        changeImg( val ){
            let max = window.innerWidth * 2.5,
                range = max / 100;
            this.height = range * val;
            this.width = range * val;
            this.left = this.width / 2
            this.top = this.height / 2    
        },
        setImgHeight(){
            this.bgImgHeight = this.$refs.baseImg.clientHeight
        }
    }
}
</script>

<style lang="stylus">
.img-contain
    width 100%
    overflow hidden
    position relative
    .img-bottom, .img-top
        width 100%
        background-size 100%
        img
            width 100%
        .img-top
            position absolute
            width 500px
            position absolute
            top 0
            left 0
            overflow hidden
            border-radius 50%
            //background red
            background red url('./2.jpg') no-repeat
            background-size 100% 100%
            background-attachment fixed
            background-position right 0
</style>


