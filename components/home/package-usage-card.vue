<template>
  <view class="package-card press-card" @click="$emit('click')">
    <view class="card-head">
      <text class="card-title">我的套餐</text>
    </view>
    <view v-if="packages && packages.length" class="package-list">
      <view
        v-for="(item, idx) in packages"
        :key="idx"
        class="package-item"
      >
        <view class="pkg-info">
          <text class="pkg-name">{{ item.name }}</text>
          <text class="pkg-remain">剩余 {{ item.remaining }}/{{ item.total }} {{ item.unit || '次' }}</text>
        </view>
        <view class="progress">
          <view class="progress-bar" :style="{ width: progressWidth(item) + '%' }"></view>
        </view>
      </view>
    </view>
    <view v-else class="empty-block">
      <text class="empty-text">你还未订购套餐，请前去订购 ›</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PackageUsageCard',
  props: {
    // packages: [{ name, remaining, total, unit }]
    packages: { type: Array, default: () => [] }
  },
  methods: {
    progressWidth(item) {
      if (!item || !item.total) return 0
      const r = Math.max(0, Math.min(item.remaining / item.total, 1))
      return Math.round(r * 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.package-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 280rpx;

  .card-head {
    .card-title { font-size: 30rpx; font-weight: 600; color: #222; }
  }

  .package-list {
    margin-top: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .package-item {
      .pkg-info {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 8rpx;

        .pkg-name { font-size: 26rpx; color: #333; }
        .pkg-remain { font-size: 22rpx; color: #999; }
      }

      .progress {
        height: 10rpx;
        background: #f0f0f0;
        border-radius: 6rpx;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #E07A4F 0%, #36b3b3 100%);
          border-radius: 6rpx;
          transition: width 0.3s;
        }
      }
    }
  }

  .empty-block {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-text { font-size: 26rpx; color: #E07A4F; text-align: center; }
  }
}
</style>
