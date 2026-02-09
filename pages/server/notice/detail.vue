<template>
  <view class="notice-detail-page">
    <view class="content-wrapper">
      <view class="detail-card" v-if="notice">
        <!-- 头部区域 -->
        <view class="detail-header">
          <view class="detail-title">{{ notice.title }}</view>
          <view class="detail-meta">
            <view class="meta-item">
              <uni-icons type="calendar" size="14" color="#999"></uni-icons>
              <text>{{ notice.time }}</text>
            </view>
            <view class="header-badge" :class="{ important: notice.important }">
              <text>{{ notice.important ? '重要' : '普通' }}</text>
            </view>
          </view>
        </view>

        <!-- 内容区域 -->
        <view class="detail-body">
          <view class="detail-content">
            <rich-text :nodes="formatHtmlContent(notice.content)"></rich-text>
          </view>
        </view>

        <!-- 底部提示 -->
        <view class="detail-footer">
          <view class="footer-tip">
            <uni-icons type="info" size="14" color="#999"></uni-icons>
            <text>如有疑问，请联系社区服务中心</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <view class="empty-icon-box">
          <uni-icons type="info" size="48" color="#ccc"></uni-icons>
        </view>
        <text class="empty-text">未找到公告信息</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      notice: null
    }
  },
  onLoad(options) {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 0

    if (options.item) {
      try {
        this.notice = JSON.parse(decodeURIComponent(options.item))
      } catch (e) {
        console.error('解析公告数据失败', e)
      }
    }
  },
  methods: {
    formatHtmlContent(content) {
      if (!content) return ''
      
      const pStyle = 'margin: 24rpx 0; line-height: 1.9; font-size: 30rpx; color: #555;'
      
      let result = content
        // 【标题】格式
        .replace(/<p>【([^】]+)】[：:]?<\/p>/gi, 
          '<p style="margin: 36rpx 0 20rpx; font-size: 32rpx; font-weight: 700; color: #1a1a1a; display: flex; align-items: center;"><span style="display: inline-block; width: 8rpx; height: 32rpx; background: linear-gradient(180deg, #3ec6c6, #2eb5b5); border-radius: 4rpx; margin-right: 16rpx;"></span>$1</p>')
        // ✓ 列表
        .replace(/<p>✓\s*/gi, 
          '<p style="' + pStyle + ' padding: 16rpx 20rpx; background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 50%); border-radius: 12rpx; margin: 16rpx 0;"><span style="color: #52c41a; font-weight: 600; margin-right: 12rpx;">✓</span>')
        // • 列表
        .replace(/<p>•\s*/gi, 
          '<p style="' + pStyle + ' padding-left: 24rpx; position: relative;"><span style="position: absolute; left: 0; color: #3ec6c6; font-size: 24rpx;">•</span>')
        // 数字列表 1. 2. 3.
        .replace(/<p>(\d+)\.\s*/gi, 
          '<p style="' + pStyle + ' padding: 20rpx 24rpx; background: #f8f9fa; border-radius: 12rpx; margin: 16rpx 0; border-left: 4rpx solid #3ec6c6;"><span style="color: #3ec6c6; font-weight: 700; margin-right: 12rpx;">$1.</span>')
        // 普通段落
        .replace(/<p>/gi, '<p style="' + pStyle + '">')
        .replace(/<p\s+style="/gi, '<p style="')
      
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4f4 0%, #f5f7fa 30%, #f8f9fa 100%);
}

.content-wrapper {
  padding: 24rpx;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-card {
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(62, 198, 198, 0.08), 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 头部区域 */
.detail-header {
  padding: 40rpx 36rpx 32rpx;
  background: linear-gradient(135deg, #f8fdfd 0%, #f0fafa 100%);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 36rpx;
    right: 36rpx;
    height: 2rpx;
    background: linear-gradient(90deg, transparent, #e0f0f0, transparent);
  }
}

.detail-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.5;
  letter-spacing: 1rpx;
  margin-bottom: 24rpx;
}

.detail-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #999;
  }
}

.header-badge {
  padding: 8rpx 24rpx;
  border-radius: 100rpx;
  font-size: 22rpx;
  font-weight: 600;
  background: #f5f7fa;
  color: #666;
  
  &.important {
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
    color: #fff;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.25);
  }
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #999;
  }
}

/* 内容区域 */
.detail-body {
  padding: 36rpx;
}

.detail-content {
  font-size: 30rpx;
  color: #555;
  line-height: 1.9;
}

/* 底部提示 */
.detail-footer {
  padding: 24rpx 36rpx 32rpx;
  background: #fafbfc;
  border-top: 2rpx dashed #f0f0f0;
  
  .footer-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #999;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
  
  .empty-icon-box {
    width: 120rpx;
    height: 120rpx;
    background: #f5f7fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
  }
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
