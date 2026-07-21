<script>
  import config from './config'
  import store from '@/store'
  import { getToken } from '@/utils/auth'
  import { startAutoRefresh, stopAutoRefresh, initTokenTimestamp } from '@/utils/token-refresh'

  export default {
    data() {
      return {
        refreshTokenTimer: null
      }
    },
    onLaunch: function() {
      this.initApp()
    },
    onShow: function() {
      // 检查用户登录状态并刷新社区信息（用于从后台切回前台时检查Token过期）
      if (getToken()) {
        store.dispatch('CheckTokenAndRefreshCommunity')
        // 启动token自动刷新（如果还没有启动）
        if (!this.refreshTokenTimer) {
          this.refreshTokenTimer = startAutoRefresh()
        }
      }
    },
    onHide: function() {
      // 应用进入后台时停止自动刷新，节省资源
      // 注意：不完全停止，因为token可能需要在后台继续刷新
      // 这里只是记录状态
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
        // 如果已登录，初始化token时间戳并启动自动刷新
        if (getToken()) {
          initTokenTimestamp()
          this.refreshTokenTimer = startAutoRefresh()
        }
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
  
  /* 全局字体系统 - 品牌字体栈 */
  page, body {
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
    font-variant-numeric: tabular-nums;
    
    /* 品牌色 CSS 变量 */
    --color-primary: #E07A4F;
    --color-primary-dark: #C96A42;
    --color-primary-light: #FFF0E8;
    --color-secondary: #4A9E8E;
    --color-warn: #E8A84C;
    --color-error: #D95C5C;
    --color-success: #5AAB7A;
    
    /* 交互过渡 CSS 变量 */
    --press-duration: 200ms;
    --press-timing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --press-transform-card: scale(0.997);
    --press-transform-btn: scale(0.96);
    
    /* 排版字号 CSS 变量 */
    --text-xs: 20rpx;
    --text-sm: 24rpx;
    --text-base: 26rpx;
    --text-md: 28rpx;
    --text-lg: 32rpx;
    --text-xl: 36rpx;
    --text-2xl: 40rpx;
    --text-3xl: 48rpx;
    
    --lh-tight: 1.2;
    --lh-normal: 1.5;
    --lh-loose: 1.8;
  }
  
  /* 全局按压态 class（用于非 scoped 场景） */
  .press {
    cursor: pointer;
    transition: all var(--press-duration) var(--press-timing);
    
    &:active {
      transform: scale(0.97);
      opacity: 0.8;
    }
  }
  
  .press-card {
    cursor: pointer;
    transition: all var(--press-duration) var(--press-timing);
    
    &:active {
      transform: var(--press-transform-card);
      background: rgba(0, 0, 0, 0.02);
    }
  }
  
  .press-btn {
    cursor: pointer;
    transition: all var(--press-duration) var(--press-timing);
    
    &:active {
      transform: var(--press-transform-btn);
      opacity: 0.9;
      box-shadow: none;
    }
  }
  
  /* fontB 图标字形（合并到 iconfontA 体系） */
  @font-face {
    font-family: "iconfontA";
    src: url('@/static/fontB/iconfont.woff2') format('woff2'),
         url('@/static/fontB/iconfont.ttf') format('truetype');
    unicode-range: U+e600-e700;
  }
</style>
