<template>
  <view class="order-card press-card" @click="$emit('click')">
    <view class="card-head">
      <view class="icon-badge">
        <uni-icons type="list" size="20" color="#fff"></uni-icons>
      </view>
      <text class="card-title">今日订单</text>
      <text class="sub" v-if="summary">{{ summary.completed }}/{{ summary.total }}</text>
    </view>
    <view v-if="summary && summary.list && summary.list.length" class="order-list">
      <view
        v-for="(item, idx) in displayList"
        :key="idx"
        class="order-item"
      >
        <view class="status-dot" :class="statusClass(item.status)"></view>
        <text class="order-name">{{ item.name }}</text>
        <text class="order-status" :class="statusClass(item.status)">{{ item.statusName }}</text>
      </view>
      <view v-if="extraCount > 0" class="more">+{{ extraCount }} 更多</view>
    </view>
    <view v-else class="empty-block">
      <uni-icons type="list" size="36" color="#F0D8C8"></uni-icons>
      <text class="empty-text">今日暂无已完成订单</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TodayOrderCard',
  props: {
    summary: { type: Object, default: () => ({}) }
  },
  computed: {
    list() {
      return (this.summary && this.summary.list) || []
    },
    displayList() {
      return this.list.slice(0, 4)
    },
    extraCount() {
      return this.list.length - this.displayList.length
    }
  },
  methods: {
    statusClass(status) {
      if (status === '2') return 'st-done'
      if (status === '1' || status === '3') return 'st-progress'
      return 'st-other'
    }
  }
}
</script>

<style lang="scss" scoped>
.order-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 320rpx;
  box-shadow: 0 6rpx 20rpx rgba(224, 122, 79, 0.1);
  border-top: 6rpx solid #E07A4F;

  .card-head {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .icon-badge {
      width: 52rpx;
      height: 52rpx;
      border-radius: 14rpx;
      background: linear-gradient(135deg, #E07A4F 0%, #F0A07A 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 10rpx rgba(224, 122, 79, 0.35);
    }

    .card-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #222;
      flex: 1;
    }

    .sub {
      font-size: 24rpx;
      color: #E07A4F;
      font-weight: 600;
      background: rgba(224, 122, 79, 0.1);
      padding: 4rpx 14rpx;
      border-radius: 16rpx;
    }
  }

  .order-list {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .order-item {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .status-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        flex-shrink: 0;
        &.st-done { background: #5AAB7A; }
        &.st-progress { background: #E07A4F; }
        &.st-other { background: #ccc; }
      }

      .order-name {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .order-status {
        font-size: 22rpx;
        padding: 4rpx 14rpx;
        border-radius: 16rpx;
        flex-shrink: 0;
        &.st-done { background: rgba(90,171,122,0.12); color: #5AAB7A; }
        &.st-progress { background: rgba(224,122,79,0.12); color: #E07A4F; }
        &.st-other { background: #f0f0f0; color: #999; }
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
  }
}
</style>
