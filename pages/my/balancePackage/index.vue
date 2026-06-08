<template>
	<view class="package-container">

		<!-- 标签页 -->
		<view class="tabs">
			<view 
				v-for="(tab, index) in tabs" 
				:key="index"
				class="tab-item"
				:class="{ active: activeTab === index }"
				@click="switchTab(index)"
			>
				{{ tab.name }}
			</view>
		</view>

		<!-- 套餐列表 -->
		<view class="package-list" v-if="activeTab !== 3">
			<view 
				v-for="(pkg, index) in packageList" 
				:key="index"
				class="package-card"
			>
				<view class="package-main">
					<!-- 左侧信息 -->
					<view class="package-info">
						<view class="info-header">
							<text class="pkg-name">{{ pkg.packageName }}</text>
							<view class="pkg-tag" v-if="pkg.remark">{{ pkg.remark }}</view>
						</view>
						
						<view class="info-features">
							<view class="feature-item" v-if="pkg.phoneCount > 0">
								<text class="feature-label">电话:</text>
								<text class="feature-val">{{ pkg.phoneCount }}次</text>
							</view>
							
							<view class="feature-item" v-if="pkg.smsCount > 0">
								<text class="feature-label">短信:</text>
								<text class="feature-val">{{ pkg.smsCount }}条</text>
							</view>
							
							<view class="feature-item">
								<text class="feature-label">有效期:</text>
								<text class="feature-val">{{ pkg.validityDays ? pkg.validityDays + '天' : '长期有效' }}</text>
							</view>
						</view>
					</view>
					
					<!-- 右侧价格与操作 -->
					<view class="package-action">
						<view class="price-group">
							<view class="price-wrapper">
								<text class="price-symbol">¥</text>
								<text class="price-amount">{{ ((pkg.salePrice || pkg.originalPrice) / 100).toFixed(2) }}</text>
							</view>
							<view class="original-price" v-if="pkg.salePrice && pkg.salePrice < pkg.originalPrice">
								¥{{ (pkg.originalPrice / 100).toFixed(2) }}
							</view>
						</view>
						<view class="buy-btn" @click="buyPackage(pkg)">
							立即购买
						</view>
					</view>
				</view>
				
				<!-- 底部描述 -->
				<view class="package-footer" v-if="pkg.description">
					<text class="desc-text">{{ pkg.description }}</text>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="packageList.length === 0" class="empty-state">
				<text>暂无套餐</text>
			</view>
		</view>

		<!-- 购买记录 -->
		<view class="record-container" v-if="activeTab === 3">
			<!-- 套餐总余量 -->
			<view class="balance-summary">
				<view class="summary-title">套餐总余量</view>
				<view class="summary-content">
					<view class="balance-item">
						<view class="balance-value">{{ userBalance.phoneBalance || 0 }}分钟</view>
						<view class="balance-label">电话通知服务</view>
					</view>
					<view class="balance-item">
						<view class="balance-value">{{ userBalance.smsBalance || 0 }}条</view>
						<view class="balance-label">短信通知服务</view>
					</view>
				</view>
			</view>

			<!-- 购买记录标题 -->
			<view class="record-header">
				<view class="record-title">购买记录</view>
				<view class="history-btn" @click="goToOrderHistory">
					<text class="history-text">历史订单</text>
					<uni-icons type="right" size="14" color="#5DD5C0"></uni-icons>
				</view>
			</view>

			<!-- 购买记录列表 -->
			<view class="record-list">
				<view 
					v-for="(record, index) in purchaseRecords" 
					:key="index"
					class="record-card"
					@click="showOrderDetail(record)"
				>
					<view class="card-header">
						<view class="header-left">
							<text class="record-icon">📦</text>
							<text class="record-name">{{ record.packageName }}</text>
						</view>
						<view class="record-status">已生效</view>
					</view>
					
					<view class="card-body">
						<view class="stat-grid">
							<view class="stat-item">
								<view class="stat-value">{{ record.phoneCount || 0 }}<text class="stat-unit">分钟</text></view>
								<view class="stat-label">语音通话</view>
							</view>
							<view class="stat-divider"></view>
							<view class="stat-item">
								<view class="stat-value">{{ record.smsCount || 0 }}<text class="stat-unit">条</text></view>
								<view class="stat-label">短信通知</view>
							</view>
							<view class="stat-divider"></view>
							<view class="stat-item">
								<view class="stat-value" :class="{ 'long-term': !record.validityDays }">
									<template v-if="record.validityDays">
										{{ record.validityDays }}<text class="stat-unit">天</text>
									</template>
									<template v-else>
										<text class="long-term-text">长期有效</text>
									</template>
								</view>
								<view class="stat-label">有效期</view>
							</view>
						</view>
					</view>
					
					<view class="card-footer">
						<text class="time-label">购买时间：</text>
						<text class="time-value">{{ record.updateTime }}</text>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="purchaseRecords.length === 0" class="empty-state">
					<text>暂无购买记录</text>
				</view>
			</view>
		</view>

		<!-- 自定义购买确认弹窗 -->
		<view class="custom-modal" v-if="showConfirmModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<view class="modal-icon">🛒</view>
					<view class="modal-title">套餐确认</view>
				</view>
				<view class="modal-body">
					<view class="package-summary">
						<text class="package-name-text">{{ selectedPackage.packageName }}</text>
					</view>
					<view class="package-detail-list">
						<view class="detail-row" v-if="selectedPackage.phoneCount > 0">
							<text class="detail-label">电话</text>
							<text class="detail-value">{{ selectedPackage.phoneCount }}分钟</text>
						</view>
						<view class="detail-row" v-if="selectedPackage.smsCount > 0">
							<text class="detail-label">短信</text>
							<text class="detail-value">{{ selectedPackage.smsCount }}条</text>
						</view>
						<view class="detail-row price-row">
							<text class="detail-label">支付金额</text>
							<text class="detail-value price-value">¥{{ ((selectedPackage.salePrice || selectedPackage.originalPrice) / 100).toFixed(2) }}</text>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<view class="modal-btn cancel-btn" @click="closeModal">取消</view>
					<view class="modal-btn confirm-btn" @click="confirmPurchase">确认购买</view>
				</view>
			</view>
		</view>

		<!-- 订单详情弹窗 -->
		<view class="order-detail-modal" v-if="showOrderDetailModal" @click="closeOrderDetail">
			<view class="order-modal-content" @click.stop>
				<view class="order-modal-header">
					<view class="order-modal-title">订单详情</view>
					<view class="order-close-btn" @click="closeOrderDetail">✕</view>
				</view>
				
				<view class="order-modal-body">
					<!-- 套餐信息 -->
					<view class="order-section">
						<view class="section-title">套餐信息</view>
						<view class="order-info-item">
							<text class="info-label">套餐名称：</text>
							<text class="info-value">{{ selectedOrder.packageName }}</text>
						</view>
						<view class="order-info-item" v-if="selectedOrder.phoneCount > 0">
							<text class="info-label">电话时长：</text>
							<text class="info-value">{{ selectedOrder.phoneCount }}分钟</text>
						</view>
						<view class="order-info-item" v-if="selectedOrder.smsCount > 0">
							<text class="info-label">短信数量：</text>
							<text class="info-value">{{ selectedOrder.smsCount }}条</text>
						</view>
						<view class="order-info-item" v-if="selectedOrder.validityDays">
							<text class="info-label">有效期：</text>
							<text class="info-value">{{ selectedOrder.validityDays }}天</text>
						</view>
					</view>

					<!-- 订单信息 -->
					<view class="order-section">
						<view class="section-title">订单信息</view>
						<view class="order-info-item">
							<text class="info-label">订单编号：</text>
							<text class="info-value order-no">{{ selectedOrder.orderNo }}</text>
						</view>
						<view class="order-info-item">
							<text class="info-label">订单金额：</text>
							<text class="info-value price-text">¥{{ ((selectedOrder.orderAmount || 0) / 100).toFixed(2) }}</text>
						</view>
						<view class="order-info-item">
							<text class="info-label">实付金额：</text>
							<text class="info-value price-text">¥{{ ((selectedOrder.payAmount || 0) / 100).toFixed(2) }}</text>
						</view>
						<view class="order-info-item">
							<text class="info-label">支付方式：</text>
							<text class="info-value">{{ getPayTypeText(selectedOrder.payType) }}</text>
						</view>
						<view class="order-info-item">
							<text class="info-label">订单状态：</text>
							<text class="info-value status-text">{{ getOrderStatusText(selectedOrder.orderStatus) }}</text>
						</view>
						<view class="order-info-item">
							<text class="info-label">支付状态：</text>
							<text class="info-value status-text">{{ getPayStatusText(selectedOrder.payStatus) }}</text>
						</view>
					</view>

					<!-- 时间信息 -->
					<view class="order-section">
						<view class="section-title">时间信息</view>
						<view class="order-info-item">
							<text class="info-label">创建时间：</text>
							<text class="info-value">{{ selectedOrder.createTime }}</text>
						</view>
						<view class="order-info-item" v-if="selectedOrder.payTime">
							<text class="info-label">支付时间：</text>
							<text class="info-value">{{ selectedOrder.payTime }}</text>
						</view>
					</view>

					<!-- 第三方信息 -->
					<view class="order-section" v-if="selectedOrder.tradeNo">
						<view class="section-title">第三方信息</view>
						<view class="order-info-item">
							<text class="info-label">交易流水号：</text>
							<text class="info-value order-no">{{ selectedOrder.tradeNo }}</text>
						</view>
						<view class="order-info-item" v-if="selectedOrder.thirdOrderNo">
							<text class="info-label">第三方订单号：</text>
							<text class="info-value order-no">{{ selectedOrder.thirdOrderNo }}</text>
						</view>
					</view>

					<!-- 备注信息 -->
					<view class="order-section" v-if="selectedOrder.remark">
						<view class="section-title">备注信息</view>
						<view class="order-info-item">
							<text class="info-value">{{ selectedOrder.remark }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getOnlinePackages } from '@/api/balancePackage'
import { getCurrentUserBalance } from '@/api/userBalance'
import { listBalanceOrder, createOrder} from '@/api/balanceOrder'
import { getWechatOpenid } from '@/api/login'
import { getWechatPayParams, queryPayment } from '@/api/payment'

export default {
	data() {
		return {
			tabs: [
				{ name: '综合套餐', type: 'comprehensive' },
				{ name: '电话套餐', type: 'call' },
				{ name: '短信套餐', type: 'sms' },
				{ name: '购买记录', type: 'record' }
			],
			activeTab: 0,
			packageList: [],
			allPackages: [], // 存储所有套餐数据
			userBalance: {
				phoneBalance: 0,
				smsBalance: 0
			},
			purchaseRecords: [], // 购买记录
			showConfirmModal: false, // 显示确认弹窗
			selectedPackage: {}, // 选中的套餐
			showOrderDetailModal: false, // 显示订单详情弹窗
			selectedOrder: {} // 选中的订单
		}
	},
	onLoad() {
		this.loadPackages()
	},
	methods: {
		// 加载套餐列表
		async loadPackages() {
			try {
				uni.showLoading({ title: '加载中...' })
				const response = await getOnlinePackages()
				this.allPackages = response.data || []
				this.filterPackages()
			} catch (error) {
				console.error('加载套餐失败', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},

		// 切换标签页
		switchTab(index) {
			this.activeTab = index
			if (index === 3) {
				// 加载购买记录
				this.loadPurchaseRecords()
				this.loadUserBalance()
			} else {
				this.filterPackages()
			}
		},

		// 加载用户余量
		async loadUserBalance() {
			try {
				const response = await getCurrentUserBalance()
				if (response.data) {
					this.userBalance = {
						phoneBalance: response.data.phoneBalance || 0,
						smsBalance: response.data.smsBalance || 0
					}
				}
			} catch (error) {
				console.error('加载余量失败', error)
			}
		},

		// 加载购买记录
		async loadPurchaseRecords() {
			try {
				uni.showLoading({ title: '加载中...' })
				// 设置分页参数，获取更多记录
				const response = await listBalanceOrder({
					pageNum: 1,
					pageSize: 100
				})
				// 只显示支付状态为1（已支付）的记录
				this.purchaseRecords = (response.rows || []).filter(record => 
					record.payStatus === 1 || record.payStatus === '1'
				)
			} catch (error) {
				console.error('加载购买记录失败', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},

		// 根据标签筛选套餐
		filterPackages() {
			const tabType = this.tabs[this.activeTab].type
			if (tabType === 'comprehensive') {
				// 综合套餐：显示COMBO类型或同时有电话和短信的套餐
				this.packageList = this.allPackages.filter(pkg => 
					pkg.packageType === 'COMBO' || (pkg.phoneCount > 0 && pkg.smsCount > 0)
				)
				// 如果没有综合套餐，则显示所有
				if (this.packageList.length === 0) {
					this.packageList = this.allPackages
				}
			} else if (tabType === 'call') {
				// 电话套餐：只显示有电话但没有短信的纯电话套餐
				this.packageList = this.allPackages.filter(pkg => 
					pkg.packageType === 'PHONE' || (pkg.phoneCount > 0 && !pkg.smsCount)
				)
			} else if (tabType === 'sms') {
				// 短信套餐：只显示有短信但没有电话的纯短信套餐
				this.packageList = this.allPackages.filter(pkg => 
					pkg.packageType === 'SMS' || (pkg.smsCount > 0 && !pkg.phoneCount)
				)
			}
		},

		// 购买套餐
		buyPackage(pkg) {
			this.selectedPackage = pkg
			this.showConfirmModal = true
		},

		// 关闭弹窗
		closeModal() {
			this.showConfirmModal = false
		},

		// 确认购买
		async confirmPurchase() {
			try {
				this.showConfirmModal = false
				uni.showLoading({ title: '创建订单中...' })
				
				// 调用创建订单接口
				const orderData = {
					packageId: this.selectedPackage.packageId
				}
				const response = await createOrder(orderData)
				
				uni.hideLoading()
				
				// 创建订单成功后直接调用微信支付
				if (response.code === 200) {
					const orderNo = response.data.orderNo || response.data.orderId
					this.callWechatPay(orderNo)
				} else {
					uni.showToast({
						title: response.msg || '创建订单失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('创建订单失败', error)
				uni.showToast({
					title: '创建订单失败，请重试',
					icon: 'none'
				})
			}
		},

		// 显示订单详情
		showOrderDetail(order) {
			this.selectedOrder = order
			this.showOrderDetailModal = true
		},

		// 关闭订单详情弹窗
		closeOrderDetail() {
			this.showOrderDetailModal = false
			this.selectedOrder = {}
		},

		// 获取支付方式文本
		getPayTypeText(payType) {
			const payTypeMap = {
				'WECHAT': '微信支付',
				'ALIPAY': '支付宝',
				'BALANCE': '余额支付',
				'BANK': '银行卡支付'
			}
			return payTypeMap[payType] || payType || '未知'
		},

		// 获取订单状态文本
		getOrderStatusText(status) {
			const statusMap = {
				'0': '待支付',
				'1': '已完成',
				'2': '已取消',
				'3': '已退款'
			}
			return statusMap[status] || '未知状态'
		},

		// 获取支付状态文本
		getPayStatusText(status) {
			const statusMap = {
				'0': '未支付',
				'1': '已支付',
				'2': '已退款'
			}
			return statusMap[status] || '未知状态'
		},

		// 调用微信支付
		async callWechatPay(orderNo) {
			try {
				uni.showLoading({ title: '正在调起支付...' })
				
				// 先获取 openid
				const openid = await this.getOpenid()
				if (!openid) {
					uni.hideLoading()
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					})
					return
				}
				
				// 调用后端接口获取微信支付参数
				const payParams = await getWechatPayParams(orderNo, openid)
				
				console.log('支付参数完整响应:', payParams)
				console.log('支付数据 payData:', payParams.data.payParams)
				
				if (payParams.code === 200) {
					const payData = payParams.data.payParams
					
					console.log('准备调起支付，参数:', {
						timeStamp: payData.timeStamp,
						nonceStr: payData.nonceStr,
						package: payData.package,
						signType: payData.signType,
						paySign: payData.paySign
					})
					
					// 调用微信支付
					uni.requestPayment({
						provider: 'wxpay',
						timeStamp: payData.timeStamp,
						nonceStr: payData.nonceStr,
						package: payData.package,
						signType: payData.signType,
						paySign: payData.paySign,
						success: async (res) => {
							uni.hideLoading()
							
							// 查询支付状态
							try {
								const paymentStatus = await queryPayment(orderNo)
								console.log('支付状态查询结果:', paymentStatus)
							} catch (error) {
								console.error('查询支付状态失败:', error)
							}
							
							uni.showToast({
								title: '支付成功',
								icon: 'success'
							})
							// 支付成功后自动切换到"购买记录"标签页
							// switchTab 方法会自动刷新购买记录和用户余额
							this.switchTab(3)
						},
						fail: (err) => {
							uni.hideLoading()
							console.error('微信支付失败', err)
							if (err.errMsg.includes('cancel')) {
								uni.showToast({
									title: '支付已取消',
									icon: 'none'
								})
							} else {
								uni.showToast({
									title: '支付失败，请重试',
									icon: 'none'
								})
							}
						}
					})
				} else {
					uni.hideLoading()
					uni.showToast({
						title: payParams.msg || '获取支付参数失败',
						icon: 'none'
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('调起微信支付失败', error)
				uni.showToast({
					title: '支付调起失败，请重试',
					icon: 'none'
				})
			}
		},

		// 获取 openid
		async getOpenid() {
			try {
				// 调用 uni.login 获取 code
				const loginRes = await uni.login({
					provider: 'weixin'
				})
				
				if (loginRes[1].code) {
					const code = loginRes[1].code
					console.log('获取到微信登录 code:', code)
					
					// 调用后端接口，用 code 换取 openid
					const res = await getWechatOpenid(code)
					if (res.code === 200 && res.data.openid) {
						console.log('获取到 openid:', res.data.openid)
						return res.data.openid
					} else {
						console.error('获取 openid 失败:', res.msg)
						return null
					}
				} else {
					console.error('微信登录失败')
					return null
				}
			} catch (error) {
				console.error('获取 openid 异常:', error)
				return null
			}
		},
		

		// 跳转到历史订单页面
		goToOrderHistory() {
			uni.navigateTo({
				url: '/pages/my/balancePackage/order'
			})
		}
	}
}
</script>

<style scoped>
.package-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}



/* 标签页 */
.tabs {
	display: flex;
	background-color: #fff;
	padding: 12px 0;
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.tab-item {
	flex: 1;
	text-align: center;
	font-size: 15px;
	color: #909399;
	padding: 4px 0;
	position: relative;
	transition: all 0.3s;
}

.tab-item.active {
	color: #303133;
	font-weight: 600;
	font-size: 16px;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: -6px;
	left: 50%;
	transform: translateX(-50%);
	width: 20px;
	height: 4px;
	background: linear-gradient(90deg, #5DD5C0, #4EC9B0);
	border-radius: 2px;
}

/* 套餐列表 */
.package-list {
	padding: 15px;
}

.package-card {
	position: relative;
	background-color: #fff;
	border-radius: 16px;
	margin-bottom: 15px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
	overflow: hidden;
	border: 1px solid rgba(0,0,0,0.02);
}

/* 主要内容区 */
.package-main {
	display: flex;
	justify-content: space-between;
	padding: 20px;
}

/* 左侧信息 */
.package-info {
	flex: 1;
	margin-right: 15px;
}

.info-header {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 16px;
}

.pkg-name {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
	margin-right: 10px;
}

.pkg-tag {
	font-size: 11px;
	color: #FF6B00;
	background: linear-gradient(90deg, #FFF0E0 0%, #FFE4CC 100%);
	padding: 2px 8px;
	border-radius: 12px 12px 12px 0;
	font-weight: 500;
}

.info-features {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.feature-item {
	display: flex;
	align-items: center;
	font-size: 14px;
}

.feature-label {
	color: #909399;
	margin-right: 6px;
}

.feature-val {
	color: #303133;
	font-weight: 600;
}

/* 右侧价格与操作 */
.package-action {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	min-width: 100px;
	padding-left: 10px;
}

.price-group {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	margin-bottom: 8px;
}

.price-wrapper {
	display: flex;
	align-items: baseline;
	color: #F56C6C;
	line-height: 1;
	margin-bottom: 2px;
}

.price-symbol {
	font-size: 16px;
	font-weight: 600;
	margin-right: 2px;
}

.price-amount {
	font-size: 26px;
	font-weight: 600;
	font-family: inherit;
}

.original-price {
	font-size: 12px;
	color: #C0C4CC;
	text-decoration: line-through;
}

.buy-btn {
	background: linear-gradient(135deg, #5DD5C0 0%, #4EC9B0 100%);
	color: #fff;
	font-size: 13px;
	font-weight: 600;
	padding: 6px 14px;
	border-radius: 18px;
	white-space: nowrap;
	box-shadow: 0 4px 10px rgba(78, 201, 176, 0.3);
}

.buy-btn:active {
	transform: scale(0.96);
	opacity: 0.9;
}

/* 底部描述 */
.package-footer {
	background-color: #F9FAFC;
	padding: 10px 20px;
	font-size: 12px;
	color: #909399;
	line-height: 1.5;
	border-top: 1px dashed #EBEEF5;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 80px 0;
	color: #999;
	font-size: 14px;
}

/* 购买记录容器 */
.record-container {
	padding: 15px;
}

/* 套餐总余量 */
.balance-summary {
	background-color: #fff;
	border-radius: 16px;
	padding: 20px;
	margin-bottom: 15px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.summary-title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
	text-align: center;
	margin-bottom: 20px;
}

.summary-content {
	display: flex;
	justify-content: space-around;
}

.balance-item {
	text-align: center;
}

.balance-value {
	font-size: 24px;
	font-weight: 600;
	color: #303133;
	margin-bottom: 8px;
}

.balance-label {
	font-size: 13px;
	color: #909399;
}

/* 购买记录标题 */
.record-header {
	padding: 10px 0;
	margin-bottom: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.history-btn {
	display: flex;
	align-items: center;
	padding: 6px 12px;
	background-color: rgba(93, 213, 192, 0.1);
	border-radius: 20px;
	cursor: pointer;
	transition: all 0.3s ease;
}

.history-btn:active {
	background-color: rgba(93, 213, 192, 0.2);
	transform: scale(0.95);
}

.history-text {
	font-size: 13px;
	color: #5DD5C0;
	margin-right: 4px;
	font-weight: 500;
}

.record-title {
	font-size: 16px;
	font-weight: 600;
	color: #303133;
	padding-left: 10px;
	border-left: 4px solid #5DD5C0;
}

/* 购买记录列表 */
.record-list {
	padding-bottom: 20px;
}

.record-card {
	background-color: #fff;
	border-radius: 16px;
	margin-bottom: 15px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
	overflow: hidden;
	border: 1px solid rgba(0,0,0,0.02);
}

.card-header {
	padding: 15px 20px;
	border-bottom: 1px solid #f8f9fa;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-left {
	display: flex;
	align-items: center;
}

.record-icon {
	font-size: 20px;
	margin-right: 8px;
}

.record-name {
	font-size: 16px;
	font-weight: 600;
	color: #303133;
}

.record-status {
	font-size: 12px;
	color: #5DD5C0;
	background: rgba(93, 213, 192, 0.1);
	padding: 2px 8px;
	border-radius: 4px;
}

.card-body {
	padding: 20px;
}

.stat-grid {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.stat-item {
	flex: 1;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-value {
	font-size: 20px;
	font-weight: 600;
	color: #303133;
	margin-bottom: 4px;
	font-family: inherit;
}

.stat-unit {
	font-size: 12px;
	font-weight: normal;
	color: #909399;
	margin-left: 2px;
}

.stat-label {
	font-size: 12px;
	color: #909399;
}

.stat-divider {
	width: 1px;
	height: 20px;
	background-color: #EBEEF5;
}

.card-footer {
	padding: 10px 20px;
	background-color: #F9FAFC;
	font-size: 12px;
	color: #909399;
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.time-label {
	margin-right: 4px;
}

.time-value {
	font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* 自定义确认弹窗 */
.custom-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.modal-content {
	width: 80%;
	max-width: 340px;
	background-color: #fff;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
	padding: 24px 20px 16px;
	text-align: center;
	background: linear-gradient(135deg, #f8fffe 0%, #f0faf8 100%);
}

.modal-icon {
	font-size: 40px;
	margin-bottom: 12px;
}

.modal-title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
}

.modal-body {
	padding: 20px 24px;
}

.package-summary {
	text-align: center;
	margin-bottom: 20px;
	padding-bottom: 16px;
	border-bottom: 1px dashed #EBEEF5;
}

.package-name-text {
	font-size: 17px;
	font-weight: 600;
	color: #303133;
}

.package-detail-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 12px;
	background-color: #F9FAFC;
	border-radius: 8px;
}

.detail-label {
	font-size: 14px;
	color: #909399;
}

.detail-value {
	font-size: 15px;
	font-weight: 600;
	color: #303133;
}

.price-row {
	background: linear-gradient(135deg, rgba(93, 213, 192, 0.1) 0%, rgba(78, 201, 176, 0.15) 100%);
	margin-top: 4px;
}

.price-value {
	font-size: 18px;
	color: #5DD5C0;
}

.modal-footer {
	display: flex;
	padding: 16px 20px;
	gap: 12px;
}

.modal-btn {
	flex: 1;
	text-align: center;
	padding: 12px 0;
	font-size: 15px;
	font-weight: 500;
	border-radius: 24px;
	transition: all 0.2s;
}

.cancel-btn {
	color: #606266;
	background-color: #F5F7FA;
}

.cancel-btn:active {
	background-color: #EBEEF5;
}

.confirm-btn {
	color: #fff;
	background: linear-gradient(135deg, #5DD5C0 0%, #4EC9B0 100%);
	box-shadow: 0 4px 12px rgba(78, 201, 176, 0.3);
}

.confirm-btn:active {
	transform: scale(0.98);
	opacity: 0.9;
}

/* 订单详情弹窗 */
.order-detail-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.order-modal-content {
	width: 90%;
	max-width: 500px;
	max-height: 80vh;
	background-color: #fff;
	border-radius: 16px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.order-modal-header {
	padding: 20px;
	border-bottom: 1px solid #EBEEF5;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #F9FAFC;
}

.order-modal-title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
}

.order-close-btn {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background-color: #F0F0F0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	color: #909399;
	cursor: pointer;
}

.order-close-btn:active {
	background-color: #E0E0E0;
}

.order-modal-body {
	flex: 1;
	overflow-y: auto;
	padding: 0 20px 20px;
}

.order-section {
	margin-top: 20px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: #303133;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 2px solid #5DD5C0;
	display: inline-block;
}

.order-info-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 8px 0;
	border-bottom: 1px solid #F5F7FA;
	line-height: 1.5;
}

.order-info-item:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 14px;
	color: #909399;
	min-width: 80px;
	flex-shrink: 0;
}

.info-value {
	font-size: 14px;
	color: #303133;
	text-align: right;
	flex: 1;
	word-break: break-all;
}

.order-no {
	font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	font-size: 12px;
	color: #606266;
}

.price-text {
	color: #F56C6C;
	font-weight: 600;
	font-size: 15px;
}

.status-text {
	color: #5DD5C0;
	font-weight: 500;
}

/* 购买记录卡片添加点击效果 */
.record-card {
	cursor: pointer;
	transition: all 0.2s ease;
}

.record-card:active {
	transform: scale(0.98);
	opacity: 0.9;
}
</style>
