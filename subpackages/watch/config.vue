<template>
  <view class="iwown-config-container">
    <view class="device-card">
      <view class="device-header">
        <text class="device-type">埃微智能手表</text>
        <view class="device-status"></view>
      </view>
      <view class="device-name">{{ deviceInfo.deviceAlias || '智能手表' }}</view>
      <view class="device-imei">IMEI: {{ deviceInfo.imei }}</view>
    </view>

    <view class="section-wrapper">
      <ConfigSection 
        v-for="section in configSections" 
        :key="section.title"
        :title="section.title"
        :items="section.items"
        @select="handleConfig"
      />
    </view>

    <ConfigDialog 
      ref="configDialog"
      :title="dialogTitle"
      :config-type="currentConfigType"
      :form-data="formData"
      :form-props="currentFormProps"
      :form-name="currentFormName"
      :loading="submitLoading"
      @update:formData="formData = $event"
      @submit="handleSubmit"
      @close="onDialogClose"
    />

    <ConfirmDialog ref="confirmDialog" />
  </view>
</template>

<script>
import request from '@/utils/request.js'
import ConfigSection from './config/ConfigSection.vue'
import ConfigDialog from './config/ConfigDialog.vue'
import ConfirmDialog from './config/ConfirmDialog.vue'
import { configSections, apiMap, defaultFormData, configTitles } from './config/configData.js'

export default {
  components: { ConfigSection, ConfigDialog, ConfirmDialog },
  data() {
    return {
      deviceInfo: { deviceAlias: '', imei: '', deviceId: '' },
      configSections,
      currentConfigType: '',
      currentFormName: '',
      currentFormProps: {},
      dialogTitle: '',
      formData: {},
      submitLoading: false
    }
  },
  onLoad(options) {
    this.deviceInfo = {
      deviceAlias: options.deviceAlias ? decodeURIComponent(options.deviceAlias) : '',
      imei: options.imei || '',
      deviceId: options.deviceId || ''
    }
    uni.setNavigationBarTitle({ title: '埃微手表配置' })
  },
  methods: {
    async handleConfig(item) {
      this.currentConfigType = item.key
      
      // 确认类操作
      if (item.confirm) {
        const res = await this.$refs.confirmDialog.show({ 
          title: '提示', 
          content: item.confirm 
        })
        if (!res.confirm) return
        await this.callApi(apiMap[item.key], {}, item.isGet)
        return
      }
      
      // 直接API调用（如查看状态）
      if (item.isGet) {
        await this.callApi(apiMap[item.key], {}, true)
        return
      }
      
      // 表单类操作
      if (item.form) {
        this.dialogTitle = configTitles[item.key] || item.label
        this.currentFormName = item.form
        this.currentFormProps = item.formProps || {}
        await this.loadFormData(item.key)
        this.$nextTick(() => this.$refs.configDialog.open())
      }
    },
    
    async loadFormData(configType) {
      let savedConfig = null
      try {
        const res = await request({
          url: `/api/iwown/device/config/${this.deviceInfo.imei}/${configType}`,
          method: 'get'
        })
        if (res.code === 200 && res.data) savedConfig = res.data
      } catch (e) {
        console.warn('加载配置失败，使用默认值')
      }
      
      const defaults = defaultFormData[configType] || {}
      this.formData = savedConfig ? { ...defaults, ...savedConfig } : { ...defaults }
      
      // 特殊数据转换
      this.transformLoadedData(configType)
    },
    
    transformLoadedData(configType) {
      // 闹钟数据转换
      if (configType === 'clockalarm' && this.formData.alarms) {
        this.formData.alarms = this.formData.alarms.map(alarm => {
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            .filter(d => alarm[d])
          let repeatMode = 'custom'
          if (days.length === 7) repeatMode = 'everyday'
          else if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) repeatMode = 'weekdays'
          else if (days.length <= 1 && !alarm.repeat) repeatMode = 'once'
          
          return {
            time: `${String(alarm.hour).padStart(2, '0')}:${String(alarm.minute).padStart(2, '0')}`,
            enabled: alarm.enabled !== undefined ? alarm.enabled : true,
            repeatMode, days,
            title: alarm.title || ''
          }
        })
      }
      
      // 久坐提醒数据转换
      if (configType === 'sedentary' && this.formData.sedentaries) {
        this.formData.sedentaries = this.formData.sedentaries.map(s => ({
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].filter(d => s[d]),
          timeRange: [`${String(s.start_hour).padStart(2, '0')}:00`, `${String(s.end_hour).padStart(2, '0')}:00`],
          duration: 12, threshold: 40
        }))
      }
      
      // 血压测量计划数据转换
      if (configType === 'bp_measure_schedule') {
        if (this.formData.measure_time) {
          this.formData.schedules = this.formData.measure_time.map(datetime => ({ datetime }))
          delete this.formData.measure_time
        } else if (!this.formData.schedules) {
          this.formData.schedules = []
        }
      }
    },
    
    async callApi(apiUrl, data = {}, isGet = false) {
      uni.showLoading({ title: '正在处理...' })
      try {
        const res = isGet 
          ? await request({ url: apiUrl, method: 'get', params: { deviceId: this.deviceInfo.imei } })
          : await request({ url: apiUrl, method: 'post', data: { device_id: this.deviceInfo.imei, ...data } })
        
        uni.hideLoading()
        if (res.code === 200) {
          uni.showToast({ title: res.msg || '操作成功', icon: 'success' })
          if (this.currentConfigType === 'status' && res.data) {
            const statusMap = { '0': '离线', '1': '在线', '2': '未激活' }
            this.$refs.confirmDialog.show({ 
              title: '设备状态', 
              content: `设备状态: ${statusMap[res.data.status] || '未知'}`,
              showCancel: false 
            })
          }
        } else {
          uni.showToast({ title: res.msg || '操作失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '操作失败: ' + e.message, icon: 'none' })
      }
    },
    
    async handleSubmit() {
      const apiUrl = apiMap[this.currentConfigType]
      if (!apiUrl) return
      
      let submitData = this.transformSubmitData()
      
      this.submitLoading = true
      uni.showLoading({ title: '正在设置...' })
      
      try {
        const res = await request({
          url: apiUrl,
          method: 'post',
          data: { device_id: this.deviceInfo.imei, ...submitData }
        })
        
        uni.hideLoading()
        this.submitLoading = false
        
        if (res.code === 200) {
          uni.showToast({ title: '设置成功', icon: 'success' })
          this.$refs.configDialog.close()
        } else {
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        this.submitLoading = false
        uni.showToast({ title: '设置失败: ' + e.message, icon: 'none' })
      }
    },
    
    transformSubmitData() {
      let data = { ...this.formData }
      const type = this.currentConfigType
      
      // 翻腕亮屏固定全天
      if (type === 'lcdgesture') {
        data.start_hour = 0
        data.end_hour = 24
      }
      
      // 温度报警乘以10
      if (type === 'temperature_alarm') {
        data.high = Math.round(data.high * 10)
        data.low = Math.round(data.low * 10)
      }
      
      // 通讯录验证
      if (type === 'phonebook') {
        const validPhones = data.phone_book.filter(p => p.name && p.number)
        if (validPhones.length === 0 || !validPhones.some(p => p.sos)) {
          uni.showToast({ title: '请至少添加一个SOS联系人', icon: 'none' })
          return null
        }
        data.phone_book = validPhones
      }
      
      // 闹钟处理
      if (type === 'clockalarm') {
        data.alarms = data.alarms.map(alarm => {
          const [hour, minute] = alarm.time.split(':')
          const result = {
            enabled: alarm.enabled, repeat: alarm.repeatMode !== 'once',
            hour: parseInt(hour), minute: parseInt(minute), title: alarm.title || '',
            monday: false, tuesday: false, wednesday: false, thursday: false,
            friday: false, saturday: false, sunday: false
          }
          if (alarm.days) alarm.days.forEach(d => result[d] = true)
          return result
        })
      }
      
      // 久坐提醒处理
      if (type === 'sedentary') {
        data.sedentaries = data.sedentaries.map(s => {
          const result = {
            repeat: true,
            start_hour: parseInt(s.timeRange[0].split(':')[0]),
            end_hour: parseInt(s.timeRange[1].split(':')[0]),
            duration: 12, threshold: 40,
            monday: false, tuesday: false, wednesday: false, thursday: false,
            friday: false, saturday: false, sunday: false
          }
          if (s.days) s.days.forEach(d => result[d] = true)
          return result
        })
      }
      
      // 血压测量计划处理
      if (type === 'bp_measure_schedule') {
        data.measure_time = data.schedules.filter(s => s.datetime).map(s => s.datetime)
        delete data.schedules
      }
      
      return data
    },
    
    onDialogClose() {
      this.currentConfigType = ''
      this.currentFormName = ''
      this.formData = {}
    }
  }
}
</script>


<style scoped lang="scss">
.iwown-config-container {
  padding: 32rpx;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.device-card {
  background: linear-gradient(135deg, #C96A42 0%, #E07A4F 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(224, 122, 79, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
  
  .device-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
    position: relative;
    z-index: 1;
    
    .device-type {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.15);
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      backdrop-filter: blur(10px);
    }
    
    .device-status {
      width: 16rpx;
      height: 16rpx;
      background: #4ade80;
      border-radius: 50%;
      box-shadow: 0 0 12rpx #4ade80;
    }
  }
  
  .device-name {
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
    margin-bottom: 16rpx;
    position: relative;
    z-index: 1;
    letter-spacing: 2rpx;
  }
  
  .device-imei {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
    font-family: 'SF Mono', 'Monaco', monospace;
    letter-spacing: 2rpx;
    position: relative;
    z-index: 1;
  }
}

.section-wrapper {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.04);
}
</style>
