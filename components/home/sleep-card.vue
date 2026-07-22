<template>
  <view class="sleep-card press-card" @click="$emit('click')">
    <template v-if="hasData">
      <view class="card-head">
        <view class="dot sleep-dot"></view>
        <text class="card-title">近7天睡眠</text>
      </view>
      <view class="chart">
        <view
          v-for="(item, idx) in chartData"
          :key="idx"
          class="bar-col"
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
        <text class="last-label">昨晚</text>
        <text class="last-value">{{ lastNight }} 小时</text>
      </view>
    </template>
    <view v-else class="empty-block">
      <text class="empty-text">暂无睡眠数据</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SleepCard',
  props: {
    // sleep: { last7Days: [..7个时长(小时)], lastNightDuration: number }
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
      return Math.max(ratio * 120, 8) // 最多 120rpx，最少 8rpx
    }
  }
}
</script>

<style lang="scss" scoped>
.sleep-card {
  background: #F0F8FF;
  border-radius: 20rpx;
  padding: 24rpx;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
    .sleep-dot { background: #36b3b3; }

    .card-title {
      font-size: 26rpx;
      color: #666;
    }
  }

  .chart {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: 16rpx;
    gap: 8rpx;

    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .bar-wrap {
        height: 130rpx;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }

      .bar {
        width: 70%;
        max-width: 36rpx;
        background: linear-gradient(180deg, #36b3b3 0%, #5AB8C9 100%);
        border-radius: 8rpx 8rpx 0 0;
        transition: height 0.3s;
      }

      .bar-label {
        margin-top: 8rpx;
        font-size: 20rpx;
        color: #999;
      }
    }
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid rgba(54, 179, 179, 0.15);

    .last-label { font-size: 24rpx; color: #999; }
    .last-value { font-size: 28rpx; color: #333; font-weight: 500; }
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
