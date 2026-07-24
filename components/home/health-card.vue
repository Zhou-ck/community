<template>
  <view class="health-card press-card" @click="$emit('click')">
    <template v-if="hasData">
      <view class="card-head">
        <view class="icon-badge">
          <uni-icons type="heart-filled" size="20" color="#fff"></uni-icons>
        </view>
        <text class="card-title">心率</text>
      </view>
      <view class="value-row">
        <text class="big-value">{{ health.heartRate }}</text>
        <text class="unit">次/分</text>
      </view>
      <view class="temp-row">
        <view class="temp-item">
          <text class="temp-label">体温</text>
          <text class="temp-value">{{ health.temperature }}℃</text>
        </view>
      </view>
    </template>
    <view v-else class="empty-block" @click.stop="goBindDevice">
      <uni-icons type="heart" size="40" color="#FFB3C0"></uni-icons>
      <text class="empty-text">暂无设备数据</text>
      <text class="empty-link">去绑定设备 ›</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HealthCard',
  props: {
    health: { type: Object, default: () => ({}) }
  },
  computed: {
    hasData() {
      const h = this.health || {}
      return h.heartRate != null || h.temperature != null
    }
  },
  methods: {
    goBindDevice() {
      uni.switchTab({ url: '/pages/device/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.health-card {
  background: linear-gradient(160deg, #FFE8EC 0%, #FFF5F7 100%);
  border-radius: 24rpx;
  padding: 28rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 320rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.12);

  .card-head {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .icon-badge {
      width: 52rpx;
      height: 52rpx;
      border-radius: 14rpx;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 10rpx rgba(255, 107, 107, 0.35);
    }

    .card-title {
      font-size: 26rpx;
      color: #888;
    }
  }

  .value-row {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    margin-top: 20rpx;

    .big-value {
      font-size: 80rpx;
      font-weight: 700;
      color: #FF6B6B;
      line-height: 1;
    }
    .unit {
      font-size: 24rpx;
      color: #B0A0A4;
    }
  }

  .temp-row {
    margin-top: auto;
    padding-top: 20rpx;
    border-top: 1rpx solid rgba(255, 107, 107, 0.15);

    .temp-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .temp-label { font-size: 24rpx; color: #999; }
      .temp-value { font-size: 32rpx; color: #333; font-weight: 600; }
    }
  }

  .empty-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14rpx;

    .empty-text { font-size: 26rpx; color: #999; }
    .empty-link { font-size: 26rpx; color: #FF6B6B; }
  }
}
</style>
