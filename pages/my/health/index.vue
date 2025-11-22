<template>
	<view class="health-page">
		<!-- 档案列表 -->
		<scroll-view class="record-list" scroll-y :style="{ height: 'calc(100vh - ' + (180 + safeAreaBottom) + 'rpx)' }">
			<view v-if="recordList.length === 0" class="empty-state">
				<view class="empty-icon-box">
					<uni-icons type="heart-filled" size="60" color="#e0e0e0"></uni-icons>
				</view>
				<text class="empty-text">暂无健康档案</text>
				<text class="empty-sub">点击底部按钮建立健康档案</text>
			</view>
			
			<view v-else class="record-card" v-for="record in recordList" :key="record.recordId">
				<view class="card-header">
					<view class="header-left">
						<view class="avatar-icon">
							<text>{{ record.memberName ? record.memberName.charAt(0) : '健' }}</text>
						</view>
						<view class="info-box">
							<view class="name-row">
								<text class="name">{{ record.memberName }}</text>
								<text class="relation-tag" v-if="record.relationship">{{ record.relationship }}</text>
							</view>
							<text class="update-time">最近体检: {{ record.lastCheckupTime || '未记录' }}</text>
						</view>
					</view>
					<view class="header-right">
						<view class="action-icon" @click.stop="editRecord(record)">
							<uni-icons type="compose" size="20" color="#3ec6c6"></uni-icons>
						</view>
						<view class="action-icon delete" @click.stop="deleteRecord(record.recordId)">
							<uni-icons type="trash" size="20" color="#ff5555"></uni-icons>
						</view>
					</view>
				</view>

				<view class="divider"></view>

				<view class="card-body">
					<!-- 关键指标 Grid -->
					<view class="metrics-grid">
						<view class="metric-item">
							<text class="metric-label">血型</text>
							<text class="metric-value">{{ getBloodTypeText(record.bloodType) || '-' }}</text>
						</view>
						<view class="metric-item">
							<text class="metric-label">BMI</text>
							<text class="metric-value">{{ record.bmi || '-' }}</text>
						</view>
						<view class="metric-item">
							<text class="metric-label">身高</text>
							<text class="metric-value">{{ record.height }}<text class="unit">cm</text></text>
						</view>
						<view class="metric-item">
							<text class="metric-label">体重</text>
							<text class="metric-value">{{ record.weight }}<text class="unit">kg</text></text>
						</view>
					</view>

					<!-- 状态标签 -->
					<view class="status-row">
						<view class="status-tag" :class="'status-' + record.cognitiveStatus">
							<text>认知: {{ getCognitiveStatusText(record.cognitiveStatus) }}</text>
						</view>
						<view class="status-tag" :class="'status-' + record.selfCareStatus">
							<text>自理: {{ getSelfCareStatusText(record.selfCareStatus) }}</text>
						</view>
						<view class="status-tag" :class="'status-' + record.hearingStatus" v-if="record.hearingStatus">
							<text>听力: {{ getHearingStatusText(record.hearingStatus) }}</text>
						</view>
						<view class="status-tag" :class="'status-' + record.mobilityStatus" v-if="record.mobilityStatus">
							<text>行动: {{ getMobilityStatusText(record.mobilityStatus) }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 底部占位 -->
			<view style="height: 40rpx;"></view>
		</scroll-view>

		<!-- 底部按钮栏 -->
		<view class="bottom-bar" :style="{ paddingBottom: safeAreaBottom + 'rpx' }">
			<view class="add-btn" @click="addRecord" hover-class="btn-hover">
				<uni-icons type="plusempty" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
				<text>新增健康档案</text>
			</view>
		</view>

		<!-- 编辑弹窗 (底部弹出) -->
		<view v-if="showModal" class="popup-mask" @click="closeModal" :class="{ 'show': showModal }">
			<view class="popup-container" @click.stop :class="{ 'show': showModal }">
				<view class="popup-header">
					<text class="title">{{ isEdit ? '修改健康档案' : '新增健康档案' }}</text>
					<view class="close-btn" @click="closeModal">
						<uni-icons type="closeempty" size="24" color="#999"></uni-icons>
					</view>
				</view>

				<scroll-view class="form-content" scroll-y>
					<!-- 家庭人员 -->
					<view class="form-group">
						<view class="section-title">基本信息</view>
						<view class="form-item">
							<text class="label required">家庭人员</text>
							<picker
								mode="selector"
								:range="availableFamilyMembers"
								range-key="label"
								:value="selectedMemberIndex"
								@change="onMemberChange"
								:disabled="isEdit"
								class="picker-flex"
							>
								<view class="picker-view" :class="{ disabled: isEdit }">
									<text :class="formData.familyMemberId ? 'value' : 'placeholder'">
										{{ selectedMemberLabel || '请选择家庭成员' }}
									</text>
									<uni-icons v-if="!isEdit" type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
						
						<!-- 身高体重BMI -->
						<view class="form-row">
							<view class="form-item half">
								<text class="label required">身高(cm)</text>
								<input
									v-model="formData.height"
									class="input-right"
									type="digit"
									placeholder="0"
									placeholder-class="placeholder"
									@input="calculateBMI"
								/>
							</view>
							<view class="form-item half">
								<text class="label required">体重(kg)</text>
								<input
									v-model="formData.weight"
									class="input-right"
									type="digit"
									placeholder="0"
									placeholder-class="placeholder"
									@input="calculateBMI"
								/>
							</view>
						</view>
						
						<view class="form-row">
							<view class="form-item half">
								<text class="label">BMI</text>
								<input v-model="formData.bmi" class="input-right disabled" placeholder="-" disabled />
							</view>
							<view class="form-item half">
								<text class="label required">血型</text>
								<picker
									mode="selector"
									:range="bloodTypeOptions"
									range-key="label"
									:value="getBloodTypeIndex()"
									@change="onBloodTypeChange"
									class="picker-flex"
								>
									<view class="picker-view">
										<text :class="formData.bloodType ? 'value' : 'placeholder'">
											{{ getBloodTypeText(formData.bloodType) || '请选择' }}
										</text>
										<uni-icons type="right" size="14" color="#ccc"></uni-icons>
									</view>
								</picker>
							</view>
						</view>
					</view>

					<!-- 状态评估 -->
					<view class="form-group">
						<view class="section-title">状态评估</view>
						<view class="form-item">
							<text class="label required">认知状态</text>
							<picker
								mode="selector"
								:range="cognitiveStatusOptions"
								range-key="label"
								:value="getCognitiveStatusIndex()"
								@change="onCognitiveStatusChange"
								class="picker-flex"
							>
								<view class="picker-view">
									<text :class="formData.cognitiveStatus ? 'value' : 'placeholder'">
										{{ getCognitiveStatusText(formData.cognitiveStatus) || '请选择' }}
									</text>
									<uni-icons type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label required">自理状态</text>
							<picker
								mode="selector"
								:range="selfCareStatusOptions"
								range-key="label"
								:value="getSelfCareStatusIndex()"
								@change="onSelfCareStatusChange"
								class="picker-flex"
							>
								<view class="picker-view">
									<text :class="formData.selfCareStatus ? 'value' : 'placeholder'">
										{{ getSelfCareStatusText(formData.selfCareStatus) || '请选择' }}
									</text>
									<uni-icons type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">听力状态</text>
							<picker
								mode="selector"
								:range="hearingStatusOptions"
								range-key="label"
								:value="getHearingStatusIndex()"
								@change="onHearingStatusChange"
								class="picker-flex"
							>
								<view class="picker-view">
									<text :class="formData.hearingStatus ? 'value' : 'placeholder'">
										{{ getHearingStatusText(formData.hearingStatus) || '请选择' }}
									</text>
									<uni-icons type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
						<view class="form-item">
							<text class="label">行动状态</text>
							<picker
								mode="selector"
								:range="mobilityStatusOptions"
								range-key="label"
								:value="getMobilityStatusIndex()"
								@change="onMobilityStatusChange"
								class="picker-flex"
							>
								<view class="picker-view">
									<text :class="formData.mobilityStatus ? 'value' : 'placeholder'">
										{{ getMobilityStatusText(formData.mobilityStatus) || '请选择' }}
									</text>
									<uni-icons type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
					</view>

					<!-- 其他信息 -->
					<view class="form-group">
						<view class="section-title">其他信息</view>
						<view class="form-item">
							<text class="label">血糖值</text>
							<input
								v-model="formData.bloodSugar"
								class="input-right"
								type="digit"
								placeholder="请输入"
								placeholder-class="placeholder"
							/>
						</view>
						<view class="form-item">
							<text class="label">最近体检</text>
							<picker
								mode="date"
								:value="formData.lastCheckupTime"
								:end="today"
								@change="onLastCheckupTimeChange"
								class="picker-flex"
							>
								<view class="picker-view">
									<text :class="formData.lastCheckupTime ? 'value' : 'placeholder'">
										{{ formData.lastCheckupTime || '请选择日期' }}
									</text>
									<uni-icons type="calendar" size="16" color="#ccc"></uni-icons>
								</view>
							</picker>
						</view>
						<view class="form-item column">
							<text class="label">过敏药物</text>
							<textarea
								v-model="formData.allergicDrugs"
								placeholder="请输入过敏药物信息（选填）"
								placeholder-class="placeholder"
								maxlength="200"
								disable-default-padding
							/>
						</view>
						<view class="form-item column">
							<text class="label">病史</text>
							<textarea
								v-model="formData.medicalHistory"
								placeholder="请输入病史信息（选填）"
								placeholder-class="placeholder"
								maxlength="200"
								disable-default-padding
							/>
						</view>
						<view class="form-item column">
							<text class="label">备注</text>
							<textarea
								v-model="formData.remark"
								placeholder="请输入备注信息（选填）"
								placeholder-class="placeholder"
								maxlength="200"
								disable-default-padding
							/>
						</view>
					</view>
				</scroll-view>

				<view class="popup-footer" :style="{ paddingBottom: (24 + safeAreaBottom) + 'rpx' }">
					<view class="save-btn" @click="submitForm" hover-class="btn-hover">
						<text>{{ submitting ? '提交中...' : '保存' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { listFamilymemberNoPage } from '@/api/familymember'
import { 
	listResidenthealthrecord, 
	getResidenthealthrecordByFamilyMemberId,
	addResidenthealthrecord, 
	updateResidenthealthrecord, 
	delResidenthealthrecord,
	getExistingFamilyMemberIds
} from '@/api/residenthealthrecord'

export default {
	data() {
		return {
			recordList: [],
			familyMembers: [],
			availableFamilyMembers: [],
			existingMemberIds: [],
			safeAreaBottom: 0,
			
			showModal: false,
			isEdit: false,
			submitting: false,
			
			formData: {
				recordId: null,
				familyMemberId: null,
				height: '',
				weight: '',
				bmi: '',
				bloodType: '',
				bloodSugar: '',
				cognitiveStatus: '',
				selfCareStatus: '',
				hearingStatus: '',
				mobilityStatus: '',
				lastCheckupTime: '',
				nextCheckupTime: '',
				allergicDrugs: '',
				medicalHistory: '',
				remark: ''
			},
			
			selectedMemberIndex: -1,
			selectedMemberLabel: '',
			
			// 今天的日期（用于日期限制）
			today: '',
			
			// 血型选项
			bloodTypeOptions: [
				{ label: 'A型血', value: '0' },
				{ label: 'B型血', value: '1' },
				{ label: 'AB型血', value: '2' },
				{ label: 'O型血', value: '3' },
				{ label: '其它', value: '4' }
			],
			
			// 认知状态选项
			cognitiveStatusOptions: [
				{ label: '正常', value: '0' },
				{ label: '轻度障碍', value: '1' },
				{ label: '中度障碍', value: '2' },
				{ label: '重度障碍', value: '3' }
			],
			
			// 自理状态选项
			selfCareStatusOptions: [
				{ label: '正常', value: '0' },
				{ label: '半失能', value: '1' },
				{ label: '完全失能', value: '2' }
			],
			
			// 听力状态选项
			hearingStatusOptions: [
				{ label: '正常', value: '0' },
				{ label: '轻度障碍', value: '1' },
				{ label: '中度障碍', value: '2' },
				{ label: '重度障碍', value: '3' }
			],
			
			// 行动状态选项
			mobilityStatusOptions: [
				{ label: '正常', value: '0' },
				{ label: '轻度障碍', value: '1' },
				{ label: '中度障碍', value: '2' },
				{ label: '重度障碍', value: '3' }
			]
		}
	},
	
	onLoad() {
		this.getSystemInfo()
		
		// 初始化今天的日期
		const date = new Date()
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		this.today = `${year}-${month}-${day}`
		
		this.loadFamilyMembers()
		this.loadRecords()
	},
	
	onShow() {
		// 从家庭成员页面返回时刷新列表
		this.loadFamilyMembers()
		this.loadRecords()
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

		// 加载家庭成员列表
		async loadFamilyMembers() {
			try {
				const response = await listFamilymemberNoPage()
				
				if (response.code === 200 && response.data) {
					this.familyMembers = response.data
					this.updateAvailableFamilyMembers()
				}
			} catch (error) {
				console.error('加载家庭成员列表失败:', error)
			}
		},
		
		// 加载健康档案列表
		async loadRecords() {
			try {
				const response = await listResidenthealthrecord({})
				
				if (response.code === 200 && response.rows) {
					this.recordList = response.rows.map(record => {
						// 找到对应的家庭成员信息
						const member = this.familyMembers.find(m => m.memberId === record.familyMemberId)
						return {
							...record,
							memberName: member ? member.memberName : '未知',
							relationship: member ? member.relationship : ''
						}
					})
					
					// 更新已建档的成员ID列表
					this.existingMemberIds = this.recordList.map(r => r.familyMemberId)
					this.updateAvailableFamilyMembers()
				}
			} catch (error) {
				console.error('加载健康档案列表失败:', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			}
		},
		
		// 更新可选的家庭成员列表（排除已建档的）
		updateAvailableFamilyMembers() {
			if (this.isEdit) {
				// 编辑模式下只显示当前成员
				const currentMember = this.familyMembers.find(
					m => m.memberId === this.formData.familyMemberId
				)
				this.availableFamilyMembers = currentMember ? [{
					label: `${currentMember.memberName} (${currentMember.relationship})`,
					value: currentMember.memberId
				}] : []
			} else {
				// 新增模式下排除已建档的成员
				this.availableFamilyMembers = this.familyMembers
					.filter(member => !this.existingMemberIds.includes(member.memberId))
					.map(member => ({
						label: `${member.memberName} (${member.relationship})`,
						value: member.memberId
					}))
			}
		},
		
		// 新增档案
		addRecord() {
			if (this.familyMembers.length === 0) {
				uni.showModal({
					title: '提示',
					content: '请先添加家庭成员',
					confirmText: '去添加',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/my/family/index'
							})
						}
					}
				})
				return
			}
			
			// 检查是否还有未建档的成员
			const availableCount = this.familyMembers.length - this.existingMemberIds.length
			if (availableCount === 0) {
				uni.showToast({
					title: '所有家庭成员已建档',
					icon: 'none'
				})
				return
			}
			
			this.isEdit = false
			this.formData = {
				recordId: null,
				familyMemberId: null,
				height: '',
				weight: '',
				bmi: '',
				bloodType: '',
				bloodSugar: '',
				cognitiveStatus: '',
				selfCareStatus: '',
				hearingStatus: '',
				mobilityStatus: '',
				lastCheckupTime: '',
				nextCheckupTime: '',
				allergicDrugs: '',
				medicalHistory: '',
				remark: ''
			}
			this.selectedMemberIndex = -1
			this.selectedMemberLabel = ''
			this.updateAvailableFamilyMembers()
			this.showModal = true
		},
		
		// 编辑档案
		async editRecord(record) {
			this.isEdit = true
			this.formData = {
				recordId: record.recordId,
				familyMemberId: record.familyMemberId,
				height: record.height || '',
				weight: record.weight || '',
				bmi: record.bmi || '',
				bloodType: record.bloodType || '',
				bloodSugar: record.bloodSugar || '',
				cognitiveStatus: record.cognitiveStatus || '',
				selfCareStatus: record.selfCareStatus || '',
				hearingStatus: record.hearingStatus || '',
				mobilityStatus: record.mobilityStatus || '',
				lastCheckupTime: record.lastCheckupTime || '',
				nextCheckupTime: record.nextCheckupTime || '',
				allergicDrugs: record.allergicDrugs || '',
				medicalHistory: record.medicalHistory || '',
				remark: record.remark || ''
			}
			
			this.selectedMemberLabel = `${record.memberName} (${record.relationship})`
			this.selectedMemberIndex = 0
			this.updateAvailableFamilyMembers()
			this.showModal = true
		},
		
		// 删除档案
		deleteRecord(recordId) {
			uni.showModal({
				title: '提示',
				content: '确定要删除该健康档案吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const response = await delResidenthealthrecord(recordId)
							
							if (response.code === 200) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								this.loadRecords()
							} else {
								uni.showToast({
									title: response.msg || '删除失败',
									icon: 'none'
								})
							}
						} catch (error) {
							console.error('删除档案失败:', error)
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		
		// 关闭弹窗
		closeModal() {
			this.showModal = false
			this.formData = {
				recordId: null,
				familyMemberId: null,
				height: '',
				weight: '',
				bmi: '',
				bloodType: '',
				bloodSugar: '',
				cognitiveStatus: '',
				selfCareStatus: '',
				hearingStatus: '',
				mobilityStatus: '',
				lastCheckupTime: '',
				nextCheckupTime: '',
				allergicDrugs: '',
				medicalHistory: '',
				remark: ''
			}
			this.selectedMemberIndex = -1
			this.selectedMemberLabel = ''
		},
		
		// 选择家庭成员
		onMemberChange(e) {
			const index = e.detail.value
			this.selectedMemberIndex = index
			this.selectedMemberLabel = this.availableFamilyMembers[index].label
			this.formData.familyMemberId = this.availableFamilyMembers[index].value
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
		
		// 血型选择
		onBloodTypeChange(e) {
			const index = e.detail.value
			this.formData.bloodType = this.bloodTypeOptions[index].value
		},
		
		getBloodTypeIndex() {
			return this.bloodTypeOptions.findIndex(item => item.value === this.formData.bloodType)
		},
		
		getBloodTypeText(value) {
			const item = this.bloodTypeOptions.find(item => item.value === value)
			return item ? item.label : ''
		},
		
		// 认知状态选择
		onCognitiveStatusChange(e) {
			const index = e.detail.value
			this.formData.cognitiveStatus = this.cognitiveStatusOptions[index].value
		},
		
		getCognitiveStatusIndex() {
			return this.cognitiveStatusOptions.findIndex(item => item.value === this.formData.cognitiveStatus)
		},
		
		getCognitiveStatusText(value) {
			const item = this.cognitiveStatusOptions.find(item => item.value === value)
			return item ? item.label : ''
		},
		
		// 自理状态选择
		onSelfCareStatusChange(e) {
			const index = e.detail.value
			this.formData.selfCareStatus = this.selfCareStatusOptions[index].value
		},
		
		getSelfCareStatusIndex() {
			return this.selfCareStatusOptions.findIndex(item => item.value === this.formData.selfCareStatus)
		},
		
		getSelfCareStatusText(value) {
			const item = this.selfCareStatusOptions.find(item => item.value === value)
			return item ? item.label : ''
		},
		
		// 听力状态选择
		onHearingStatusChange(e) {
			const index = e.detail.value
			this.formData.hearingStatus = this.hearingStatusOptions[index].value
		},
		
		getHearingStatusIndex() {
			return this.hearingStatusOptions.findIndex(item => item.value === this.formData.hearingStatus)
		},
		
		getHearingStatusText(value) {
			const item = this.hearingStatusOptions.find(item => item.value === value)
			return item ? item.label : ''
		},
		
		// 行动状态选择
		onMobilityStatusChange(e) {
			const index = e.detail.value
			this.formData.mobilityStatus = this.mobilityStatusOptions[index].value
		},
		
		getMobilityStatusIndex() {
			return this.mobilityStatusOptions.findIndex(item => item.value === this.formData.mobilityStatus)
		},
		
		getMobilityStatusText(value) {
			const item = this.mobilityStatusOptions.find(item => item.value === value)
			return item ? item.label : ''
		},
		
		// 日期选择
		onLastCheckupTimeChange(e) {
			this.formData.lastCheckupTime = e.detail.value
		},
		
		onNextCheckupTimeChange(e) {
			this.formData.nextCheckupTime = e.detail.value
		},
		
		// 表单验证
		validateForm() {
			if (!this.formData.familyMemberId) {
				uni.showToast({
					title: '请选择家庭成员',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.height || this.formData.height <= 0) {
				uni.showToast({
					title: '请输入正确的身高',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.weight || this.formData.weight <= 0) {
				uni.showToast({
					title: '请输入正确的体重',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.bloodType) {
				uni.showToast({
					title: '请选择血型',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.cognitiveStatus) {
				uni.showToast({
					title: '请选择认知状态',
					icon: 'none'
				})
				return false
			}
			
			if (!this.formData.selfCareStatus) {
				uni.showToast({
					title: '请选择自理状态',
					icon: 'none'
				})
				return false
			}
			
			return true
		},
		
		// 提交表单
		async submitForm() {
			if (!this.validateForm()) {
				return
			}
			
			try {
				this.submitting = true
				
				// 获取用户ID
				const storageData = uni.getStorageSync('storage_data')
				const submitData = {
					...this.formData,
					userId: storageData.user_id
				}
				
				let response
				if (this.isEdit) {
					response = await updateResidenthealthrecord(submitData)
				} else {
					response = await addResidenthealthrecord(submitData)
				}
				
				if (response.code === 200) {
					uni.showToast({
						title: this.isEdit ? '修改成功' : '新增成功',
						icon: 'success'
					})
					this.closeModal()
					this.loadRecords()
				} else {
					uni.showToast({
						title: response.msg || (this.isEdit ? '修改失败' : '新增失败'),
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('提交失败:', error)
				uni.showToast({
					title: '提交失败',
					icon: 'none'
				})
			} finally {
				this.submitting = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.health-page {
	min-height: 100vh;
	background-color: #f5f7fa;
	box-sizing: border-box;
}

/* 档案列表 */
.record-list {
	padding: 24rpx;
	box-sizing: border-box;
}

.record-card {
	background-color: #fff;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	border: 2rpx solid transparent;
	transition: all 0.3s;
	
	.card-header {
		padding: 24rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		
		.header-left {
			display: flex;
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
				justify-content: center;
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
					
					.relation-tag {
						font-size: 22rpx;
						color: #3ec6c6;
						background: rgba(62, 198, 198, 0.1);
						padding: 2rpx 10rpx;
						border-radius: 6rpx;
					}
				}
				
				.update-time {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
		
		.header-right {
			display: flex;
			gap: 20rpx;
			
			.action-icon {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #f5f7fa;
				border-radius: 50%;
				transition: all 0.2s;
				
				&.delete {
					background: #fff1f0;
				}
				
				&:active {
					opacity: 0.8;
					transform: scale(0.95);
				}
			}
		}
	}
	
	.divider {
		height: 2rpx;
		background: #f5f7fa;
		margin: 0 30rpx;
	}
	
	.card-body {
		padding: 30rpx;
		
		.metrics-grid {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 20rpx;
			margin-bottom: 30rpx;
			
			.metric-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8rpx;
				
				.metric-label {
					font-size: 24rpx;
					color: #999;
				}
				
				.metric-value {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
					font-family: 'Roboto', sans-serif;
					
					.unit {
						font-size: 22rpx;
						font-weight: normal;
						color: #999;
						margin-left: 4rpx;
					}
				}
			}
		}
		
		.status-row {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;
			
			.status-tag {
				padding: 8rpx 20rpx;
				border-radius: 30rpx;
				font-size: 24rpx;
				font-weight: 500;
				
				&.status-0 { // 正常
					background: #f6ffed;
					color: #52c41a;
					border: 1rpx solid #b7eb8f;
				}
				
				&.status-1 { // 轻度
					background: #fffbe6;
					color: #faad14;
					border: 1rpx solid #ffe58f;
				}
				
				&.status-2, &.status-3 { // 中重度
					background: #fff1f0;
					color: #ff4d4f;
					border: 1rpx solid #ffa39e;
				}
			}
		}
	}
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
		
		uni-icons {
			margin-right: 8rpx;
		}
		
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
		justify-content: center;
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
			font-size: 30rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 24rpx;
			margin-top: 10rpx;
			padding-left: 16rpx;
			border-left: 6rpx solid #3ec6c6;
			line-height: 1;
		}
	}
	
	.form-row {
		display: flex;
		gap: 24rpx;
		margin-bottom: 20rpx;
		
		.form-item.half {
			flex: 1;
			margin-bottom: 0;
		}
	}

	.form-item {
		margin-bottom: 24rpx;
		
		&:last-child {
			margin-bottom: 0;
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
			height: 80rpx;
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
			
			&.disabled {
				background: #f5f5f5;
				color: #999;
			}
		}
		
		.placeholder {
			color: #ccc;
		}
		
		.picker-flex {
			width: 100%;
		}

		.picker-view {
			width: 100%;
			height: 80rpx;
			padding: 0 24rpx;
			border: 2rpx solid #e0e0e0;
			border-radius: 8rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			box-sizing: border-box;
			
			&.disabled {
				background: #f5f5f5;
			}
			
			.value {
				color: #333;
				font-size: 30rpx;
			}
			
			.placeholder {
				color: #ccc;
				font-size: 30rpx;
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
