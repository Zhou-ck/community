<template>
	<view class="reschedule-modal" v-if="visible" @click="handleClose">
		<view class="reschedule-content" @click.stop>
			<view class="reschedule-header">
				<text class="reschedule-title">申请改期</text>
				<view class="close-btn" @click="handleClose">
					<uni-icons type="close" size="24" color="#999"></uni-icons>
				</view>
			</view>

			<scroll-view class="reschedule-body" scroll-y>
				<!-- 订单信息 -->
				<view class="order-info-card" v-if="orderInfo">
					<image
						v-if="orderInfo.icon"
						:src="orderInfo.icon"
						class="order-icon"
						mode="aspectFill"
					></image>
					<view class="order-detail">
						<text class="order-service-name">{{ orderInfo.serviceName }}</text>
						<text class="order-no">订单号：{{ orderInfo.orderNo || orderInfo.id }}</text>
					</view>
				</view>

				<!-- 当前预约日期 -->
				<view class="form-item">
					<text class="form-label">当前预约日期</text>
					<view class="readonly-value">
						<uni-icons type="calendar" size="18" color="#999"></uni-icons>
						<text>{{ orderInfo.appointmentDate || '-' }}</text>
					</view>
				</view>

				<!-- 当前预约时段 -->
				<view class="form-item">
					<text class="form-label">当前预约时段</text>
					<view class="readonly-value">
						<uni-icons type="clock" size="18" color="#999"></uni-icons>
						<text>{{ orderInfo.appointmentPeriod || '-' }}</text>
					</view>
				</view>

				<!-- 分割线 -->
				<view class="divider-line"></view>

				<!-- 新预约日期 -->
				<view class="form-item">
					<text class="form-label required">新预约日期</text>
					<picker
						mode="date"
						:value="newAppointmentDate"
						:start="minDate"
						@end="maxDate"
						@change="onDateChange"
					>
						<view class="picker-input">
							<text :class="newAppointmentDate ? '' : 'placeholder'">
								{{ newAppointmentDate || '请选择新的预约日期' }}
							</text>
							<uni-icons type="calendar" size="20" color="#999"></uni-icons>
						</view>
					</picker>
				</view>

				<!-- 新预约时段 -->
				<view class="form-item">
					<text class="form-label">新预约时段</text>
					<view class="time-slots">
						<view
							v-for="slot in periodOptions"
							:key="slot"
							class="time-slot"
							:class="{ active: newAppointmentPeriod === slot }"
							@click="selectPeriod(slot)"
						>
							{{ slot }}
						</view>
					</view>
				</view>

				<!-- 改期原因 -->
				<view class="form-item">
					<text class="form-label required">改期原因</text>
					<textarea
						v-model="reason"
						class="reason-textarea"
						placeholder="请填写改期原因（必填）"
						maxlength="200"
					></textarea>
					<text class="char-count">{{ reason.length }}/200</text>
				</view>
			</scroll-view>

			<view class="reschedule-footer">
				<button class="cancel-btn" @click="handleClose">取消</button>
				<button class="submit-btn" @click="handleSubmit" :loading="submitting">提交申请</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { checkPendingModification, submitResidentReschedule } from '@/api/service'

	export default {
		name: 'RescheduleModal',
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			orderInfo: {
				type: Object,
				default: null
			}
		},
		data() {
			return {
				periodOptions: [
					'08:00-10:00',
					'10:00-12:00',
					'12:00-14:00',
					'14:00-16:00',
					'16:00-18:00'
				],
				minDate: '',
				maxDate: '',
				newAppointmentDate: '',
				newAppointmentPeriod: '',
				reason: '',
				submitting: false
			}
		},
		watch: {
			visible(newVal) {
				if (newVal) {
					this.initForm()
				}
			}
		},
		mounted() {
			this.initDateRange()
		},
		methods: {
			initDateRange() {
				const today = new Date()
				const year = today.getFullYear()
				const month = String(today.getMonth() + 1).padStart(2, '0')
				const day = String(today.getDate()).padStart(2, '0')
				this.minDate = `${year}-${month}-${day}`

				// 最大日期设为一年后
				const oneYearLater = new Date(today)
				oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
				const maxYear = oneYearLater.getFullYear()
				const maxMonth = String(oneYearLater.getMonth() + 1).padStart(2, '0')
				const maxDay = String(oneYearLater.getDate()).padStart(2, '0')
				this.maxDate = `${maxYear}-${maxMonth}-${maxDay}`
			},

			initForm() {
				// 清空表单
				this.reason = ''
				this.submitting = false

				// 默认使用当前预约日期
				this.newAppointmentDate = this.orderInfo ? this.orderInfo.appointmentDate : ''

				// 默认使用当前预约时段，转换为短横线格式
				if (this.orderInfo && this.orderInfo.appointmentPeriod) {
					const normalized = this.normalizePeriod(this.orderInfo.appointmentPeriod)
					this.newAppointmentPeriod = this.periodOptions.includes(normalized)
						? normalized
						: ''
				} else {
					this.newAppointmentPeriod = ''
				}
			},

			// 将时段格式统一为短横线格式（如 08:00~10:00 → 08:00-10:00）
			normalizePeriod(period) {
				if (!period) return ''
				return period.replace(/~|～/g, '-')
			},

			onDateChange(e) {
				this.newAppointmentDate = e.detail.value
			},

			selectPeriod(slot) {
				this.newAppointmentPeriod = slot
			},

			handleClose() {
				this.$emit('close')
			},

			async handleSubmit() {
				// 表单校验
				if (!this.newAppointmentDate) {
					uni.showToast({ title: '请选择新的预约日期', icon: 'none' })
					return
				}
				if (!this.newAppointmentPeriod) {
					uni.showToast({ title: '请选择新的预约时段', icon: 'none' })
					return
				}
				if (!this.reason || !this.reason.trim()) {
					uni.showToast({ title: '请填写改期原因', icon: 'none' })
					return
				}

				const orderId = this.orderInfo.id || this.orderInfo.orderId
				if (!orderId) {
					uni.showToast({ title: '订单信息异常', icon: 'none' })
					return
				}

				this.submitting = true

				try {
					// 先检查是否有待审核的改期申请
					const checkRes = await checkPendingModification(orderId)
					if (checkRes.code === 200 && checkRes.data === true) {
						this.submitting = false
						uni.showModal({
							title: '提示',
							content: '该订单已有待审核的改期申请，请等待商家处理',
							showCancel: false,
							confirmText: '知道了'
						})
						return
					}

					// 提交改期申请
					const submitRes = await submitResidentReschedule({
						orderId: orderId,
						newAppointmentDate: this.newAppointmentDate,
						newAppointmentPeriod: this.newAppointmentPeriod,
						reason: this.reason.trim()
					})

					if (submitRes.code === 200) {
						uni.showToast({ title: '改期申请已提交', icon: 'success' })
						this.$emit('success')
						this.$emit('close')
					} else {
						uni.showToast({
							title: submitRes.msg || '提交失败',
							icon: 'none'
						})
					}
				} catch (e) {
					console.error('提交改期申请失败:', e)
					uni.showToast({ title: '提交失败，请重试', icon: 'none' })
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.reschedule-modal {
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

		.reschedule-content {
			width: 640rpx;
			max-height: 85vh;
			background: #fff;
			border-radius: 32rpx;
			overflow: hidden;
			box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.15);
			animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
			display: flex;
			flex-direction: column;

			@keyframes modalShow {
				from { transform: scale(0.9); opacity: 0; }
				to { transform: scale(1); opacity: 1; }
			}

			.reschedule-header {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 32rpx 40rpx;
				border-bottom: 2rpx solid #f7f8fa;
				flex-shrink: 0;
				position: relative;

				.reschedule-title {
					font-size: 34rpx;
					font-weight: bold;
					color: #333;
				}

				.close-btn {
					position: absolute;
					right: 40rpx;
					top: 50%;
					transform: translateY(-50%);
					padding: 8rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.reschedule-body {
				padding: 32rpx 40rpx;
				flex: 1;
				overflow-y: auto;

				.order-info-card {
					display: flex;
					align-items: center;
					gap: 20rpx;
					padding: 20rpx 24rpx;
					background: #f7f8fa;
					border-radius: 16rpx;
					margin-bottom: 28rpx;

					.order-icon {
						width: 72rpx;
						height: 72rpx;
						border-radius: 12rpx;
						flex-shrink: 0;
						background: #fff;
					}

					.order-detail {
						flex: 1;
						display: flex;
						flex-direction: column;
						gap: 8rpx;

						.order-service-name {
							font-size: 28rpx;
							font-weight: 600;
							color: #333;
						}

						.order-no {
							font-size: 22rpx;
							color: #999;
						}
					}
				}

				.form-item {
					margin-bottom: 32rpx;

					.form-label {
						display: block;
						font-size: 28rpx;
						color: #666;
						margin-bottom: 16rpx;
						font-weight: 500;

						&.required::after {
							content: ' *';
							color: #ff5555;
						}
					}

					.readonly-value {
						display: flex;
						align-items: center;
						gap: 12rpx;
						height: 80rpx;
						padding: 0 24rpx;
						background: #f7f8fa;
						border-radius: 12rpx;
						font-size: 28rpx;
						color: #999;
					}

					.picker-input {
						display: flex;
						justify-content: space-between;
						align-items: center;
						height: 80rpx;
						padding: 0 24rpx;
						background: #f7f8fa;
						border-radius: 12rpx;
						font-size: 28rpx;

						.placeholder {
							color: #bbb;
						}
					}

					.time-slots {
						display: grid;
						grid-template-columns: repeat(3, 1fr);
						gap: 16rpx;

						.time-slot {
							height: 72rpx;
							background: #f7f8fa;
							border-radius: 12rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 26rpx;
							color: #666;
							border: 2rpx solid transparent;
							transition: all 0.2s;

							&.active {
								background: rgba(62, 198, 198, 0.1);
								border-color: #3ec6c6;
								color: #3ec6c6;
								font-weight: 600;
							}
						}
					}

					.reason-textarea {
						width: 100%;
						min-height: 180rpx;
						padding: 20rpx 24rpx;
						background: #f7f8fa;
						border-radius: 12rpx;
						font-size: 28rpx;
						line-height: 1.6;
						color: #333;
						box-sizing: border-box;

						&::placeholder {
							color: #bbb;
						}
					}

					.char-count {
						display: block;
						font-size: 24rpx;
						color: #ccc;
						text-align: right;
						margin-top: 8rpx;
					}
				}

				.divider-line {
					height: 2rpx;
					background: #f0f0f0;
					margin: 8rpx 0 32rpx;
				}
			}

			.reschedule-footer {
				display: flex;
				gap: 24rpx;
				padding: 24rpx 40rpx 40rpx;
				flex-shrink: 0;

				button {
					flex: 1;
					height: 88rpx;
					line-height: 88rpx;
					border-radius: 100rpx;
					font-size: 30rpx;
					font-weight: 600;
					border: none;

					&::after { border: none; }

					&.cancel-btn {
						background: #f5f5f5;
						color: #666;
					}

					&.submit-btn {
						background: linear-gradient(135deg, #3ec6c6 0%, #2bb3b3 100%);
						color: #fff;
						box-shadow: 0 6rpx 16rpx rgba(62, 198, 198, 0.25);
					}
				}
			}
		}
	}
</style>
