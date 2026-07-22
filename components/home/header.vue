<template>
  <view class="home-header">
    <!-- 状态栏占位（自定义导航需要避开系统状态栏） -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 自定义标题栏：与右上角胶囊按钮同高 -->
    <view class="custom-nav" :style="{ height: navBarHeight + 'px' }">
      <text class="nav-bracket">‹</text>
      <text class="nav-title">家庭守护</text>
      <text class="nav-bracket">›</text>
    </view>
    <!-- 家庭信息 -->
    <view class="header-body">
      <text class="user-name">{{ userName || '用户' }}</text>
      <view class="info-row">
        <text class="info-label">当前时间</text>
        <text class="info-value">{{ currentTime }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">所在社区</text>
        <text class="info-value">{{ communityName || '未加入' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomeHeader',
  props: {
    userName: { type: String, default: '' },
    communityName: { type: String, default: '' },
    lastRefreshTime: { type: Number, default: 0 }
  },
  data() {
    return {
      statusBarHeight: 20,
      navBarHeight: 44,
      currentTime: ''
    }
  },
  created() {
    const sysInfo = uni.getSystemInfoSync()
    this.statusBarHeight = sysInfo.statusBarHeight || 20
    // #ifdef MP-WEIXIN
    try {
      const menuBtn = uni.getMenuButtonBoundingClientRect()
      // 导航栏高度 = 胶囊按钮上下边距对称 + 胶囊自身高度
      this.navBarHeight = (menuBtn.top - this.statusBarHeight) * 2 + menuBtn.height
    } catch (e) {
      this.navBarHeight = 44
    }
    // #endif
  },
  mounted() {
    this.updateClock()
    this.clockTimer = setInterval(() => {
      this.updateClock()
    }, 1000)
  },
  beforeDestroy() {
    if (this.clockTimer) {
      clearInterval(this.clockTimer)
      this.clockTimer = null
    }
  },
  methods: {
    updateClock() {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      this.currentTime = `${h}:${m}:${s}`
    }
  }
}
</script>

<style lang="scss" scoped>
.home-header {
  position: relative;
  background: linear-gradient(165deg, #1677FF 0%, #4096FF 100%);
  border-bottom-left-radius: 32rpx;
  border-bottom-right-radius: 32rpx;
  padding: 0 36rpx 52rpx;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -15%;
    width: 180%;
    height: 180%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
    pointer-events: none;
  }
}

.status-bar {
  width: 100%;
}

.custom-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  position: relative;
  z-index: 1;

  .nav-bracket {
    font-size: 42rpx;
    color: rgba(255, 255, 255, 0.45);
    font-weight: 300;
    line-height: 1;
  }

  .nav-title {
    font-size: 36rpx;
    color: #fff;
    font-weight: 600;
    letter-spacing: 4rpx;
  }
}

.header-body {
  position: relative;
  z-index: 1;
  padding-top: 8rpx;

  .user-name {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 24rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-top: 12rpx;

    .info-label {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.6);
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 26rpx;
      color: #fff;
      font-weight: 500;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
