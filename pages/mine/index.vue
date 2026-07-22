<template>
  <view class="mine-container">
    <!--顶部个人信息栏-->
    <view class="header-section">
      <view class="status-bar"></view>
      <view class="header-content">
        <view class="user-card">
          <view class="avatar-section" @click="handleToAvatar">
            <view v-if="!avatar" class="default-avatar">
              <uni-icons type="person-filled" size="40" color="#999"></uni-icons>
            </view>
            <image v-if="avatar" :src="avatar" class="user-avatar" mode="aspectFill"></image>
          </view>
          <view class="user-content">
            <view v-if="!name" @click="handleToLogin" class="login-section">
              <text class="login-text">点击登录</text>
              <text class="login-desc">登录后享受更多服务</text>
            </view>
            <view v-if="name" class="user-info">
              <text class="user-name">{{ name }}</text>
              <text class="user-desc" @touchstart="startLongPress" @touchend="cancelLongPress" @touchcancel="cancelLongPress">智慧养老服务用户</text>
            </view>
          </view>
        </view>
        <view @click="handleToInfo" class="profile-btn">
          <text class="profile-text">个人资料</text>
          <uni-icons type="right" size="16" color="#FFF"></uni-icons>
        </view>
      </view>
    </view>

    <view class="content-section">
     

      <!-- 快捷操作 -->
      <view class="quick-actions-new">
        <view class="action-item-new" @click="handleJoinCommunity">
          <text class="iconfontA icon-shequ action-icon-color"></text>
          <text class="action-text-new">加入社区</text>
        </view>
        <view class="action-item-new" @click="handleAddress">
          <text class="iconfontA icon-dizhi action-icon-color"></text>
          <text class="action-text-new">服务地址</text>
        </view>
        
        <view class="action-item-new" @click="handleFamily">
          <text class="iconfontA icon-jigoubanji action-icon-color action-icon-small-2"></text>
          <text class="action-text-new text-small-2">家庭成员</text>
        </view>
        <view class="action-item-new" @click="handleHealth">
          <text class="iconfontA icon-jiankangdangan1 action-icon-color action-icon-small"></text>
          <text class="action-text-new text-small">健康档案</text>
        </view>
        <view class="action-item-new" @click="handleUseRecords">
          <uni-icons type="list" size="28" color="#3ec6c6"></uni-icons>
          <text class="action-text-new text-small">使用记录</text>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-container">
        <view v-if="showDevTools" class="menu-item" @click="handleAlarmreceiver">
          <view class="menu-icon-wrapper" style="background-color: #87CEFA;">
           <uni-icons type="personadd" size="20" color="#fff"></uni-icons>
          </view>
          <view class="menu-content">
            <text class="menu-title">接警人</text>
            <text class="menu-desc">管理接警人</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view v-if="showDevTools" class="menu-item" @click="handleBalancePackage">
          <view class="menu-icon-wrapper" style="background-color: #E3F2FD;">
            <uni-icons type="wallet" size="20" color="#E07A4F"></uni-icons>
          </view>
          <view class="menu-content">
            <text class="menu-title">设备套餐</text>
            <text class="menu-desc">购买通话短信套餐</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="handleServiceCategory">
          <view class="menu-icon-wrapper" style="background-color: #E8F4FF;">
            <uni-icons type="grid" size="20" color="#3FA9E7"></uni-icons>
          </view>
          <view class="menu-content">
            <text class="menu-title">服务分类</text>
            <text class="menu-desc">浏览全部六助服务</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>

        <view class="menu-item" @click="handleServicePackage">
          <view class="menu-icon-wrapper" style="background-color: #F3E5F5;">
            <uni-icons type="gift" size="20" color="#9C27B0"></uni-icons>
          </view>
          <view class="menu-content">
            <text class="menu-title">服务套餐</text>
            <text class="menu-desc">查看我的服务套餐</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view v-if="showDevTools" class="menu-item" @click="handleDevice">
          <view class="menu-icon-wrapper" style="background-color: #FFF3E0;">
            <text class="iconfontA icon-shebeiguanli" style="color: #E8A84C; font-size: 20px;"></text>
          </view>
          <view class="menu-content">
            <text class="menu-title">设备管理</text>
            <text class="menu-desc">实时监控健康数据</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="handleAbout">
          <view class="menu-icon-wrapper" style="background-color: #FCE4EC;">
            <uni-icons type="heart" size="20" color="#E91E63"></uni-icons>
          </view>
          <view class="menu-content">
            <text class="menu-title">关于我们</text>
            <text class="menu-desc">了解更多信息</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="handleToSetting">
          <view class="menu-icon-wrapper" style="background-color: #E8F5E8;">
            <uni-icons type="gear" size="20" color="#5AAB7A"></uni-icons>
          </view>
          <view class="menu-content">
            <text class="menu-title">应用设置</text>
            <text class="menu-desc">个性化配置</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        showDevTools: false
      }
    },
    computed: {
      name() {
        return this.$store.state.user.name
      },
      avatar() {
        return this.$store.getters.avatar
      }
    },
    methods: {
      startLongPress() {
        this._longPressTimer = setTimeout(() => {
          this.showDevTools = true;
        }, 2000);
      },
      cancelLongPress() {
        clearTimeout(this._longPressTimer);
      },
      // 检查登录状态
      checkLogin() {
        if (!this.$store.getters.token) {
          uni.showModal({
            title: '提示',
            content: '请先登录后再使用此功能',
            confirmText: '去登录',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.$tab.reLaunch('/pages/login')
              }
            }
          })
          return false
        }
        return true
      },
      
      handleToInfo() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/info/index')
      },
      handleToSetting() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/setting/index')
      },
      handleToLogin() {
        this.$tab.reLaunch('/pages/login')
      },
      handleToAvatar() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/avatar/index')
      },
      handleDevice() {
        if (!this.checkLogin()) return
        this.$tab.switchTab('/pages/device/index')
      },
      handleAlarmreceiver() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/alarmreceiver/index')
      },
      handleAbout() {
        // 关于我们是公开信息，不需要登录
        this.$tab.navigateTo('/pages/my/about/index')
      },
      handleJoinCommunity() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/joincommunity/index')
      },
      handleFamily(){
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/family/index')
      },
      handleHealth() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/health/index')
      },
      handleUseRecords() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/use-records/index')
      },
      handleAddress() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/address/index')
      },
      handleBalancePackage() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/my/balancePackage/index')
      },
      handleServicePackage() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/server/SetMeal/index?tab=my')
      },
      handleServiceCategory() {
        if (!this.checkLogin()) return
        this.$tab.navigateTo('/pages/work/index')
      }
    }
  }
</script>

<style lang="scss" scoped>
@import '@/static/fontA/iconfont.css';

page {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.mine-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* 头部区域 */
.header-section {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
  padding-bottom: 60rpx;
  position: relative;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  transform: rotate(15deg);
}

.status-bar {
  height: var(--status-bar-height, 44rpx);
}

.header-content {
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.user-card {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar-section {
  position: relative;
  margin-right: 30rpx;
}

.default-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  border: 6rpx solid rgba(255, 255, 255, 0.3);
}


.user-content {
  flex: 1;
}

.login-section, .user-info {
  display: flex;
  flex-direction: column;
}

.login-text, .user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.login-desc, .user-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}


.profile-btn {
  padding: 12rpx 20rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  gap: 6rpx;
}

.profile-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.25);
}

.profile-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 400;
  letter-spacing: 0.5rpx;
}

/* 内容区域 */
.content-section {
  margin-top: -40rpx;
  padding: 0 30rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  position: relative;
  z-index: 3;
}

/* 快捷操作 */
.quick-actions-new {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
}

.action-item-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.action-icon-color {
  font-size: 72rpx;
  margin-bottom: 12rpx;
  display: block;
  transition: transform 0.3s ease;
}

.action-icon-small {
  margin-top: 9rpx;
  font-size: 59rpx !important;
  // margin-bottom: 8rpx;
}

.action-icon-small-2 {
  font-size: 73rpx !important;
  // margin-bottom: 8rpx;
}
.action-item-new:active .action-icon-color {
  transform: scale(0.9);
}

.action-text-new {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.text-small{
  margin-top: 7rpx;
}

.text-small-2 {
  margin-top: 3rpx;
}

/* 菜单容器 */
.menu-container {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background-color 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: #f8f9fa;
}

.menu-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: #999;
}
</style>
