<template>
	<view class="network-config-page">
		<view class="notice-box">
			<text class="notice-text">*注：手机需开启WiFi功能，Android手机还需开启 定位 功能。</text>
			<text class="notice-text">*注：仅支持连接2.4GHz频段的WiFi 。</text>
		</view>
		
		<view class="form-item">
			<view class="label-row">
				<text class="label-required">*</text>
				<text class="label-text">WiFi名称：</text>
			</view>
			<view class="input-row">
				<input class="wifi-input" v-model="wifiName" placeholder="请输入WiFi名称" placeholder-class="input-placeholder" />
				<button class="get-wifi-btn" @click="getCurrentWifi">获取当前WiFi</button>
			</view>
		</view>
		
		<view class="form-item">
			<view class="label-row">
				<text class="label-text">WiFi密码：</text>
			</view>
			<view class="password-wrapper">
				<input class="wifi-input password-input" v-model="wifiPassword" :password="!showPassword" placeholder="请输入密码" placeholder-class="input-placeholder" />
				<view class="eye-icon" @click="togglePassword">
					<uni-icons :type="showPassword ? 'eye-filled' : 'eye-slash-filled'" size="24" color="#666"></uni-icons>
				</view>
			</view>
		</view>
		
		<view class="last-config-btn" @click="useLastConfig">
			<text class="last-config-text">使用上次配置的WiFi名称和密码</text>
		</view>
		
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
			deviceId: '',
			productKey: '',
			deviceKey: '',
			deviceBSSID: '',
			wifiName: '',
			wifiPassword: '',
			showPassword: false,
			lastConfig: null,
			isUnloaded: false,
			tcp: null,
			tcpFlag: false,
			wifiFlag: false,
			retryCount: 0,
			tcpConnectResolve: null,
			tcpConnectReject: null,
			userPhoneOS: 'android'
		}
	},
	onLoad(options) {
		if (options.deviceId) this.deviceId = options.deviceId
		if (options.productKey) this.productKey = options.productKey
		if (options.deviceKey) this.deviceKey = options.deviceKey
		if (this.productKey && this.deviceKey) {
			this.deviceBSSID = this.productKey + this.deviceKey
			console.log('设备BSSID:', this.deviceBSSID)
		}
		this.loadLastConfig()
		// 获取手机系统类型
		const deviceInfo = wx.getDeviceInfo()
		this.userPhoneOS = deviceInfo.platform === 'ios' ? 'ios' : 'android'
	},
	onUnload() {
		this.isUnloaded = true
		if (this.tcp) {
			try { this.tcp.close() } catch (e) {}
			this.tcp = null
		}
		uni.stopWifi({ success: () => {}, fail: () => {} })
	},
	methods: {
		// 获取当前连接的WiFi
		getCurrentWifi() {
			// #ifdef MP-WEIXIN
			// iOS 不需要位置权限，直接获取
			if (this.userPhoneOS === 'ios') {
				this.doGetConnectedWifi()
				return
			}
			// Android 需要走位置权限流程
			wx.getSetting({
				success: (settingRes) => {
					const locationAuth = settingRes.authSetting['scope.userLocation']
					console.log('[WiFi] getSetting结果:', JSON.stringify(settingRes.authSetting))
					console.log('[WiFi] locationAuth值:', locationAuth, '类型:', typeof locationAuth)

					if (locationAuth === false) {
						console.log('[WiFi] 分支: 已拒绝过 → 引导去设置页')
						uni.showModal({
							title: '需要位置权限',
							content: '获取WiFi信息需要位置权限，请前往设置开启',
							confirmText: '去设置',
							cancelText: '取消',
							success: (res) => {
								if (res.confirm) {
									wx.openSetting({
										success: (openRes) => {
											console.log('[WiFi] openSetting结果:', JSON.stringify(openRes.authSetting))
											if (openRes.authSetting['scope.userLocation']) {
												this.doGetConnectedWifi()
											}
										}
									})
								}
							}
						})
					} else if (locationAuth === true) {
						console.log('[WiFi] 分支: 已授权 → 调用getLocation确保系统GPS权限')
						wx.getLocation({
							type: 'wgs84',
							success: () => { this.doGetConnectedWifi() },
							fail: () => { this.doGetConnectedWifi() }
						})
					} else {
						console.log('[WiFi] 分支: 未申请过 → 触发系统权限弹窗')
						wx.authorize({
							scope: 'scope.userLocation',
							success: () => {
								console.log('[WiFi] wx.authorize 授权成功，调用getLocation触发系统GPS权限')
								wx.getLocation({
									type: 'wgs84',
									success: () => {
										console.log('[WiFi] getLocation成功，开始获取WiFi')
										this.doGetConnectedWifi()
									},
									fail: () => {
										console.log('[WiFi] getLocation失败，仍尝试获取WiFi')
										this.doGetConnectedWifi()
									}
								})
							},
							fail: (err) => {
								console.log('[WiFi] wx.authorize 授权失败:', JSON.stringify(err))
								uni.showToast({ title: '未授权位置权限，无法获取WiFi', icon: 'none' })
							}
						})
					}
				},
				fail: (err) => {
					console.log('[WiFi] getSetting失败:', JSON.stringify(err))
					this.doGetConnectedWifi()
				}
			})
			// #endif

			// #ifndef MP-WEIXIN
			this.doGetConnectedWifi()
			// #endif
		},

		// 实际获取WiFi信息
		doGetConnectedWifi() {
			uni.startWifi({
				success: () => {
					uni.getConnectedWifi({
						success: (res) => {
							if (res.wifi && res.wifi.SSID) {
								this.wifiName = res.wifi.SSID
								uni.showToast({ title: '已获取WiFi名称', icon: 'success' })
							} else {
								uni.showToast({ title: '未连接WiFi', icon: 'none' })
							}
						},
						fail: (err) => {
							console.error('获取WiFi失败:', err)
							let errorMsg = '获取WiFi失败'
							if (err.errCode === 12000) errorMsg = '未打开WiFi开关'
							else if (err.errCode === 12001) errorMsg = '未连接到WiFi'
							else if (err.errCode === 12002) errorMsg = '需要授权定位权限'
							else if (err.errCode === 12012) errorMsg = '请在手机系统设置中开启微信的定位权限'
							uni.showModal({ title: '提示', content: errorMsg + '，请确保已开启WiFi和定位权限', showCancel: false })
						}
					})
				},
				fail: () => {
					uni.showModal({ title: '提示', content: '初始化WiFi模块失败，请确保已开启WiFi功能', showCancel: false })
				}
			})
		},

		togglePassword() {
			this.showPassword = !this.showPassword
		},

		loadLastConfig() {
			try {
				const config = uni.getStorageSync('last_wifi_config')
				if (config) this.lastConfig = JSON.parse(config)
			} catch (e) {}
		},

		useLastConfig() {
			if (this.lastConfig) {
				this.wifiName = this.lastConfig.wifiName || ''
				this.wifiPassword = this.lastConfig.wifiPassword || ''
				uni.showToast({ title: '已加载上次配置', icon: 'success' })
			} else {
				uni.showToast({ title: '暂无历史配置', icon: 'none' })
			}
		},

		async resetNetwork() {
			if (!this.deviceId || !this.productKey || !this.deviceKey) {
				uni.showToast({ title: '缺少设备信息', icon: 'none' })
				return
			}
			uni.showModal({
				title: '确认重置',
				content: '重置设备网络将清除设备当前的网络配置，设备将进入配网模式，是否继续？',
				confirmText: '确认重置',
				confirmColor: '#f44336',
				success: async (res) => {
					if (res.confirm) {
						uni.showLoading({ title: '重置中...' })
						try {
							const response = await resetDeviceNetwork({
								deviceId: this.deviceId,
								productKey: this.productKey,
								deviceKey: this.deviceKey,
								ack: 1,
								address: null,
								propertyValue: { configmode: 1 },
								type: null
							})
							uni.hideLoading()
							if (response.code === 200) {
								uni.showModal({
									title: '重置成功',
									content: '设备已进入配网模式，请稍后进行网络配置',
									showCancel: false,
									confirmText: '我知道了',
									success: () => { this.wifiName = ''; this.wifiPassword = '' }
								})
							} else {
								uni.showModal({ title: '重置失败', content: response.msg || '操作失败，请重试', showCancel: false })
							}
						} catch (error) {
							uni.hideLoading()
							uni.showModal({ title: '重置失败', content: '网络错误，请检查设备是否在线', showCancel: false })
						}
					}
				}
			})
		},

		confirmConfig() {
			if (!this.wifiName.trim()) {
				uni.showToast({ title: '请输入WiFi名称', icon: 'none' })
				return
			}
			if (!this.wifiPassword || !this.wifiPassword.trim()) {
				uni.showModal({
					title: '提示',
					content: '您未输入WiFi密码，是否继续？',
					success: (res) => { if (res.confirm) this.sendConfig() }
				})
				return
			}
			if (this.wifiPassword.length < 8) {
				uni.showModal({
					title: '提示',
					content: 'WiFi密码长度不能少于8位，是否继续？',
					success: (res) => { if (res.confirm) this.sendConfig() }
				})
				return
			}
			this.sendConfig()
		},

		async sendConfig() {
			uni.setStorageSync('last_wifi_config', JSON.stringify({
				wifiName: this.wifiName,
				wifiPassword: this.wifiPassword,
				timestamp: Date.now()
			}))
			if (!this.deviceBSSID) {
				uni.showToast({ title: '缺少设备信息', icon: 'none' })
				return
			}
			uni.showLoading({ title: '初始化WiFi...' })
			try {
				await this.initWifi()
				if (this.isUnloaded) return
				uni.showLoading({ title: '正在连接设备...' })
				await this.connectDeviceWifi()
				if (this.isUnloaded) return
				uni.showLoading({ title: '正在建立连接...' })
				await this.createTcpConnection()
			} catch (error) {
				uni.hideLoading()
				if (this.isUnloaded) return
				uni.showModal({ title: '配置失败', content: error.message || '配网失败，请重试', showCancel: false })
			}
		},

		initWifi() {
			return new Promise((resolve, reject) => {
				uni.startWifi({
					success: () => resolve(),
					fail: () => reject(new Error('WiFi模块初始化失败，请确保已开启WiFi功能'))
				})
			})
		},

		connectDeviceWifi() {
			return new Promise((resolve, reject) => {
				if (this.wifiFlag) { resolve(); return }
				// #ifdef MP-WEIXIN
				wx.connectWifi({
					SSID: this.deviceBSSID,
					password: '88888888',
					forceNewApi: true,
					success: (res) => {
						if (this.userPhoneOS === 'ios') {
							// iOS 需要验证是否真正连上了目标WiFi
							setTimeout(() => {
								wx.getConnectedWifi({
									success: (connectRes) => {
										if (connectRes.wifi && connectRes.wifi.SSID === this.deviceBSSID) {
											this.wifiFlag = true
											resolve()
										} else {
											reject(new Error('无法连接到设备WiFi，请确保设备处于配网模式'))
										}
									},
									fail: () => reject(new Error('无法验证WiFi连接状态'))
								})
							}, 1000)
						} else {
							this.wifiFlag = true
							setTimeout(() => resolve(), 500)
						}
					},
					fail: (err) => {
						const errorMessages = {
							12002: '密码错误，请重试',
							12003: '连接超时，请重试',
							12005: '请打开WiFi开关后重试',
							12006: '请打开定位功能后重试',
							12013: '系统WiFi配置过期，建议忘记该WiFi后重试'
						}
						const msg = errorMessages[err.errCode] || '无法连接到设备WiFi，请确保设备处于配网模式'
						reject(new Error(msg))
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				uni.connectWifi({
					SSID: this.deviceBSSID,
					password: '88888888',
					success: () => { this.wifiFlag = true; setTimeout(() => resolve(), 500) },
					fail: () => reject(new Error('无法连接到设备WiFi，请确保设备处于配网模式'))
				})
				// #endif
			})
		},

		createTcpConnection() {
			return new Promise((resolve, reject) => {
				if (this.isUnloaded) { reject(new Error('页面已卸载')); return }
				this.tcpConnectResolve = resolve
				this.tcpConnectReject = reject
				// #ifdef MP-WEIXIN
				this.tcp = wx.createTCPSocket()
				if (!this.tcp) { reject(new Error('创建TCP Socket失败')); return }
				this.tcp.onConnect((res) => this.handleTcpConnect(res))
				this.tcp.onError((err) => this.handleTcpError(err))
				this.tcp.onClose(() => this.handleTcpClose())
				this.tcp.onMessage(() => this.handleTcpMessage())
				this.tcp.connect({ address: '192.168.4.1', port: 8120, timeout: 3 })
				// #endif
				// #ifndef MP-WEIXIN
				reject(new Error('当前环境不支持TCP连接，请在微信小程序中使用'))
				// #endif
			})
		},

		handleTcpConnect(res) {
			if (this.isUnloaded) return
			if (res.remoteInfo.port == -1 || !res.remoteInfo.address || !res.remoteInfo.family) {
				if (this.tcp) this.tcp.close()
				if (this.retryCount < 3) {
					this.retryCount++
					setTimeout(() => {
						if (this.isUnloaded) return
						this.createTcpConnection().then(this.tcpConnectResolve).catch(this.tcpConnectReject)
					}, 500)
				} else {
					if (this.tcpConnectReject) this.tcpConnectReject(new Error('TCP连接失败，请重试'))
				}
				return
			}
			this.retryCount = 0
			this.tcpFlag = true
			this.sendConfigDataDirectly()
		},

		handleTcpError(err) {
			console.error('TCP连接错误:', err)
		},

		handleTcpClose() {
			this.tcpFlag = false
		},

		handleTcpMessage() {},

		sendConfigDataDirectly() {
			if (this.isUnloaded) return
			if (!this.tcpFlag || !this.tcp) {
				if (this.tcpConnectReject) this.tcpConnectReject(new Error('TCP连接未建立'))
				return
			}
			try {
				const configMsg = '$1$' + this.wifiName + (this.wifiPassword ? ',' + this.wifiPassword : ',')
				console.log('发送配置信息:', configMsg)
				this.tcp.write(configMsg)
				setTimeout(() => {
					if (this.isUnloaded || !this.tcp) return
					this.tcp.write('$9$')
					setTimeout(() => {
						if (this.tcp) { this.tcp.close(); this.tcp = null }
						this.tcpFlag = false
						this.wifiFlag = false
						uni.hideLoading()
						if (this.isUnloaded) return
						uni.showModal({
							title: '配置完成',
							content: this.userPhoneOS === 'ios'
								? '网络配置已发送到设备，请切换回您的WiFi网络后查看设备是否在线！'
								: '网络配置已发送到设备，设备正在连接网络，请查看设备是否在线！',
							showCancel: false,
							confirmText: '确定',
							success: () => { uni.navigateBack() }
						})
						if (this.tcpConnectResolve) this.tcpConnectResolve()
					}, 2000)
				}, 2000)
			} catch (error) {
				console.error('发送数据失败:', error)
				if (this.tcpConnectReject) this.tcpConnectReject(new Error('发送配置信息失败'))
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
.notice-text:last-child { margin-bottom: 0; }
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
.label-required { color: #f44336; font-size: 32rpx; margin-right: 4rpx; }
.label-text { font-size: 30rpx; color: #333; font-weight: 500; }
.input-row { display: flex; align-items: center; gap: 16rpx; position: relative; }
.wifi-input {
	flex: 1;
	height: 80rpx;
	padding: 0 24rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
	font-size: 28rpx;
	color: #333;
}
.input-placeholder { color: #999; }
.get-wifi-btn {
	flex-shrink: 0;
	height: 80rpx;
	padding: 0 24rpx;
	background: linear-gradient(135deg, #E07A4F 0%, #36b3b3 100%);
	color: #fff;
	font-size: 26rpx;
	border-radius: 12rpx;
	border: none;
	line-height: 80rpx;
}
.get-wifi-btn::after { border: none; }
.password-wrapper { position: relative; display: flex; align-items: center; }
.password-input { padding-right: 80rpx; }
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
.last-config-btn { padding: 32rpx; text-align: center; }
.last-config-text { font-size: 28rpx; color: #E07A4F; font-weight: 500; }
.action-buttons { display: flex; gap: 24rpx; padding: 48rpx 32rpx; }
.reset-btn, .confirm-btn {
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
.reset-btn::after, .confirm-btn::after { border: none; }
.reset-btn { background: #f44336; color: #fff; }
.confirm-btn { background: #4caf50; color: #fff; }
.reset-btn:active, .confirm-btn:active { opacity: 0.8; }
</style>
