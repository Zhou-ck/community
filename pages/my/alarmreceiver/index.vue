<template>
	<view class="receiver-container">
		<!-- 列表区域 -->
		<scroll-view class="receiver-list" scroll-y :style="{ height: 'calc(100vh - ' + (140 + safeAreaBottom) + 'rpx)' }">
			<view class="tip-bar" v-if="deviceId">
				<uni-icons type="info" size="14" color="#3ec6c6"></uni-icons>
				<text>请选择要绑定到设备的接警人</text>
			</view>

			<view class="empty-state" v-if="receiverList.length === 0">
				<view class="empty-icon-box">
					<uni-icons type="personadd-filled" size="60" color="#e0e0e0"></uni-icons>
				</view>
				<text class="empty-text">暂无接警人</text>
				<text class="empty-sub">添加接警人后，设备报警时将通知他们</text>
			</view>

			<view class="receiver-card" v-for="(item, idx) in receiverList" :key="idx" 
				:class="{ 'selected': isSelectedForBind(item.receiverId) }"
				@click="deviceId ? toggleSelection(item) : null">
				<view class="card-content">
					<view class="card-header">
						<view class="info-left">
							<view class="avatar-icon">
								<text>{{ item.receiverName ? item.receiverName.charAt(0) : '警' }}</text>
							</view>
							<view class="info-box">
								<view class="name-row">
									<text class="name">{{ item.receiverName || '-' }}</text>
									<view class="status-badge bound" v-if="isReceiverBound(item.receiverId)">
										<text>已绑定</text>
									</view>
								</view>
								<text class="phone">{{ item.receiverPhone || '-' }}</text>
							</view>
						</view>
						
						<!-- 绑定模式下的选择框 -->
						<view class="check-box" v-if="deviceId">
							<view class="check-circle" :class="{ checked: isSelectedForBind(item.receiverId) || isReceiverBound(item.receiverId) }">
								<uni-icons type="checkmarkempty" size="16" color="#fff" v-if="isSelectedForBind(item.receiverId) || isReceiverBound(item.receiverId)"></uni-icons>
							</view>
						</view>
						
						<!-- 普通模式下的操作按钮 -->
						<view class="action-right" v-else>
							<view class="icon-btn" @click.stop="editReceiver(item)">
								<uni-icons type="compose" size="20" color="#3ec6c6"></uni-icons>
							</view>
							<view class="icon-btn delete" @click.stop="deleteReceiver(item)">
								<uni-icons type="trash" size="20" color="#ff5555"></uni-icons>
							</view>
						</view>
					</view>

					<view class="divider"></view>
					
					<view class="notify-settings" @click.stop>
						<view class="notify-tags">
							<view class="notify-tag" 
								:class="{ active: item.phoneNotifySwitch === '1' }"
								@click="changeNotifySwitch(item, 'phoneNotifySwitch')">
								<uni-icons :type="item.phoneNotifySwitch === '1' ? 'phone-filled' : 'phone'" 
									size="16" :color="item.phoneNotifySwitch === '1' ? '#3ec6c6' : '#999'"></uni-icons>
								<text>电话</text>
							</view>
							<view class="notify-tag" 
								:class="{ active: item.smsNotifySwitch === '1' }"
								@click="changeNotifySwitch(item, 'smsNotifySwitch')">
								<uni-icons :type="item.smsNotifySwitch === '1' ? 'chat-filled' : 'chat'" 
									size="16" :color="item.smsNotifySwitch === '1' ? '#3ec6c6' : '#999'"></uni-icons>
								<text>短信</text>
							</view>
							<view class="notify-tag" 
								:class="{ active: item.wechatNotifySwitch === '1' }"
								@click="changeNotifySwitch(item, 'wechatNotifySwitch')">
								<uni-icons :type="item.wechatNotifySwitch === '1' ? 'weixin' : 'weixin'" 
									size="16" :color="item.wechatNotifySwitch === '1' ? '#3ec6c6' : '#999'"></uni-icons>
								<text>微信</text>
							</view>
						</view>
					</view>
					
					<view class="remark-row" v-if="item.remark">
						<text class="label">备注：</text>
						<text class="value">{{ item.remark }}</text>
					</view>
				</view>
			</view>
			
			<!-- 底部占位 -->
			<view style="height: 40rpx;"></view>
		</scroll-view>

		<!-- 底部按钮栏 -->
		<view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'rpx' }">
			<template v-if="deviceId">
				<view class="batch-info">
					<text>已选 {{ selectedReceivers.length }} 人</text>
					<text class="sub">已绑定 {{ boundReceivers.length }} 人</text>
				</view>
				<view class="btn-group">
					<button class="action-btn plain" @click="addReceiver">新增</button>
					<button class="action-btn primary" @click="batchBindReceivers" :disabled="selectedReceivers.length === 0">
						确认绑定
					</button>
				</view>
			</template>
			<template v-else>
				<view class="add-btn-full" @click="addReceiver" hover-class="btn-hover">
					<uni-icons type="plusempty" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
					<text>新增接警人</text>
				</view>
			</template>
		</view>

		<!-- 编辑/新增弹窗 (底部弹出) -->
		<view v-if="showModal" class="popup-mask" @click="closeModal" :class="{ 'show': showModal }">
			<view class="popup-container" @click.stop :class="{ 'show': showModal }">
				<view class="popup-header">
					<text class="title">{{ isEdit ? '编辑接警人' : '新增接警人' }}</text>
					<view class="close-btn" @click="closeModal">
						<uni-icons type="closeempty" size="24" color="#999"></uni-icons>
					</view>
				</view>

				<scroll-view class="form-content" scroll-y>
					<view class="form-group">
						<view class="form-item">
							<text class="label required">姓名</text>
							<input class="input-right" v-model="formData.receiverName" placeholder="请输入姓名" maxlength="10" placeholder-class="placeholder"/>
						</view>
						<view class="form-item">
							<text class="label required">手机号</text>
							<input class="input-right" type="number" v-model="formData.receiverPhone" placeholder="请输入手机号" maxlength="11" placeholder-class="placeholder"/>
						</view>
						<view class="form-item">
							<text class="label">邮箱</text>
							<input class="input-right" v-model="formData.receiverEmail" placeholder="请输入邮箱(选填)" maxlength="50" placeholder-class="placeholder"/>
						</view>
					</view>

					<view class="form-group">
						<view class="section-title">通知设置</view>
						<view class="form-item switch-item">
							<text class="label">电话通知</text>
							<switch :checked="formData.phoneNotifySwitch === '1'" @change="e => formData.phoneNotifySwitch = e.detail.value ? '1' : '2'" color="#3ec6c6" style="transform:scale(0.8)"/>
						</view>
						<view class="form-item switch-item">
							<text class="label">短信通知</text>
							<switch :checked="formData.smsNotifySwitch === '1'" @change="e => formData.smsNotifySwitch = e.detail.value ? '1' : '2'" color="#3ec6c6" style="transform:scale(0.8)"/>
						</view>
						<view class="form-item switch-item">
							<text class="label">微信通知</text>
							<switch :checked="formData.wechatNotifySwitch === '1'" @change="e => formData.wechatNotifySwitch = e.detail.value ? '1' : '2'" color="#3ec6c6" style="transform:scale(0.8)"/>
						</view>
					</view>

					<view class="form-group">
						<view class="form-item column">
							<text class="label">备注</text>
							<textarea v-model="formData.remark" placeholder="请输入备注信息（选填）" placeholder-class="placeholder" maxlength="200" disable-default-padding/>
							<text class="char-count">{{ (formData.remark || '').length }}/200</text>
						</view>
					</view>
				</scroll-view>

				<view class="popup-footer" :style="{ paddingBottom:safeAreaBottom + 'rpx' }">
					<view class="save-btn" @click="submitReceiver" hover-class="btn-hover">
						<text>{{ submitting ? '提交中...' : '保存' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		listAlarmreceiver,
		addAlarmreceiver,
		updateAlarmreceiver,
		delAlarmreceiver,
		getAlarmreceiver
	} from '@/api/alarmreceiver'
	import {
		getAlarmReceiverIdsByDeviceId,
		bindAlarmReceiverByDevice
	} from '@/api/devicereceiver'

	export default {
		data() {
			return {
				deviceId: '',
				deviceKey: '',
				productKey: '',
				receiverList: [],
				showModal: false,
				isEdit: false,
				submitting: false,
				safeAreaBottom: 0,
				// 已绑定到当前设备的接警人
				boundReceivers: [],
				// 当前选中准备绑定的接警人
				selectedReceivers: [],
				formData: {
					createBy: null,
					createTime: null,
					delFlag: null,
					deptId: null,
					phoneNotifySwitch: '2',
					receiverEmail: '',
					receiverId: null,
					receiverName: '',
					receiverPhone: '',
					remark: null,
					smsNotifySwitch: '2',
					updateBy: null,
					updateTime: null,
					userId: null,
					wechatNotifySwitch: '2',
					wechatOpenid: null
				}
			}
		},
		onLoad(options) {
			this.getSystemInfo()
			
			if (options && options.deviceId) {
				this.deviceId = options.deviceId
			}
			if (options && options.deviceKey) {
				this.deviceKey = decodeURIComponent(options.deviceKey)
			}
			if (options && options.productKey) {
				this.productKey = decodeURIComponent(options.productKey)
			}
			this.loadReceivers()
		},
		methods: {
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom) {
					this.safeAreaBottom = systemInfo.safeAreaInsets.bottom * 2
				} else {
					this.safeAreaBottom = 0
				}
			},
			
			async loadReceivers() {
				try {
					const res = await listAlarmreceiver()
					if (res.code === 200) {
						this.receiverList = res.rows || []
						// 如果有设备ID，加载绑定状态
						if (this.deviceId) {
							this.loadBoundReceivers()
						}
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					})
				}
			},
			// 加载已绑定的接警人列表
			async loadBoundReceivers() {
				if (!this.deviceId) return
				try {
					const res = await getAlarmReceiverIdsByDeviceId(this.deviceId)
					if (res.code === 200) {
						const boundIds = res.data || []
						this.boundReceivers = this.receiverList.filter(r => boundIds.includes(r.receiverId))
					}
				} catch (e) {
					// 忽略错误，保持原有显示
				}
			},
			addReceiver() {
				this.isEdit = false
				this.formData = {
					createBy: null,
					createTime: null,
					delFlag: null,
					deptId: null,
					phoneNotifySwitch: '2',
					receiverEmail: '',
					receiverId: null,
					receiverName: '',
					receiverPhone: '',
					remark: null,
					smsNotifySwitch: '2',
					updateBy: null,
					updateTime: null,
					userId: null,
					wechatNotifySwitch: '2',
					wechatOpenid: null
				}
				this.showModal = true
			},
			async changeNotifySwitch(item, field) {
				// 如果是事件对象，说明是Switch组件触发的，不需要手动切换值，v-model会自动处理
				// 但这里我们没用v-model在item上，而是手动处理
				// 如果是通过点击view触发的
				
				// 如果传入的是事件对象，获取value
				if (item.detail && item.detail.value !== undefined) {
					// 这种情况通常不应该发生，因为我们传的是 item 对象
					return
				}
				
				// 这里的逻辑有点混杂，我们简化一下：
				// 点击view时，手动切换
				// 点击switch时，switch会自动触发change事件
				
				// 简单起见，我们只处理点击Switch的change事件，或者统一处理
				
				const original = item[field] || '2'
				const target = original === '1' ? '2' : '1'
				
				const payload = {
					...item,
					[field]: target
				}
				try {
					const res = await updateAlarmreceiver(payload)
					if (res.code === 200) {
						item[field] = target
						uni.showToast({
							title: target === '1' ? '已开启' : '已关闭',
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: res.msg || '操作失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					})
				}
			},
			editReceiver(item) {
				this.isEdit = true
				this.formData = {
					createBy: item.createBy ?? null,
					createTime: item.createTime ?? null,
					delFlag: item.delFlag ?? null,
					deptId: item.deptId ?? null,
					phoneNotifySwitch: item.phoneNotifySwitch ?? '2',
					receiverEmail: item.receiverEmail || '',
					receiverId: item.receiverId,
					receiverName: item.receiverName || '',
					receiverPhone: item.receiverPhone || '',
					remark: item.remark ?? null,
					smsNotifySwitch: item.smsNotifySwitch ?? '2',
					updateBy: item.updateBy ?? null,
					updateTime: item.updateTime ?? null,
					userId: item.userId ?? null,
					wechatNotifySwitch: item.wechatNotifySwitch ?? '2',
					wechatOpenid: item.wechatOpenid ?? null
				}
				this.showModal = true
			},
			closeModal() {
				if (this.submitting) return
				this.showModal = false
			},
			async submitReceiver() {
				if (!this.formData.receiverName) {
					uni.showToast({
						title: '请输入姓名',
						icon: 'none'
					})
					return
				}
				if (!this.formData.receiverPhone) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					})
					return
				}
				try {
					this.submitting = true
					const payload = {
						...this.formData
					}
					let res
					if (this.isEdit) {
						res = await updateAlarmreceiver(payload)
					} else {
						res = await addAlarmreceiver(payload)
					}
					if (res.code === 200) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
						this.showModal = false
						this.loadReceivers()
					} else {
						uni.showToast({
							title: res.msg || '保存失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					})
				} finally {
					this.submitting = false
				}
			},
			async deleteReceiver(item) {
				const receiverName = item.receiverName || '该接警人'
				uni.showModal({
						title: '确认删除',
						content: `确定要删除"${receiverName}"吗？删除后不可恢复。`,
						confirmText: '删除',
						cancelText: '取消'
					})
					.then(async r => {
						if (r[1] && r[1].confirm) {
							try {
								const res = await delAlarmreceiver(item.receiverId)
								if (res.code === 200) {
									uni.showToast({
										title: '已删除',
										icon: 'success'
									})
									this.loadReceivers()
								} else {
									uni.showToast({
										title: res.msg || '删除失败',
										icon: 'none'
									})
								}
							} catch (e) {
								uni.showToast({
									title: '网络错误',
									icon: 'none'
								})
							}
						}
					})
			},
			// 检查接警人是否已绑定
			isReceiverBound(receiverId) {
				return this.boundReceivers.some(r => r.receiverId === receiverId)
			},
			// 检查是否被选中
			isSelectedForBind(receiverId) {
				return this.selectedReceivers.some(r => r.receiverId === receiverId)
			},
			// 切换选中状态；已绑定的可以点击取消绑定
			async toggleSelection(item) {
				if (!this.deviceId) return
				if (this.isReceiverBound(item.receiverId)) {
					return uni.showModal({
						title: '确认取消绑定',
						content: `确定要取消与“${item.receiverName || ''}”的绑定吗？`,
						confirmText: '取消绑定',
						cancelText: '再想想'
					}).then(async res => {
						if (res[1] && res[1].confirm) {
							await this.unbindReceiver(item)
						}
					})
				}
				const idx = this.selectedReceivers.findIndex(r => r.receiverId === item.receiverId)
				if (idx >= 0) {
					this.selectedReceivers.splice(idx, 1)
				} else {
					// 选中时，检查是否所有通知开关都关闭
					const allOff = item.phoneNotifySwitch === '2' && item.smsNotifySwitch === '2' && item.wechatNotifySwitch === '2'
					
					if (allOff) {
						// 自动开启电话、短信和微信通知
						try {
							const payload = {
								...item,
								phoneNotifySwitch: '1',
								smsNotifySwitch: '1',
								wechatNotifySwitch: '1'
							}
							const res = await updateAlarmreceiver(payload)
							if (res.code === 200) {
								item.phoneNotifySwitch = '1'
								item.smsNotifySwitch = '1'
								item.wechatNotifySwitch = '1'
								uni.showToast({
									title: '已自动开启电话、短信和微信通知',
									icon: 'none',
									duration: 2000
								})
							}
						} catch (e) {
							console.error('自动开启通知失败:', e)
						}
					}
					
					this.selectedReceivers.push(item)
				}
			},
			// 清空选择
			clearSelection() {
				this.selectedReceivers = []
			},
			// 取消单个接警人与设备的绑定
			async unbindReceiver(item) {
				try {
					uni.showLoading({
						title: '取消绑定中...'
					})
					// 保留当前已绑定列表中，去掉该接警人的ID
					const remainIds = this.boundReceivers
						.filter(r => r.receiverId !== item.receiverId)
						.map(r => r.receiverId)
					const res = await bindAlarmReceiverByDevice({
						deviceId: this.deviceId,
						deviceKey: this.deviceKey,
						productKey: this.productKey,
						receiverIds: remainIds
					})
					if (res.code === 200) {
						const idx = this.boundReceivers.findIndex(r => r.receiverId === item.receiverId)
						if (idx >= 0) this.boundReceivers.splice(idx, 1)
						
						// 取消绑定后，自动关闭所有通知开关
						try {
							const payload = {
								...item,
								phoneNotifySwitch: '2',
								smsNotifySwitch: '2',
								wechatNotifySwitch: '2'
							}
							await updateAlarmreceiver(payload)
							// 更新本地数据
							item.phoneNotifySwitch = '2'
							item.smsNotifySwitch = '2'
							item.wechatNotifySwitch = '2'
						} catch (e) {
							console.error('关闭通知开关失败:', e)
						}
						
						uni.showToast({
							title: `已取消绑定 ${item.receiverName || ''}`,
							icon: 'success'
						})
					} else {
						uni.showToast({
							title: res.msg || '取消绑定失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '取消绑定失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			// 批量绑定接警人
			async batchBindReceivers() {
				if (!this.deviceId) return
				if (this.selectedReceivers.length === 0) {
					uni.showToast({
						title: '请选择要绑定的接警人',
						icon: 'none'
					})
					return
				}

				try {
					uni.showLoading({
						title: '绑定中...'
					})

					// 合并已绑定的接警人 ID 和当前选中的接警人 ID（去重）
					const boundIds = this.boundReceivers.map(r => r.receiverId)
					const selectedIds = this.selectedReceivers.map(r => r.receiverId)
					const allIds = [...new Set([...boundIds, ...selectedIds])]

					const res = await bindAlarmReceiverByDevice({
						deviceId: this.deviceId,
						deviceKey: this.deviceKey,
						productKey: this.productKey,
						receiverIds: allIds // 提交合并后的列表
					})

					if (res.code === 200) {
						// 更新本地已绑定列表（去重）
						const newBound = this.selectedReceivers.filter(
							r => !this.boundReceivers.some(b => b.receiverId === r.receiverId)
						)
						
						if (newBound.length === 0) {
							uni.showToast({
								title: '选中的接警人已全部绑定',
								icon: 'none'
							})
							this.clearSelection()
							return
						}
						
						this.boundReceivers.push(...newBound)

						uni.showToast({
							title: `本次成功绑定 ${newBound.length} 位接警人`,
							icon: 'success'
						})
						this.clearSelection()

						// 延迟返回上一页
						setTimeout(() => {
							uni.navigateBack()
						}, 2000)
					} else {
						uni.showToast({
							title: res.msg || '绑定失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '绑定失败',
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
	.receiver-container {
		min-height: 100vh;
		background: #f5f7fa;
		box-sizing: border-box;
	}

	/* 列表样式 */
	.receiver-list {
		padding: 24rpx;
		box-sizing: border-box;
	}
	
	.tip-bar {
		background: #e6f7ff;
		padding: 16rpx 24rpx;
		border-radius: 12rpx;
		margin-bottom: 24rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;
		
		text {
			font-size: 26rpx;
			color: #1890ff;
		}
	}

	.receiver-card {
		background: #fff;
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
		border: 2rpx solid transparent;
		transition: all 0.3s;
		overflow: hidden;
		
		&.selected {
			border-color: #3ec6c6;
			background: #fcfcfc;
		}
		
		.card-content {
			padding: 0;
		}
		
		.card-header {
			padding: 24rpx 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.info-left {
				display: flex;
				align-items: center;
				gap: 20rpx;
				
				.avatar-icon {
					width: 80rpx;
					height: 80rpx;
					background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 4rpx 10rpx rgba(62, 198, 198, 0.2);
					
					text {
						color: #fff;
						font-size: 32rpx;
						font-weight: bold;
					}
				}
				
				.info-box {
					display: flex;
					flex-direction: column;
					gap: 8rpx;
					
					.name-row {
						display: flex;
						align-items: center;
						gap: 12rpx;
						
						.name {
							font-size: 32rpx;
							font-weight: bold;
							color: #333;
						}
						
						.status-badge {
							font-size: 20rpx;
							padding: 2rpx 10rpx;
							border-radius: 6rpx;
							
							&.bound {
								background: rgba(62, 198, 198, 0.1);
								color: #3ec6c6;
							}
						}
					}
					
					.phone {
						font-size: 26rpx;
						color: #666;
						font-family: 'Roboto', sans-serif;
					}
				}
			}
			
			.action-right {
				display: flex;
				gap: 20rpx;
				
				.icon-btn {
					width: 64rpx;
					height: 64rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					background: #f5f7fa;
					border-radius: 50%;
					
					&.delete {
						background: #fff1f0;
					}
					
					&:active {
						opacity: 0.8;
					}
				}
			}
			
			.check-box {
				.check-circle {
					width: 44rpx;
					height: 44rpx;
					border-radius: 50%;
					border: 2rpx solid #e0e0e0;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s;
					
					&.checked {
						background: #3ec6c6;
						border-color: #3ec6c6;
					}
				}
			}
		}
		
		.divider {
			height: 2rpx;
			background: #f9f9f9;
			margin: 0 30rpx;
		}
		
		.notify-settings {
			padding: 24rpx 30rpx;
			
			.notify-tags {
				display: flex;
				gap: 20rpx;
				
				.notify-tag {
					flex: 1;
					height: 64rpx;
					background: #f5f7fa;
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8rpx;
					border: 2rpx solid transparent;
					transition: all 0.3s;
					
					text {
						font-size: 26rpx;
						color: #666;
						font-weight: 500;
					}
					
					&.active {
						background: #e6fffb;
						border-color: #3ec6c6;
						
						text {
							color: #3ec6c6;
						}
					}
				}
			}
		}
		
		.remark-row {
			padding: 0 30rpx 20rpx;
			font-size: 24rpx;
			
			.label {
				color: #999;
			}
			
			.value {
				color: #666;
			}
		}
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 160rpx;
		
		.empty-icon-box {
			width: 160rpx;
			height: 160rpx;
			background: #fff;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 40rpx;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
		}
		
		.empty-text {
			font-size: 32rpx;
			color: #333;
			font-weight: 600;
			margin-bottom: 16rpx;
		}
		
		.empty-sub {
			font-size: 26rpx;
			color: #999;
		}
	}

	/* 底部按钮栏 */
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 24rpx 40rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 99;
		
		/* 适配全面屏 */
		padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		
		.add-btn-full {
			height: 88rpx;
			background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
			border-radius: 44rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 8rpx 20rpx rgba(62, 198, 198, 0.3);
			
			text {
				font-size: 32rpx;
				font-weight: 600;
				color: #fff;
			}
		}
		
		.batch-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			font-size: 28rpx;
			color: #333;
			
			.sub {
				color: #999;
				font-size: 24rpx;
			}
		}
		
		.btn-group {
			display: flex;
			gap: 20rpx;
			
			.action-btn {
				flex: 1;
				height: 88rpx;
				line-height: 88rpx;
				border-radius: 44rpx;
				font-size: 30rpx;
				font-weight: 600;
				border: none;
				
				&.plain {
					background: #f5f7fa;
					color: #666;
				}
				
				&.primary {
					background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
					color: #fff;
					box-shadow: 0 8rpx 20rpx rgba(62, 198, 198, 0.3);
					
					&[disabled] {
						background: #e0e0e0;
						box-shadow: none;
					}
				}
			}
		}
		
		.btn-hover {
			transform: scale(0.98);
			opacity: 0.9;
		}
	}

	/* 底部弹出层样式 */
	.popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 999;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s;
		
		&.show {
			opacity: 1;
			visibility: visible;
		}
	}

	.popup-container {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: #fff;
		border-radius: 32rpx 32rpx 0 0;
		transform: translateY(100%);
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		display: flex;
		flex-direction: column;
		max-height: 85vh;
		
		&.show {
			transform: translateY(0);
		}

		.popup-header {
			padding: 32rpx 40rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			border-bottom: 2rpx solid #f5f7fa;
			flex-shrink: 0;
			position: relative;

			.title {
				font-size: 34rpx;
				font-weight: 600;
				color: #333;
			}

			.close-btn {
				position: absolute;
				right: 30rpx;
				padding: 10rpx;
			}
		}

		.form-content {
			flex: 1;
			overflow-y: auto;
			padding: 0 40rpx;
		}

		.form-group {
			padding: 20rpx 0;
			border-bottom: 2rpx solid #f5f7fa;
			
			&:last-child {
				border-bottom: none;
			}
			
			.section-title {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 24rpx;
				margin-top: 10rpx;
				padding-left: 16rpx;
				border-left: 6rpx solid #3ec6c6;
				line-height: 1;
			}
		}

		.form-item {
			margin-bottom: 24rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			&.switch-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				background: #f9f9f9;
				padding: 20rpx 24rpx;
				border-radius: 12rpx;
			}
			
			&.column {
				flex-direction: column;
				align-items: flex-start;
				
				.label {
					margin-bottom: 16rpx;
				}
				
				textarea {
					width: 100%;
					height: 160rpx;
					background: #f9f9f9;
					padding: 20rpx;
					border-radius: 12rpx;
					box-sizing: border-box;
					font-size: 28rpx;
				}
				
				.char-count {
					align-self: flex-end;
					font-size: 24rpx;
					color: #ccc;
					margin-top: 8rpx;
				}
			}

			.label {
				display: block;
				font-size: 28rpx;
				color: #666;
				margin-bottom: 12rpx;
				
				&.required::after {
					content: '*';
					color: #ff5555;
					margin-left: 4rpx;
				}
			}

			.input-right {
				width: 100%;
				height: 88rpx;
				padding: 0 24rpx;
				border: 2rpx solid #e0e0e0;
				border-radius: 8rpx;
				font-size: 30rpx;
				color: #333;
				box-sizing: border-box;
				transition: all 0.2s;
				
				&:focus {
					border-color: #3ec6c6;
				}
			}
			
			.placeholder {
				color: #ccc;
			}
		}

		.popup-footer {
			padding: 24rpx 40rpx;
			background: #fff;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			flex-shrink: 0;
			
			.save-btn {
				height: 88rpx;
				background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
				border-radius: 44rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 8rpx 20rpx rgba(62, 198, 198, 0.3);
				
				text {
					color: #fff;
					font-size: 32rpx;
					font-weight: 600;
				}
			}
			
			.btn-hover {
				opacity: 0.9;
				transform: scale(0.98);
			}
		}
	}
</style>