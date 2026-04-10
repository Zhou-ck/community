<template>
  <view class="service-list-page">
    <!-- 状态栏 + 自定义导航栏 -->
    <view class="navbar-wrapper">
      <!-- 状态栏占位 -->
      <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
      <!-- 导航栏 -->
      <view class="custom-navbar">
        <view class="navbar-content">
          <view class="navbar-left" @click="goBack">
            <uni-icons type="back" size="24" color="#333"></uni-icons>
          </view>
          <view class="navbar-title">
            <text>{{ categoryInfo.typeName || '服务分类' }}</text>
          </view>
          <view class="navbar-right"></view>
        </view>
      </view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-wrapper" :style="{ top: (statusBarHeight + 44) + 'px' }">
      <view class="search-box">
        <uni-icons type="search" size="20" color="#bbb"></uni-icons>
        <input 
          class="search-input" 
          v-model="searchKeyword"
          placeholder="搜索服务项" 
          placeholder-style="color: #bbb"
          @input="onSearchInput"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <uni-icons type="clear" size="18" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>
    
    <!-- 服务项列表 -->
    <view class="service-list" :style="{ paddingTop: (statusBarHeight + 44 + 56 + 20) + 'px' }">
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-else-if="filteredServiceList.length > 0" class="service-items">
        <view 
          class="service-card"
          v-for="item in filteredServiceList"
          :key="item.serviceId"
        >
          <image 
            :src="getImageUrl(item.icon)" 
            class="service-image" 
            mode="aspectFill"
            @click="viewServiceDetail(item)"
          ></image>
          <view class="service-content" @click="bookService(item)">
            <view class="service-title">{{ item.serviceName }}</view>
            <view class="service-meta">
              <text class="duration" v-if="item.serviceDuration">{{ item.serviceDuration }}分钟</text>
              <text class="subsidy" v-if="item.subsidySupport === '1'">可补贴</text>
            </view>
            <view class="service-footer">
              <view class="service-price">
                 <text class="symbol">¥</text>
                 <text class="amount">{{ item.price }}</text>
              </view>
              <view class="book-btn" @click.stop="bookService(item)">预约</view>
            </view>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <view class="empty-icon-box">
          <uni-icons type="calendar-filled" size="50" color="#d9d9d9"></uni-icons>
        </view>
        <template v-if="!$store.getters.token">
          <text class="empty-text">请先登录后使用服务功能</text>
          <view class="empty-action-btn" @click="goLogin">去登录</view>
        </template>
        <template v-else-if="!joinedCommunity">
          <text class="empty-text">请先加入社区后查看服务项</text>
          <view class="empty-action-btn" @click="goJoinCommunity">去加入社区</view>
        </template>
        <template v-else>
          <text class="empty-text">{{ searchKeyword ? '未找到相关服务' : '暂无服务项' }}</text>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config.js'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      statusBarHeight: 0,
      loading: false,
      searchKeyword: '',
      categoryInfo: {
        typeId: null,
        typeName: '',
        typeDescription: '',
        typeImage: ''
      },
      serviceList: [],
      total: 0
    }
  },
  
  computed: {
    ...mapGetters(['joinedCommunity']),
    
    // 过滤后的服务列表
    filteredServiceList() {
      if (!this.searchKeyword.trim()) {
        return this.serviceList;
      }
      
      const keyword = this.searchKeyword.toLowerCase();
      return this.serviceList.filter(item => {
        return item.serviceName.toLowerCase().includes(keyword) ||
               (item.description && item.description.toLowerCase().includes(keyword)) ||
               (item.serviceContent && item.serviceContent.toLowerCase().includes(keyword));
      });
    }
  },
  
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    
    this.loadDataFromCache();
  },
  
  methods: {
    // 从缓存加载数据
    loadDataFromCache() {
      try {
        const cacheData = uni.getStorageSync('serviceItemCache');
        
        if (cacheData) {
          console.log('从缓存加载的数据:', cacheData);
          
          this.categoryInfo = {
            typeId: cacheData.typeId,
            typeName: cacheData.typeName,
            typeDescription: cacheData.typeDescription,
            typeImage: cacheData.typeImage
          };
          
          this.serviceList = cacheData.serviceList || [];
          this.total = cacheData.total || 0;
          
          // 数据加载完成后清除缓存
          uni.removeStorageSync('serviceItemCache');
        } else {
          console.warn('缓存中没有数据');
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          });
          
          // 延迟返回
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        console.error('加载缓存数据失败:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    },
    
    // 查看服务详情
    viewServiceDetail(item) {
      // 检查是否已加入社区
      if (!this.checkHasJoinedCommunity()) {
        this.showJoinCommunityModal();
        return;
      }
      
      console.log('选择的服务项:', item);
      
      // 准备服务详情页面需要的数据
      const serviceDetailData = {
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        icon: item.icon,
        price: item.price,
        serviceDuration: item.serviceDuration,
        subsidyRate: item.subsidyRate || 0,
        subsidySupport: item.subsidySupport || '0',
        deptId: item.deptId,
        serviceContent: item.serviceContent,
        description: item.description
      };
      
      // 存储到缓存，避免URL过长
      uni.setStorageSync('serviceDetailCache', serviceDetailData);
      
      // 跳转到服务详情页面
      uni.navigateTo({
        url: '/pages/server/serviceDetail/index'
      });
    },
    
    // 直接预约服务
    bookService(item) {
      // 检查是否已加入社区
      if (!this.checkHasJoinedCommunity()) {
        this.showJoinCommunityModal();
        return;
      }
      
      console.log('直接预约服务:', item);
      
      // 准备预约页面需要的数据
      const bookingData = {
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        icon: item.icon,
        price: item.price,
        serviceDuration: item.serviceDuration,
        subsidyRate: item.subsidyRate || 0,
        subsidySupport: item.subsidySupport || '0',
        deptId: item.deptId,
        serviceContent: item.serviceContent,
        description: item.description
      };
      
      // 存储到缓存
      uni.setStorageSync('bookingDataCache', bookingData);
      
      // 跳转到预约页面
      uni.navigateTo({
        url: '/pages/server/booking/index'
      });
    },
    
    // 处理图片URL
    getImageUrl(iconPath) {
      if (!iconPath) return '/static/images/default-service.png';
      
      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath;
      }
      
      if (iconPath.startsWith('/')) {
        return config.baseUrl + iconPath;
      }
      
      return '/static/images/default-service.png';
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 去登录
    goLogin() {
      uni.navigateTo({ url: '/pages/login' })
    },
    
    // 去加入社区
    goJoinCommunity() {
      uni.navigateTo({ url: '/pages/my/joincommunity/index' })
    },
    
    // 搜索输入
    onSearchInput(e) {
      this.searchKeyword = e.detail.value;
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKeyword = '';
    },
    
    // 检查是否已加入社区
    checkHasJoinedCommunity() {
      return !!this.joinedCommunity;
    },
    
    // 显示加入社区提示弹窗
    showJoinCommunityModal() {
      // 先检查是否登录
      if (!this.$store.getters.token) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再使用服务功能',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/login'
              })
            } else {
              // 用户点击取消，返回上一页
              uni.navigateBack()
            }
          }
        })
        return
      }
      
      // 已登录但未加入社区
      uni.showModal({
        title: '提示',
        content: '您还未加入社区，请先加入社区后再使用服务功能',
        confirmText: '去加入',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，跳转到加入社区页面
            uni.navigateTo({
              url: '/pages/my/joincommunity/index'
            });
          } else {
            // 用户点击取消，返回上一页
            uni.navigateBack();
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/fontB/iconfont.css';
.service-list-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 导航栏包装器 */
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
}

/* 状态栏 */
.status-bar {
  width: 100%;
  background-color: #fff;
}

/* 自定义导航栏 */
.custom-navbar {
  width: 100%;
  background-color: #fff;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
}

.navbar-left,
.navbar-right {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-right {
  justify-content: flex-end;
}

.navbar-title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  
  text {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
    max-width: 400rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 搜索框 */
.search-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 998;
  background-color: #fff;
  padding: 16rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

.search-box {
  display: flex;
  align-items: center;
  height: 72rpx;
  background: #f5f7fa;
  border-radius: 36rpx;
  padding: 0 32rpx;
  gap: 16rpx;
  transition: all 0.3s ease;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 100%;
  
  &::placeholder {
    color: #bbb;
  }
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  transition: opacity 0.3s ease;
  
  &:active {
    opacity: 0.6;
  }
}

/* 服务列表 */
.service-list {
  padding: 24rpx;
}

.service-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.service-card {
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
  border: 2rpx solid transparent;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.02);
  }
}

.service-image {
  width: 100%;
  height: 240rpx;
  display: block;
  background-color: #f5f5f5;
}

.service-content {
  padding: 20rpx;
}

.service-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  line-height: 1.4;
  min-height: 42rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}

.service-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
  height: 44rpx;
}

.duration {
  font-size: 20rpx;
  color: #666;
  padding: 4rpx 12rpx;
  background-color: #f0f2f5;
  border-radius: 8rpx;
}

.subsidy {
  font-size: 20rpx;
  color: #3ec6c6;
  padding: 4rpx 12rpx;
  background-color: rgba(62, 198, 198, 0.1);
  border-radius: 8rpx;
}

.service-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-price {
  color: #ff4d4f;
  font-weight: bold;
  display: flex;
  align-items: baseline;
  
  .symbol {
    font-size: 24rpx;
    margin-right: 2rpx;
  }
  
  .amount {
    font-size: 34rpx;
  }
}

.book-btn {
  font-size: 26rpx;
  color: #fff;
  padding: 10rpx 28rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
  font-weight: 500;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-icon-box {
    width: 140rpx;
    height: 140rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
  
  .empty-action-btn {
    margin-top: 24rpx;
    padding: 16rpx 60rpx;
    background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
    box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
  }
}
</style>