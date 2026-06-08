<template>
  <view class="empty-state" :class="[type ? `empty-state--${type}` : '']">
    <view class="empty-icon-wrapper">
      <uni-icons :type="icon" :size="iconSize" :color="iconColor"></uni-icons>
    </view>
    <text class="empty-text">{{ text }}</text>
    <text v-if="subtext" class="empty-subtext">{{ subtext }}</text>
    <view v-if="buttonText" class="empty-action" @click="handleAction">
      <text class="empty-action-text">{{ buttonText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    type: {
      type: String,
      default: '',
      validator: v => ['', 'no-data', 'no-result', 'no-network'].includes(v)
    },
    icon: {
      type: String,
      default: 'inbox'
    },
    iconSize: {
      type: Number,
      default: 64
    },
    iconColor: {
      type: String,
      default: '#d9d9d9'
    },
    text: {
      type: String,
      default: '暂无数据'
    },
    subtext: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleAction() {
      this.$emit('action')
    }
  }
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  width: 100%;
  box-sizing: border-box;
}

.empty-icon-wrapper {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  line-height: 1.4;
}

.empty-subtext {
  font-size: 24rpx;
  color: #c0c4cc;
  text-align: center;
  margin-top: 12rpx;
  line-height: 1.4;
}

.empty-action {
  margin-top: 32rpx;
  padding: 18rpx 48rpx;
  background: #E07A4F;
  border-radius: 40rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-action:active {
  transform: scale(0.96);
  opacity: 0.9;
}

.empty-action-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

/* 变体微调 */
.empty-state--no-network .empty-icon-wrapper {
  background: #FFF0E8;
}

.empty-state--no-result .empty-icon-wrapper {
  background: #f0f5ff;
}
</style>
