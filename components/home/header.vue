<template>
  <view class="home-header">
    <view class="header-bg"></view>
    <view class="header-content">
      <view class="avatar">{{ avatarText }}</view>
      <view class="header-text">
        <view class="welcome">欢迎，{{ userName || '用户' }}</view>
        <view class="community" @click="onCommunityClick">
          <uni-icons v-if="communityName" type="location-filled" size="13" color="#fff"></uni-icons>
          <text v-if="communityName" class="community-name">{{ communityName }}</text>
          <text v-else class="community-empty">您尚未加入社区，点击加入 ›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomeHeader',
  props: {
    userName: { type: String, default: '' },
    communityName: { type: String, default: '' }
  },
  computed: {
    avatarText() {
      const n = this.userName || '用'
      return n.charAt(0)
    }
  },
  methods: {
    onCommunityClick() {
      if (!this.communityName) {
        uni.navigateTo({ url: '/pages/my/joincommunity/index' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-header {
  position: relative;
  padding: 40rpx 32rpx 48rpx;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #a8e6cf 0%, #5AAB7A 100%);
    border-bottom-left-radius: 36rpx;
    border-bottom-right-radius: 36rpx;
  }

  .header-content {
    position: relative;
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .avatar {
    width: 84rpx;
    height: 84rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.28);
    border: 2rpx solid rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 38rpx;
    font-weight: 600;
    flex-shrink: 0;
  }

  .header-text {
    flex: 1;
    min-width: 0;
  }

  .welcome {
    font-size: 38rpx;
    font-weight: 600;
    color: #fff;
    line-height: 1.3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .community {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;

    .community-name {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.95);
      max-width: 380rpx;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .community-empty {
      font-size: 24rpx;
      color: #fff;
    }
  }
}
</style>
