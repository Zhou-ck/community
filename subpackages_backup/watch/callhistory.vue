<template>
  <view class="call-history-container">
    <!-- 筛选栏 -->
    <view class="filter-section">
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tags">
          <view 
            v-for="(item, index) in callTypeOptions" 
            :key="index"
            class="filter-tag"
            :class="{ active: callTypeIndex === index }"
            @click="selectCallType(index)"
          >
            {{ item.label }}
          </view>
          
          <view class="filter-divider"></view>
          
          <view 
            v-for="(item, index) in callStatusOptions" 
            :key="item.label"
            class="filter-tag"
            :class="{ active: callStatusIndex === index }"
            @click="selectCallStatus(index)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-input-wrapper">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          class="search-input" 
          v-model="queryParams.callNumber" 
          placeholder="搜索通话号码" 
          placeholder-class="input-placeholder"
          @confirm="handleQuery"
          @input="onSearchInput"
        />
        <view v-if="queryParams.callNumber" class="clear-icon" @click="clearSearch">
          <uni-icons type="clear" size="16" color="#999"></uni-icons>
        </view>
        <view class="search-btn" @click="handleQuery">
          <text>搜索</text>
        </view>
      </view>
    </view>

    <!-- 通话记录列表 -->
    <view class="call-list">
      <view v-if="loading" class="loading-container">
        <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="callLogList.length === 0" class="empty-container">
        <uni-icons type="info" size="60" color="#ccc"></uni-icons>
        <text class="empty-text">暂无通话记录</text>
      </view>
      
      <view v-else class="call-items">
        <view v-for="(item, index) in callLogList" :key="item.logId" class="call-card">
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="header-left">
              <view class="call-avatar" :class="item.callType === '2' ? 'sos' : ''">
                <uni-icons :type="item.callType === '2' ? 'notification-filled' : 'phone-filled'" size="20" color="#fff"></uni-icons>
              </view>
              <view class="call-info">
                <text class="call-number">{{ item.callNumber }}</text>
                <view class="call-tags">
                  <view class="call-type-tag" :class="item.callType === '2' ? 'sos' : 'normal'">
                    {{ getCallTypeLabel(item.callType) }}
                  </view>
                </view>
              </view>
            </view>
            <view class="call-status-tag" :class="{ voicemail: item.callStatus == 1, connected: item.callStatus == 2, missed: item.callStatus == 3 }">
              {{ getCallStatusLabel(item.callStatus) }}
            </view>
          </view>
          
          <!-- 卡片内容 -->
          <view class="card-content">
            <view class="info-row">
              <uni-icons type="calendar" size="14" color="#999"></uni-icons>
              <text class="info-label">开始时间：</text>
              <text class="info-value">{{ formatTime(item.startTime) }}</text>
            </view>
            
            <view class="info-row">
              <uni-icons type="calendar" size="14" color="#999"></uni-icons>
              <text class="info-label">结束时间：</text>
              <text class="info-value">{{ formatTime(item.endTime) }}</text>
            </view>
            
            <view class="info-row highlight">
              <uni-icons type="clock" size="14" color="#3ec6c6"></uni-icons>
              <text class="info-label">通话时长：</text>
              <text class="info-value duration">{{ formatCallDuration(item.callDuration) }}</text>
            </view>
            
            <!-- SOS信息 -->
            <view v-if="item.callType === '2'" class="sos-section">
              <view v-if="item.sosAlarmTime" class="sos-row">
                <uni-icons type="notification-filled" size="14" color="#f56c6c"></uni-icons>
                <text class="sos-label">SOS时间：</text>
                <text class="sos-value">{{ formatTime(item.sosAlarmTime) }}</text>
              </view>
              
              <view v-if="item.sosLatitude && item.sosLongitude" class="sos-row">
                <uni-icons type="location-filled" size="14" color="#f56c6c"></uni-icons>
                <text class="sos-label">SOS位置：</text>
                <text class="sos-value">{{ item.sosLatitude }}, {{ item.sosLongitude }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { listIwownCallLog } from '@/api/iwownCallLog.js'

export default {
  data() {
    return {
      deviceImei: '',
      loading: false,
      callLogList: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceId: null,
        callType: null,
        callStatus: null,
        callNumber: null
      },
      callTypeOptions: [
        { label: '全部类型', value: null },
        { label: '普通通话', value: '1' },
        { label: 'SOS报警', value: '2' }
      ],
      callTypeIndex: 0,
      callStatusOptions: [
        { label: '全部状态', value: null },
        { label: '语音留言', value: 1 },
        { label: '接通', value: 2 },
        { label: '未接通', value: 3 }
      ],
      callStatusIndex: 0
    }
  },
  
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.queryParams.pageSize)
    },
    hasActiveFilter() {
      return this.callTypeIndex !== 0 || this.callStatusIndex !== 0 || this.queryParams.callNumber
    }
  },
  
  onLoad(options) {
    if (options.imei) {
      this.deviceImei = options.imei
      this.queryParams.deviceId = options.imei
      this.getCallLogList()
    }
  },
  
  methods: {
    /** 查询通话记录列表 */
    getCallLogList() {
      this.loading = true
      listIwownCallLog(this.queryParams).then(response => {
        this.callLogList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
        uni.showToast({
          title: '查询失败',
          icon: 'none'
        })
      })
    },
    
    /** 搜索 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getCallLogList()
    },
    
    /** 搜索输入防抖 */
    onSearchInput() {
      // 清除之前的定时器
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      // 设置新的定时器，500ms后自动搜索
      this.searchTimer = setTimeout(() => {
        this.handleQuery()
      }, 500)
    },
    
    /** 重置 */
    resetQuery() {
      this.callTypeIndex = 0
      this.callStatusIndex = 0
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        deviceId: this.deviceImei,
        callType: null,
        callStatus: null,
        callNumber: null
      }
      this.getCallLogList()
    },
    
    /** 通话类型选择 */
    selectCallType(index) {
      this.callTypeIndex = index
      this.queryParams.callType = this.callTypeOptions[index].value
      this.handleQuery()
    },
    
    /** 通话状态选择 */
    selectCallStatus(index) {
      this.callStatusIndex = index
      this.queryParams.callStatus = this.callStatusOptions[index].value
      this.handleQuery()
    },
    
    /** 清空搜索 */
    clearSearch() {
      this.queryParams.callNumber = ''
      this.handleQuery()
    },
    
    /** 上一页 */
    prevPage() {
      if (this.queryParams.pageNum > 1) {
        this.queryParams.pageNum--
        this.getCallLogList()
      }
    },
    
    /** 下一页 */
    nextPage() {
      if (this.queryParams.pageNum < this.totalPages) {
        this.queryParams.pageNum++
        this.getCallLogList()
      }
    },
    
    /** 获取通话类型标签 */
    getCallTypeLabel(type) {
      return type === '1' ? '普通通话' : type === '2' ? 'SOS报警' : '-'
    },
    
    /** 获取通话状态标签 */
    getCallStatusLabel(status) {
      const map = { 1: '语音留言', 2: '接通', 3: '未接通' }
      return map[status] || '-'
    },
    
    /** 获取状态样式类 */
    getStatusClass(status) {
      const map = { 1: 'voicemail', 2: 'connected', 3: 'missed' }
      return map[status] || ''
    },
    
    /** 格式化时间 */
    formatTime(time) {
      if (!time) return '-'
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      const second = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    },
    
    /** 格式化通话时长 */
    formatCallDuration(seconds) {
      if (!seconds || seconds === 0) return '0秒'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      let result = ''
      if (hours > 0) result += `${hours}时`
      if (minutes > 0) result += `${minutes}分`
      if (secs > 0 || result === '') result += `${secs}秒`
      
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.call-history-container {
  min-height: 100vh;
  background: #f5f6fa;
}

/* 筛选栏 */
.filter-section {
  background: #fff;
  padding: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tags {
  display: inline-flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 16rpx;
}

.filter-tag {
  display: inline-block;
  padding: 14rpx 28rpx;
  background: #f5f6fa;
  color: #666;
  border-radius: 32rpx;
  font-size: 26rpx;
  white-space: nowrap;
  font-weight: 500;
  
  &.active {
    background: #3ec6c6;
    color: #fff;
  }
}

.filter-divider {
  width: 2rpx;
  height: 32rpx;
  background: #e5e5e5;
  margin: 0 8rpx;
}

/* 搜索框 */
.search-section {
  background: #fff;
  padding: 16rpx 24rpx 20rpx;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f6fa;
  border-radius: 40rpx;
  padding: 18rpx 24rpx;
  gap: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 40rpx;
  line-height: 40rpx;
}

.input-placeholder {
  color: #bbb;
}

.clear-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rpx;
}

.search-btn {
  background: #3ec6c6;
  color: #fff;
  padding: 12rpx 28rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  font-weight: 500;
  margin-left: 12rpx;
  
  &:active {
    opacity: 0.8;
  }
}

/* 通话列表 */
.call-list {
  padding: 24rpx;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .loading-text,
  .empty-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.call-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 通话卡片 */
.call-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.call-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #3ec6c6;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.sos {
    background: #f56c6c;
  }
}

.call-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.call-number {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.call-tags {
  display: flex;
  gap: 8rpx;
}

.call-type-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
  font-weight: 500;
  
  &.normal {
    background: rgba(62, 198, 198, 0.1);
    color: #3ec6c6;
  }
  
  &.sos {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.call-status-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  
  &.voicemail {
    background: rgba(250, 200, 88, 0.1);
    color: #e6a23c;
  }
  
  &.connected {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }
  
  &.missed {
    background: rgba(144, 147, 153, 0.1);
    color: #909399;
  }
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  
  &.highlight {
    background: rgba(62, 198, 198, 0.06);
    padding: 12rpx 16rpx;
    border-radius: 12rpx;
    margin-top: 4rpx;
  }
}

.info-label {
  color: #999;
  flex-shrink: 0;
}

.info-value {
  color: #333;
  flex: 1;
  
  &.duration {
    color: #3ec6c6;
    font-weight: 600;
  }
}

/* SOS信息区域 */
.sos-section {
  background: rgba(245, 108, 108, 0.06);
  border-radius: 12rpx;
  padding: 16rpx;
  margin-top: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.sos-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
}

.sos-label {
  color: #f56c6c;
  flex-shrink: 0;
}

.sos-value {
  color: #666;
  flex: 1;
}
</style>
