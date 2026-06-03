<template>
  <view class="sleep-report-container">
    <!-- 头部信息 -->
    <view class="header-card">
      <view class="header-content">
        <view class="device-info">
          <text class="device-title">{{ deviceAlias || '设备' }} - 睡眠报告</text>
          <text class="device-id">设备ID: {{ imei }}</text>
        </view>
        
        <!-- 日期选择器 -->
        <view class="date-selector">
          <view class="date-btn" @click="prevDay">
            <uni-icons type="left" size="20" color="#fff"></uni-icons>
          </view>
          <picker mode="date" :value="selectedDate" @change="onDateChange">
            <view class="date-display">{{ selectedDate }}</view>
          </picker>
          <view class="date-btn" @click="nextDay">
            <uni-icons type="right" size="20" color="#fff"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-wrapper">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 无数据提示 -->
    <view v-if="!loading && !sleepData" class="empty-wrapper">
      <text class="iconfontA icon-zanwushuju empty-icon"></text>
      <text class="empty-text">暂无睡眠数据</text>
    </view>

    <!-- 睡眠数据展示 -->
    <view v-if="sleepData" class="content-wrapper">
      <!-- 睡眠概览卡片 -->
      <view class="overview-cards">
        <view class="stat-card">
          <view class="stat-icon sleep-time">
            <uni-icons type="compose" size="24" color="#fff"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-label">总睡眠时长</text>
            <text class="stat-value">{{ formatMinutes(sleepData.totalSleepTime) }}</text>
          </view>
        </view>
        
        <view class="stat-card">
          <view class="stat-icon deep-sleep">
            <uni-icons type="star" size="24" color="#fff"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-label">深睡时长</text>
            <text class="stat-value">{{ formatMinutes(sleepData.deepSleepTime) }}</text>
          </view>
        </view>
        
        <view class="stat-card">
          <view class="stat-icon light-sleep">
            <uni-icons type="circle" size="24" color="#fff"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-label">浅睡时长</text>
            <text class="stat-value">{{ formatMinutes(sleepData.lightSleepTime) }}</text>
          </view>
        </view>
        
        <view class="stat-card">
          <view class="stat-icon quality-score">
            <uni-icons type="medal" size="24" color="#fff"></uni-icons>
          </view>
          <view class="stat-content">
            <text class="stat-label">睡眠评分</text>
            <text class="stat-value">{{ (apiData && apiData.score) || sleepData.sleepQualityScore }}</text>
          </view>
        </view>
      </view>

      <!-- 睡眠阶段图 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠阶段图</text>
        </view>
        <SleepStageChart 
          v-if="apiData && apiData.sections"
          :sections="apiData.sections"
          :sleep-start-time="sleepData.sleepStartTime"
          :sleep-end-time="sleepData.sleepEndTime"
        />
        <view v-else class="empty-chart">
          <text>暂无睡眠阶段数据</text>
        </view>
      </view>

      <!-- 睡眠阶段分布圆环图 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠阶段分布</text>
        </view>
        <view class="chart-container ring-chart">
          <qiun-data-charts 
            v-if="pieChartData.series && pieChartData.series.length > 0"
            type="ring"
            :opts="pieChartOpts"
            :chartData="pieChartData"
            :canvas2d="true"
          />
          <view v-else class="empty-chart">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">详细信息</text>
        </view>
        <view class="detail-info">
          <view class="info-item">
            <text class="label">入睡时间：</text>
            <text class="value">{{ sleepData.sleepStartTime }}</text>
          </view>
          <view class="info-item">
            <text class="label">起床时间：</text>
            <text class="value">{{ sleepData.sleepEndTime }}</text>
          </view>
          <view class="info-item">
            <text class="label">深睡时长：</text>
            <text class="value">{{ formatMinutes(sleepData.deepSleepTime) }}</text>
          </view>
          <view class="info-item">
            <text class="label">浅睡时长：</text>
            <text class="value">{{ formatMinutes(sleepData.lightSleepTime) }}</text>
          </view>
          <view class="info-item">
            <text class="label">快速眼动：</text>
            <text class="value">{{ formatMinutes(sleepData.remSleepTime) }}</text>
          </view>
          <view class="info-item">
            <text class="label">清醒时长：</text>
            <text class="value">{{ formatMinutes(sleepData.awakeTime) }}</text>
          </view>
          <view class="info-item" v-if="apiData">
            <text class="label">翻身次数：</text>
            <text class="value">{{ apiData.turn_times }} 次</text>
          </view>
          <view class="info-item">
            <text class="label">睡眠评分：</text>
            <text class="value score">{{ (apiData && apiData.score) || sleepData.sleepQualityScore }} 分</text>
          </view>
        </view>
      </view>

      <!-- 睡眠期间心率 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠期间心率</text>
        </view>
        <view class="chart-container">
          <qiun-data-charts 
            v-if="hrChartData.categories && hrChartData.categories.length > 0"
            type="line"
            :opts="hrChartOpts"
            :chartData="hrChartData"
            :canvas2d="true"
            :ontouch="true"
          />
          <view v-else class="empty-chart">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 睡眠期间血氧 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠期间血氧</text>
        </view>
        <view class="chart-container">
          <qiun-data-charts 
            v-if="boxyChartData.categories && boxyChartData.categories.length > 0"
            type="area"
            :opts="boxyChartOpts"
            :chartData="boxyChartData"
            :canvas2d="true"
            :ontouch="true"
          />
          <view v-else class="empty-chart">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 睡眠期间血压 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠期间血压</text>
        </view>
        <view class="chart-container">
          <qiun-data-charts 
            v-if="bpChartData.categories && bpChartData.categories.length > 0"
            type="line"
            :opts="bpChartOpts"
            :chartData="bpChartData"
            :canvas2d="true"
            :ontouch="true"
          />
          <view v-else class="empty-chart">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 睡眠期间压力 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠期间压力</text>
        </view>
        <view class="chart-container">
          <qiun-data-charts 
            v-if="hrvChartData.categories && hrvChartData.categories.length > 0"
            type="area"
            :opts="hrvChartOpts"
            :chartData="hrvChartData"
            :canvas2d="true"
            :ontouch="true"
          />
          <view v-else class="empty-chart">
            <text>暂无数据</text>
          </view>
        </view>
      </view>

      <!-- 睡眠期间体温 -->
      <view class="chart-card">
        <view class="card-header">
          <text class="card-title">睡眠期间体温</text>
        </view>
        <view class="chart-container">
          <qiun-data-charts 
            v-if="tempChartData.categories && tempChartData.categories.length > 0"
            type="line"
            :opts="tempChartOpts"
            :chartData="tempChartData"
            :canvas2d="true"
            :ontouch="true"
          />
          <view v-else class="empty-chart">
            <text>暂无数据</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getSleepReport } from '@/api/iwownSleep'
import { getHealthyDataByTimeRange } from '@/api/iwownHealthyData'
import SleepStageChart from './SleepStageChart.vue'
import qiunDataCharts from '@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue'

export default {
  components: {
    SleepStageChart,
    qiunDataCharts
  },
  data() {
    return {
      deviceId: '',
      imei: '',
      deviceAlias: '',
      selectedDate: '',
      loading: false,
      sleepData: null,
      apiData: null,
      pieChartOpts: {
        color: ['#5470c6', '#91cc75', '#ee6666', '#fac858'],
        padding: [15, 15, 0, 15],
        enableScroll: false,
        legend: { 
          show: true, 
          position: 'bottom', 
          lineHeight: 25,
          fontSize: 13,
          fontColor: '#666666'
        },
        dataLabel: true,
        title: {
          show: false,
          name: '',
          fontSize: 0,
          color: 'transparent'
        },
        subtitle: {
          show: false,
          name: '',
          fontSize: 0,
          color: 'transparent'
        },
        extra: {
          ring: {
            ringWidth: 80,
            activeOpacity: 0.6,
            activeRadius: 15,
            offsetAngle: 0,
            labelWidth: 20,
            border: true,
            borderWidth: 4,
            borderColor: '#FFFFFF'
          }
        }
      },
      pieChartData: { series: [] },
      // 心率图表配置
      hrChartOpts: {
        color: ['#ee6666', '#fc8452', '#73c0de'],
        padding: [15, 30, 0, 15],
        enableScroll: true,
        legend: { show: true },
        dataLabel: false,
        xAxis: { 
          disableGrid: true,
          scrollShow: true,
          itemCount: 6,
          scrollAlign: 'left',
          boundaryGap: 'justify'
        },
        yAxis: { data: [{ min: 40, max: 180 }] },
        extra: { line: { type: 'curve', width: 2 } }
      },
      hrChartData: {},
      // 血氧图表配置
      boxyChartOpts: {
        color: ['#188df0'],
        padding: [15, 30, 0, 15],
        enableScroll: true,
        legend: { show: true },
        dataLabel: false,
        xAxis: {
          disableGrid: true,
          itemCount: 8,
          scrollShow: true,
          scrollAlign: 'left',
          fontSize: 11,
          boundaryGap: 'justify'
        },
        yAxis: {
          gridType: 'dash',
          dashLength: 2,
          splitNumber: 5,
          data: [{ min: 80, max: 100 }]
        },
        extra: {
          area: {
            type: 'curve',
            opacity: 0.6,
            width: 2,
            gradient: true
          }
        }
      },
      boxyChartData: {},
      // 血压图表配置
      bpChartOpts: {
        color: ['#f56c6c', '#409eff'],
        padding: [15, 30, 0, 15],
        enableScroll: true,
        legend: { 
          show: true,
          position: 'bottom',
          float: 'center',
          padding: 5,
          margin: 5,
          itemGap: 15,
          fontSize: 13,
          lineHeight: 20
        },
        dataLabel: false,
        xAxis: { 
          disableGrid: true,
          scrollShow: true,
          itemCount: 6,
          scrollAlign: 'left',
          boundaryGap: 'justify'
        },
        yAxis: { 
          data: [{ min: 40, max: 180 }]
        },
        extra: { 
          line: { 
            type: 'curve', 
            width: 2,
            activeType: 'hollow'
          } 
        }
      },
      bpChartData: {},
      // 压力图表配置
      hrvChartOpts: {
        color: ['#ff6b6b', '#4ecdc4'],
        padding: [15, 30, 0, 15],
        enableScroll: true,
        legend: { 
          show: true,
          position: 'bottom',
          float: 'center',
          padding: 5,
          margin: 5,
          itemGap: 15,
          fontSize: 13,
          lineHeight: 20
        },
        dataLabel: false,
        xAxis: { 
          disableGrid: true,
          scrollShow: true,
          itemCount: 6,
          scrollAlign: 'left',
          boundaryGap: 'justify'
        },
        yAxis: { 
          disabled: false,
          data: [
            { min: 0, max: 100, position: 'left', title: '疲劳度' },
            { min: 0, position: 'right', title: 'RMSSD' }
          ]
        },
        extra: { area: { type: 'curve', opacity: 0.3, width: 2 } }
      },
      hrvChartData: {},
      // 体温图表配置
      tempChartOpts: {
        color: ['#ff7675', '#74b9ff'],
        padding: [15, 30, 0, 15],
        enableScroll: true,
        legend: { show: true },
        dataLabel: false,
        xAxis: { 
          disableGrid: true,
          scrollShow: true,
          itemCount: 6,
          scrollAlign: 'left',
          boundaryGap: 'justify'
        },
        yAxis: { data: [{ min: 30, max: 40 }] },
        extra: { line: { type: 'curve', width: 2 } }
      },
      tempChartData: {}
    }
  },
  onLoad(options) {
    this.deviceId = options.deviceId || ''
    this.imei = options.imei || ''
    this.deviceAlias = decodeURIComponent(options.deviceAlias || '')
    const today = new Date()
    this.selectedDate = this.formatDate(today)
    this.loadSleepData()
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadSleepData()
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.selectedDate = this.formatDate(date)
      this.loadSleepData()
    },
    nextDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() + 1)
      this.selectedDate = this.formatDate(date)
      this.loadSleepData()
    },
    async loadSleepData() {
      if (!this.imei || !this.selectedDate) return
      this.clearData()
      this.loading = true
      try {
        const response = await getSleepReport(this.imei, this.selectedDate)
        if (response.code === 200 && response.data) {
          this.sleepData = response.data
          if (response.data.apiResponse) {
            try {
              const apiResponse = JSON.parse(response.data.apiResponse)
              if (apiResponse.data) {
                this.apiData = apiResponse.data
                console.log('apiData:', this.apiData)
                console.log('apiData.sections:', this.apiData.sections)
              }
            } catch (e) {
              console.error('解析API响应失败:', e)
            }
          }
          this.renderPieChart()
          // 加载睡眠期间的健康数据
          this.loadSleepHealthData()
        }
      } catch (error) {
        console.error('加载睡眠数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    clearData() {
      this.sleepData = null
      this.apiData = null
      this.pieChartData = { series: [] }
      this.hrChartData = {}
      this.boxyChartData = {}
      this.bpChartData = {}
      this.hrvChartData = {}
      this.tempChartData = {}
    },
    // 加载睡眠期间健康数据
    async loadSleepHealthData() {
      if (!this.sleepData || !this.sleepData.sleepStartTime || !this.sleepData.sleepEndTime) {
        console.log('睡眠时间范围不完整，跳过健康数据加载')
        return
      }
      console.log('开始加载睡眠期间健康数据:', {
        startTime: this.sleepData.sleepStartTime,
        endTime: this.sleepData.sleepEndTime,
        deviceId: this.deviceId,
        imei: this.imei
      })
      // 并行加载所有健康数据
      await Promise.all([
        this.loadHrData(),
        this.loadBoxyData(),
        this.loadBpData(),
        this.loadHrvData(),
        this.loadTempData()
      ])
      console.log('健康数据加载完成')
    },
    // 格式化时间戳
    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      // 如果是数字时间戳，转换为日期
      if (typeof timestamp === 'number') {
        const date = new Date(timestamp)
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }
      // 如果是字符串，提取时间部分
      if (typeof timestamp === 'string') {
        if (timestamp.includes(' ')) {
          return timestamp.split(' ')[1].substring(0, 5)
        }
        return timestamp.substring(0, 5)
      }
      return ''
    },
    // 加载心率数据
    async loadHrData() {
      try {
        const res = await getHealthyDataByTimeRange({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'hr_data',
          startTime: this.sleepData.sleepStartTime,
          endTime: this.sleepData.sleepEndTime
        })
        console.log('心率数据响应:', res)
        if (res.code === 200 && res.data && res.data.length > 0) {
          const categories = []
          const avgBpms = []
          const maxBpms = []
          const minBpms = []
          res.data.forEach(item => {
            const value = JSON.parse(item.value)
            const time = this.formatTimestamp(item.timestamp)
            categories.push(time)
            avgBpms.push(value.avgBpm || 0)
            maxBpms.push(value.maxBpm || 0)
            minBpms.push(value.minBpm || 0)
          })
          this.hrChartData = {
            categories,
            series: [
              { name: '平均心率', data: avgBpms },
              { name: '最高心率', data: maxBpms },
              { name: '最低心率', data: minBpms }
            ]
          }
          console.log('心率图表数据:', this.hrChartData)
        } else {
          console.log('心率数据为空或格式错误')
        }
      } catch (error) {
        console.error('加载心率数据失败:', error)
      }
    },
    // 加载血氧数据
    async loadBoxyData() {
      try {
        const res = await getHealthyDataByTimeRange({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'boxy_data',
          startTime: this.sleepData.sleepStartTime,
          endTime: this.sleepData.sleepEndTime
        })
        console.log('血氧数据响应:', res)
        if (res.code === 200 && res.data && res.data.length > 0) {
          const categories = []
          const avgOxys = []
          res.data.forEach(item => {
            const value = JSON.parse(item.value)
            const time = this.formatTimestamp(item.timestamp)
            const oxyValue = value.avgOxy || value.oxy || 0
            // 只添加有效的血氧数据（通常在80-100之间）
            if (oxyValue > 0) {
              categories.push(time)
              avgOxys.push(oxyValue)
            }
          })
          console.log('血氧图表数据:', { categories, avgOxys })
          if (categories.length > 0) {
            this.boxyChartData = {
              categories,
              series: [{ name: '血氧(%)', data: avgOxys }]
            }
          }
        } else {
          console.log('血氧数据为空或格式错误')
        }
      } catch (error) {
        console.error('加载血氧数据失败:', error)
      }
    },
    // 加载血压数据
    async loadBpData() {
      try {
        const res = await getHealthyDataByTimeRange({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'bp_data',
          startTime: this.sleepData.sleepStartTime,
          endTime: this.sleepData.sleepEndTime
        })
        console.log('血压数据响应:', res)
        if (res.code === 200 && res.data && res.data.length > 0) {
          const categories = []
          const sbps = []
          const dbps = []
          res.data.forEach(item => {
            const value = JSON.parse(item.value)
            const time = this.formatTimestamp(item.timestamp)
            categories.push(time)
            sbps.push(value.sbp || 0)
            dbps.push(value.dbp || 0)
          })
          this.bpChartData = {
            categories,
            series: [
              { name: '收缩压', data: sbps },
              { name: '舒张压', data: dbps }
            ]
          }
          console.log('血压图表数据:', this.bpChartData)
          console.log('血压图表数据是否有categories:', this.bpChartData.categories && this.bpChartData.categories.length > 0)
        } else {
          console.log('血压数据为空')
        }
      } catch (error) {
        console.error('加载血压数据失败:', error)
      }
    },
    // 加载压力数据
    async loadHrvData() {
      try {
        const res = await getHealthyDataByTimeRange({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'hrv_data',
          startTime: this.sleepData.sleepStartTime,
          endTime: this.sleepData.sleepEndTime
        })
        if (res.code === 200 && res.data && res.data.length > 0) {
          const categories = []
          const fatigues = []
          const rmssds = []
          res.data.forEach(item => {
            const value = JSON.parse(item.value)
            const time = this.formatTimestamp(item.timestamp)
            categories.push(time)
            fatigues.push(value.fatigue || 0)
            rmssds.push(value.rmssd || 0)
          })
          this.hrvChartData = {
            categories,
            series: [
              { name: '疲劳度', data: fatigues, index: 0 },
              { name: 'RMSSD', data: rmssds, index: 1 }
            ]
          }
        }
      } catch (error) {
        console.error('加载压力数据失败:', error)
      }
    },
    // 加载体温数据
    async loadTempData() {
      try {
        const res = await getHealthyDataByTimeRange({
          deviceId: this.deviceId,
          imei: this.imei,
          dataType: 'temperature_data',
          startTime: this.sleepData.sleepStartTime,
          endTime: this.sleepData.sleepEndTime
        })
        if (res.code === 200 && res.data && res.data.length > 0) {
          const categories = []
          const temps = []
          const shellTemps = []
          res.data.forEach(item => {
            const value = JSON.parse(item.value)
            const time = this.formatTimestamp(item.timestamp)
            categories.push(time)
            const bodyTemp = value.estiArm !== undefined ? value.estiArm : 
                            value.eviBody ? (value.eviBody / 100) : 0
            temps.push(bodyTemp)
            if (value.shellTemp !== undefined) {
              shellTemps.push(value.shellTemp)
            }
          })
          const series = [{ name: '体温', data: temps }]
          if (shellTemps.length > 0) {
            series.push({ name: '皮肤温度', data: shellTemps })
          }
          this.tempChartData = {
            categories,
            series
          }
        }
      } catch (error) {
        console.error('加载体温数据失败:', error)
      }
    },
    renderPieChart() {
      if (!this.sleepData) return
      const data = [
        { name: '深睡', value: this.sleepData.deepSleepTime || 0 },
        { name: '浅睡', value: this.sleepData.lightSleepTime || 0 },
        { name: '快速眼动', value: this.sleepData.remSleepTime || 0 },
        { name: '清醒', value: this.sleepData.awakeTime || 0 }
      ]
      
      // 计算总时长
      const totalMinutes = data.reduce((sum, item) => sum + item.value, 0)
      
      this.pieChartData = {
        series: data.map(item => ({
          name: item.name,
          data: item.value,
          format: (val, totalVal, index, opts) => {
            const hours = Math.floor(val / 60)
            const mins = val % 60
            const percentage = totalMinutes > 0 ? ((val / totalMinutes) * 100).toFixed(1) : 0
            const timeStr = hours > 0 ? `${hours}h${mins}m` : `${mins}m`
            return `${percentage}%`
          }
        }))
      }
    },
    formatMinutes(minutes) {
      if (!minutes) return '0分钟'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return `${hours}小时${mins}分钟`
      }
      return `${mins}分钟`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/static/fontA/iconfont.css';

.sleep-report-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fe 0%, #ffffff 100%);
  padding: 0;
}

.header-card {
  background: #3ec6c6;
  padding: 40rpx 32rpx 80rpx;
  position: relative;
  overflow: hidden;
  margin-bottom: 80rpx;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400rpx;
    height: 400rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}

.header-content {
  position: relative;
  z-index: 1;
}

.device-info {
  margin-bottom: 32rpx;
  
  .device-title {
    display: block;
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12rpx;
    letter-spacing: 0.5rpx;
  }
  
  .device-id {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10rpx);
  border-radius: 16rpx;
  padding: 12rpx;
}

.date-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }
}

.date-display {
  padding: 12rpx 32rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  min-width: 220rpx;
  text-align: center;
}

.loading-wrapper, .empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  margin: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  
  .loading-text, .empty-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
  
  .empty-icon {
    font-size: 160rpx;
    color: #d0d0d0;
    margin-bottom: 8rpx;
  }
}

.content-wrapper {
  padding: 24rpx;
  padding-top: 0;
}

.overview-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-top: -100rpx;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(62, 198, 198, 0.08);
  display: flex;
  align-items: center;
  gap: 20rpx;
  transition: all 0.3s;
  
  &:active {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(62, 198, 198, 0.12);
  }
}

.stat-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.sleep-time {
    background: #3ec6c6;
    box-shadow: 0 8rpx 24rpx rgba(62, 198, 198, 0.3);
  }
  
  &.deep-sleep {
    background: #5470c6;
    box-shadow: 0 8rpx 24rpx rgba(84, 112, 198, 0.3);
  }
  
  &.light-sleep {
    background: #91cc75;
    box-shadow: 0 8rpx 24rpx rgba(145, 204, 117, 0.3);
  }
  
  &.quality-score {
    background: #fac858;
    box-shadow: 0 8rpx 24rpx rgba(250, 200, 88, 0.3);
  }
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  font-weight: 400;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  letter-spacing: 0.5rpx;
}

.chart-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 20rpx;
  transition: all 0.3s;
  
  &:active {
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  position: relative;
  padding-left: 20rpx;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 28rpx;
    background: linear-gradient(135deg, #aae6e6 0%, hsl(180, 77%, 90%) 100%);
    border-radius: 3rpx;
  }
}

.sleep-period {
  font-size: 24rpx;
  color: #999;
  background: #f8f9fe;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.chart-container {
  width: 100%;
  height: 500rpx;
  
  .empty-chart {
    height: 100%;
  }
}

.ring-chart {
  height: 600rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .empty-chart {
    height: 100%;
    width: 100%;
  }
}

.empty-chart {
  padding: 60rpx 0;
  text-align: center;
  color: #bbb;
  font-size: 26rpx;
  background: linear-gradient(135deg, #f8fafa 0%, #f0f5f5 100%);
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
  
  &::before {
    content: '';
    width: 80rpx;
    height: 80rpx;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E") no-repeat center;
    background-size: contain;
    margin-bottom: 16rpx;
    opacity: 0.5;
  }
  
  text {
    color: #aaa;
    font-size: 26rpx;
  }
}

.detail-info {
  background: #f8f9fe;
  border-radius: 16rpx;
  padding: 24rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    &:first-child {
      padding-top: 0;
    }
    
    .label {
      font-size: 28rpx;
      color: #666;
      font-weight: 400;
    }
    
    .value {
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      
      &.score {
        font-size: 36rpx;
        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
      }
    }
  }
}
</style>
