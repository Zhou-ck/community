<template>
  <view class="home-header">
    <view class="welcome">欢迎，{{ userName || '用户' }}</view>
    <view class="community" @click="onCommunityClick">
      <text v-if="communityName">{{ communityName }}</text>
      <text v-else class="community-empty">您尚未加入社区，点击加入 ›</text>
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
  padding: 32rpx 32rpx 16rpx;
  background: #fff;

  .welcome {
    font-size: 40rpx;
    font-weight: 600;
    color: #222;
    line-height: 1.3;
  }

  .community {
    margin-top: 8rpx;
    font-size: 26rpx;
    color: #666;

    .community-empty {
      color: #E07A4F;
    }
  }
}
</style>
