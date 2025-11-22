<template>
  <view class="device-detail-page">

    <!-- 设备基本信息 -->
    <view class="device-info-card" v-if="deviceInfo">
      <view class="info-header">
        <view class="device-avatar">
          <text class="avatar-text">{{ (deviceInfo.deviceAlias || deviceInfo.deviceKey).charAt(0) }}</text>
        </view>
        <view class="device-basic">
          <view class="device-name">{{ deviceInfo.deviceAlias || deviceInfo.deviceKey }}</view>
          <view class="device-type">{{ getDeviceTypeName(deviceInfo.deviceType) }}</view>
          <view class="online-status" :class="deviceInfo.enableStatus === '1' ? 'online' : 'offline'">
            <view class="status-dot"></view>
            <text>{{ deviceInfo.enableStatus === '1' ? '在线' : '离线' }}</text>
          </view>
        </view>
      </view>
      
      <!-- 设备Key信息 -->
      <view class="device-keys">
        <view class="key-item">
          <text class="key-label">设备Key:</text>
          <text class="key-value">{{ deviceInfo.deviceKey }}</text>
        </view>
        <view class="key-item">
          <text class="key-label">设备编号:</text>
          <text class="key-value">{{ deviceInfo.productKey + deviceInfo.deviceKey }}</text>
        </view>
     
      </view>
    </view>

    <!-- 设备控制 -->
    <view class="control-section">
      <view class="section-title">设备控制</view>
      
      <!-- 设备开关 -->
      <view class="control-item">
        <view class="control-info">
          <text class="control-label">设备布防</text>
          <text class="control-desc">事件发生时将通知绑定的联系人</text>
        </view>
        <switch 
          :checked="deviceInfo && deviceInfo.defenseStatus === '1'" 
          @change="toggleDefenseStatus"
          color="#3ec6c6"
          class="control-switch"
        />
      </view>
    </view>

    <!-- 设置卡片区域 -->
    <view class="settings-grid">
      <!-- 报警设置卡片 -->
      <view class="setting-card" @click="handleAlarmSettingsClick">
        <view class="card-header">
          <text class="card-title">报警设置</text>
          <uni-icons type="sound" size="24" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 参数设置卡片 -->
      <view class="setting-card" @click="handleParamSettingsClick">
        <view class="card-header">
          <text class="card-title">参数设置</text>
          <uni-icons type="gear" size="24" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 绑定家人卡片 -->
      <view class="setting-card" @click="handleBindFamilyClick">
        <view class="card-header">
          <text class="card-title">绑定家人</text>
          <uni-icons type="person" size="24" color="#3ec6c6"></uni-icons>
        </view>
        <view class="card-desc">
          <text>已绑定 {{ boundFamilyMembers.length }} 人</text>
        </view>
      </view>
      
      <!-- 绑定接警人卡片 -->
      <view class="setting-card" @click="handleBindReceiverClick">
        <view class="card-header">
          <text class="card-title">绑定接警人</text>
          <uni-icons type="phone" size="24" color="#3ec6c6"></uni-icons>
        </view>
        <view class="card-desc">
          <text>已绑定 {{ boundReceivers.length }} 人</text>
        </view>
      </view>
    </view>

    <!-- 统一设置弹窗 -->
    <uni-popup ref="settingsPopup" type="bottom" :mask-click="false">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ currentPopupTitle }}</text>
          <uni-icons type="clear" size="24" color="#666" @click="closeSettingsPopup"></uni-icons>
        </view>
        
        <!-- 设置内容 -->
        <view v-if="popupType === 'alarm'" class="setting-list">
          <view v-for="alarm in alarmSwitches" :key="alarm.identifier" class="setting-item">
            <view class="setting-info">
              <text class="setting-label">{{ alarm.name }}</text>
              <text class="setting-desc">{{ alarm.desc }}</text>
            </view>
            <switch 
              :checked="alarm.open" 
              @change="toggleAlarm(alarm)"
              color="#3ec6c6"
              class="setting-switch"
            />
          </view>
          
          <!-- 如果没有数据，显示提示 -->
          <view v-if="alarmSwitches.length === 0" style="padding: 40rpx; text-align: center; color: #999;">
            <text>暂无报警设置数据</text>
          </view>
        </view>
        
        <!-- 参数设置内容 -->
        <view v-if="popupType === 'param'" class="param-setting-list">
          <view v-for="prop in paramProps" :key="prop.identifier" class="param-setting-item">
            <view class="param-info">
              <view class="param-name-container">
                <text class="param-name">{{ prop.name }}</text>
                <text v-if="prop.unit" class="param-unit">({{ prop.unit }})</text>
              </view>
              <view class="param-value-container">
                <!-- 布尔开关 -->
                <switch v-if="prop.uiType === 'bool'"
                  :checked="!!prop.tempValue"
                  @change="onParamSwitchChange(prop, $event)"
                  color="#3ec6c6"
                  class="param-switch"
                />
                <!-- 数值输入 -->
                <input v-else-if="prop.uiType === 'number'"
                  class="param-value-input"
                  type="number"
                  v-model="prop.tempValue"
                  placeholder="请输入数值" />
                <!-- 枚举选择 -->
                <picker v-else-if="prop.uiType === 'enum'" mode="selector" :range="prop.enumLabels" @change="onParamPickerChange(prop, $event)">
                  <view class="param-value-picker">{{ prop.tempEnumDisplay || '请选择' }}</view>
                </picker>
                <!-- 字符串输入（兜底） -->
                <input v-else
                  class="param-value-input"
                  type="text"
                  v-model="prop.tempValue"
                  placeholder="请输入" />
                
                <!-- 设置按钮（开关类型不显示） -->
                <button v-if="prop.uiType !== 'bool'" class="param-set-btn" @click="applyParamSetting(prop)">设置</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>


    <!-- 操作卡片区域 -->
    <view class="action-grid">
      <!-- 配置网络卡片 -->
      <view class="action-card network" @click="handleConfigNetwork">
        <view class="card-header">
          <text class="card-title">配置网络</text>
          <uni-icons type="settings" size="24" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 编辑设备卡片 -->
      <view class="action-card secondary" @click="editDevice(deviceInfo)">
        <view class="card-header">
          <text class="card-title">编辑设备</text>
          <uni-icons type="compose" size="24" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 删除设备卡片 -->
      <view class="action-card danger" @click="deleteDevice">
        <view class="card-header">
          <text class="card-title">删除设备</text>
          <uni-icons type="trash" size="24" color="#f44336"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
    <!-- 修改设备弹窗 -->
    <uni-popup ref="editDevicePopup" type="center" :mask-click="false">
      <view class="add-device-popup">
        <view class="popup-header">
          <text class="popup-title">修改设备管理</text>
          <uni-icons type="close" size="24" color="#666" @click="closeEditDevice"></uni-icons>
        </view>
        
        <view class="popup-content">
          <view class="form-item">
            <text class="form-label">设备编号</text>
            <input 
              class="form-input disabled" 
              v-model="editForm.deviceKey" 
              placeholder="设备编号"
              disabled
            />
          </view>
          
          <view class="form-item">
            <text class="form-label required">设备别名</text>
            <input 
              class="form-input" 
              v-model="editForm.deviceAlias" 
              placeholder="请输入设备别名"
              maxlength="50"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="editForm.remark" 
              placeholder="请输入内容"
              maxlength="300"
            ></textarea>
            <text class="char-count">{{ editForm.remark.length }}/300</text>
          </view>
        </view>
        
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeEditDevice">取消</button>
          <button class="confirm-btn" @click="confirmEditDevice" :loading="submitting">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getDevice, updateDevice, delDevice, sendOneCommand, getRealTimeData } from '@/api/device'
import { getDicts } from '@/api/system/dict/data'
import { getMemberIdsByDeviceId } from '@/api/familyMemberDevice'
import { getAlarmReceiverIdsByDeviceId } from '@/api/devicereceiver'

export default {
  data() {
    return {
      deviceId: '',
      deviceKey: '',
      deviceInfo: null,
      loading: false,
      dictData: {
        dev_device_type: [],
        dev_defense_status: []
      },
      // 报警开关设置
      alarmSwitches: [],
      // 参数设置（从 thingModel 中提取可写属性）
      paramProps: [],
      // 弹窗状态管理
      popupType: '', // 'alarm' | 'param' | ''
      // 编辑设备表单
      editForm: {
        deviceId: '',
        deviceKey: '',
        deviceAlias: '',
        remark: ''
      },
      // 提交状态
      submitting: false,
      // 旧的示例参数保留占位
      // 参数设置
      settingParams: {
        detectMode: false // false: 实时模式, true: 睡眠模式
      },
      // 绑定的家人列表
      boundFamilyMembers: [],
      // 绑定的接警人列表
      boundReceivers: []
    }
  },
  
  computed: {
    // 动态弹窗标题
    currentPopupTitle() {
      return this.popupType === 'alarm' ? '报警设置' : 
             this.popupType === 'param' ? '参数设置' : '设置'
    }
  },
  
  onLoad(options) {
    if (options.deviceId) {
      this.deviceId = options.deviceId
    }
    if (options.deviceKey) {
      this.deviceKey = options.deviceKey
    }
    
    this.loadDictData()
    this.loadDeviceDetail()
  },
  onShow() {
    // 返回本页时刷新绑定家人和接警人数
    if (this.deviceId) {
      this.loadBoundFamilyMembers()
      this.loadBoundReceivers()
    }
  },
  
  methods: {
    // 加载已绑定的家人数量
    async loadBoundFamilyMembers() {
      try {
        const res = await getMemberIdsByDeviceId(this.deviceId)
        if (res.code === 200) {
          const ids = res.data || []
          this.boundFamilyMembers = ids.map(id => ({ memberId: id }))
        }
      } catch (e) {
        // 忽略错误，保持现有显示
      }
    },
    // 加载已绑定的接警人数量
    async loadBoundReceivers() {
      try {
        const res = await getAlarmReceiverIdsByDeviceId(this.deviceId)
        if (res.code === 200) {
          const ids = res.data || []
          this.boundReceivers = ids.map(id => ({ receiverId: id }))
        }
      } catch (e) {
        // 忽略错误，保持现有显示
      }
    },
    // 加载字典数据
    async loadDictData() {
      try {
        const [deviceType, defenseStatus] = await Promise.all([
          getDicts('dev_device_type'),
          getDicts('dev_defense_status')
        ])
        
        if (deviceType.code === 200 && deviceType.data) {
          this.dictData.dev_device_type = deviceType.data
        }
        
        if (defenseStatus.code === 200 && defenseStatus.data) {
          this.dictData.dev_defense_status = defenseStatus.data
        }
        
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },
    
    // 加载设备详情
    async loadDeviceDetail() {
      if (!this.deviceId) {
        uni.showToast({
          title: '设备ID不能为空',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      try {
        const response = await getDevice(this.deviceId)
        if (response.code === 200) {
          this.deviceInfo = response.data
          this.loadAlarmSwitches()
          // 参数设置将在打开弹窗时动态加载
          // 同步加载已绑定的家人和接警人数量
          this.loadBoundFamilyMembers()
          this.loadBoundReceivers()
        } else {
          uni.showToast({
            title: response.msg || '获取设备信息失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取设备详情失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载报警开关设置
    loadAlarmSwitches() {
      if (!this.deviceInfo || !this.deviceInfo.alarmSwitch) {
        this.setDefaultAlarmSwitches()
        return
      }
      
      try {
        const parsedData = JSON.parse(this.deviceInfo.alarmSwitch)

        // 检查解析后的数据是否为数组
        if (Array.isArray(parsedData)) {
          // 过滤出有效的报警开关配置项
          const filteredSwitches = parsedData.filter(item => {
            const isValid = item && 
                   typeof item === 'object' && 
                   item.identifier && 
                   item.name && 
                   typeof item.open === 'boolean'
            if (!isValid) {
              console.log('过滤掉无效项:', item)
            }
            return isValid
          }).map(item => ({
            identifier: item.identifier,
            name: item.name,
            desc: item.desc || `${item.name}功能开关`,
            open: item.open
          }))
          
          // 使用 $set 确保响应式更新
          this.$set(this, 'alarmSwitches', filteredSwitches)
          
          console.log('最终解析的报警开关配置:', this.alarmSwitches)
          console.log('alarmSwitches 数组长度:', this.alarmSwitches.length)
          
          // 如果没有有效的配置项，使用默认配置
          if (this.alarmSwitches.length === 0) {
            console.log('没有有效配置项，使用默认配置')
            this.setDefaultAlarmSwitches()
          }
        } else {
          console.warn('alarmSwitch 数据格式不正确，不是数组格式:', typeof parsedData)
          this.setDefaultAlarmSwitches()
        }
      } catch (error) {
        console.error('解析报警开关失败:', error)
        console.error('原始数据:', this.deviceInfo.alarmSwitch)
        this.setDefaultAlarmSwitches()
      }
    },
    
    // 设置默认报警开关配置
    setDefaultAlarmSwitches() {
      const defaultSwitches = [
       
      ]
      
      // 使用 $set 确保响应式更新
      this.$set(this, 'alarmSwitches', defaultSwitches)
      console.log('设置默认报警开关配置完成，长度:', this.alarmSwitches.length)
    },
    
    // 获取设备类型名称
    getDeviceTypeName(type) {
      const deviceType = this.dictData.dev_device_type.find(item => item.dictValue === type)
      return deviceType ? deviceType.dictLabel : '未知设备'
    },
    
    // 获取字典标签
    getDictLabel(dictType, dictValue) {
      const dictList = this.dictData[dictType] || []
      const dictItem = dictList.find(item => String(item.dictValue) === String(dictValue))
      return dictItem ? dictItem.dictLabel : dictValue
    },
    
    // 切换设备布防状态
    async toggleDefenseStatus() {
      const newDefenseStatus = this.deviceInfo.defenseStatus === '1' ? '2' : '1'
      await this.updateDeviceStatus({ 
        defenseStatus: newDefenseStatus
      })
    },
    
    // 更新设备状态
    async updateDeviceStatus(params) {
      try {
        uni.showLoading({ title: '更新中...' })
        
        const response = await updateDevice({
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          deviceAlias: this.deviceInfo.deviceAlias,
          remark: this.deviceInfo.remark || '',
          enableStatus: params.enableStatus || this.deviceInfo.enableStatus,
          defenseStatus: params.defenseStatus || this.deviceInfo.defenseStatus
        })
        
        if (response.code === 200) {
          // 更新本地数据
          Object.assign(this.deviceInfo, params)
          
          const statusText = params.defenseStatus ? this.getDictLabel('dev_defense_status', params.defenseStatus) : '更新'
          uni.showToast({
            title: params.defenseStatus ? `已切换为${statusText}` : '更新成功',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.msg || '更新失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新设备状态失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 处理报警设置点击事件
    handleAlarmSettingsClick() {
      this.openSettingsPopup('alarm')
    },
    
    // 处理参数设置点击事件
    handleParamSettingsClick() {
      this.openSettingsPopup('param')
    },
    
    // 处理绑定家人点击事件
    handleBindFamilyClick() {
      uni.navigateTo({
        url: '/pages/my/family/index?deviceId=' + this.deviceId
      })
    },
    
    // 处理绑定接警人点击事件
    handleBindReceiverClick() {
      const params = {
        deviceId: this.deviceId,
        deviceKey: this.deviceInfo.deviceKey,
        productKey: this.deviceInfo.productKey
      }
      const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
      uni.navigateTo({
        url: '/pages/my/alarmreceiver/index?' + query
      })
    },
    
    // 处理配置网络点击事件
    handleConfigNetwork() {
      uni.showModal({
        title: '配置网络',
        content: '是否对设备进行配网操作，配网前请确保设备通电？',
        confirmText: '开始配置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const params = {
              deviceId: this.deviceId,
              productKey: this.deviceInfo.productKey,
              deviceKey: this.deviceInfo.deviceKey
            }
            const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
            uni.navigateTo({
              url: '/pages/my/network/index?' + query
            })
          }
        }
      })
    },
    
    // 打开设置弹窗
    async openSettingsPopup(type) {
      
      // 设置弹窗类型
      this.popupType = type
      
      try {
        // 根据类型加载对应数据
        if (type === 'alarm') {
          // 确保报警数据已加载
          if (!this.alarmSwitches || this.alarmSwitches.length === 0) {
            this.loadAlarmSwitches()
          }
        } else if (type === 'param') {
          // 加载参数设置数据（异步等待）
          uni.showLoading({ title: '加载参数中...' })
          await this.loadParamSettings()
          uni.hideLoading()
        }
        
        // 使用 nextTick 确保数据更新后再打开弹窗
        this.$nextTick(() => {
          if (this.$refs.settingsPopup) {
            this.$refs.settingsPopup.open()
          }
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      }
    },
    
    // 关闭设置弹窗
    closeSettingsPopup() {
      if (this.$refs.settingsPopup) {
        this.$refs.settingsPopup.close()
      }
      // 清空弹窗类型
      this.popupType = ''
    },

    // 参数值变更（布尔开关）- 旧方法保留备用
    onParamValueChange(prop, e) {
      prop.tempValue = !!e.detail.value
    },

    // 开关切换并立即保存
    async onParamSwitchChange(prop, e) {
      const newValue = !!e.detail.value
      prop.tempValue = newValue
      
      try {
        uni.showLoading({ title: '设置中...' })
        const res = await sendOneCommand({
          ack: 0,
          address: null,
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          productKey: this.deviceInfo.productKey,
          propertyValue: {
            [prop.identifier]: newValue
          },
          type: null
        })
        
        if (res.code === 200) {
          prop.value = newValue
          uni.showToast({ title: '设置成功', icon: 'success' })
        } else {
          // 设置失败，恢复原值
          prop.tempValue = prop.value
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (err) {
        // 出错，恢复原值
        prop.tempValue = prop.value
        console.error('设置参数失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // 参数枚举选择变更
    onParamPickerChange(prop, e) {
      const idx = Number(e.detail.value)
      prop.tempValue = prop.enumValues[idx]
      prop.tempEnumDisplay = prop.enumLabels[idx]
    },

    // 应用参数设置（点击设置按钮时调用）
    async applyParamSetting(prop) {
      try {
        let value = prop.tempValue
        
        // 数值类型验证
        if (prop.uiType === 'number') {
          if (value === '' || value === null || value === undefined) {
            uni.showToast({ title: '请输入数值', icon: 'none' })
            return
          }
          value = Number(value)
          if (Number.isNaN(value)) {
            uni.showToast({ title: '请输入有效数字', icon: 'none' })
            return
          }
        }
        
        uni.showLoading({ title: '设置中...' })
        const res = await sendOneCommand({
          ack: 0,
          address: null,
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          productKey: this.deviceInfo.productKey,
          propertyValue: {
            [prop.identifier]: value
          },
          type: null
        })
        
        if (res.code === 200) {
          // 更新实际值
          prop.value = value
          if (prop.uiType === 'enum') {
            prop.enumDisplay = prop.tempEnumDisplay
          }
          uni.showToast({ title: '设置成功', icon: 'success' })
        } else {
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (err) {
        console.error('设置参数失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 获取设备实时数据
    async loadRealTimeData() {
      try {
        const response = await getRealTimeData({
          productKey: this.deviceInfo.productKey,
          deviceKey: this.deviceInfo.deviceKey
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

    // 解析参数设置（thingModel.properties 中 accessMode === 'w'）
    async loadParamSettings() {
      try {
        let tm = this.deviceInfo && this.deviceInfo.thingModel
        if (!tm) {
          this.$set(this, 'paramProps', [])
          return
        }
        if (typeof tm === 'string') {
          try { tm = JSON.parse(tm) } catch (e) { /* JSON解析失败 */ }
        }
        let props = Array.isArray(tm?.properties) ? tm.properties
                   : Array.isArray(tm?.model?.properties) ? tm.model.properties
                   : []
        const writables = props.filter(p => p && p.accessMode === 'w')
        
        // 获取实时数据
        const realTimeData = await this.loadRealTimeData()
        
        const mapped = writables.map(p => {
          const type = p?.dataType?.type || 'string'
          const specs = p?.dataType?.specs || {}
          const uiType = type === 'bool' || type === 'boolean' ? 'bool'
                         : type === 'int' || type === 'float' || type === 'double' || type === 'long' || type === 'number' ? 'number'
                         : type === 'enum' ? 'enum' : 'string'
          let enumLabels = []
          let enumValues = []
          let enumDisplay = ''
          if (uiType === 'enum') {
            // specs 可能是对象映射或数组
            if (Array.isArray(specs)) {
              enumValues = specs.map(i => i.value)
              enumLabels = specs.map(i => i.text || i.name || String(i.value))
            } else if (specs && typeof specs === 'object') {
              enumValues = Object.keys(specs)
              enumLabels = Object.values(specs).map(v => typeof v === 'string' ? v : (v?.text || ''))
            }
          }
          
          // 智能匹配实时数据字段
          const findRealTimeValue = (identifier, name, realTimeData) => {
            // 1. 直接匹配identifier
            if (realTimeData[identifier] !== undefined) {
              return realTimeData[identifier]
            }
            
            // 2. 匹配name
            if (realTimeData[name] !== undefined) {
              return realTimeData[name]
            }
            
            // 3. 常见字段映射
            const fieldMapping = {
              'height': ['height', '安装高度', 'installHeight'],
              'unmanned': ['unmanned', '无人时间', 'noPersonTime'],
              'threshold': ['threshold', '跌倒静态高度阈值', 'fallThreshold'],
              'DWT': ['DWT', '静止驻留时长'],
              'FRT': ['FRT', '跌倒时长'],
              'lamp': ['lamp', '灯', 'light'],
              'buz': ['buz', '蜂鸣器开关', 'buzzer']
            }
            
            // 4. 通过映射查找
            for (const [key, aliases] of Object.entries(fieldMapping)) {
              if (aliases.includes(identifier) || aliases.includes(name)) {
                if (realTimeData[key] !== undefined) {
                  return realTimeData[key]
                }
              }
            }
            
            // 5. 模糊匹配（包含关系）
            const keys = Object.keys(realTimeData)
            for (const key of keys) {
              if (key.toLowerCase().includes(identifier.toLowerCase()) || 
                  identifier.toLowerCase().includes(key.toLowerCase()) ||
                  (name && (key.toLowerCase().includes(name.toLowerCase()) || 
                           name.toLowerCase().includes(key.toLowerCase())))) {
                return realTimeData[key]
              }
            }
            
            return undefined
          }
          
          // 使用智能匹配获取实时数据值
          let realTimeValue = findRealTimeValue(p.identifier, p.name, realTimeData)
          
          // 处理布尔类型的数据转换
          if (uiType === 'bool' && realTimeValue !== undefined) {
            // 将 0/1 转换为 false/true
            realTimeValue = realTimeValue === 1 || realTimeValue === '1' || realTimeValue === true
          }
          
          const initVal = realTimeValue !== undefined ? realTimeValue 
                         : p.value !== undefined ? p.value 
                         : (uiType === 'bool' ? false : (uiType === 'number' ? '' : ''))
          
          
          if (uiType === 'enum') {
            const idx = enumValues.indexOf(initVal)
            enumDisplay = idx >= 0 ? enumLabels[idx] : (enumLabels[0] || '')
          }
          // 提取单位信息
          const unit = specs?.unit || ''
          
          return {
            identifier: p.identifier,
            name: p.name || p.identifier,
            desc: p.desc || '',
            unit: unit, // 单位信息
            uiType,
            value: initVal,
            tempValue: initVal, // 临时值，用于用户输入
            enumLabels,
            enumValues,
            enumDisplay: uiType === 'enum' ? enumDisplay : '',
            tempEnumDisplay: uiType === 'enum' ? enumDisplay : '' // 临时枚举显示值
          }
        })
        this.$set(this, 'paramProps', mapped)
      } catch (e) {
        this.$set(this, 'paramProps', [])
      }
    },
    
    // 切换报警设置
    toggleAlarm(alarm) {
      alarm.open = !alarm.open
      this.saveAlarmSettings()
    },
    
    // 保存报警设置
    async saveAlarmSettings() {
      try {
        const alarmSwitchStr = JSON.stringify(this.alarmSwitches)
        
        const response = await updateDevice({
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          deviceAlias: this.deviceInfo.deviceAlias,
          remark: this.deviceInfo.remark || '',
          enableStatus: this.deviceInfo.enableStatus,
          defenseStatus: this.deviceInfo.defenseStatus,
          alarmSwitch: alarmSwitchStr
        })
        
        if (response.code === 200) {
          this.deviceInfo.alarmSwitch = alarmSwitchStr
          uni.showToast({
            title: '设置已保存',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.msg || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存报警设置失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    },
    
    // 改变探测模式
    changeDetectMode() {
      this.settingParams.detectMode = !this.settingParams.detectMode
      uni.showToast({
        title: `已切换到${this.settingParams.detectMode ? '睡眠模式' : '实时模式'}`,
        icon: 'success'
      })
    },
    
    
     // 编辑设备
    editDevice(device) {
      // 填充编辑表单数据
      this.editForm = {
        deviceId: device.deviceId,
        deviceKey: device.deviceKey,
        deviceAlias: device.deviceAlias || '',
        remark: device.remark || ''
      }
      // 打开编辑弹窗
      this.$refs.editDevicePopup.open()
    },
    
    // 重置修改表单
    resetEditForm() {
      this.editForm = {
        deviceId: '',
        deviceKey: '',
        deviceAlias: '',
        remark: ''
      }
    },
    
    // 关闭修改设备弹窗
    closeEditDevice() {
      this.$refs.editDevicePopup.close()
    },
    
    // 确认修改设备
    async confirmEditDevice() {
      // 表单验证
      if (!this.editForm.deviceAlias.trim()) {
        uni.showToast({
          title: '请输入设备别名',
          icon: 'none'
        })
        return
      }
      
      this.submitting = true
      
      try {
        const response = await updateDevice({
          deviceId: this.editForm.deviceId,
          deviceKey: this.editForm.deviceKey,
          deviceAlias: this.editForm.deviceAlias.trim(),
          remark: this.editForm.remark.trim()
        })
        
        if (response.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          })
          
          this.closeEditDevice()
          this.loadDeviceDetail() // 重新加载设备详情
        } else {
          uni.showToast({
            title: response.msg || '修改失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('修改设备失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },
    
    // 删除设备
    deleteDevice() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除设备"${this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey}"吗？删除后无法恢复。`,
        success: async (res) => {
          if (res.confirm) {
            await this.performDeleteDevice()
          }
        }
      })
    },
    
    // 执行删除设备
    async performDeleteDevice() {
      try {
        uni.showLoading({ title: '删除中...' })
        
        const response = await delDevice(this.deviceId)
        
        if (response.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.msg || '删除失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('删除设备失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.device-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}


/* 设备信息卡片 */
.device-info-card {
  margin: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(62, 198, 198, 0.08);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.device-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ec6c6 0%, #2eb8b8 50%, #1fa5a5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(62, 198, 198, 0.3);
  
  .avatar-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 600;
  }
}

.device-basic {
  flex: 1;
}

.device-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.device-type {
  font-size: 24rpx;
  color: #3ec6c6;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  display: inline-block;
  margin-bottom: 12rpx;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  .status-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
  }
  
  text {
    font-size: 24rpx;
    font-weight: 500;
  }
  
  &.online {
    .status-dot {
      background: #4CAF50;
    }
    text {
      color: #4CAF50;
    }
  }
  
  &.offline {
    .status-dot {
      background: #f44336;
    }
    text {
      color: #f44336;
    }
  }
}

.device-keys {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 24rpx;
}

.key-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .key-label {
    font-size: 26rpx;
    color: #666;
    width: 140rpx;
  }
  
  .key-value {
    font-size: 26rpx;
    color: #333;
    font-family: monospace;
    flex: 1;
  }
}

/* 通用区块样式 */
.control-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 设置卡片网格 */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
  margin: 16rpx;
}

.setting-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
}

/* 操作卡片网格 */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
  margin: 16rpx;
}

.action-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
  
  &.secondary {
    border-color: rgba(62, 198, 198, 0.2);
    
    .card-title {
      color: #3ec6c6;
    }
  }
  
  &.danger {
    border-color: rgba(244, 67, 54, 0.2);
    
    .card-title {
      color: #f44336;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

/* 弹窗样式 */
.popup-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.popup-header .uni-icons {
  flex-shrink: 0;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

/* 控制项样式 */
.control-item,
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.control-info,
.setting-info {
  flex: 1;
}

.control-label,
.setting-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.control-desc,
.setting-desc {
  font-size: 22rpx;
  color: #999;
}

.control-status {
  font-size: 22rpx;
  color: #3ec6c6;
  font-weight: 500;
  margin-top: 4rpx;
  display: block;
}

.control-switch,
.setting-switch {
  transform: scale(0.9);
}

/* 参数设置样式 */
.param-input {
  width: 200rpx;
  height: 60rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  text-align: right;
  background: #fafafa;
}

.param-input:focus {
  border-color: #3ec6c6;
  background: #fff;
}

.param-picker-text {
  width: 200rpx;
  height: 60rpx;
  line-height: 60rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  text-align: right;
  background: #fafafa;
  color: #333;
}

/* 新的参数设置样式 */
.param-setting-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 16rpx 0;
}

.param-setting-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
}

.param-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.param-name-container {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.param-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0;
}

.param-unit {
  font-size: 24rpx;
  color: #666;
  font-weight: 400;
  margin-left: 4rpx;
}

.param-value-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  justify-content: flex-end;
}

.param-value-input {
  width: 200rpx;
  height: 64rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  background: #fff;
  box-sizing: border-box;
  flex-shrink: 0;
}

.param-value-input:focus {
  border-color: #3ec6c6;
}

.param-value-picker {
  width: 200rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  background: #fff;
  color: #333;
  text-align: left;
  flex-shrink: 0;
}

.param-switch {
  transform: scale(1.1);
}

.param-set-btn {
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  font-weight: 500;
  min-width: 80rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 编辑设备弹窗样式 */
.add-device-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.add-device-popup .popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #fafafa;
  position: relative;
}

.add-device-popup .popup-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.add-device-popup .popup-header .uni-icons {
  flex-shrink: 0;
}

.add-device-popup .popup-content {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-label.required::after {
  content: '*';
  color: #f44336;
  margin-left: 4rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #fff;
  box-sizing: border-box;
}

.form-input.disabled {
  background: #f5f5f5;
  color: #999;
}

.form-input:focus {
  border-color: #3ec6c6;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  background: #fff;
  box-sizing: border-box;
  resize: none;
}

.form-textarea:focus {
  border-color: #3ec6c6;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.popup-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fafafa;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #3ec6c6;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.confirm-btn[loading] {
  opacity: 0.7;
}

/* 加载状态 */
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

.card-desc {
  margin-top: 8rpx;
  
  text {
    font-size: 22rpx;
    color: #666;
  }
}
</style>