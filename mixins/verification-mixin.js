/**
 * 核销功能混入
 * 提供订单核销相关的通用功能
 */
import { getVerificationCode } from '@/api/verification'
import { completeServiceorder } from '@/api/service'
import config from '@/config.js'

export default {
	data() {
		return {
			// 核销码相关
			showVerificationModal: false,
			verificationCode: null,
			verificationCodeLoading: false,
			currentVerificationOrder: null,
			qrcodeFallbackAttempted: false, // 二维码降级尝试标记
			cachedPhotoPath: null, // 缓存拍摄的照片
			uploadRetryCount: 0 // 上传重试次数
		}
	},
	
	computed: {
		// 二维码图片URL
		qrcodeImageUrl() {
			if (!this.verificationCode || !this.currentVerificationOrder) {
				return ''
			}
			
			// 构建二维码内容
			const qrcodeData = JSON.stringify({
				orderId: this.currentVerificationOrder.id,
				code: this.verificationCode.plainCode
			})
			
			const size = 200
			const encodedData = encodeURIComponent(qrcodeData)
			
			// 使用在线二维码API生成
			return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&margin=10`
		}
	},
	
	methods: {
		/**
		 * 显示核销码
		 * @param {Object} order - 订单对象
		 */
		async showVerificationCode(order) {
			this.currentVerificationOrder = order
			this.verificationCode = null
			this.verificationCodeLoading = true
			this.showVerificationModal = true
			this.qrcodeFallbackAttempted = false
			
			try {
				const response = await getVerificationCode(order.id)
				if (response.code === 200 && response.data) {
					this.verificationCode = response.data
				} else {
					uni.showToast({
						title: response.msg || '获取核销码失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('获取核销码失败:', error)
				uni.showToast({
					title: '获取核销码失败',
					icon: 'none'
				})
			} finally {
				this.verificationCodeLoading = false
			}
		},
		
		/**
		 * 关闭核销码弹窗
		 */
		closeVerificationModal() {
			this.showVerificationModal = false
			this.verificationCode = null
			this.currentVerificationOrder = null
			this.qrcodeFallbackAttempted = false
			this.cachedPhotoPath = null
			this.uploadRetryCount = 0
		},
		
		/**
		 * 二维码加载成功
		 */
		handleQrcodeLoad() {
			console.log('二维码加载成功')
		},
		
		/**
		 * 二维码加载失败
		 */
		handleQrcodeError(e) {
			console.error('二维码加载失败:', e)
			
			if (!this.qrcodeFallbackAttempted) {
				this.qrcodeFallbackAttempted = true
				uni.showModal({
					title: '提示',
					content: '二维码加载失败，请直接向服务人员出示核销码',
					showCancel: false
				})
			}
		},
		
		/**
		 * 手动确认服务完成
		 */
		handleManualConfirm() {
			if (!this.currentVerificationOrder) return
			
			uni.showModal({
				title: '手动确认服务',
				content: '请先拍摄服务人员照片作为凭证，然后确认服务完成',
				confirmText: '拍照确认',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						this.captureServicePhoto()
					}
				}
			})
		},
		
		/**
		 * 拍摄服务人员照片
		 */
		captureServicePhoto() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['camera'], // 只允许拍照
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0]
					console.log('拍摄照片路径:', tempFilePath)
					
					// 缓存照片路径
					this.cachedPhotoPath = tempFilePath
					
					// 显示照片预览并确认
					this.showPhotoPreview(tempFilePath)
				},
				fail: (err) => {
					console.error('拍照失败:', err)
					uni.showToast({
						title: '拍照失败，请重试',
						icon: 'none'
					})
				}
			})
		},
		
		/**
		 * 显示照片预览并确认
		 */
		showPhotoPreview(photoPath) {
			uni.showModal({
				title: '确认照片',
				content: '照片已拍摄，是否确认提交？',
				confirmText: '确认提交',
				cancelText: '重新拍摄',
				success: (res) => {
					if (res.confirm) {
						// 确认提交
						this.submitManualConfirm(photoPath)
					} else {
						// 重新拍摄
						this.captureServicePhoto()
					}
				}
			})
		},
		
		/**
		 * 提交手动确认（带照片）
		 */
		async submitManualConfirm(photoPath) {
			if (!this.currentVerificationOrder) return
			
			try {
				uni.showLoading({ title: '上传中...' })
				
				// 先上传照片
				const uploadResult = await this.uploadServicePhoto(photoPath)
				
				if (!uploadResult.success) {
					uni.hideLoading()
					const errorMsg = uploadResult.message || '照片上传失败'
					console.error('照片上传失败:', errorMsg)
					uni.showModal({
						title: '上传失败',
						content: errorMsg,
						showCancel: false
					})
					return
				}
				
				console.log('照片上传成功，URL:', uploadResult.url)
				uni.showLoading({ title: '确认中...' })
				
				// 调用完成服务接口
				const response = await completeServiceorder({
					orderId: this.currentVerificationOrder.id,
					userId: this.currentVerificationOrder.userId,
					deptId: this.currentVerificationOrder.deptId,
					photoUrl: uploadResult.url,
					verificationMethod: 'RESIDENT' // 居民手动确认
				})
				
				uni.hideLoading()
				
				if (response.code === 200) {
					uni.showToast({
						title: '确认成功',
						icon: 'success'
					})
					
					// 关闭弹窗
					this.closeVerificationModal()
					
					// 触发刷新回调
					if (typeof this.onVerificationSuccess === 'function') {
						this.onVerificationSuccess()
					}
				} else {
					uni.showToast({
						title: response.msg || '确认失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('确认失败:', error)
				uni.showToast({
					title: '确认失败，请重试',
					icon: 'none'
				})
			}
		},
		
		/**
		 * 上传服务照片
		 */
		uploadServicePhoto(filePath) {
			return new Promise((resolve) => {
				console.log('开始上传照片:', filePath)
				console.log('上传地址:', config.baseUrl + '/common/upload')
				
				const token = uni.getStorageSync('App-Token')
				console.log('Token:', token ? '存在' : '不存在')
				
				uni.uploadFile({
					url: config.baseUrl + '/common/upload',
					filePath: filePath,
					name: 'file',
					header: {
						'Authorization': 'Bearer ' + token
					},
					formData: {
						type: 'service_photo'
					},
					success: (uploadRes) => {
						console.log('上传响应状态码:', uploadRes.statusCode)
						console.log('上传响应数据:', uploadRes.data)
						
						try {
							const data = JSON.parse(uploadRes.data)
							console.log('解析后的数据:', data)
							
							if (data.code === 200) {
								const photoUrl = data.url || data.fileName || data.data
								console.log('照片URL:', photoUrl)
								
								resolve({
									success: true,
									url: photoUrl
								})
							} else {
								console.error('上传失败，服务器返回:', data)
								
								// 提供重试选项
								if (this.uploadRetryCount < 2) {
									uni.showModal({
										title: '上传失败',
										content: data.msg || '照片上传失败，是否重试？',
										confirmText: '重试',
										cancelText: '取消',
										success: (res) => {
											if (res.confirm) {
												this.uploadRetryCount++
												// 使用缓存的照片重试
												this.uploadServicePhoto(this.cachedPhotoPath).then(resolve)
											} else {
												resolve({
													success: false,
													message: data.msg || '上传失败'
												})
											}
										}
									})
								} else {
									resolve({
										success: false,
										message: '上传失败次数过多，请稍后重试'
									})
								}
							}
						} catch (e) {
							console.error('解析上传结果失败:', e)
							console.error('原始数据:', uploadRes.data)
							resolve({
								success: false,
								message: '解析响应失败: ' + e.message
							})
						}
					},
					fail: (err) => {
						console.error('上传请求失败:', err)
						resolve({
							success: false,
							message: '上传请求失败: ' + (err.errMsg || '未知错误')
						})
					}
				})
			})
		}
	}
}
