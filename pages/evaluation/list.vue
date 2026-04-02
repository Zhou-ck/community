<template>
  <view class="evaluation-list-page">
    <!-- 订单信息卡片 -->
    <view class="order-info-card" v-if="orderInfo">
      <image :src="getServiceIcon(orderInfo.icon)" class="service-icon" mode="aspectFill"></image>
      <view class="order-detail">
        <text class="service-name">{{ orderInfo.serviceName }}</text>
        <text class="provider-name" v-if="orderInfo.providerName">服务商：{{ orderInfo.providerName }}</text>
      </view>
    </view>

    <!-- 评价统计 -->
    <view class="evaluation-stats">
      <view class="stats-item">
        <text class="stats-number">{{ evaluationList.length }}</text>
        <text class="stats-label">评价次数</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-number">{{ averageRating }}</text>
        <text class="stats-label">平均评分</text>
      </view>
    </view>

    <!-- 评价列表 -->
    <scroll-view class="evaluation-scroll" scroll-y>
      <view class="evaluation-list" v-if="evaluationList.length > 0">
        <view class="evaluation-item" v-for="(evaluation, index) in evaluationList" :key="index">
          <view class="evaluation-index">第{{ evaluationList.length - index }}次评价</view>
          <view class="evaluation-header">
            <view class="evaluation-rating">
              <uni-icons
                v-for="star in [1,2,3,4,5]"
                :key="star"
                :type="star <= evaluation.rating ? 'star-filled' : 'star'"
                size="20"
                :color="star <= evaluation.rating ? '#FFB400' : '#E0E0E0'"
              ></uni-icons>
              <text class="rating-text">{{ evaluation.rating }}分</text>
            </view>
            <text class="evaluation-time">{{ evaluation.createTime }}</text>
          </view>
          <view class="evaluation-content" v-if="evaluation.evaluationContent">
            <text class="evaluation-text">{{ evaluation.evaluationContent }}</text>
          </view>
          <view class="evaluation-images" v-if="evaluation.evaluationImages">
            <image
              v-for="(img, imgIndex) in parseImages(evaluation.evaluationImages)"
              :key="imgIndex"
              :src="config.baseUrl + img"
              class="evaluation-image"
              mode="aspectFill"
              @click="previewImage(evaluation.evaluationImages, imgIndex)"
            ></image>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="evaluationList.length === 0 && !isLoading">
        <uni-icons type="star" size="64" color="#ddd"></uni-icons>
        <text class="empty-text">暂无评价记录</text>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="isLoading">
        <uni-icons type="spinner-cycle" size="32" color="#3ec6c6"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getServiceorder, getEvaluationListByOrderId } from '@/api/service'
import { getServiceIcon } from '@/utils/service-helper'
import config from '@/config.js'

export default {
  data() {
    return {
      config: config,
      orderId: null,
      orderInfo: null,
      evaluationList: [],
      isLoading: false
    }
  },
  computed: {
    averageRating() {
      if (this.evaluationList.length === 0) return '0.0'
      const total = this.evaluationList.reduce((sum, item) => sum + (item.rating || 0), 0)
      return (total / this.evaluationList.length).toFixed(1)
    }
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadOrderInfo()
      this.loadEvaluationList()
    }
  },
  methods: {
    getServiceIcon(icon) {
      return getServiceIcon(icon)
    },

    async loadOrderInfo() {
      try {
        const response = await getServiceorder(this.orderId)
        if (response.code === 200 && response.data) {
          this.orderInfo = {
            id: response.data.orderId,
            serviceName: response.data.serviceName || '服务项目',
            providerName: response.data.providerName || '',
            icon: response.data.icon || '',
            status: response.data.orderStatus === '4' ? 'completed' : 'other',
            evaluationFlag: response.data.evaluationFlag || '0'
          }
        }
      } catch (error) {
        console.error('加载订单信息失败:', error)
      }
    },

    async loadEvaluationList() {
      if (!this.orderId) return
      try {
        this.isLoading = true
        const response = await getEvaluationListByOrderId(this.orderId)
        if (response.code === 200 && response.data) {
          this.evaluationList = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('加载评价列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    parseImages(imagesJson) {
      if (!imagesJson) return []
      try {
        return JSON.parse(imagesJson)
      } catch (e) {
        return []
      }
    },

    previewImage(imagesJson, index) {
      const images = this.parseImages(imagesJson)
      if (images.length === 0) return
      uni.previewImage({
        current: this.config.baseUrl + images[index],
        urls: images.map(img => this.config.baseUrl + img)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.evaluation-list-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

/* 订单信息卡片 */
.order-info-card {
  margin: 24rpx 32rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.service-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background: #f5f7fa;
}

.order-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.service-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.provider-name {
  font-size: 24rpx;
  color: #999;
}

/* 评价统计 */
.evaluation-stats {
  margin: 0 32rpx 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2db7b7 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 8rpx 24rpx rgba(62, 198, 198, 0.3);
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stats-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.stats-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* 评价列表 */
.evaluation-scroll {
  height: calc(100vh - 400rpx);
  padding: 0 32rpx;
}

.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.evaluation-item {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.evaluation-index {
  font-size: 24rpx;
  color: #3ec6c6;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.evaluation-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rating-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #ffb400;
  font-weight: 600;
}

.evaluation-time {
  font-size: 24rpx;
  color: #999;
}

.evaluation-content {
  margin-bottom: 16rpx;
}

.evaluation-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.evaluation-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.evaluation-image {
  width: 100%;
  height: 160rpx;
  border-radius: 8rpx;
  object-fit: cover;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.loading-text {
  font-size: 24rpx;
  color: #999;
}
</style>
