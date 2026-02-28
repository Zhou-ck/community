<template>
  <view class="watch-realtime-page">
    <!-- 顶部设备信息 -->
    <view class="device-header">
      <view class="device-info-row">
        <text class="device-label">设备IMEI:</text>
        <text class="device-value">{{ imei || '--' }}</text>
      </view>
      <view class="device-info-row">
        <text class="device-label">测量时间:</text>
        <text class="device-value">{{ realtimeData.dataTime || '--' }}</text>
      </view>
    </view>

    <!-- 设备状态卡片 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-line"></view>
          <text class="section-title">设备状态</text>
        </view>
      </view>
      <view class="status-grid">
        <view class="status-item">
          <view class="status-icon" style="background: #3ec6c6;">
            <uni-icons type="gear" size="22" color="#fff"></uni-icons>
          </view>
          <view class="status-info">
            <text class="status-label">实时电量</text>
            <view class="status-value-row">
              <text class="status-value">{{ realtimeData.battery || '--' }}</text>
              <text class="status-unit">%</text>
            </view>
          </view>
        </view>
        <view class="status-item">
          <view class="status-icon" style="background: #f5576c;">
            <uni-icons type="paperplane" size="22" color="#fff"></uni-icons>
          </view>
          <view class="status-info">
            <text class="status-label">实时信号</text>
            <view class="status-value-row">
              <text class="status-value">{{ realtimeData.rssi || '--' }}</text>
              <text class="status-unit">dBm</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 运动数据卡片 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-line"></view>
          <text class="section-title">运动数据</text>
        </view>
      </view>
      <view class="sport-grid">
        <view class="sport-item">
          <view class="sport-icon" style="background: #ff6b6b;">
            <uni-icons type="map-pin-ellipse" size="24" color="#fff"></uni-icons>
          </view>
          <view class="sport-value-row">
            <text class="sport-value">{{ realtimeData.steps || 0 }}</text>
            <text class="sport-unit">步</text>
          </view>
          <text class="sport-label">实时步数</text>
        </view>
        <view class="sport-item">
          <view class="sport-icon" style="background: #a29bfe;">
            <uni-icons type="location" size="24" color="#fff"></uni-icons>
          </view>
          <text class="sport-value-single">{{ formatDistance(realtimeData.distance) }}</text>
          <text class="sport-label">实时距离</text>
        </view>
        <view class="sport-item">
          <view class="sport-icon" style="background: #fdcb6e;">
            <uni-icons type="fire" size="24" color="#fff"></uni-icons>
          </view>
          <text class="sport-value-single">{{ formatCalorie(realtimeData.calorie) }}</text>
          <text class="sport-label">实时卡路里</text>
        </view>
      </view>
    </view>

    <!-- 定位信息卡片 -->
    <view class="section-card" v-if="locationList.length > 0">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-line"></view>
          <text class="section-title">定位信息</text>
        </view>
        <view class="location-count">共 {{ locationList.length }} 条记录</view>
      </view>
      
      <view class="location-list">
        <view v-for="(item, index) in locationList" :key="index" class="location-item">
          <view class="location-icon" :style="{ background: getLocationColor(item.typeCode) }">
            <uni-icons type="location-filled" size="18" color="#fff"></uni-icons>
          </view>
          <view class="location-content">
            <view class="location-header">
              <text class="location-type">{{ item.type }}</text>
              <text class="location-time">{{ item.time }}</text>
            </view>
            <view class="location-coords">经度: {{ item.longitude }} | 纬度: {{ item.latitude }}</view>
          </view>
          <view class="location-action" @click="viewOnMap(item)">
            <uni-icons type="map" size="18" color="#3ec6c6"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getIwownDeviceRealtime } from '@/api/device'

export default {
  data() {
    return {
      imei: '',
      deviceId: '',
      deviceAlias: '',
      loading: false,
      realtimeData: {},
      locationList: []
    }
  },
  
  onLoad(options) {
    if (options.imei) {
      this.imei = options.imei
    }
    if (options.deviceId) {
      this.deviceId = options.deviceId
    }
    if (options.deviceAlias) {
      this.deviceAlias = decodeURIComponent(options.deviceAlias)
    }
    
    this.loadRealTimeData()
  },
  
  onPullDownRefresh() {
    this.loadRealTimeData()
  },
  
  methods: {
    async loadRealTimeData() {
      if (!this.imei) {
        uni.showToast({
          title: '设备IMEI不能为空',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      try {
        const response = await getIwownDeviceRealtime(this.imei)
        
        if (response.code === 200 && response.data) {
          this.realtimeData = response.data
          this.locationList = this.parseLocationData(response.data.gnssList)
          
          uni.showToast({
            title: '数据刷新成功',
            icon: 'success',
            duration: 1500
          })
        } else {
          uni.showToast({
            title: response.msg || '获取数据失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取实时数据失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
        // 停止下拉刷新动画
        uni.stopPullDownRefresh()
      }
    },
    
    // 格式化距离（米转公里）
    formatDistance(distance) {
      if (!distance) return '0 米'
      const meters = distance / 10
      if (meters >= 1000) {
        return (meters / 1000).toFixed(2) + ' 公里'
      }
      return meters + ' 米'
    },
    
    // 格式化卡路里
    formatCalorie(calorie) {
      if (!calorie) return '0 千卡'
      return (calorie / 10) + ' 千卡'
    },
    
    // 解析定位数据
    parseLocationData(gnssList) {
      const list = []
      if (!gnssList) return list
      
      for (let key in gnssList) {
        if (key === '@type') continue
        const gnss = gnssList[key].split('--')
        if (gnss.length >= 4) {
          list.push({
            time: gnss[0],
            longitude: gnss[1],
            latitude: gnss[2],
            typeCode: gnss[3],
            type: this.getGnssType(gnss[3])
          })
        }
      }
      return list
    },
    
    // 获取定位类型文本
    getGnssType(type) {
      switch(type) {
        case '1':
          return '基站定位'
        case '2':
          return 'Wi-Fi定位'
        case '3':
          return 'GPS定位'
        default:
          return '未知'
      }
    },
    
    // 获取定位类型颜色
    getLocationColor(typeCode) {
      switch(typeCode) {
        case '1':
          return '#ffa502'
        case '2':
          return '#3ec6c6'
        case '3':
          return '#4CAF50'
        default:
          return '#999'
      }
    },
    
    // 查看地图
    viewOnMap(location) {
      // 检查经纬度是否有效
      const longitude = parseFloat(location.longitude)
      const latitude = parseFloat(location.latitude)
      
      if (isNaN(longitude) || isNaN(latitude)) {
        uni.showToast({
          title: '定位数据无效',
          icon: 'none'
        })
        return
      }
      
      // 使用uni.openLocation打开地图（支持所有小程序平台）
      uni.openLocation({
        longitude: longitude,
        latitude: latitude,
        name: '设备位置',
        address: `${location.type} - ${location.time}`,
        scale: 15, // 地图缩放级别，范围5-18，默认18
        success: () => {
          console.log('打开地图成功')
        },
        fail: (err) => {
          console.error('打开地图失败:', err)
          
          // 根据不同错误提供更友好的提示
          let errorMsg = '打开地图失败'
          if (err.errMsg) {
            if (err.errMsg.includes('cancel')) {
              errorMsg = '已取消打开地图'
            } else if (err.errMsg.includes('permission')) {
              errorMsg = '没有位置权限，请在设置中开启'
            }
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.watch-realtime-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24rpx;
}

.device-header {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.device-info-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.device-label {
  font-size: 26rpx;
  color: #999;
  min-width: 140rpx;
}

.device-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.section-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-line {
  width: 6rpx;
  height: 32rpx;
  background: #3ec6c6;
  border-radius: 3rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

/* 设备状态网格 */
.status-grid {
  display: flex;
  gap: 20rpx;
}

.status-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.status-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.status-label {
  font-size: 24rpx;
  color: #999;
}

.status-value-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.status-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.status-unit {
  font-size: 22rpx;
  color: #666;
}

/* 运动数据网格 */
.sport-grid {
  display: flex;
  gap: 16rpx;
}

.sport-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 28rpx 16rpx;
}

.sport-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sport-value-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.sport-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.sport-unit {
  font-size: 22rpx;
  color: #666;
}

.sport-value-single {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  text-align: center;
}

.sport-label {
  font-size: 24rpx;
  color: #999;
}

/* 定位信息 */
.location-count {
  font-size: 22rpx;
  color: #3ec6c6;
  background: rgba(62, 198, 198, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.location-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-content {
  flex: 1;
  min-width: 0;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.location-type {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.location-time {
  font-size: 22rpx;
  color: #999;
}

.location-coords {
  font-size: 22rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-action {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  
  &:active {
    background: #f5f5f5;
  }
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
