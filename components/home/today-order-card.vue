<template>
  <view class="order-card press-card" @click="$emit('click')">
    <view class="card-head">
      <text class="card-title">今日订单</text>
      <text class="sub" v-if="summary">已完成 {{ summary.completed }}/{{ summary.total }} 项</text>
    </view>
    <view v-if="summary && summary.list && summary.list.length" class="order-list">
      <view
        v-for="(item, idx) in displayList"
        :key="idx"
        class="order-item"
      >
        <text class="order-name">{{ item.name }}</text>
        <text class="order-status" :class="statusClass(item.status)">{{ item.statusName }}</text>
      </view>
      <view v-if="extraCount > 0" class="more">+{{ extraCount }} 更多</view>
    </view>
    <view v-else class="empty-block">
      <text class="empty-text">今日暂无已完成订单</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TodayOrderCard',
  props: {
    // summary: { total, completed, list: [{ name, status, statusName }] }
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
      // '2' 已完成（绿）, '1' 待服务（橙）, '3' 进行中（橙）
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
  border-radius: 20rpx;
  padding: 24rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 280rpx;

  .card-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    .card-title { font-size: 30rpx; font-weight: 600; color: #222; }
    .sub { font-size: 22rpx; color: #999; }
  }

  .order-list {
    margin-top: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .order-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .order-name {
        font-size: 26rpx;
        color: #333;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-right: 12rpx;
      }

      .order-status {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        &.st-done { background: rgba(90,171,122,0.12); color: #5AAB7A; }
        &.st-progress { background: rgba(224,122,79,0.12); color: #E07A4F; }
        &.st-other { background: #f0f0f0; color: #999; }
      }
    }

    .more {
      font-size: 22rpx;
      color: #999;
      text-align: right;
    }
  }

  .empty-block {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .empty-text { font-size: 26rpx; color: #999; }
  }
}
</style>
