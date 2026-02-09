<template>
	<view class="family-container">
		<!-- 顶部提示 -->
		<view class="tip-box" v-if="deviceId || memberList.length > 0">
			<uni-icons type="info" size="16" color="#3ec6c6"></uni-icons>
			<text class="tip-text">{{ deviceId ? '请选择要绑定到设备的家庭成员' : '添加家庭成员后，可为家人预约服务' }}</text>
		</view>

		<!-- 成员列表 -->
		<scroll-view 
			class="member-list" 
			scroll-y 
			:style="{ height: 'calc(100vh - ' + (180 + safeAreaBottom) + 'rpx)' }"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<view v-if="memberList.length === 0" class="empty-state">
				<view class="empty-icon-box">
					<uni-icons type="staff-filled" size="60" color="#e0e0e0"></uni-icons>
				</view>
				<text class="empty-text">暂无家庭成员</text>
				<text class="empty-sub">点击底部按钮添加家人信息</text>
			</view>
			
			<view v-else class="member-card" v-for="(member, index) in memberList" :key="index" :class="{ 'selected': isSelectedForBind(member.memberId) }">
				<!-- 绑定选择遮罩（仅在绑定模式下有效） -->
				<view class="card-content" @click="deviceId ? toggleSelection(member) : null">
					<view class="card-header">
						<view class="header-left">
							<view class="avatar-box">
								<text class="avatar-text">{{ member.memberName ? member.memberName.charAt(0) : '家' }}</text>
							</view>
							<view class="info-box">
								<view class="name-row">
									<text class="name">{{ member.memberName }}</text>
									<text class="relation-tag" v-if="member.relationship">{{ member.relationship }}</text>
								</view>
								<view class="gender-row" v-if="member.sex">
									<uni-icons :type="member.sex === '0' ? 'person-filled' : 'person'" size="14" :color="member.sex === '0' ? '#3ec6c6' : '#ff7875'"></uni-icons>
									<text class="gender-text">{{ member.sex === '0' ? '男' : '女' }}</text>
								</view>
							</view>
						</view>
						
						<!-- 绑定状态指示 -->
						<view class="bind-status" v-if="deviceId">
							<view class="checkbox" :class="{ 'checked': isSelectedForBind(member.memberId), 'bound': isMemberBound(member.memberId) }">
								<uni-icons v-if="isMemberBound(member.memberId)" type="checkmarkempty" size="14" color="#fff"></uni-icons>
								<uni-icons v-else-if="isSelectedForBind(member.memberId)" type="checkmarkempty" size="14" color="#fff"></uni-icons>
							</view>
							<text class="status-text" :class="{ 'bound': isMemberBound(member.memberId) }">
								{{ isMemberBound(member.memberId) ? '已绑定' : (isSelectedForBind(member.memberId) ? '已选择' : '选择') }}
							</text>
						</view>
					</view>
					
					<view class="card-body">
						<!-- 健康指标 -->
						<view class="metrics-row" v-if="member.height || member.weight || member.bmi">
							<view class="metric-item" v-if="member.bmi">
								<text class="label">BMI</text>
								<text class="value">{{ member.bmi }}</text>
							</view>
							<view class="metric-item" v-if="member.height">
								<text class="label">身高</text>
								<text class="value">{{ member.height }}<text class="unit">cm</text></text>
							</view>
							<view class="metric-item" v-if="member.weight">
								<text class="label">体重</text>
								<text class="value">{{ member.weight }}<text class="unit">kg</text></text>
							</view>
						</view>
						
						<view class="info-row">
							<view class="info-item">
								<text class="label">电话</text>
								<text class="value">{{ member.phone }}</text>
							</view>
						</view>
						<view class="info-row" v-if="member.idCard">
							<view class="info-item">
								<text class="label">身份证</text>
								<text class="value">{{ formatIdCard(member.idCard) }}</text>
							</view>
						</view>
						<view class="info-row" v-if="member.remark">
							<view class="info-item full">
								<text class="label">备注</text>
								<text class="value remark">{{ member.remark }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 分割线 -->
				<view class="divider"></view>
				
				<!-- 操作栏 -->
				<view class="card-footer">
					<view class="action-btn delete" @click.stop="deleteMember(member)">
						<uni-icons type="trash" size="16" color="#ff5555"></uni-icons>
						<text>删除</text>
					</view>
					<view class="action-btn edit" @click.stop="editMember(member)">
						<uni-icons type="compose" size="16" color="#3ec6c6"></uni-icons>
						<text>编辑资料</text>
					</view>
				</view>
			</view>
			
			<!-- 底部占位 -->
			<view style="height: 40rpx;"></view>
		</scroll-view>

		<!-- 底部按钮栏 -->
		<view class="bottom-bar" v-if="!deviceId" :style="{ paddingBottom: (safeAreaBottom + 24) + 'rpx' }">
			<view class="add-btn" @click="addMember" hover-class="btn-hover">
				<uni-icons type="plusempty" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
				<text>添加家庭成员</text>
			</view>
		</view>

		<!-- 批量绑定操作栏 -->
		<view class="bottom-bar bind-mode" v-if="deviceId" :style="{ paddingBottom: (safeAreaBottom + 24) + 'rpx' }">
			<view class="bind-info">
				<text>已选 {{ selectedMembers.length }} 人</text>
			</view>
			<view class="btn-group">
				<view class="action-btn cancel" @click="clearSelection" v-if="selectedMembers.length > 0">取消</view>
				<view class="action-btn confirm" 
					:class="{ disabled: selectedMembers.length === 0 }"
					@click="batchBindMembers">
					确认绑定
				</view>
			</view>
		</view>

		<!-- 编辑弹窗 (底部弹出) -->
		<view v-if="showModal" class="popup-mask" @click="closeModal" :class="{ 'show': showModal }">
			<view class="popup-container" @click.stop :class="{ 'show': showModal }">
				<view class="popup-header">
					<text class="title">{{ isEdit ? '编辑成员' : '添加成员' }}</text>
					<view class="close-btn" @click="closeModal">
						<uni-icons type="closeempty" size="24" color="#999"></uni-icons>
					</view>
				</view>
				
				<scroll-view class="form-content" scroll-y>
					<view class="form-group">
						<view class="form-item">
							<text class="label required">姓名</text>
							<input type="text" v-model="formData.memberName" placeholder="请输入成员姓名" placeholder-class="placeholder" />
						</view>
						<view class="form-item">
							<text class="label required">关系</text>
							<picker mode="selector" :range="relationList" @change="onRelationChange" class="picker-flex">
								<view class="picker-view">
									<text v-if="!formData.relationship" class="placeholder">请选择与本人关系</text>
									<text v-else class="value">{{ formData.relationship }}</text>
									<uni-icons type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
						<!-- 身高体重BMI -->
						<view class="form-row">
							<view class="form-item half">
								<text class="label required">身高(cm)</text>
								<input
									type="digit"
									v-model="formData.height"
									placeholder="请输入"
									placeholder-class="placeholder"
									class="input-right"
									@input="calculateBMI"
								/>
							</view>
							<view class="form-item half">
								<text class="label required">体重(kg)</text>
								<input
									type="digit"
									v-model="formData.weight"
									placeholder="请输入"
									placeholder-class="placeholder"
									class="input-right"
									@input="calculateBMI"
								/>
							</view>
						</view>
						<view class="form-item">
							<text class="label">BMI</text>
							<input type="text" v-model="formData.bmi" disabled placeholder="-" placeholder-class="placeholder" />
						</view>
						<view class="form-item">
							<text class="label required">电话</text>
							<input type="number" v-model="formData.phone" maxlength="11" placeholder="请输入联系电话" placeholder-class="placeholder" />
						</view>
						<view class="form-item">
							<text class="label required">身份证</text>
							<input type="idcard" v-model="formData.idCard" maxlength="18" placeholder="请输入身份证号" placeholder-class="placeholder" />
						</view>
						<view class="form-item column">
							<text class="label">备注</text>
							<textarea v-model="formData.remark" placeholder="请输入备注信息（选填）" placeholder-class="placeholder" maxlength="200" disable-default-padding />
							<text class="char-count">{{ (formData.remark || '').length }}/200</text>
						</view>
					</view>
				</scroll-view>
				
				<view class="popup-footer" :style="{ paddingBottom: (safeAreaBottom + 24) + 'rpx' }">
					<view class="save-btn" @click="submitForm" hover-class="btn-hover">
						<text>{{ submitting ? '提交中...' : '保存' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>>

<script>
import { listFamilymemberNoPage, addFamilymember, updateFamilymember, delFamilymember } from '@/api/familymember'
import { getMemberIdsByDeviceId, bindFamilyMemberByDevice, delFamilyMemberDevice } from '@/api/familyMemberDevice'

export default {
	data() {
		return {
			memberList: [],
			showModal: false,
			isEdit: false,
			submitting: false,
			deviceId: '', // 设备ID，从路由参数获取
			boundMembers: [], // 已绑定的成员列表
			selectedMembers: [], // 选中要绑定的成员列表
			isRefreshing: false, // 下拉刷新状态
			safeAreaBottom: 0, // 底部安全区域
			formData: {
				memberId: null,
				memberName: '',
				relationship: '',
				phone: '',
				idCard: '',
				height: '',
				weight: '',
				bmi: '',
				remark: ''
			},
			originalFormData: null, // 保存原始数据用于对比
			relationList: ['本人', '爷爷', '奶奶', '外公', '外婆', '父亲', '母亲', '叔叔', '阿姨', '舅舅', '舅妈', '姑姑', '姑父', '姨妈', '姨父', '配偶', '兄弟', '姐妹', '朋友','其他']
		}
	},
	onLoad(options) {
		this.getSystemInfo()
		// 获取设备ID参数
		if (options.deviceId) {
			this.deviceId = options.deviceId
			this.loadBoundMembers()
		}
		this.loadMembers()
	},
	onShow() {
		this.loadMembers()
	},
	methods: {
		// 获取系统信息
		getSystemInfo() {
			const systemInfo = uni.getSystemInfoSync()
			if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom) {
				this.safeAreaBottom = systemInfo.safeAreaInsets.bottom * 2
			} else {
				this.safeAreaBottom = 0
			}
		},

		// 加载成员列表
		async loadMembers() {
			try {
				const response = await listFamilymemberNoPage()

				if (response.code === 200) {
					this.memberList = response.data || []
					// 如果有设备ID，加载绑定状态
					if (this.deviceId) {
						this.loadBoundMembers()
					}
				} else {
					uni.showToast({
						title: response.msg || '加载失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('加载成员列表失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				this.isRefreshing = false
			}
		},

		// 下拉刷新
		async onRefresh() {
			this.isRefreshing = true
			await this.loadMembers()
		},

		// 添加成员
		addMember() {
			this.isEdit = false
			this.formData = {
				memberId: null,
				memberName: '',
				relationship: '',
				phone: '',
				idCard: '',
				height: '',
				weight: '',
				bmi: '',
				remark: ''
			}
			this.showModal = true
		},

		// 编辑成员
		editMember(member) {
			this.isEdit = true
			this.formData = {
				memberId: member.memberId,
				memberName: member.memberName,
				relationship: member.relationship,
				phone: member.phone,
				idCard: member.idCard || '',
				height: member.height || '',
				weight: member.weight || '',
				bmi: member.bmi || '',
				remark: member.remark || ''
			}
			// 保存原始数据的深拷贝用于对比
			this.originalFormData = JSON.parse(JSON.stringify(this.formData))
			this.showModal = true
		},

		// 删除成员
		deleteMember(member) {
			const memberName = member.memberName || '该成员'
			uni.showModal({
				title: '确认删除',
				content: `确定要删除"${memberName}"吗？删除后不可恢复。`,
				confirmText: '删除',
				cancelText: '取消',
				success: async (res) => {
					if (res.confirm) {
						try {
							const response = await delFamilymember(member.memberId)
							if (response.code === 200) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								this.loadMembers()
							} else {
								uni.showToast({
									title: response.msg || '删除失败',
									icon: 'none'
								})
							}
						} catch (error) {
							console.error('删除失败:', error)
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		// 关系选择
		onRelationChange(e) {
			this.formData.relationship = this.relationList[e.detail.value]
		},

		// 计算BMI
		calculateBMI() {
			const height = parseFloat(this.formData.height)
			const weight = parseFloat(this.formData.weight)
			
			if (height > 0 && weight > 0) {
				const heightInMeters = height / 100
				const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2)
				this.formData.bmi = bmi
			} else {
				this.formData.bmi = ''
			}
		},

		// 提交表单
		async submitForm() {
			// 检查数据是否有变更（仅在编辑模式下）
			if (this.isEdit && this.originalFormData) {
				const isDataChanged = JSON.stringify(this.formData) !== JSON.stringify(this.originalFormData)
				if (!isDataChanged) {
					uni.showToast({
						title: '数据未更改',
						icon: 'none'
					})
					return
				}
			}

			// 验证必填项
			if (!this.formData.memberName) {
				uni.showToast({
					title: '请输入成员姓名',
					icon: 'none'
				})
				return
			}
			if (!this.formData.phone) {
				uni.showToast({
					title: '请输入联系电话',
					icon: 'none'
				})
				return
			}

			// 验证手机号格式
			const phoneReg = /^1[3-9]\d{9}$/
			if (!phoneReg.test(this.formData.phone)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
				return
			}

			// 验证身高
			if (!this.formData.height || parseFloat(this.formData.height) <= 0) {
				uni.showToast({
					title: '请输入有效的身高',
					icon: 'none'
				})
				return
			}

			// 验证体重
			if (!this.formData.weight || parseFloat(this.formData.weight) <= 0) {
				uni.showToast({
					title: '请输入有效的体重',
					icon: 'none'
				})
				return
			}

			// 验证身份证号格式（如果填写了）
			if (this.formData.idCard) {
				const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
				if (!idCardReg.test(this.formData.idCard)) {
					uni.showToast({
						title: '请输入正确的身份证号',
						icon: 'none'
					})
					return
				}
			}

			try {
				this.submitting = true

				// 从 storage_data 中读取用户信息
				const storageData = uni.getStorageSync('storage_data')
				const submitData = {
					...this.formData,
					userId: storageData.user_id
				}

				let response
				if (this.isEdit) {
					response = await updateFamilymember(submitData)
				} else {
					response = await addFamilymember(submitData)
				}

				if (response.code === 200) {
					uni.showToast({
						title: this.isEdit ? '修改成功' : '添加成功',
						icon: 'success'
					})
					this.closeModal()
					this.loadMembers()
				} else {
					uni.showToast({
						title: response.msg || '操作失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('提交失败:', error)
				uni.showToast({
					title: '操作失败',
					icon: 'none'
				})
			} finally {
				this.submitting = false
			}
		},

		// 关闭弹窗
		closeModal() {
			this.showModal = false
			this.formData = {
				memberId: null,
				memberName: '',
				relationship: '',
				phone: '',
				idCard: '',
				height: '',
				weight: '',
				bmi: '',
				remark: ''
			}
			this.originalFormData = null
		},

		// 格式化身份证号（隐藏中间部分）
		formatIdCard(idCard) {
			if (!idCard) return ''
			if (idCard.length === 18) {
				return idCard.substring(0, 6) + '********' + idCard.substring(14)
			}
			return idCard
		},

		// 加载已绑定的成员列表
		async loadBoundMembers() {
			try {
				const response = await getMemberIdsByDeviceId(this.deviceId)
				if (response.code === 200) {
					// 获取到的是成员ID列表，需要转换为完整的成员信息
					const boundMemberIds = response.data || []
					this.boundMembers = this.memberList.filter(member => 
						boundMemberIds.includes(member.memberId)
					)
				}
			} catch (error) {
				console.error('加载绑定成员失败:', error)
			}
		},

		// 检查成员是否已绑定
		isMemberBound(memberId) {
			return this.boundMembers.some(member => member.memberId === memberId)
		},

		// 检查成员是否被选中
		isSelectedForBind(memberId) {
			return this.selectedMembers.some(member => member.memberId === memberId)
		},

		// 切换成员选择状态
		toggleSelection(member) {
			// 如果已经绑定，弹窗确认后执行取消绑定
			if (this.isMemberBound(member.memberId)) {
				return uni.showModal({
					title: '确认取消绑定',
					content: `确定要取消与“${member.memberName}”的绑定吗？`,
					confirmText: '取消绑定',
					cancelText: '再想想'
				}).then(res => {
					if (res[1] && res[1].confirm) {
						uni.showLoading({ title: '取消绑定中...' })
						return delFamilyMemberDevice(member.memberId)
							.then(response => {
								if (response.code === 200) {
									const idx = this.boundMembers.findIndex(m => m.memberId === member.memberId)
									if (idx >= 0) this.boundMembers.splice(idx, 1)
									uni.showToast({ title: `已取消绑定 ${member.memberName}`, icon: 'success' })
								} else {
									uni.showToast({ title: response.msg || '取消绑定失败', icon: 'none' })
								}
							})
							.catch(err => {
								console.error('取消绑定失败:', err)
								uni.showToast({ title: '取消绑定失败', icon: 'none' })
							})
							.finally(() => {
								uni.hideLoading()
							})
					}
				})
			}

			const index = this.selectedMembers.findIndex(m => m.memberId === member.memberId)
			if (index >= 0) {
				// 取消选择
				this.selectedMembers.splice(index, 1)
			} else {
				// 添加选择
				this.selectedMembers.push(member)
			}
		},

		// 清空选择
		clearSelection() {
			this.selectedMembers = []
		},

		// 批量绑定成员
		async batchBindMembers() {
			if (this.selectedMembers.length === 0) {
				uni.showToast({
					title: '请选择要绑定的成员',
					icon: 'none'
				})
				return
			}

			try {
				uni.showLoading({
					title: '绑定中...'
				})

				// 合并已绑定的成员ID和当前选中的成员ID（去重）
				const boundIds = this.boundMembers.map(m => m.memberId)
				const selectedIds = this.selectedMembers.map(m => m.memberId)
				const allIds = [...new Set([...boundIds, ...selectedIds])]

				const bindData = {
					deviceId: this.deviceId,
					memberIds: allIds // 提交合并后的列表
				}

				const response = await bindFamilyMemberByDevice(bindData)
				if (response.code === 200) {
					// 更新本地已绑定列表（去重）
					const newBound = this.selectedMembers.filter(
						m => !this.boundMembers.some(b => b.memberId === m.memberId)
					)
					
					if (newBound.length === 0) {
						uni.showToast({
							title: '选中的成员已全部绑定',
							icon: 'none'
						})
						this.clearSelection()
						return
					}
					
					this.boundMembers.push(...newBound)
					
					uni.showToast({
						title: `本次成功绑定 ${newBound.length} 位成员`,
						icon: 'success'
					})
					
					// 清空选择
					this.clearSelection()
					
					// 延迟返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 2000)
				} else {
					uni.showToast({
						title: response.msg || '绑定失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('批量绑定失败:', error)
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
.family-container {
	min-height: 100vh;
	background: #f5f7fa;
	box-sizing: border-box;
}

/* 顶部提示 */
.tip-box {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx 32rpx;
	background: linear-gradient(to right, #e6f7ff, #ffffff);
	margin: 24rpx 24rpx 0;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.08);
	border-left: 8rpx solid #3ec6c6;
	
	.tip-text {
		font-size: 26rpx;
		color: #333;
		line-height: 1.5;
		flex: 1;
	}
}

.member-list {
	padding: 24rpx;
	box-sizing: border-box;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
	
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

/* 成员卡片 */
.member-card {
	background: #fff;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	overflow: hidden;
	transition: all 0.3s ease;
	border: 2rpx solid transparent;
	
	&.selected {
		border-color: #3ec6c6;
		background: #f0fcfc;
	}

	.card-content {
		padding: 30rpx;
		padding-bottom: 20rpx;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24rpx;
		
		.header-left {
			display: flex;
			gap: 24rpx;
			align-items: center;
			
			.avatar-box {
				width: 96rpx;
				height: 96rpx;
				border-radius: 50%;
				background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
				
				.avatar-text {
					font-size: 40rpx;
					color: #fff;
					font-weight: 600;
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
						font-size: 34rpx;
						font-weight: 600;
						color: #333;
					}
					
					.relation-tag {
						font-size: 22rpx;
						color: #3ec6c6;
						background: rgba(62, 198, 198, 0.1);
						padding: 2rpx 10rpx;
						border-radius: 6rpx;
						font-weight: 500;
					}
				}
				
				.gender-row {
					display: flex;
					align-items: center;
					gap: 8rpx;
					
					.gender-text {
						font-size: 26rpx;
						color: #666;
					}
				}
			}
		}
		
		.bind-status {
			display: flex;
			align-items: center;
			gap: 8rpx;
			
			.checkbox {
				width: 36rpx;
				height: 36rpx;
				border-radius: 50%;
				border: 2rpx solid #ddd;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s;
				
				&.checked {
					background: #3ec6c6;
					border-color: #3ec6c6;
				}
				
				&.bound {
					background: #ff5555; // 使用红色表示已绑定（可能需要解绑）
					border-color: #ff5555;
				}
			}
			
			.status-text {
				font-size: 24rpx;
				color: #999;
				
				&.bound {
					color: #ff5555;
				}
			}
		}
	}
	
	.card-body {
		.metrics-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 0;
			background: #f8fcfc;
			border-radius: 16rpx;
			margin-bottom: 24rpx;
			border: none;
			
			.metric-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				position: relative;
				
				/* 添加竖向分割线 */
				&:not(:last-child)::after {
					content: '';
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 2rpx;
					height: 40rpx;
					background: #e0e0e0;
				}
				
				.label {
					font-size: 24rpx;
					color: #999;
					margin-bottom: 12rpx;
				}
				
				.value {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
					font-family: 'Roboto', sans-serif;
					line-height: 1;
					
					.unit {
						font-size: 22rpx;
						font-weight: normal;
						color: #999;
						margin-left: 4rpx;
					}
				}
			}
		}
		
		.info-row {
			margin-bottom: 16rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.info-item {
				display: flex;
				font-size: 28rpx;
				
				.label {
					color: #999;
					width: 100rpx;
					flex-shrink: 0;
				}
				
				.value {
					color: #333;
					font-family: 'Roboto', sans-serif;
					
					&.remark {
						line-height: 1.5;
					}
				}
			}
		}
	}
	
	.divider {
		height: 2rpx;
		background: #f5f7fa;
		margin: 0 30rpx;
		background-image: linear-gradient(to right, #f5f7fa 50%, transparent 50%);
		background-size: 16rpx 2rpx;
		background-repeat: repeat-x;
	}
	
	.card-footer {
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		
		.action-btn {
			display: flex;
			align-items: center;
			gap: 6rpx;
			padding: 10rpx 24rpx;
			border-radius: 30rpx;
			font-size: 26rpx;
			transition: all 0.2s;
			
			&.edit {
				background: #f0fcfc;
				color: #3ec6c6;
			}
			
			&.delete {
				background: #fff1f0;
				color: #ff5555;
			}
			
			&:active {
				opacity: 0.8;
			}
		}
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
	
	.add-btn {
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
	
	.btn-hover {
		transform: scale(0.98);
		opacity: 0.9;
	}
	
	/* 绑定模式样式 */
	&.bind-mode {
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.bind-info {
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
			
			text {
				color: #3ec6c6;
				font-weight: 600;
			}
		}
		
		.btn-group {
			display: flex;
			gap: 20rpx;
			
			.action-btn {
				height: 72rpx;
				padding: 0 32rpx;
				border-radius: 36rpx;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&.cancel {
					background: #f5f7fa;
					color: #666;
				}
				
				&.confirm {
					background: #3ec6c6;
					color: #fff;
					box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
					
					&.disabled {
						background: #ccc;
						box-shadow: none;
					}
				}
			}
		}
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
		align-items: center;
		justify-content: center; /* 改为居中对齐 */
		border-bottom: 2rpx solid #f5f7fa;
		flex-shrink: 0;
		position: relative; /* 确保相对定位 */

		.title {
			font-size: 34rpx;
			font-weight: 600;
			color: #333;
		}

		.close-btn {
			position: absolute; /* 绝对定位到右侧 */
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
	}

	/* 并排表单行 */
	.form-row {
		display: flex;
		align-items: center;
		border-bottom: 2rpx solid #f5f7fa;
		
		.form-item {
			flex: 1;
			border-bottom: none;
			padding: 32rpx 0;
			position: relative;
			
			/* 标签和输入框布局 */
			display: flex;
			align-items: center;
			justify-content: space-between;
			
			&:first-child {
				padding-right: 24rpx;
				
				/* 中间竖线 */
				&::after {
					content: '';
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 2rpx;
					height: 32rpx;
					background: #f0f0f0;
				}
			}
			
			&:last-child {
				padding-left: 24rpx;
			}
			
			.label {
				width: auto; 
				margin-right: 12rpx;
				font-size: 28rpx;
				white-space: nowrap; /* 防止换行 */
			}
			
			input {
				text-align: right;
				font-size: 30rpx;
				width: 100%; /* 确保占满剩余空间 */
			}
		}
	}

	.form-item {
		padding: 32rpx 0;
		border-bottom: 2rpx solid #f5f7fa;
		display: flex;
		align-items: center;
		
		&.column {
			flex-direction: column;
			align-items: flex-start;
			
			.label {
				margin-bottom: 20rpx;
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
			width: 140rpx;
			font-size: 30rpx;
			color: #333;
			font-weight: 500;
			
			&.required::after {
				content: '*';
				color: #ff5555;
				margin-left: 4rpx;
			}
		}

		input {
			flex: 1;
			font-size: 30rpx;
			color: #333;
			text-align: right;
			
			&[disabled] {
				color: #999;
			}
		}
		
		.placeholder {
			color: #ccc;
		}
		
		.picker-flex {
			flex: 1;
		}

		.picker-view {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			
			.value {
				color: #333;
				font-size: 30rpx;
				margin-right: 10rpx;
			}
			
			.placeholder {
				color: #ccc;
				font-size: 30rpx;
				margin-right: 10rpx;
			}
		}
		
		.radio-group {
			flex: 1;
			display: flex;
			justify-content: flex-end;
			gap: 20rpx;
			
			.radio-tag {
				width: 100rpx;
				height: 56rpx;
				border-radius: 28rpx;
				background: #f5f7fa;
				color: #666;
				font-size: 26rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s;
				
				&.active {
					background: #3ec6c6;
					color: #fff;
					box-shadow: 0 4rpx 10rpx rgba(62, 198, 198, 0.3);
				}
			}
		}
	}

	.popup-footer {
		padding: 24rpx 40rpx;
		/* padding-bottom is handled via inline style for safe area */
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
