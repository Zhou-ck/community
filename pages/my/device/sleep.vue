<template>
  <view class="detection-page">
    <view v-if="currentData" class="report-container">
      <!-- 头部状态 -->
      <view class="status-header">
        <view class="time-badge">
          <uni-icons type="time" size="14" color="#666"></uni-icons>
          <text class="time-text">更新于 {{ currentData.time }}</text>
        </view>
        <view class="status-badge" :class="currentData.statusClass">
          {{ currentData.bedStatus }}
        </view>
      </view>
      
      <!-- 核心数据：心率与呼吸 -->
      <view class="core-data-card">
        <view class="data-item heart">
          <view class="icon-wrapper heart-bg" @click="toggleHeartWave">
            <uni-icons type="heart-filled" size="24" color="#ff5555"></uni-icons>
          </view>
          <view class="value-group">
            <text class="value">{{ currentData.heartRateVal }}</text>
            <text class="unit">bpm</text>
          </view>
          <text class="label">实时心率</text>
        </view>
        
        <view class="divider-vertical"></view>
        
        <view class="data-item breath">
          <view class="icon-wrapper breath-bg">
            <uni-icons type="refreshempty" size="24" color="#3ec6c6"></uni-icons>
          </view>
          <view class="value-group">
            <text class="value">{{ currentData.breathRateVal }}</text>
            <text class="unit">次/分</text>
          </view>
          <text class="label">呼吸频率</text>
        </view>
      </view>
      
      <!-- 心率波形图 -->
      <view v-if="showHeartWave" class="wave-card">
        <view class="wave-header">
          <view class="wave-info">
            <text class="wave-title">心率波形</text>
            <view class="wave-stats">
              <view class="stat-item">
                <text class="stat-label">当前</text>
                <text class="stat-value current">{{ currentData.heartRateVal }}</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-label">最高</text>
                <text class="stat-value high">{{ maxHeartRate }}</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-label">最低</text>
                <text class="stat-value low">{{ minHeartRate }}</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-label">平均</text>
                <text class="stat-value avg">{{ avgHeartRate }}</text>
              </view>
            </view>
          </view>
          <view class="wave-close" @click="toggleHeartWave">
            <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
          </view>
        </view>
        <view class="wave-container">
          <view class="wave-body">
            <canvas 
              canvas-id="heartWaveCanvas" 
              id="heartWaveCanvas"
              class="wave-canvas"
              :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
            ></canvas>
          </view>
        </view>
      </view>
      
      <!-- 详细指标网格 -->
      <view class="metrics-title">详细体征</view>
      <view class="metrics-grid">
        <view class="metric-card">
          <text class="metric-label">环境温度</text>
          <view class="metric-content">
            <text class="metric-value">{{ currentData.temperatureVal }}</text>
            <text class="metric-unit">℃</text>
          </view>
        </view>
        
        <view class="metric-card">
          <text class="metric-label">人体距离</text>
          <view class="metric-content">
            <text class="metric-value">{{ currentData.distanceVal }}</text>
            <text class="metric-unit">cm</text>
          </view>
        </view>
      </view>
      
      <!-- 动态体动监测图表 -->
      <view class="chart-card">
        <view class="chart-header">
          <view class="chart-info">
            <text class="label">体动监测</text>
            <view class="value-box">
              <text class="status" :class="currentData.motionClass">{{ currentData.motion }}</text>
              <text class="divider">|</text>
              <text class="value">幅度 {{ currentData.movementVal }}</text>
            </view>
          </view>
          <view class="legend">
            <view class="item"><view class="dot static"></view>静止</view>
            <view class="item"><view class="dot active"></view>活动</view>
          </view>
        </view>
        
        <view class="chart-body">
          <view class="bar-container">
            <view 
              v-for="(item, index) in movementHistory" 
              :key="index" 
              class="bar-item"
              :style="{ height: getBarHeight(item.val) + '%', backgroundColor: getBarColor(item) }"
            ></view>
          </view>
          <view class="x-axis">
            <text>60s前</text>
            <text>现在</text>
          </view>
        </view>
      </view>
      
    </view>
    
    <view v-else-if="!loading" class="empty-tip">
      <text>暂无实时数据，请等待设备上传...</text>
    </view>
    
    <!-- 状态提示（离线或离床） -->
    <view v-if="isDeviceOffline || isOffBed" class="offline-tip">
      <view class="offline-icon">
        <uni-icons :type="isDeviceOffline ? 'info-filled' : 'minus-filled'" size="48" color="#ff9f43"></uni-icons>
      </view>
      <text class="offline-title">{{ isDeviceOffline ? '设备已离线' : '检测对象已离床' }}</text>
      <text class="offline-desc">{{ isDeviceOffline ? '设备当前不在线，显示最后一次数据' : '当前处于离床状态，监测已暂停' }}</text>
      
      <view v-if="isOffBed" class="refresh-btn" @click="manualRefresh">
        <uni-icons type="refresh" size="16" color="#fff"></uni-icons>
        <text>刷新状态</text>
      </view>
      <text v-else class="offline-desc">数据更新时将自动检测在线状态</text>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading && !currentData" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">获取数据中...</text>
    </view>
  </view>
</template>

<script>
import { getRealTimeData, getDevice } from '@/api/device'

export default {
  data() {
    return {
      productKey: '',
      deviceKey: '',
      deviceId: '', // 设备ID，用于查询设备状态
      currentData: null,
      loading: false,
      timer: null, // 数据刷新定时器
      isDeviceOffline: false, // 设备是否离线
      isOffBed: false, // 是否离床
      lastDataHash: '', // 上次数据的哈希值
      repeatCount: 0, // 数据重复次数
      movementHistory: [], // 存储体动历史数据 {val: number, status: 0|1}
      
      // 心率波形相关
      showHeartWave: false, // 是否显示心率波形
      heartRateHistory: [], // 心率历史数据
      canvasWidth: 0, // canvas宽度
      canvasHeight: 280, // canvas高度
      waveTimer: null, // 波形动画定时器
      waveOffset: 0 // 波形偏移量
    }
  },
  computed: {
    // 最高心率
    maxHeartRate() {
      if (this.heartRateHistory.length === 0) return '-'
      return Math.round(Math.max(...this.heartRateHistory))
    },
    // 最低心率
    minHeartRate() {
      if (this.heartRateHistory.length === 0) return '-'
      return Math.round(Math.min(...this.heartRateHistory))
    },
    // 平均心率
    avgHeartRate() {
      if (this.heartRateHistory.length === 0) return '-'
      const sum = this.heartRateHistory.reduce((a, b) => a + b, 0)
      return Math.round(sum / this.heartRateHistory.length)
    }
  },
  onLoad(options) {
    if (options.productKey && options.deviceKey) {
      this.productKey = options.productKey
      this.deviceKey = options.deviceKey
      if (options.deviceId) {
        this.deviceId = options.deviceId
      }
      this.initData()
    } else {
      uni.showToast({
        title: '参数缺失',
        icon: 'none'
      })
    }
  },
  onShow() {
    this.startAutoRefresh()
  },
  onHide() {
    this.stopAutoRefresh()
  },
  onUnload() {
    this.stopAutoRefresh()
    this.stopWaveAnimation()
  },
  onReady() {
    // 获取canvas宽度
    const query = uni.createSelectorQuery().in(this)
    query.select('.wave-body').boundingClientRect()
    query.exec((res) => {
      if (res[0]) {
        this.canvasWidth = res[0].width
      }
    })
  },
  methods: {
    async initData() {
      this.loading = true
      const data = await this.loadRealTimeData()
      if (data && Object.keys(data).length > 0) {
        this.addMonitorRecord(data)
      }
      this.loading = false
    },
    
    // 启动自动刷新
    startAutoRefresh() {
      // 初始化空的历史数据，占位
      if (this.movementHistory.length === 0) {
        for(let i=0; i<40; i++) {
          this.movementHistory.push({ val: 0, isMoving: false })
        }
      }
      
      this.stopAutoRefresh()
      this.timer = setInterval(() => {
        this.refreshData()
      }, 3000) // 每3秒更新一次数据
    },
    
    stopAutoRefresh() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    async refreshData() {
      // 如果设备离线或离床，不进行数据请求
      if (this.isDeviceOffline || this.isOffBed) {
        return
      }
      
      const data = await this.loadRealTimeData()
      if (data && Object.keys(data).length > 0) {
        // 检查数据是否重复
        await this.checkDataRepetition(data)
        this.addMonitorRecord(data)
      }
    },
    
    // 手动刷新（用于从离床状态恢复）
    async manualRefresh() {
      this.loading = true
      this.isOffBed = false // 先重置离床状态
      const data = await this.loadRealTimeData()
      if (data && Object.keys(data).length > 0) {
        this.addMonitorRecord(data)
        // 如果刷新后是在床，则重新开启自动刷新
        if (!this.isOffBed) {
          this.startAutoRefresh()
        }
      } else {
        // 如果没数据，可能保持原状或提示
        uni.showToast({ title: '未获取到数据', icon: 'none' })
      }
      this.loading = false
    },
    
    // 生成数据哈希值（用于比较数据是否相同）
    generateDataHash(data) {
      // 使用关键字段生成哈希字符串
      const keyFields = ['af', 'ag', 'ac', 'ad', 'ak', 'cf', 'ae']
      return keyFields.map(key => `${key}:${data[key]}`).join('|')
    },
    
    // 检查数据重复
    async checkDataRepetition(data) {
      const currentHash = this.generateDataHash(data)
      
      // 如果数据与上次相同
      if (currentHash === this.lastDataHash) {
        this.repeatCount++
        console.log(`数据重复第${this.repeatCount}次`)
        
        // 连续重复3次，检查设备在线状态
        if (this.repeatCount >= 3) {
          console.log('数据已重复3次，检查设备在线状态')
          await this.checkDeviceOnlineStatus()
          // 重置重复计数
          this.repeatCount = 0
        }
      } else {
        // 数据不同，重置计数
        this.repeatCount = 0
        this.lastDataHash = currentHash
      }
    },
    
    // 检查设备在线状态
    async checkDeviceOnlineStatus() {
      try {
        if (!this.deviceId) {
          console.log('缺少deviceId，无法检查设备状态')
          return
        }
        
        const response = await getDevice(this.deviceId)
        if (response.code === 200 && response.data) {
          const isOnline = response.data.onlineStatus === '1'
          console.log(`设备在线状态: ${isOnline ? '在线' : '离线'}`)
          
          if (!isOnline) {
            // 设备离线，停止数据刷新并显示提示
            this.isDeviceOffline = true
            this.stopAutoRefresh()
            console.log('设备已离线，停止数据请求')
          }
        }
      } catch (error) {
        console.error('检查设备状态失败:', error)
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
          
          // 解析数据逻辑同 fall.vue
          if (typeof response.data === 'string') {
            try {
              const parsedData = JSON.parse(response.data)
              if (parsedData.params && typeof parsedData.params === 'string') {
                realTimeParams = JSON.parse(parsedData.params)
              } else if (parsedData.params) {
                realTimeParams = parsedData.params
              }
            } catch (e) {}
          } else if (response.data && typeof response.data === 'object') {
            if ('params' in response.data) {
               realTimeParams = typeof response.data.params === 'string' ? JSON.parse(response.data.params) : response.data.params
            } else if (response.data.data && response.data.data.params) {
               realTimeParams = typeof response.data.data.params === 'string' ? JSON.parse(response.data.data.params) : response.data.data.params
            } else {
               realTimeParams = response.data
            }
          }
          return realTimeParams
        }
      } catch (error) {
        console.error(error)
      }
      return {}
    },
    
    // 添加一条监测记录
    addMonitorRecord(data) {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      // 字段映射
      const heartRateVal = data.af || '-'
      const breathRateVal = data.ag || '-'
      const distanceVal = data.ac || '-'
      const temperatureVal = data.cf || '-'
      const movementVal = data.ae || '-' // 体动幅度
      
      // 运动状态
      let motion = '-'
      let motionClass = ''
      if (data.ad === 0 || data.ad === '0') {
        motion = '静止'
        motionClass = 'text-gray'
      }
      if (data.ad === 1 || data.ad === '1') {
        motion = '运动'
        motionClass = 'text-active'
      }
      
      // 卧床状态
      let bedStatus = '离床'
      let statusClass = 'status-none'
      if (data.ak === 1 || data.ak === '1' || data.ah === 1 || data.ah === '1') {
        bedStatus = '在床监测中'
        statusClass = 'status-person'
        
        // 如果之前是离床状态，现在变为了在床，可以在这里做处理
        if (this.isOffBed) {
          this.isOffBed = false
          this.startAutoRefresh()
        }
      } else {
        bedStatus = '离床'
        statusClass = 'status-none'
        
        // 检测到离床，停止刷新
        if (!this.isOffBed) {
          this.isOffBed = true
          this.stopAutoRefresh()
          console.log('检测到离床，停止数据刷新')
        }
      }
      
      // 更新当前数据
      this.currentData = {
        time: timeStr,
        heartRateVal,
        breathRateVal,
        distanceVal,
        temperatureVal,
        movementVal,
        motion,
        motionClass,
        bedStatus,
        statusClass
      }
      
      // 更新体动历史数据
      this.updateMovementHistory(data.ae, data.ad)
      
      // 更新心率历史数据（如果波形开启）
      this.updateHeartRateHistory(heartRateVal)
    },
    
    // 更新体动历史图表数据
    updateMovementHistory(val, status) {
      // 确保val是数字
      let numVal = parseInt(val)
      if (isNaN(numVal)) numVal = 0
      
      // 限制最大高度，假设幅度最大为100
      if (numVal > 100) numVal = 100
      
      // 状态转换
      const isMoving = (status === 1 || status === '1')
      
      this.movementHistory.push({
        val: numVal,
        isMoving
      })
      
      // 保持最近30个数据点 (假设5秒刷新一次，30个点就是2.5分钟，或者根据UI宽度调整)
      // 为了看起来像连续动画，这里可以多存一点
      if (this.movementHistory.length > 40) {
        this.movementHistory.shift()
      }
    },
    
    // 计算柱状图高度百分比
    getBarHeight(val) {
      // 基础高度 10%，避免不可见
      return Math.min(val * 2 + 10, 100)
    },
    
    // 获取柱状图颜色
    getBarColor(item) {
      if (item.isMoving) {
        // 活动状态：根据幅度变色
        if (item.val > 50) return '#ff5555' // 剧烈
        return '#ff9f43' // 一般
      }
      // 静止状态
      return '#3ec6c6'
    },
    
    // ========== 心率波形相关方法 ==========
    
    // 切换心率波形显示
    toggleHeartWave() {
      this.showHeartWave = !this.showHeartWave
      
      if (this.showHeartWave) {
        // 显示波形时初始化
        this.$nextTick(() => {
          this.initCanvas()
          this.startWaveAnimation()
        })
      } else {
        // 隐藏波形时停止动画
        this.stopWaveAnimation()
      }
    },
    
    // 初始化canvas
    initCanvas() {
      // 获取canvas实际宽度
      const query = uni.createSelectorQuery().in(this)
      query.select('.wave-body').boundingClientRect()
      query.exec((res) => {
        if (res[0]) {
          this.canvasWidth = res[0].width
          // 初始化心率历史数据
          if (this.heartRateHistory.length === 0) {
            const baseRate = parseInt(this.currentData?.heartRateVal) || 75
            for (let i = 0; i < 100; i++) {
              this.heartRateHistory.push(baseRate + Math.random() * 10 - 5)
            }
          }
          this.drawHeartWave()
        }
      })
    },
    
    // 绘制心率波形
    drawHeartWave() {
      const ctx = uni.createCanvasContext('heartWaveCanvas', this)
      const width = this.canvasWidth
      const height = this.canvasHeight
      const padding = 40 // 左侧留出空间显示Y轴标签
      const chartWidth = width - padding
      
      // 清空画布
      ctx.clearRect(0, 0, width, height)
      
      // 计算心率值范围
      const baseRate = parseInt(this.currentData?.heartRateVal) || 75
      const minRate = Math.max(baseRate - 25, 40) // 最小不低于40
      const maxRate = baseRate + 25
      const rangeRate = maxRate - minRate
      
      // 绘制背景网格和Y轴标签
      ctx.setStrokeStyle('#e8e8e8')
      ctx.setLineWidth(0.5)
      ctx.setFillStyle('#999')
      ctx.setFontSize(10)
      
      // 横向网格线和Y轴标签（心率刻度）
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i
        const heartRateValue = Math.round(maxRate - (rangeRate / 5) * i)
        
        // 绘制网格线
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width, y)
        ctx.stroke()
        
        // 绘制Y轴标签
        ctx.setTextAlign('right')
        ctx.fillText(heartRateValue.toString(), padding - 8, y + 4)
      }
      
      // 纵向网格线（淡化）
      ctx.setStrokeStyle('#f5f5f5')
      for (let i = 0; i <= 8; i++) {
        const x = padding + (chartWidth / 8) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      // 绘制正常心率参考线（60-100 bpm）
      const normalMinY = height - ((60 - minRate) / rangeRate * height * 0.95 + height * 0.025)
      const normalMaxY = height - ((100 - minRate) / rangeRate * height * 0.95 + height * 0.025)
      
      if (normalMinY > 0 && normalMinY < height) {
        ctx.setStrokeStyle('rgba(76, 175, 80, 0.2)')
        ctx.setLineWidth(1)
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(padding, normalMinY)
        ctx.lineTo(width, normalMinY)
        ctx.stroke()
      }
      
      if (normalMaxY > 0 && normalMaxY < height) {
        ctx.setStrokeStyle('rgba(76, 175, 80, 0.2)')
        ctx.beginPath()
        ctx.moveTo(padding, normalMaxY)
        ctx.lineTo(width, normalMaxY)
        ctx.stroke()
      }
      
      ctx.setLineDash([])
      
      // 绘制心率波形
      if (this.heartRateHistory.length > 0) {
        const dataPoints = this.heartRateHistory.length
        const stepX = chartWidth / dataPoints
        
        // 创建渐变填充
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, 'rgba(255, 85, 85, 0.3)')
        gradient.addColorStop(1, 'rgba(255, 85, 85, 0.05)')
        
        // 绘制填充区域
        ctx.beginPath()
        ctx.moveTo(padding, height)
        
        for (let i = 0; i < dataPoints; i++) {
          const rate = this.heartRateHistory[i]
          const x = padding + i * stepX + this.waveOffset
          const normalizedRate = (rate - minRate) / rangeRate
          const y = height - (normalizedRate * height * 0.95 + height * 0.025)
          
          if (i === 0) {
            ctx.lineTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.lineTo(padding + (dataPoints - 1) * stepX + this.waveOffset, height)
        ctx.closePath()
        ctx.setFillStyle(gradient)
        ctx.fill()
        
        // 绘制波形线
        ctx.setStrokeStyle('#ff5555')
        ctx.setLineWidth(2.5)
        ctx.setLineCap('round')
        ctx.setLineJoin('round')
        ctx.setShadow(0, 2, 4, 'rgba(255, 85, 85, 0.3)')
        
        ctx.beginPath()
        
        for (let i = 0; i < dataPoints; i++) {
          const rate = this.heartRateHistory[i]
          const x = padding + i * stepX + this.waveOffset
          const normalizedRate = (rate - minRate) / rangeRate
          const y = height - (normalizedRate * height * 0.95 + height * 0.025)
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.stroke()
        ctx.setShadow(0, 0, 0, 'transparent')
        
        // 绘制心跳峰值标记（带脉冲效果）
        const currentRate = this.heartRateHistory[this.heartRateHistory.length - 1]
        const normalizedCurrent = (currentRate - minRate) / rangeRate
        const currentY = height - (normalizedCurrent * height * 0.95 + height * 0.025)
        const currentX = padding + (dataPoints - 1) * stepX + this.waveOffset
        
        // 外圈（脉冲效果）
        ctx.setFillStyle('rgba(255, 85, 85, 0.2)')
        ctx.beginPath()
        ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI)
        ctx.fill()
        
        // 内圈
        ctx.setFillStyle('#ff5555')
        ctx.beginPath()
        ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI)
        ctx.fill()
        
        // 中心点
        ctx.setFillStyle('#fff')
        ctx.beginPath()
        ctx.arc(currentX, currentY, 2, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      ctx.draw()
    },
    
    // 开始波形动画
    startWaveAnimation() {
      this.stopWaveAnimation()
      
      this.waveTimer = setInterval(() => {
        // 更新心率历史数据
        const baseRate = parseInt(this.currentData?.heartRateVal) || 75
        const newRate = baseRate + Math.random() * 10 - 5
        
        this.heartRateHistory.push(newRate)
        if (this.heartRateHistory.length > 100) {
          this.heartRateHistory.shift()
        }
        
        // 更新偏移量实现滚动效果
        this.waveOffset -= 2
        if (this.waveOffset < -this.canvasWidth / 100) {
          this.waveOffset = 0
        }
        
        this.drawHeartWave()
      }, 50) // 每50ms更新一次，实现流畅动画
    },
    
    // 停止波形动画
    stopWaveAnimation() {
      if (this.waveTimer) {
        clearInterval(this.waveTimer)
        this.waveTimer = null
      }
    },
    
    // 更新心率历史数据（在数据刷新时调用）
    updateHeartRateHistory(heartRate) {
      if (this.showHeartWave && heartRate && heartRate !== '-') {
        const rate = parseInt(heartRate)
        if (!isNaN(rate)) {
          this.heartRateHistory.push(rate)
          if (this.heartRateHistory.length > 100) {
            this.heartRateHistory.shift()
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detection-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 32rpx 24rpx; /* 调整左右内边距 */
  box-sizing: border-box;
}

.report-container {
  display: flex;
  flex-direction: column;
  /* gap: 24rpx; 移除gap，改用margin控制 */
}

/* 头部状态 */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx; /* 增加间距 */
  padding: 0 8rpx;
  
  .time-badge {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.6); /* 半透明背景 */
    padding: 8rpx 20rpx;
    border-radius: 32rpx;
    border: 1rpx solid rgba(0, 0, 0, 0.05);
    
    .time-text {
      font-size: 24rpx;
      color: #666;
      margin-left: 8rpx;
      font-family: monospace; /* 等宽字体显示时间更整齐 */
    }
  }
  
  .status-badge {
    padding: 10rpx 32rpx;
    border-radius: 32rpx;
    font-size: 26rpx;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3); /* 优化阴影颜色 */
    letter-spacing: 2rpx;
    
    &.status-person {
      background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
    }
    
    &.status-none {
      background: #909399;
      box-shadow: 0 4rpx 12rpx rgba(144, 147, 153, 0.3);
    }
  }
}

/* 核心数据卡片 */
.core-data-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx; /* 增加垂直内边距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 32rpx;
  
  .data-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .icon-wrapper {
      width: 96rpx; /* 加大图标区域 */
      height: 96rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.heart-bg {
        background: linear-gradient(135deg, rgba(255, 85, 85, 0.1), rgba(255, 85, 85, 0.05));
        
        &:active {
          transform: scale(0.95);
          background: linear-gradient(135deg, rgba(255, 85, 85, 0.2), rgba(255, 85, 85, 0.1));
        }
      }
      
      &.breath-bg {
        background: linear-gradient(135deg, rgba(62, 198, 198, 0.1), rgba(62, 198, 198, 0.05));
      }
    }
    
    .value-group {
      display: flex;
      align-items: baseline;
      margin-bottom: 8rpx;
      
      .value {
        font-size: 56rpx; /* 加大数值字体 */
        font-weight: bold;
        color: #333;
        line-height: 1;
        font-family: 'DIN', sans-serif; /* 如果有数字字体 */
      }
      
      .unit {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
        font-weight: normal;
      }
    }
    
    .label {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .divider-vertical {
    width: 2rpx;
    height: 100rpx;
    background: #f5f5f5;
    margin: 0 40rpx;
  }
}

/* 详细指标 */
.metrics-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin: 0 0 24rpx 8rpx;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
  
  .metric-card {
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 160rpx;
    
    .metric-label {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
    
    .metric-content {
      display: flex;
      align-items: baseline;
      
      .metric-value {
        font-size: 44rpx; /* 加大数值字体 */
        font-weight: bold;
        color: #333;
      }
      
      .metric-unit {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
      }
    }
  }
}

/* 动态图表卡片 */
.chart-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.03);
  margin-top: 24rpx;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40rpx;
    
    .chart-info {
      display: flex;
      flex-direction: column;
      
      .label {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
        margin-bottom: 12rpx;
      }
      
      .value-box {
        display: flex;
        align-items: center;
        
        .status {
          font-size: 28rpx;
          font-weight: 600;
          
          &.text-active { color: #ff9f43; }
          &.text-gray { color: #3ec6c6; }
        }
        
        .divider {
          margin: 0 16rpx;
          color: #eee;
          font-size: 24rpx;
        }
        
        .value {
          font-size: 28rpx;
          color: #666;
        }
      }
    }
    
    .legend {
      display: flex;
      gap: 24rpx;
      margin-top: 8rpx;
      
      .item {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #999;
        
        .dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          margin-right: 8rpx;
          
          &.static { background: #3ec6c6; }
          &.active { background: #ff9f43; }
        }
      }
    }
  }
  
  .chart-body {
    height: 200rpx;
    display: flex;
    flex-direction: column;
    
    .bar-container {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      gap: 8rpx;
      border-bottom: 2rpx solid #f5f5f5;
      padding-bottom: 8rpx;
      overflow: hidden;
      
      .bar-item {
        flex: 1;
        max-width: 16rpx;
        min-height: 8rpx;
        border-radius: 6rpx 6rpx 0 0;
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        opacity: 0.9;
        
        &:hover {
            opacity: 1;
            transform: scaleY(1.1);
        }
      }
    }
    
    .x-axis {
      display: flex;
      justify-content: space-between;
      margin-top: 16rpx;
      
      text {
        font-size: 24rpx;
        color: #ccc;
      }
    }
  }
}

.empty-tip {
  margin-top: 200rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* 设备离线提示 */
.offline-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 32rpx;
  padding: 64rpx 48rpx;
  box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 9998;
  min-width: 480rpx;
  
  .offline-icon {
    margin-bottom: 24rpx;
  }
  
  .offline-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .offline-desc {
    font-size: 26rpx;
    color: #999;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 8rpx;
    
    &:last-child {
      margin-bottom: 0;
      color: #3ec6c6;
    }
  }
  
  .refresh-btn {
    margin-top: 24rpx;
    background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
    padding: 16rpx 48rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
    
    text {
      color: #fff;
      font-size: 28rpx;
      font-weight: 500;
    }
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
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

/* 心率波形卡片 */
.wave-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 32rpx;
  animation: slideDown 0.3s ease;
  
  .wave-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24rpx;
    
    .wave-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      
      .wave-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .wave-stats {
        display: flex;
        align-items: center;
        gap: 16rpx;
        flex-wrap: wrap;
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4rpx;
          
          .stat-label {
            font-size: 22rpx;
            color: #999;
          }
          
          .stat-value {
            font-size: 28rpx;
            font-weight: bold;
            font-family: 'DIN', monospace;
            
            &.current {
              color: #ff5555;
              font-size: 32rpx;
            }
            
            &.high {
              color: #ff9f43;
            }
            
            &.low {
              color: #3ec6c6;
            }
            
            &.avg {
              color: #909399;
            }
          }
        }
        
        .stat-divider {
          width: 1rpx;
          height: 32rpx;
          background: #e8e8e8;
        }
      }
    }
    
    .wave-close {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
      
      &:active {
        transform: scale(0.9);
        background: #ebebeb;
      }
    }
  }
  
  .wave-container {
    width: 100%;
    
    .wave-body {
      width: 100%;
      height: 280rpx;
      background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      border: 1rpx solid #f0f0f0;
      
      .wave-canvas {
        width: 100%;
        height: 100%;
      }
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>