<template>
	<view class="receiver-container">
		<view class="tip-box">
			<uni-icons type="info" size="16" color="#3ec6c6"></uni-icons>
			<text class="tip-text">{{ deviceId ? '选择要绑定到设备的接警人' : '添加接警人后，可在设备上进行绑定' }}</text>
		</view>

		<view class="receiver-list" v-if="receiverList.length > 0">
			<view class="receiver-card" v-for="(item, idx) in receiverList" :key="idx">
				<view class="card-header">
					<view class="receiver-info">
						<view class="receiver-avatar"><text
								class="avatar-text">{{ item.receiverName ? item.receiverName.charAt(0) : '?' }}</text>
						</view>
						<view class="receiver-meta">
							<view class="receiver-name">{{ item.receiverName || '-' }}</view>
						</view>
					</view>
					<view class="card-actions">
						<view class="action-btn" @click="editReceiver(item)">
							<uni-icons type="compose" size="18" color="#3ec6c6"></uni-icons>
							<text class="action-text">编辑</text>
						</view>
						<view class="action-btn delete" @click="deleteReceiver(item)">
							<uni-icons type="trash" size="18" color="#ff5555"></uni-icons>
							<text class="action-text">删除</text>
						</view>
						<view class="bind-checkbox" v-if="deviceId"
							:class="{ checked: isSelectedForBind(item.receiverId), bound: isReceiverBound(item.receiverId) }"
							@click="toggleSelection(item)">
							<view class="checkbox-icon">
								<uni-icons
									v-if="isSelectedForBind(item.receiverId) && !isReceiverBound(item.receiverId)"
									type="checkmark" size="16" color="#ffffff"></uni-icons>
							</view>
							<text class="bind-status">{{ isReceiverBound(item.receiverId) ? '已绑定' : '选择绑定' }}</text>
						</view>
					</view>
				</view>
				<view class="card-body">
					<view class="info-item">
						<uni-icons type="phone" size="14" color="#999"></uni-icons>
						<text class="info-label">手机号：</text>
						<text class="info-value">{{ item.receiverPhone || '-' }}</text>
					</view>
					<view class="info-item" v-if="item.receiverEmail">
						<uni-icons type="email" size="14" color="#999"></uni-icons>
						<text class="info-label">邮箱：</text>
						<text class="info-value">{{ item.receiverEmail }}</text>
					</view>
					<view class="info-item" v-if="item.remark">
						<uni-icons type="info" size="14" color="#999"></uni-icons>
						<text class="info-label">备注：</text>
						<text class="info-value">{{ item.remark }}</text>
					</view>
					<view class="notify-inline-row">
						<view class="notify-inline-item">
							<text class="notify-inline-label">电话通知</text>
							<view class="notify-inline-actions">
								<button class="notify-switch-btn" :class="{ active: item.phoneNotifySwitch === '1' }"
									@click.stop="changeNotifySwitch(item, 'phoneNotifySwitch')">
									{{ item.phoneNotifySwitch === '1' ? '开' : '关' }}
								</button>
							</view>
						</view>
						<view class="notify-inline-item">
							<text class="notify-inline-label">短信通知</text>
							<view class="notify-inline-actions">
								<button class="notify-switch-btn" :class="{ active: item.smsNotifySwitch === '1' }"
									@click.stop="changeNotifySwitch(item, 'smsNotifySwitch')">
									{{ item.smsNotifySwitch === '1' ? '开' : '关' }}
								</button>
							</view>
						</view>
						<view class="notify-inline-item">
							<text class="notify-inline-label">微信通知</text>
							<view class="notify-inline-actions">
								<button class="notify-switch-btn" :class="{ active: item.wechatNotifySwitch === '1' }"
									@click.stop="changeNotifySwitch(item, 'wechatNotifySwitch')">
									{{ item.wechatNotifySwitch === '1' ? '开' : '关' }}
								</button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="empty-box" v-else>
			<uni-icons type="personadd" size="80" color="#C0C0C0"></uni-icons>
			<text class="empty-text">还没有添加接警人</text>
			<text class="empty-tip">点击下方按钮添加</text>
		</view>

		<view class="add-btn-box" v-if="!deviceId">
			<view class="add-btn-card">
				<button class="add-btn" @click="addReceiver">
					<uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
					<text class="add-btn-text">添加接警人</text>
				</button>
			</view>
		</view>

		<view class="batch-bind-box" v-if="deviceId">
			<view class="bind-info">
				<text class="selected-count">已选择 {{ selectedReceivers.length }} 人</text>
				<text class="bind-count">已绑定 {{ boundReceivers.length }} 人</text>
			</view>
			<view class="bind-actions">
				<button class="batch-btn cancel" @click="clearSelection"
					v-if="selectedReceivers.length > 0">取消选择</button>
				<button class="batch-btn confirm" @click="batchBindReceivers"
					:disabled="selectedReceivers.length === 0">
					{{ selectedReceivers.length > 0 ? `绑定选中的 ${selectedReceivers.length} 人` : '请选择接警人' }}
				</button>
			</view>
		</view>

		<view class="modal" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ isEdit ? '编辑接警人' : '添加接警人' }}</text>
					<uni-icons class="modal-close-icon" type="closeempty" size="24" color="#999"
						@click="closeModal"></uni-icons>
				</view>
				<view class="modal-body">
					<view class="form-item">
						<text class="form-label">姓名 <text class="required">*</text></text>
						<input class="form-input" v-model="formData.receiverName" placeholder="请输入接警人姓名"
							maxlength="20" />
					</view>
					<view class="form-item">
						<text class="form-label">手机号 <text class="required">*</text></text>
						<input class="form-input" type="number" v-model="formData.receiverPhone" placeholder="请输入接警人手机号"
							maxlength="11" />
					</view>
					<view class="form-item">
						<text class="form-label">邮箱</text>
						<input class="form-input" v-model="formData.receiverEmail" placeholder="请输入接警人邮箱"
							maxlength="50" />
					</view>

					<view class="notify-row">
						<view class="notify-item">
							<text class="notify-label">电话通知</text>
							<view class="notify-actions">
								<button class="notify-btn" :class="{on: formData.phoneNotifySwitch==='1'}"
									@click="formData.phoneNotifySwitch='1'">开</button>
								<button class="notify-btn" :class="{off: formData.phoneNotifySwitch==='2'}"
									@click="formData.phoneNotifySwitch='2'">关</button>
							</view>
						</view>
						<view class="notify-item">
							<text class="notify-label">短信通知</text>
							<view class="notify-actions">
								<button class="notify-btn" :class="{on: formData.smsNotifySwitch==='1'}"
									@click="formData.smsNotifySwitch='1'">开</button>
								<button class="notify-btn" :class="{off: formData.smsNotifySwitch==='2'}"
									@click="formData.smsNotifySwitch='2'">关</button>
							</view>
						</view>
						<view class="notify-item">
							<text class="notify-label">微信通知</text>
							<view class="notify-actions">
								<button class="notify-btn" :class="{on: formData.wechatNotifySwitch==='1'}"
									@click="formData.wechatNotifySwitch='1'">开</button>
								<button class="notify-btn" :class="{off: formData.wechatNotifySwitch==='2'}"
									@click="formData.wechatNotifySwitch='2'">关</button>
							</view>
						</view>
					</view>

					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea class="form-textarea" v-model="formData.remark" placeholder="请输入备注"
							maxlength="200"></textarea>
						<text class="char-count">{{ (formData.remark || '').length }}/200</text>
					</view>
				</view>
				<view class="modal-footer">
					<button class="cancel-btn" @click="closeModal">取消</button>
					<button class="confirm-btn" :loading="submitting" @click="submitReceiver">确定</button>
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
							icon: 'success'
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
			toggleSelection(item) {
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
		background: #f5f5f5;
		padding-bottom: 120rpx;
	}

	.tip-box {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: #e6f7ff;
		border: 1rpx solid #91d5ff;
		padding: 16rpx 20rpx;
		margin: 20rpx;
		border-radius: 8rpx;
	}

	.tip-text {
		color: #1890ff;
		font-size: 26rpx;
	}

	.receiver-list {
		padding: 0 24rpx 180rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.receiver-card {
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		padding: 24rpx;
		border: 1rpx solid #f0f0f0;
	}

	.receiver-card:active {
		transform: scale(0.998);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.receiver-info {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.receiver-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		box-shadow: 0 6rpx 12rpx rgba(62, 198, 198, 0.25);
	}

	.avatar-text {
		font-size: 32rpx;
		font-weight: 700;
	}

	.receiver-meta {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.receiver-name {
		font-size: 32rpx;
		font-weight: 700;
		color: #333;
	}

	.receiver-type {
		font-size: 22rpx;
		color: #0f766e;
		background: #e6fffb;
		padding: 6rpx 14rpx;
		border-radius: 999rpx;
		align-self: flex-start;
		border: 1rpx solid #87e8de;
	}

	.card-actions {
		display: flex;
		gap: 28rpx;
		align-items: center;
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
	}

	.action-text {
		font-size: 22rpx;
		color: #3ec6c6;
	}

	.action-btn.delete .action-text {
		color: #ff5555;
	}

	.bind-checkbox {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 12rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		background: #fff;
		color: #13c2c2;
		border: 1rpx solid #87e8de;
		transition: all 0.3s ease;
	}

	.bind-checkbox .checkbox-icon {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: rgba(19, 194, 194, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bind-checkbox .bind-status {
		font-weight: 500;
	}

	.bind-checkbox.checked {
		background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
		color: #fff;
		border-color: #3ec6c6;
	}

	.bind-checkbox.checked .checkbox-icon {
		background: rgba(255, 255, 255, 0.35);
	}

	.bind-checkbox.bound {
		background: #f5f5f5;
		color: #999;
		border-color: #e0e0e0;
	}

	.bind-checkbox.bound .checkbox-icon {
		background: rgba(0, 0, 0, 0.06);
	}

	.card-body {
		margin-top: 12rpx;
		border-top: 1rpx dashed #f0f0f0;
		padding-top: 12rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 12rpx 0;
	}

	.info-label {
		font-size: 24rpx;
		color: #666;
	}

	.info-value {
		font-size: 26rpx;
		color: #333;
	}

	.notify-inline-row {
		margin-top: 8rpx;
		padding-top: 8rpx;
		border-top: 1rpx dashed #f5f5f5;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		row-gap: 12rpx;
	}

	.notify-inline-item {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.notify-inline-label {
		font-size: 24rpx;
		color: #666;
	}

	.notify-inline-actions {
		display: flex;
		align-items: center;
	}

	.notify-switch-btn {
		min-width: 80rpx;
		height: 54rpx;
		line-height: 54rpx;
		padding: 0 18rpx;
		border-radius: 999rpx;
		border: 1rpx solid #d9d9d9;
		background: #fafafa;
		font-size: 24rpx;
		color: #999;
		text-align: center;
	}

	.notify-switch-btn.active {
		background: #e6f7ff;
		border-color: #91d5ff;
		color: #1890ff;
	}

	.empty-box {
		margin-top: 120rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		color: #999;
	}

	.empty-icon {
		font-size: 120rpx;
		color: #ddd;
	}

	.empty-text {
		font-size: 28rpx;
	}

	.empty-tip {
		font-size: 24rpx;
	}

	.add-btn-box {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 16rpx 0;
		padding-bottom: calc(env(safe-area-inset-bottom, 0rpx) + 16rpx);
		background: #fff;
		box-shadow: 0 -6rpx 16rpx rgba(0, 0, 0, 0.06);
		border-top: 1rpx solid #f0f0f0;
	}

	.add-btn-card {
		border-radius: 0;
		border: 0;
		box-shadow: none;
		padding: 0 24rpx;
		background: transparent;
	}

	.add-btn {
		width: 100%;
		height: 92rpx;
		line-height: 92rpx;
		border: none;
		border-radius: 14rpx;
		background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
		color: #fff;
		font-size: 30rpx;
		font-weight: 700;
		box-shadow: 0 10rpx 20rpx rgba(62, 198, 198, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-btn-text {
		margin-left: 8rpx;
	}

	.modal {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		width: 86%;
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.20);
	}

	.modal-header {
		position: relative;
		padding: 24rpx 60rpx 20rpx;
		border-bottom: 1rpx solid #f5f5f5;
		background: linear-gradient(135deg, #f5fffb, #f0f9ff);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-title {
		text-align: center;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.modal-close-icon {
		position: absolute;
		right: 24rpx;
		top: 24rpx;
	}

	.modal-body {
		padding: 20rpx 24rpx;
	}

	.notify-row {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
		margin: 8rpx 0 12rpx;
	}

	.notify-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.notify-label {
		font-size: 26rpx;
		color: #333;
	}

	.notify-actions {
		display: flex;
		gap: 12rpx;
	}

	.notify-btn {
		min-width: 100rpx;
		height: 60rpx;
		padding: 0 20rpx;
		border-radius: 10rpx;
		border: 1rpx solid #e0e0e0;
		background: #fff;
		color: #666;
		font-size: 26rpx;
	}

	.notify-btn.on {
		background: #e6fffb;
		border-color: #87e8de;
		color: #13c2c2;
	}

	.notify-btn.off {
		background: #fff1f0;
		border-color: #ffa39e;
		color: #ff4d4f;
	}

	.form-item {
		margin-bottom: 16rpx;
	}

	.form-label {
		font-size: 26rpx;
		color: #333;
	}

	.required {
		color: #ff4d4f;
	}

	.form-input {
		height: 72rpx;
		border: 1rpx solid #e0e0e0;
		border-radius: 10rpx;
		padding: 0 16rpx;
		font-size: 28rpx;
		background: #fff;
	}

	.form-textarea {
		min-height: 140rpx;
		border: 1rpx solid #e0e0e0;
		border-radius: 8rpx;
		padding: 12rpx 16rpx;
		font-size: 28rpx;
	}

	.char-count {
		display: block;
		text-align: right;
		color: #999;
		font-size: 22rpx;
		margin-top: 6rpx;
	}

	.modal-footer {
		display: flex;
		gap: 16rpx;
		padding: 20rpx 24rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.cancel-btn,
	.confirm-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border: none;
		border-radius: 12rpx;
		font-size: 30rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.cancel-btn::after,
	.confirm-btn::after {
		border: none;
	}

	.cancel-btn {
		background: #f5f5f5;
		color: #666;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #3ec6c6, #36b3b3);
		color: #fff;
		box-shadow: 0 8rpx 16rpx rgba(62, 198, 198, 0.25);
	}

	/* 批量绑定操作栏 */
	.batch-bind-box {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);
		padding: 24rpx;
		padding-bottom: calc(env(safe-area-inset-bottom, 0rpx) + 24rpx);
	}

	.batch-bind-box .bind-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
		padding: 0 8rpx;
	}

	.batch-bind-box .selected-count {
		font-size: 26rpx;
		color: #3ec6c6;
		font-weight: 500;
	}

	.batch-bind-box .bind-count {
		font-size: 24rpx;
		color: #999;
	}

	.batch-bind-box .bind-actions {
		display: flex;
		gap: 16rpx;
	}

	.batch-bind-box .batch-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border: none;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.batch-bind-box .batch-btn::after {
		border: none;
	}

	.batch-bind-box .batch-btn.cancel {
		background: #f5f5f5;
		color: #666;
		flex: 0 0 120rpx;
	}

	.batch-bind-box .batch-btn.cancel:active {
		background: #e8e8e8;
	}

	.batch-bind-box .batch-btn.confirm {
		background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
		color: #fff;
	}

	.batch-bind-box .batch-btn.confirm:disabled {
		background: #ccc;
		color: #999;
	}

	.batch-bind-box .batch-btn.confirm:active:not(:disabled) {
		opacity: 0.8;
	}
</style>