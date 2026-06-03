<template>
  <view class="config-section">
    <view class="section-header">
      <view class="section-line"></view>
      <text class="section-title">{{ title }}</text>
    </view>
    <view class="config-grid">
      <view 
        v-for="item in items" 
        :key="item.key"
        :class="['config-card', item.type]"
        @click="$emit('select', item)"
      >
        <text class="card-text">{{ item.label }}</text>
        <view class="card-arrow">›</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConfigSection',
  props: {
    title: { type: String, required: true },
    items: { type: Array, required: true }
  }
}
</script>

<style scoped lang="scss">
.config-section {
  margin-bottom: 40rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding: 0 8rpx;
    
    .section-line {
      width: 6rpx;
      height: 32rpx;
      background: linear-gradient(180deg, #4dd9d9 0%, #3ec6c6 100%);
      border-radius: 3rpx;
      margin-right: 16rpx;
    }
    
    .section-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #1a1a2e;
      letter-spacing: 1rpx;
    }
  }
  
  .config-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    
    .config-card {
      background: #ffffff;
      border-radius: 16rpx;
      padding: 32rpx 24rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
      border: 1rpx solid #f0f0f0;
      
      &:active {
        transform: scale(0.98);
        box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.08);
      }
      
      .card-text {
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
      }
      
      .card-arrow {
        font-size: 32rpx;
        color: #ccc;
        font-weight: 300;
      }
      
      &.primary {
        background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
        border-color: #e8edff;
        
        .card-text { color: #4361ee; }
        .card-arrow { color: #4361ee; }
      }
      
      &.success {
        background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
        border-color: #d1fae5;
        
        .card-text { color: #059669; }
        .card-arrow { color: #059669; }
      }
      
      &.warning {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border-color: #fde68a;
        
        .card-text { color: #d97706; }
        .card-arrow { color: #d97706; }
      }
      
      &.danger {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        border-color: #fecaca;
        
        .card-text { color: #dc2626; }
        .card-arrow { color: #dc2626; }
      }
      
      &.info {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-color: #e2e8f0;
        
        .card-text { color: #475569; }
        .card-arrow { color: #94a3b8; }
      }
    }
  }
}
</style>
