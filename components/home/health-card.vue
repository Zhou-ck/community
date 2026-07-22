<template>
  <view class="health-card press-card" @click="$emit('click')">
    <template v-if="hasData">
      <view class="card-head">
        <view class="dot heart-dot"></view>
        <text class="card-title">心率</text>
      </view>
      <view class="value-row">
        <text class="big-value">{{ health.heartRate }}</text>
        <text class="unit">次/分</text>
      </view>
      <view class="temp-row">
        <text class="temp-label">体温</text>
        <text class="temp-value">{{ health.temperature }}℃</text>
      </view>
    </template>
    <view v-else class="empty-block" @click.stop="goBindDevice">
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
      uni.navigateTo({ url: '/pages/device/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.health-card {
  background: #FFF5F0;
  border-radius: 20rpx;
  padding: 24rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280rpx;

  .card-head {
    display: flex;
    align-items: center;
    gap: 10rpx;

    .dot {
      width: 14rpx;
      height: 14rpx;
      border-radius: 50%;
    }
    .heart-dot { background: #E07A4F; }

    .card-title {
      font-size: 26rpx;
      color: #666;
    }
  }

  .value-row {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    margin-top: 12rpx;

    .big-value {
      font-size: 72rpx;
      font-weight: 700;
      color: #E07A4F;
      line-height: 1;
    }
    .unit {
      font-size: 24rpx;
      color: #999;
    }
  }

  .temp-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid rgba(224, 122, 79, 0.15);

    .temp-label { font-size: 24rpx; color: #999; }
    .temp-value { font-size: 30rpx; color: #333; font-weight: 500; }
  }

  .empty-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    .empty-text { font-size: 26rpx; color: #999; }
    .empty-link { font-size: 26rpx; color: #E07A4F; }
  }
}
</style>
