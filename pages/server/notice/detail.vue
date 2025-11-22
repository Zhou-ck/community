<template>
  <view class="notice-detail-page">
    <!-- 自定义导航栏 -->
    <view class="navbar-wrapper" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar">
        <view class="navbar-left" @click="goBack">
          <uni-icons type="back" size="24" color="#333"></uni-icons>
        </view>
        <view class="navbar-title">公告详情</view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <view class="content-wrapper">
      <view class="detail-card" v-if="notice">
        <view class="detail-header">
          <view class="detail-title">{{ notice.title }}</view>
          <view class="detail-meta">
            <text class="detail-time">{{ notice.time }}</text>
            <view class="detail-tag" :class="{ important: notice.important }">
              {{ notice.important ? '重要' : '普通' }}
            </view>
          </view>
        </view>
        <view class="divider"></view>
        <view class="detail-content">
          <text>{{ notice.content }}</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <uni-icons type="info" size="48" color="#ccc"></uni-icons>
        <text class="empty-text">未找到公告信息</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      notice: null
    }
  },
  onLoad(options) {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0

    // 获取传递的参数
    if (options.item) {
      try {
        this.notice = JSON.parse(decodeURIComponent(options.item))
      } catch (e) {
        console.error('解析公告数据失败', e)
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4f7 0%, #f8f9fa 100%);
}

/* 导航栏 */
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 999;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
}

.navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.navbar-left,
.navbar-right {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 1rpx;
}

.content-wrapper {
  padding: 40rpx 24rpx 24rpx;
  animation: slideUp 0.5s ease backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.detail-header {
  margin-bottom: 32rpx;
}

.detail-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 24rpx;
}

.detail-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-time {
  font-size: 26rpx;
  color: #999;
}

.detail-tag {
  padding: 8rpx 24rpx;
  border-radius: 100rpx;
  font-size: 24rpx;
  font-weight: 500;
  background: #f5f7fa;
  color: #666;

  &.important {
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.2);
  }
}

.divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 32rpx 0;
}

.detail-content {
  font-size: 32rpx;
  color: #555;
  line-height: 1.8;
  white-space: pre-wrap;
  text-align: justify;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>