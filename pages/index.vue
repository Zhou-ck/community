<template>
  <view class="page-container">
    <!-- 定位栏 -->
    <view class="location-bar">
      <view class="location-info">
        <uni-icons type="location" size="20" color="#fff"></uni-icons>
        <text class="location-text">{{ locationText }}</text>
      </view>
      <view class="weather-info" @click="handleSelectCommunity">
        <text class="weather-text">{{ weatherText }}</text>
      </view>
    </view>
   
    <!-- 轮播图 -->
    <view class="banner-container">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="3000" 
        :duration="500"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#fff"
      >
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <image :src="item.image" class="banner-image" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 公告栏 -->
    <view class="notice-container">
      <view class="notice-header">
        <uni-icons type="sound" size="16" color="#ff6b35"></uni-icons>
        <text class="notice-title">公告</text>
      </view>
      <view class="notice-content">
        <swiper 
          class="notice-swiper" 
          :vertical="true" 
          :autoplay="true" 
          :interval="4000" 
          :duration="300"
          :indicator-dots="false"
        >
          <swiper-item v-for="(notice, index) in noticeList" :key="index">
            <text class="notice-text" @click="handleNoticeClick(notice)">{{ notice.title }}</text>
          </swiper-item>
        </swiper>
      </view>
      <view class="notice-more" @click="handleMoreNotice">
        <uni-icons type="right" size="14" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 服务中心 -->
    <view class="service-container">
      <view class="service-header">
        <view class="service-title-bar">
          <text class="service-title">服务中心</text>
        </view>
      </view>
      <view class="service-grid">
        <view 
          class="service-item" 
          v-for="(item, index) in serviceList" 
          :key="index"
          @click="handleServiceClick(item)"
        >
          <view class="service-icon" :style="{ backgroundColor: item.bgColor }">
            <text class="iconfontA" :class="item.icon" :style="{ color: item.iconColor, fontSize: item.iconSize }"></text>
          </view>
          <text class="service-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 新增模块 -->
    <view class="new-module-container">
      <view class="new-module-content">
        <image 
          src="https://www.aigather.katlot.cn/sourcePic/photo/6.png" 
          class="new-module-image" 
          mode="aspectFit"
        ></image>
      </view>
    </view>

    <!-- 居家养老模块 -->
    <view class="home-care-container">
      <view class="home-care-header">
        <view class="home-care-title-bar">
          <text class="home-care-title">居家养老</text>
          <text class="home-care-subtitle">贴心品质服务</text>
        </view>
      </view>
      <view class="home-care-services">
        <view 
          class="home-care-item" 
          v-for="(item, index) in homeCareList" 
          :key="index"
          @click="handleHomeCareClick(item)"
        >
          <view class="home-care-image-wrapper">
            <image :src="item.image" class="home-care-image" mode="aspectFill"></image>
          </view>
          <view class="home-care-info">
            <text class="home-care-name">{{ item.name }}</text>
            <text class="home-care-count">{{ item.count }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template> 

<script>
import { mapState } from 'vuex'
import { listNotice } from '@/api/notice.js'

export default {
  data() {
    return {
      locationText: '定位中...',
      weatherText: '选择社区',
      bannerList: [
        {
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/1.jpg',
        },
        {
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/4.png',
        }
      ],
      noticeList: [],
      serviceList: [
        {
          id: 1,
          name: '助洁服务',
          icon: 'icon-jiazheng',
          bgColor: '#FCE4EC',
          iconColor: '#E91E63',
		  
        },
        {
          id: 2,
          name: '助行服务',
          icon: 'icon-kangfuxunlian',
          bgColor: '#E8F5E8',
          iconColor: '#4CAF50',
		   iconSize: '52rpx' 
        },
       
        {
          id: 3,
          name: '助医服务',
          icon: 'icon-yisheng',
          bgColor: '#E8F4FF',
          iconColor: '#2196F3',
		   iconSize: '55rpx' 
        },
        {
          id: 4,
          name: '护理服务',
          icon: 'icon-icon-test',
          bgColor: '#FFF3E0',
          iconColor: '#FF9800',
		   iconSize: '60rpx' 
        },
        
        {
          id: 5,
          name: '助餐服务',
          icon: 'icon-canyin',
          bgColor: '#FFE8E8',
          iconColor: '#F44336',
		   iconSize: '56rpx' 
        },
           {
          id: 6,
          name: '紧急求助',
          icon: 'icon-xinlijiankang',
          bgColor: '#FFE8F0',
          iconColor: '#FF4081'
        },
      //   {
      //     id: 7,
      //     name: '志愿服务',
      //     icon: 'icon-zhiyuanzhe',
      //     bgColor: '#F3E5F5',
      //     iconColor: '#9C27B0',
		  //  iconSize: '60rpx' 
      //   },
     
        {
          id: 7,
          name: '服务套餐',
          icon: 'icon-fuwutaocan',
          bgColor: '#F3E5F5',
          iconColor: '#9C27B0',
		   iconSize: '48rpx' 
        },
     
         {
          id: 8,
          name: '设备套餐',
          icon: 'icon-yiliaojigou',
          bgColor: '#E8F4FF',
          iconColor: '#2196F3',
		   iconSize: '60rpx' 
        }
        
        
      ],
      homeCareList: [
        {
          id: 1,
          name: '助洁服务',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/5.jpg',
          count: '120人预约'
        },
        {
          id: 2,
          name: '护理服务',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/7.jpg',
          count: '86人预约'
        },
        {
          id: 3,
          name: '助餐服务',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/3.jpg ',
          count: '79人预约'
        }
      ]
    }
  },
  computed: {
    ...mapState({
      joinedCommunity: state => state.user.joinedCommunity
    })
  },
  watch: {
    joinedCommunity: {
      handler(newVal) {
        this.updateCommunityInfo(newVal)
      },
      immediate: true
    }
  },
  onLoad() {
    // 获取定位信息
    this.getLocation()
    // 获取公告列表
    this.getNoticeList()
  },
  onShow() {
    // 页面显示时更新社区信息（从Vuex状态获取）
    this.updateCommunityInfo(this.joinedCommunity)
  },
  methods: {
    // 更新社区显示信息
    updateCommunityInfo(communityInfo) {
      if (communityInfo) {
        const communityName = communityInfo.name || communityInfo.communityName || '选择社区'
        this.weatherText = '选择社区'
        this.locationText = communityName
        console.log('加载社区信息:', communityName)
      } else {
        this.weatherText = '选择社区'
        this.locationText = '定位中...'
      }
    },

    // 获取定位
    getLocation() {
      // uni.getLocation({
      //   type: 'wgs84',
      //   success: (res) => {
      //     console.log('当前位置的经度：' + res.longitude)
      //     console.log('当前位置的纬度：' + res.latitude)
      //     // 这里可以调用逆地理编码API获取具体地址
      //     // 暂时显示固定文本
      //     this.locationText = '定位中...'
      //   },
      //   fail: () => {
      //     console.log('获取定位失败')
      //     this.locationText = '定位失败'
      //   }
      // })
    },
    
    // 点击公告
    handleNoticeClick(notice) {
      uni.navigateTo({
        url: `/pages/server/notice/detail?item=${encodeURIComponent(JSON.stringify(notice))}`
      })
    },
    
    // 获取公告列表
    async getNoticeList() {
      try {
        const res = await listNotice({ pageNum: 1, pageSize: 5 })
        if (res.code === 200 && res.rows) {
          this.noticeList = res.rows.map(item => ({
            id: item.noticeId,
            title: item.noticeTitle,
            content: item.noticeContent,
            time: item.createTime,
            important: item.noticeType === '1'
          }))
        }
      } catch (e) {
        console.error('获取公告列表失败:', e)
      }
    },
    
    // 查看更多公告
    handleMoreNotice() {
      console.log('查看更多公告')
      uni.showToast({
        title: '跳转到公告列表',
        icon: 'none'
      })
      // 这里可以跳转到公告列表页面
      uni.navigateTo({
        url: '/pages/server/notice/index'
      })
    },
    
    // 点击服务项目
    handleServiceClick(service) {
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
            }
          }
        })
        return
      }
      
      // 检查是否已加入社区
      if (!this.checkHasJoinedCommunity()) {
        uni.showModal({
          title: '提示',
          content: '您还未加入社区，请先加入社区后再预约服务',
          confirmText: '去加入',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/my/joincommunity/index'
              })
            }
          }
        })
        return
      }
      
      // 前六个服务跳转到工作页面对应分类
      if (service.id <= 6) {
        // 服务名称与分类的映射关系
        const serviceTypeMap = {
          '助洁服务': '助洁服务',
          '助行服务': '助行服务', 
          '助医服务': '助医服务',
          '护理服务': '助浴服务',
          '助餐服务': '助餐服务',
          '紧急求助': '助急服务'
        };
        
        const categoryName = serviceTypeMap[service.name];
        
        if (categoryName) {
          // 由于工作页面是tabbar页面，需要使用switchTab跳转
          // 先存储目标分类到本地存储
          uni.setStorageSync('targetCategory', categoryName);
          
          // 跳转到工作页面
          uni.switchTab({
            url: '/pages/work/index'
          });
        } else {
          uni.showToast({
            title: `${service.name}功能开发中`,
            icon: 'none'
          });
        }
      } else if (service.name === '志愿服务') {
        // 跳转到志愿服务页面
        uni.navigateTo({
          url: '/pages/server/volunteer/index'
        })
      } else if (service.name === '服务套餐') {
        // 跳转到志愿服务页面
        uni.navigateTo({
          url: '/pages/server/SetMeal/index'
        })
      }
      else if (service.name === '设备套餐') {
        // 跳转到设备套餐页面
        uni.navigateTo({
          url: '/pages/my/balancePackage/index'
        })
      } else {
        // 其他服务显示开发中提示
        uni.showToast({
          title: `${service.name}功能开发中`,
          icon: 'none'
        });
      }
    },
    
    // 点击居家养老服务
    handleHomeCareClick(service) {
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
            }
          }
        })
        return
      }
      
      // 检查是否已加入社区
      if (!this.checkHasJoinedCommunity()) {
        uni.showModal({
          title: '提示',
          content: '您还未加入社区，请先加入社区后再预约服务',
          confirmText: '去加入',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/my/joincommunity/index'
              })
            }
          }
        })
        return
      }
      
      console.log('点击居家养老服务:', service)
      
      // 服务名称与分类的映射关系
      const serviceTypeMap = {
        '助洁服务': '助洁服务',
        '护理服务': '助浴服务',
        '助餐服务': '助餐服务'
      }
      
      const categoryName = serviceTypeMap[service.name]
      
      if (categoryName) {
        // 由于工作页面是tabbar页面，需要使用switchTab跳转
        // 先存储目标分类到本地存储
        uni.setStorageSync('targetCategory', categoryName)
        
        // 跳转到工作页面
        uni.switchTab({
          url: '/pages/work/index'
        })
      } else {
        uni.showToast({
          title: `${service.name}功能开发中`,
          icon: 'none'
        })
      }
    },

    // 点击选择社区
    handleSelectCommunity() {
      uni.navigateTo({
        url: '/pages/my/joincommunity/index'
      })
    },
    
    // 检查是否已加入社区
    checkHasJoinedCommunity() {
      return !!this.joinedCommunity
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 定位信息栏 */
.location-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 30rpx;
  background-color: #a8e6cf;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.location-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.location-text {
  margin-left: 10rpx;
  font-size: 30rpx;
  color: #fff;
  font-weight: 400;
  opacity: 0.95;
}

.weather-info {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.weather-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 400;
  opacity: 0.9;
}

.app-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.title-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.right-icons {
  display: flex;
  align-items: center;
}

.icon-item {
  margin-left: 30rpx;
}

/* 轮播图 */
.banner-container {
  background: linear-gradient(180deg, #a8e6cf 0%, #88d8a3 100%);
  padding: 15rpx 0 0rpx;
}

.banner-swiper {
  height: 380rpx;
  margin: 0 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
}

.banner-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

/* 轮播指示器样式调整 */
.banner-swiper ::v-deep .uni-swiper-dots {
  bottom: 16rpx;
}

.banner-swiper ::v-deep .uni-swiper-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin: 0 6rpx;
  background: rgba(255, 255, 255, 0.4);
}

.banner-swiper ::v-deep .uni-swiper-dot-active {
  background: rgba(255, 255, 255, 0.9);
}

/* 公告栏 */
.notice-container {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.notice-header {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #ff6b35;
  margin-left: 8rpx;
}

.notice-content {
  flex: 1;
  height: 40rpx;
  overflow: hidden;
}

.notice-swiper {
  height: 40rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #666;
  line-height: 40rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-more {
  margin-left: 20rpx;
  padding: 8rpx;
  flex-shrink: 0;
}

/* 服务中心 */
.service-container {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 12rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.service-header {
  margin-bottom: 30rpx;
}

.service-title-bar {
  position: relative;
  padding-left: 20rpx;
}

.service-title-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 36rpx;
  background: #4CAF50;
  border-radius: 4rpx;
}

.service-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx 20rpx;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 10rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.service-item:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.02);
}

.service-icon {
  width: 90rpx;
  height: 90rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.service-icon .iconfontA {
  font-size: 50rpx;
}

.service-name {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  line-height: 1.2;
}

/* 新增模块样式 */
.new-module-container {
  margin: 20rpx 30rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.new-module-content {
  position: relative;
}

.new-module-image {
  width: 100%;
  height: 280rpx;
  display: block;
}

/* 居家养老模块样式 */
.home-care-container {
  background: #fff;
  margin: 20rpx 30rpx;
  border-radius: 12rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.home-care-header {
  margin-bottom: 30rpx;
}

.home-care-title-bar {
  position: relative;
  padding-left: 20rpx;
}

.home-care-title-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 36rpx;
  background: #FF6B35;
  border-radius: 4rpx;
}

.home-care-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.home-care-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-left: 20rpx;
}

.home-care-services {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.home-care-item {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
  transition: all 0.3s ease;
}

.home-care-item:active {
  transform: scale(0.95);
}

.home-care-image-wrapper {
  position: relative;
  width: 100%;
  height: 160rpx;
  overflow: hidden;
}

.home-care-image {
  width: 100%;
  height: 100%;
}

.home-care-info {
  padding: 20rpx 16rpx;
  text-align: center;
}

.home-care-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.home-care-count {
  font-size: 22rpx;
  color: #999;
  display: block;
}
</style>
