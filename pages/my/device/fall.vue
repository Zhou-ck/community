<template>
  <view class="detection-page">
    <view class="card-container">
      <!-- 表头 -->
      <view class="table-header">
        <text class="header-cell time-cell">时间</text>
        <text class="header-cell">高度(cm)</text>
        <text class="header-cell">运动</text>
        <text class="header-cell">状态</text>
      </view>
      
      <!-- 数据列表 -->
      <scroll-view class="table-body" scroll-y>
        <view v-for="(item, index) in monitorData" :key="index" class="table-row">
          <text class="table-cell time-cell">{{ item.time }}</text>
          <text class="table-cell">{{ item.height }}</text>
          <text class="table-cell">{{ item.motion }}</text>
          <view class="table-cell status-cell">
            <view class="status-tag" :class="item.statusClass">{{ item.status }}</view>
          </view>
        </view>
        
        <!-- 如果没有数据，显示提示 -->
        <view v-if="monitorData.length === 0 && !loading" class="empty-tip">
          <text>暂无实时数据</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getRealTimeData } from '@/api/device'

export default {
  data() {
    return {
      productKey: '',
      deviceKey: '',
      monitorData: [],
      loading: false,
      timer: null // 定时器
    }
  },
  onLoad(options) {
    if (options.productKey && options.deviceKey) {
      this.productKey = options.productKey
      this.deviceKey = options.deviceKey
      this.initData()
    } else {
      uni.showToast({
        title: '参数缺失',
        icon: 'none'
      })
    }
  },
  onShow() {
    // 页面显示时启动定时刷新
    this.startAutoRefresh()
  },
  onHide() {
    // 页面隐藏时停止定时刷新
    this.stopAutoRefresh()
  },
  onUnload() {
    // 页面卸载时停止定时刷新
    this.stopAutoRefresh()
  },
  methods: {
    async initData() {
      this.loading = true
      const data = await this.loadRealTimeData()
      this.formatMonitorData(data)
      this.loading = false
    },
    
    // 启动自动刷新
    startAutoRefresh() {
      // 先清除可能存在的定时器
      this.stopAutoRefresh()
      // 每5秒刷新一次
      this.timer = setInterval(() => {
        this.refreshData()
      }, 5000)
    },
    
    // 停止自动刷新
    stopAutoRefresh() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    // 刷新数据（不显示loading）
    async refreshData() {
      const data = await this.loadRealTimeData()
      if (data && Object.keys(data).length > 0) {
        this.addMonitorRecord(data)
      }
    },
    
    // 获取设备实时数据
    async loadRealTimeData() {
      try {
        const response = await getRealTimeData({
          productKey: this.productKey,
          deviceKey: this.deviceKey
        })
        
        if (response.code === 200) {
          let realTimeParams = {}
          
          // 首先检查response.data是否是字符串
          if (typeof response.data === 'string') {
            try {
              const parsedData = JSON.parse(response.data)
              
              // 从解析后的数据中提取params
              if (parsedData.params && typeof parsedData.params === 'string') {
                realTimeParams = JSON.parse(parsedData.params)
              } else if (parsedData.params) {
                realTimeParams = parsedData.params
              }
            } catch (e) {
              // 解析失败，返回空对象
            }
          }
          // 处理response.data是对象的情况
          else if (response.data && typeof response.data === 'object') {
            // 检查是否有params字段
            if ('params' in response.data) {
              if (typeof response.data.params === 'string') {
                if (response.data.params.trim() !== '') {
                  try {
                    realTimeParams = JSON.parse(response.data.params)
                  } catch (e) {
                    realTimeParams = {}
                  }
                }
              } else {
                realTimeParams = response.data.params
              }
            } 
            // 检查是否有data.params结构
            else if (response.data.data && response.data.data.params) {
              if (typeof response.data.data.params === 'string') {
                try {
                  realTimeParams = JSON.parse(response.data.data.params)
                } catch (e) {
                  realTimeParams = {}
                }
              } else {
                realTimeParams = response.data.data.params
              }
            }
            // 检查response.data本身是否就是参数数据
            else if (Object.keys(response.data).some(key => 
              ['height', 'unmanned', 'DWT', 'FRT', 'threshold', 'lamp', 'buz'].includes(key))) {
              realTimeParams = response.data
            }
            // 尝试寻找包含参数的对象
            else {
              for (const [key, value] of Object.entries(response.data)) {
                if (value && typeof value === 'object' && 
                    Object.keys(value).some(k => ['height', 'unmanned', 'DWT', 'FRT', 'threshold', 'lamp', 'buz'].includes(k))) {
                  realTimeParams = value
                  break
                }
              }
            }
          }
          
          return realTimeParams
        }
      } catch (error) {
        // 获取失败，返回空对象
      }
      return {}
    },
    
    // 格式化实时检测数据（首次加载）
    formatMonitorData(data) {
      if (!data || Object.keys(data).length === 0) {
        this.monitorData = []
        return
      }
      this.addMonitorRecord(data)
    },
    
    // 添加一条监测记录
    addMonitorRecord(data) {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      // 提取关键字段
      const height = data.height || data.installHeight || '-'
      
      // motion: 0:无运动, 1:有运动
      const motionValue = data.motion
      let motion = '-'
      if (motionValue === 0 || motionValue === '0') {
        motion = '否'
      } else if (motionValue === 1 || motionValue === '1') {
        motion = '是'
      }
      
      // exist: 0:不存在, 1:存在
      const exist = data.exist
      let status = '-'
      let statusClass = 'status-none'
      if (exist === 0 || exist === '0') {
        status = '无人'
        statusClass = 'status-none'
      } else if (exist === 1 || exist === '1') {
        status = '有人'
        statusClass = 'status-person'
      }
      
      const record = {
        time: timeStr,
        height,
        motion,
        status,
        statusClass
      }
      
      // 添加到列表顶部
      this.monitorData.unshift(record)
      
      // 限制最多保留100条记录
      if (this.monitorData.length > 100) {
        this.monitorData = this.monitorData.slice(0, 100)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detection-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.card-container {
  background: #fff;
  border-radius: 24rpx;
  padding: 0 20rpx 20rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.page-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  padding: 32rpx 0;
}

/* 表头 */
.table-header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
  z-index: 10;
}

.header-cell {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  
  &.time-cell {
    flex: 1.5;
  }
}

/* 表体 */
.table-body {
  flex: 1;
  height: 0; /* 关键：确保scroll-view能正确滚动 */
}

.table-row {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
  
  &:last-child {
    border-bottom: none;
  }
}

.table-cell {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  
  &.time-cell {
    flex: 1.5;
    color: #333;
  }
  
  &.status-cell {
    display: flex;
    justify-content: center;
  }
}

/* 状态标签 */
.status-tag {
  padding: 6rpx 24rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #fff;
  
  &.status-none {
    background: #67c23a;
  }
  
  &.status-person {
    background: #409eff;
  }
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* Loading Mask */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-text {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #666;
  }
}
</style>