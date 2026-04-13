<template>
	<view class="family-container">
		<!-- 顶部提示 -->
		<view class="tip-box" v-if="deviceId || memberList.length > 0">
			<uni-icons type="info" size="16" color="#3ec6c6"></uni-icons>
			<text class="tip-text" v-if="deviceId && bindMode === 'replace'">
				请选择要绑定到设备的家庭成员（最多{{ maxSelectableCount }}人）
			</text>
			<text class="tip-text" v-else-if="deviceId">
				请选择要绑定到设备的家庭成员
			</text>
			<text class="tip-text" v-else>
				添加家庭成员后，可为家人预约服务
			</text>
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
								<image v-if="member.photo" :src="getPhotoUrl(member.photo)" class="avatar-image" mode="aspectFill"></image>
								<text v-else class="avatar-text">{{ member.memberName ? member.memberName.charAt(0) : '家' }}</text>
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
						<view class="info-row" v-if="member.likes">
							<view class="info-item full">
								<text class="label">喜好</text>
								<view class="likes-display">
									<view 
										class="like-display-tag" 
										v-for="(like, index) in parseLikesToArray(member.likes)" 
										:key="index"
									>
										<text>{{ like }}</text>
									</view>
								</view>
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
				<text v-if="bindMode === 'replace'">已选 {{ selectedMembers.length }}/{{ maxSelectableCount }} 人</text>
				<text v-else>已选 {{ selectedMembers.length }} 人</text>
			</view>
			<view class="btn-group">
				<view class="action-btn cancel" @click="clearSelection" v-if="selectedMembers.length > 0">取消</view>
				<view class="action-btn confirm" 
					:class="{ disabled: selectedMembers.length === 0 }"
					@click="batchBindMembers">
					{{ bindMode === 'replace' ? '确认更换' : '确认绑定' }}
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
						<view class="form-item">
							<text class="label">照片</text>
							<view class="photo-upload-container">
								<view class="photo-preview" v-if="formData.photo" @click="previewPhoto">
									<image :src="getPhotoUrl(formData.photo)" class="photo-image" mode="aspectFill"></image>
									<view class="photo-remove" @click.stop="removePhoto">
										<uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
									</view>
								</view>
								<view class="photo-upload" v-else @click="uploadPhoto">
									<uni-icons type="camera" size="32" color="#999"></uni-icons>
									<text class="upload-text">点击上传照片</text>
								</view>
							</view>
						</view>
						<view class="form-item column">
							<text class="label">饮食忌口</text>
							<view class="likes-container">
								<!-- 字典预设选项：点击选中/取消 -->
								<view class="preset-tags" v-if="dietaryOptions.length > 0">
									<view
										class="preset-tag"
										v-for="(opt, idx) in dietaryOptions"
										:key="idx"
										:class="{ 'preset-tag-active': formData.likesArray.includes(opt) }"
										@click="togglePreset(opt)"
									>
										<uni-icons v-if="formData.likesArray.includes(opt)" type="checkmarkempty" size="12" color="#3ec6c6" style="margin-right:6rpx;"></uni-icons>
										<text>{{ opt }}</text>
									</view>
								</view>
								<!-- 自定义输入的标签（不在预设里的） -->
								<view class="likes-tags" v-if="customLikesArray.length > 0">
									<view 
										class="like-tag" 
										v-for="(like, index) in customLikesArray" 
										:key="index"
										@click="removeCustomLike(like)"
									>
										<text>{{ like }}</text>
										<uni-icons type="closeempty" size="12" color="#3ec6c6"></uni-icons>
									</view>
								</view>
								<view class="add-like-container">
									<input 
										type="text" 
										v-model="newLikeText" 
										placeholder="输入忌口后回车或点击添加" 
										placeholder-class="placeholder"
										@confirm="addLike"
										@input="onLikeInput"
										class="like-input"
									/>
									<view class="add-like-btn" @click="addLike" v-if="newLikeText.trim()">
										<uni-icons type="plus" size="16" color="#3ec6c6"></uni-icons>
									</view>
								</view>
							</view>
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
import { getDicts } from '@/api/system/dict/data'
import { getMemberIdsByDeviceId, bindFamilyMemberByDevice, delFamilyMemberDevice } from '@/api/familyMemberDevice'
import { listProfiles, updateProfiles, addProfiles } from '@/api/profiles'
import { resetDeviceNetwork } from '@/api/device'
import { getDeviceMaxBindCount } from '@/utils/parseDevNumber'
import config from '@/config.js'

export default {
	data() {
		return {
			memberList: [],
			showModal: false,
			isEdit: false,
			submitting: false,
			deviceId: '', // 设备ID，从路由参数获取
			deviceType: '1', // 设备类型，从路由参数获取
			productKey: '', // 设备productKey
			deviceKey: '', // 设备deviceKey
			bindMode: 'normal', // 绑定模式：normal(正常绑定) 或 replace(更换绑定)
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
				remark: '',
				likes: '', // 喜好列表
				likesArray: [], // 喜好标签数组
				photo: '', // 照片地址
				dietary_restrictions: '', // 饮食忌口(JSON数组)
				dietaryArray: [] // 饮食忌口标签数组
			},
			newLikeText: '', // 新增喜好的输入文本
			newDietaryText: '', // 新增饮食忌口的自定义输入
			dietaryOptions: [], // 字典加载的饮食忌口预设选项
			originalFormData: null, // 保存原始数据用于对比
			relationList: ['本人', '爷爷', '奶奶', '外公', '外婆', '父亲', '母亲', '叔叔', '阿姨', '舅舅', '舅妈', '姑姑', '姑父', '姨妈', '姨父', '配偶', '兄弟', '姐妹', '朋友','其他']
		}
	},
	computed: {
		// 设备最大绑定数
		deviceMaxBindCount() {
			if (!this.deviceId) return 0
			return getDeviceMaxBindCount(this.deviceType)
		},
		
		// 在更换模式下，最多可选择的人数
		maxSelectableCount() {
			if (this.bindMode !== 'replace') return 999 // 正常模式不限制
			return this.deviceMaxBindCount
		},
		
		// 是否已达到选择上限
		isSelectionLimitReached() {
			return this.selectedMembers.length >= this.maxSelectableCount
		},

		// 自定义输入的忌口（不在预设字典里的）
		customLikesArray() {
			return this.formData.likesArray.filter(item => !this.dietaryOptions.includes(item))
		}
	},
	onLoad(options) {
		this.getSystemInfo()
		this.loadDietaryOptions()
		// 获取设备ID参数
		if (options.deviceId) {
			this.deviceId = options.deviceId
			this.bindMode = options.mode || 'normal' // 绑定模式：normal(正常绑定) 或 replace(更换绑定)
			this.deviceType = options.deviceType || '1' // 设备类型，默认为呼吸睡眠设备
			this.productKey = options.productKey || '' // 设备productKey
			this.deviceKey = options.deviceKey || '' // 设备deviceKey
			this.loadBoundMembers()
		}
		this.loadMembers()
	},
	onShow() {
		this.loadMembers()
	},
	methods: {
		// 加载饮食忌口字典
		async loadDietaryOptions() {
			try {
				const res = await getDicts('dietary_restriction')
				if (res.code === 200) {
					this.dietaryOptions = (res.data || []).map(item => item.dictLabel)
				}
			} catch (e) {
				console.error('加载饮食忌口字典失败:', e)
			}
		},

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
			this.newLikeText = ''
			this.formData = {
				memberId: null,
				memberName: '',
				relationship: '',
				phone: '',
				idCard: '',
				height: '',
				weight: '',
				bmi: '',
				remark: '',
				likes: '',
				likesArray: [],
				photo: ''
			}
			this.showModal = true
		},

		// 编辑成员
		editMember(member) {
			this.isEdit = true
			const likesArray = this.parseLikesToArray(member.likes || '')
			this.formData = {
				memberId: member.memberId,
				memberName: member.memberName,
				relationship: member.relationship,
				phone: member.phone,
				idCard: member.idCard || '',
				height: member.height || '',
				weight: member.weight || '',
				bmi: member.bmi || '',
				remark: member.remark || '',
				likes: member.likes || '',
				likesArray: likesArray,
				photo: member.photo || ''
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
					userId: storageData.user_id,
					likes: this.formatLikesForSubmit(this.formData.likesArray) // 转换喜好格式
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
			this.newLikeText = ''
			this.formData = {
				memberId: null,
				memberName: '',
				relationship: '',
				phone: '',
				idCard: '',
				height: '',
				weight: '',
				bmi: '',
				remark: '',
				likes: '',
				likesArray: [],
				photo: ''
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

		// 格式化喜好显示（去除JSON格式的方括号和引号）
		formatLikes(likes) {
			if (!likes) return ''
			
			try {
				// 如果是JSON数组格式，解析后用逗号连接
				if (likes.startsWith('[') && likes.endsWith(']')) {
					const likesArray = JSON.parse(likes)
					return Array.isArray(likesArray) ? likesArray.join('、') : likes
				}
				// 如果不是JSON格式，直接返回
				return likes
			} catch (error) {
				// 解析失败，直接返回原始字符串
				return likes
			}
		},

		// 将用户输入的喜好文本转换为JSON数组格式（用于提交到后端）
		formatLikesForSubmit(likesArray) {
			if (!likesArray || likesArray.length === 0) return ''
			return JSON.stringify(likesArray)
		},

		// 解析喜好数据为数组格式
		parseLikesToArray(likes) {
			if (!likes) return []
			
			try {
				// 如果是JSON数组格式，解析后返回
				if (likes.startsWith('[') && likes.endsWith(']')) {
					const likesArray = JSON.parse(likes)
					return Array.isArray(likesArray) ? likesArray : []
				}
				// 如果不是JSON格式，按分隔符拆分
				return likes.split(/[、,，]/).map(item => item.trim()).filter(item => item !== '')
			} catch (error) {
				// 解析失败，按分隔符拆分
				return likes.split(/[、,，]/).map(item => item.trim()).filter(item => item !== '')
			}
		},

		// 删除自定义忌口标签
		removeCustomLike(like) {
			const index = this.formData.likesArray.indexOf(like)
			if (index >= 0) this.formData.likesArray.splice(index, 1)
		},

		// 切换预设标签
		togglePreset(opt) {
			const index = this.formData.likesArray.indexOf(opt)
			if (index >= 0) {
				this.formData.likesArray.splice(index, 1)
			} else {
				if (this.formData.likesArray.length >= 10) {
					uni.showToast({ title: '最多只能添加10个', icon: 'none' })
					return
				}
				this.formData.likesArray.push(opt)
			}
		},

		// 添加喜好标签
		addLike() {
			const likeText = this.newLikeText.trim()
			if (!likeText) return
			
			// 检查是否已存在
			if (this.formData.likesArray.includes(likeText)) {
				uni.showToast({
					title: '该喜好已存在',
					icon: 'none'
				})
				return
			}
			
			// 限制最多10个标签
			if (this.formData.likesArray.length >= 10) {
				uni.showToast({
					title: '最多只能添加10个喜好',
					icon: 'none'
				})
				return
			}
			
			this.formData.likesArray.push(likeText)
			this.newLikeText = ''
		},

		// 移除喜好标签
		removeLike(index) {
			this.formData.likesArray.splice(index, 1)
		},

		// 输入框输入事件
		onLikeInput(e) {
			this.newLikeText = e.detail.value
		},

		// 处理照片URL
		getPhotoUrl(photoPath) {
			if (!photoPath) return ''
			
			// 如果是本地临时路径（上传时的临时文件），直接返回
			if (photoPath.startsWith('wxfile://') || photoPath.startsWith('file://') || photoPath.indexOf('tmp') > -1) {
				return photoPath
			}
			
			// 获取 token
			const token = uni.getStorageSync('App-Token')
			
			let fullUrl = ''
			
			// 如果是完整的URL
			if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
				fullUrl = photoPath
			} 
			// 如果是相对路径，拼接基础URL
			else if (photoPath.startsWith('/')) {
				fullUrl = config.baseUrl + photoPath
			}
			else {
				return photoPath
			}
			
			// 添加 token 参数
			const separator = fullUrl.includes('?') ? '&' : '?'
			return `${fullUrl}${separator}App-Token=${encodeURIComponent(token)}`
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
				// 检查是否达到选择上限（仅在更换模式下）
				if (this.bindMode === 'replace' && this.isSelectionLimitReached) {
					uni.showToast({
						title: `最多只能选择${this.maxSelectableCount}人`,
						icon: 'none'
					})
					return
				}
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
					title: this.bindMode === 'replace' ? '更换中...' : '绑定中...'
				})

				let bindData
				if (this.bindMode === 'replace') {
					// 更换模式：只提交选中的成员ID，替换原有绑定
					bindData = {
						deviceId: this.deviceId,
						memberIds: this.selectedMembers.map(m => m.memberId)
					}
				} else {
					// 正常模式：合并已绑定的成员ID和当前选中的成员ID（去重）
					const boundIds = this.boundMembers.map(m => m.memberId)
					const selectedIds = this.selectedMembers.map(m => m.memberId)
					const allIds = [...new Set([...boundIds, ...selectedIds])]
					
					bindData = {
						deviceId: this.deviceId,
						memberIds: allIds
					}
				}

				const response = await bindFamilyMemberByDevice(bindData)
				if (response.code === 200) {
					// 如果是呼吸睡眠-L2设备（deviceType='4'），需要同步更新设备 profiles
					console.log('检查是否需要同步设备 profiles:', {
						deviceType: this.deviceType,
						productKey: this.productKey,
						deviceKey: this.deviceKey,
						shouldSync: this.deviceType === '4' && this.productKey && this.deviceKey
					})
					
					if (this.deviceType === '4' && this.productKey && this.deviceKey) {
						console.log('开始同步设备 profiles...')
						await this.syncDeviceProfiles()
					}
					
					if (this.bindMode === 'replace') {
						// 更换模式：更新本地绑定列表为选中的成员
						this.boundMembers = [...this.selectedMembers]
						
						uni.showToast({
							title: `成功更换绑定 ${this.selectedMembers.length} 位成员`,
							icon: 'success'
						})
					} else {
						// 正常模式：更新本地已绑定列表（去重）
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
					}
					
					// 清空选择
					this.clearSelection()
					
					// 延迟返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 2000)
				} else {
					uni.showToast({
						title: response.msg || (this.bindMode === 'replace' ? '更换失败' : '绑定失败'),
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('批量绑定失败:', error)
				uni.showToast({
					title: this.bindMode === 'replace' ? '更换失败' : '绑定失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		
		// 同步设备 profiles（仅用于呼吸睡眠-L2设备）
		async syncDeviceProfiles() {
			console.log('syncDeviceProfiles 被调用')
			try {
				// 获取当前绑定的第一个成员（呼吸睡眠-L2设备只能绑定一个）
				const member = this.selectedMembers[0]
				console.log('选中的成员:', member)
				if (!member) {
					console.log('没有选中的成员，退出')
					return
				}
				
				// 查询该设备是否已有 profile
				console.log('查询设备 profiles...', {
					deviceId: this.deviceId,
					productKey: this.productKey,
					deviceKey: this.deviceKey
				})
				const profilesRes = await listProfiles({
					deviceId: this.deviceId,
					productKey: this.productKey,
					deviceKey: this.deviceKey
				})
				console.log('查询 profiles 结果:', profilesRes)
				
				// 准备 profile 数据（参数与 content 页面完全一致）
				// 注意：photo 字段不传递，照片通过专门的上传接口处理
				const profileData = {
					deviceId: this.deviceId,
					productKey: this.productKey,
					deviceKey: this.deviceKey,
					displayName: member.memberName,
					age: member.age || '',
					birthdate: member.birthDate || '',
					// likes 必须是有效的 JSON 格式，空值传 null 或不传
					likes: member.likes || null
				}
				console.log('准备提交的 profile 数据:', profileData)
				
				// 判断是新增还是更新
				let res
				if (profilesRes.code === 200 && profilesRes.rows && profilesRes.rows.length > 0) {
					// 更新现有 profile
					profileData.profilesId = profilesRes.rows[0].profilesId
					console.log('更新现有 profile, profilesId:', profileData.profilesId)
					res = await updateProfiles(profileData)
				} else {
					// 新增 profile
					console.log('新增 profile')
					res = await addProfiles(profileData)
				}
				console.log('profile 操作结果:', res)
				
				// 如果家人有照片，单独上传照片
				if (res && res.code === 200 && member.photo) {
					console.log('开始上传照片:', member.photo)
					await this.uploadProfilePhoto(member.photo)
				}
				
				if (res && res.code === 200) {
					// 调用 invoke/service 接口通知设备更新（参数与 content 页面完全一致）
					console.log('通知设备更新...')
					await resetDeviceNetwork({
						ack: 1,
						address: null,
						deviceKey: this.deviceKey,
						function: 'needUpdate',
						productKey: this.productKey,
						propertyValue: { needUpdate: 1 },
						type: null
					})
					
					console.log('设备 profiles 同步成功')
				}
			} catch (error) {
				console.error('同步设备 profiles 失败:', error)
				// 不阻断主流程，只记录错误
			}
		},
		
		// 上传设备 profile 照片（参数与 content 页面完全一致）
		async uploadProfilePhoto(photoPath) {
			return new Promise((resolve) => {
				// 如果照片路径是服务器路径，直接返回
				if (!photoPath || photoPath.startsWith('/profile/') || photoPath.startsWith('http')) {
					console.log('照片已是服务器路径，直接使用:', photoPath)
					resolve(photoPath)
					return
				}
				
				// 如果是本地临时路径，需要上传
				console.log('照片是本地路径，需要上传:', photoPath)
				const token = uni.getStorageSync('App-Token')
				
				uni.uploadFile({
					url: config.baseUrl + '/devices/profiles/photo',
					filePath: photoPath,
					name: 'photo',
					header: {
						'Authorization': 'Bearer ' + token
					},
					formData: {
						deviceId: this.deviceId,
						productKey: this.productKey,
						device: this.deviceKey
					},
					success: (uploadFileRes) => {
						try {
							const data = JSON.parse(uploadFileRes.data)
							console.log('照片上传响应:', data)
							if (data.code === 200) {
								const photoUrl = data.url || data.fileName || data.data
								console.log('照片上传成功，URL:', photoUrl)
								resolve(photoUrl)
							} else {
								console.error('上传设备照片失败:', data.msg)
								resolve('')
							}
						} catch (e) {
							console.error('解析上传响应失败:', e)
							resolve('')
						}
					},
					fail: (error) => {
						console.error('上传设备照片失败:', error)
						resolve('')
					}
				})
			})
		},

		// 上传照片
		uploadPhoto() {
			uni.chooseImage({
				count: 1,
				sizeType: ['original'], // 使用原图以保证裁剪质量
				sourceType: ['camera', 'album'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0]
					
					// 调用图片裁剪
					uni.navigateTo({
						url: `/pages/common/imageCropper?imagePath=${encodeURIComponent(tempFilePath)}&width=154&height=240`,
						events: {
							// 监听裁剪完成事件
							acceptDataFromCropperPage: (data) => {
								if (data.croppedPath) {
									// 上传到服务器
									this.uploadToServer(data.croppedPath)
								}
							}
						}
					})
				},
				fail: (error) => {
					console.error('选择图片失败:', error)
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					})
				}
			})
		},
		
		// 上传图片到服务器
		uploadToServer(filePath) {
			uni.showLoading({ title: '上传中...' })
			
			// 获取 token
			const token = uni.getStorageSync('App-Token')
			
			uni.uploadFile({
				url: config.baseUrl + '/common/upload',
				filePath: filePath,
				name: 'file',
				header: {
					'Authorization': 'Bearer ' + token
				},
				success: (uploadRes) => {
					uni.hideLoading()
					
					try {
						const data = JSON.parse(uploadRes.data)
						if (data.code === 200) {
							// 上传成功，保存服务器返回的图片路径
							this.formData.photo = data.fileName || data.url || data.data
							uni.showToast({
								title: '上传成功',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: data.msg || '上传失败',
								icon: 'none'
							})
						}
					} catch (error) {
						console.error('解析上传结果失败:', error)
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
				},
				fail: (error) => {
					uni.hideLoading()
					console.error('上传失败:', error)
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					})
				}
			})
		},

		// 预览照片
		previewPhoto() {
			if (this.formData.photo) {
				uni.previewImage({
					urls: [this.getPhotoUrl(this.formData.photo)],
					current: this.getPhotoUrl(this.formData.photo)
				})
			}
		},

		// 移除照片
		removePhoto() {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这张照片吗？',
				success: (res) => {
					if (res.confirm) {
						this.formData.photo = ''
					}
				}
			})
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
				overflow: hidden;
				
				.avatar-text {
					font-size: 40rpx;
					color: #fff;
					font-weight: 600;
				}
				
				.avatar-image {
					width: 100%;
					height: 100%;
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
				
				&.full {
					align-items: flex-start;
					
					.likes-display {
						display: flex;
						flex-wrap: wrap;
						gap: 12rpx;
						flex: 1;
						
						.like-display-tag {
							display: inline-flex;
							align-items: center;
							padding: 8rpx 16rpx;
							background: #f0fcfc;
							border: 1rpx solid #3ec6c6;
							border-radius: 20rpx;
							font-size: 24rpx;
							color: #3ec6c6;
							
							text {
								line-height: 1;
							}
						}
					}
				}
				
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
					
					&.likes {
						line-height: 1.5;
						color: #3ec6c6;
						font-weight: 500;
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
		
		// 照片上传相关样式
		.photo-upload-container {
			flex: 1;
			display: flex;
			justify-content: flex-end;
		}
		
		.photo-upload {
			width: 160rpx;
			height: 160rpx;
			border: 2rpx dashed #ddd;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			background: #fafafa;
			transition: all 0.2s;
			
			&:active {
				border-color: #3ec6c6;
				background: #f0fafa;
			}
			
			.upload-text {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.photo-preview {
			width: 160rpx;
			height: 160rpx;
			border-radius: 12rpx;
			overflow: hidden;
			position: relative;
			
			.photo-image {
				width: 100%;
				height: 100%;
			}
			
			.photo-remove {
				position: absolute;
				top: 8rpx;
				right: 8rpx;
				width: 32rpx;
				height: 32rpx;
				background: rgba(0, 0, 0, 0.6);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
		
		// 喜好标签相关样式
		.likes-container {
			width: 100%;
			
			.preset-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 16rpx;
				margin-bottom: 20rpx;
				
				.preset-tag {
					padding: 10rpx 20rpx;
					background: #f5f7fa;
					border: 2rpx solid #e0e0e0;
					border-radius: 30rpx;
					font-size: 26rpx;
					color: #666;
					transition: all 0.2s;
					
					&.preset-tag-active {
						background: #f0fcfc;
						border-color: #3ec6c6;
						color: #3ec6c6;
					}
				}
			}
			
			.likes-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 16rpx;
				margin-bottom: 20rpx;
				
				.like-tag {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 12rpx 20rpx;
					background: #f0fcfc;
					border: 2rpx solid #3ec6c6;
					border-radius: 30rpx;
					font-size: 26rpx;
					color: #3ec6c6;
					
					text {
						line-height: 1;
					}
					
					&:active {
						opacity: 0.8;
					}
				}
			}
			
			.add-like-container {
				display: flex;
				align-items: center;
				background: #f9f9f9;
				border-radius: 12rpx;
				padding: 20rpx;
				gap: 16rpx;
				
				.like-input {
					flex: 1;
					font-size: 28rpx;
					color: #333;
					background: transparent;
					border: none;
					outline: none;
				}
				
				.add-like-btn {
					width: 48rpx;
					height: 48rpx;
					background: #f0fcfc;
					border: 2rpx solid #3ec6c6;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					
					&:active {
						opacity: 0.8;
						transform: scale(0.95);
					}
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
