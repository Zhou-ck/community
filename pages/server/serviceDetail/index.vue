<template>
  <view class="service-detail-page">

    <!-- 服务详情内容 -->
    <scroll-view class="detail-content" scroll-y>
      <!-- 服务图片 -->
      <view class="service-banner">
        <image :src="getImageUrl(serviceData.icon)" class="banner-image" mode="aspectFill"></image>
      </view>

      <!-- 服务基本信息 -->
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
          <view class="tag-item" v-if="serviceData.subsidySupport === '1'">
            <uni-icons type="checkmarkempty" size="12" color="#52c41a"></uni-icons>
            <text>可补贴</text>
          </view>
          <view class="tag-item" v-if="serviceData.serviceDuration">
            <uni-icons type="clock" size="12" color="#1890ff"></uni-icons>
            <text>{{ serviceData.serviceDuration }}分钟</text>
          </view>
        </view>

        <!-- 补贴信息 -->
        <view class="subsidy-info" v-if="serviceData.subsidySupport === '1' && serviceData.subsidyRate > 0">
          <view class="subsidy-icon">
            <text class="iconfontA icon-butie"></text>
          </view>
          <view class="subsidy-text">
            <text class="subsidy-label">补贴优惠</text>
            <text class="subsidy-rate">补贴{{ serviceData.subsidyRate }}%，实付¥{{ actualAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 服务描述 -->
      <view class="detail-section" v-if="serviceData.description">
        <view class="section-title">服务描述</view>
        <view class="section-content">
          <text class="description-text">{{ serviceData.description }}</text>
        </view>
      </view>

      <!-- 服务内容 -->
      <view class="detail-section" v-if="serviceData.serviceContent">
        <view class="section-title">服务内容</view>
        <view class="section-content">
          <text class="content-text">{{ serviceData.serviceContent }}</text>
        </view>
      </view>

      <!-- 服务须知 -->
      <view class="detail-section">
        <view class="section-title">服务须知</view>
        <view class="section-content">
          <view class="notice-item">
            <text class="notice-dot">•</text>
            <text class="notice-text">请提前预约服务时间，我们会尽快安排服务人员</text>
          </view>
          <view class="notice-item">
            <text class="notice-dot">•</text>
            <text class="notice-text">如需取消或修改预约，请提前联系客服</text>
          </view>
          <view class="notice-item">
            <text class="notice-dot">•</text>
            <text class="notice-text">服务完成后请及时评价，帮助我们提升服务质量</text>
          </view>
          <view class="notice-item" v-if="serviceData.subsidySupport === '1'">
            <text class="notice-dot">•</text>
            <text class="notice-text">补贴金额将在订单完成后自动计算并抵扣</text>
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
      <button class="booking-btn" @click="goToBooking">
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
        return '/static/images/default-service.png'
      }
      
      // 如果是完整URL，直接返回
      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath
      }
      
      // 如果是相对路径，拼接baseUrl
      if (iconPath.startsWith('/')) {
        return config.baseUrl + iconPath
      }
      
      return '/static/images/default-service.png'
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
  background-color: #f5f5f5;
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
  height: 500rpx;
  background: #fff;

  .banner-image {
    width: 100%;
    height: 100%;
  }
}

/* 服务基本信息卡片 */
.service-info-card {
  background: #fff;
  margin-top: 20rpx;
  padding: 32rpx;

  .service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;

    .service-name {
      flex: 1;
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      margin-right: 20rpx;
    }

    .service-price-wrapper {
      display: flex;
      align-items: baseline;
      flex-shrink: 0;

      .price-symbol {
        font-size: 28rpx;
        color: #ff5555;
        font-weight: bold;
      }

      .price-amount {
        font-size: 44rpx;
        color: #ff5555;
        font-weight: bold;
        margin: 0 4rpx;
      }

      .price-unit {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .service-tags {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .tag-item {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 8rpx 16rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: #666;
    }
  }

  .subsidy-info {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
    border-radius: 12rpx;
    border: 1rpx solid #ffd591;

    .subsidy-icon {
      width: 60rpx;
      height: 60rpx;
      background: #ffa940;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .iconfontA {
        font-size: 32rpx;
        color: #fff;
      }
    }

    .subsidy-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      .subsidy-label {
        font-size: 28rpx;
        color: #d46b08;
        font-weight: 600;
      }

      .subsidy-rate {
        font-size: 24rpx;
        color: #ad6800;
      }
    }
  }
}

/* 详情区块 */
.detail-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 32rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #3ec6c6;
  }

  .section-content {
    .description-text,
    .content-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .notice-item {
      display: flex;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .notice-dot {
        flex-shrink: 0;
        width: 32rpx;
        font-size: 28rpx;
        color: #3ec6c6;
      }

      .notice-text {
        flex: 1;
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

/* 底部占位 */
.bottom-placeholder {
  height: 40rpx;
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
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
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
        font-size: 36rpx;
        color: #ff5555;
        font-weight: bold;
      }

      .actual-price {
        font-size: 24rpx;
        color: #52c41a;
      }
    }
  }

  .booking-btn {
    width: 280rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #3ec6c6 0%, #2ab5b5 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 40rpx;
    border: none;
    box-shadow: 0 8rpx 20rpx rgba(62, 198, 198, 0.3);

    &:active {
      opacity: 0.9;
    }
  }
}
</style>
