<template>
	<!-- 核销码弹窗 -->
	<view class="verification-modal" v-if="visible" @click="handleClose">
		<view class="verification-content" @click.stop>
			<view class="verification-header">
				<text class="verification-title">服务核销码</text>
				<view class="close-btn" @click="handleClose">
					<uni-icons type="closeempty" size="24" color="#999"></uni-icons>
				</view>
			</view>
			
			<view class="verification-body">
				<!-- 加载状态 -->
				<view v-if="loading" class="loading-verification">
					<uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
					<text>加载中...</text>
				</view>
				
				<!-- 核销码内容 -->
				<template v-else-if="code">
					<view class="qrcode-title">家人核销二维码</view>
					
					<view class="qrcode-container">
						<image 
							:src="qrcodeUrl" 
							mode="aspectFit"
							class="qrcode-image"
							@error="handleQrcodeError"
							@load="handleQrcodeLoad"
						></image>
					</view>
					
					<!-- 用户信息 -->
					<view class="user-info" v-if="memberInfo">
						<view class="info-row">
							<text class="info-label">姓名：</text>
							<text class="info-value">{{ memberInfo.memberName || '张思' }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">社区：</text>
							<text class="info-value">{{ memberInfo.communityName || '中央城社区' }}</text>
						</view>
					</view>
					
					<!-- 提示信息 -->
					<view class="qrcode-tip">
						<text>请妥善保管此二维码，丢失请联系社区补打</text>
					</view>
					
					<!-- 挂失按钮 -->
					<view class="report-lost-section">
						<button class="report-lost-btn" @click="handleReportLost">挂失</button>
					</view>
				</template>
				
				<!-- 空状态 -->
				<view v-else class="empty-verification">
					<uni-icons type="info-filled" size="60" color="#e0e0e0"></uni-icons>
					<text>暂无核销码</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'VerificationModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		code: {
			type: Object,
			default: null
		},
		loading: {
			type: Boolean,
			default: false
		},
		qrcodeUrl: {
			type: String,
			default: ''
		},
		memberInfo: {
			type: Object,
			default: null
		}
	},
	methods: {
		handleClose() {
			this.$emit('close')
		},
		handleManualConfirm() {
			this.$emit('manual-confirm')
		},
		handleQrcodeLoad() {
			this.$emit('qrcode-load')
		},
		handleQrcodeError(e) {
			this.$emit('qrcode-error', e)
		},
		handleReportLost() {
			this.$emit('report-lost')
		}
	}
}
</script>

<style lang="scss" scoped>
// 核销码弹窗样式
.verification-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(4px);
	
	.verification-content {
		width: 600rpx;
		background: #fff;
		border-radius: 32rpx;
		overflow: hidden;
		box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.15);
		animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		
		@keyframes modalShow {
			from { transform: scale(0.9); opacity: 0; }
			to { transform: scale(1); opacity: 1; }
		}
		
		.verification-header {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 32rpx 40rpx;
			border-bottom: 2rpx solid #f7f8fa;
			position: relative;
			
			.verification-title {
				font-size: 34rpx;
				font-weight: bold;
				color: #333;
			}
			
			.close-btn {
				position: absolute;
				right: 40rpx;
				top: 50%;
				transform: translateY(-50%);
				width: 48rpx;
				height: 48rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
		
		.verification-body {
			padding: 40rpx;
			text-align: center;
			
			.loading-verification {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 80rpx 0;
				gap: 24rpx;
				
				text {
					font-size: 28rpx;
					color: #3ec6c6;
				}
			}
			
			.verification-tip {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				margin-bottom: 32rpx;
				padding: 16rpx 24rpx;
				background: rgba(62, 198, 198, 0.1);
				border-radius: 12rpx;
				
				text {
					font-size: 26rpx;
					color: #3ec6c6;
				}
			}
			
			.verification-code-display {
				margin-bottom: 32rpx;
				
				.code-text {
					font-size: 72rpx;
					font-weight: bold;
					color: #3ec6c6;
					letter-spacing: 12rpx;
					font-family: 'Courier New', monospace;
					text-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.2);
				}
			}
			
			.qrcode-container {
				display: flex;
				justify-content: center;
				margin-bottom: 24rpx;
				
				.qrcode-image {
					width: 200px;
					height: 200px;
					border: 4rpx solid #f0f0f0;
					border-radius: 16rpx;
					background: #fff;
					padding: 16rpx;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
				}
			}
			
			.qrcode-tip {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				margin-bottom: 32rpx;
				padding: 16rpx 24rpx;
				background: #f7f8fa;
				border-radius: 12rpx;
				
				text {
					font-size: 24rpx;
					color: #909399;
				}
			}
			
			.expire-time {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				margin-bottom: 32rpx;
				
				text {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.divider {
				height: 1rpx;
				background: linear-gradient(to right, transparent, #e5e5e5, transparent);
				margin: 32rpx 0;
			}
			
			.manual-confirm-section {
				.manual-tip {
					display: block;
					font-size: 24rpx;
					color: #999;
					margin-bottom: 20rpx;
				}
				
				.manual-confirm-btn {
					width: 100%;
					height: 88rpx;
					line-height: 88rpx;
					background: linear-gradient(135deg, #fa8c16 0%, #f57c00 100%);
					color: #fff;
					border-radius: 100rpx;
					font-size: 30rpx;
					font-weight: 600;
					border: none;
					box-shadow: 0 6rpx 16rpx rgba(250, 140, 22, 0.25);
					
					&::after { border: none; }
					
					&:active {
						opacity: 0.8;
						transform: scale(0.98);
					}
				}
			}
			
			.empty-verification {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding: 80rpx 0;
				gap: 24rpx;
				
				text {
					font-size: 28rpx;
					color: #999;
				}
			}
			
			// 新增样式
			.qrcode-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				text-align: center;
				margin-bottom: 32rpx;
			}
			
			.user-info {
				margin: 32rpx 0;
				padding: 24rpx;
				background: #f8f9fc;
				border-radius: 12rpx;
				
				.info-row {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.info-label {
						font-size: 28rpx;
						color: #666;
						min-width: 80rpx;
					}
					
					.info-value {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}
				}
			}
			
			.qrcode-tip {
				text-align: center;
				margin: 24rpx 0;
				padding: 16rpx 24rpx;
				background: #f0f9ff;
				border-radius: 12rpx;
				
				text {
					font-size: 24rpx;
					color: #666;
					line-height: 1.5;
				}
			}
			
			.report-lost-section {
				margin-top: 32rpx;
				
				.report-lost-btn {
					width: 100%;
					height: 88rpx;
					line-height: 88rpx;
					background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
					color: #fff;
					border-radius: 100rpx;
					font-size: 30rpx;
					font-weight: 600;
					border: none;
					box-shadow: 0 6rpx 16rpx rgba(255, 77, 79, 0.25);
					
					&::after { border: none; }
					
					&:active {
						opacity: 0.8;
						transform: scale(0.98);
					}
				}
			}
		}
	}
}
</style>
