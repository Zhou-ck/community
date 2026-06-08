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
            <view class="service-name-row">
              <text class="service-name">{{ orderInfo.serviceName }}</text>
              <!-- 套餐订单标识 -->
              <view class="order-source-badge package" v-if="orderInfo.orderSource === '2' || orderInfo.orderSource === 2">
                <uni-icons type="wallet" size="12" color="#fff"></uni-icons>
                <text>套餐订单</text>
              </view>
              <!-- 语音下单标识 -->
              <view class="order-source-badge voice" v-if="orderInfo.orderSource === '5' || orderInfo.orderSource === 5" @click.stop="playVoice(orderInfo)">
                <uni-icons type="sound" size="12" color="#fff"></uni-icons>
                <text>语音下单</text>
              </view>
            </view>
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
              <uni-icons type="phone-filled" size="16" color="#E07A4F" style="margin-left: 8rpx;"></uni-icons>
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

      <!-- 被服务人员信息卡片 -->
      <view class="info-card served-member-card" v-if="servedMemberInfo">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="person-filled" size="18" color="#E07A4F" class="header-icon"></uni-icons>
            <text>被服务人员</text>
          </view>
        </view>
        
        <!-- 人员头像和基本信息 -->
        <view class="member-profile">
          <view class="member-avatar">
            <view class="avatar-circle">
              <uni-icons type="person-filled" size="36" color="#E07A4F"></uni-icons>
            </view>
          </view>
          <view class="member-basic-info">
            <view class="member-name">{{ servedMemberInfo.memberName || '未填写姓名' }}</view>
            <view class="member-tags">
              <view class="tag age-tag" v-if="servedMemberInfo.age">
                <uni-icons type="calendar" size="12" color="#666"></uni-icons>
                <text>{{ servedMemberInfo.age }}岁</text>
              </view>
              <view class="tag relation-tag" v-if="servedMemberInfo.relationship">
                <uni-icons type="heart" size="12" color="#666"></uni-icons>
                <text>{{ servedMemberInfo.relationship }}</text>
              </view>
              <view class="tag gender-tag" v-if="servedMemberInfo.sex">
                <uni-icons type="person" size="12" color="#666"></uni-icons>
                <text>{{ formatGender(servedMemberInfo.sex) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 详细信息列表 -->
        <view class="member-details">
          <!-- 身高体重信息 -->
          <view class="detail-row" v-if="servedMemberInfo.height || servedMemberInfo.weight">
            <view class="detail-item" v-if="servedMemberInfo.height">
              <view class="detail-icon">
                <uni-icons type="arrowup" size="14" color="#E07A4F"></uni-icons>
              </view>
              <text class="detail-label">身高</text>
              <text class="detail-value">{{ servedMemberInfo.height }}cm</text>
            </view>
            <view class="detail-item" v-if="servedMemberInfo.weight">
              <view class="detail-icon">
                <uni-icons type="loop" size="14" color="#E07A4F"></uni-icons>
              </view>
              <text class="detail-label">体重</text>
              <text class="detail-value">{{ servedMemberInfo.weight }}kg</text>
            </view>
          </view>


          <!-- 联系方式 -->
          <view class="member-contact" v-if="servedMemberInfo.phone">
            <view class="contact-item" @click="makePhoneCall(servedMemberInfo.phone)">
              <view class="contact-icon">
                <uni-icons type="phone-filled" size="16" color="#E07A4F"></uni-icons>
              </view>
              <text class="contact-text">{{ servedMemberInfo.phone }}</text>
              <view class="contact-action">
                <uni-icons type="right" size="14" color="#999"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 备注信息 -->
          <view class="member-remark" v-if="servedMemberInfo.remark">
            <view class="remark-header">
              <uni-icons type="compose" size="14" color="#666"></uni-icons>
              <text class="remark-label">备注信息</text>
            </view>
            <text class="remark-content">{{ servedMemberInfo.remark }}</text>
          </view>
        </view>
      </view>

      <!-- 服务商信息卡片 -->
      <view class="info-card" v-if="orderInfo && orderInfo.providerName">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="shop" size="18" color="#333" class="header-icon"></uni-icons>
            <text>服务商信息</text>
          </view>
        </view>
        <view class="provider-content">
          <view class="provider-avatar">
            <image v-if="orderInfo.providerAvatar" :src="orderInfo.providerAvatar" class="avatar-image" mode="aspectFill"></image>
            <uni-icons v-else type="shop-filled" size="32" color="#999"></uni-icons>
          </view>
          <view class="provider-info">
            <text class="provider-name">{{ orderInfo.providerName }}</text>
            <view class="provider-contact" v-if="orderInfo.providerPhone" @click="makePhoneCall(orderInfo.providerPhone)">
              <uni-icons type="phone" size="14" color="#E07A4F"></uni-icons>
              <text class="provider-phone">{{ orderInfo.providerPhone }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务人员信息卡片 -->
      <view class="info-card" v-if="orderInfo && orderInfo.staffName">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="person" size="18" color="#333" class="header-icon"></uni-icons>
            <text>服务人员信息</text>
          </view>
          <!-- 核销方式标签（已完成订单显示） -->
          <view class="verification-badge" v-if="orderInfo.status === 'completed' && orderInfo.verificationMethod">
            <uni-icons :type="getVerificationMethodIcon(orderInfo.verificationMethod)" size="12" color="#fff"></uni-icons>
            <text>{{ getVerificationMethodText(orderInfo.verificationMethod) }}</text>
          </view>
        </view>
        <view class="provider-content">
          <view class="provider-avatar">
            <uni-icons type="person-filled" size="32" color="#E07A4F"></uni-icons>
          </view>
          <view class="provider-info">
            <text class="provider-name">{{ orderInfo.staffName }}</text>
            <view class="provider-contact" v-if="orderInfo.staffPhone" @click="makePhoneCall(orderInfo.staffPhone)">
              <uni-icons type="phone-filled" size="14" color="#E07A4F"></uni-icons>
              <text class="provider-phone">{{ orderInfo.staffPhone }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 费用信息卡片 -->
      <view class="info-card" v-if="orderInfo && orderInfo.price > 0">
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

      <!-- 改期记录卡片 -->
      <view class="info-card" v-if="modificationHistory.length > 0">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="loop" size="18" color="#333" class="header-icon"></uni-icons>
            <text>改期记录 ({{ modificationHistory.length }}次)</text>
          </view>
        </view>
        <view class="modification-list">
          <view class="modification-item" v-for="(item, index) in modificationHistory" :key="item.requestId || item.request_id">
            <view class="modification-header">
              <text class="modification-time">{{ item.requestTime || item.request_time }}</text>
              <view class="modification-tags">
                <text class="modification-badge" :class="{ rejected: isRejected(item) }">
                  第{{ modificationHistory.length - index }}次改期
                  <text v-if="isRejected(item)"> · 已拒绝</text>
                </text>
                <text class="modification-source" v-if="item.requestSource || item.request_source">{{ getSourceText(item.requestSource || item.request_source) }}</text>
              </view>
            </view>
            <view class="modification-content">
              <view class="modification-row">
                <text class="label">原预约时间：</text>
                <text class="value old">{{ item.oldAppointmentDate || item.old_appointment_date }} {{ item.oldAppointmentPeriod || item.old_appointment_period }}</text>
              </view>
              <view class="modification-arrow" :class="{ rejected: isRejected(item) }">
                <uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
              </view>
              <view class="modification-row" v-if="(item.newAppointmentDate || item.new_appointment_date) || (item.newAppointmentPeriod || item.new_appointment_period)">
                <text class="label">新预约时间：</text>
                <text class="value new" :class="{ rejected: isRejected(item) }">{{ item.newAppointmentDate || item.new_appointment_date }} {{ item.newAppointmentPeriod || item.new_appointment_period }}</text>
              </view>
              <view class="modification-reason" v-if="item.requestReason || item.request_reason">
                <text class="reason-label">改期原因：</text>
                <text class="reason-text">{{ item.requestReason || item.request_reason }}</text>
              </view>
              <view class="modification-reason rejection" v-if="isRejected(item) && getRejectReason(item)">
                <text class="reason-label">拒绝原因：</text>
                <text class="reason-text">{{ getRejectReason(item) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务照片卡片 -->
      <view class="info-card" v-if="extraOrderInfo && (extraOrderInfo.photoUrlsBefore && extraOrderInfo.photoUrlsBefore.length > 0 || extraOrderInfo.photoUrls && extraOrderInfo.photoUrls.length > 0)">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="image" size="18" color="#333" class="header-icon"></uni-icons>
            <text>服务照片</text>
          </view>
          <text class="order-no" v-if="extraOrderInfo.remark">{{ extraOrderInfo.remark }}</text>
        </view>
        <!-- 服务前 -->
        <view class="photo-group" v-if="extraOrderInfo.photoUrlsBefore && extraOrderInfo.photoUrlsBefore.length > 0">
          <view class="photo-group-label before">服务前</view>
          <view class="photo-grid">
            <image
              v-for="(url, i) in extraOrderInfo.photoUrlsBefore"
              :key="i"
              :src="fullUrl(url)"
              class="photo-item"
              mode="aspectFill"
              @click="previewPhotos(extraOrderInfo.photoUrlsBefore, i)"
            ></image>
          </view>
        </view>
        <!-- 服务后 -->
        <view class="photo-group" v-if="extraOrderInfo.photoUrls && extraOrderInfo.photoUrls.length > 0">
          <view class="photo-group-label after">服务后</view>
          <view class="photo-grid">
            <image
              v-for="(url, i) in extraOrderInfo.photoUrls"
              :key="i"
              :src="fullUrl(url)"
              class="photo-item"
              mode="aspectFill"
              @click="previewPhotos(extraOrderInfo.photoUrls, i)"
            ></image>
          </view>
        </view>
      </view>

      <!-- 评价记录卡片 -->
      <view class="info-card" v-if="evaluationList.length > 0">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="star" size="18" color="#333" class="header-icon"></uni-icons>
            <text>最新评价</text>
          </view>
          <view class="view-all-btn" @click="viewAllEvaluations" v-if="evaluationList.length > 1">
            <text class="view-all-text">查看全部{{ evaluationList.length }}条</text>
            <uni-icons type="right" size="14" color="#E07A4F"></uni-icons>
          </view>
        </view>
        <view class="evaluation-list">
          <!-- 只显示最新1条评价 -->
          <view class="evaluation-item" v-if="evaluationList[0]">
            <view class="evaluation-header">
              <view class="evaluation-rating">
                <uni-icons
                  v-for="star in [1,2,3,4,5]"
                  :key="star"
                  :type="star <= evaluationList[0].rating ? 'star-filled' : 'star'"
                  size="18"
                  :color="star <= evaluationList[0].rating ? '#FFB400' : '#E0E0E0'"
                ></uni-icons>
                <text class="rating-text">{{ evaluationList[0].rating }}分</text>
              </view>
              <text class="evaluation-time">{{ evaluationList[0].createTime }}</text>
            </view>
            <view class="evaluation-content" v-if="evaluationList[0].evaluationContent">
              <text class="evaluation-text">{{ evaluationList[0].evaluationContent }}</text>
            </view>
            <view class="evaluation-images" v-if="evaluationList[0].evaluationImages">
              <image
                v-for="(img, imgIndex) in parseImages(evaluationList[0].evaluationImages)"
                :key="imgIndex"
                :src="config.baseUrl + img"
                class="evaluation-image"
                mode="aspectFill"
                @click="previewEvaluationImage(evaluationList[0].evaluationImages, imgIndex)"
              ></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单时间线卡片 -->
      <view class="info-card" v-if="orderTimeline.length > 0">
        <view class="card-header">
          <view class="header-title">
            <uni-icons type="clock" size="18" color="#333" class="header-icon"></uni-icons>
            <text>订单时间线</text>
          </view>
        </view>
        <view class="timeline-list">
          <view class="timeline-item" v-for="(item, index) in orderTimeline" :key="index" :class="{ 'is-first': index === 0 }">
            <view class="timeline-dot-wrapper">
              <view class="timeline-dot" :class="{ 'active': index === 0 }">
                <uni-icons :type="item.icon" size="14" :color="index === 0 ? '#fff' : '#E07A4F'"></uni-icons>
              </view>
              <view class="timeline-line" v-if="index < orderTimeline.length - 1"></view>
            </view>
            <view class="timeline-content">
              <text class="timeline-title">{{ item.title }}</text>
              <text class="timeline-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions-wrapper" v-if="orderInfo">
      <view class="bottom-actions">
        <!-- 服务中状态 -->
        <template v-if="orderInfo.status === 'serving'">
          <button class="action-btn primary" @click="openRescheduleModal">申请改期</button>
          <button class="action-btn primary" @click="showVerificationCode(orderInfo)">查看核销码</button>
        </template>

        <!-- 待核销状态 -->
        <template v-if="orderInfo.status === 'verifying'">
          <button class="action-btn primary" @click="openRescheduleModal">申请改期</button>
          <button class="action-btn primary" @click="showVerificationCode(orderInfo)">查看核销码</button>
        </template>

        <!-- 待接单状态 -->
        <template v-if="orderInfo.status === 'pending'">
          <button class="action-btn cancel" @click="cancelOrder">取消预约</button>
          <button class="action-btn primary" @click="editOrder">修改预约</button>
        </template>

        <!-- 已完成状态 - 根据是否已评价显示不同按钮 -->
        <template v-if="orderInfo.status === 'completed'">
          <button class="action-btn secondary" @click="goBack">返回列表</button>
          <button class="action-btn primary review" @click="goToReview">
            {{ orderInfo.evaluationFlag === '1' ? '再次评价' : '立即评价' }}
          </button>
        </template>

        <!-- 已取消/已拒绝/已关闭状态 -->
        <template v-if="orderInfo.status === 'cancelled' || orderInfo.status === 'rejected' || orderInfo.status === 'closed'">
          <button class="action-btn secondary full" @click="goBack">返回列表</button>
        </template>
        
        <!-- 待派单状态 -->
        <template v-if="orderInfo.status === 'dispatching'">
          <button class="action-btn secondary full" @click="goBack">返回列表</button>
        </template>
        
        <!-- 其他状态显示返回按钮 -->
        <template v-if="orderInfo.status === 'accepted'">
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

    <!-- 核销码弹窗组件 -->
    <VerificationModal
      :visible="showVerificationModal"
      :code="verificationCode"
      :loading="verificationCodeLoading"
      :qrcodeUrl="qrcodeImageUrl"
      @close="closeVerificationModal"
      @manual-confirm="handleManualConfirm"
      @qrcode-load="handleQrcodeLoad"
      @qrcode-error="handleQrcodeError"
    />

    <!-- 评价弹窗组件 -->
    <ReviewModal
      :visible="showReviewModal"
      :mode="reviewMode"
      :isAppend="isAppendReview"
      :orderInfo="reviewData.orderInfo"
      :rating.sync="reviewData.rating"
      :content.sync="reviewData.content"
      :images.sync="reviewData.images"
      :selectedTags="reviewData.selectedTags"
      :createTime="reviewData.createTime"
      :submitting="submittingReview"
      @close="closeReviewModal"
      @toggle-tag="handleToggleTag"
      @submit="submitReview"
    />

    <!-- 改期弹窗组件 -->
    <RescheduleModal
      :visible="showRescheduleModal"
      :orderInfo="orderInfo"
      @close="showRescheduleModal = false"
      @success="onRescheduleSuccess"
    />
  </view>
</template>

<script>
import { getServiceorder, cancelServiceorder, delServiceorder, getModificationHistory, completeServiceorder, evaluationServiceorder, getEvaluationListByOrderId, checkPendingModification } from '@/api/service'
import { getFamilymember } from '@/api/familymember'
import { ORDER_STATUS_MAP, ORDER_STATUS_CODE_MAP, ORDER_BG_CLASS_MAP, getServiceIcon } from '@/utils/service-helper'
import { getExtraOrderInfo } from '@/api/verification'
import verificationMixin from '@/mixins/verification-mixin.js'
import VerificationModal from '@/components/verification-modal/verification-modal.vue'
import ReviewModal from '@/components/review-modal/review-modal.vue'
import RescheduleModal from '@/components/reschedule-modal/reschedule-modal.vue'

import config from '@/config.js'

export default {
  mixins: [verificationMixin],
  components: {
    VerificationModal,
    ReviewModal,
    RescheduleModal
  },
  data() {
    return {
      config: config, // 配置对象
      statusBarHeight: 0,
      orderId: null,
      orderInfo: null,
      isLoading: false,
      modificationHistory: [],
      statusMap: ORDER_STATUS_MAP,
      
      // 改期相关
      showRescheduleModal: false,

      // 评价相关
      showReviewModal: false,
      reviewMode: 'edit',
      submittingReview: false,
      evaluationList: [], // 评价列表
      isAppendReview: false, // 是否为追评模式
      reviewData: {
        orderId: null,
        orderInfo: null,
        rating: 0,
        content: '',
        images: [],
        selectedTags: [],
        createTime: ''
      },
      
      // 音频播放相关
      innerAudioContext: null, // 音频上下文
      currentPlayingOrderId: null, // 当前正在播放的订单ID

      // 被服务人员信息
      servedMemberInfo: null,
      // 服务照片
      extraOrderInfo: null
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
  
  onUnload() {
    // 清理音频资源
    if (this.innerAudioContext) {
      this.innerAudioContext.stop()
      this.innerAudioContext.destroy()
      this.innerAudioContext = null
    }
  },
  computed: {
    // 订单时间线
    orderTimeline() {
      if (!this.orderInfo) return []
      
      const timeline = []
      
      // 订单创建
      if (this.orderInfo.createTime) {
        timeline.push({
          title: '订单创建',
          time: this.orderInfo.createTime,
          icon: 'compose'
        })
      }
      
      // 商家接单
      if (this.orderInfo.acceptTime) {
        timeline.push({
          title: '商家接单',
          time: this.orderInfo.acceptTime,
          icon: 'checkmarkempty'
        })
      }
      
      // 分配服务商
      if (this.orderInfo.assignTime) {
        timeline.push({
          title: '分配服务商',
          time: this.orderInfo.assignTime,
          icon: 'shop'
        })
      }
      
      // 派单给服务人员
      if (this.orderInfo.dispatchTime) {
        timeline.push({
          title: '派单给服务人员',
          time: this.orderInfo.dispatchTime,
          icon: 'person'
        })
      }
      
      // 服务核销
      if (this.orderInfo.verificationTime) {
        timeline.push({
          title: '服务核销',
          time: this.orderInfo.verificationTime,
          icon: 'scan'
        })
      }
      
      // 确认完成
      if (this.orderInfo.confirmTime) {
        timeline.push({
          title: '确认完成',
          time: this.orderInfo.confirmTime,
          icon: 'checkbox-filled'
        })
      }
      
      // 反转数组，最新的在上面
      return timeline.reverse()
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

    getStatusClass(status) {
      return ORDER_BG_CLASS_MAP[status] || 'bg-default'
    },

    // 获取改期申请来源文本
    getSourceText(source) {
      const map = { 1: '社区', 2: '商家', 3: '居民', '1': '社区', '2': '商家', '3': '居民' }
      return map[source] || ''
    },

    // 判断改期是否已被拒绝
    isRejected(item) {
      return item.requestStatus === 2 || item.requestStatus === '2'
    },

    // 获取拒绝原因
    getRejectReason(item) {
      return item.reviewRemark || ''
    },

    // 格式化性别显示
    formatGender(sex) {
      const genderMap = {
        '1': '女',
        '0': '男',
        'female': '女',
        'male': '男',
        '女': '女',
        '男': '男'
      }
      return genderMap[sex] || sex
    },


    // 加载订单详情
    async loadOrderDetail() {
      if (!this.orderId) return

      try {
        this.isLoading = true
        const response = await getServiceorder(this.orderId)

        if (response.code === 200 && response.data) {
          this.orderInfo = this.formatOrderData(response.data)
          // 加载改期记录
          this.loadModificationHistory()
          // 加载评价列表
          this.loadEvaluationList()
          // 加载被服务人员信息
          this.loadServedMemberInfo()
          // 加载服务照片
          this.loadExtraOrderInfo()
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

    // 加载改期记录
    async loadModificationHistory() {
      try {
        const response = await getModificationHistory(this.orderId)
        if (response.code === 200 && response.data) {
          this.modificationHistory = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('加载改期记录失败:', error)
      }
    },

    // 加载评价列表
    async loadEvaluationList() {
      if (!this.orderId) return
      try {
        const response = await getEvaluationListByOrderId(this.orderId)
        if (response.code === 200 && response.data) {
          this.evaluationList = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('加载评价列表失败:', error)
      }
    },

    // 加载被服务人员信息
    async loadServedMemberInfo() {
      if (!this.orderInfo || !this.orderInfo.servedMemberId) {
        this.servedMemberInfo = null
        return
      }
      
      try {
        const response = await getFamilymember(this.orderInfo.servedMemberId)
        if (response.code === 200 && response.data) {
          this.servedMemberInfo = response.data
          console.log('被服务人员信息:', this.servedMemberInfo)
          console.log('手机号字段值:', this.servedMemberInfo.phone)
          console.log('手机号字段类型:', typeof this.servedMemberInfo.phone)
        } else {
          console.warn('获取被服务人员信息失败:', response.msg)
          this.servedMemberInfo = null
        }
      } catch (error) {
        console.error('加载被服务人员信息失败:', error)
        this.servedMemberInfo = null
      }
    },

    // 加载服务照片
    async loadExtraOrderInfo() {
      if (!this.orderId) return
      try {
        const res = await getExtraOrderInfo(this.orderId)
        if (res.code === 200 && res.data) {
          this.extraOrderInfo = res.data
        }
      } catch (e) {
        console.error('加载服务照片失败:', e)
      }
    },

    // 拼接完整图片URL，兼容后端返回绝对路径或相对路径
    fullUrl(url) {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return this.config.baseUrl + (url.startsWith('/') ? url : '/' + url)
    },

    // 预览服务照片
    previewPhotos(urls, index) {
      const fullUrls = urls.map(u => this.fullUrl(u))
      uni.previewImage({ current: fullUrls[index], urls: fullUrls })
    },

    formatOrderData(order) {
      const status = ORDER_STATUS_CODE_MAP[order.orderStatus] || 'pending'
      const statusInfo = this.statusMap[status] || this.statusMap.pending

      return {
        id: order.orderId,
        createTime: order.createTime || '',
        status: status,
        statusText: statusInfo.text,
        statusClass: statusInfo.class,
        evaluationFlag: order.evaluationFlag || '0',  // 评价标识：0-未评价，1-已评价
        isReviewed: order.evaluationFlag === '1',  // 根据evaluationFlag判断是否已评价

        serviceName: order.serviceName || '服务项目',
        serviceId: order.serviceId,
        serviceDesc: order.serviceDesc || '',
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
        evaluationContent: order.evaluationContent || '',
        evaluationImages: order.evaluationImages || '',  // 评价图片
        evaluationTime: order.evaluationTime || '',  // 评价时间
        verificationMethod: order.verificationMethod || '', // 核销方式
        orderSource: order.orderSource || '0', // 订单来源
        filename: order.filename || '', // 语音文件路径

        // 时间信息
        acceptTime: order.acceptTime || '', // 接单时间
        assignTime: order.assignTime || '', // 分配时间
        dispatchTime: order.dispatchTime || '', // 派单时间
        verificationTime: order.verificationTime || '', // 核销时间
        confirmTime: order.confirmTime || '', // 确认时间

        // 服务商信息
        providerName: order.providerName || order.servicerName || '',
        providerPhone: order.providerContactPhone || order.providerPhone || order.servicerPhone || '',
        providerAvatar: order.providerAvatar || order.servicerAvatar || '',

        // 服务人员信息
        staffName: order.staffName || '',
        staffPhone: order.staffPhone || '',

        // 用户信息
        userId: order.userId || '',
        deptId: order.deptId || '',
        
        // 被服务人员ID
        servedMemberId: order.servedMemberId || ''
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

    getServiceIcon,
    
    // 获取核销方式文本
    getVerificationMethodText(method) {
      const methodMap = {
        'SCAN': '扫码核销',
        'MANUAL': '手动核销',
        'RESIDENT': '居民确认'
      }
      return methodMap[method] || method
    },
    
    // 获取核销方式图标
    getVerificationMethodIcon(method) {
      const iconMap = {
        'SCAN': 'scan',
        'MANUAL': 'hand-up',
        'RESIDENT': 'person-filled'
      }
      return iconMap[method] || 'checkmark-circle'
    },

    // 修改预约
    editOrder() {
      uni.navigateTo({
        url: `/pages/server/booking/index?orderId=${this.orderId}&mode=edit`
      })
    },

    // 打开改期弹窗
    async openRescheduleModal() {
      const orderId = this.orderInfo ? this.orderInfo.id : null
      if (!orderId) {
        uni.showToast({ title: '订单信息异常', icon: 'none' })
        return
      }

      try {
        const res = await checkPendingModification(orderId)
        if (res.code === 200 && res.data === true) {
          uni.showModal({
            title: '提示',
            content: '该订单已有待审核的改期申请，请等待商家处理',
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        this.showRescheduleModal = true
      } catch (e) {
        console.error('检查改期申请失败:', e)
        // 检查失败不阻塞，直接打开弹窗
        this.showRescheduleModal = true
      }
    },

    // 改期提交成功
    onRescheduleSuccess() {
      this.showRescheduleModal = false
      // 刷新订单详情和改期记录
      this.loadOrderDetail()
    },

    // 取消订单
    async cancelOrder() {
      uni.showModal({
        title: '取消预约',
        content: '确定要取消该预约吗？',
        confirmColor: '#D95C5C',
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
        confirmColor: '#D95C5C',
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
        confirmColor: '#E07A4F',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              const response = await completeServiceorder({
                orderId: this.orderInfo.id,
                userId: this.orderInfo.userId,
                deptId: this.orderInfo.deptId
              })
              uni.hideLoading()

              if (response.code === 200) {
                uni.showToast({
                  title: '已确认完成',
                  icon: 'success'
                })
                uni.$emit('orderUpdated', { orderId: this.orderId })
                setTimeout(() => {
                  this.loadOrderDetail()
                }, 1500)
              } else {
                uni.showToast({
                  title: response.msg || '操作失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.hideLoading()
              console.error('确认完成失败:', error)
              uni.showToast({
                title: '操作失败，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 去评价
    goToReview() {
      // 判断是首评还是追评
      this.isAppendReview = this.orderInfo && this.orderInfo.evaluationFlag === '1'
      this.reviewMode = 'edit'
      this.reviewData = {
        orderId: this.orderId,
        orderInfo: this.orderInfo ? {
          serviceName: this.orderInfo.serviceName,
          providerName: this.orderInfo.providerName,
          icon: getServiceIcon(this.orderInfo.icon)
        } : null,
        rating: 0,
        content: '',
        images: [],
        selectedTags: [],
        createTime: ''
      }
      this.showReviewModal = true
    },

    // 切换标签选择
    handleToggleTag(tag) {
      const index = this.reviewData.selectedTags.indexOf(tag)
      if (index > -1) {
        this.reviewData.selectedTags.splice(index, 1)
      } else {
        this.reviewData.selectedTags.push(tag)
      }
    },

    // 处理图片更新
    handleImagesUpdate(newImages) {
      console.log('父组件接收到图片更新:', newImages)
      console.log('更新前的图片:', this.reviewData.images)
      this.reviewData.images = newImages
      console.log('更新后的图片:', this.reviewData.images)
      this.$forceUpdate()
    },

    // 关闭评价弹窗
    closeReviewModal() {
      this.showReviewModal = false
      this.reviewMode = 'edit'
      this.reviewData = {
        orderId: null,
        orderInfo: null,
        rating: 0,
        content: '',
        images: [],
        selectedTags: [],
        createTime: ''
      }
    },

    // 提交评价
    async submitReview() {
      // 组合评价内容：标签 + 自定义内容
      let finalContent = ''
      if (this.reviewData.selectedTags.length > 0) {
        finalContent = this.reviewData.selectedTags.join('、')
      }
      if (this.reviewData.content.trim()) {
        if (finalContent) {
          finalContent += '；' + this.reviewData.content.trim()
        } else {
          finalContent = this.reviewData.content.trim()
        }
      }

      try {
        this.submittingReview = true

        // 上传图片
        let uploadedImages = []
        if (this.reviewData.images && this.reviewData.images.length > 0) {
          uni.showLoading({ title: '上传图片中...' })
          
          for (let i = 0; i < this.reviewData.images.length; i++) {
            try {
              const uploadResult = await this.$upload({
                url: '/common/upload',
                filePath: this.reviewData.images[i],
                name: 'file'
              })
              
              if (uploadResult.code === 200 && uploadResult.fileName) {
                uploadedImages.push(uploadResult.fileName)
              }
            } catch (uploadError) {
              console.error('图片上传失败:', uploadError)
            }
          }
          
          uni.hideLoading()
        }

        // 调用评价接口
        const evaluationData = {
          orderId: this.reviewData.orderId,
          rating: this.reviewData.rating,
          evaluationContent: finalContent
        }
        
        // 如果有上传成功的图片，序列化为JSON字符串传递
        if (uploadedImages.length > 0) {
          evaluationData.evaluationImages = JSON.stringify(uploadedImages)
        }
        
        const response = await evaluationServiceorder(evaluationData)

        if (response.code === 200) {
          uni.showToast({
            title: '评价成功',
            icon: 'success'
          })

          // 关闭弹窗
          this.closeReviewModal()

          // 刷新订单详情
          this.loadOrderDetail()
          
          // 触发订单更新事件
          uni.$emit('orderUpdated', { orderId: this.orderId })
        } else {
          uni.showToast({
            title: response.msg || '评价失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交评价失败:', error)
        uni.showToast({
          title: '评价失败，请重试',
          icon: 'none'
        })
      } finally {
        this.submittingReview = false
      }
    },

    // 核销成功回调
    onVerificationSuccess() {
      // 刷新订单详情
      this.loadOrderDetail()
      // 触发订单更新事件
      uni.$emit('orderUpdated', { orderId: this.orderId })
    },

    // 解析评价图片JSON
    parseImages(imagesJson) {
      if (!imagesJson) return []
      try {
        return JSON.parse(imagesJson)
      } catch (e) {
        return []
      }
    },

    // 预览评价图片
    previewEvaluationImage(imagesJson, index) {
      const images = this.parseImages(imagesJson)
      if (images.length === 0) return
      uni.previewImage({
        current: this.config.baseUrl + images[index],
        urls: images.map(img => this.config.baseUrl + img)
      })
    },

    // 查看全部评价
    viewAllEvaluations() {
      uni.navigateTo({
        url: `/pages/evaluation/list?orderId=${this.orderId}`
      })
    },

    // 播放语音
    playVoice(order) {
      if (!order.filename) {
        uni.showToast({
          title: '暂无语音文件',
          icon: 'none'
        })
        return
      }
      
      // 构建完整的音频URL
      // 正确的路径格式：/api/audio/demand/
      let url = this.config.baseUrl + '/api/audio/demand/' + order.filename
      
      console.log('播放语音URL:', url)
      
      // 如果已经在播放同一个订单的语音，则停止播放
      if (this.currentPlayingOrderId === order.id && this.innerAudioContext) {
        this.innerAudioContext.stop()
        this.currentPlayingOrderId = null
        uni.showToast({
          title: '已停止播放',
          icon: 'none'
        })
        return
      }
      
      // 停止之前的播放
      if (this.innerAudioContext) {
        this.innerAudioContext.stop()
        this.innerAudioContext.destroy()
      }
      
      // 直接尝试播放，不再检查文件
      this.startPlayAudio(url, order.id)
    },
    
    // 开始播放音频
    startPlayAudio(audioUrl, orderId) {
      try {
        // 确保音频实例存在
        if (!this.innerAudioContext) {
          this.innerAudioContext = uni.createInnerAudioContext()
          
          // 播放结束
          this.innerAudioContext.onEnded(() => {
            console.log('语音播放完成')
            this.currentPlayingOrderId = null
          })
          
          // 播放错误
          this.innerAudioContext.onError((res) => {
            console.error('语音播放失败 - 原始错误对象:', res)
            console.error('音频URL:', audioUrl)
            
            let errorMsg = '语音播放失败'
            
            // 安全地访问 res 对象
            if (res && typeof res === 'object') {
              console.error('错误代码:', res.errCode)
              console.error('错误信息:', res.errMsg)
              
              if (res.errCode === 10001) {
                errorMsg = '音频格式不支持'
              } else if (res.errCode === 10002) {
                errorMsg = '网络错误'
              } else if (res.errCode === 10003) {
                errorMsg = '文件错误'
              } else if (res.errCode === 10004) {
                errorMsg = '音频格式错误'
              } else if (res.errMsg) {
                errorMsg = res.errMsg
              }
            }
            
            uni.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 2000
            })
            this.currentPlayingOrderId = null
          })
        }
        
        // 停止当前播放
        this.innerAudioContext.stop()
        
        // 设置新的音频源
        this.innerAudioContext.src = audioUrl
        
        // 记录当前播放的订单ID
        this.currentPlayingOrderId = orderId
        
        // 开始播放
        this.innerAudioContext.play()
        
        console.log('开始播放语音')
        uni.showToast({
          title: '正在播放语音',
          icon: 'none',
          duration: 1000
        })
      } catch (e) {
        console.error('播放音频异常:', e)
        uni.showToast({ 
          title: '播放失败: ' + e.message, 
          icon: 'none' 
        })
        this.currentPlayingOrderId = null
      }
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
    background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
    box-shadow: 0 8rpx 24rpx rgba(224, 122, 79, 0.3);
  }
  &.bg-serving {
    background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
    box-shadow: 0 8rpx 24rpx rgba(224, 122, 79, 0.3);
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

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  background: rgba(224, 122, 79, 0.1);
  border-radius: 20rpx;
  @include press-card();

  .view-all-text {
    font-size: 24rpx;
    color: #E07A4F;
  }
}

.order-no {
  font-size: 24rpx;
  color: #999;
}

/* 核销方式标签 */
.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: linear-gradient(135deg, #5AAB7A 0%, #5AAB7A 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(90, 171, 122, 0.25);
  
  text {
    line-height: 1;
  }
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

.service-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

/* 订单来源标识 */
.order-source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  font-size: 20rpx;
  padding: 6rpx 14rpx;
  border-radius: 100rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  
  text {
    line-height: 1;
  }
  
  &.package {
    background: linear-gradient(135deg, #fa8c16 0%, #f57c00 100%);
    color: #fff;
  }
  
  &.voice {
    background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
    color: #fff;
    @include press();
  }
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
  color: #E07A4F;
  background: rgba(224, 122, 79, 0.1);
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
    color: #E07A4F;
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
    color: #5AAB7A;
  }

  &.actual {
    font-size: 28rpx;
    color: #D95C5C;
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

/* 评价列表 */
.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.evaluation-item {
  padding: 24rpx;
  background: #f9fafc;
  border-radius: 12rpx;
  border-left: 4rpx solid #E07A4F;
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
  gap: 20rpx;
  align-items: center;
  justify-content: space-between;
}

.action-btn {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  border-radius: 44rpx;
  font-weight: 600;
  text-align: center;
  margin: 0;
  flex: 1;
  min-width: 0;
  transition: all 0.2s ease;
  
  &.full {
    flex: 1;
  }

  &.primary {
    background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
    color: #fff;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(224, 122, 79, 0.35);
    
    &:active {
      opacity: 0.9;
      transform: translateY(1rpx);
      box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.25);
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
  
  &.cancel {
    background: #fff;
    color: #999;
    border: 2rpx solid #e0e0e0;
    
    &:active {
      background: #f5f5f5;
    }
  }
  
  &.review {
    background:#E07A4F;
    box-shadow: 0 8rpx 24rpx rgba(255, 154, 158, 0.3);
  }

  &.delete {
    background: #fff;
    color: #D95C5C;
    border: 2rpx solid #D95C5C;
    
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

/* 服务商信息 */
.provider-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.provider-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.provider-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.provider-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.provider-contact {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.provider-phone {
  font-size: 26rpx;
  color: #E07A4F;
  font-weight: 500;
}

/* 改期记录 */
.modification-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.modification-item {
  background: #f9fafc;
  border-radius: 16rpx;
  padding: 24rpx;
  border-left: 4rpx solid #E07A4F;
}

.modification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.modification-time {
  font-size: 24rpx;
  color: #999;
}

.modification-badge {
  font-size: 22rpx;
  color: #E07A4F;
  background: rgba(224, 122, 79, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;

  &.rejected {
    color: #fa8c16;
    background: rgba(250, 140, 22, 0.1);
  }
}

.modification-tags {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.modification-source {
  font-size: 22rpx;
  color: #999;
  background: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.modification-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.modification-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  .label {
    font-size: 26rpx;
    color: #666;
  }
  
  .value {
    font-size: 26rpx;
    font-weight: 500;
    
    &.old {
      color: #999;
      text-decoration: line-through;
    }
    
    &.new {
      color: #E07A4F;

      &.rejected {
        color: #bbb;
        text-decoration: line-through;
      }
    }
  }
}

.modification-arrow {
  display: flex;
  justify-content: center;
  padding: 4rpx 0;

  &.rejected {
    opacity: 0.4;
  }
}

.modification-reason {
  margin-top: 12rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  
  .reason-label {
    font-size: 24rpx;
    color: #999;
  }
  
  .reason-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.5;
  }

  &.rejection {
    .reason-label {
      color: #fa8c16;
    }

    .reason-text {
      color: #fa8c16;
    }
  }
}

/* 订单时间线 */
.timeline-list {
  display: flex;
  flex-direction: column;
  padding: 8rpx 0;
}

.timeline-item {
  display: flex;
  gap: 20rpx;
  position: relative;
  
  &:last-child {
    .timeline-line {
      display: none;
    }
  }
}

.timeline-dot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.timeline-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #fff;
  border: 3rpx solid #E07A4F;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 2;
  transition: all 0.3s;
  
  &.active {
    background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
    border-color: #E07A4F;
    box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.3);
    transform: scale(1.1);
  }
}

.timeline-line {
  width: 2rpx;
  flex: 1;
  background: linear-gradient(to bottom, #E07A4F, #e5e5e5);
  margin-top: 8rpx;
  min-height: 40rpx;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 8rpx 0 32rpx 0;
}

.timeline-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.timeline-time {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.timeline-item.is-first {
  .timeline-title {
    color: #E07A4F;
  }
  
  .timeline-time {
    color: #E07A4F;
    font-weight: 500;
  }
}

/* 被服务人员卡片样式 */
.served-member-card {
  .member-profile {
    display: flex;
    gap: 24rpx;
    align-items: flex-start;
    margin-bottom: 24rpx;
  }

  .member-avatar {
    flex-shrink: 0;
  }

  .avatar-circle {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(224, 122, 79, 0.1) 0%, rgba(224, 122, 79, 0.05) 100%);
    border: 3rpx solid rgba(224, 122, 79, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(224, 122, 79, 0.15);
  }

  .member-basic-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .member-name {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
  }

  .member-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: rgba(224, 122, 79, 0.08);
    border-radius: 20rpx;
    font-size: 24rpx;
    color: #666;
    border: 1rpx solid rgba(224, 122, 79, 0.15);

    &.age-tag {
      background: rgba(255, 152, 0, 0.08);
      border-color: rgba(255, 152, 0, 0.15);
      color: #E8A84C;
    }

    &.relation-tag {
      background: rgba(233, 30, 99, 0.08);
      border-color: rgba(233, 30, 99, 0.15);
      color: #e91e63;
    }

    &.gender-tag {
      background: rgba(103, 58, 183, 0.08);
      border-color: rgba(103, 58, 183, 0.15);
      color: #673ab7;
    }
  }
}

/* 被服务人员详细信息 */
.member-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-row {
  display: flex;
  gap: 24rpx;
}

.detail-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx;
  background: #f8fafb;
  border-radius: 16rpx;
  border: 1rpx solid #e8f4f8;

}

.detail-icon {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: rgba(224, 122, 79, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-left: auto;
}


/* 被服务人员联系信息 */
.member-contact {
  margin-top: 8rpx;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 0;
  cursor: pointer;
  @include press-card();
}

.contact-item {
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  background: rgba(224, 122, 79, 0.1);
  border-radius: 50%;
}

.contact-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.contact-action {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 被服务人员备注信息 */
.member-remark {
  margin-top: 8rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3d3 100%);
  border-radius: 16rpx;
  border: 1rpx solid #ffeaa7;
}

.remark-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.remark-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #d68910;
}

.remark-content {
  font-size: 28rpx;
  color: #8d6e63;
  line-height: 1.6;
  word-break: break-all;
}

/* 服务照片 */
.photo-group {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.photo-group-label {
  display: inline-flex;
  align-items: center;
  font-size: 24rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;

  &.before {
    background: rgba(250, 140, 22, 0.1);
    color: #fa8c16;
  }

  &.after {
    background: rgba(224, 122, 79, 0.1);
    color: #E07A4F;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.photo-item {
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}
</style>
