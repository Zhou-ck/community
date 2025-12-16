<template>
	<view class="bluetooth-config-page">
		<!-- 提示信息 -->
		<view class="notice-box">
			<text class="notice-text">*注：请确保手机蓝牙已开启,设备处于配网模式。</text>
			<text class="notice-text">*注：仅支持连接2.4GHz频段的WiFi。</text>
		</view>
		
		<!-- 步骤指示器 -->
		<view class="steps-indicator">
			<view v-for="(step, index) in steps" :key="index" 
						:class="['step-item', currentStep > index + 1 ? 'completed' : '', currentStep === index + 1 ? 'active' : '']">
				<view class="step-number">{{ index + 1 }}</view>
				<text class="step-label">{{ step }}</text>
				<view v-if="index < steps.length - 1" class="step-line"></view>
			</view>
		</view>

		<!-- 步骤1: 扫描并连接设备 -->
		<view v-if="currentStep === 1" class="step-content scan-step-content">
			<view class="scan-visual-area" v-if="!scanning && !(hasScanned && devices.length === 0)">
				<view class="radar-circle">
					<uni-icons type="search" size="40" color="#3ec6c6"></uni-icons>
					<view class="radar-wave wave-1"></view>
					<view class="radar-wave wave-2"></view>
				</view>
			</view>
			
			<view class="content-header" v-if="!scanning && !(hasScanned && devices.length === 0)">
				<text class="content-title">扫描设备</text>
				<text class="content-desc">请确保设备已进入配网模式</text>
			</view>

			<button v-if="!scanning && !(hasScanned && devices.length === 0)" @click="startScan" class="scan-btn">
				{{ devices.length > 0 ? '重新扫描' : '开始扫描' }}
			</button>
			
			<view v-if="scanning" class="scanning-box">
				<view class="loading-spinner"></view>
				<text class="scanning-text">正在扫描设备...</text>
			</view>

			<view v-if="devices.length > 0" class="device-list">
				<view v-for="device in devices" :key="device.deviceId" 
							class="device-item" @click="connectDevice(device)">
					<view class="device-info">
						<text class="device-name">{{ device.name }}</text>
						<text class="device-id">{{ device.deviceId }}</text>
					</view>
					<view class="device-signal">
						<text class="signal-text">{{ device.RSSI }}dBm</text>
					</view>
				</view>
			</view>

			<view v-if="!scanning && devices.length === 0 && hasScanned" class="empty-state">
				<view class="empty-icon-wrapper">
					<uni-icons type="search" size="40" color="#999"></uni-icons>
				</view>
				<text class="empty-title">未搜索到设备</text>
				<view class="empty-tips-list">
					<text class="tip-item">1. 请确保设备已接通电源</text>
					<text class="tip-item">2. 请确保设备处于配网模式（指示灯闪烁）</text>
					<text class="tip-item">3. 尝试将手机尽量靠近设备</text>
				</view>
				<button class="retry-scan-btn" @click="startScan">重新扫描</button>
			</view>
		</view>

		<!-- 步骤2: 输入WiFi信息 -->
		<view v-if="currentStep === 2" class="step-content">
			<view class="content-header">
				<text class="content-title">WiFi配置</text>
				<text class="content-desc">请输入要连接的WiFi信息</text>
			</view>

			<!-- WiFi名称 -->
			<view class="form-item">
				<view class="label-row">
					<text class="label-required">*</text>
					<text class="label-text">WiFi名称：</text>
				</view>
				<view class="input-row">
					<input 
						class="wifi-input flex-1" 
						v-model="ssid" 
						placeholder="请输入WiFi名称"
						placeholder-class="input-placeholder"
					/>
					<button class="get-wifi-btn" @click="getCurrentWifi">获取当前WiFi</button>
				</view>
				<text class="form-hint">仅支持2.4GHz频段的WiFi</text>
			</view>
			
			<!-- WiFi密码 -->
			<view class="form-item">
				<view class="label-row">
					<text class="label-text">WiFi密码：</text>
				</view>
				<view class="password-wrapper">
					<input 
						class="wifi-input password-input" 
						v-model="password" 
						:password="!showPassword"
						placeholder="开放WiFi可留空"
						placeholder-class="input-placeholder"
					/>
					<view class="eye-icon" @click="togglePassword">
						<uni-icons :type="showPassword ? 'eye-filled' : 'eye-slash-filled'" size="24" color="#666"></uni-icons>
					</view>
				</view>
				<text class="form-hint">密码需要为空或至少8位</text>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="back-btn" @click="goBack">返回</button>
				<button class="confirm-btn" @click="startConfig" :disabled="!canConfig">开始配网</button>
			</view>
		</view>

		<!-- 步骤3: 配网进度 -->
		<view v-if="currentStep === 3" class="step-content">
			<view class="content-header">
				<text class="content-title">{{ configSuccess ? '配网成功' : configFailed ? '配网失败' : '配网中' }}</text>
			</view>

			<view class="config-progress">
				<view v-if="!configSuccess && !configFailed" class="loading-spinner"></view>
				<view v-if="configSuccess" class="success-icon">✓</view>
				<view v-if="configFailed" class="error-icon">✗</view>
				
				<text class="status-text">{{ statusMessage }}</text>
				<text class="status-detail">{{ statusDetail }}</text>
			</view>

			<view class="action-buttons" v-if="configFailed">
				<button class="retry-btn" @click="retryConfig">重新配置</button>
			</view>
			
			<view class="action-buttons" v-if="!configSuccess && !configFailed">
				<button class="cancel-btn" @click="cancelConfig">取消</button>
			</view>
		</view>
	</view>
</template>

<script>
import { BLUETOOTH_CONFIG } from '@/utils/bluetooth-config'

export default {
  data() {
    return {
      deviceName: '',
      currentStep: 1,
      steps: ['扫描设备', 'WiFi配置', '配网中'],
      
      // 步骤1: 扫描设备
      scanning: false,
      hasScanned: false, // 是否已执行过扫描
      devices: [],
      currentDevice: null,
      
      // 步骤2: WiFi配置
      ssid: '',
      password: '',
      showPassword: false, // 是否显示密码
      
      // 步骤3: 配网状态
      statusMessage: '',
      statusDetail: '',
      configSuccess: false,
      configFailed: false,
      
      // BLE相关
      serviceId: '',
      charSSID: '',
      charPass: ''
    }
  },
  
  computed: {
    canConfig() {
      // SSID不为空，密码要么为空要么至少8位
      const ssidValid = this.ssid.trim().length > 0
      const passwordValid = this.password.length === 0 || this.password.length >= 8
      return ssidValid && passwordValid
    }
  },
  
  onLoad(options) {
    this.deviceName = options.device || ''
    this.initBluetooth()
  },
  
  onUnload() {
    this.cleanup()
  },
  
  methods: {
    // 初始化蓝牙
    async initBluetooth() {
      try {
        await uni.openBluetoothAdapter()
        
        uni.onBluetoothAdapterStateChange((res) => {
          if (!res.available) {
            uni.showToast({ title: '请打开蓝牙', icon: 'none' })
          }
        })
      } catch (e) {
        uni.showModal({
          title: '蓝牙初始化失败',
          content: '请检查蓝牙权限设置',
          showCancel: false,
          success: () => {
            uni.navigateBack()
          }
        })
      }
    },
    
    // 开始扫描设备
    async startScan() {
      this.devices = []
      this.scanning = true
      this.hasScanned = true
      
      try {
        await uni.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: false
        })
        
        uni.onBluetoothDeviceFound((res) => {
          res.devices.forEach((device) => {
            // 调试：打印所有发现的设备
            console.log('发现蓝牙设备:', {
              name: device.name,
              localName: device.localName,
              deviceId: device.deviceId,
              RSSI: device.RSSI
            })
            
            // 获取设备名称（优先使用 localName，其次使用 name）
            const deviceName = device.localName || device.name
            
            // 扩展设备过滤逻辑：支持多种设备类型
            const isValidDevice = deviceName && (
              deviceName.startsWith('L') ||          // L系列设备
              deviceName.startsWith('La') ||         // La系列设备  
              /^[A-Z]+\d+$/.test(deviceName)         // 字母+数字格式的设备
            )
            
            if (isValidDevice) {
              const exists = this.devices.find((d) => d.deviceId === device.deviceId)
              if (!exists) {
                // 确保显示的名称是有效的
                this.devices.push({
                  ...device,
                  name: deviceName
                })
              }
            }
          })
        })
        
        // 30秒后停止扫描
        setTimeout(() => {
          uni.stopBluetoothDevicesDiscovery()
          this.scanning = false
        }, BLUETOOTH_CONFIG.SCAN_TIMEOUT)
      } catch (e) {
        const errorMsg = this.getBluetoothErrorMessage(e)
        console.error('蓝牙扫描失败:', e)
        uni.showToast({ title: errorMsg, icon: 'none' })
        this.scanning = false
      }
    },
    
    // 连接设备
    async connectDevice(device) {
      uni.showLoading({ title: '连接中...' })
      this.currentDevice = device
      
      try {
        // 停止扫描
        await uni.stopBluetoothDevicesDiscovery()
        this.scanning = false
        
        // 连接设备
        await uni.createBLEConnection({
          deviceId: device.deviceId,
          timeout: BLUETOOTH_CONFIG.CONNECT_TIMEOUT
        })
        
        // 等待设备服务就绪
        await this.sleep(1000)
        
        // 获取服务列表
        const servicesResult = await uni.getBLEDeviceServices({
          deviceId: device.deviceId
        })
        
        // 处理uniapp BLE API的数组返回格式
        let services
        if (Array.isArray(servicesResult)) {
          // 查找有效的服务数据（通常在数组的第二个元素）
          services = servicesResult.find(item => item && item.services)
        } else {
          services = servicesResult
        }
        
        // 安全检查返回值
        if (!services || !services.services || !Array.isArray(services.services)) {
          console.error('服务列表获取失败:', servicesResult)
          throw new Error('获取设备服务列表失败')
        }
        
        
        // 查找配网服务
        const configService = services.services.find((s) => 
          s && s.uuid && s.uuid.toUpperCase().includes('00FF')
        )
        
        if (!configService) {
          throw new Error('未找到配网服务(00FF)')
        }
        
        this.serviceId = configService.uuid
        
        // 等待服务特征值就绪
        await this.sleep(500)
        
        // 获取特征值
        const charsResult = await uni.getBLEDeviceCharacteristics({
          deviceId: device.deviceId,
          serviceId: this.serviceId
        })
        
        // 处理uniapp BLE API的数组返回格式
        let chars
        if (Array.isArray(charsResult)) {
          // 查找有效的特征值数据
          chars = charsResult.find(item => item && item.characteristics)
        } else {
          chars = charsResult
        }
        
        // 安全检查返回值
        if (!chars || !chars.characteristics || !Array.isArray(chars.characteristics)) {
          console.error('特征值获取失败:', charsResult)
          throw new Error('获取设备特征值失败')
        }
        
        
        // 保存SSID和密码特征值的UUID
        chars.characteristics.forEach((char) => {
          if (!char || !char.uuid) return
          
          const uuid = char.uuid.toUpperCase()
          if (uuid.includes('FF05')) {
            this.charSSID = char.uuid
          }
          else if (uuid.includes('FF06')) {
            this.charPass = char.uuid
          }
        })
        
        if (!this.charSSID || !this.charPass) {
          throw new Error('未找到必需的特征值(FF05/FF06)')
        }
        
        uni.hideLoading()
        uni.showToast({ title: '连接成功', icon: 'success' })
        
        // 进入WiFi配置步骤
        this.currentStep = 2
      } catch (e) {
        uni.hideLoading()
        const errorMsg = this.getBluetoothErrorMessage(e)
        console.error('蓝牙连接失败:', e)
        uni.showToast({ title: errorMsg, icon: 'none' })
      }
    },
    
    // 切换密码显示状态
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 获取当前连接的WiFi网络名称
    getCurrentWifi() {
      // 先初始化WiFi模块
      uni.startWifi({
        success: () => {
          // 获取已连接的WiFi信息
          uni.getConnectedWifi({
            success: (res) => {
              if (res.wifi && res.wifi.SSID) {
                this.ssid = res.wifi.SSID
                uni.showToast({
                  title: '已获取WiFi名称',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: '未连接WiFi',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.error('获取WiFi失败:', err)
              let errorMsg = '获取WiFi失败'
              
              // 根据错误码提供更友好的提示
              if (err.errCode === 12000) {
                errorMsg = '未打开WiFi开关'
              } else if (err.errCode === 12001) {
                errorMsg = '未连接到WiFi'
              } else if (err.errCode === 12002) {
                errorMsg = '需要授权定位权限'
              }
              
              uni.showModal({
                title: '提示',
                content: errorMsg + '，请确保已开启WiFi和定位权限',
                showCancel: false
              })
            }
          })
        },
        fail: (err) => {
          console.error('初始化WiFi模块失败:', err)
          uni.showModal({
            title: '提示',
            content: '初始化WiFi模块失败，请确保已开启WiFi功能',
            showCancel: false
          })
        }
      })
    },
    
    // 返回上一步
    goBack() {
      if (this.currentStep === 2) {
        // 断开BLE连接
        try {
          if (this.currentDevice) {
            uni.closeBLEConnection({
              deviceId: this.currentDevice.deviceId
            })
          }
        } catch (e) {}
        
        this.currentStep = 1
        this.ssid = ''
        this.password = ''
      }
    },
    
    // 分包写入BLE特征值（通过slice清洗buffer，解决GATT错误）
    async writeBLECharacteristicValueChunked(deviceId, serviceId, characteristicId, data) {
      const MTU_SIZE = 20
      const dataView = new Uint8Array(data)
      
      for (let i = 0; i < dataView.length; i += MTU_SIZE) {
        const chunkSize = Math.min(MTU_SIZE, dataView.length - i)
        const chunk = dataView.slice(i, i + chunkSize)
        
        await uni.writeBLECharacteristicValue({
          deviceId: deviceId,
          serviceId: serviceId,
          characteristicId: characteristicId,
          value: chunk.buffer
        })
        
        if (i + chunkSize < dataView.length) {
          await this.sleep(100)
        }
      }
    },
    
    // 开始配网
    async startConfig() {
      if (!this.canConfig) {
        uni.showToast({ title: '请输入完整的WiFi信息', icon: 'none' })
        return
      }
      
      this.currentStep = 3
      this.configSuccess = false
      this.configFailed = false
      this.statusMessage = '正在发送WiFi配置...'
      this.statusDetail = ''
      
      try {
        // 发送SSID
        this.statusMessage = '正在发送SSID...'
        await this.writeBLECharacteristicValueChunked(
          this.currentDevice.deviceId,
          this.serviceId,
          this.charSSID,
          this.str2ab(this.ssid)
        )
        
        await this.sleep(500)
        
        // 发送密码
        this.statusMessage = '正在发送密码...'
        await this.writeBLECharacteristicValueChunked(
          this.currentDevice.deviceId,
          this.serviceId,
          this.charPass,
          this.str2ab(this.password)
        )
        
        // 配置发送成功
        this.statusMessage = '配网完成！'
        this.statusDetail = '设备已收到WiFi配置，请在设备管理中查看上线状态'
        
        // 断开蓝牙连接
        try {
          uni.closeBLEConnection({
            deviceId: this.currentDevice.deviceId
          })
        } catch (e) {}
        
        // 显示配网成功
        this.configSuccess = true
        this.configFailed = false
        
        // 2秒后返回
        await this.sleep(2000)
        uni.navigateBack()
        
      } catch (e) {
        this.configFailed = true
        this.configSuccess = false
        this.statusMessage = '发送配置失败'
        const errorMsg = this.getBluetoothErrorMessage(e)
        this.statusDetail = errorMsg
        console.error('WiFi配置发送失败:', e)
      }
    },
    
    
    // 取消配网
    cancelConfig() {
      this.currentStep = 2
      this.configSuccess = false
      this.configFailed = false
    },
    
    // 重试配网
    retryConfig() {
      this.currentStep = 2
      this.configSuccess = false
      this.configFailed = false
      this.password = ''  // 清空密码，让用户重新输入
    },
    
    // ArrayBuffer转字符串
    ab2str(buffer) {
      const dataView = new Uint8Array(buffer)
      let str = ''
      for (let i = 0; i < dataView.length; i++) {
        str += String.fromCharCode(dataView[i])
      }
      return str
    },
    
    // 字符串转ArrayBuffer（支持UTF-8编码，正确处理中文）
    str2ab(str) {
      // 手动实现UTF-8编码（兼容性更好）
      const utf8 = []
      for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i)
        if (charcode < 0x80) {
          utf8.push(charcode)
        } else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f))
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f))
        } else {
          // UTF-16 代理对
          i++
          charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
          utf8.push(
            0xf0 | (charcode >> 18),
            0x80 | ((charcode >> 12) & 0x3f),
            0x80 | ((charcode >> 6) & 0x3f),
            0x80 | (charcode & 0x3f)
          )
        }
      }
      const buffer = new ArrayBuffer(utf8.length)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < utf8.length; i++) {
        view[i] = utf8[i]
      }
      return buffer
    },
    
    // 获取友好的蓝牙错误信息
    getBluetoothErrorMessage(error) {
      const errMsg = error.errMsg || error.message || error.toString()
      
      // 常见错误码映射
      const errorMap = {
        '10000': '未初始化蓝牙适配器',
        '10001': '当前蓝牙适配器不可用',
        '10002': '没有找到指定设备', 
        '10003': '连接失败',
        '10004': '没有找到指定服务',
        '10005': '没有找到指定特征值',
        '10006': '当前连接已断开',
        '10007': '当前特征值不支持此操作',
        '10008': '其余所有系统上报的异常',
        '10009': 'Android 系统特有，系统版本低于 4.3 不支持BLE',
        '10012': '连接超时',
        '10013': '连接 deviceId 为空或者是格式不正确'
      }
      
      // 提取错误码
      const codeMatch = errMsg.match(/(\d{5})/)
      if (codeMatch && errorMap[codeMatch[1]]) {
        return errorMap[codeMatch[1]]
      }
      
      // 关键字匹配
      if (errMsg.includes('timeout')) {
        return '连接超时，请确保设备在附近且处于配网模式'
      }
      if (errMsg.includes('not found')) {
        return '未找到设备，请确保设备已进入配网模式'
      }
      if (errMsg.includes('permission')) {
        return '缺少蓝牙权限，请在设置中开启蓝牙权限'
      }
      if (errMsg.includes('unavailable')) {
        return '蓝牙不可用，请开启手机蓝牙功能'
      }
      
      return errMsg || '操作失败，请重试'
    },
    
    // 延迟函数
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    // 清理资源
    cleanup() {
      try {
        uni.stopBluetoothDevicesDiscovery()
      } catch (e) {}
      
      try {
        if (this.currentDevice) {
          uni.closeBLEConnection({
            deviceId: this.currentDevice.deviceId
          })
        }
      } catch (e) {}
      
      try {
        uni.closeBluetoothAdapter()
      } catch (e) {}
      
      // 关闭WiFi模块
      try {
        uni.stopWifi()
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.bluetooth-config-page {
	min-height: 100vh;
	background: #f5f5f5;
}

/* 提示信息 */
.notice-box {
	padding: 24rpx 32rpx;
	background: #fff;
	margin-bottom: 24rpx;
}

.notice-text {
	display: block;
	font-size: 26rpx;
	color: #f44336;
	line-height: 40rpx;
	margin-bottom: 8rpx;
}

.notice-text:last-child {
	margin-bottom: 0;
}

/* 步骤指示器 */
.steps-indicator {
	background: #fff;
	padding: 32rpx;
	margin-bottom: 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.step-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

.step-number {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: #e0e0e0;
	color: #999;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 12rpx;
	z-index: 2;
}

.step-item.active .step-number {
	background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
	color: #fff;
}

.step-item.completed .step-number {
	background: #4caf50;
	color: #fff;
}

.step-label {
	font-size: 24rpx;
	color: #999;
	text-align: center;
}

.step-item.active .step-label {
	color: #3ec6c6;
	font-weight: 600;
}

.step-item.completed .step-label {
	color: #4caf50;
}

.step-line {
	position: absolute;
	top: 32rpx;
	left: 50%;
	width: 100%;
	height: 2rpx;
	background: #e0e0e0;
	z-index: 1;
}

.step-item.completed .step-line {
	background: #4caf50;
}

/* 步骤内容 */
.step-content {
	background: #fff;
	padding: 40rpx 32rpx;
	margin-bottom: 24rpx;
	min-height: 40vh; /* 增加最小高度 */
	display: flex;
	flex-direction: column;
}

/* 扫描步骤特定样式 */
.scan-step-content {
	justify-content: center;
	align-items: center;
}

.scan-visual-area {
	margin-bottom: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.radar-circle {
	width: 120rpx; /* 缩小尺寸 */
	height: 120rpx;
	background: #f0fcfc; /* 改为浅色背景 */
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	/* 移除原来的阴影，改为更淡的 */
}

.radar-wave {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	border: 2rpx solid #e0f8f8; /* 变淡波纹颜色 */
	border-radius: 50%;
	opacity: 0;
	z-index: -1;
}

.wave-1 {
	width: 120rpx;
	height: 120rpx;
	animation: radarWave 2s infinite ease-out;
}

.wave-2 {
	width: 120rpx;
	height: 120rpx;
	animation: radarWave 2s infinite ease-out 0.6s;
}

@keyframes radarWave {
	0% {
		width: 120rpx;
		height: 120rpx;
		opacity: 0.8;
	}
	100% {
		width: 240rpx; /* 减小扩散范围 */
		height: 240rpx;
		opacity: 0;
	}
}

.content-header {
	margin-bottom: 60rpx; /* 增加标题和内容的间距 */
	text-align: center;
}

.content-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	display: block;
	margin-bottom: 12rpx;
}

.content-desc {
	font-size: 26rpx;
	color: #999;
	display: block;
}

/* 扫描按钮 */
.scan-btn {
	width: 80%; /* 稍微收窄按钮宽度 */
	height: 96rpx;
	line-height: 96rpx;
	background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
	color: #fff;
	font-size: 34rpx;
	font-weight: 500;
	border-radius: 48rpx;
	border: none;
	margin-bottom: 24rpx;
	box-shadow: 0 10rpx 20rpx rgba(62, 198, 198, 0.3); /* 增加按钮投影 */
	transition: all 0.3s;
}

.scan-btn:active {
	transform: scale(0.98);
	box-shadow: 0 5rpx 10rpx rgba(62, 198, 198, 0.2);
}

.scan-btn::after {
	border: none;
}

/* 扫描指示器 */
.scanning-box {
	text-align: center;
	padding: 60rpx 0;
}

.scanning-text {
	font-size: 28rpx;
	color: #3ec6c6;
	margin-top: 24rpx;
	display: block;
}

/* 设备列表 */
.device-list {
	margin-top: 24rpx;
}

.device-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	margin-bottom: 16rpx;
}

.device-item:active {
	background: #f0f0f0;
}

.device-info {
	flex: 1;
}

.device-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.device-id {
	font-size: 24rpx;
	color: #999;
	display: block;
}

.device-signal {
	flex-shrink: 0;
	padding: 8rpx 16rpx;
	background: #e8f5f5;
	border-radius: 8rpx;
}

.signal-text {
	font-size: 24rpx;
	color: #3ec6c6;
	font-weight: 500;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 32rpx;
	margin-top: 40rpx;
}

.empty-icon-wrapper {
	width: 120rpx;
	height: 120rpx;
	background: #f5f5f5;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.empty-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 32rpx;
}

.empty-tips-list {
	width: 100%;
	background: #f9f9f9;
	padding: 24rpx 32rpx;
	border-radius: 12rpx;
	margin-bottom: 40rpx;
}

.tip-item {
	display: block;
	font-size: 26rpx;
	color: #666;
	line-height: 2;
}

.retry-scan-btn {
	width: 280rpx;
	height: 72rpx;
	line-height: 72rpx;
	background: #fff;
	color: #3ec6c6;
	border: 2rpx solid #3ec6c6;
	border-radius: 36rpx;
	font-size: 28rpx;
	font-weight: 500;
}

.retry-scan-btn::after {
	border: none;
}

.retry-scan-btn:active {
	background: #f0fcfc;
}

/* 表单项 */
.form-item {
	margin-bottom: 32rpx;
}

.label-row {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.label-required {
	color: #f44336;
	font-size: 32rpx;
	margin-right: 4rpx;
}

.label-text {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.input-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.wifi-input {
	width: 100%;
	height: 80rpx;
	padding: 0 24rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}

.flex-1 {
	flex: 1;
}

.get-wifi-btn {
	padding: 0 24rpx;
	height: 80rpx;
	line-height: 80rpx;
	background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
	color: #fff;
	font-size: 24rpx;
	border-radius: 12rpx;
	border: none;
	white-space: nowrap;
}

.input-placeholder {
	color: #999;
}

.password-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.password-input {
	padding-right: 80rpx;
}

.eye-icon {
	position: absolute;
	right: 24rpx;
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.form-hint {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-top: 12rpx;
	line-height: 1.5;
}

/* 操作按钮 */
.action-buttons {
	display: flex;
	gap: 24rpx;
	margin-top: 48rpx;
}

.back-btn,
.confirm-btn,
.retry-btn,
.cancel-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 12rpx;
	font-size: 32rpx;
	font-weight: 500;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-btn::after,
.confirm-btn::after,
.retry-btn::after,
.cancel-btn::after {
	border: none;
}

.back-btn {
	background: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background: #4caf50;
	color: #fff;
}

.confirm-btn:disabled {
	background: #d9d9d9;
	color: #999;
}

.retry-btn {
	background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
	color: #fff;
}

.cancel-btn {
	background: #f44336;
	color: #fff;
}

/* 配网进度 */
.config-progress {
	text-align: center;
	padding: 60rpx 0;
}

.loading-spinner {
	width: 80rpx;
	height: 80rpx;
	border: 6rpx solid #f5f5f5;
	border-top-color: #3ec6c6;
	border-radius: 50%;
	margin: 0 auto 30rpx;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.success-icon {
	width: 120rpx;
	height: 120rpx;
	background: #4caf50;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 80rpx;
	font-weight: bold;
	margin: 0 auto 30rpx;
}

.error-icon {
	width: 120rpx;
	height: 120rpx;
	background: #f44336;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 80rpx;
	font-weight: bold;
	margin: 0 auto 30rpx;
}

.status-text {
	font-size: 30rpx;
	font-weight: 500;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
}

.status-detail {
	font-size: 26rpx;
	color: #999;
	display: block;
}
</style>
