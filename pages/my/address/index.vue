<template>
	<view class="address-container">
		<!-- 地址列表 -->
		<scroll-view 
			class="address-list" 
			scroll-y 
			:style="{ height: scrollViewHeight }"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<!-- 加载中状态 -->
			<view v-if="loading && addressList.length === 0" class="loading-state">
				<view class="loading-icon"></view>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="addressList.length === 0" class="empty-address">
				<image src="/static/images/empty-address.png" mode="aspectFit" class="empty-img" v-if="false"></image>
				<view class="empty-icon-box">
					<uni-icons type="location-filled" size="60" color="#e0e0e0"></uni-icons>
				</view>
				<text class="empty-text">暂无服务地址</text>
				<text class="empty-sub">点击底部按钮添加新地址</text>
			</view>
			
			<view v-else class="address-item" v-for="(address, index) in addressList" :key="address.addressId" :class="{ 'selected': isFromBooking && selectedAddressId === address.addressId }">
				<view class="address-content" @click="selectAddressByIndex(index)">
					<view class="header-row">
						<view class="info-left">
							<text class="name">{{ address.contactName }}</text>
							<text class="phone">{{ address.contactPhone }}</text>
						</view>
						<view class="tags-row">
							<text class="tag default" v-if="address.isDefault">默认</text>
							<text class="tag set-default" v-if="!address.isDefault" @click.stop="setDefaultAddress(index)">设为默认</text>
							<text class="tag selected" v-if="isFromBooking && selectedAddressId === address.addressId">已选</text>
						</view>
					</view>
					
					<view class="address-row">
						<view class="icon-box">
							<uni-icons type="location-filled" size="18" color="#3ec6c6"></uni-icons>
						</view>
						<view class="address-text-box">
							<text class="area">{{ getAddressArea(address) }}</text>
							<text class="detail">{{ address.detailAddress || '' }}</text>
						</view>
					</view>
				</view>
				
				<!-- 分割线 -->
				<view class="divider"></view>
				
				<view class="address-actions">
					<view class="action-left">
						<view class="action-btn delete" @click.stop="deleteAddress(index)">
							<uni-icons type="trash" size="16" color="#ff5555"></uni-icons>
							<text>删除</text>
						</view>
					</view>
					<view class="action-right">
						<view class="action-btn copy" @click.stop="copyAddress(index)">
							<uni-icons type="navigate" size="16" color="#666"></uni-icons>
							<text>复制</text>
						</view>
						<view class="action-btn edit" @click.stop="editAddress(index)">
							<uni-icons type="compose" size="16" color="#fff"></uni-icons>
							<text>编辑</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 底部占位，防止被按钮遮挡 -->
			<view style="height: 180rpx;"></view>
		</scroll-view>

		<!-- 底部添加按钮 -->
		<view class="add-address-bar" :style="{ paddingBottom: (safeAreaBottom + 24) + 'rpx' }">
			<view class="add-btn" @click="showAddressPopup()" hover-class="add-btn-hover">
				<uni-icons type="plusempty" size="20" color="#fff" style="margin-right: 10rpx;"></uni-icons>
				<text>新增服务地址</text>
			</view>
		</view>
		
		<!-- 地址编辑弹窗 -->
		<view v-if="showPopup" class="popup-mask" @click="closePopup" :class="{ 'show': showPopup }">
			<view class="popup-container" @click.stop :class="{ 'show': showPopup }">
				<view class="popup-header">
					<text class="title">{{ isEdit ? '编辑服务地址' : '新增服务地址' }}</text>
					<view class="close-btn" @click="closePopup">
						<uni-icons type="closeempty" size="24" color="#999"></uni-icons>
					</view>
				</view>

				<scroll-view class="form-content" scroll-y>
					<view class="form-group">
						<view class="form-item">
							<text class="label required">联系人</text>
							<input type="text" v-model="addressForm.contactName" placeholder="请输入联系人姓名" placeholder-class="input-placeholder"/>
						</view>
						<view class="form-item">
							<text class="label required">手机号码</text>
							<input type="number" v-model="addressForm.contactPhone" @input="handlePhoneInput" placeholder="请输入手机号码" maxlength="11" placeholder-class="input-placeholder"/>
						</view>
						<view class="form-item">
							<text class="label required">所在地区</text>
							<!-- #ifdef APP-PLUS -->
							<view class="picker-view" @click="showRegionPicker">
								<text v-if="!addressForm.province" class="placeholder">请选择所在地区</text>
								<text v-else class="value">{{ getFormAddressArea() }}</text>
								<uni-icons type="right" size="14" color="#ccc"></uni-icons>
							</view>
							<!-- #endif -->
							<!-- #ifndef APP-PLUS -->
							<picker mode="region" @change="onRegionChange" class="region-picker">
								<view class="picker-view">
									<text v-if="!addressForm.province" class="placeholder">请选择所在地区</text>
									<text v-else class="value">{{ getFormAddressArea() }}</text>
									<uni-icons type="right" size="14" color="#ccc"></uni-icons>
								</view>
							</picker>
							<!-- #endif -->
						</view>
						<view class="form-item column">
							<text class="label required">详细地址</text>
							<textarea v-model="addressForm.detailAddress" placeholder="请输入详细地址，如街道、楼牌号等" placeholder-class="input-placeholder" disable-default-padding/>
						</view>
						<view class="form-item column">
							<text class="label">备注信息</text>
							<textarea v-model="addressForm.remark" placeholder="请输入备注信息（选填）" placeholder-class="input-placeholder" disable-default-padding/>
						</view>
					</view>

					<view class="form-group mt-20">
						<view class="form-item switch-item">
							<view class="switch-label">
								<text class="main-text">设为默认地址</text>
								<text class="sub-text">下单时将优先使用该地址</text>
							</view>
							<switch :checked="addressForm.isDefault === '1'" @change="onDefaultChange" color="#3ec6c6" style="transform:scale(0.8)"/>
						</view>
					</view>
				</scroll-view>

				<view class="popup-footer" :style="{ paddingBottom: (safeAreaBottom + 24) + 'rpx' }">
					<view class="save-btn" @click="saveAddress" hover-class="save-btn-hover">
						<text>保存地址</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { listServicesaddressNoPage, addServicesaddress, updateServicesaddress, delServicesaddress } from '@/api/servicesaddress'

	export default {
		data() {
			return {
				addressList: [],
				isFromOrder: false, // 是否从订单页面跳转而来
				isFromBooking: false, // 是否从预约页面跳转而来
				isEdit: false,
				showPopup: false, // 控制弹窗显示
				loading: false, // 加载状态
				isRefreshing: false, // 下拉刷新状态
				systemInfo: {}, // 系统信息
				safeAreaBottom: 0, // 底部安全区域高度
				scrollViewHeight: 'calc(100vh - 180rpx)', // 滚动区域高度
				addressForm: {
					addressId: null,
					contactName: '',
					contactPhone: '',
					province: '',
					city: '',
					district: '',
					detailAddress: '',
					isDefault: '0',  // 后端使用字符串 '0' 或 '1'
					remark: ''  // 备注
				},
				// 保存原始的表单数据用于对比
				originalAddressForm: {
					contactName: '',
					contactPhone: '',
					province: '',
					city: '',
					district: '',
					detailAddress: '',
					isDefault: '0',
					remark: ''
				},
				selectedAddressId: null // 当前选中的地址ID
			}
		},
		onLoad(options) {
			if (options.from === 'order') {
				this.isFromOrder = true
			}
			
			if (options.from === 'booking') {
				this.isFromBooking = true
				
				// 获取当前预约页面已选中的地址ID（如果有）
				const currentAddressId = uni.getStorageSync('currentBookingAddressId')
				if (currentAddressId) {
					this.selectedAddressId = currentAddressId
				}
				
				// 如果有action=add参数，自动打开新增弹窗
				if (options.action === 'add') {
					setTimeout(() => {
						this.showAddressPopup()
					}, 300)
				}
			}

			this.loadAddressList()
			this.getSystemInfo()
		},
		methods: {
			// 处理手机号输入，自动去除空格
			handlePhoneInput(e) {
				// 去除所有空格
				const cleanValue = e.detail.value.replace(/\s/g, '');
				this.addressForm.contactPhone = cleanValue;
			},
			// 获取系统信息
			getSystemInfo() {
				const systemInfo = uni.getSystemInfoSync()
				this.systemInfo = systemInfo

				// 计算底部安全区域高度
				// safeAreaInsets.bottom 是底部安全区域的高度（px）
				if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom) {
					// 将px转换为rpx (1px = 2rpx on most devices)
					this.safeAreaBottom = systemInfo.safeAreaInsets.bottom * 2
				} else {
					// 如果没有安全区域信息，设置默认值
					this.safeAreaBottom = 0
				}
				
				// 计算滚动区域高度
				// 底部按钮栏高度 = 按钮高度(88rpx) + 上下padding(24rpx * 2) + 安全区域高度
				const bottomBarHeight = 88 + 48 + this.safeAreaBottom
				this.scrollViewHeight = `calc(100vh - ${bottomBarHeight}rpx)`
			},

			// 安全地转换为字符串
			safeToString(value) {
				if (value === null || value === undefined) {
					return ''
				}
				if (typeof value === 'string') {
					return value
				}
				if (typeof value === 'number' || typeof value === 'boolean') {
					return String(value)
				}
				return ''
			},

			// 获取地址区域显示文本
			getAddressArea(address) {
				if (!address) return ''
				const province = this.safeToString(address.province)
				const city = this.safeToString(address.city)
				const district = this.safeToString(address.district)
				return province + city + district
			},

			// 获取表单地址区域显示文本
			getFormAddressArea() {
				const province = this.safeToString(this.addressForm.province)
				const city = this.safeToString(this.addressForm.city)
				const district = this.safeToString(this.addressForm.district)
				return province + city + district
			},

			// 加载地址列表
			async loadAddressList() {
				try {
					this.loading = true
					const response = await listServicesaddressNoPage()
					
					if (response.code === 200 && response.data) {
				// 确保每个地址的数据格式正确
				let addressList = response.data.map(address => ({
					...address,
					province: this.safeToString(address.province),
					city: this.safeToString(address.city),
					district: this.safeToString(address.district),
					detailAddress: this.safeToString(address.detailAddress),
					contactName: this.safeToString(address.contactName),
					contactPhone: this.safeToString(address.contactPhone),
					isDefault: address.isDefault === '1',
					remark: this.safeToString(address.remark),
					createTime: address.createTime || new Date().getTime()
				}))
				
				// 按创建时间倒序排列（最新的在前）
				addressList.sort((a, b) => {
					const timeA = new Date(a.createTime).getTime()
					const timeB = new Date(b.createTime).getTime()
					return timeB - timeA
				})
				
				this.addressList = addressList
					} else {
						this.addressList = []
					}
				} catch (error) {
						uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
					this.isRefreshing = false
				}
			},
			
			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				await this.loadAddressList()
			},
			
			// 通过索引选择地址
			selectAddressByIndex(index) {
				if (index < 0 || index >= this.addressList.length) {
					uni.showToast({
						title: '地址索引异常',
						icon: 'none'
					})
					return
				}
				
				const address = this.addressList[index]
				
				this.selectAddress(address)
			},
			
			// 选择地址
			selectAddress(address) {
				// 防护措施：如果address为undefined，尝试从事件中获取
				if (!address) {
					uni.showToast({
						title: '地址数据异常，请重试',
						icon: 'none'
					})
					return
				}
				
				if (this.isFromOrder) {
					uni.$emit('addressSelected', address)
					uni.navigateBack()
					return
				}
				
				if (this.isFromBooking) {
					// 先更新选中状态，让用户看到"已选"图标
					this.selectedAddressId = address.addressId
					
					// 将选中的地址存储到缓存
					uni.setStorageSync('selectedAddressForBooking', address)
					
					// 显示选中提示
					uni.showToast({
						title: '地址已选中',
						icon: 'success',
						duration: 600
					})
					
					// 延迟返回，让用户看到选中效果
					setTimeout(() => {
						uni.navigateBack()
					}, 800) // 延迟800毫秒，让用户看到已选状态
				}
			},
			
			// 显示地址弹窗
			showAddressPopup(address = null) {
				// 检查是否是事件对象（事件对象会有 type 属性）
				if (address && typeof address === 'object' && address.type) {
					address = null
				}

				if (address && address.addressId) { // 使用 addressId
					this.isEdit = true
					// 深拷贝地址数据并转换格式
					this.addressForm = {
						addressId: address.addressId,
						contactName: this.safeToString(address.contactName),
						contactPhone: this.safeToString(address.contactPhone),
						province: this.safeToString(address.province),
						city: this.safeToString(address.city),
						district: this.safeToString(address.district),
						detailAddress: this.safeToString(address.detailAddress),
						// isDefault 可能是布尔值或字符串，统一转为字符串
						isDefault: (address.isDefault === true || address.isDefault === '1') ? '1' : '0',
						remark: this.safeToString(address.remark)
					}
					// 保存原始数据用于对比
					this.originalAddressForm = {
						contactName: this.safeToString(address.contactName),
						contactPhone: this.safeToString(address.contactPhone),
						province: this.safeToString(address.province),
						city: this.safeToString(address.city),
						district: this.safeToString(address.district),
						detailAddress: this.safeToString(address.detailAddress),
						isDefault: (address.isDefault === true || address.isDefault === '1') ? '1' : '0',
						remark: this.safeToString(address.remark)
					}
				} else {
					this.isEdit = false
					this.addressForm = {
						addressId: null,
						contactName: '',
						contactPhone: '',
						province: '',
						city: '',
						district: '',
						detailAddress: '',
						isDefault: '0',
						remark: ''
					}
				}
				this.showPopup = true
			},

			// 关闭弹窗
			closePopup() {
				this.showPopup = false
				// 重置编辑状态，确保下次打开是新增模式
				this.isEdit = false
			},
			
			// 编辑地址
			editAddress(index) {
				const address = this.addressList[index]
				
				if (!address || !address.addressId) {
					return
				}
				this.showAddressPopup(address)
			},
			
			// 删除地址
			deleteAddress(index) {
				const address = this.addressList[index]
				
				if (!address || !address.addressId) {
					uni.showToast({
						title: '地址信息异常',
						icon: 'none'
					})
					return
				}
				uni.showModal({
					title: '删除地址',
					content: '确定要删除该服务地址吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const response = await delServicesaddress(address.addressId)
								
								if (response.code === 200) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									})
									// 重新加载列表
									this.loadAddressList()
								} else {
									uni.showToast({
										title: response.msg || '删除失败',
										icon: 'none'
									})
								}
							} catch (error) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			// 设为默认地址
			async setDefaultAddress(index) {
				const address = this.addressList[index]
				
				if (!address || !address.addressId) {
					uni.showToast({
						title: '地址信息异常',
						icon: 'none'
					})
					return
				}
				
				try {
					const response = await updateServicesaddress({
						addressId: address.addressId,
						isDefault: '1'
					})
					
					if (response.code === 200) {
						uni.showToast({
							title: '设置成功',
							icon: 'success'
						})
						// 重新加载列表
						this.loadAddressList()
					} else {
						uni.showToast({
							title: response.msg || '设置失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '设置失败',
						icon: 'none'
					})
				}
			},

			// 复制地址文字信息
			copyAddress(index) {
				const address = this.addressList[index]
				
				if (!address) {
					return
				}
				
				// 组装地址文字信息
				const addressText = `联系人：${this.safeToString(address.contactName)}
手机号：${this.safeToString(address.contactPhone)}
地址：${this.getAddressArea(address)}${this.safeToString(address.detailAddress)}`

				// 复制到剪贴板
				uni.setClipboardData({
					data: addressText,
					success: () => {
						uni.showToast({
							title: '地址已复制',
							icon: 'success'
						})
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						})
					}
				})
			},
			
			// 地区选择改变
			onRegionChange(e) {
				if (e.detail && e.detail.value) {
					if (Array.isArray(e.detail.value)) {
						const [province, city, district] = e.detail.value
						this.addressForm.province = String(province || '')
						this.addressForm.city = String(city || '')
						this.addressForm.district = String(district || '')
					}
				}
			},

			// App端显示地区选择器
			showRegionPicker() {
				// #ifdef APP-PLUS
				// 直接调用手动输入地区
				this.manualInputRegion()
				// #endif
			},



			// 手动输入地区
			manualInputRegion() {
				const that = this
				uni.showModal({
					title: '输入地区信息',
					editable: true,
					placeholderText: '请输入省市区，如：广东省广州市天河区',
					success: function(res) {
						if (res.confirm && res.content) {
							that.parseRegionText(res.content.trim())
						}
					}
				})
			},

			// 解析地区文本
			parseRegionText(regionText) {
				if (!regionText || regionText.length === 0) {
					uni.showToast({
						title: '请输入地区信息',
						icon: 'none'
					})
					return
				}

				// 重置地区信息
				this.addressForm.province = ''
				this.addressForm.city = ''
				this.addressForm.district = ''

				// 智能解析地区信息
				let remaining = regionText

				// 解析省份
				const provincePatterns = [
					/^(.+?省)/,
					/^(.+?自治区)/,
					/^(.+?市)(?=.*[市区县])/,  // 直辖市
					/^(北京|天津|上海|重庆)(?!.*省)/
				]

				for (let pattern of provincePatterns) {
					const match = remaining.match(pattern)
					if (match) {
						this.addressForm.province = match[1]
						if (!this.addressForm.province.endsWith('省') &&
							!this.addressForm.province.endsWith('自治区') &&
							!this.addressForm.province.endsWith('市')) {
							// 对于直辖市，添加"市"后缀
							if (['北京', '天津', '上海', '重庆'].includes(this.addressForm.province)) {
								this.addressForm.province += '市'
							}
						}
						remaining = remaining.replace(match[0], '')
						break
					}
				}

				// 解析城市
				if (remaining) {
					const cityPatterns = [
						/^(.+?市)/,
						/^(.+?州)/,
						/^(.+?盟)/,
						/^(.+?地区)/
					]

					for (let pattern of cityPatterns) {
						const match = remaining.match(pattern)
						if (match) {
							this.addressForm.city = match[1]
							if (!this.addressForm.city.endsWith('市') &&
								!this.addressForm.city.endsWith('州') &&
								!this.addressForm.city.endsWith('盟') &&
								!this.addressForm.city.endsWith('地区')) {
								this.addressForm.city += '市'
							}
							remaining = remaining.replace(match[0], '')
							break
						}
					}
				}

				// 解析区县
				if (remaining) {
					const districtPatterns = [
						/^(.+?区)/,
						/^(.+?县)/,
						/^(.+?旗)/,
						/^(.+)/  // 剩余部分作为区县
					]

					for (let pattern of districtPatterns) {
						const match = remaining.match(pattern)
						if (match) {
							this.addressForm.district = match[1]
							if (!this.addressForm.district.endsWith('区') &&
								!this.addressForm.district.endsWith('县') &&
								!this.addressForm.district.endsWith('旗')) {
								// 如果没有明确的区县后缀，根据长度判断是否添加
								if (this.addressForm.district.length <= 3) {
									this.addressForm.district += '区'
								}
							}
							break
						}
					}
				}

				// 如果没有解析出省份，将整个输入作为省份
				if (!this.addressForm.province && regionText) {
					this.addressForm.province = regionText
				}

				// 显示解析结果
				const result = this.getFormAddressArea()
				if (result) {
					uni.showToast({
						title: '地区设置完成',
						icon: 'success'
					})
				} else {
					uni.showToast({
						title: '地区格式不正确，请重新输入',
						icon: 'none'
					})
				}
			},
			
			// 切换默认地址
			onDefaultChange(e) {
				this.addressForm.isDefault = e.detail.value ? '1' : '0'
			},
			
			// 保存地址
			async saveAddress() {
				// 表单验证
				if (!this.addressForm.contactName) {
					return uni.showToast({
						title: '请输入联系人姓名',
						icon: 'none'
					})
				}
				if (!this.addressForm.contactPhone) {
					return uni.showToast({
						title: '请输入手机号码',
						icon: 'none'
					})
				}
				if (!/^1\d{10}$/.test(this.addressForm.contactPhone)) {
					return uni.showToast({
						title: '手机号码格式不正确',
						icon: 'none'
					})
				}
				if (!this.addressForm.province) {
					return uni.showToast({
						title: '请选择所在地区',
						icon: 'none'
					})
				}
				if (!this.addressForm.detailAddress) {
					return uni.showToast({
						title: '请输入详细地址',
						icon: 'none'
					})
				}
				
				// 编辑模式下对比数据是否发生变化
				if (this.isEdit) {
					const isDataChanged = 
						this.addressForm.contactName !== this.originalAddressForm.contactName ||
						this.addressForm.contactPhone !== this.originalAddressForm.contactPhone ||
						this.addressForm.province !== this.originalAddressForm.province ||
						this.addressForm.city !== this.originalAddressForm.city ||
						this.addressForm.district !== this.originalAddressForm.district ||
						this.addressForm.detailAddress !== this.originalAddressForm.detailAddress ||
						this.addressForm.isDefault !== this.originalAddressForm.isDefault ||
						this.addressForm.remark !== this.originalAddressForm.remark
					
					if (!isDataChanged) {
						return uni.showToast({
							title: '数据未发生变化,无需提交',
							icon: 'none',
							duration: 2000
						})
					}
				}

				try {
					let response
					
					if (this.isEdit) {
						// 编辑模式
						response = await updateServicesaddress(this.addressForm)
					} else {
						// 新增模式
						response = await addServicesaddress(this.addressForm)
					}

					if (response.code === 200) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
						
						this.closePopup()
						// 重新加载列表
						this.loadAddressList()
					} else {
						uni.showToast({
							title: response.msg || '保存失败',
							icon: 'none'
						})
					}
				} catch (error) {
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss">
	.address-container {
		min-height: 100vh;
		background-color: #f5f7fa;
		box-sizing: border-box;
	}

	.address-list {
		padding: 24rpx;
		box-sizing: border-box;
	}

	/* 加载状态 */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		
		.loading-icon {
			width: 60rpx;
			height: 60rpx;
			border: 4rpx solid #f0f0f0;
			border-top-color: #3ec6c6;
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
			margin-bottom: 20rpx;
		}
		
		.loading-text {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* 空状态 */
	.empty-address {
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

	/* 地址卡片 */
	.address-item {
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
			
			.tags-row .selected {
				background: #3ec6c6;
				color: #fff;
			}
		}

		.address-content {
			padding: 30rpx;
		}

		.header-row {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 24rpx;

			.info-left {
				display: flex;
				align-items: baseline;
				
				.name {
					font-size: 34rpx;
					font-weight: 600;
					color: #333;
					margin-right: 20rpx;
				}
				
				.phone {
					font-size: 28rpx;
					color: #999;
					font-family: 'Roboto', sans-serif;
				}
			}

			.tags-row {
				display: flex;
				gap: 12rpx;
				
				.tag {
					font-size: 20rpx;
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
					font-weight: 500;
					
					&.default {
						background: rgba(62, 198, 198, 0.1);
						color: #3ec6c6;
					}
					
					&.set-default {
						background: rgba(255, 153, 0, 0.1);
						color: #ff9900;
						border: 1rpx solid rgba(255, 153, 0, 0.3);
						
						&:active {
							background: rgba(255, 153, 0, 0.2);
						}
					}
					
					&.selected {
						background: #3ec6c6;
						color: #fff;
					}
				}
			}
		}

		.address-row {
			display: flex;
			align-items: flex-start;
			
			.icon-box {
				margin-right: 12rpx;
				margin-top: 4rpx;
			}
			
			.address-text-box {
				flex: 1;
				
				.area {
					font-size: 28rpx;
					color: #666;
					margin-right: 10rpx;
				}
				
				.detail {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
					line-height: 1.5;
				}
			}
		}

		.divider {
			height: 2rpx;
			background: #f5f7fa;
			margin: 0 30rpx;
			/* 虚线效果 */
			background-image: linear-gradient(to right, #f5f7fa 50%, transparent 50%);
			background-size: 16rpx 2rpx;
			background-repeat: repeat-x;
		}

		.address-actions {
			padding: 20rpx 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.action-btn {
				display: flex;
				align-items: center;
				padding: 12rpx 24rpx;
				border-radius: 30rpx;
				font-size: 26rpx;
				transition: all 0.2s;
				
				uni-icons {
					margin-right: 6rpx;
				}
				
				&:active {
					opacity: 0.8;
				}
			}

			.delete {
				background: rgba(255, 85, 85, 0.05);
				color: #ff5555;
			}

			.action-right {
				display: flex;
				gap: 20rpx;
				
				.copy {
					background: #f5f7fa;
					color: #666;
				}
				
				.edit {
					background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
					color: #fff;
					box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
				}
			}
		}
	}

	/* 底部添加按钮栏 */
	.add-address-bar {
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
		
		.add-btn-hover {
			transform: scale(0.98);
			box-shadow: 0 4rpx 10rpx rgba(62, 198, 198, 0.3);
		}
	}

	/* 弹窗样式优化 */
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
		max-height: 85vh; /* 限制最大高度 */
		
		&.show {
			transform: translateY(0);
		}

		.popup-header {
			padding: 32rpx 40rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			border-bottom: 2rpx solid #f5f7fa;
			flex-shrink: 0; /* 防止头部被压缩 */
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
			flex: 1; /* 占据剩余空间 */
			overflow-y: auto;
			padding: 0 40rpx;
		}

		.form-group {
			&.mt-20 {
				margin-top: 15rpx;
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
					height: 120rpx;
					background: #f9f9f9;
					padding: 20rpx;
					border-radius: 12rpx;
					box-sizing: border-box;
					font-size: 28rpx;
				}
			}
			
			&.switch-item {
				justify-content: space-between;
				border-bottom: none;
				background: #f9f9f9;
				padding: 24rpx 30rpx;
				border-radius: 16rpx;
				
				.switch-label {
					display: flex;
					flex-direction: column;
					
					.main-text {
						font-size: 30rpx;
						color: #333;
						font-weight: 500;
					}
					
					.sub-text {
						font-size: 24rpx;
						color: #999;
						margin-top: 6rpx;
					}
				}
			}

			.label {
				width: 160rpx;
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
			}
			
			.region-picker {
				flex: 1;
			}

			.picker-view {
				flex: 1;
				display: flex;
				justify-content: flex-end;
				align-items: center;
				
				.placeholder {
					color: #ccc;
					font-size: 30rpx;
					margin-right: 12rpx;
				}
				
				.value {
					color: #333;
					font-size: 30rpx;
					margin-right: 12rpx;
					
					/* 限制文字长度，超出省略 */
					max-width: 400rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
		}

		.popup-footer {
			padding: 24rpx 40rpx; /* 基础内边距，底部会被行内样式覆盖 */
			background: #fff;
			box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
			flex-shrink: 0; /* 防止底部被压缩 */
			
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
			
			.save-btn-hover {
				opacity: 0.9;
				transform: scale(0.98);
			}
		}
	}
</style>
