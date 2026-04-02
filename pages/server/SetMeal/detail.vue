<template>
  <view class="detail-container">
    <!-- 顶部套餐信息卡片 -->
    <view class="package-header-card">
      <!-- 套餐名称和状态 -->
      <view class="header-top">
        <text class="package-name">{{ packageDetail.packageName }}</text>
        <view class="status-tag" :class="[getInstanceStatusClass(packageDetail.instanceStatus)]">
          {{ getInstanceStatusText(packageDetail.instanceStatus) }}
        </view>
      </view>
      
      <!-- 使用人员 -->
      <view class="header-member">
        <text class="iconfont icon-yonghu"></text>
        <text class="member-name">{{ packageDetail.memberName || '-' }}</text>
      </view>
      
      <!-- 时间信息卡片 -->
      <view class="time-card">
        <view class="time-item">
          <text class="time-label">生效时间</text>
          <text class="time-value">{{ formatDate(packageDetail.startTime) }}</text>
        </view>
        <view class="time-divider"></view>
        <view class="time-item">
          <text class="time-label">到期时间</text>
          <text class="time-value">{{ formatDate(packageDetail.expireTime) }}</text>
        </view>
      </view>
      
      <!-- 底部信息栏 -->
      <view class="header-bottom">
        <view class="info-item" v-if="packageDetail.payAmount">
          <text class="info-label">支付金额</text>
          <text class="info-value price">¥{{ packageDetail.payAmount }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">连续期数</text>
          <text class="info-value period">第{{ packageDetail.consecutiveCount || 1 }}期</text>
        </view>
        <view class="info-item" v-if="packageDetail.deptName">
          <text class="info-label">所属社区</text>
          <text class="info-value">{{ packageDetail.deptName }}</text>
        </view>
      </view>
    </view>

    <!-- 退订申请信息 -->
    <view v-if="packageDetail.refundApplyTime && packageDetail.instanceStatus !== 'ACTIVE'" class="refund-info-card">
      <view class="refund-header">
        <text class="iconfont icon-tishi"></text>
        <text class="refund-title">退订申请信息</text>
      </view>
      <view class="refund-content">
        <view class="refund-item">
          <text class="refund-label">申请时间</text>
          <text class="refund-value">{{ packageDetail.refundApplyTime }}</text>
        </view>
        <view class="refund-item" v-if="packageDetail.refundApplyReason">
          <text class="refund-label">申请原因</text>
          <text class="refund-value">{{ packageDetail.refundApplyReason }}</text>
        </view>
        <view class="refund-item" v-if="packageDetail.refundReviewTime">
          <text class="refund-label">审核时间</text>
          <text class="refund-value">{{ packageDetail.refundReviewTime }}</text>
        </view>
        <view class="refund-item" v-if="packageDetail.refundReviewRemark">
          <text class="refund-label">审核备注</text>
          <text class="refund-value">{{ packageDetail.refundReviewRemark }}</text>
        </view>
      </view>
    </view>

    <!-- 拒绝原因信息 -->
    <view v-if="packageDetail.instanceStatus === 'REJECTED' && packageDetail.reviewRemark" class="reject-info-card">
      <view class="reject-header">
        <text class="iconfont icon-tishi"></text>
        <text class="reject-title">拒绝原因</text>
      </view>
      <view class="reject-content">
        <text class="reject-text">{{ packageDetail.reviewRemark }}</text>
      </view>
      <view class="reject-time" v-if="packageDetail.reviewTime">
        <text class="reject-time-label">审核时间：</text>
        <text class="reject-time-value">{{ packageDetail.reviewTime }}</text>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="detail-tabs">
      <view 
        class="detail-tab" 
        :class="{ active: currentTab === 'service' }" 
        @click="currentTab = 'service'"
      >
        <text class="iconfont icon-fuwu"></text>
        <text>服务余量</text>
      </view>
      <view 
        class="detail-tab" 
        :class="{ active: currentTab === 'consume' }" 
        @click="currentTab = 'consume'"
      >
        <text class="iconfont icon-jilu"></text>
        <text>消费记录</text>
      </view>
    </view>

    <scroll-view class="detail-content" scroll-y>
      <!-- 服务余量 -->
      <view v-if="currentTab === 'service'" class="service-balance-section">
        <view class="service-card" v-for="(service, index) in serviceBalanceList" :key="index">
          <view class="service-header">
            <view class="service-name-wrap">
              <text class="service-name">{{ service.serviceName }}</text>
              <text class="service-gift" v-if="service.isGift === '1'">赠送</text>
            </view>
            <text class="service-freq">{{ getFrequencyTypeText(service.frequencyType) || getFrequencyText(service.frequency) }}</text>
          </view>
          
          <view class="service-stats">
            <view class="stat-item">
              <text class="stat-value">{{ service.totalCount }}</text>
              <text class="stat-label">总次数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value used">{{ service.usedCount }}</text>
              <text class="stat-label">已使用</text>
            </view>
            <view class="stat-item">
              <text class="stat-value remain" :class="{ warning: service.remainingCount <= 3 && service.remainingCount > 0, danger: service.remainingCount <= 0 }">{{ service.remainingCount }}</text>
              <text class="stat-label">剩余</text>
            </view>
          </view>
          
          <view class="service-progress">
            <view class="progress-info">
              <text class="progress-label">使用进度</text>
              <text class="progress-percent">{{ getProgressPercent(service) }}</text>
            </view>
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :class="{ warning: getProgressValue(service) >= 70, danger: getProgressValue(service) >= 90 }"
                :style="{ width: getProgressWidth(service) }"
              ></view>
            </view>
          </view>
          
          <!-- 固定执行时间 -->
          <view class="service-schedule" v-if="getServiceSchedule(service)">
            <view class="schedule-header">
              <text class="iconfont icon-shijian"></text>
              <text class="schedule-title">固定执行时间</text>
            </view>
            <view class="schedule-content">
              <!-- 每天 -->
              <view v-if="service.frequencyType === 'DAILY'" class="schedule-item">
                <text class="schedule-text">每天 {{ getServiceSchedule(service).appointmentPeriod }}</text>
              </view>
              
              <!-- 每周 -->
              <view v-if="service.frequencyType === 'WEEKLY'" class="schedule-list">
                <view 
                  v-for="(date, idx) in getServiceSchedule(service).dates" 
                  :key="idx"
                  class="schedule-item"
                >
                  <text class="schedule-text">每周{{ getWeekdayText(date.weekday) }} {{ date.appointmentPeriod }}</text>
                </view>
              </view>
              
              <!-- 每月 -->
              <view v-if="service.frequencyType === 'MONTHLY'" class="schedule-list">
                <view 
                  v-for="(date, idx) in getServiceSchedule(service).dates" 
                  :key="idx"
                  class="schedule-item"
                >
                  <text class="schedule-text">每月{{ date.monthDay }}日 {{ date.appointmentPeriod }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view v-if="serviceBalanceList.length === 0" class="empty-data-small">
          <text class="iconfont icon-zanwushuju"></text>
          <text>暂无服务项</text>
        </view>
      </view>

      <!-- 消费记录 -->
      <view v-if="currentTab === 'consume'" class="consume-record-section">
        <view class="record-card-list" v-if="consumeRecords.length > 0">
          <view 
            v-for="(record, index) in consumeRecords" 
            :key="index" 
            class="record-card"
            @click="goToOrderDetail(record)"
          >
            <!-- 卡片头部：服务名称和状态 -->
            <view class="card-header">
              <text class="service-name">{{ record.serviceName || '服务项目' }}</text>
              <view class="status-badge" :class="[getOrderStatusClass(record.orderStatus)]">
                {{ getOrderStatusText(record.orderStatus) }}
              </view>
            </view>
            
            <!-- 卡片内容：预约信息 -->
            <view class="card-content">
              <view class="info-row">
                <view class="info-item">
                  <text class="info-label">预约日期</text>
                  <text class="info-value">{{ formatDate(record.appointmentDate) }}</text>
                </view>
                <view class="info-item" v-if="record.appointmentPeriod">
                  <text class="info-label">预约时段</text>
                  <text class="info-value">{{ record.appointmentPeriod }}</text>
                </view>
              </view>
              
              <!-- 服务商信息 -->
              <view class="provider-info">
                <text class="provider-label">服务商</text>
                <text class="provider-value" :class="{ unassigned: !record.providerName }">
                  {{ record.providerName || '未分配' }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <view v-if="consumeRecords.length === 0" class="empty-data-small">
          <text class="iconfont icon-zanwushuju"></text>
          <text>暂无使用记录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getMyPackageInstance, myConsumePackage, listConsumeLog, myRefundApply, myCancelRefundApply } from '@/api/userpackage'
import {
  formatDate as _formatDate,
  getProgressValue as _getProgressValue,
  getInstanceStatusText as _getInstanceStatusText,
  getInstanceStatusClass as _getInstanceStatusClass,
  getFrequencyTypeText as _getFrequencyTypeText,
  getFrequencyText as _getFrequencyText,
  getProgressWidth as _getProgressWidth,
  getProgressPercent as _getProgressPercent,
  ORDER_STATUS_MAP,
  ORDER_STATUS_CODE_MAP
} from '@/utils/service-helper'

export default {
  data() {
    return {
      statusBarHeight: 0,
      instanceId: null,
      currentTab: 'service',
      packageDetail: {},
      serviceBalanceList: [],
      consumeRecords: [],
      scheduleConfig: null // 存储固定执行时间配置
    }
  },
  
  onLoad(options) {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    if (options.instanceId) {
      this.instanceId = options.instanceId
      this.loadDetail()
    }
  },
  
  methods: {
    formatDate(dateStr) { return _formatDate(dateStr) },
    getProgressValue(service) { return _getProgressValue(service) },
    
    async loadDetail() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await getMyPackageInstance(this.instanceId)
        this.packageDetail = res.data || {}
        // 使用 usageList 而不是 serviceItems
        this.serviceBalanceList = res.data.usageList || []
        
        // 解析固定执行时间配置
        if (res.data.scheduleConfig) {
          try {
            this.scheduleConfig = typeof res.data.scheduleConfig === 'string' 
              ? JSON.parse(res.data.scheduleConfig) 
              : res.data.scheduleConfig
          } catch (e) {
            console.error('解析scheduleConfig失败:', e)
            this.scheduleConfig = null
          }
        }
        
        await this.loadConsumeRecords()
      } catch (error) {
        console.error('加载详情失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    async loadConsumeRecords() {
      try {
        const res = await listConsumeLog({ 
          packageInstanceId: this.instanceId,
          pageNum: 1,
          pageSize: 200
        })
        this.consumeRecords = res.rows || []
      } catch (error) {
        console.error('加载消费记录失败:', error)
        this.consumeRecords = []
      }
    },
    
    // 申请退订
    applyRefund() {
      uni.showModal({
        title: '申请退订套餐',
        editable: true,
        placeholderText: '请输入退订原因',
        content: '提交退订申请后，需等待社区管理员审核。审核通过后套餐余量将清零，连续购买记录将中断，赠送服务将被撤销。',
        success: async (res) => {
          if (res.confirm) {
            const reason = res.content || ''
            if (!reason.trim()) {
              uni.showToast({
                title: '请输入退订原因',
                icon: 'none'
              })
              return
            }
            
            try {
              uni.showLoading({ title: '提交中...' })
              await myRefundApply({
                instanceId: this.instanceId,
                refundReason: reason
              })
              
              uni.showToast({
                title: '申请已提交',
                icon: 'success'
              })
              
              // 刷新详情
              setTimeout(() => {
                this.loadDetail()
              }, 1500)
            } catch (error) {
              console.error('申请退订失败:', error)
              uni.showToast({
                title: error.msg || '申请失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },
    
    // 撤销退订申请
    cancelRefundApply() {
      uni.showModal({
        title: '撤销退订申请',
        content: '确定要撤销退订申请吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              await myCancelRefundApply({
                instanceId: this.instanceId
              })
              
              uni.showToast({
                title: '已撤销申请',
                icon: 'success'
              })
              
              // 刷新详情
              setTimeout(() => {
                this.loadDetail()
              }, 1500)
            } catch (error) {
              console.error('撤销失败:', error)
              uni.showToast({
                title: error.msg || '撤销失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },
    
    getInstanceStatusText(status) { return _getInstanceStatusText(status) },
    getInstanceStatusClass(status) { return _getInstanceStatusClass(status) },
    getFrequencyTypeText(frequencyType) { return _getFrequencyTypeText(frequencyType) },
    getFrequencyText(frequency) { return _getFrequencyText(frequency) },
    
    getOrderStatusText(status) {
      // 使用 service-helper.js 中的状态映射
      const statusKey = ORDER_STATUS_CODE_MAP[status]
      if (statusKey && ORDER_STATUS_MAP[statusKey]) {
        return ORDER_STATUS_MAP[statusKey].text
      }
      return '-'
    },
    getOrderStatusClass(status) {
      // 使用 service-helper.js 中的状态映射
      const statusKey = ORDER_STATUS_CODE_MAP[status]
      if (statusKey && ORDER_STATUS_MAP[statusKey]) {
        // 转换为消费记录页面使用的样式类名
        const classMap = {
          'pending': 'order-pending',
          'accepted': 'order-accepted',
          'serving': 'order-in-service',
          'completed': 'order-completed',
          'cancelled': 'order-cancelled',
          'rejected': 'order-rejected',
          'closed': 'order-closed',
          'dispatching': 'order-dispatching',
          'verifying': 'order-verifying'
        }
        return classMap[statusKey] || ''
      }
      return ''
    },
    getProgressWidth(service) { return _getProgressWidth(service) },
    getProgressPercent(service) { return _getProgressPercent(service) },
    
    // 获取服务的固定执行时间配置
    getServiceSchedule(service) {
      if (!this.scheduleConfig || !this.scheduleConfig.items) return null
      
      const scheduleItem = this.scheduleConfig.items.find(item => item.serviceId === service.serviceId)
      return scheduleItem || null
    },
    
    // 获取星期文本
    getWeekdayText(weekday) {
      const weekdayMap = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '日'
      }
      return weekdayMap[weekday] || weekday
    },
    
    // 跳转到订单详情
    goToOrderDetail(record) {
      if (!record.orderId) {
        uni.showToast({
          title: '订单信息不存在',
          icon: 'none'
        })
        return
      }
      
      uni.navigateTo({
        url: `/pages/order/detail?orderId=${record.orderId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #3ec6c6 0%, #2eb5b5 100%);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

// 顶部套餐信息卡片
.package-header-card {
  padding: 20px 16px 24px;
  
  // 套餐名称和状态
  .header-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    margin-bottom: 14px;
    
    .package-name {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
    }
    
    .status-tag {
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      
      &.status-pending {
        background-color: rgba(250, 173, 20, 0.95);
      }
      
      &.status-using {
        background-color: rgba(139, 195, 74, 0.95);
      }
      
      &.status-expired {
        background-color: rgba(158, 158, 158, 0.95);
      }
      
      &.status-refunded {
        background-color: rgba(244, 67, 54, 0.95);
      }
      
      &.status-rejected {
        background-color: rgba(244, 67, 54, 0.95);
      }
      
      &.status-cancelled {
        background-color: rgba(117, 117, 117, 0.95);
      }
    }
  }
  
  // 使用人员
  .header-member {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 28px;
    background-color: rgba(255, 255, 255, 0.25);
    border-radius: 30px;
    margin-bottom: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    .iconfont {
      font-size: 18px;
      color: #fff;
    }
    
    .member-name {
      font-size: 18px;
      color: #fff;
      font-weight: 700;
      letter-spacing: 2px;
    }
  }
  
  // 时间信息卡片
  .time-card {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 18px 24px;
    margin-bottom: 18px;
    
    .time-item {
      flex: 1;
      text-align: center;
      
      .time-label {
        display: block;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
      }
      
      .time-value {
        display: block;
        font-size: 17px;
        color: #fff;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
    }
    
    .time-divider {
      width: 1px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.3);
      margin: 0 20px;
    }
  }
  
  // 底部信息栏
  .header-bottom {
    display: flex;
    gap: 10px;
    
    .info-item {
      flex: 1;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      padding: 12px 14px;
      text-align: center;
      
      .info-label {
        display: block;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.75);
        margin-bottom: 6px;
      }
      
      .info-value {
        display: block;
        font-size: 16px;
        color: #fff;
        font-weight: 700;
        
        &.price {
          color: #ffe066;
        }
        
        &.period {
          color: #b7eb8f;
        }
      }
    }
  }
}

// 退订申请信息卡片
.refund-info-card {
  margin: 0 15px 10px;
  padding: 15px;
  background-color: #fff7e6;
  border-radius: 12px;
  border: 1px solid #ffd591;
  
  .refund-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .iconfont {
      font-size: 16px;
      color: #fa8c16;
    }
    
    .refund-title {
      font-size: 15px;
      font-weight: 600;
      color: #fa8c16;
    }
  }
  
  .refund-content {
    .refund-item {
      display: flex;
      margin-bottom: 8px;
      font-size: 13px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .refund-label {
        color: #999;
        min-width: 70px;
      }
      
      .refund-value {
        flex: 1;
        color: #666;
      }
    }
  }
}

// 拒绝原因信息卡片
.reject-info-card {
  margin: 0 15px 10px;
  padding: 15px;
  background-color: #fff1f0;
  border-radius: 12px;
  border: 1px solid #ffccc7;
  
  .reject-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .iconfont {
      font-size: 16px;
      color: #ff4d4f;
    }
    
    .reject-title {
      font-size: 15px;
      font-weight: 600;
      color: #ff4d4f;
    }
  }
  
  .reject-content {
    margin-bottom: 10px;
    
    .reject-text {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .reject-time {
    display: flex;
    align-items: center;
    font-size: 12px;
    padding-top: 10px;
    border-top: 1px solid #ffccc7;
    
    .reject-time-label {
      color: #999;
    }
    
    .reject-time-value {
      color: #666;
    }
  }
}

// Tab切换
.detail-tabs {
  display: flex;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  
  .detail-tab {
    flex: 1;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 15px;
    color: #999;
    position: relative;
    transition: all 0.3s ease;
    
    .iconfont {
      font-size: 18px;
      transition: all 0.3s ease;
    }
    
    &.active {
      color: #3ec6c6;
      font-weight: 600;
      background-color: #f8fffe;
      
      .iconfont {
        transform: scale(1.1);
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 4px;
        background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(62, 198, 198, 0.4);
      }
    }
  }
}

// 内容区域
.detail-content {
  flex: 1;
  background-color: #f8f9fa;
}

// 服务余量区域
.service-balance-section {
  padding: 16px;
  
  .service-card {
    background-color: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    
    .service-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      
      .service-name-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .service-name {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }
        
        .service-gift {
          padding: 3px 10px;
          background: linear-gradient(135deg, #ff8c00 0%, #ffa940 100%);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          box-shadow: 0 2px 6px rgba(255, 140, 0, 0.3);
        }
      }
      
      .service-freq {
        font-size: 12px;
        font-weight: 600;
        color: #3ec6c6;
        background-color: #e8f5f5;
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid #d4eded;
      }
    }
    
    .service-stats {
      display: flex;
      justify-content: space-around;
      padding: 20px 0;
      background: linear-gradient(135deg, #f8f9fc 0%, #f5f7fa 100%);
      border-radius: 14px;
      margin-bottom: 18px;
      border: 1px solid #e8ecf1;
      
      .stat-item {
        text-align: center;
        flex: 1;
        position: relative;
        
        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 40px;
          background: linear-gradient(180deg, transparent 0%, #e0e0e0 50%, transparent 100%);
        }
        
        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 6px;
          
          &.used {
            color: #3ec6c6;
          }
          
          &.remain {
            color: #52c41a;
            
            &.warning {
              color: #faad14;
            }
            
            &.danger {
              color: #ff4d4f;
            }
          }
        }
        
        .stat-label {
          font-size: 13px;
          color: #999;
          font-weight: 500;
        }
      }
    }
    
    .service-progress {
      margin-bottom: 18px;
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        
        .progress-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
        
        .progress-percent {
          font-size: 14px;
          color: #3ec6c6;
          font-weight: 700;
        }
      }
      
      .progress-bar {
        height: 10px;
        background-color: #f0f0f0;
        border-radius: 5px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3ec6c6 0%, #2eb5b5 100%);
          border-radius: 5px;
          transition: width 0.5s ease;
          box-shadow: 0 2px 6px rgba(62, 198, 198, 0.3);
          
          &.warning {
            background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
            box-shadow: 0 2px 6px rgba(250, 173, 20, 0.3);
          }
          
          &.danger {
            background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
            box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3);
          }
        }
      }
    }
    
    .service-schedule {
      margin-top: 16px;
      padding: 16px;
      background: linear-gradient(135deg, #e8f5f5 0%, #d4eded 100%);
      border-radius: 12px;
      border: 1px solid #b8e5e5;
      
      .schedule-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .iconfont {
          font-size: 16px;
          color: #3ec6c6;
        }
        
        .schedule-title {
          font-size: 14px;
          font-weight: 600;
          color: #2eb5b5;
        }
      }
      
      .schedule-content {
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .schedule-item {
          display: flex;
          align-items: center;
          padding: 10px 14px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #d4eded;
          box-shadow: 0 2px 4px rgba(62, 198, 198, 0.08);
          
          .schedule-text {
            font-size: 14px;
            color: #333;
            font-weight: 500;
            
            &::before {
              content: '●';
              color: #3ec6c6;
              margin-right: 10px;
              font-size: 10px;
            }
          }
        }
      }
    }
    
    .service-action {
      .confirm-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 48px;
        background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
        border-radius: 24px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 6px 16px rgba(62, 198, 198, 0.35);
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(62, 198, 198, 0.25);
        }
        
        .iconfont {
          font-size: 18px;
        }
        
        &.disabled {
          background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
          color: #bbb;
          box-shadow: none;
          
          &:active {
            transform: none;
          }
        }
      }
    }
  }
}

// 消费记录区域
.consume-record-section {
  padding: 16px;
  
  .record-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .record-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
      
      &:active {
        transform: translateY(2px);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        background: #fafafa;
        border-bottom: 1px solid #f0f0f0;
        
        .service-name {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          flex: 1;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          
          &.order-pending {
            background: #fff7e6;
            color: #ff9900;
          }
          
          &.order-accepted {
            background: #e6f7ff;
            color: #2979ff;
          }
          
          &.order-in-service {
            background: #e6fff9;
            color: #0ac160;
          }
          
          &.order-completed {
            background: #f6ffed;
            color: #52c41a;
          }
          
          &.order-cancelled {
            background: #f5f5f5;
            color: #999;
          }
          
          &.order-rejected {
            background: #fff1f0;
            color: #ff5722;
          }
          
          &.order-closed {
            background: #f5f5f5;
            color: #999;
          }
          
          &.order-dispatching {
            background: #fff7e6;
            color: #fa8c16;
          }
          
          &.order-verifying {
            background: #f6ffed;
            color: #52c41a;
          }
        }
      }
      
      .card-content {
        padding: 14px 16px;
        
        .info-row {
          display: flex;
          gap: 12px;
          margin-bottom: 10px;
          
          .info-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .info-label {
              font-size: 12px;
              color: #999;
            }
            
            .info-value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }
        
        .provider-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #f8f9fa;
          border-radius: 8px;
          
          .provider-label {
            font-size: 12px;
            color: #999;
          }
          
          .provider-value {
            font-size: 13px;
            color: #3ec6c6;
            font-weight: 500;
            
            &.unassigned {
              color: #999;
            }
          }
        }
      }
    }
  }
}

// 空数据
.empty-data-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  
  .iconfont {
    font-size: 70px;
    color: #d4eded;
    margin-bottom: 20px;
  }
  
  text {
    font-size: 15px;
    color: #999;
    font-weight: 500;
  }
}

// 底部操作按钮
.bottom-actions {
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 48px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    
    .iconfont {
      font-size: 18px;
    }
    
    &.refund-btn {
      background-color: #fff1f0;
      color: #ff4d4f;
      border: 1px solid #ffccc7;
    }
    
    &.cancel-btn {
      background-color: #f5f5f5;
      color: #666;
      border: 1px solid #d9d9d9;
    }
  }
}
</style>
