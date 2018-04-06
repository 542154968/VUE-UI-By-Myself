import Toast from './toast.vue'

let plugin = {};

// 插件必须有一个install方法
// options 全局的配置项
plugin.install = function( Vue, options = {} ){
    // 继承Toast组件中的所有方法
    const ToastController = Vue.extend( Toast );
    // 关闭方法
    ToastController.prototype.close = function( body ){
        setTimeout( ()=>{
            this.active = false;
            setTimeout( ()=>{
                body.removeChild( this.$el )
                // 这个是css设置的动画时长
            }, 1000 )
        }, this.duration )
    }
    ToastController.prototype.open = function(){
        this.active = true; 
    }
    ToastController.prototype.addDom = function( body ){
        hideAll();
        body.appendChild( this.$el );
        function hideAll(){
            let $toast = document.querySelectorAll('.toast'),
                l = $toast.length;
            for( let i = 0; i < l; i++ ){
                $toast[i] && ( $toast[i].style.display = 'none' )
            }
        }
    }
    // 在Vue原型实现toast的DOM挂在、功能
    // 用户可以通过在Vue实例通过this.$toast来访问
    // option 单个的配置项
    Vue.prototype.$toast = ( option = {} ) => {
        let body = document.body || document.getElementsByTagName('body')[0],
            instance = new ToastController().$mount( document.createElement('div') );
        instance.duration = option.duration || options.duration || 4000;
        instance.msg = typeof option === 'string' ? option : option.msg;
        // 添加dom
        instance.addDom( body )
        // 打开遮罩
        instance.open()
        // 自动关闭遮罩
        instance.close( body );
        // 监听遮罩关闭的动画过程
        // instance.$el.addEventListener( 'transitionend', function(){
        //     // 可以打印下看到有四个动画过程 但是有时候并不精确 放弃了这种方法
            
        // } )
    } 
}

export default plugin
