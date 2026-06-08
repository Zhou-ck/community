<template>
  <view class="detail-container" :class="{ 'has-bottom-actions': hasBottomActions }">
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
      <!-- 单人：普通显示 -->
      <view v-if="memberList.length <= 1" class="header-member">
        <text class="iconfont icon-yonghu"></text>
        <text class="member-name">{{ packageDetail.memberName || '-' }}</text>
      </view>
      <!-- 多人：分块切换 -->
      <view v-else class="header-member-multi">
        <view
          v-for="(m, idx) in memberList"
          :key="idx"
          class="member-tab"
          :class="{ active: String(m.instanceId) === String(instanceId) }"
          @click="switchToMember(m)"
        >
          <text class="iconfont icon-yonghu"></text>
          <text class="member-tab-name">{{ m.memberName }}</text>
        </view>
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

    <!-- 绑定设备信息 -->
    <view  v-if="deviceList.length > 0" class="device-info-card">
      <view class="device-header">
        <uni-icons type="gear" size="18" color="#E07A4F"></uni-icons>
        <text class="device-title">绑定设备</text>
        <text class="device-count">{{ deviceList.length }}台</text>
      </view>
      <view class="device-list">
        <view 
          v-for="(device, index) in deviceList" 
          :key="index" 
          class="device-item"
        >
          <view class="device-info">
            <text class="device-name">{{ device.deviceAlias || device.deviceKey }}</text>
            <view class="device-meta">
              <text class="device-member" v-if="device.memberName">使用人：{{ device.memberName }}</text>
              <text class="device-time" v-if="device.serviceStartTime">
                服务期：{{ formatDate(device.serviceStartTime) }} 至 {{ formatDate(device.serviceExpireTime) }}
              </text>
            </view>
          </view>
          <view class="device-status" :class="[getDeviceStatusClass(device.allocationStatus)]">
            {{ getDeviceStatusText(device.allocationStatus) }}
          </view>
        </view>
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
          
          <!-- 按需服务显示 -->
          <view v-if="service.frequencyType === 'ON_DEMAND'" class="on-demand-stats">
            <!-- 无限次数的按需服务 -->
            <view v-if="service.totalCount === -1 && service.remainingCount === -1" class="on-demand-badge">
              <text class="on-demand-text">按需服务</text>
              <text class="on-demand-desc">无次数限制</text>
            </view>
            
            <!-- 有限次数的按需服务 -->
            <view v-else class="on-demand-limited">
              <view class="on-demand-badge">
                <text class="on-demand-text">按需服务</text>
                <text class="on-demand-desc">限{{ service.totalCount }}次</text>
              </view>
              <view class="limited-stats">
                <view class="stat-item-small" @click="showServiceOrders(service, 'used', true)">
                  <text class="stat-value-small used">{{ service.usedCount }}</text>
                  <text class="stat-label-small">已使用</text>
                </view>
                <view class="stat-item-small" @click="onDemandRemainClick(service)">
                  <text class="stat-value-small remain" :class="{ warning: service.remainingCount <= 0 }">{{ service.remainingCount }}</text>
                  <text class="stat-label-small">剩余</text>
                </view>
              </view>
            </view>
            
            <!-- 申请服务按钮 -->
            <view class="on-demand-action" v-if="service.remainingCount > 0 || service.remainingCount === -1">
              <view class="apply-service-btn" @click="showServiceApplyModal(service)">
                <uni-icons type="plus" size="16" color="#fff"></uni-icons>
                <text>申请服务</text>
              </view>
            </view>
            
            <!-- 次数用完提示 -->
            <view class="on-demand-action" v-else>
              <view class="apply-service-btn disabled">
                <text>次数已用完</text>
              </view>
            </view>
          </view>
          
          <!-- 普通服务显示 -->
          <view v-else class="service-stats">
            <view class="stat-item" @click="showServiceOrders(service, 'all')">
              <text class="stat-value">{{ service.totalCount }}</text>
              <text class="stat-label">总次数</text>
            </view>
            <view class="stat-item" @click="showServiceOrders(service, 'used')">
              <text class="stat-value used">{{ service.usedCount }}</text>
              <text class="stat-label">已使用</text>
            </view>
            <view class="stat-item" @click="showServiceOrders(service, 'remain')">
              <text class="stat-value remain" :class="{ warning: service.remainingCount <= 3 && service.remainingCount > 0, danger: service.remainingCount <= 0 }">{{ service.remainingCount }}</text>
              <text class="stat-label">剩余</text>
            </view>
          </view>
          
          <!-- 普通服务才显示进度条 -->
          <view v-if="service.frequencyType !== 'ON_DEMAND'" class="service-progress">
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
        <!-- 状态筛选栏 -->
        <view class="consume-filter-bar">
          <view
            v-for="f in consumeFilters"
            :key="f.key"
            class="filter-tab"
            :class="{ active: consumeFilterKey === f.key }"
            @click="consumeFilterKey = f.key"
          >
            <text>{{ f.label }}</text>
            <text class="filter-count">{{ f.count }}</text>
          </view>
          <!-- 待派单/服务中 显示"查看今日"按钮 -->
          <view
            v-if="consumeFilterKey === 'dispatching' || consumeFilterKey === 'serving'"
            class="filter-tab today-btn"
            :class="{ active: showTodayOnly }"
            @click="showTodayOnly = !showTodayOnly"
          >
            <text>今日</text>
          </view>
        </view>

        <view class="record-card-list" v-if="filteredConsumeRecords.length > 0">
          <view
            v-for="(record, index) in filteredConsumeRecords"
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
        
        <view v-if="filteredConsumeRecords.length === 0" class="empty-data-small">
          <text class="iconfont icon-zanwushuju"></text>
          <text>暂无使用记录</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="(packageDetail.instanceStatus === 'ACTIVE' || packageDetail.instanceStatus === 'REFUND_PENDING') && !serviceOrdersVisible && !applyModalVisible && !refundPopupVisible && !showVerificationModal">
      <template v-if="packageDetail.instanceStatus === 'ACTIVE'">
        <view class="action-btn qrcode-btn" @click="viewQrCode">查看核销码</view>
        <view class="action-btn refund-btn" @click="applyRefund">申请退订</view>
      </template>
      <view v-else-if="packageDetail.instanceStatus === 'REFUND_PENDING'" class="action-btn cancel-btn full-width" @click="cancelRefundApply">撤销申请</view>
    </view>

    <!-- 申请退订弹窗 -->
    <uni-popup ref="refundApplyPopup" type="center" @change="onRefundPopupChange">
      <view class="refund-apply-popup">
        <view class="refund-popup-header">
          <text class="refund-popup-title">申请退订套餐</text>
          <view class="refund-popup-close" @click="closeRefundPopup">
            <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="refund-popup-content">
          <view class="refund-package-info">
            <text class="package-name">{{ packageDetail.packageName }}</text>
            <view class="package-member" v-if="packageDetail.memberName">
              <text class="iconfont icon-yonghu"></text>
              <text class="member-text">{{ packageDetail.memberName }}</text>
            </view>
          </view>
          <view class="refund-warning">
            <view class="warning-icon">
              <text class="iconfont icon-tishi"></text>
            </view>
            <view class="warning-text">
              <text class="warning-title">退订须知</text>
              <view class="warning-list">
                <text class="warning-item">• 提交退订申请后，需等待社区管理员审核</text>
                <text class="warning-item">• 审核通过后套餐余量将清零</text>
              </view>
            </view>
          </view>
          <view class="refund-reason-section">
            <text class="reason-label">退订原因 <text class="required">*</text></text>
            <textarea
              class="reason-input"
              v-model="refundReason"
              placeholder="请输入退订原因（必填）"
              maxlength="200"
              :auto-height="false"
            ></textarea>
            <text class="reason-count">{{ refundReason.length }}/200</text>
          </view>
        </view>
        <view class="refund-popup-footer">
          <view class="refund-cancel-btn" @click="closeRefundPopup">取消</view>
          <view class="refund-confirm-btn" @click="submitRefundApply">确认提交</view>
        </view>
      </view>
    </uni-popup>

    <!-- 服务申请弹窗 -->
    <uni-popup ref="applyPopup" type="bottom" :safe-area="false" @change="onApplyPopupChange">
      <view class="apply-modal">
        <view class="modal-header">
          <text class="modal-title">申请服务</text>
          <view class="close-btn" @click="closeApplyModal">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="modal-content">
          <view class="service-info">
            <text class="service-name">{{ currentService && currentService.serviceName }}</text>
            <text class="service-type">按需服务</text>
          </view>
          
          <view class="form-section">
            <view class="form-item">
              <text class="form-label">预约日期</text>
              <picker mode="date" :value="applyForm.appointmentDate" :start="applyStartDate" :end="applyEndDate" @change="onDateChange">
                <view class="picker-input">
                  <text v-if="applyForm.appointmentDate">{{ applyForm.appointmentDate }}</text>
                  <text v-else class="placeholder">请选择预约日期</text>
                  <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                </view>
              </picker>
            </view>
            
            <view class="form-item">
              <text class="form-label">预约时段</text>
              <picker :range="availableTimeSlots" @change="onTimeSlotChange">
                <view class="picker-input">
                  <text v-if="applyForm.appointmentPeriod">{{ applyForm.appointmentPeriod }}</text>
                  <text v-else class="placeholder">请选择预约时段</text>
                  <uni-icons type="clock" size="16" color="#999"></uni-icons>
                </view>
              </picker>
            </view>
            
            <view class="form-item">
              <text class="form-label">是否紧急</text>
              <switch :checked="applyForm.isUrgent === '1'" @change="onUrgentChange" color="#E07A4F"></switch>
            </view>
            
            <view class="form-item">
              <text class="form-label">备注说明</text>
              <textarea 
                v-model="applyForm.remark" 
                placeholder="请输入备注说明（选填）"
                class="textarea-input"
                maxlength="200"
              ></textarea>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="cancel-btn" @click="closeApplyModal">取消</view>
          <view class="confirm-btn" @click="submitServiceApply">确认申请</view>
        </view>
      </view>
    </uni-popup>

    <!-- 服务订单列表弹窗 -->
    <uni-popup ref="serviceOrdersPopup" type="bottom" :safe-area="false" @change="onServiceOrdersPopupChange">
      <view class="service-orders-modal">
        <!-- 拖动条 -->
        <view class="drag-bar"></view>
        <view class="som-header">
          <view class="som-title-center">
            <text class="som-title">{{ serviceOrdersTitle }}</text>
            <view class="som-count-badge">{{ serviceOrdersPopupList.length }}条</view>
          </view>
          <view class="som-close" @click="closeServiceOrdersPopup">
            <uni-icons type="closeempty" size="22" color="#bbb"></uni-icons>
          </view>
        </view>
        <scroll-view class="som-scroll" scroll-y="true">
          <view v-if="serviceOrdersPopupList.length > 0" class="som-list">
            <view
              v-for="(record, index) in serviceOrdersPopupList"
              :key="index"
              class="som-item"
              @click="goToOrderDetail(record)"
            >
              <view class="som-item-left">
                <view class="som-date-row">
                  <text class="iconfont icon-shijian som-date-icon"></text>
                  <text class="som-date">{{ formatDate(record.appointmentDate) }}</text>
                  <text class="som-period" v-if="record.appointmentPeriod">{{ record.appointmentPeriod }}</text>
                </view>
                <view class="som-provider-row">
                  <text class="som-provider-label">服务商</text>
                  <text class="som-provider-value" :class="{ unassigned: !record.providerName }">
                    {{ record.providerName || '未分配' }}
                  </text>
                </view>
              </view>
              <view class="som-right">
                <view class="som-status" :class="[getOrderStatusClass(record.orderStatus)]">
                  {{ getOrderStatusText(record.orderStatus) }}
                </view>
                <text class="iconfont icon-right som-arrow"></text>
              </view>
            </view>
          </view>
          <view v-else class="empty-data-small">
            <text class="iconfont icon-zanwushuju"></text>
            <text>暂无相关记录</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 套餐核销码弹窗 -->
    <VerificationModal
      :visible="showVerificationModal"
      :code="verificationCode"
      :loading="verificationCodeLoading"
      :qrcodeUrl="packageQrcodeUrl"
      :memberInfo="currentMemberInfo"
      @close="closeVerificationModal"
      @manual-confirm="handleManualConfirm"
      @qrcode-load="handleQrcodeLoad"
      @qrcode-error="handleQrcodeError"
      @report-lost="handleReportLost"
    />
  </view>
</template>

<script>
import { getMyPackageInstance, myConsumePackage, listConsumeLog, myRefundApply, myCancelRefundApply } from '@/api/userpackage'
import { applyOnDemandService } from '@/api/serviceorder'
import { viewPackageQrCode, reportLostQrCode } from '@/api/packageQrCode'
import verificationMixin from '@/mixins/verification-mixin.js'
import VerificationModal from '@/components/verification-modal/verification-modal.vue'
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
  mixins: [verificationMixin],
  components: { VerificationModal },
  data() {
    return {
      statusBarHeight: 0,
      instanceId: null,
      allInstanceIds: [],
      memberList: [], // 同订单所有成员 [{instanceId, memberName}]
      currentTab: 'service',
      packageDetail: {},
      serviceBalanceList: [],
      consumeRecords: [],
      scheduleConfig: null,
      deviceList: [],
      currentMemberInfo: null,
      showApplyModal: false,
      // 退订申请弹窗
      refundPopupVisible: false,
      refundReason: '',
      refundingPackage: {},
      currentService: null,
      applyForm: {
        appointmentDate: '',
        appointmentPeriod: '',
        isUrgent: '0',
        remark: ''
      },
      timeSlots: [
        '8:00~10:00',
        '10:00~12:00',
        '14:00~16:00',
        '16:00~18:00'
      ],
      // 服务申请弹窗
      applyModalVisible: false,
      // 服务订单弹窗
      serviceOrdersTitle: '',
      serviceOrdersPopupList: [],
      serviceOrdersVisible: false,
      // 消费记录筛选
      consumeFilterKey: 'dispatching',
      showTodayOnly: false
    }
  },

  computed: {
    packageQrcodeUrl() {
      if (!this.verificationCode) return ''
      const size = 200
      const encoded = encodeURIComponent(this.verificationCode.plainCode)
      return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10`
    },
    
    // 判断是否有底部操作按钮
    hasBottomActions() {
      const isStatusMatch = this.packageDetail.instanceStatus === 'ACTIVE' || this.packageDetail.instanceStatus === 'REFUND_PENDING'
      const isPopupHidden = !this.serviceOrdersVisible && !this.applyModalVisible && !this.refundPopupVisible && !this.showVerificationModal
      return isStatusMatch && isPopupHidden
    },

    // 申请服务的开始可选日期
    applyStartDate() {
      if (!this.packageDetail.startTime) return ''
      return this.packageDetail.startTime.slice(0, 10)
    },

    // 申请服务的结束可选日期
    applyEndDate() {
      if (!this.packageDetail.expireTime) return ''
      return this.packageDetail.expireTime.slice(0, 10)
    },

    // 可选时段：如果选择今天，过滤已经过去的时段
    availableTimeSlots() {
      const today = new Date().toISOString().slice(0, 10)
      if (this.applyForm.appointmentDate !== today) return this.timeSlots
      const nowHour = new Date().getHours()
      return this.timeSlots.filter(slot => {
        // 取时段结束时间，如 '8:00~10:00' 取 10
        const endTime = slot.split('~')[1]
        const endHour = parseInt(endTime)
        return endHour > nowHour
      })
    },

    // 消费记录筛选
    consumeFilters() {
      // 待派单: 0,7  服务中: 1,2,8  已完成: 3
      const dispatchingStatuses = ['0', '7']
      const servingStatuses = ['1', '2', '8']
      const completedStatuses = ['3']
      return [
        {
          key: 'dispatching',
          label: '待派单',
          count: this.consumeRecords.filter(r => dispatchingStatuses.includes(String(r.orderStatus))).length
        },
        {
          key: 'serving',
          label: '服务中',
          count: this.consumeRecords.filter(r => servingStatuses.includes(String(r.orderStatus))).length
        },
        {
          key: 'completed',
          label: '已完成',
          count: this.consumeRecords.filter(r => completedStatuses.includes(String(r.orderStatus))).length
        }
      ]
    },

    filteredConsumeRecords() {
      const map = {
        dispatching: ['0', '7'],
        serving: ['1', '2', '8'],
        completed: ['3']
      }
      const statuses = map[this.consumeFilterKey] || []
      let result = this.consumeRecords.filter(r => statuses.includes(String(r.orderStatus)))
      if (this.showTodayOnly && (this.consumeFilterKey === 'dispatching' || this.consumeFilterKey === 'serving')) {
        const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
        result = result.filter(r => r.appointmentDate && r.appointmentDate.slice(0, 10) === today)
      }
      // 按预约日期升序排序，无日期的排在最后
      result.sort((a, b) => {
        const da = a.appointmentDate ? a.appointmentDate.slice(0, 10) : ''
        const db = b.appointmentDate ? b.appointmentDate.slice(0, 10) : ''
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return da > db ? 1 : da < db ? -1 : 0
      })
      return result
    }
  },

  onLoad(options) {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight

    if (options.allInstanceIds) {
      this.allInstanceIds = options.allInstanceIds.split(',').filter(Boolean)
      this.instanceId = this.allInstanceIds[0] // already a string from URL params
      this.memberList = uni.getStorageSync('detailMemberList') || []
      uni.removeStorageSync('detailMemberList')
      this.loadDetail()
    }
  },
  
  methods: {
    formatDate(dateStr) { return _formatDate(dateStr) },
    getProgressValue(service) { return _getProgressValue(service) },

    // 切换成员
    switchToMember(member) {
      if (String(member.instanceId) === String(this.instanceId)) return
      this.instanceId = String(member.instanceId)
      this.loadDetail()
    },
    
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
        
        // 设备列表已包含在套餐详情接口返回数据中
        this.deviceList = res.data.deviceAllocation ? [res.data.deviceAllocation] : []
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
    
    // 申请退订 - 打开弹窗
    applyRefund() {
      this.refundReason = ''
      this.refundPopupVisible = true
      this.$refs.refundApplyPopup.open()
    },

    // 关闭退订弹窗
    closeRefundPopup() {
      this.refundPopupVisible = false
      this.$refs.refundApplyPopup.close()
      this.refundReason = ''
    },

    // 退订弹窗状态改变
    onRefundPopupChange(e) {
      this.refundPopupVisible = e.show
    },

    // 提交退订申请
    async submitRefundApply() {
      if (!this.refundReason.trim()) {
        uni.showToast({ title: '请输入退订原因', icon: 'none' })
        return
      }
      const isMulti = this.allInstanceIds.length > 1
      if (isMulti) {
        uni.showModal({
          title: '全部退订确认',
          content: `此套餐包含多位成员（${this.packageDetail.memberName}），将同时退订所有成员，是否确认？`,
          confirmText: '确认退订',
          cancelText: '取消',
          success: async (res) => {
            if (res.confirm) await this._doRefund()
          }
        })
      } else {
        await this._doRefund()
      }
    },

    async _doRefund() {
      try {
        uni.showLoading({ title: '提交中...' })
        await Promise.all(this.allInstanceIds.map(id =>
          myRefundApply({ instanceId: id, refundReason: this.refundReason })
        ))
        this.closeRefundPopup()
        uni.showToast({ title: '申请已提交', icon: 'success' })
        setTimeout(() => { this.loadDetail() }, 1500)
      } catch (error) {
        console.error('申请退订失败:', error)
        uni.showToast({ title: error.msg || '申请失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
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
      
      // 检查是否有有效的执行时间配置
      if (!scheduleItem) return null
      
      // 检查是否有具体的时间配置
      if (service.frequencyType === 'DAILY') {
        // 每天类型需要有appointmentPeriod
        return scheduleItem.appointmentPeriod ? scheduleItem : null
      } else if (service.frequencyType === 'WEEKLY' || service.frequencyType === 'MONTHLY') {
        // 每周/每月类型需要有dates数组且不为空
        return (scheduleItem.dates && scheduleItem.dates.length > 0) ? scheduleItem : null
      }
      
      return null
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
    },
    
    // 获取设备分配状态文本
    getDeviceStatusText(status) {
      const statusMap = {
        '0': '待安装',
        '1': '监控服务中',
        '2': '服务已到期',
        '3': '已归还',
        '4': '已退订'
      }
      return statusMap[String(status)] || '未知'
    },
    
    // 获取设备分配状态样式类
    getDeviceStatusClass(status) {
      const classMap = {
        '0': 'status-pending',
        '1': 'status-active',
        '2': 'status-expired',
        '3': 'status-returned',
        '4': 'status-cancelled'
      }
      return classMap[String(status)] || ''
    },
    
    // 点击统计数字显示该服务订单列表
    showServiceOrders(service, type, isOnDemand) {
      const titleMap = { all: '全部订单', used: '已使用订单', remain: '剩余订单' }
      this.serviceOrdersTitle = `${service.serviceName} · ${titleMap[type]}`

      const sortByDate = arr => [...arr].sort((a, b) => {
        const da = a.appointmentDate ? a.appointmentDate.slice(0, 10) : ''
        const db = b.appointmentDate ? b.appointmentDate.slice(0, 10) : ''
        return da < db ? -1 : da > db ? 1 : 0
      })

      const records = this.consumeRecords.filter(r => r.serviceId === service.serviceId)

      if (type === 'all') {
        this.serviceOrdersPopupList = sortByDate(records)
      } else if (type === 'used') {
        if (isOnDemand) {
          // 按需服务已使用：包含已完成(3) + 服务中(1,2,8)，过滤无日期记录
          const usedStatuses = ['1', '2', '3', '8']
          this.serviceOrdersPopupList = sortByDate(records.filter(r => usedStatuses.includes(String(r.orderStatus)) && r.appointmentDate))
        } else {
          // 普通服务已使用：仅已完成(3)
          this.serviceOrdersPopupList = sortByDate(records.filter(r => String(r.orderStatus) === '3'))
        }
      } else {
        // 剩余：排除已完成
        this.serviceOrdersPopupList = sortByDate(records.filter(r => String(r.orderStatus) !== '3'))
      }

      this.serviceOrdersVisible = true
      this.$refs.serviceOrdersPopup.open()
    },

    closeServiceOrdersPopup() {
      this.serviceOrdersVisible = false
      this.$refs.serviceOrdersPopup.close()
    },

    onServiceOrdersPopupChange(e) {
      if (!e.show) this.serviceOrdersVisible = false
    },

    // 按需服务点击剩余
    onDemandRemainClick(service) {
      if (service.remainingCount <= 0) return
      uni.showModal({
        title: '提示',
        content: '按需服务需要配置服务日期和时间，是否现在配置？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.showServiceApplyModal(service)
          }
        }
      })
    },

    // 显示服务申请弹窗
    showServiceApplyModal(service) {
      this.currentService = service
      this.resetApplyForm()
      this.applyModalVisible = true
      this.$refs.applyPopup.open()
    },
    
    // 关闭服务申请弹窗
    closeApplyModal() {
      this.applyModalVisible = false
      this.$refs.applyPopup.close()
      this.currentService = null
      this.resetApplyForm()
    },
    
    // 申请弹窗状态改变
    onApplyPopupChange(e) {
      this.applyModalVisible = e.show
    },
    
    // 重置申请表单
    resetApplyForm() {
      this.applyForm = {
        appointmentDate: '',
        appointmentPeriod: '',
        isUrgent: '0',
        remark: ''
      }
    },
    
    // 日期选择
    onDateChange(e) {
      this.applyForm.appointmentDate = e.detail.value
      // 切换日期后，如果已选时段不在可选范围内则清空
      if (this.applyForm.appointmentPeriod && !this.availableTimeSlots.includes(this.applyForm.appointmentPeriod)) {
        this.applyForm.appointmentPeriod = ''
      }
    },
    
    // 时段选择
    onTimeSlotChange(e) {
      this.applyForm.appointmentPeriod = this.availableTimeSlots[e.detail.value]
    },
    
    // 紧急状态切换
    onUrgentChange(e) {
      this.applyForm.isUrgent = e.detail.value ? '1' : '0'
    },
    
    // 查看核销码
    async viewQrCode() {
      const memberId = this.packageDetail.memberId || this.$store.getters.id
      const deptId = this.packageDetail.deptId || this.$store.getters.deptId
      await this.fetchQrCode(memberId, deptId)
    },

    // 获取核销码
    async fetchQrCode(memberId, deptId) {
      if (!memberId || !deptId) {
        uni.showToast({ title: '成员信息异常', icon: 'none' })
        return
      }

      this.currentVerificationOrder = {
        id: this.instanceId,
        packageName: this.packageDetail.packageName,
        userId: this.packageDetail.userId || '',
        deptId: deptId
      }
      this.verificationCode = null
      this.verificationCodeLoading = true
      this.showVerificationModal = true

      try {
        uni.showLoading({ title: '加载中...' })
        const res = await viewPackageQrCode(memberId, deptId)
        if (res.data && res.data.qrContent) {
          this.currentMemberInfo = {
            memberName: res.data.memberName || '',
            communityName: res.data.communityName || '',
            memberId: res.data.memberId,
            communityDeptId: res.data.communityDeptId,
            qrId: res.data.qrId
          }
          this.verificationCode = { plainCode: res.data.qrContent, expireTime: null }
        } else {
          uni.showToast({ title: '暂无核销码信息', icon: 'none' })
        }
      } catch (error) {
        console.error('获取核销码失败:', error)
        uni.showToast({ title: error.msg || '获取核销码失败', icon: 'none' })
      } finally {
        this.verificationCodeLoading = false
        uni.hideLoading()
      }
    },

    // 处理挂失
    async handleReportLost() {
      if (!this.currentMemberInfo || !this.currentMemberInfo.qrId) {
        uni.showToast({ title: '缺少必要信息，无法挂失', icon: 'none' })
        return
      }
      uni.showModal({
        title: '确认挂失',
        content: '确定要挂失当前二维码吗？挂失后原二维码将失效，需要重新申请。',
        confirmText: '确认挂失',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              const response = await reportLostQrCode(this.currentMemberInfo.memberId, this.currentMemberInfo.communityDeptId)
              if (response.code === 200) {
                uni.showToast({ title: '挂失成功', icon: 'success' })
                this.closeVerificationModal()
              } else {
                uni.showToast({ title: response.msg || '挂失失败', icon: 'none' })
              }
            } catch (error) {
              uni.showToast({ title: error.msg || '挂失失败', icon: 'none' })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },

    // 提交服务申请
    async submitServiceApply() {
      // 表单验证
      if (!this.applyForm.appointmentDate) {
        uni.showToast({
          title: '请选择预约日期',
          icon: 'none'
        })
        return
      }
      
      if (!this.applyForm.appointmentPeriod) {
        uni.showToast({
          title: '请选择预约时段',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '提交中...' })
        
        const requestData = {
          appointmentDate: this.applyForm.appointmentDate,
          appointmentPeriod: this.applyForm.appointmentPeriod,
          instanceId: this.instanceId,
          isUrgent: this.applyForm.isUrgent,
          remark: this.applyForm.remark,
          serviceId: this.currentService.serviceId
        }
        
        await applyOnDemandService(requestData)
        
        uni.showToast({
          title: '申请成功',
          icon: 'success'
        })
        
        this.closeApplyModal()
        
        // 切换到消费记录tab并刷新数据
        this.currentTab = 'consume'
        
        // 滚动到顶部
        this.$nextTick(() => {
          const scrollView = uni.createSelectorQuery().select('.detail-content')
          scrollView.node((res) => {
            if (res && res.node) {
              res.node.scrollTop = 0
            }
          }).exec()
        })
        
        setTimeout(() => {
          this.loadConsumeRecords()
        }, 1500)
        
      } catch (error) {
        console.error('申请服务失败:', error)
        uni.showToast({
          title: error.msg || '申请失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #E07A4F 0%, #C96A42 100%);
  display: flex;
  flex-direction: column;
  
  // 有底部按钮时的样式
  &.has-bottom-actions {
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
  }
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
  
  // 使用人员 - 单人
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

    .member-switch-icon {
      font-size: 14px;
      opacity: 0.85;
    }
  }

  // 使用人员 - 多人切换
  .header-member-multi {
    display: flex;
    gap: 10px;
    margin-bottom: 18px;

    .member-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 0;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      border: 2px solid transparent;
      transition: all 0.2s ease;

      .iconfont {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
      }

      .member-tab-name {
        font-size: 17px;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 600;
        letter-spacing: 1px;
      }

      &.active {
        background-color: rgba(255, 255, 255, 0.35);
        border-color: rgba(255, 255, 255, 0.7);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);

        .iconfont {
          color: #fff;
        }

        .member-tab-name {
          color: #fff;
        }
      }

      &:active {
        transform: scale(0.97);
      }
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

// 绑定设备信息卡片
.device-info-card {
  margin: 0 15px 10px;
  padding: 15px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .device-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    .iconfont {
      font-size: 18px;
      color: #E07A4F;
    }
    
    .device-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      flex: 1;
    }
    
    .device-count {
      font-size: 12px;
      color: #999;
      background-color: #f5f5f5;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }
  
  .device-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .device-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: linear-gradient(135deg, #f8fffe 0%, #f5f9f9 100%);
      border-radius: 10px;
      border: 1px solid #e8f5f5;
      
      .device-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        .iconfont {
          font-size: 20px;
          color: #fff;
        }
      }
      
      .device-info {
        flex: 1;
        min-width: 0;
        
        .device-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          display: block;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .device-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          
          .device-member {
            font-size: 12px;
            color: #666;
          }
          
          .device-time {
            font-size: 11px;
            color: #999;
          }
        }
      }
      
      .device-status {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        flex-shrink: 0;
        
        &.status-pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        &.status-active {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        
        &.status-returned {
          background-color: #f5f5f5;
          color: #999;
        }
        
        &.status-expired {
          background-color: #fff1f0;
          color: #D95C5C;
        }

        &.status-cancelled {
          background-color: #f5f5f5;
          color: #999;
        }
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
      color: #D95C5C;
    }
    
    .reject-title {
      font-size: 15px;
      font-weight: 600;
      color: #D95C5C;
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
      color: #E07A4F;
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
        background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(224, 122, 79, 0.4);
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
        color: #E07A4F;
        background-color: #e8f5f5;
        padding: 6px 14px;
        border-radius: 20px;
        border: 1px solid #FFF0E8;
      }
    }
    
    .on-demand-stats {
      padding: 20px;
      background: linear-gradient(135deg, #e8f5f5 0%, #FFF0E8 100%);
      border-radius: 14px;
      margin-bottom: 18px;
      border: 1px solid #b8e5e5;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      
      .on-demand-badge {
        text-align: center;
        
        .on-demand-text {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #C96A42;
          margin-bottom: 6px;
        }
        
        .on-demand-desc {
          font-size: 14px;
          color: #E07A4F;
          font-weight: 500;
        }
      }
      
      .on-demand-limited {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        
        .limited-stats {
          display: flex;
          gap: 20px;
          
          .stat-item-small {
            text-align: center;
            
            .stat-value-small {
              display: block;
              font-size: 20px;
              font-weight: 700;
              color: #333;
              margin-bottom: 4px;
              
              &.used {
                color: #E07A4F;
              }
              
              &.remain {
                color: #5AAB7A;
                
                &.warning {
                  color: #D95C5C;
                }
              }
            }
            
            .stat-label-small {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
      
      .on-demand-action {
        .apply-service-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
          border-radius: 20px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(224, 122, 79, 0.3);
          transition: all 0.3s ease;
          
          &:active {
            transform: scale(0.98);
            box-shadow: 0 2px 8px rgba(224, 122, 79, 0.2);
          }
          
          &.disabled {
            background: #d9d9d9;
            color: #999;
            box-shadow: none;
            cursor: not-allowed;
            
            &:active {
              transform: none;
            }
          }
        }
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
            color: #E07A4F;
          }
          
          &.remain {
            color: #5AAB7A;
            
            &.warning {
              color: #faad14;
            }
            
            &.danger {
              color: #D95C5C;
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
          color: #E07A4F;
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
          background: linear-gradient(90deg, #E07A4F 0%, #C96A42 100%);
          border-radius: 5px;
          transition: width 0.5s ease;
          box-shadow: 0 2px 6px rgba(224, 122, 79, 0.3);
          
          &.warning {
            background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
            box-shadow: 0 2px 6px rgba(250, 173, 20, 0.3);
          }
          
          &.danger {
            background: linear-gradient(90deg, #D95C5C 0%, #E07070 100%);
            box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3);
          }
        }
      }
    }
    
    .service-schedule {
      margin-top: 16px;
      padding: 16px;
      background: linear-gradient(135deg, #e8f5f5 0%, #FFF0E8 100%);
      border-radius: 12px;
      border: 1px solid #b8e5e5;
      
      .schedule-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .iconfont {
          font-size: 16px;
          color: #E07A4F;
        }
        
        .schedule-title {
          font-size: 14px;
          font-weight: 600;
          color: #C96A42;
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
          border: 1px solid #FFF0E8;
          box-shadow: 0 2px 4px rgba(224, 122, 79, 0.08);
          
          .schedule-text {
            font-size: 14px;
            color: #333;
            font-weight: 500;
            
            &::before {
              content: '●';
              color: #E07A4F;
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
        background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
        border-radius: 24px;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 6px 16px rgba(224, 122, 79, 0.35);
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.98);
          box-shadow: 0 4px 12px rgba(224, 122, 79, 0.25);
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

  .consume-filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;

    .filter-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 9px 0;
      background: #fff;
      border-radius: 20px;
      border: 1px solid #e8e8e8;
      font-size: 13px;
      color: #999;
      transition: all 0.2s;

      .filter-count {
        font-size: 11px;
        background: #f0f0f0;
        color: #bbb;
        padding: 1px 6px;
        border-radius: 8px;
        font-weight: 600;
      }

      &.active {
        background: linear-gradient(135deg, #E07A4F, #C96A42);
        border-color: transparent;
        color: #fff;
        box-shadow: 0 4px 10px rgba(224, 122, 79, 0.3);

        .filter-count {
          background: rgba(255, 255, 255, 0.3);
          color: #fff;
        }
      }
    }
  }
  
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
            color: #E8A84C;
          }
          
          &.order-accepted {
            background: #e6f7ff;
            color: #2979ff;
          }
          
          &.order-in-service {
            background: #e6fff9;
            color: #5AAB7A;
          }
          
          &.order-completed {
            background: #f6ffed;
            color: #5AAB7A;
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
            color: #5AAB7A;
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
            color: #E07A4F;
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
    color: #FFF0E8;
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 15px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 48px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    
    &.qrcode-btn {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
    }
    
    &.refund-btn {
      background-color: #fff1f0;
      color: #D95C5C;
      border: 1px solid #ffccc7;
    }
    
    &.cancel-btn {
      background-color: #f5f5f5;
      color: #666;
      border: 1px solid #d9d9d9;
      
      &.full-width {
        flex: 1;
      }
    }
  }
}

// 退订申请弹窗
.refund-apply-popup {
  width: 85vw;
  max-width: 340px;
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;

  .refund-popup-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;

    .refund-popup-title {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }

    .refund-popup-close {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .refund-popup-content {
    padding: 16px 20px;
    max-height: 60vh;
    overflow-y: auto;

    .refund-package-info {
      padding: 12px 16px;
      background-color: #f8f9fc;
      border-radius: 10px;
      margin-bottom: 16px;

      .package-name {
        display: block;
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .package-member {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        padding: 8px 12px;
        background: linear-gradient(135deg, #e8f5f5 0%, #FFF0E8 100%);
        border-radius: 8px;
        border: 1px solid #b8e5e5;

        .iconfont {
          font-size: 16px;
          color: #C96A42;
        }

        .member-text {
          font-size: 16px;
          font-weight: 700;
          color: #C96A42;
          letter-spacing: 1px;
        }
      }
    }

    .refund-warning {
      display: flex;
      gap: 12px;
      padding: 14px;
      background-color: #fff7e6;
      border-radius: 10px;
      border: 1px solid #ffd591;
      margin-bottom: 16px;

      .warning-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;

        .iconfont {
          font-size: 22px;
          color: #fa8c16;
        }
      }

      .warning-text {
        flex: 1;

        .warning-title {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #fa8c16;
          margin-bottom: 8px;
        }

        .warning-list {
          .warning-item {
            display: block;
            font-size: 13px;
            color: #666;
            line-height: 1.8;
          }
        }
      }
    }

    .refund-reason-section {
      position: relative;

      .reason-label {
        display: block;
        font-size: 14px;
        color: #333;
        font-weight: 500;
        margin-bottom: 10px;

        .required {
          color: #D95C5C;
        }
      }

      .reason-input {
        width: 100%;
        height: 100px;
        padding: 12px;
        background-color: #f8f9fc;
        border: 1px solid #e5e5e5;
        border-radius: 10px;
        font-size: 14px;
        color: #333;
        box-sizing: border-box;
      }

      .reason-count {
        position: absolute;
        right: 12px;
        bottom: 10px;
        font-size: 12px;
        color: #999;
      }
    }
  }

  .refund-popup-footer {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;

    .refund-cancel-btn, .refund-confirm-btn {
      flex: 1;
      height: 44px;
      line-height: 44px;
      text-align: center;
      border-radius: 22px;
      font-size: 15px;
      font-weight: 500;
    }

    .refund-cancel-btn {
      background-color: #f5f5f5;
      color: #666;
    }

    .refund-confirm-btn {
      background: linear-gradient(135deg, #D95C5C 0%, #E07070 100%);
      color: #fff;
    }
  }
}

// 服务申请弹窗样式
.apply-modal {
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 0;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
    
    .modal-title {
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      color: #333;
      margin-left: 30px; // 抵消右侧关闭按钮的宽度，确保文字视觉居中
    }
    
    .close-btn {
      padding: 5px;
    }
  }
  
  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    
    .service-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: linear-gradient(135deg, #f8fffe 0%, #f5f9f9 100%);
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #e8f5f5;
      
      .service-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
      
      .service-type {
        font-size: 12px;
        color: #E07A4F;
        background: #e8f5f5;
        padding: 4px 10px;
        border-radius: 10px;
      }
    }
    
    .form-section {
      .form-item {
        margin-bottom: 20px;
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
        }
        
        .picker-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e8ecf1;
          
          .placeholder {
            color: #999;
          }
        }
        
        .textarea-input {
          width: 100%;
          min-height: 80px;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e8ecf1;
          font-size: 14px;
          color: #333;
          resize: none;
          
          &::placeholder {
            color: #999;
          }
        }
      }
    }
  }
  
  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
    
    .cancel-btn {
      flex: 1;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      color: #666;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .confirm-btn {
      flex: 2;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
      color: #fff;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(224, 122, 79, 0.3);
      
      &:active {
        transform: scale(0.98);
      }
    }
  }
}
// 服务订单列表弹窗
.service-orders-modal {
  background: #fff;
  border-radius: 20px 20px 0 0;
  height: 65vh;
  display: flex;
  flex-direction: column;

  .drag-bar {
    width: 36px;
    height: 4px;
    background: #e0e0e0;
    border-radius: 2px;
    margin: 10px auto 0;
    flex-shrink: 0;
  }

  .som-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 20px 14px;
    border-bottom: 1px solid #f5f5f5;
    flex-shrink: 0;
    position: relative;

    .som-title-wrap,
    .som-title-center {
      display: flex;
      align-items: center;
      gap: 10px;

      .som-title {
        font-size: 16px;
        font-weight: 700;
        color: #222;
      }

      .som-count-badge {
        font-size: 11px;
        color: #E07A4F;
        background: #e8f5f5;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 500;
      }
    }

    .som-close {
      position: absolute;
      right: 20px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 50%;
    }
  }

  .som-scroll {
    flex: 1;
    height: 0;
  }

  .som-list {
    padding: 12px 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .som-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 14px;
    padding: 14px 16px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:active {
      background: #f8fffe;
      border-color: #FFF0E8;
    }

    .som-item-left {
      flex: 1;
      min-width: 0;

      .som-date-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;

        .som-date-icon {
          font-size: 14px;
          color: #E07A4F;
        }

        .som-date {
          font-size: 15px;
          font-weight: 700;
          color: #222;
        }

        .som-period {
          font-size: 12px;
          color: #fff;
          background: linear-gradient(135deg, #E07A4F, #C96A42);
          padding: 2px 8px;
          border-radius: 8px;
        }
      }

      .som-provider-row {
        display: flex;
        align-items: center;
        gap: 6px;

        .som-provider-label {
          font-size: 12px;
          color: #bbb;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .som-provider-value {
          font-size: 13px;
          color: #555;
          font-weight: 500;

          &.unassigned {
            color: #bbb;
          }
        }
      }
    }

    .som-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
      margin-left: 12px;

      .som-status {
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 10px;
        white-space: nowrap;

        &.order-pending    { background: #fff7e6; color: #E8A84C; }
        &.order-accepted   { background: #e6f7ff; color: #2979ff; }
        &.order-in-service { background: #e6fff9; color: #5AAB7A; }
        &.order-completed  { background: #f6ffed; color: #5AAB7A; }
        &.order-cancelled  { background: #f5f5f5; color: #999; }
        &.order-rejected   { background: #fff1f0; color: #ff5722; }
        &.order-closed     { background: #f5f5f5; color: #999; }
        &.order-dispatching{ background: #fff7e6; color: #fa8c16; }
        &.order-verifying  { background: #f6ffed; color: #5AAB7A; }
      }

      .som-arrow {
        font-size: 12px;
        color: #ccc;
      }
    }
  }
}

</style>