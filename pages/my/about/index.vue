<template>
  <view class="page-container">
    <!-- 内容区域 -->
    <view class="content-section">
      <!-- Logo卡片 -->
      <view class="logo-card">
        <view class="logo-wrapper">
          <image class="app-logo" src="/static/logo200.png" mode="aspectFit"></image>
        </view>
        <view class="app-info">
          <text class="app-name">社区六助APP</text>
          <text class="app-desc">山东坤安特智能科技股份有限公司</text>
          <view class="version-badge">
            <text class="version-text">v{{ version }}</text>
          </view>
        </view>
      </view>

      <!-- 信息卡片列表 -->
      <view class="info-cards">
        <!-- 版本信息 -->
        <view class="info-card">
          <view class="card-icon version-icon">
            <uni-icons type="info-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">版本信息</text>
            <text class="card-value">v{{ version }}</text>
          </view>
        </view>

        <!-- 官方邮箱 -->
        <view class="info-card clickable-card" @click="copyEmail">
          <view class="card-icon email-icon">
            <uni-icons type="email-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">官方邮箱</text>
            <text class="card-value email-text">15005460333@163.com</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="copy" size="16" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 服务热线 -->
        <view class="info-card clickable-card" @click="makePhoneCall">
          <view class="card-icon phone-icon">
            <uni-icons type="phone-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">服务热线</text>
            <text class="card-value phone-text">0546-8080588</text>
          </view>
        </view>

        <!-- 公司网站 -->
        <view class="info-card clickable-card" @click="openWebsite">
          <view class="card-icon web-icon">
            <uni-icons type="home-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">官方网站</text>
            <text class="card-value link-text">www.katlot.cn</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>

    </view>

    <!-- 版权信息 -->
    <view class="copyright-section">
      <text class="copyright-text">Copyright © 2025 山东坤安特智能科技股份有限公司</text>
      <text class="copyright-desc">All Rights Reserved</text>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        version: getApp().globalData.config.appInfo.version
      }
    },
    methods: {
      copyEmail() {
        const email = 'info@kuante.com'
        uni.setClipboardData({
          data: email,
          success: () => {
            uni.showToast({
              title: '邮箱已复制',
              icon: 'success'
            })
          },
          fail: () => {
            uni.showToast({
              title: '复制失败',
              icon: 'none'
            })
          }
        })
      },
      makePhoneCall() {
        const phoneNumber = '400-888-6666'
        uni.showModal({
          title: '拨打电话',
          content: `确定要拨打服务热线：${phoneNumber} 吗？`,
          success: (res) => {
            if (res.confirm) {
              uni.makePhoneCall({
                phoneNumber: phoneNumber,
                success: () => {
                  console.log('拨打电话成功')
                },
                fail: (err) => {
                  console.error('拨打电话失败:', err)
                  uni.showToast({
                    title: '拨打失败，请手动拨打',
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      },
      openWebsite() {
        const websiteUrl = 'http://www.katlot.cn/'
        uni.showModal({
          title: '访问官网',
          content: `即将跳转到山东坤安特智能科技股份有限公司官网：${websiteUrl}`,
          confirmText: '前往',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // #ifdef H5
              window.open(websiteUrl, '_blank')
              // #endif
              
              // #ifdef APP-PLUS
              plus.runtime.openURL(websiteUrl)
              // #endif
              
              // #ifdef MP
              uni.setClipboardData({
                data: websiteUrl,
                success: () => {
                  uni.showToast({
                    title: '网址已复制，请在浏览器中打开',
                    icon: 'none',
                    duration: 3000
                  })
                }
              })
              // #endif
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
page {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}


/* 内容区域 */
.content-section {
  padding: 30rpx;
}

/* Logo卡片 */
.logo-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo-wrapper {
  margin-bottom: 30rpx;
}

.app-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(168, 230, 207, 0.3);
}

.app-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.app-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  font-style: italic;
}

.version-badge {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(168, 230, 207, 0.3);
}

.version-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

/* 信息卡片 */
.info-cards {
  margin-bottom: 30rpx;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
}

.clickable-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.clickable-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.card-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.link-text {
  color: #a8e6cf !important;
  text-decoration: underline;
}

.phone-text {
  color: #4facfe !important;
  font-weight: 600;
}

.email-text {
  color: #333 !important;
 
}

.card-arrow {
  margin-left: auto;
  padding-left: 20rpx;
}

/* 版权信息 */
.copyright-section {
  padding: 40rpx 30rpx;
  text-align: center;
}

.copyright-text {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.copyright-desc {
  display: block;
  font-size: 22rpx;
  color: #bbb;
}

/* 图标主题色 - 统一背景色 */
.version-icon,
.email-icon,
.phone-icon,
.web-icon {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8A3 100%);
}
</style>
