<template>
	<view class="network-config-page">
		<!-- 提示信息 -->
		<view class="notice-box">
			<text class="notice-text">*注：手机需开启WiFi功能，Android手机还需开启 定位 功能。</text>
			<text class="notice-text">*注：仅支持连接2.4GHz频段的WiFi 。</text>
		</view>
		
		<!-- WiFi名称 -->
		<view class="form-item">
			<view class="label-row">
				<text class="label-required">*</text>
				<text class="label-text">WiFi名称：</text>
			</view>
			<view class="input-row">
				<input 
					class="wifi-input" 
					v-model="wifiName" 
					placeholder="请输入WiFi名称"
					placeholder-class="input-placeholder"
				/>
				<button class="get-wifi-btn" @click="getCurrentWifi">获取当前WiFi</button>
			</view>
		</view>
		
		<!-- WiFi密码 -->
		<view class="form-item">
			<view class="label-row">
				<text class="label-text">WiFi密码：</text>
			</view>
			<view class="password-wrapper">
				<input 
					class="wifi-input password-input" 
					v-model="wifiPassword" 
					:password="!showPassword"
					placeholder="请输入密码"
					placeholder-class="input-placeholder"
				/>
				<view class="eye-icon" @click="togglePassword">
					<uni-icons :type="showPassword ? 'eye-filled' : 'eye-slash-filled'" size="24" color="#666"></uni-icons>
				</view>
			</view>
		</view>
		
		<!-- 使用上次配置 -->
		<view class="last-config-btn" @click="useLastConfig">
			<text class="last-config-text">使用上次配置的WiFi名称和密码</text>
		</view>
		
		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button class="reset-btn" @click="resetNetwork">重置设备网络</button>
			<button class="confirm-btn" @click="confirmConfig">确定</button>
		</view>
	</view>
</template>

<script>
import { resetDeviceNetwork } from '@/api/device.js'

export default {
	data() {
		return {
			deviceId: '', // 设备ID
			productKey: '', // 产品Key
			deviceKey: '', // 设备Key
			deviceBSSID: '', // 设备BSSID (productKey+deviceKey)
			wifiName: '', // WiFi名称
			wifiPassword: '', // WiFi密码
			showPassword: false, // 是否显示密码
			lastConfig: null, // 上次配置信息
			isUnloaded: false, // 页面卸载标志
			tcp: null, // TCP连接实例
			tcpFlag: false, // TCP连接状态
			wifiFlag: false, // WiFi连接状态
			retryCount: 0, // 重试次数
			tcpConnectResolve: null, // TCP连接Promise的resolve
			tcpConnectReject: null // TCP连接Promise的reject
		}
	},
	onLoad(options) {
		// 获取设备ID
		if (options.deviceId) {
			this.deviceId = options.deviceId
		}
		// 获取productKey和deviceKey
		if (options.productKey) {
			this.productKey = options.productKey
		}
		if (options.deviceKey) {
			this.deviceKey = options.deviceKey
		}
		// 设置设备BSSID
		if (this.productKey && this.deviceKey) {
			this.deviceBSSID = this.productKey + this.deviceKey
			console.log('设备BSSID:', this.deviceBSSID)
		}
		
		// 尝试从本地存储加载上次配置
		this.loadLastConfig()
	},
	onUnload() {
		this.isUnloaded = true
		
		// 关闭TCP连接
		if (this.tcp) {
			try {
				this.tcp.close()
				this.tcp = null
			} catch (e) {
				console.error('关闭TCP连接失败:', e)
			}
		}
		
		// 页面卸载时关闭WiFi模块
		uni.stopWifi({
			success: () => {
				console.log('WiFi模块已关闭')
			},
			fail: (err) => {
				console.log('关闭WiFi模块失败:', err)
			}
		})
	},
	methods: {
		// 获取当前连接的WiFi
		getCurrentWifi() {
			// 先初始化WiFi模块
			uni.startWifi({
				success: () => {
					// 获取已连接的WiFi信息
					uni.getConnectedWifi({
						success: (res) => {
							if (res.wifi && res.wifi.SSID) {
								this.wifiName = res.wifi.SSID
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
		
		// 切换密码显示状态
		togglePassword() {
			this.showPassword = !this.showPassword
		},
		
		// 从本地存储加载上次配置
		loadLastConfig() {
			try {
				const config = uni.getStorageSync('last_wifi_config')
				if (config) {
					this.lastConfig = JSON.parse(config)
				}
			} catch (e) {
				console.error('加载上次配置失败:', e)
			}
		},
		
		// 使用上次配置
		useLastConfig() {
			if (this.lastConfig) {
				this.wifiName = this.lastConfig.wifiName || ''
				this.wifiPassword = this.lastConfig.wifiPassword || ''
				uni.showToast({
					title: '已加载上次配置',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: '暂无历史配置',
					icon: 'none'
				})
			}
		},
		
		// 重置设备网络
		async resetNetwork() {
			// 检查设备信息
			if (!this.deviceId || !this.productKey || !this.deviceKey) {
				uni.showToast({
					title: '缺少设备信息',
					icon: 'none'
				})
				return
			}
			
			uni.showModal({
				title: '确认重置',
				content: '重置设备网络将清除设备当前的网络配置，设备将进入配网模式，是否继续？',
				confirmText: '确认重置',
				confirmColor: '#f44336',
				success: async (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '重置中...'
						})
						
						try {
							// 调用重置设备网络的API
							const response = await resetDeviceNetwork({
								deviceId: this.deviceId,
								productKey: this.productKey,
								deviceKey: this.deviceKey,
								ack: 1,
								address: null,
								propertyValue: {
									configmode: 1
								},
								type: null
							})
							
							uni.hideLoading()
							
							if (response.code === 200) {
								uni.showModal({
									title: '重置成功',
									content: '设备已进入配网模式，请稍后进行网络配置',
									showCancel: false,
									confirmText: '我知道了',
									success: () => {
										// 清空输入框
										this.wifiName = ''
										this.wifiPassword = ''
									}
								})
							} else {
								uni.showModal({
									title: '重置失败',
									content: response.msg || '操作失败，请重试',
									showCancel: false
								})
							}
						} catch (error) {
							uni.hideLoading()
							console.error('重置设备网络失败:', error)
							uni.showModal({
								title: '重置失败',
								content: '网络错误，请检查设备是否在线',
								showCancel: false
							})
						}
					}
				}
			})
		},
		
		// 确定配置
		confirmConfig() {
			// 验证WiFi名称
			if (!this.wifiName.trim()) {
				uni.showToast({
					title: '请输入WiFi名称',
					icon: 'none'
				})
				return
			}
			
			// 验证WiFi密码是否为空
			if (!this.wifiPassword || !this.wifiPassword.trim()) {
				uni.showModal({
					title: '提示',
					content: '您未输入WiFi密码，是否继续？',
					success: (res) => {
						if (res.confirm) {
							this.sendConfig()
						}
					}
				})
				return
			}
			
			// 验证WiFi密码长度
			if (this.wifiPassword.length < 8) {
				uni.showModal({
					title: '提示',
					content: 'WiFi密码长度不能少于8位，是否继续？',
					success: (res) => {
						if (res.confirm) {
							this.sendConfig()
						}
					}
				})
				return
			}
			
			this.sendConfig()
		},
		
		// 发送配置到设备
		async sendConfig() {
			// 保存到本地存储
			const config = {
				wifiName: this.wifiName,
				wifiPassword: this.wifiPassword,
				timestamp: Date.now()
			}
			uni.setStorageSync('last_wifi_config', JSON.stringify(config))
			
			// 检查是否有设备信息
			if (!this.deviceBSSID) {
				uni.showToast({
					title: '缺少设备信息',
					icon: 'none'
				})
				return
			}
			
			// 开始配网流程 - 先初始化WiFi模块
			uni.showLoading({
				title: '初始化WiFi...'
			})
			
			try {
				// 0. 初始化WiFi模块
				await this.initWifi()
				
				if (this.isUnloaded) return
				
				// 1. 连接设备WiFi
				uni.showLoading({
					title: '正在连接设备...'
				})
				await this.connectDeviceWifi()
				
				if (this.isUnloaded) return
				
				// 2. 建立TCP连接
				uni.showLoading({
					title: '正在建立连接...'
				})
				await this.createTcpConnection()
				
				if (this.isUnloaded) return
				
				// 3. 发送配网数据
				uni.showLoading({
					title: '正在配置网络...'
				})
				await this.sendConfigData()
				
			} catch (error) {
				uni.hideLoading()
				console.error('配网失败:', error)
				
				if (this.isUnloaded) return
				
				uni.showModal({
					title: '配置失败',
					content: error.message || '配网失败，请重试',
					showCancel: false
				})
			}
		},
		
		// 初始化WiFi模块
		initWifi() {
			return new Promise((resolve, reject) => {
				uni.startWifi({
					success: () => {
						console.log('WiFi模块初始化成功')
						resolve()
					},
					fail: (err) => {
						console.error('WiFi模块初始化失败:', err)
						reject(new Error('WiFi模块初始化失败，请确保已开启WiFi功能'))
					}
				})
			})
		},
		
		// 连接设备WiFi
		connectDeviceWifi() {
			return new Promise((resolve, reject) => {
				if (this.wifiFlag) {
					resolve()
					return
				}
				
				// #ifdef MP-WEIXIN
				wx.connectWifi({
					SSID: this.deviceBSSID,
					password: '88888888',
					success: (res) => {
						console.log('连接设备WiFi成功:', res)
						this.wifiFlag = true
						setTimeout(() => resolve(), 500)
					},
					fail: (err) => {
						console.error('连接设备WiFi失败:', err)
						reject(new Error('无法连接到设备WiFi，请确保设备处于配网模式'))
					}
				})
				// #endif
				
				// #ifndef MP-WEIXIN
				uni.connectWifi({
					SSID: this.deviceBSSID,
					password: '88888888',
					success: (res) => {
						console.log('连接设备WiFi成功:', res)
						this.wifiFlag = true
						setTimeout(() => resolve(), 500)
					},
					fail: (err) => {
						console.error('连接设备WiFi失败:', err)
						reject(new Error('无法连接到设备WiFi，请确保设备处于配网模式'))
					}
				})
				// #endif
			})
		},
		
		// 建立TCP连接
		createTcpConnection() {
			return new Promise((resolve, reject) => {
				if (this.isUnloaded) {
					reject(new Error('页面已卸载'))
					return
				}
				
				// 保存resolve和reject供回调使用
				this.tcpConnectResolve = resolve
				this.tcpConnectReject = reject
				
				// #ifdef MP-WEIXIN
				this.tcp = null
				this.tcp = wx.createTCPSocket()
				
				if (!this.tcp) {
					reject(new Error('创建TCP Socket失败'))
					return
				}
				
				// 绑定事件监听
				this.tcp.onConnect((res) => this.handleTcpConnect(res))
				this.tcp.onError((err) => this.handleTcpError(err))
				this.tcp.onClose(() => this.handleTcpClose())
				this.tcp.onMessage(() => this.handleTcpMessage())
				
				// 连接到设备
				this.tcp.connect({
					address: '192.168.4.1',
					port: 8120,
					timeout: 3
				})
				// #endif
				
				// #ifndef MP-WEIXIN
				// 非微信小程序环境暂不支持TCP
				reject(new Error('当前环境不支持TCP连接，请在微信小程序中使用'))
				// #endif
			})
		},
		
		// 处理TCP连接成功
		handleTcpConnect(res) {
			console.log('TCP连接成功回调:', res)
			if (this.isUnloaded) return
			
			// 检查连接是否有效
			if (res.remoteInfo.port == -1 || !res.remoteInfo.address || !res.remoteInfo.family) {
				console.log('TCP连接无效，准备重试:', this.retryCount)
				
				// 关闭当前连接
				if (this.tcp) {
					this.tcp.close()
				}
				
				// 重试逻辑
				if (this.retryCount < 3) {
					this.retryCount++
					console.log('开始第', this.retryCount, '次重试')
					setTimeout(() => {
						if (this.isUnloaded) return
						this.createTcpConnection()
							.then(this.tcpConnectResolve)
							.catch(this.tcpConnectReject)
					}, 500)
				} else {
					console.log('重试次数已达上限')
					if (this.tcpConnectReject) {
						this.tcpConnectReject(new Error('TCP连接失败，请重试'))
					}
				}
				return
			}
			
			// 连接有效，重置重试次数
			console.log('TCP连接有效，开始发送数据')
			this.retryCount = 0
			this.tcpFlag = true
			
			// 在TCP连接成功后直接发送配网数据
			this.sendConfigDataDirectly()
		},
		
		// 处理TCP错误
		handleTcpError(err) {
			console.error('TCP连接错误:', err)
			// 不要在这里reject，让重连机制处理
		},
		
		// 处理TCP关闭
		handleTcpClose() {
			console.log('TCP连接已关闭')
			this.tcpFlag = false
		},
		
		// 处理TCP消息
		handleTcpMessage() {
			// 可以在这里处理设备返回的消息
			console.log('收到TCP消息')
		},
		
		// 发送配网数据（保留此方法供Promise链调用）
		sendConfigData() {
			return Promise.resolve()
		},
		
		// 直接发送配网数据（在TCP连接成功回调中调用）
		sendConfigDataDirectly() {
			if (this.isUnloaded) return
			
			if (!this.tcpFlag || !this.tcp) {
				if (this.tcpConnectReject) {
					this.tcpConnectReject(new Error('TCP连接未建立'))
				}
				return
			}
			
			try {
				// 发送WiFi配置信息
				const configMsg = '$1$' + this.wifiName + (this.wifiPassword ? ',' + this.wifiPassword : ',')
				console.log('发送配置信息:', configMsg)
				this.tcp.write(configMsg)
				
				// 2秒后发送确认信息
				setTimeout(() => {
					if (this.isUnloaded || !this.tcp) return
					
					console.log('发送确认信息: $9$')
					this.tcp.write('$9$')
					
					// 再2秒后关闭连接
					setTimeout(() => {
						if (this.tcp) {
							this.tcp.close()
							this.tcp = null
						}
						this.tcpFlag = false
						this.wifiFlag = false
						
						uni.hideLoading()
						
						if (this.isUnloaded) return
						
						uni.showModal({
							title: '配置完成',
							content: '网络配置已发送到设备，设备正在连接网络，请查看设备是否在线！',
							showCancel: false,
							confirmText: '确定',
							success: () => {
								uni.navigateBack()
							}
						})
						
						// 通知Promise完成
						if (this.tcpConnectResolve) {
							this.tcpConnectResolve()
						}
					}, 2000)
				}, 2000)
				
			} catch (error) {
				console.error('发送数据失败:', error)
				if (this.tcpConnectReject) {
					this.tcpConnectReject(new Error('发送配置信息失败'))
				}
			}
		}
	}
}
</script>

<style scoped>
.network-config-page {
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

/* 表单项 */
.form-item {
	background: #fff;
	padding: 32rpx;
	margin-bottom: 2rpx;
}

.label-row {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
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
	position: relative;
}

.wifi-input {
	flex: 1;
	height: 80rpx;
	padding: 0 24rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333;
}

.input-placeholder {
	color: #999;
}

.get-wifi-btn {
	flex-shrink: 0;
	height: 80rpx;
	padding: 0 24rpx;
	background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
	color: #fff;
	font-size: 26rpx;
	border-radius: 12rpx;
	border: none;
	line-height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.get-wifi-btn::after {
	border: none;
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
	cursor: pointer;
}

/* 使用上次配置按钮 */
.last-config-btn {
	padding: 32rpx;
	text-align: center;
}

.last-config-text {
	font-size: 28rpx;
	color: #3ec6c6;
	font-weight: 500;
}

/* 操作按钮 */
.action-buttons {
	display: flex;
	gap: 24rpx;
	padding: 48rpx 32rpx;
}

.reset-btn,
.confirm-btn {
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
	padding: 0;
}

.reset-btn::after,
.confirm-btn::after {
	border: none;
}

.reset-btn {
	background: #f44336;
	color: #fff;
}

.confirm-btn {
	background: #4caf50;
	color: #fff;
}

.reset-btn:active {
	opacity: 0.8;
}

.confirm-btn:active {
	opacity: 0.8;
}
</style>
