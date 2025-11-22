<template>
  <view class="order-detail-page">

    <scroll-view class="content-wrapper" scroll-y>
      <!-- 订单状态 -->
      <!-- <view class="status-card" v-if="orderInfo" :class="getStatusClass(orderInfo.status)">
        <view class="status-icon-wrapper">
          <uni-icons :type="getStatusIcon(orderInfo.status)" size="40" color="#fff"></uni-icons>
        </view>
        <view class="status-info">
          <text class="status-text">{{ orderInfo.statusText }}</text>
          <text class="status-time">{{ orderInfo.createTime }}</text>
        </view>
      </view> -->

      <!-- 服务信息卡片 -->
      <view class="info-card" v-if="orderInfo">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="shop" size="18" color="#333" class="header-icon"></uni-icons>
            <text>服务信息</text>
          </view>
          <text class="order-no">NO.{{ orderInfo.id }}</text>
        </view>
        <view class="service-content">
          <image :src="getServiceIcon(orderInfo.icon)" class="service-image" mode="aspectFill"></image>
          <view class="service-detail">
            <text class="service-name">{{ orderInfo.serviceName }}</text>
            <text class="service-desc" v-if="orderInfo.serviceDesc">{{ orderInfo.serviceDesc }}</text>
            <view class="service-tags" v-if="orderInfo.status === 'completed'">
              <text class="tag">已完成</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 预约信息卡片 -->
      <view class="info-card" v-if="orderInfo">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="calendar" size="18" color="#333" class="header-icon"></uni-icons>
            <text>预约信息</text>
          </view>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="info-label">联系人</text>
            <view class="info-value-wrapper">
              <text class="info-value">{{ orderInfo.contactName }}</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <view class="info-value-wrapper" @click="makePhoneCall(orderInfo.contactPhone)">
              <text class="info-value link">{{ orderInfo.contactPhone }}</text>
              <uni-icons type="phone-filled" size="16" color="#3ec6c6" style="margin-left: 8rpx;"></uni-icons>
            </view>
          </view>
          <view class="divider"></view>
          <view class="info-item">
            <text class="info-label">预约时间</text>
            <view class="info-value-wrapper">
              <text class="info-value">{{ orderInfo.appointmentDate }} {{ orderInfo.appointmentPeriod }}</text>
            </view>
          </view>
          <template v-if="orderInfo.serviceAddress">
            <view class="divider"></view>
            <view class="info-item vertical">
              <text class="info-label">服务地址</text>
              <view class="info-value-box">
                <text class="info-value">{{ orderInfo.serviceAddress }}</text>
              </view>
            </view>
          </template>
          <template v-if="orderInfo.remark">
            <view class="divider"></view>
            <view class="info-item vertical">
              <text class="info-label">备注信息</text>
              <view class="info-value-box">
                <text class="info-value">{{ orderInfo.remark }}</text>
              </view>
            </view>
          </template>
        </view>
      </view>

      <!-- 费用信息卡片 -->
      <view class="info-card" v-if="orderInfo">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="wallet" size="18" color="#333" class="header-icon"></uni-icons>
            <text>费用明细</text>
          </view>
        </view>
        <view class="price-list">
          <view class="price-item">
            <text class="price-label">服务价格</text>
            <text class="price-value">￥{{ orderInfo.price }}</text>
          </view>
          <view class="price-item" v-if="orderInfo.useSubsidy === '1' && orderInfo.subsidyAmount > 0">
            <text class="price-label">补贴金额</text>
            <text class="price-value subsidy">-￥{{ orderInfo.subsidyAmount }}</text>
          </view>
          <view class="price-divider"></view>
          <view class="price-item total">
            <text class="price-label bold">实付金额</text>
            <text class="price-value actual">￥<text class="big-num">{{ orderInfo.actualAmount }}</text></text>
          </view>
        </view>
      </view>

      <!-- 评价信息卡片 -->
      <view class="info-card" v-if="shouldShowReview">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="star" size="18" color="#333" class="header-icon"></uni-icons>
            <text>我的评价 ({{ getReviewCount }}条)</text>
          </view>
        </view>
        <view class="review-content">
          <view class="review-rating">
            <uni-icons
              v-for="star in 5"
              :key="star"
              :type="star <= orderInfo.rating ? 'star-filled' : 'star'"
              size="20"
              :color="star <= orderInfo.rating ? '#FFB400' : '#E0E0E0'"
            ></uni-icons>
            <text class="rating-text">{{ orderInfo.rating }}分</text>
          </view>
          <view class="review-text-box">
            <text class="review-text">{{ orderInfo.evaluationContent }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions-wrapper" v-if="orderInfo">
      <view class="bottom-actions">
        <!-- 待接单状态 -->
        <template v-if="orderInfo.status === 'pending'">
          <button class="action-btn secondary" @click="cancelOrder">取消预约</button>
          <button class="action-btn primary" @click="editOrder">修改预约</button>
        </template>

        <!-- 服务中状态 -->
        <template v-if="orderInfo.status === 'serving'">
          <button class="action-btn primary full" @click="confirmComplete">确认完成</button>
        </template>

        <!-- 待评价状态 -->
        <template v-if="orderInfo.status === 'completed' && !orderInfo.isReviewed">
          <button class="action-btn primary full review" @click="goToReview">立即评价</button>
        </template>

        <!-- 已取消/已拒绝状态 -->
        <template v-if="orderInfo.status === 'cancelled' || orderInfo.status === 'rejected'">
          <button class="action-btn delete full" @click="deleteOrder">删除订单</button>
        </template>
        
        <!-- 其他状态显示返回按钮 -->
        <template v-if="orderInfo.status === 'accepted' || (orderInfo.status === 'completed' && orderInfo.isReviewed)">
           <button class="action-btn secondary full" @click="goBack">返回列表</button>
        </template>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!orderInfo && !isLoading" class="empty-state">
      <image src="/static/images/empty-order.png" class="empty-image" mode="widthFix" v-if="false"></image>
      <uni-icons type="info-filled" size="64" color="#ddd"></uni-icons>
      <text class="empty-text">订单信息不存在</text>
    </view>
  </view>
</template>

<script>
import { getServiceorder, cancelServiceorder, delServiceorder } from '@/api/service'
import config from '@/config.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      orderId: null,
      orderInfo: null,
      isLoading: false,
      statusMap: {
        pending: { text: '待接单', class: 'status-pending' },
        accepted: { text: '已接单', class: 'status-accepted' },
        serving: { text: '服务中', class: 'status-serving' },
        completed: { text: '已完成', class: 'status-completed' },
        cancelled: { text: '已取消', class: 'status-cancelled' },
        rejected: { text: '已拒绝', class: 'status-rejected' }
      }
    }
  },
  onLoad(options) {
    // 获取系统状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0

    // 获取订单ID
    if (options.orderId) {
      this.orderId = options.orderId
      this.loadOrderDetail()
    }
  },
  computed: {
    shouldShowReview() {
      return this.orderInfo && this.orderInfo.isReviewed
    },
    getReviewCount() {
      return 1
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },

    // 拨打电话
    makePhoneCall(phoneNumber) {
      if (!phoneNumber) return
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },

    // 获取状态样式类
    getStatusClass(status) {
      const map = {
        pending: 'bg-pending',
        accepted: 'bg-accepted',
        serving: 'bg-serving',
        completed: 'bg-completed',
        cancelled: 'bg-cancelled',
        rejected: 'bg-rejected'
      }
      return map[status] || 'bg-default'
    },

    // 加载订单详情
    async loadOrderDetail() {
      if (!this.orderId) return

      try {
        this.isLoading = true
        const response = await getServiceorder(this.orderId)

        if (response.code === 200 && response.data) {
          this.orderInfo = this.formatOrderData(response.data)
        } else {
          uni.showToast({
            title: response.msg || '获取订单详情失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载订单详情失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    // 格式化订单数据
    formatOrderData(order) {
      const statusTextMap = {
        '0': 'pending',
        '1': 'accepted',
        '2': 'serving',
        '3': 'completed',
        '4': 'cancelled',
        '5': 'rejected'
      }

      const status = statusTextMap[order.orderStatus] || 'pending'
      const statusInfo = this.statusMap[status] || this.statusMap.pending

      return {
        id: order.orderId,
        createTime: order.createTime || '',
        status: status,
        statusText: statusInfo.text,
        statusClass: statusInfo.class,
        isReviewed: order.rating != null && order.rating > 0,

        serviceName: order.serviceName || '服务项目',
        serviceId: order.serviceId,
        serviceDesc: order.serviceDesc || '', // 假设有这个字段
        icon: order.icon || '',
        contactName: order.contactName || '',
        contactPhone: order.contactPhone || '',
        appointmentDate: order.appointmentDate || '',
        appointmentPeriod: order.appointmentPeriod || '',
        serviceAddress: order.serviceAddress || '',

        price: order.price || 0,
        subsidyAmount: order.subsidyAmount || 0,
        actualAmount: order.actualAmount || 0,
        useSubsidy: order.useSubsidy || '0',

        remark: order.remark || '',
        rating: order.rating || null,
        evaluationContent: order.evaluationContent || ''
      }
    },

    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        pending: 'clock-filled',
        accepted: 'checkmark-circle-filled',
        serving: 'gear-filled',
        completed: 'medal-filled',
        cancelled: 'close-circle-filled',
        rejected: 'info-filled'
      }
      return iconMap[status] || 'info-filled'
    },

    // 获取服务图标
    getServiceIcon(iconPath) {
      if (!iconPath) {
        return '/static/images/default-service.png'
      }

      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath
      }

      if (iconPath.startsWith('/')) {
        return config.baseUrl + iconPath
      }

      return '/static/images/default-service.png'
    },

    // 修改预约
    editOrder() {
      uni.navigateTo({
        url: `/pages/server/booking/index?orderId=${this.orderId}&mode=edit`
      })
    },

    // 取消订单
    async cancelOrder() {
      uni.showModal({
        title: '取消预约',
        content: '确定要取消该预约吗？',
        confirmColor: '#ff5555',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '取消中...' })
              const response = await cancelServiceorder({ orderId: this.orderId })
              uni.hideLoading()

              if (response.code === 200) {
                uni.showToast({
                  title: '取消成功',
                  icon: 'success'
                })
                // 触发订单更新事件
                uni.$emit('orderUpdated', { orderId: this.orderId })
                // 返回上一页
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              } else {
                uni.showToast({
                  title: response.msg || '取消失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.hideLoading()
              console.error('取消预约失败:', error)
              uni.showToast({
                title: '取消失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 删除订单
    async deleteOrder() {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除该订单吗？删除后将无法恢复。',
        confirmColor: '#ff5555',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '删除中...' })
              const response = await delServiceorder(this.orderId)
              uni.hideLoading()

              if (response.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                // 触发订单更新事件
                uni.$emit('orderUpdated', { orderId: this.orderId })
                // 返回上一页
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
              } else {
                uni.showToast({
                  title: response.msg || '删除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.hideLoading()
              console.error('删除订单失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 确认完成
    confirmComplete() {
      uni.showModal({
        title: '确认完成',
        content: '确认服务已完成吗？',
        confirmColor: '#3ec6c6',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用完成服务API
            uni.showToast({
              title: '已确认完成',
              icon: 'success'
            })
            // 触发订单更新事件
            uni.$emit('orderUpdated', { orderId: this.orderId })
            // 刷新详情
            setTimeout(() => {
              this.loadOrderDetail()
            }, 1500)
          }
        }
      })
    },

    // 去评价
    goToReview() {
      uni.navigateBack()
      setTimeout(() => {
        uni.$emit('openReviewModal', { orderId: this.orderId })
      }, 300)
    }
  }
}
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏 */
.content-wrapper {
  padding: 20rpx 24rpx 40rpx;
  height: calc(100vh - 120rpx);
}

/* 状态卡片 */
.status-card {
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -20rpx;
    top: -20rpx;
    width: 160rpx;
    height: 160rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &.bg-pending {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 154, 158, 0.3);
  }
  &.bg-accepted {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  }
  &.bg-serving {
    background: linear-gradient(135deg, #3ec6c6 0%, #2db7b7 100%);
    box-shadow: 0 8rpx 24rpx rgba(62, 198, 198, 0.3);
  }
  &.bg-completed {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    .status-text { color: #555; }
    .status-time { color: #777; }
    .status-icon-wrapper { background: rgba(0,0,0,0.05); }
    /deep/ .uni-icons { color: #555 !important; }
  }
  &.bg-cancelled {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    .status-text { color: #666; }
    .status-time { color: #888; }
    .status-icon-wrapper { background: rgba(0,0,0,0.05); }
    /deep/ .uni-icons { color: #666 !important; }
  }
  &.bg-rejected {
    background: linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 117, 140, 0.3);
  }
}

.status-icon-wrapper {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  z-index: 1;
}

.status-text {
  font-size: 40rpx;
  font-weight: 600;
  color: #fff;
}

.status-time {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 信息卡片 */
.info-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  animation: slideUp 0.5s ease backwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f5f7fa;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.header-icon {
  margin-top: -2rpx;
}

.order-no {
  font-size: 24rpx;
  color: #999;
}

/* 服务内容 */
.service-content {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
}

.service-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.service-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.service-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.service-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 8rpx;
}

.tag {
  font-size: 22rpx;
  color: #3ec6c6;
  background: rgba(62, 198, 198, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;

  &.vertical {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
  min-width: 140rpx;
}

.info-value-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  text-align: right;

  &.link {
    color: #3ec6c6;
    font-weight: 500;
  }
}

.info-value-box {
  width: 100%;
  background: #f9fafc;
  padding: 20rpx;
  border-radius: 12rpx;
}

.divider {
  height: 1rpx;
  background: #f5f7fa;
}

/* 费用列表 */
.price-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.total {
    margin-top: 8rpx;
  }
}

.price-label {
  font-size: 28rpx;
  color: #666;
  
  &.bold {
    font-weight: 600;
    color: #333;
    font-size: 30rpx;
  }
}

.price-value {
  font-size: 28rpx;
  color: #333;

  &.subsidy {
    color: #52c41a;
  }

  &.actual {
    font-size: 28rpx;
    color: #ff5555;
    font-weight: bold;
    display: flex;
    align-items: baseline;
    
    .big-num {
      font-size: 40rpx;
    }
  }
}

.price-divider {
  height: 1rpx;
  background: #f0f0f0;
  border-bottom: 1rpx dashed #ddd;
  margin: 8rpx 0;
}

/* 评价内容 */
.review-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.rating-text {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #ffb400;
  font-weight: 600;
}

.review-text-box {
  background: #f9fafc;
  padding: 24rpx;
  border-radius: 12rpx;
}

.review-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

/* 底部操作栏 */
.bottom-actions-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.bottom-actions {
  padding: 20rpx 32rpx 30rpx;
  display: flex;
  gap: 24rpx;
  align-items: center;
  justify-content: flex-end;
}

.action-btn {
  min-width: 180rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  font-weight: 600;
  text-align: center;
  margin: 0;
  
  &.full {
    flex: 1;
  }

  &.primary {
    background: linear-gradient(135deg, #3ec6c6 0%, #2db7b7 100%);
    color: #fff;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(62, 198, 198, 0.3);
    
    &:active {
      opacity: 0.9;
      transform: translateY(2rpx);
    }
  }

  &.secondary {
    background: #fff;
    color: #666;
    border: 2rpx solid #e0e0e0;
    
    &:active {
      background: #f5f5f5;
    }
  }
  
  &.review {
    background:#3ec6c6;
    box-shadow: 0 8rpx 24rpx rgba(255, 154, 158, 0.3);
  }

  &.delete {
    background: #fff;
    color: #ff5555;
    border: 2rpx solid #ff5555;
    
    &:active {
      background: #fff5f5;
    }
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-image {
  width: 320rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>
