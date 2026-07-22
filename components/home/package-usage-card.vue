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
        v-for="(item, idx) in displayList"
        :key="idx"
        class="package-item"
      >
        <text class="pkg-name">{{ item.name }}</text>
        <text class="pkg-status" :class="statusClass(item.status)">{{ item.statusText || '使用中' }}</text>
      </view>
      <view v-if="extraCount > 0" class="more">+{{ extraCount }} 个套餐</view>
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
  computed: {
    displayList() {
      return this.packages.slice(0, 3)
    },
    extraCount() {
      return this.packages.length - this.displayList.length
    }
  },
  methods: {
    // 套餐实例状态：ACTIVE 使用中 / REFUND_PENDING 退订审核中 / EXPIRED 已过期 / CANCELLED 已取消 等
    statusClass(status) {
      if (status === 'ACTIVE') return 'st-active'
      if (status === 'REFUND_PENDING') return 'st-refund'
      if (status === 'EXPIRED' || status === 'CANCELLED' || status === 'REFUNDED' || status === 'REJECTED') return 'st-expired'
      return 'st-active'
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
      flex-shrink: 0;
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
    gap: 20rpx;

    .package-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16rpx;

      .pkg-name {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .pkg-status {
        font-size: 22rpx;
        padding: 4rpx 14rpx;
        border-radius: 16rpx;
        flex-shrink: 0;
        &.st-active { background: rgba(54,179,179,0.12); color: #36b3b3; }
        &.st-refund { background: rgba(224,122,79,0.12); color: #E07A4F; }
        &.st-expired { background: #f0f0f0; color: #999; }
      }
    }

    .more {
      font-size: 22rpx;
      color: #999;
      text-align: right;
      padding-top: 4rpx;
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
