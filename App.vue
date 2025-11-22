<script>
  import config from './config'
  import store from '@/store'
  import { getToken } from '@/utils/auth'

  export default {
    onLaunch: function() {
      this.initApp()
    },
    onShow: function() {
      // 检查用户登录状态并刷新社区信息（用于从后台切回前台时检查Token过期）
      if (getToken()) {
        store.dispatch('CheckTokenAndRefreshCommunity')
      }
    },
    methods: {
      // 初始化应用
      initApp() {
        // 初始化应用配置
        this.initConfig()
        // 检查用户登录状态
        //#ifdef H5
        this.checkLogin()
        //#endif
      },
      initConfig() {
        this.globalData.config = config
      },
      checkLogin() {
        if (!getToken()) {
          this.$tab.reLaunch('/pages/login') 
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '@/static/scss/index.scss';
  @import '@/static/fontA/iconfont.css';
  @import '@/static/fontB/iconfont.css';
</style>
