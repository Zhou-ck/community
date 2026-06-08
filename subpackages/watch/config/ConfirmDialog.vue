<template>
  <view v-if="visible" class="confirm-mask" @click="handleCancel">
    <view class="confirm-dialog" @click.stop>
      <view class="confirm-icon">
        <text class="icon-text">!</text>
      </view>
      <view class="confirm-title">{{ title }}</view>
      <view class="confirm-content">{{ content }}</view>
      <view class="confirm-footer">
        <button v-if="showCancel" class="btn-cancel" @click="handleCancel">取消</button>
        <button class="btn-confirm" @click="handleConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  data() {
    return {
      visible: false,
      title: '提示',
      content: '',
      showCancel: true,
      resolvePromise: null
    }
  },
  methods: {
    show({ title = '提示', content = '', showCancel = true } = {}) {
      this.title = title
      this.content = content
      this.showCancel = showCancel
      this.visible = true
      return new Promise(resolve => {
        this.resolvePromise = resolve
      })
    },
    handleConfirm() {
      this.visible = false
      this.resolvePromise && this.resolvePromise({ confirm: true })
    },
    handleCancel() {
      this.visible = false
      this.resolvePromise && this.resolvePromise({ confirm: false })
    }
  }
}
</script>

<style scoped lang="scss">
.confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-dialog {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
  text-align: center;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

.confirm-icon {
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto 32rpx;
  background: linear-gradient(135deg, #E07A4F 0%, #E07A4F 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .icon-text {
    font-size: 48rpx;
    color: #fff;
    font-weight: bold;
  }
}

.confirm-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 20rpx;
}

.confirm-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.confirm-footer {
  display: flex;
  gap: 24rpx;
  
  .btn-cancel, .btn-confirm {
    flex: 1;
    height: 80rpx;
    border: none;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-cancel {
    background: #f1f5f9;
    color: #64748b;
    
    &:active {
      background: #e2e8f0;
    }
  }
  
  .btn-confirm {
    background: linear-gradient(135deg, #E07A4F 0%, #E07A4F 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(224, 122, 79, 0.35);
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>
