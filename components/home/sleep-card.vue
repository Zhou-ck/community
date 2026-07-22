<template>
  <view class="sleep-card press-card" @click="$emit('click')">
    <template v-if="hasData">
      <view class="card-head">
        <view class="icon-badge">
          <uni-icons type="star-filled" size="20" color="#fff"></uni-icons>
        </view>
        <text class="card-title">近7天睡眠</text>
      </view>
      <view class="chart">
        <view
          v-for="(item, idx) in chartData"
          :key="idx"
          class="bar-col"
          :class="{ today: idx === chartData.length - 1 }"
        >
          <view class="bar-wrap">
            <view
              class="bar"
              :style="{ height: barHeight(item.hours) + 'rpx' }"
            ></view>
          </view>
          <text class="bar-label">{{ item.label }}</text>
        </view>
      </view>
      <view class="footer-row">
        <text class="last-label">昨晚睡眠</text>
        <text class="last-value">{{ lastNight }} 小时</text>
      </view>
    </template>
    <view v-else class="empty-block">
      <uni-icons type="star" size="40" color="#C5CCE8"></uni-icons>
      <text class="empty-text">暂无睡眠数据</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SleepCard',
  props: {
    sleep: { type: Object, default: () => ({}) }
  },
  computed: {
    arr() {
      return (this.sleep && this.sleep.last7Days) || []
    },
    hasData() {
      return this.arr.length > 0
    },
    lastNight() {
      if (this.arr.length === 0) return 0
      const v = this.arr[this.arr.length - 1]
      return v != null ? v : (this.sleep && this.sleep.lastNightDuration) || 0
    },
    maxHours() {
      const m = Math.max(...this.arr.filter(v => v != null), 0)
      return m > 0 ? m : 8
    },
    chartData() {
      const labels = ['一', '二', '三', '四', '五', '六', '今']
      const len = this.arr.length
      const start = Math.max(0, 7 - len)
      return this.arr.map((hours, i) => ({
        hours,
        label: labels[start + i] || ''
      }))
    }
  },
  methods: {
    barHeight(hours) {
      if (hours == null) return 0
      const ratio = Math.min(hours / this.maxHours, 1)
      return Math.max(ratio * 130, 8)
    }
  }
}
</script>

<style lang="scss" scoped>
.sleep-card {
  background: linear-gradient(160deg, #E8ECFF 0%, #F4F6FF 100%);
  border-radius: 24rpx;
  padding: 28rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 320rpx;
  box-shadow: 0 6rpx 20rpx rgba(108, 124, 224, 0.12);

  .card-head {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .icon-badge {
      width: 52rpx;
      height: 52rpx;
      border-radius: 14rpx;
      background: linear-gradient(135deg, #6C7CE0 0%, #8B9AF0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 10rpx rgba(108, 124, 224, 0.35);
    }

    .card-title {
      font-size: 26rpx;
      color: #888;
    }
  }

  .chart {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 20rpx;
    gap: 10rpx;

    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .bar-wrap {
        height: 140rpx;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }

      .bar {
        width: 70%;
        max-width: 34rpx;
        background: linear-gradient(180deg, #8B9AF0 0%, #6C7CE0 100%);
        border-radius: 8rpx 8rpx 0 0;
      }

      &.today .bar {
        background: linear-gradient(180deg, #6C7CE0 0%, #4A5BCC 100%);
      }

      .bar-label {
        margin-top: 10rpx;
        font-size: 20rpx;
        color: #999;
      }
    }
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid rgba(108, 124, 224, 0.15);

    .last-label { font-size: 24rpx; color: #999; }
    .last-value { font-size: 30rpx; color: #333; font-weight: 600; }
  }

  .empty-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14rpx;

    .empty-text { font-size: 26rpx; color: #999; }
  }
}
</style>
