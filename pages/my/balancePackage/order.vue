<template>
	<view class="order-container">
	
		<!-- 订单状态筛选 -->
		<view class="status-tabs">
			<view 
				v-for="(tab, index) in statusTabs" 
				:key="index"
				class="status-tab"
				:class="{ active: activeStatus === tab.value }"
				@click="switchStatus(tab.value)"
			>
				<text class="tab-text">{{ tab.name }}</text>
				<view v-if="activeStatus === tab.value" class="tab-underline"></view>
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="order-list">
			<view 
				v-for="(order, index) in filteredOrders" 
				:key="index"
				class="order-card"
				@click="showOrderDetail(order)"
			>
				<!-- 订单头部 -->
				<view class="order-header">
					<view class="order-info">
						<text class="order-no">订单号：{{ order.orderNo }}</text>
						<text class="order-time">{{ order.createTime }}</text>
					</view>
					<view class="order-status" :class="{
						'status-canceled': order.orderStatus === '2' || order.orderStatus === 2,
						'status-refund': (order.orderStatus === '3' || order.orderStatus === 3) || (order.payStatus === '2' || order.payStatus === 2),
						'status-pending': (order.orderStatus !== '2' && order.orderStatus !== 2 && order.orderStatus !== '3' && order.orderStatus !== 3) && (order.payStatus === '0' || order.payStatus === 0),
						'status-paid': (order.orderStatus !== '2' && order.orderStatus !== 2 && order.orderStatus !== '3' && order.orderStatus !== 3) && (order.payStatus === '1' || order.payStatus === 1)
					}">
						{{ getOrderDisplayStatus(order) }}
					</view>
				</view>

				<!-- 套餐信息 -->
				<view class="order-content">
					<view class="package-icon">📦</view>
					<view class="package-info">
						<text class="package-name">{{ order.packageName }}</text>
						<view class="package-details">
							<text v-if="order.phoneCount > 0" class="detail-item">电话 {{ order.phoneCount }}分钟</text>
							<text v-if="order.smsCount > 0" class="detail-item">短信 {{ order.smsCount }}条</text>
							<text v-if="order.validityDays" class="detail-item">{{ order.validityDays }}天</text>
						</view>
					</view>
					<view class="package-price">
						<text class="price-symbol">¥</text>
						<text class="price-amount">{{ ((order.orderAmount || order.payAmount || 0) / 100).toFixed(2) }}</text>
					</view>
				</view>

				<!-- 订单操作 -->
				<view class="order-actions">
					<!-- 待支付且未取消的订单：取消订单 + 继续支付 -->
					<template v-if="(order.payStatus === '0' || order.payStatus === 0) && (order.orderStatus !== '2' && order.orderStatus !== 2)">
						<view class="action-btn cancel-btn" @click.stop="handleCancelOrder(order)">
							取消订单
						</view>
						<view class="action-btn pay-btn" @click.stop="continuePay(order)">
							继续支付
						</view>
					</template>
					<!-- 已取消/已支付/已退款订单：查看详情 + 删除订单 -->
					<template v-else>
						<view class="action-btn detail-btn" @click.stop="showOrderDetail(order)">
							查看详情
						</view>
						<view class="action-btn delete-btn" @click.stop="handleDeleteOrder(order)">
							删除订单
						</view>
					</template>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="filteredOrders.length === 0" class="empty-state">
				<text class="empty-icon">📋</text>
				<text class="empty-text">暂无订单</text>
			</view>
		</view>

		<!-- 订单详情弹窗 -->
		<view class="order-detail-modal" v-if="showDetailModal" @click="closeDetail">
			<view class="detail-modal-content" @click.stop>
				<view class="detail-modal-header">
					<view class="detail-modal-title">订单详情</view>
					<view class="detail-close-btn" @click="closeDetail">✕</view>
				</view>
				
				<view class="detail-modal-body">
					<!-- 套餐信息 -->
					<view class="detail-section">
						<view class="section-title">套餐信息</view>
						<view class="detail-info-item">
							<text class="info-label">套餐名称：</text>
							<text class="info-value">{{ selectedOrder.packageName }}</text>
						</view>
						<view class="detail-info-item" v-if="selectedOrder.phoneCount > 0">
							<text class="info-label">电话时长：</text>
							<text class="info-value">{{ selectedOrder.phoneCount }}分钟</text>
						</view>
						<view class="detail-info-item" v-if="selectedOrder.smsCount > 0">
							<text class="info-label">短信数量：</text>
							<text class="info-value">{{ selectedOrder.smsCount }}条</text>
						</view>
						<view class="detail-info-item" v-if="selectedOrder.validityDays">
							<text class="info-label">有效期：</text>
							<text class="info-value">{{ selectedOrder.validityDays }}天</text>
						</view>
					</view>

					<!-- 订单信息 -->
					<view class="detail-section">
						<view class="section-title">订单信息</view>
						<view class="detail-info-item">
							<text class="info-label">订单编号：</text>
							<text class="info-value order-no-text">{{ selectedOrder.orderNo }}</text>
						</view>
						<view class="detail-info-item">
							<text class="info-label">订单金额：</text>
							<text class="info-value price-text">¥{{ ((selectedOrder.orderAmount || 0) / 100).toFixed(2) }}</text>
						</view>
						<view class="detail-info-item">
							<text class="info-label">实付金额：</text>
							<text class="info-value price-text">¥{{ ((selectedOrder.payAmount || 0) / 100).toFixed(2) }}</text>
						</view>
						<view class="detail-info-item">
							<text class="info-label">支付方式：</text>
							<text class="info-value">{{ getPayTypeText(selectedOrder.payType) }}</text>
						</view>
						<view class="detail-info-item">
							<text class="info-label">订单状态：</text>
							<text class="info-value status-text">{{ getOrderStatusText(selectedOrder.orderStatus) }}</text>
						</view>
						<view class="detail-info-item">
							<text class="info-label">支付状态：</text>
							<text class="info-value status-text">{{ getPayStatusText(selectedOrder.payStatus) }}</text>
						</view>
					</view>

					<!-- 时间信息 -->
					<view class="detail-section">
						<view class="section-title">时间信息</view>
						<view class="detail-info-item">
							<text class="info-label">创建时间：</text>
							<text class="info-value">{{ selectedOrder.createTime }}</text>
						</view>
						<view class="detail-info-item" v-if="selectedOrder.payTime">
							<text class="info-label">支付时间：</text>
							<text class="info-value">{{ selectedOrder.payTime }}</text>
						</view>
					</view>

					<!-- 第三方信息 -->
					<view class="detail-section" v-if="selectedOrder.tradeNo">
						<view class="section-title">第三方信息</view>
						<view class="detail-info-item">
							<text class="info-label">交易流水号：</text>
							<text class="info-value order-no-text">{{ selectedOrder.tradeNo }}</text>
						</view>
						<view class="detail-info-item" v-if="selectedOrder.thirdOrderNo">
							<text class="info-label">第三方订单号：</text>
							<text class="info-value order-no-text">{{ selectedOrder.thirdOrderNo }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { listBalanceOrder, cancelOrder, delBalanceOrder } from '@/api/balanceOrder'

export default {
	data() {
		return {
			statusTabs: [
				{ name: '全部', value: 'all' },
				{ name: '待支付', value: '0' },
				{ name: '已支付', value: '1' },
				{ name: '已退款', value: '2' }
			],
			activeStatus: 'all',
			allOrders: [],
			filteredOrders: [],
			showDetailModal: false,
			selectedOrder: {}
		}
	},
	onLoad() {
		this.loadOrders()
	},
	methods: {
	
		// 加载所有订单
		async loadOrders() {
			try {
				uni.showLoading({ title: '加载中...' })
				const response = await listBalanceOrder({
					pageNum: 1,
					pageSize: 100
				})
				this.allOrders = response.rows || []
				this.filterOrders()
			} catch (error) {
				console.error('加载订单失败', error)
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},

		// 切换状态筛选
		switchStatus(status) {
			this.activeStatus = status
			this.filterOrders()
		},

		// 筛选订单
		filterOrders() {
			if (this.activeStatus === 'all') {
				this.filteredOrders = this.allOrders
			} else {
				this.filteredOrders = this.allOrders.filter(order => 
					String(order.payStatus) === String(this.activeStatus)
				)
			}
		},

		// 获取支付状态文本
		getPayStatusText(status) {
			const statusMap = {
				'0': '待支付',
				'1': '已支付',
				'2': '已退款'
			}
			return statusMap[String(status)] || '未知'
		},

		// 获取订单状态文本
		getOrderStatusText(status) {
			const statusMap = {
				'0': '待支付',
				'1': '已完成',
				'2': '已取消',
				'3': '已退款'
			}
			return statusMap[String(status)] || '未知'
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

		// 获取订单显示状态（优先显示订单状态）
		getOrderDisplayStatus(order) {
			// 优先判断订单状态
			if (order.orderStatus === '2' || order.orderStatus === 2) {
				return '已取消'
			}
			if (order.orderStatus === '3' || order.orderStatus === 3) {
				return '已退款'
			}
			// 再判断支付状态
			return this.getPayStatusText(order.payStatus)
		},

		// 获取状态样式类
		getStatusClass(order) {
			// 优先判断订单状态
			if (order.orderStatus === '2' || order.orderStatus === 2) {
				return 'status-canceled'
			}
			if (order.orderStatus === '3' || order.orderStatus === 3) {
				return 'status-refund'
			}
			// 再判断支付状态
			const classMap = {
				'0': 'status-pending',
				'1': 'status-paid',
				'2': 'status-refund'
			}
			return classMap[String(order.payStatus)] || ''
		},

		// 显示订单详情
		showOrderDetail(order) {
			this.selectedOrder = order
			this.showDetailModal = true
		},

		// 关闭详情弹窗
		closeDetail() {
			this.showDetailModal = false
			this.selectedOrder = {}
		},

		// 继续支付
		continuePay(order) {
			uni.showModal({
				title: '继续支付',
				content: `确认支付 ¥${((order.orderAmount || order.payAmount || 0) / 100).toFixed(2)} 吗？`,
				success: (res) => {
					if (res.confirm) {
						// 这里调用支付功能
						this.callWechatPay(order.orderId)
					}
				}
			})
		},

		// 调用微信支付（简化版）
		async callWechatPay(orderId) {
			uni.showToast({
				title: '支付功能开发中',
				icon: 'none'
			})
			// 实际项目中应该调用真实的支付接口
		},

		// 取消订单
		handleCancelOrder(order) {
			uni.showModal({
				title: '取消订单',
				content: '确认取消该订单吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '取消中...' })
							await cancelOrder(order.orderId)
							uni.hideLoading()
							uni.showToast({
								title: '订单已取消',
								icon: 'success'
							})
							// 刷新订单列表
							this.loadOrders()
						} catch (error) {
							uni.hideLoading()
							console.error('取消订单失败', error)
							uni.showToast({
								title: '取消失败，请重试',
								icon: 'none'
							})
						}
					}
				}
			})
		},

		// 删除订单
		handleDeleteOrder(order) {
			uni.showModal({
				title: '删除订单',
				content: '确认删除该订单吗？删除后将无法恢复。',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '删除中...' })
							await delBalanceOrder(order.orderId)
							uni.hideLoading()
							uni.showToast({
								title: '订单已删除',
								icon: 'success'
							})
							// 刷新订单列表
							this.loadOrders()
						} catch (error) {
							uni.hideLoading()
							console.error('删除订单失败', error)
							uni.showToast({
								title: '删除失败，请重试',
								icon: 'none'
							})
						}
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.order-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 状态筛选标签 */
.status-tabs {
	background-color: #fff;
	display: flex;
	padding: 0 15px;
	border-bottom: 1px solid #EBEEF5;
}

.status-tab {
	flex: 1;
	text-align: center;
	padding: 15px 0;
	position: relative;
	cursor: pointer;
}

.tab-text {
	font-size: 15px;
	color: #909399;
	transition: color 0.3s;
}

.status-tab.active .tab-text {
	color: #5DD5C0;
	font-weight: 600;
}

.tab-underline {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40px;
	height: 3px;
	background-color: #5DD5C0;
	border-radius: 2px;
}

/* 订单列表 */
.order-list {
	padding: 15px;
}

.order-card {
	background-color: #fff;
	border-radius: 12px;
	margin-bottom: 15px;
	padding: 15px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 订单头部 */
.order-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding-bottom: 12px;
	border-bottom: 1px solid #F5F7FA;
	margin-bottom: 12px;
}

.order-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.order-no {
	font-size: 13px;
	color: #606266;
	margin-bottom: 4px;
	font-family: monospace;
}

.order-time {
	font-size: 12px;
	color: #909399;
}

.order-status {
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 500;
}

.status-pending {
	background-color: #FFF3E0;
	color: #FF9800;
}

.status-paid {
	background-color: rgba(93, 213, 192, 0.1);
	color: #5DD5C0;
}

.status-refund {
	background-color: #F5F7FA;
	color: #909399;
}

.status-canceled {
	background-color: #F5F7FA;
	color: #909399;
}

/* 订单内容 */
.order-content {
	display: flex;
	align-items: center;
	margin-bottom: 12px;
}

.package-icon {
	font-size: 32px;
	margin-right: 12px;
}

.package-info {
	flex: 1;
}

.package-name {
	font-size: 15px;
	font-weight: 600;
	color: #303133;
	display: block;
	margin-bottom: 6px;
}

.package-details {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.detail-item {
	font-size: 12px;
	color: #909399;
	padding: 2px 8px;
	background-color: #F5F7FA;
	border-radius: 4px;
}

.package-price {
	display: flex;
	align-items: baseline;
	color: #F56C6C;
}

.price-symbol {
	font-size: 14px;
	font-weight: 600;
}

.price-amount {
	font-size: 20px;
	font-weight: 600;
	font-family: DINAlternate-Bold, sans-serif;
}

/* 订单操作 */
.order-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding-top: 12px;
	border-top: 1px solid #F5F7FA;
}

.action-btn {
	padding: 8px 20px;
	border-radius: 20px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.3s;
}

.detail-btn {
	background-color: #F5F7FA;
	color: #606266;
}

.detail-btn:active {
	background-color: #EBEEF5;
}

.pay-btn {
	background: linear-gradient(135deg, #5DD5C0 0%, #4EC9B0 100%);
	color: #fff;
	box-shadow: 0 4px 10px rgba(78, 201, 176, 0.3);
}

.pay-btn:active {
	transform: scale(0.95);
}

.cancel-btn {
	background-color: #FFF3E0;
	color: #FF9800;
	border: 1px solid #FFE0B2;
}

.cancel-btn:active {
	background-color: #FFE0B2;
}

.delete-btn {
	background-color: #FFEBEE;
	color: #F56C6C;
	border: 1px solid #FFCDD2;
}

.delete-btn:active {
	background-color: #FFCDD2;
}

/* 空状态 */
.empty-state {
	text-align: center;
	padding: 80px 20px;
}

.empty-icon {
	font-size: 64px;
	display: block;
	margin-bottom: 16px;
	opacity: 0.5;
}

.empty-text {
	font-size: 14px;
	color: #909399;
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

.detail-modal-content {
	width: 90%;
	max-width: 500px;
	max-height: 80vh;
	background-color: #fff;
	border-radius: 16px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.detail-modal-header {
	padding: 20px;
	border-bottom: 1px solid #EBEEF5;
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #F9FAFC;
}

.detail-modal-title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
}

.detail-close-btn {
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

.detail-close-btn:active {
	background-color: #E0E0E0;
}

.detail-modal-body {
	flex: 1;
	overflow-y: auto;
	padding: 0 20px 20px;
}

.detail-section {
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

.detail-info-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 8px 0;
	border-bottom: 1px solid #F5F7FA;
	line-height: 1.5;
}

.detail-info-item:last-child {
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

.order-no-text {
	font-family: monospace;
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
</style>