<template>
	<view class="cropper-container">
		<!-- 顶部标题栏 -->
		<view class="cropper-header">
			<view class="header-content">
				<text class="title">裁剪图片</text>
				<text class="subtitle">拖动调整位置，双指缩放图片</text>
			</view>
		</view>
		
		<view class="cropper-content">
			<!-- 完整图片显示区域 -->
			<view class="image-wrapper">
				<canvas 
					canvas-id="imageCanvas" 
					:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
					class="image-canvas"
					@touchstart="handleTouchStart"
					@touchmove="handleTouchMove"
					@touchend="handleTouchEnd"
					@mousewheel="handleMouseWheel"
				></canvas>
				
				<!-- 裁剪框指示器 -->
				<view class="crop-indicator" :style="cropIndicatorStyle">
					<view class="indicator-border"></view>
					<view class="indicator-corners">
						<view class="corner corner-tl"></view>
						<view class="corner corner-tr"></view>
						<view class="corner corner-bl"></view>
						<view class="corner corner-br"></view>
					</view>
					<!-- 中心十字线 -->
					<view class="center-lines">
						<view class="line line-h"></view>
						<view class="line line-v"></view>
					</view>
				</view>
			</view>
			
			<!-- 预览区域 -->
			<view class="preview-section">
				<view class="preview-header">
					<view class="preview-icon">
						<uni-icons type="eye" size="18" color="#E07A4F"></uni-icons>
					</view>
					<text class="preview-title">裁剪预览</text>
					<text class="preview-size">154 × 240</text>
				</view>
				<view class="preview-box">
					<canvas 
						canvas-id="previewCanvas" 
						:style="{ width: previewWidth + 'px', height: previewHeight + 'px' }"
						class="preview-canvas"
					></canvas>
					<view class="preview-frame"></view>
				</view>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="cropper-footer">
			<!-- 缩放控制 -->
			<view class="scale-control">
				<view class="scale-icon" @click="decreaseScale">
					<uni-icons type="minus" size="20" color="#666"></uni-icons>
				</view>
				<view class="scale-slider">
					<slider 
						:value="scale" 
						:min="0.5" 
						:max="3" 
						:step="0.1" 
						@change="handleScaleChange"
						@changing="handleScaleChanging"
						activeColor="#E07A4F"
						backgroundColor="rgba(255,255,255,0.2)"
						block-size="20"
					/>
					<text class="scale-value">{{ (scale * 100).toFixed(0) }}%</text>
				</view>
				<view class="scale-icon" @click="increaseScale">
					<uni-icons type="plus" size="20" color="#666"></uni-icons>
				</view>
			</view>
			
			<!-- 按钮组 -->
			<view class="btn-group">
				<button class="btn btn-cancel" @click="handleCancel">
					<uni-icons type="closeempty" size="18" color="#666"></uni-icons>
					<text>取消</text>
				</button>
				<button class="btn btn-reset" @click="handleReset">
					<uni-icons type="reload" size="18" color="#666"></uni-icons>
					<text>重置</text>
				</button>
				<button class="btn btn-confirm" @click="handleConfirm">
					<uni-icons type="checkmarkempty" size="18" color="#fff"></uni-icons>
					<text>确认裁剪</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			imagePath: '',
			canvasWidth: 0,
			canvasHeight: 0,
			previewWidth: 154,
			previewHeight: 240,
			cropWidth: 154,
			cropHeight: 240,
			scale: 1,
			imageInfo: null,
			ctx: null,
			previewCtx: null,
			// 图片位置和缩放
			imageX: 0,
			imageY: 0,
			imageWidth: 0,
			imageHeight: 0,
			// 触摸相关
			touching: false,
			lastTouchX: 0,
			lastTouchY: 0,
			// 双指缩放相关
			isPinching: false,
			lastDistance: 0,
			lastScale: 1
		}
	},
	computed: {
		cropIndicatorStyle() {
			const left = (this.canvasWidth - this.cropWidth) / 2
			// 将裁剪框向上偏移，使其更靠近中上部
			const top = (this.canvasHeight - this.cropHeight) / 2 - 30
			return {
				left: left + 'px',
				top: top + 'px',
				width: this.cropWidth + 'px',
				height: this.cropHeight + 'px'
			}
		}
	},
	onLoad(options) {
		if (options.imagePath) {
			this.imagePath = decodeURIComponent(options.imagePath)
			this.cropWidth = parseInt(options.width) || 154
			this.cropHeight = parseInt(options.height) || 240
		}
		
		this.initCanvas()
	},
	methods: {
		// 初始化画布
		initCanvas() {
			const systemInfo = uni.getSystemInfoSync()
			this.canvasWidth = systemInfo.windowWidth
			
			// 计算可用高度（总高度 - 顶部标题 - 预览区域 - 底部操作栏）
			// 预估：顶部约120rpx，预览区域约400rpx，底部约280rpx，总共约800rpx
			const rpxToPixel = systemInfo.windowWidth / 750
			const reservedHeight = 800 * rpxToPixel
			const availableHeight = systemInfo.windowHeight - reservedHeight
			
			// 使用可用高度，但不超过宽度（保持合理比例）
			this.canvasHeight = Math.min(availableHeight, systemInfo.windowWidth)
			
			this.$nextTick(() => {
				this.ctx = uni.createCanvasContext('imageCanvas', this)
				this.previewCtx = uni.createCanvasContext('previewCanvas', this)
				this.loadImage()
			})
		},
		
		// 加载图片
		loadImage() {
			uni.getImageInfo({
				src: this.imagePath,
				success: (res) => {
					this.imageInfo = res
					this.resetImage()
				},
				fail: (err) => {
					console.error('加载图片失败:', err)
					uni.showToast({
						title: '加载图片失败',
						icon: 'none'
					})
				}
			})
		},
		
		// 重置图片位置和大小
		resetImage() {
			if (!this.imageInfo) return
			
			const imgRatio = this.imageInfo.width / this.imageInfo.height
			const cropRatio = this.cropWidth / this.cropHeight
			
			// 计算初始显示大小，确保图片完全覆盖裁剪框
			if (imgRatio > cropRatio) {
				// 图片更宽，以高度为准
				this.imageHeight = this.canvasHeight
				this.imageWidth = this.imageHeight * imgRatio
			} else {
				// 图片更高，以宽度为准
				this.imageWidth = this.canvasWidth
				this.imageHeight = this.imageWidth / imgRatio
			}
			
			// 居中显示
			this.imageX = (this.canvasWidth - this.imageWidth) / 2
			this.imageY = (this.canvasHeight - this.imageHeight) / 2
			this.scale = 1
			
			this.drawImage()
			this.updatePreview()
		},
		
		// 绘制图片
		drawImage() {
			if (!this.ctx || !this.imageInfo) return
			
			// 清空画布
			this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
			
			// 绘制背景色
			this.ctx.fillStyle = '#1a1a1a'
			this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
			
			// 绘制图片
			const scaledWidth = this.imageWidth * this.scale
			const scaledHeight = this.imageHeight * this.scale
			this.ctx.drawImage(
				this.imagePath,
				this.imageX,
				this.imageY,
				scaledWidth,
				scaledHeight
			)
			
			this.ctx.draw()
		},
		
		// 更新预览
		updatePreview() {
			if (!this.previewCtx || !this.imageInfo) return
			
			const cropX = (this.canvasWidth - this.cropWidth) / 2
			// 与裁剪框位置保持一致，向上偏移30像素
			const cropY = (this.canvasHeight - this.cropHeight) / 2 - 30
			
			// 计算裁剪区域在原图中的位置
			const sourceX = (cropX - this.imageX) / (this.imageWidth * this.scale) * this.imageInfo.width
			const sourceY = (cropY - this.imageY) / (this.imageHeight * this.scale) * this.imageInfo.height
			const sourceWidth = this.cropWidth / (this.imageWidth * this.scale) * this.imageInfo.width
			const sourceHeight = this.cropHeight / (this.imageHeight * this.scale) * this.imageInfo.height
			
			// 清空预览画布
			this.previewCtx.clearRect(0, 0, this.previewWidth, this.previewHeight)
			
			// 绘制预览
			this.previewCtx.drawImage(
				this.imagePath,
				Math.max(0, sourceX),
				Math.max(0, sourceY),
				Math.min(sourceWidth, this.imageInfo.width),
				Math.min(sourceHeight, this.imageInfo.height),
				0,
				0,
				this.previewWidth,
				this.previewHeight
			)
			
			this.previewCtx.draw()
		},
		
		// 触摸开始
		handleTouchStart(e) {
			if (e.touches.length === 1) {
				// 单指拖动
				this.touching = true
				this.isPinching = false
				this.lastTouchX = e.touches[0].x
				this.lastTouchY = e.touches[0].y
			} else if (e.touches.length === 2) {
				// 双指缩放
				this.touching = false
				this.isPinching = true
				this.lastDistance = this.getDistance(e.touches[0], e.touches[1])
				this.lastScale = this.scale
			}
		},
		
		// 触摸移动
		handleTouchMove(e) {
			e.preventDefault()
			
			if (e.touches.length === 1 && this.touching && !this.isPinching) {
				// 单指拖动
				const deltaX = e.touches[0].x - this.lastTouchX
				const deltaY = e.touches[0].y - this.lastTouchY
				
				this.imageX += deltaX
				this.imageY += deltaY
				
				this.lastTouchX = e.touches[0].x
				this.lastTouchY = e.touches[0].y
				
				this.drawImage()
				this.updatePreview()
			} else if (e.touches.length === 2 && this.isPinching) {
				// 双指缩放
				const distance = this.getDistance(e.touches[0], e.touches[1])
				const scale = (distance / this.lastDistance) * this.lastScale
				
				// 限制缩放范围
				this.scale = Math.max(0.5, Math.min(3, scale))
				
				this.drawImage()
				this.updatePreview()
			}
		},
		
		// 触摸结束
		handleTouchEnd(e) {
			if (e.touches.length === 0) {
				this.touching = false
				this.isPinching = false
			} else if (e.touches.length === 1) {
				// 从双指变为单指
				this.isPinching = false
				this.touching = true
				this.lastTouchX = e.touches[0].x
				this.lastTouchY = e.touches[0].y
			}
		},
		
		// 计算两点之间的距离
		getDistance(touch1, touch2) {
			const dx = touch2.x - touch1.x
			const dy = touch2.y - touch1.y
			return Math.sqrt(dx * dx + dy * dy)
		},
		
		// 鼠标滚轮缩放
		handleMouseWheel(e) {
			e.preventDefault()
			
			// deltaY > 0 表示向下滚动（缩小），< 0 表示向上滚动（放大）
			const delta = e.deltaY || e.detail || e.wheelDelta
			const scaleChange = delta > 0 ? -0.1 : 0.1
			
			this.scale = Math.max(0.5, Math.min(3, this.scale + scaleChange))
			
			this.drawImage()
			this.updatePreview()
		},
		
		// 缩放改变（拖动中）
		handleScaleChanging(e) {
			this.scale = e.detail.value
			this.drawImage()
			this.updatePreview()
		},
		
		// 缩放改变（完成）
		handleScaleChange(e) {
			this.scale = e.detail.value
			this.drawImage()
			this.updatePreview()
		},
		
		// 减小缩放
		decreaseScale() {
			this.scale = Math.max(0.5, this.scale - 0.1)
			this.drawImage()
			this.updatePreview()
		},
		
		// 增加缩放
		increaseScale() {
			this.scale = Math.min(3, this.scale + 0.1)
			this.drawImage()
			this.updatePreview()
		},
		
		// 重置
		handleReset() {
			this.resetImage()
		},
		
		// 取消
		handleCancel() {
			uni.navigateBack()
		},
		
		// 确认裁剪
		handleConfirm() {
			if (!this.imageInfo) {
				uni.showToast({
					title: '图片未加载完成',
					icon: 'none'
				})
				return
			}
			
			uni.showLoading({ title: '处理中...' })
			
			// 确保预览已更新
			this.updatePreview()
			
			// 延迟一下确保 canvas 绘制完成
			setTimeout(() => {
				const cropX = (this.canvasWidth - this.cropWidth) / 2
				const cropY = (this.canvasHeight - this.cropHeight) / 2 - 30
				
				// 使用 canvas 导出裁剪后的图片
				uni.canvasToTempFilePath({
					canvasId: 'previewCanvas',
					x: 0,
					y: 0,
					width: this.previewWidth,
					height: this.previewHeight,
					destWidth: this.previewWidth,
					destHeight: this.previewHeight,
					success: (res) => {
						uni.hideLoading()
						
						// 通过事件通道返回裁剪后的图片路径
						const eventChannel = this.getOpenerEventChannel()
						if (eventChannel) {
							eventChannel.emit('acceptDataFromCropperPage', {
								croppedPath: res.tempFilePath
							})
						}
						
						uni.navigateBack()
					},
					fail: (err) => {
						uni.hideLoading()
						console.error('裁剪失败:', err)
						uni.showToast({
							title: '裁剪失败，请重试',
							icon: 'none'
						})
					}
				}, this)
			}, 300)
		}
	}
}
</script>

<style lang="scss" scoped>
.cropper-container {
	width: 100vw;
	height: 100vh;
	background: #f5f7fa;
	display: flex;
	flex-direction: column;
}

.cropper-header {
	padding: 60rpx 40rpx 30rpx;
	background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
	position: relative;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
	z-index: 10;
	
	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 40rpx;
		right: 40rpx;
		height: 3rpx;
		background: linear-gradient(90deg, transparent 0%, #E07A4F 50%, transparent 100%);
	}
	
	.header-content {
		.title {
			font-size: 44rpx;
			color: #333;
			font-weight: 700;
			display: block;
			margin-bottom: 12rpx;
			letter-spacing: 2rpx;
		}
		
		.subtitle {
			font-size: 26rpx;
			color: #666;
			display: block;
			display: flex;
			align-items: center;
			gap: 8rpx;
		}
	}
}

.cropper-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background: #e8ecf0;
}

.image-wrapper {
	flex: 1;
	position: relative;
	overflow: hidden;
	background: #d0d5db;
	box-shadow: 
		inset 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	
	.image-canvas {
		display: block;
	}
	
	.crop-indicator {
		position: absolute;
		pointer-events: none;
		
		.indicator-border {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border: 4rpx solid #E07A4F;
			box-shadow: 
				0 0 0 2000px rgba(0, 0, 0, 0.4),
				0 0 24rpx rgba(224, 122, 79, 0.6),
				inset 0 0 24rpx rgba(224, 122, 79, 0.2);
			animation: borderPulse 2s ease-in-out infinite;
			border-radius: 8rpx;
		}
		
		.indicator-corners {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			
			.corner {
				position: absolute;
				width: 50rpx;
				height: 50rpx;
				border-color: #E07A4F;
				border-style: solid;
				filter: drop-shadow(0 0 8rpx rgba(224, 122, 79, 0.8));
				
				&.corner-tl {
					top: -6rpx;
					left: -6rpx;
					border-width: 8rpx 0 0 8rpx;
					border-radius: 12rpx 0 0 0;
				}
				
				&.corner-tr {
					top: -6rpx;
					right: -6rpx;
					border-width: 8rpx 8rpx 0 0;
					border-radius: 0 12rpx 0 0;
				}
				
				&.corner-bl {
					bottom: -6rpx;
					left: -6rpx;
					border-width: 0 0 8rpx 8rpx;
					border-radius: 0 0 0 12rpx;
				}
				
				&.corner-br {
					bottom: -6rpx;
					right: -6rpx;
					border-width: 0 8rpx 8rpx 0;
					border-radius: 0 0 12rpx 0;
				}
			}
		}
		
		.center-lines {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			
			.line {
				position: absolute;
				background: rgba(224, 122, 79, 0.4);
				
				&.line-h {
					top: 50%;
					left: 0;
					right: 0;
					height: 2rpx;
					transform: translateY(-50%);
				}
				
				&.line-v {
					left: 50%;
					top: 0;
					bottom: 0;
					width: 2rpx;
					transform: translateX(-50%);
				}
			}
		}
	}
}

.preview-section {
	padding: 40rpx 32rpx;
	background: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-top: 3rpx solid #e8ecf0;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
	
	.preview-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 24rpx;
		
		.preview-icon {
			width: 40rpx;
			height: 40rpx;
			background: rgba(224, 122, 79, 0.1);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		
		.preview-title {
			font-size: 28rpx;
			color: #333;
			font-weight: 600;
		}
		
		.preview-size {
			font-size: 24rpx;
			color: #999;
			padding: 4rpx 12rpx;
			background: #f0fcfc;
			border-radius: 8rpx;
			border: 1rpx solid rgba(224, 122, 79, 0.2);
		}
	}
	
	.preview-box {
		width: 154px;
		height: 240px;
		position: relative;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 
			0 8rpx 32rpx rgba(0, 0, 0, 0.12),
			0 0 0 4rpx rgba(224, 122, 79, 0.2);
		
		.preview-canvas {
			display: block;
		}
		
		.preview-frame {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border: 2rpx solid rgba(224, 122, 79, 0.5);
			pointer-events: none;
		}
	}
}

.cropper-footer {
	padding: 32rpx 40rpx;
	padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
	background: #ffffff;
	border-top: 2rpx solid #e8ecf0;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
	
	.scale-control {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 32rpx;
		
		.scale-icon {
			width: 56rpx;
			height: 56rpx;
			background: #f5f7fa;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s;
			border: 2rpx solid #e0e0e0;
			
			&:active {
				background: #e8f8f8;
				border-color: #E07A4F;
				transform: scale(0.95);
			}
		}
		
		.scale-slider {
			flex: 1;
			position: relative;
			
			slider {
				width: 100%;
			}
			
			.scale-value {
				position: absolute;
				top: -40rpx;
				left: 50%;
				transform: translateX(-50%);
				font-size: 24rpx;
				color: #E07A4F;
				background: #f0fcfc;
				padding: 6rpx 16rpx;
				border-radius: 20rpx;
				font-weight: 600;
				border: 1rpx solid rgba(224, 122, 79, 0.3);
			}
		}
	}
	
	.btn-group {
		display: flex;
		gap: 20rpx;
		
		.btn {
			flex: 1;
			height: 88rpx;
			border-radius: 44rpx;
			font-size: 28rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			transition: all 0.3s;
			font-weight: 600;
			position: relative;
			overflow: hidden;
			
			&::before {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				width: 0;
				height: 0;
				border-radius: 50%;
				background: rgba(0, 0, 0, 0.1);
				transform: translate(-50%, -50%);
				transition: width 0.6s, height 0.6s;
			}
			
			&:active::before {
				width: 300rpx;
				height: 300rpx;
			}
			
			text {
				position: relative;
				z-index: 1;
			}
			
			&.btn-cancel {
				background: #f5f7fa;
				color: #666;
				border: 2rpx solid #e0e0e0;
				
				&:active {
					background: #e8ecf0;
					border-color: #d0d5db;
				}
			}
			
			&.btn-reset {
				background: #f0f2f5;
				color: #666;
				border: 2rpx solid #d8dce0;
				
				&:active {
					background: #e0e4e8;
					border-color: #c8ccd0;
				}
			}
			
			&.btn-confirm {
				background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
				color: #fff;
				box-shadow: 0 8rpx 24rpx rgba(224, 122, 79, 0.35);
				
				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.35);
				}
			}
		}
	}
}

@keyframes borderPulse {
	0%, 100% {
		box-shadow: 
			0 0 0 2000px rgba(0, 0, 0, 0.4),
			0 0 24rpx rgba(224, 122, 79, 0.6),
			inset 0 0 24rpx rgba(224, 122, 79, 0.2);
	}
	50% {
		box-shadow: 
			0 0 0 2000px rgba(0, 0, 0, 0.4),
			0 0 36rpx rgba(224, 122, 79, 0.9),
			inset 0 0 36rpx rgba(224, 122, 79, 0.3);
	}
}
</style>
