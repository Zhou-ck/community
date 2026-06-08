<template>
  <view class="watch-health-page">
    <!-- 设备状态卡片 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-line"></view>
          <text class="section-title">设备状态</text>
        </view>
        <view class="update-time" v-if="realtimeData.dataTime">{{ realtimeData.dataTime }}</view>
      </view>
      <view class="status-grid">
        <view class="status-item">
          <view class="status-icon" style="background: #E07A4F;">
            <uni-icons type="gear" size="18" color="#fff"></uni-icons>
          </view>
          <view class="status-info">
            <text class="status-label">电量</text>
            <text class="status-value">{{ getRealtimeValue('battery') }}</text>
          </view>
        </view>
        <view class="status-item">
          <view class="status-icon" style="background: #fac858;">
            <uni-icons type="notification" size="18" color="#fff"></uni-icons>
          </view>
          <view class="status-info">
            <text class="status-label">信号</text>
            <text class="status-value">{{ getRealtimeValue('signal') }}</text>
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
            <uni-icons type="navigate" size="20" color="#fff"></uni-icons>
          </view>
          <text class="sport-value">{{ getRealtimeValue('steps') }}</text>
          <text class="sport-label">步数</text>
        </view>
        <view class="sport-item">
          <view class="sport-icon" style="background: #a29bfe;">
            <uni-icons type="location" size="20" color="#fff"></uni-icons>
          </view>
          <text class="sport-value">{{ getRealtimeValue('distance') }}</text>
          <text class="sport-label">距离</text>
        </view>
        <view class="sport-item">
          <view class="sport-icon" style="background: #fdcb6e;">
            <uni-icons type="fire" size="20" color="#fff"></uni-icons>
          </view>
          <text class="sport-value">{{ getRealtimeValue('calorie') }}</text>
          <text class="sport-label">卡路里</text>
        </view>
      </view>
    </view>

    <!-- 健康数据卡片 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-line"></view>
          <text class="section-title">健康数据</text>
        </view>
      </view>
      <view class="health-grid">
        <view class="health-item" v-for="item in healthDataList" :key="item.type">
          <view class="health-icon" :style="{ background: item.color }">
            <uni-icons :type="item.icon" size="20" color="#fff"></uni-icons>
          </view>
          <view class="health-info">
            <text class="health-label">{{ item.label }}</text>
            <text class="health-value">{{ item.value }}</text>
            <text class="health-time" v-if="item.time !== '--'">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 运动数据图表 -->
    <view class="chart-section">
      <view class="chart-header">
        <view class="section-title">运动数据</view>
        <picker mode="date" :value="pedoDate" @change="onPedoDateChange">
          <view class="chart-date">
            <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
            <text>{{ pedoDate }}</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <view v-if="!pedoChartData.categories || pedoChartData.categories.length === 0" class="empty-chart">
          <uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
          <text class="empty-text">暂无运动数据</text>
        </view>
        <qiun-data-charts 
          v-else
          type="area" 
          :opts="pedoChartOpts" 
          :chartData="pedoChartData"
          :canvas2d="true"
          :ontouch="true"
        />
      </view>
    </view>

    <!-- 心率数据图表 -->
    <view class="chart-section">
      <view class="chart-header">
        <view class="section-title">心率数据</view>
        <picker mode="date" :value="hrDate" @change="onHrDateChange">
          <view class="chart-date">
            <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
            <text>{{ hrDate }}</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <view v-if="!hrChartData.categories || hrChartData.categories.length === 0" class="empty-chart">
          <uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
          <text class="empty-text">暂无心率数据</text>
        </view>
        <qiun-data-charts 
          v-else
          type="line" 
          :opts="hrChartOpts" 
          :chartData="hrChartData"
          :canvas2d="true"
          :ontouch="true"
        />
      </view>
    </view>

    <!-- 血氧数据图表 -->
    <view class="chart-section">
      <view class="chart-header">
        <view class="section-title">血氧数据</view>
        <picker mode="date" :value="boxyDate" @change="onBoxyDateChange">
          <view class="chart-date">
            <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
            <text>{{ boxyDate }}</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <view v-if="!boxyChartData.categories || boxyChartData.categories.length === 0" class="empty-chart">
          <uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
          <text class="empty-text">暂无血氧数据</text>
        </view>
        <qiun-data-charts 
          v-else
          type="column" 
          :opts="boxyChartOpts" 
          :chartData="boxyChartData"
          :canvas2d="true"
          :ontouch="true"
        />
      </view>
    </view>

    <!-- 血压数据图表 -->
    <view class="chart-section">
      <view class="chart-header">
        <view class="section-title">血压数据</view>
        <picker mode="date" :value="bpDate" @change="onBpDateChange">
          <view class="chart-date">
            <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
            <text>{{ bpDate }}</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <view v-if="!bpChartData.categories || bpChartData.categories.length === 0" class="empty-chart">
          <uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
          <text class="empty-text">暂无血压数据</text>
        </view>
        <qiun-data-charts 
          v-else
          type="line" 
          :opts="bpChartOpts" 
          :chartData="bpChartData"
          :canvas2d="true"
          :ontouch="true"
        />
      </view>
    </view>

    <!-- 压力数据图表 -->
    <view class="chart-section">
      <view class="chart-header">
        <view class="section-title">压力数据</view>
        <picker mode="date" :value="hrvDate" @change="onHrvDateChange">
          <view class="chart-date">
            <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
            <text>{{ hrvDate }}</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <view v-if="!hrvChartData.categories || hrvChartData.categories.length === 0" class="empty-chart">
          <uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
          <text class="empty-text">暂无压力数据</text>
        </view>
        <qiun-data-charts 
          v-else
          type="area" 
          :opts="hrvChartOpts" 
          :chartData="hrvChartData"
          :canvas2d="true"
          :ontouch="true"
        />
      </view>
    </view>

    <!-- 体温数据图表 -->
    <view class="chart-section">
      <view class="chart-header">
        <view class="section-title">体温数据</view>
        <picker mode="date" :value="tempDate" @change="onTempDateChange">
          <view class="chart-date">
            <uni-icons type="calendar" size="16" color="#E07A4F"></uni-icons>
            <text>{{ tempDate }}</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <view v-if="!tempChartData.categories || tempChartData.categories.length === 0" class="empty-chart">
          <uni-icons type="info-filled" size="40" color="#ccc"></uni-icons>
          <text class="empty-text">暂无体温数据</text>
        </view>
        <qiun-data-charts 
          v-else
          type="line" 
          :opts="tempChartOpts" 
          :chartData="tempChartData"
          :canvas2d="true"
          :ontouch="true"
        />
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#E07A4F"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { getIwownDeviceRealtime } from '@/api/device'
import { listIwownHealthyData } from '@/api/iwownHealthyData'
import qiunDataCharts from '@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue'

export default {
  components: {
    qiunDataCharts
  },
  data() {
    return {
      imei: '',
      deviceId: '',
      deviceAlias: '',
      loading: false,
      isFirstShow: true, // 标记是否首次显示
      // 每个图表独立的日期
      pedoDate: '',
      hrDate: '',
      boxyDate: '',
      bpDate: '',
      hrvDate: '',
      tempDate: '',
      // 实时数据
      realtimeData: {},
      realtimeDataList: [
        { type: 'battery', label: '电量', value: '--' },
        { type: 'signal', label: '信号', value: '--' },
        { type: 'steps', label: '步数', value: '--' },
        { type: 'distance', label: '距离', value: '--' },
        { type: 'calorie', label: '卡路里', value: '--' }
      ],
      // 健康数据
      healthDataList: [
        { type: 'hr', label: '心率', value: '--', time: '--', icon: 'heart', color: '#ff6b6b' },
        { type: 'boxy', label: '血氧', value: '--', time: '--', icon: 'circle', color: '#E07A4F' },
        { type: 'bp', label: '血压', value: '--', time: '--', icon: 'fire-filled', color: '#91cc75' },
        { type: 'hrv', label: '压力', value: '--', time: '--', icon: 'pulldown', color: '#fac858' },
        { type: 'temp', label: '体温', value: '--', time: '--', icon: 'compose', color: '#a29bfe' }
      ],
      // 图表数据
      pedoChartData: {},
      hrChartData: {},
      boxyChartData: {},
      bpChartData: {},
      hrvChartData: {},
      tempChartData: {},
      // 图表配置
      pedoChartOpts: {
        color: ['#5470c6', '#91cc75', '#fac858'],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          itemCount: 6,
          scrollShow: true,
          scrollAlign: 'left'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5
        },
        dataLabel: false,
        extra: {
          area: {
            type: 'curve',
            opacity: 0.2,
            addLine: true,
            width: 2
          }
        }
      },
      hrChartOpts: {
        color: ['#ee6666', '#fc8452', '#73c0de'],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          itemCount: 6,
          scrollShow: true,
          scrollAlign: 'left'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5
        },
        dataLabel: false,
        extra: {
          line: {
            type: 'curve',
            width: 2
          }
        }
      },
      boxyChartOpts: {
        color: ['#188df0'],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        xAxis: {
          disableGrid: true,
          itemCount: 6,
          scrollShow: true,
          scrollAlign: 'left'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5
        },
        dataLabel: false,
        extra: {
          column: {
            width: 15
          }
        }
      },
      bpChartOpts: {
        color: ['#f56c6c', '#409eff'],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          itemCount: 6,
          scrollShow: true,
          scrollAlign: 'left'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5
        },
        dataLabel: false,
        extra: {
          line: {
            type: 'curve',
            width: 2
          }
        }
      },
      hrvChartOpts: {
        color: ['#ff6b6b', '#4ecdc4'],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          itemCount: 6,
          scrollShow: true,
          scrollAlign: 'left'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5
        },
        dataLabel: false,
        extra: {
          area: {
            type: 'curve',
            opacity: 0.2,
            addLine: true,
            width: 2
          }
        }
      },
      tempChartOpts: {
        color: ['#ff7675', '#74b9ff'],
        padding: [15, 15, 0, 15],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          itemCount: 6,
          scrollShow: true,
          scrollAlign: 'left'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5
        },
        dataLabel: false,
        extra: {
          line: {
            type: 'curve',
            width: 2
          }
        }
      }
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
    
    // 默认选择今天
    const today = this.formatDate(new Date())
    this.pedoDate = today
    this.hrDate = today
    this.boxyDate = today
    this.bpDate = today
    this.hrvDate = today
    this.tempDate = today
    this.loadAllData()
  },
  
  onShow() {
    // 从后台返回前台时重新渲染图表（仅在非首次显示时）
    if (!this.isFirstShow) {
      this.$nextTick(() => {
        this.refreshCharts()
      })
    }
    this.isFirstShow = false
  },
  
  onPullDownRefresh() {
    this.loadAllData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    // 日期变更处理
    onPedoDateChange(e) {
      this.pedoDate = e.detail.value
      this.loadPedoData()
    },
    onHrDateChange(e) {
      this.hrDate = e.detail.value
      this.loadHrData()
    },
    onBoxyDateChange(e) {
      this.boxyDate = e.detail.value
      this.loadBoxyData()
    },
    onBpDateChange(e) {
      this.bpDate = e.detail.value
      this.loadBpData()
    },
    onHrvDateChange(e) {
      this.hrvDate = e.detail.value
      this.loadHrvData()
    },
    onTempDateChange(e) {
      this.tempDate = e.detail.value
      this.loadTempData()
    },
    
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadHealthData()
    },
    
    async loadAllData() {
      await Promise.all([
        this.loadRealtimeData(),
        this.loadLatestData(),
        this.loadHealthData()
      ])
    },
    
    // 刷新所有图表
    refreshCharts() {
      // 通过重新赋值触发图表更新
      const pedoData = this.pedoChartData
      const hrData = this.hrChartData
      const boxyData = this.boxyChartData
      const bpData = this.bpChartData
      const hrvData = this.hrvChartData
      const tempData = this.tempChartData
      
      this.pedoChartData = {}
      this.hrChartData = {}
      this.boxyChartData = {}
      this.bpChartData = {}
      this.hrvChartData = {}
      this.tempChartData = {}
      
      this.$nextTick(() => {
        this.pedoChartData = pedoData
        this.hrChartData = hrData
        this.boxyChartData = boxyData
        this.bpChartData = bpData
        this.hrvChartData = hrvData
        this.tempChartData = tempData
      })
    },
    
    // 加载实时数据
    async loadRealtimeData() {
      try {
        const res = await getIwownDeviceRealtime(this.imei)
        if (res.code === 200 && res.data) {
          this.realtimeData = res.data
          this.updateRealtimeData('battery', `${res.data.battery || '--'}%`)
          this.updateRealtimeData('signal', res.data.rssi || '--')
          this.updateRealtimeData('steps', res.data.steps || 0)
          this.updateRealtimeData('distance', this.formatDistance(res.data.distance))
          this.updateRealtimeData('calorie', this.formatCalorie(res.data.calorie))
        }
      } catch (error) {
        console.error('加载实时数据失败:', error)
      }
    },
    
    // 加载最新健康数据
    async loadLatestData() {
      try {
        const today = this.formatDate(new Date())
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataTime: today,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows) {
          const dataByType = {}
          res.rows.forEach(item => {
            if (!dataByType[item.dataType]) {
              dataByType[item.dataType] = []
            }
            dataByType[item.dataType].push(item)
          })
          
          // 处理心率
          if (dataByType['hr_data'] && dataByType['hr_data'].length > 0) {
            let totalAvgBpm = 0
            let count = 0
            let latestTime = ''
            dataByType['hr_data'].forEach(item => {
              const value = JSON.parse(item.value)
              if (value.avgBpm) {
                totalAvgBpm += value.avgBpm
                count++
              }
              latestTime = this.formatTime(new Date(item.timestamp))
            })
            const avgBpm = count > 0 ? Math.round(totalAvgBpm / count) : 0
            this.updateLatestData('hr', `${avgBpm} bpm`, latestTime)
          }
          
          // 处理血氧
          if (dataByType['boxy_data'] && dataByType['boxy_data'].length > 0) {
            const latest = dataByType['boxy_data'][dataByType['boxy_data'].length - 1]
            const value = JSON.parse(latest.value)
            const time = this.formatTime(new Date(latest.timestamp))
            this.updateLatestData('boxy', `${value.avgOxy || 0}%`, time)
          }
          
          // 处理血压
          if (dataByType['bp_data'] && dataByType['bp_data'].length > 0) {
            const latest = dataByType['bp_data'][dataByType['bp_data'].length - 1]
            const value = JSON.parse(latest.value)
            const time = this.formatTime(new Date(latest.timestamp))
            this.updateLatestData('bp', `${value.sbp}/${value.dbp}`, time)
          }
          
          // 处理压力
          if (dataByType['hrv_data'] && dataByType['hrv_data'].length > 0) {
            const latest = dataByType['hrv_data'][dataByType['hrv_data'].length - 1]
            const value = JSON.parse(latest.value)
            const time = this.formatTime(new Date(latest.timestamp))
            this.updateLatestData('hrv', `疲劳度 ${value.fatigue || 0}`, time)
          }
          
          // 处理体温
          if (dataByType['temperature_data'] && dataByType['temperature_data'].length > 0) {
            const latest = dataByType['temperature_data'][dataByType['temperature_data'].length - 1]
            const value = JSON.parse(latest.value)
            const time = this.formatTime(new Date(latest.timestamp))
            const temp = value.estiArm ? value.estiArm.toFixed(1) : 
                        value.eviBody ? (value.eviBody / 100).toFixed(1) : '--'
            this.updateLatestData('temp', `${temp}°C`, time)
          }
        }
      } catch (error) {
        console.error('加载最新数据失败:', error)
      }
    },
    
    // 加载健康数据
    async loadHealthData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadPedoData(),
          this.loadHrData(),
          this.loadBoxyData(),
          this.loadBpData(),
          this.loadHrvData(),
          this.loadTempData()
        ])
      } catch (error) {
        console.error('加载健康数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 加载运动数据
    async loadPedoData() {
      try {
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'pedo_data',
          dataTime: this.pedoDate,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          // 对数据进行采样
          const sampledRows = this.sampleData(res.rows, 30)
          
          const categories = []
          const stepData = []
          const calorieData = []
          const distanceData = []
          
          sampledRows.forEach(item => {
            const value = JSON.parse(item.value)
            categories.push(this.formatTime(new Date(item.timestamp)))
            stepData.push(value.step || 0)
            calorieData.push(value.calorie || 0)
            distanceData.push(value.distance || 0)
          })
          
          this.pedoChartData = {
            categories: categories,
            series: [
              { name: '步数', data: stepData },
              { name: '卡路里', data: calorieData },
              { name: '距离(m)', data: distanceData }
            ]
          }
        } else {
          this.pedoChartData = { categories: [], series: [] }
        }
      } catch (error) {
        console.error('加载运动数据失败:', error)
        this.pedoChartData = { categories: [], series: [] }
      }
    },
    
    // 加载心率数据
    async loadHrData() {
      try {
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'hr_data',
          dataTime: this.hrDate,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          // 对数据进行采样
          const sampledRows = this.sampleData(res.rows, 30)
          
          const categories = []
          const avgData = []
          const maxData = []
          const minData = []
          
          sampledRows.forEach(item => {
            const value = JSON.parse(item.value)
            categories.push(this.formatTime(new Date(item.timestamp)))
            avgData.push(value.avgBpm || 0)
            maxData.push(value.maxBpm || 0)
            minData.push(value.minBpm || 0)
          })
          
          this.hrChartData = {
            categories: categories,
            series: [
              { name: '平均心率', data: avgData },
              { name: '最高心率', data: maxData },
              { name: '最低心率', data: minData }
            ]
          }
        } else {
          this.hrChartData = { categories: [], series: [] }
        }
      } catch (error) {
        console.error('加载心率数据失败:', error)
        this.hrChartData = { categories: [], series: [] }
      }
    },
    
    // 加载血氧数据
    async loadBoxyData() {
      try {
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'boxy_data',
          dataTime: this.boxyDate,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          // 对数据进行采样
          const sampledRows = this.sampleData(res.rows, 30)
          
          const categories = []
          const oxyData = []
          
          sampledRows.forEach(item => {
            const value = JSON.parse(item.value)
            categories.push(this.formatTime(new Date(item.timestamp)))
            oxyData.push(value.avgOxy || 0)
          })
          
          this.boxyChartData = {
            categories: categories,
            series: [{ name: '血氧', data: oxyData }]
          }
        } else {
          this.boxyChartData = { categories: [], series: [] }
        }
      } catch (error) {
        console.error('加载血氧数据失败:', error)
        this.boxyChartData = { categories: [], series: [] }
      }
    },
    
    // 加载血压数据
    async loadBpData() {
      try {
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'bp_data',
          dataTime: this.bpDate,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          // 对数据进行采样
          const sampledRows = this.sampleData(res.rows, 30)
          
          const categories = []
          const sbpData = []
          const dbpData = []
          
          sampledRows.forEach(item => {
            const value = JSON.parse(item.value)
            categories.push(this.formatTime(new Date(item.timestamp)))
            sbpData.push(value.sbp || 0)
            dbpData.push(value.dbp || 0)
          })
          
          this.bpChartData = {
            categories: categories,
            series: [
              { name: '收缩压', data: sbpData },
              { name: '舒张压', data: dbpData }
            ]
          }
        } else {
          this.bpChartData = { categories: [], series: [] }
        }
      } catch (error) {
        console.error('加载血压数据失败:', error)
        this.bpChartData = { categories: [], series: [] }
      }
    },
    
    // 加载压力数据
    async loadHrvData() {
      try {
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'hrv_data',
          dataTime: this.hrvDate,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          // 对数据进行采样
          const sampledRows = this.sampleData(res.rows, 30)
          
          const categories = []
          const fatigueData = []
          const rmssdData = []
          
          sampledRows.forEach(item => {
            const value = JSON.parse(item.value)
            categories.push(this.formatTime(new Date(item.timestamp)))
            fatigueData.push(value.fatigue || 0)
            rmssdData.push(value.rmssd || 0)
          })
          
          this.hrvChartData = {
            categories: categories,
            series: [
              { name: '疲劳度', data: fatigueData },
              { name: 'RMSSD', data: rmssdData }
            ]
          }
        } else {
          this.hrvChartData = { categories: [], series: [] }
        }
      } catch (error) {
        console.error('加载压力数据失败:', error)
        this.hrvChartData = { categories: [], series: [] }
      }
    },
    
    // 加载体温数据
    async loadTempData() {
      try {
        const res = await listIwownHealthyData({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'temperature_data',
          dataTime: this.tempDate,
          pageNum: 1,
          pageSize: 1000
        })
        
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          // 对数据进行采样
          const sampledRows = this.sampleData(res.rows, 30)
          
          const categories = []
          const tempData = []
          const shellTempData = []
          let hasShellTemp = false
          
          sampledRows.forEach(item => {
            const value = JSON.parse(item.value)
            categories.push(this.formatTime(new Date(item.timestamp)))
            const temp = value.estiArm ? value.estiArm : 
                        value.eviBody ? (value.eviBody / 100) : 0
            tempData.push(parseFloat(temp.toFixed(1)))
            
            if (value.shellTemp) {
              shellTempData.push(parseFloat(value.shellTemp.toFixed(1)))
              hasShellTemp = true
            } else {
              shellTempData.push(0)
            }
          })
          
          const series = [{ name: '体温', data: tempData }]
          if (hasShellTemp) {
            series.push({ name: '皮肤温度', data: shellTempData })
          }
          
          this.tempChartData = {
            categories: categories,
            series: series
          }
        } else {
          this.tempChartData = { categories: [], series: [] }
        }
      } catch (error) {
        console.error('加载体温数据失败:', error)
        this.tempChartData = { categories: [], series: [] }
      }
    },
    
    updateRealtimeData(type, value) {
      const item = this.realtimeDataList.find(i => i.type === type)
      if (item) {
        item.value = value
      }
    },
    
    getRealtimeValue(type) {
      const item = this.realtimeDataList.find(i => i.type === type)
      return item ? item.value : '--'
    },
    
    updateLatestData(type, value, time) {
      const item = this.healthDataList.find(i => i.type === type)
      if (item) {
        item.value = value
        item.time = time
      }
    },
    
    formatDistance(distance) {
      if (!distance) return '0 m'
      const meters = distance / 10
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`
      }
      return `${meters} m`
    },
    
    formatCalorie(calorie) {
      if (!calorie) return '0 kcal'
      return `${(calorie / 10)} kcal`
    },
    
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    formatTime(date) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    // 数据采样 - 当数据点过多时进行采样
    sampleData(data, maxPoints = 30) {
      if (data.length <= maxPoints) {
        return data
      }
      
      const step = Math.ceil(data.length / maxPoints)
      const sampled = []
      
      for (let i = 0; i < data.length; i += step) {
        sampled.push(data[i])
      }
      
      return sampled
    }
  }
}
</script>

<style lang="scss" scoped>
.watch-health-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24rpx;
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
  background: #E07A4F;
  border-radius: 3rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.update-time {
  font-size: 22rpx;
  color: #999;
  background: #f5f6fa;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
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
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.status-label {
  font-size: 24rpx;
  color: #999;
}

.status-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
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

.sport-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.sport-label {
  font-size: 24rpx;
  color: #999;
}

/* 健康数据网格 */
.health-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  
  &:last-child:nth-child(odd) {
    grid-column: span 2;
  }
}

.health-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.health-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.health-label {
  font-size: 24rpx;
  color: #999;
}

.health-value {
  font-size: 30rpx;
  font-weight: 700;
  color: #333;
}

.health-time {
  font-size: 20rpx;
  color: #bbb;
}

.chart-section {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }
  
  .section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    &::before {
      content: '';
      width: 6rpx;
      height: 28rpx;
      background: #E07A4F;
      border-radius: 3rpx;
    }
  }
  
  .chart-date {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #E07A4F;
    font-weight: 500;
    padding: 10rpx 20rpx;
    background: rgba(224, 122, 79, 0.1);
    border-radius: 24rpx;
    
    &:active {
      background: rgba(224, 122, 79, 0.2);
    }
  }
}

.chart-container {
  width: 100%;
  height: 600rpx;
  position: relative;
}

.empty-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 26rpx;
    color: #666;
    font-weight: 500;
  }
}
</style>
