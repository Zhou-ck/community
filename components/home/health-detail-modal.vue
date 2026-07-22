<template>
  <uni-popup ref="popup" type="center" :mask-click="true" @change="onPopupChange">
    <view class="health-modal">
      <view class="modal-header">
        <text class="modal-title">{{ memberName }}的健康数据</text>
        <view class="close-btn" @click="close">
          <uni-icons type="close" size="22" color="#666"></uni-icons>
        </view>
      </view>

      <scroll-view scroll-y class="modal-body">
        <view v-if="hasData">
          <view class="section-title">实时数据</view>
          <view class="metric-grid">
            <view class="metric">
              <text class="m-label">心率</text>
              <text class="m-value">{{ health.heartRate }}<text class="m-unit">次/分</text></text>
            </view>
            <view class="metric">
              <text class="m-label">体温</text>
              <text class="m-value">{{ health.temperature }}<text class="m-unit">℃</text></text>
            </view>
            <view class="metric">
              <text class="m-label">呼吸</text>
              <text class="m-value">{{ health.respiratoryRate }}<text class="m-unit">次/分</text></text>
            </view>
            <view class="metric">
              <text class="m-label">血氧</text>
              <text class="m-value">{{ health.bloodOxygen }}<text class="m-unit">%</text></text>
            </view>
            <view class="metric">
              <text class="m-label">血压</text>
              <text class="m-value" v-if="health.bloodPressure">{{ health.bloodPressure.systolic }}/{{ health.bloodPressure.diastolic }}<text class="m-unit">mmHg</text></text>
              <text class="m-value" v-else>--</text>
            </view>
            <view class="metric">
              <text class="m-label">血糖</text>
              <text class="m-value">{{ health.bloodSugar }}<text class="m-unit">mmol/L</text></text>
            </view>
          </view>

          <view class="inbed-row">
            <text class="row-label">在床状态</text>
            <text class="row-value" :class="{ 'in-bed': health.inBedStatus === 1 }">
              {{ health.inBedStatusName || (health.inBedStatus === 1 ? '在床' : '离床') }}
            </text>
          </view>

          <view class="section-title sleep-title">睡眠概览</view>
          <view class="sleep-overview">
            <view class="sleep-item">
              <text class="s-label">睡眠时长</text>
              <text class="s-value">{{ sleepDuration }} 小时</text>
            </view>
            <view class="sleep-item">
              <text class="s-label">入睡时间</text>
              <text class="s-value">{{ (health.sleep && health.sleep.fallAsleepTime) || '--' }}</text>
            </view>
            <view class="sleep-item">
              <text class="s-label">起床时间</text>
              <text class="s-value">{{ (health.sleep && health.sleep.wakeUpTime) || '--' }}</text>
            </view>
          </view>

          <view class="report-link" @click="goSleepReport">
            <text>查看完整睡眠报告</text>
            <uni-icons type="arrowright" size="16" color="#E07A4F"></uni-icons>
          </view>
          <view class="update-tip">数据更新于 {{ health.updateTime || '--' }}</view>
        </view>

        <view v-else class="modal-empty">
          <text>暂无健康数据</text>
        </view>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'HealthDetailModal',
  props: {
    health: { type: Object, default: () => ({}) },
    memberName: { type: String, default: '' }
  },
  computed: {
    hasData() {
      const h = this.health || {}
      return h.heartRate != null || h.temperature != null || (h.sleep && h.sleep.last7Days)
    },
    sleepDuration() {
      const s = this.health && this.health.sleep
      return s && s.lastNightDuration != null ? s.lastNightDuration : '--'
    }
  },
  methods: {
    open() {
      this.$refs.popup.open('center')
    },
    close() {
      this.$refs.popup.close()
    },
    onPopupChange(e) {
      // e.show=true 弹窗打开；false 关闭
      this.$emit('change', e.show)
    },
    goSleepReport() {
      this.close()
      uni.navigateTo({ url: '/pages/my/sleep-report/sleep-report' })
    }
  }
}
</script>

<style lang="scss" scoped>
.health-modal {
  width: 690rpx;
  max-height: 90vh;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .modal-title { font-size: 32rpx; font-weight: 600; color: #222; }
    .close-btn { padding: 8rpx; }
  }

  .modal-body {
    flex: 1;
    padding: 24rpx 32rpx 32rpx;
  }

  .section-title {
    font-size: 26rpx;
    color: #999;
    margin: 16rpx 0 16rpx;
    &.sleep-title { margin-top: 32rpx; }
  }

  .metric-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .metric {
      width: calc((100% - 32rpx) / 3);
      background: #fafafa;
      border-radius: 16rpx;
      padding: 20rpx 16rpx;
      box-sizing: border-box;

      .m-label { font-size: 22rpx; color: #999; display: block; }
      .m-value {
        font-size: 40rpx;
        font-weight: 600;
        color: #222;
        margin-top: 8rpx;
        display: block;
        .m-unit { font-size: 20rpx; color: #999; font-weight: 400; margin-left: 4rpx; }
      }
    }
  }

  .inbed-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fafafa;
    border-radius: 16rpx;
    padding: 24rpx 20rpx;
    margin-top: 16rpx;

    .row-label { font-size: 26rpx; color: #666; }
    .row-value { font-size: 28rpx; color: #999; font-weight: 500; &.in-bed { color: #5AAB7A; } }
  }

  .sleep-overview {
    display: flex;
    gap: 16rpx;

    .sleep-item {
      flex: 1;
      background: #fafafa;
      border-radius: 16rpx;
      padding: 20rpx 16rpx;
      text-align: center;

      .s-label { font-size: 22rpx; color: #999; display: block; }
      .s-value { font-size: 28rpx; color: #333; font-weight: 600; margin-top: 8rpx; display: block; }
    }
  }

  .report-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin-top: 32rpx;
    padding: 20rpx;
    border: 1rpx solid #E07A4F;
    border-radius: 44rpx;
    color: #E07A4F;
    font-size: 28rpx;
  }

  .update-tip {
    text-align: center;
    font-size: 20rpx;
    color: #ccc;
    margin-top: 20rpx;
  }

  .modal-empty {
    padding: 80rpx 0;
    text-align: center;
    color: #999;
    font-size: 28rpx;
  }
}
</style>
