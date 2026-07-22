<template>
  <view class="package-card press-card" @click="$emit('click')">
    <view class="card-head">
      <view class="icon-badge">
        <uni-icons type="gift-filled" size="20" color="#fff"></uni-icons>
      </view>
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
          <text class="pkg-remain">{{ item.remaining }}<text class="pkg-total">/{{ item.total }}{{ item.unit || '次' }}</text></text>
        </view>
        <view class="progress">
          <view class="progress-bar" :style="{ width: progressWidth(item) + '%' }"></view>
        </view>
      </view>
    </view>
    <view v-else class="empty-block">
      <uni-icons type="gift" size="40" color="#B8D8D8"></uni-icons>
      <text class="empty-text">你还未订购套餐</text>
      <text class="empty-link">请前去订购 ›</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PackageUsageCard',
  props: {
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
  border-radius: 24rpx;
  padding: 28rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 320rpx;
  box-shadow: 0 6rpx 20rpx rgba(54, 179, 179, 0.1);
  border-top: 6rpx solid #36b3b3;

  .card-head {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .icon-badge {
      width: 52rpx;
      height: 52rpx;
      border-radius: 14rpx;
      background: linear-gradient(135deg, #36b3b3 0%, #5AC9C9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 10rpx rgba(54, 179, 179, 0.35);
    }

    .card-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #222;
    }
  }

  .package-list {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 18rpx;

    .package-item {
      .pkg-info {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 10rpx;

        .pkg-name { font-size: 26rpx; color: #333; }
        .pkg-remain {
          font-size: 28rpx;
          color: #36b3b3;
          font-weight: 600;
          .pkg-total { font-size: 22rpx; color: #bbb; font-weight: 400; }
        }
      }

      .progress {
        height: 12rpx;
        background: #f0f0f0;
        border-radius: 6rpx;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #36b3b3 0%, #5AC9C9 100%);
          border-radius: 6rpx;
          transition: width 0.3s;
        }
      }
    }
  }

  .empty-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    .empty-text { font-size: 26rpx; color: #999; }
    .empty-link { font-size: 26rpx; color: #36b3b3; }
  }
}
</style>
