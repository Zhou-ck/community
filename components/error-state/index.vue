<template>
  <view class="error-state">
    <view class="error-icon-wrapper">
      <uni-icons type="info-filled" :size="iconSize" color="#E07A4F"></uni-icons>
    </view>
    <text class="error-message">{{ message }}</text>
    <text v-if="subMessage" class="error-sub-message">{{ subMessage }}</text>
    <view v-if="retry" class="error-retry" @click="handleRetry">
      <text class="error-retry-text">重新加载</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ErrorState',
  props: {
    message: {
      type: String,
      default: '加载失败，请重试'
    },
    subMessage: {
      type: String,
      default: ''
    },
    retry: {
      type: Boolean,
      default: true
    },
    iconSize: {
      type: Number,
      default: 56
    }
  },
  methods: {
    handleRetry() {
      this.$emit('retry')
    }
  }
}
</script>

<style lang="scss" scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  width: 100%;
  box-sizing: border-box;
}

.error-icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFF0E8;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.error-message {
  font-size: 28rpx;
  color: #606266;
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
}

.error-sub-message {
  font-size: 24rpx;
  color: #c0c4cc;
  text-align: center;
  margin-top: 12rpx;
  line-height: 1.4;
}

.error-retry {
  margin-top: 32rpx;
  padding: 16rpx 44rpx;
  border: 2rpx solid #E07A4F;
  border-radius: 40rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-retry:active {
  background: rgba(224, 122, 79, 0.06);
  transform: scale(0.97);
}

.error-retry-text {
  font-size: 26rpx;
  color: #E07A4F;
  font-weight: 500;
}
</style>
