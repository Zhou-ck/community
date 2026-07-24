<template>
  <view class="service-detail-page">

    <!-- 服务详情内容 -->
    <scroll-view class="detail-content" scroll-y>
      <!-- 服务图片 -->
      <view class="service-banner">
        <image :src="getImageUrl(serviceData.icon)" class="banner-image" mode="aspectFill"></image>
        <view class="banner-overlay"></view>
      </view>

      <!-- 服务基本信息卡片 -->
      <view class="service-info-card">
        <view class="service-header">
          <view class="service-name">{{ serviceData.serviceName }}</view>
          <view class="service-price-wrapper">
            <text class="price-symbol">¥</text>
            <text class="price-amount">{{ serviceData.price }}</text>
            <text class="price-unit">/次</text>
          </view>
        </view>

        <!-- 服务标签 -->
        <view class="service-tags">
          <view class="tag-item subsidy" v-if="serviceData.subsidySupport === '1'">
            <uni-icons type="checkmarkempty" size="12" color="#5AAB7A"></uni-icons>
            <text>可补贴</text>
          </view>
          <view class="tag-item duration" v-if="serviceData.serviceDuration">
            <uni-icons type="clock" size="12" color="#1890ff"></uni-icons>
            <text>{{ serviceData.serviceDuration }}分钟</text>
          </view>
          <view class="tag-item quality">
            <uni-icons type="star-filled" size="12" color="#faad14"></uni-icons>
            <text>优质服务</text>
          </view>
        </view>

        <!-- 补贴信息 -->
        <view class="subsidy-info" v-if="serviceData.subsidySupport === '1' && serviceData.subsidyRate > 0">
          <view class="subsidy-icon">
            <uni-icons type="gift-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="subsidy-text">
            <text class="subsidy-label">补贴优惠</text>
            <text class="subsidy-rate">补贴{{ serviceData.subsidyRate }}%，实付<text class="highlight">¥{{ actualAmount }}</text></text>
          </view>
          <view class="subsidy-badge">省¥{{ (serviceData.price - actualAmount).toFixed(2) }}</view>
        </view>
      </view>

      <!-- 服务描述 -->
      <view class="detail-section" v-if="serviceData.description">
        <view class="section-header">
          <view class="section-title">
            <view class="title-icon">
              <uni-icons type="info-filled" size="18" color="#E07A4F"></uni-icons>
            </view>
            <text>服务描述</text>
          </view>
        </view>
        <view class="section-content">
          <text class="description-text">{{ serviceData.description }}</text>
        </view>
      </view>

      <!-- 服务内容 -->
      <view class="detail-section" v-if="serviceData.serviceContent">
        <view class="section-header">
          <view class="section-title">
            <view class="title-icon">
              <uni-icons type="list" size="18" color="#E07A4F"></uni-icons>
            </view>
            <text>服务内容</text>
          </view>
        </view>
        <view class="section-content">
          <text class="content-text">{{ serviceData.serviceContent }}</text>
        </view>
      </view>

      <!-- 服务须知 -->
      <view class="detail-section notice-section">
        <view class="section-header">
          <view class="section-title">
            <view class="title-icon">
              <uni-icons type="notification-filled" size="18" color="#E07A4F"></uni-icons>
            </view>
            <text>服务须知</text>
          </view>
        </view>
        <view class="section-content">
          <view class="notice-list">
            <view class="notice-item">
              <view class="notice-icon">
                <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
              </view>
              <text class="notice-text">请提前预约服务时间，我们会尽快安排服务人员</text>
            </view>
            <view class="notice-item">
              <view class="notice-icon">
                <uni-icons type="phone" size="16" color="#E07A4F"></uni-icons>
              </view>
              <text class="notice-text">如需取消或修改预约，请提前联系客服</text>
            </view>
            <view class="notice-item">
              <view class="notice-icon">
                <uni-icons type="star" size="16" color="#E07A4F"></uni-icons>
              </view>
              <text class="notice-text">服务完成后请及时评价，帮助我们提升服务质量</text>
            </view>
            <view class="notice-item" v-if="serviceData.subsidySupport === '1'">
              <view class="notice-icon">
                <uni-icons type="wallet" size="16" color="#E07A4F"></uni-icons>
              </view>
              <text class="notice-text">补贴金额将在订单完成后自动计算并抵扣</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 占位，避免被底部按钮遮挡 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="price-info">
        <view class="price-label">服务价格</view>
        <view class="price-wrapper">
          <text class="current-price">¥{{ serviceData.price }}</text>
          <text class="actual-price" v-if="serviceData.subsidySupport === '1' && serviceData.subsidyRate > 0">
            实付¥{{ actualAmount }}
          </text>
        </view>
      </view>
      <button class="booking-btn" @click="goToBooking" hover-class="booking-btn-hover">
        <uni-icons type="calendar" size="18" color="#fff" style="margin-right: 8rpx;"></uni-icons>
        立即预约
      </button>
    </view>
  </view>
</template>

<script>
import config from '@/config.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      serviceData: {
        serviceId: null,
        serviceName: '',
        icon: '',
        price: 0,
        serviceDuration: null,
        subsidyRate: 0,
        subsidySupport: '0',
        deptId: null,
        serviceContent: '',
        description: ''
      }
    }
  },

  computed: {
    // 计算实付金额
    actualAmount() {
      if (this.serviceData.subsidySupport === '1' && this.serviceData.subsidyRate > 0) {
        const subsidy = this.serviceData.price * (this.serviceData.subsidyRate / 100)
        return (this.serviceData.price - subsidy).toFixed(2)
      }
      return this.serviceData.price
    }
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight

    // 从缓存加载服务数据
    this.loadServiceData()
  },

  methods: {
    // 加载服务数据
    loadServiceData() {
      try {
        const cacheData = uni.getStorageSync('serviceDetailCache')
        
        if (cacheData) {
          console.log('从缓存加载的服务数据:', cacheData)
          this.serviceData = {
            ...this.serviceData,
            ...cacheData
          }
        } else {
          console.warn('缓存中没有服务数据')
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('加载服务数据失败:', error)
      }
    },

    // 处理图片URL
    getImageUrl(iconPath) {
      if (!iconPath) {
        return '/static/images/default-service.jpg'
      }
      
      // 如果是完整URL，直接返回
      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath
      }
      
      // 如果是相对路径，拼接baseUrl
      if (iconPath.startsWith('/')) {
        return config.baseUrl + iconPath
      }
      
      return '/static/images/default-service.jpg'
    },

    // 立即预约
    goToBooking() {
      // 准备预约页面需要的数据
      const bookingData = {
        serviceId: this.serviceData.serviceId,
        serviceName: this.serviceData.serviceName,
        icon: this.serviceData.icon,
        price: this.serviceData.price,
        serviceDuration: this.serviceData.serviceDuration,
        subsidyRate: this.serviceData.subsidyRate || 0,
        subsidySupport: this.serviceData.subsidySupport || '0',
        deptId: this.serviceData.deptId,
        serviceContent: this.serviceData.serviceContent,
        description: this.serviceData.description
      }
      
      // 存储到缓存
      uni.setStorageSync('bookingDataCache', bookingData)
      
      // 跳转到预约页面
      uni.navigateTo({
        url: '/pages/server/booking/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.service-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 详情内容 */
.detail-content {
  flex: 1;
  padding-bottom: 140rpx;
}

/* 服务图片 */
.service-banner {
  width: 100%;
  height: 480rpx;
  background: #fff;
  position: relative;
  overflow: hidden;

  .banner-image {
    width: 100%;
    height: 100%;
  }
  
  .banner-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120rpx;
    background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);
  }
}

/* 服务基本信息卡片 */
.service-info-card {
  background: #fff;
  margin: -40rpx 24rpx 0;
  padding: 32rpx;
  border-radius: 24rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);

  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;

    .service-name {
      flex: 1;
      font-size: 40rpx;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.4;
      margin-right: 20rpx;
    }

    .service-price-wrapper {
      display: flex;
      align-items: baseline;
      flex-shrink: 0;
      background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
      padding: 12rpx 20rpx;
      border-radius: 12rpx;

      .price-symbol {
        font-size: 28rpx;
        color: #D95C5C;
        font-weight: bold;
      }

      .price-amount {
        font-size: 48rpx;
        color: #D95C5C;
        font-weight: bold;
        margin: 0 4rpx;
        font-family: inherit;
      }

      .price-unit {
        font-size: 24rpx;
        color: #E07070;
      }
    }
  }

  .service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .tag-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 10rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: 500;
      
      &.subsidy {
        background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
        color: #389e0d;
        border: 1rpx solid #b7eb8f;
      }
      
      &.duration {
        background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
        color: #0958d9;
        border: 1rpx solid #91caff;
      }
      
      &.quality {
        background: linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%);
        color: #d48806;
        border: 1rpx solid #ffe58f;
      }
    }
  }

  .subsidy-info {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 24rpx;
    background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
    border-radius: 16rpx;
    border: 2rpx solid #ffd591;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: -20rpx;
      right: -20rpx;
      width: 100rpx;
      height: 100rpx;
      background: rgba(255, 169, 64, 0.1);
      border-radius: 50%;
    }

    .subsidy-icon {
      width: 72rpx;
      height: 72rpx;
      background: linear-gradient(135deg, #ffa940 0%, #fa8c16 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4rpx 12rpx rgba(250, 140, 22, 0.3);
    }

    .subsidy-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .subsidy-label {
        font-size: 30rpx;
        color: #d46b08;
        font-weight: 700;
      }

      .subsidy-rate {
        font-size: 26rpx;
        color: #ad6800;
        
        .highlight {
          color: #d46b08;
          font-weight: 700;
          font-size: 28rpx;
        }
      }
    }
    
    .subsidy-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: linear-gradient(135deg, #ff7a45 0%, #fa541c 100%);
      color: #fff;
      font-size: 22rpx;
      font-weight: 600;
      padding: 8rpx 16rpx;
      border-radius: 0 16rpx 0 16rpx;
    }
  }
}

/* 详情区块 */
.detail-section {
  background: #fff;
  margin: 24rpx;
  padding: 32rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .section-header {
    margin-bottom: 24rpx;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .title-icon {
        width: 40rpx;
        height: 40rpx;
        background: rgba(224, 122, 79, 0.1);
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      text {
        font-size: 32rpx;
        font-weight: 700;
        color: #1a1a1a;
      }
    }
  }

  .section-content {
    .description-text,
    .content-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
  
  &.notice-section {
    background: linear-gradient(135deg, #f8fdfd 0%, #f0fafa 100%);
    border: 2rpx solid rgba(224, 122, 79, 0.1);
    
    .notice-list {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
    }

    .notice-item {
      display: flex;
      align-items: flex-start;
      gap: 16rpx;
      padding: 16rpx 20rpx;
      background: #fff;
      border-radius: 12rpx;
      transition: all 0.3s;

      .notice-icon {
        width: 36rpx;
        height: 36rpx;
        background: rgba(224, 122, 79, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 4rpx;
      }

      .notice-text {
        flex: 1;
        font-size: 26rpx;
        color: #555;
        line-height: 1.6;
      }
    }
  }
}

/* 底部占位 */
.bottom-placeholder {
  height: 60rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.08);
  z-index: 100;

  .price-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .price-label {
      font-size: 24rpx;
      color: #999;
    }

    .price-wrapper {
      display: flex;
      align-items: baseline;
      gap: 12rpx;

      .current-price {
        font-size: 40rpx;
        color: #D95C5C;
        font-weight: bold;
        font-family: inherit;
      }

      .actual-price {
        font-size: 24rpx;
        color: #5AAB7A;
        font-weight: 500;
        background: #f6ffed;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }
  }

  .booking-btn {
    min-width: 280rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #E07A4F 0%, #2ab5b5 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(224, 122, 79, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
  
  .booking-btn-hover {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(224, 122, 79, 0.4);
  }
}
</style>
