<template>
  <view class="volunteer-page">
    <!-- 顶部搜索区域 -->
    <view class="search-header">
      <view class="search-box">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索志愿服务活动" 
          placeholder-style="color: #999"
          v-model="keyword"
        />
      </view>
    </view>

    <!-- 分类筛选 -->
    <view class="category-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === index }" 
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="handleTabChange(index)"
      >
        <text>{{ tab.name }}</text>
        <view class="active-line" v-if="currentTab === index"></view>
      </view>
    </view>

    <!-- 活动列表 -->
    <view class="activity-list">
      <view 
        class="activity-card" 
        v-for="(item, index) in activityList" 
        :key="index"
        @click="toDetail(item)"
      >
        <view class="card-image-box">
          <image :src="item.image" mode="aspectFill" class="card-image"></image>
          <view class="status-tag" :class="item.status === 1 ? 'status-active' : 'status-end'">
            {{ getStatusText(item.status) }}
          </view>
        </view>
        
        <view class="card-content">
          <view class="title">{{ item.title }}</view>
          
          <view class="info-row">
            <uni-icons type="location" size="14" color="#999"></uni-icons>
            <text class="info-text">{{ item.address }}</text>
          </view>
          
          <view class="info-row">
            <uni-icons type="calendar" size="14" color="#999"></uni-icons>
            <text class="info-text">{{ item.time }}</text>
          </view>
          
          <view class="footer-row">
            <view class="recruit-info">
              <text class="label">招募：</text>
              <text class="count">{{ item.joined }}/{{ item.total }}</text>
              <text class="label">人</text>
            </view>
            
            <view class="action-btn" :class="{ disabled: item.status !== 1 }">
              {{ item.status === 1 ? '立即报名' : '已结束' }}
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="activityList.length === 0" class="empty-state">
        <uni-icons type="info" size="50" color="#ccc"></uni-icons>
        <text>暂无相关活动</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      currentTab: 0,
      tabs: [
        { name: '全部', value: 'all' },
        { name: '社区服务', value: 'community' },
        { name: '关爱老人', value: 'elder' },
        { name: '环境保护', value: 'environment' }
      ],
      // 模拟数据
      activityList: [
        {
          id: 1,
          title: '社区环境美化志愿活动',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/5.jpg',
          status: 1, // 1: 招募中, 2: 已结束
          address: '幸福社区中心广场',
          time: '2024-11-25 09:00-11:00',
          joined: 15,
          total: 30,
          type: 'community'
        },
        {
          id: 2,
          title: '关爱独居老人温暖行动',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/7.jpg',
          status: 1,
          address: '社区养老服务中心',
          time: '2024-11-26 14:00-16:00',
          joined: 8,
          total: 10,
          type: 'elder'
        },
        {
          id: 3,
          title: '垃圾分类宣传指导',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/3.jpg',
          status: 2,
          address: '社区各主要路口',
          time: '2024-11-20 08:00-10:00',
          joined: 20,
          total: 20,
          type: 'environment'
        }
      ]
    }
  },
  methods: {
    handleTabChange(index) {
      this.currentTab = index;
      uni.showToast({
        title: `切换到：${this.tabs[index].name}`,
        icon: 'none'
      });
    },
    getStatusText(status) {
      return status === 1 ? '招募中' : '已结束';
    },
    getStatusClass(status) {
      return status === 1 ? 'status-active' : 'status-end';
    },
    toDetail(item) {
      // 跳转到详情页，传递活动ID
      uni.navigateTo({
        url: `/pages/server/volunteer/detail?id=${item.id}`
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.volunteer-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

.search-header {
  background-color: #fff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .search-box {
    background-color: #f5f7fa;
    border-radius: 36rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    gap: 12rpx;
    
    .search-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.category-tabs {
  display: flex;
  background-color: #fff;
  padding: 20rpx 10rpx 0;
  margin-bottom: 20rpx;
  
  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #3ec6c6;
      font-weight: 600;
      font-size: 30rpx;
    }
    
    .active-line {
      position: absolute;
      bottom: 6rpx;
      width: 40rpx;
      height: 4rpx;
      background-color: #3ec6c6;
      border-radius: 2rpx;
    }
  }
}

.activity-list {
  padding: 0 30rpx;
}

.activity-card {
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  
  .card-image-box {
    width: 100%;
    height: 280rpx;
    position: relative;
    
    .card-image {
      width: 100%;
      height: 100%;
    }
    
    .status-tag {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      padding: 6rpx 16rpx;
      border-radius: 24rpx;
      font-size: 22rpx;
      color: #fff;
      
      &.status-active {
        background: linear-gradient(135deg, #3ec6c6, #2eb5b5);
      }
      
      &.status-end {
        background-color: rgba(0,0,0,0.5);
      }
    }
  }
  
  .card-content {
    padding: 24rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
      line-height: 1.4;
    }
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 12rpx;
      
      .info-text {
        font-size: 26rpx;
        color: #666;
      }
    }
    
    .footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 2rpx solid #f5f5f5;
      
      .recruit-info {
        font-size: 24rpx;
        color: #999;
        
        .count {
          color: #3ec6c6;
          font-size: 30rpx;
          font-weight: 600;
          margin: 0 4rpx;
        }
      }
      
      .action-btn {
        padding: 12rpx 32rpx;
        background: linear-gradient(135deg, #3ec6c6, #2eb5b5);
        color: #fff;
        font-size: 26rpx;
        border-radius: 32rpx;
        font-weight: 500;
        
        &.disabled {
          background: #e0e0e0;
          color: #999;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #999;
  gap: 20rpx;
  font-size: 28rpx;
}
</style>
