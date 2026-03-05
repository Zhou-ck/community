<template>
  <view class="community-detail-container">
    <!-- 社区信息卡片 -->
    <view class="community-info-card">
      <view class="community-header">
        <view class="community-avatar">
          <image v-if="communityInfo.avatar" :src="communityInfo.avatar" class="avatar-img" mode="aspectFill"></image>
          <view v-else class="default-avatar">
            <uni-icons type="home-filled" size="48" color="#4CAF50"></uni-icons>
          </view>
        </view>
        <view class="community-basic">
          <text class="community-name">{{ communityInfo.deptName || '社区名称' }}</text>
          <view class="community-tag">智慧社区</view>
        </view>
      </view>
      
      <view class="community-details">
        <view class="detail-row">
          <view class="detail-label">
            <uni-icons type="location" size="18" color="#4CAF50"></uni-icons>
            <text>社区地址</text>
          </view>
          <text class="detail-value">{{ communityInfo.address || '地址待完善' }}</text>
        </view>
        
        <view class="detail-row" v-if="communityInfo.description">
          <view class="detail-label">
            <uni-icons type="info" size="18" color="#4CAF50"></uni-icons>
            <text>社区简介</text>
          </view>
          <text class="detail-value">{{ communityInfo.description }}</text>
        </view>
      </view>
    </view>

    <!-- 加入记录 -->
    <view class="join-record-section">
      <view class="section-title">
        <text>加入记录</text>
      </view>
      
      <view v-if="joinRecord" class="record-card">
        <view class="record-status" :class="[getStatusClass(joinRecord.throughStatus)]">
          <uni-icons :type="getStatusIcon(joinRecord.throughStatus)" size="20" color="#fff"></uni-icons>
          <text>{{ getStatusText(joinRecord.throughStatus) }}</text>
        </view>
        
        <view class="record-info">
          <view class="info-item">
            <text class="info-label">申请人</text>
            <text class="info-value">{{ joinRecord.applicantName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ joinRecord.applicantPhone }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">所属单元</text>
            <text class="info-value">{{ joinRecord.deptName || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">门牌号</text>
            <text class="info-value">{{ getHouseholdDisplay() }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">申请时间</text>
            <text class="info-value">{{ joinRecord.createTime }}</text>
          </view>
          <view class="info-item" v-if="joinRecord.communityDescription">
            <text class="info-label">申请理由</text>
            <text class="info-value">{{ joinRecord.communityDescription }}</text>
          </view>
          <view class="info-item" v-if="joinRecord.reviewName">
            <text class="info-label">审核人</text>
            <text class="info-value">{{ joinRecord.reviewName }}</text>
          </view>
          <view class="info-item" v-if="joinRecord.updateTime && joinRecord.throughStatus !== '0'">
            <text class="info-label">审核时间</text>
            <text class="info-value">{{ joinRecord.updateTime }}</text>
          </view>
          <view class="info-item" v-if="joinRecord.approveDescription">
            <text class="info-label">审核意见</text>
            <text class="info-value">{{ joinRecord.approveDescription }}</text>
          </view>
        </view>
        
        <!-- 证明材料 -->
        <view v-if="proofImages.length > 0" class="proof-section">
          <text class="proof-title">证明材料</text>
          <view class="proof-images">
            <image 
              v-for="(img, index) in proofImages" 
              :key="index"
              :src="img" 
              class="proof-img" 
              mode="aspectFill"
              @click="previewImage(index)"
            ></image>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-record">
        <uni-icons type="info-filled" size="60" color="#ddd"></uni-icons>
        <text class="empty-text">暂无加入记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getApplyjoin } from '@/api/joinCommunity'
import config from '@/config'

export default {
  data() {
    return {
      communityInfo: {},
      joinRecord: null,
      proofImages: []
    }
  },
  
  onLoad(options) {
    if (options.deptId) {
      this.communityInfo.deptId = options.deptId
      this.communityInfo.deptName = options.deptName || ''
      this.communityInfo.address = options.address || ''
    }
    
    if (options.applyId) {
      this.loadJoinRecord(options.applyId)
    }
  },
  
  methods: {
    // 加载加入记录
    async loadJoinRecord(applyId) {
      try {
        uni.showLoading({ title: '加载中...' })
        const response = await getApplyjoin(applyId)
        
        if (response.code === 200 && response.data) {
          this.joinRecord = response.data
          
          // 处理证明材料图片
          if (response.data.proofPhotoUrl) {
            this.proofImages = response.data.proofPhotoUrl.split(',').filter(url => url.trim()).map(url => {
              if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                return config.baseUrl + url
              }
              return url
            })
          }
        }
      } catch (error) {
        console.error('加载加入记录失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        '0': '待审核',
        '1': '已同意',
        '2': '已拒绝',
        '3': '申请已撤销',
        '4': '居民已退出社区'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        '0': 'status-pending',
        '1': 'status-success',
        '2': 'status-rejected',
        '3': 'status-cancelled',
        '4': 'status-left'
      }
      return classMap[status] || ''
    },
    
    // 获取状态图标
    getStatusIcon(status) {
      const iconMap = {
        '0': 'loop',
        '1': 'checkmarkempty',
        '2': 'closeempty',
        '3': 'undo',
        '4': 'back'
      }
      return iconMap[status] || 'info'
    },
    
    // 预览图片
    previewImage(index) {
      uni.previewImage({
        urls: this.proofImages,
        current: index
      })
    },
    
    // 获取门牌号显示
    getHouseholdDisplay() {
      if (!this.joinRecord) return '-'
      
      const floorNo = this.joinRecord.floorNo
      const roomNo = this.joinRecord.roomNo
      
      if (floorNo && roomNo) {
        return `${floorNo}层-${roomNo}`
      } else if (roomNo) {
        return roomNo
      } else if (floorNo) {
        return `${floorNo}层`
      }
      
      return '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.community-detail-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20rpx;
}

.community-info-card {
  background: linear-gradient(135deg, #fff 0%, #f8fffe 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(76, 175, 80, 0.1);
}

.community-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.community-avatar {
  width: 120rpx;
  height: 120rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar-img, .default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.default-avatar {
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(76, 175, 80, 0.2);
}

.community-basic {
  flex: 1;
}

.community-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #2e7d32;
  display: block;
  margin-bottom: 12rpx;
}

.community-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  color: #4CAF50;
  font-size: 22rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.community-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  padding-left: 34rpx;
}

.join-record-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  padding-left: 16rpx;
  border-left: 4rpx solid #4CAF50;
}

.record-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #f5f7fa 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1rpx solid #e8e8e8;
}

.record-status {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  font-weight: 500;
  margin-bottom: 24rpx;
}

.status-pending {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: #fff;
}

.status-success {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: #fff;
}

.status-rejected {
  background: linear-gradient(135deg, #f44336, #e57373);
  color: #fff;
}

.status-cancelled {
  background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
  color: #fff;
}

.status-left {
  background: linear-gradient(135deg, #607d8b, #90a4ae);
  color: #fff;
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #666;
  min-width: 140rpx;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  text-align: right;
  word-break: break-all;
}

.proof-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e8e8e8;
}

.proof-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.proof-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.proof-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  border: 1rpx solid #e8e8e8;
}

.empty-record {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>
