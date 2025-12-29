<template>
	<view class="order-container">
		<!-- 订单状态切换栏 -->
		<view class="order-tabs">
			<view
				v-for="(tab, index) in tabs"
				:key="index"
				class="tab-item"
				:class="{ active: currentTab === index }"
				@click="switchTab(index)"
			>
				<text>{{ tab }}</text>
			</view>
		</view>

		<!-- 搜索框（仅在全部标签下显示） -->
		<view class="search-container" v-if="currentTab === 0">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input
					class="search-input"
					type="text"
					placeholder="搜索订单服务名称"
					v-model="searchKeyword"
					@input="handleSearch"
					@confirm="handleSearch"
				/>
				<view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
					<uni-icons type="clear" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 我的评价模块（仅在评价标签下显示） -->
		<view class="my-review-section" v-if="currentTab === 4">
			<view class="review-header" @click="goToReviewCenter">
				<view class="review-info">
					<image :src="userInfo.avatar || '/static/images/profile.jpg'" class="user-avatar" />
					<view class="user-detail">
						<text class="username">{{ userInfo.nickname || '用户' }}</text>
						<text class="review-stats">已评价 {{ reviewStats.totalReviews }} 条</text>
					</view>
				</view>
				<view class="review-action">
					<text class="action-text">我的评价</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 订单列表 -->
		<scroll-view 
			class="order-list"
			scroll-y
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<view v-if="orderList.length === 0" class="empty-order">
				<text class="iconfontA icon-fuwudingdan empty-image"></text>
				<text class="empty-text">暂无相关服务订单</text>
			</view>

			<view v-else class="order-item" v-for="(order, index) in orderList" :key="index">
				<view class="order-header">
					<view class="order-info">
						<text class="order-time">{{ order.createTime }}</text>
						<text class="order-no">订单号：{{ order.id }}</text>
					</view>
					<text class="order-status" :class="order.statusClass">{{ order.statusText }}</text>
				</view>

				<!-- 服务订单内容 -->
				<view class="service-order-content">
					<view class="service-header">
						<image 
							:src="getServiceIcon(order.icon)" 
							class="service-icon"
							mode="aspectFill"
						></image>
						<view class="service-info">
							<view class="service-name-row">
								<text class="service-name">{{ order.serviceName || '服务项目' }}</text>
								<view class="voice-badge" v-if="order.remark && parseVoiceRemark(order.remark)">
									<uni-icons type="sound" size="12" color="#fff"></uni-icons>
									<text>语音下单</text>
								</view>
							</view>
							<view class="service-detail">
								<view class="detail-item">
									<uni-icons type="person" size="14" color="#999"></uni-icons>
									<text class="detail-text">联系人：{{ order.contactName }}</text>
								</view>
								<view class="detail-item">
									<uni-icons type="phone" size="14" color="#999"></uni-icons>
									<text class="detail-text">{{ order.contactPhone }}</text>
								</view>
								<view class="detail-item">
									<uni-icons type="calendar" size="14" color="#999"></uni-icons>
									<text class="detail-text">预约时间：{{ order.appointmentDate }} {{ order.appointmentPeriod }}</text>
								</view>
								<view class="detail-item" v-if="order.serviceAddress">
									<uni-icons type="location" size="14" color="#999"></uni-icons>
									<text class="detail-text">服务地址：{{ order.serviceAddress }}</text>
								</view>
								<!-- 用户备注（非语音下单、非关闭状态时显示） -->
								<view class="detail-item" v-if="order.remark && order.status !== 'closed' && !parseVoiceRemark(order.remark)">
									<uni-icons type="chat" size="14" color="#999"></uni-icons>
									<text class="detail-text remark-text">备注：{{ order.remark }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 语音下单备注提示 -->
				<view class="voice-order-remark" v-if="order.remark && parseVoiceRemark(order.remark)">
					<view class="remark-detail">
						<view class="remark-item" v-if="parseVoiceRemark(order.remark).userRequest">
							<uni-icons type="person" size="14" color="#3ec6c6"></uni-icons>
							<text class="remark-value highlight">{{ parseVoiceRemark(order.remark).userRequest }}</text>
						</view>
						<view class="remark-item" v-if="parseVoiceRemark(order.remark).matchReason">
							<uni-icons type="compose" size="14" color="#999"></uni-icons>
							<text class="remark-value">{{ parseVoiceRemark(order.remark).matchReason }}</text>
						</view>
					</view>
				</view>

				<!-- 拒绝原因提示 -->
				<view class="reject-reason" v-if="order.status === 'rejected' && order.rejectReason">
					<uni-icons type="info-filled" size="16" color="#fa8c16"></uni-icons>
					<text class="reason-title">拒绝原因：</text>
					<text class="reason-content">{{ order.rejectReason }}</text>
				</view>

				<!-- 关闭原因提示 -->
			<view class="reject-reason" v-if="order.status === 'closed' && order.remark">
				<uni-icons type="info-filled" size="16" color="#fa8c16"></uni-icons>
				<text class="reason-title">关闭原因：</text>
				<text class="reason-content">{{ order.remark }}</text>
			</view>

			<view class="order-footer">
					<view class="order-summary">
						<text class="total-text">服务价格：￥{{ order.price }}</text>
						<text class="subsidy-text" v-if="order.useSubsidy === '1' && order.subsidyAmount > 0">补贴：-￥{{ order.subsidyAmount }}</text>
						<view class="amount-wrapper">
							<text class="total-price" :class="{ 'refunded': order.status === 'cancelled' || order.status === 'rejected' || order.status === 'closed' }">
								实付：￥{{ order.actualAmount }}
							</text>
							<text v-if="order.status === 'cancelled' || order.status === 'rejected' || order.status === 'closed'" class="refund-tag">
								已退款
							</text>
						</view>
					</view>
					<view class="order-actions">
						<!-- 待接单状态 -->
						<template v-if="order.status === 'pending'">
							<button class="action-btn delete" @click="deleteOrder(order.id)">删除订单</button>
							<button class="action-btn secondary" @click="editOrder(order.id)">修改预约</button>
							<button class="action-btn cancel" @click="cancelOrder(order.id)">取消预约</button>
						</template>

						<!-- 已接单状态 -->
						<template v-if="order.status === 'accepted'">
							<button class="action-btn delete" @click="deleteOrder(order.id)">删除订单</button>
						</template>

						<!-- 服务中状态 -->
						<template v-if="order.status === 'serving'">
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
							<button class="action-btn primary" @click="confirmComplete(order.id)">确认完成</button>
						</template>

						<!-- 待评价状态 -->
						<template v-if="order.status === 'completed' && !order.isReviewed">
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
							<button class="action-btn review" @click="goToReview(order.id)">立即评价</button>
						</template>

						<!-- 已评价状态 -->
						<template v-if="order.status === 'completed' && order.isReviewed">
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
							<button class="action-btn reviewed" @click="viewMyReview(order.id)">查看评价</button>
						</template>
						
						<!-- 已取消/已拒绝/已关闭状态 -->
						<template v-if="order.status === 'cancelled' || order.status === 'rejected' || order.status === 'closed'">
							<button class="action-btn delete" @click="deleteOrder(order.id)">删除订单</button>
						</template>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view class="loading-more" v-if="isLoading">
				<uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
				<text>加载中...</text>
			</view>
			<view class="no-more" v-if="!hasMore && !isLoading && orderList.length > 0">
				<text>没有更多订单了</text>
			</view>
		</scroll-view>

		<!-- 评价弹窗 -->
		<view class="review-modal" v-if="showReviewModal" @click="closeReviewModal">
			<view class="review-content" @click.stop>
				<view class="review-header">
					<text class="review-title">服务评价</text>
					<uni-icons type="closeempty" size="24" color="#999" @click="closeReviewModal"></uni-icons>
				</view>
				
				<view class="review-body">
					<!-- 评分 -->
					<view class="review-item">
						<text class="review-label">服务评分</text>
						<view class="star-rating">
							<uni-icons
								v-for="star in 5"
								:key="star"
								:type="star <= reviewData.rating ? 'star-filled' : 'star'"
								size="32"
								:color="star <= reviewData.rating ? '#FFB400' : '#E0E0E0'"
								@click="setRating(star)"
							></uni-icons>
						</view>
					</view>
					
					<!-- 评价内容 -->
					<view class="review-item">
						<text class="review-label">评价内容</text>
						<textarea
							v-model="reviewData.content"
							class="review-textarea"
							placeholder="请描述您对本次服务的评价"
							maxlength="200"
							:auto-height="true"
						></textarea>
						<text class="char-count">{{ reviewData.content.length }}/200</text>
					</view>
				</view>
				
				<view class="review-footer">
					<button class="cancel-btn" @click="closeReviewModal">取消</button>
					<button class="submit-btn" @click="submitReview" :loading="submittingReview">提交评价</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { listServiceorder, cancelServiceorder, updateServiceorder, delServiceorder, evaluationServiceorder } from '@/api/service'
	import config from '@/config.js'
	import websocket from '@/utils/websocket.js'
	
	export default {
		data() {
			return {
				tabs: ['全部', '待接单', '已接单', '服务中', '评价'],
				currentTab: 0,
				orderList: [],
				allOrders: [], // 存储所有订单数据
				searchKeyword: '', // 搜索关键词
				searchTimer: null, // 搜索防抖定时器
				page: 1,
				pageSize: 10,
				isLoading: false,
				hasMore: true,
				isRefreshing: false,
				userInfo: {}, // 用户信息
				reviewStats: { // 评价统计
					totalReviews: 0
				},
				// 评价相关
				showReviewModal: false,
				submittingReview: false,
				reviewData: {
					orderId: null,
					rating: 5,
					content: ''
				},
			// 服务订单状态映射
			statusMap: {
					pending: { text: '待接单', class: 'status-pending' },
					accepted: { text: '已接单', class: 'status-accepted' },
					serving: { text: '服务中', class: 'status-serving' },
					completed: { text: '已完成', class: 'status-completed' },
					cancelled: { text: '已取消', class: 'status-cancelled' },
					rejected: { text: '已拒绝', class: 'status-rejected' },
					closed: { text: '已关闭', class: 'status-closed' }
				},
				
				// WebSocket 相关
				wsStatus: '', // WebSocket 连接状态: pending, connecting, connected, reconnecting, error, failed, closed
				unsubscribeList: [], // 取消订阅函数列表
				isPageUnloaded: false // 页面是否已卸载，防止卸载后继续处理消息
			}
		},
		onLoad(options) {
			// 重置页面卸载标记（防止页面缓存复用）
			this.isPageUnloaded = false
			
			// 如果有状态参数，切换到对应标签
			if (options.status) {
				this.currentTab = parseInt(options.status)
			}
			this.loadUserInfo()
			this.loadReviewStats()
			this.loadOrders()

			// 连接 WebSocket
			this.connectWebSocket()
			
			// 监听打开评价弹窗事件
			uni.$on('openReviewModal', this.handleOpenReviewModal)
		},

		onShow() {
			// 重置页面卸载标记
			this.isPageUnloaded = false
			
			this.loadReviewStats()
			// 强制刷新订单数据
			this.refreshOrders()
			
			// 检查 WebSocket 连接状态，如果未连接则重新连接
			if (this.wsStatus !== 'connected') {
				this.connectWebSocket()
			}
		},
		
		onHide() {
			// 页面隐藏时断开连接，节省资源
			this.disconnectWebSocket()
		},

		onUnload() {
			// 标记页面已卸载，防止后续消息处理
			this.isPageUnloaded = true
			
			// 页面卸载时断开 WebSocket 连接
			// 确保只调用一次，清理所有资源
			this.disconnectWebSocket()
			
			// 清除搜索防抖定时器
			if (this.searchTimer) {
				clearTimeout(this.searchTimer)
				this.searchTimer = null
			}
			
			// 移除事件监听
			uni.$off('openReviewModal', this.handleOpenReviewModal)
		},
		methods: {
			// 解析语音下单备注
			parseVoiceRemark(remark) {
				if (!remark || !remark.includes('|')) return null
				
				try {
					// 格式: 智能匹配服务|用户原始需求:xxx|匹配原因:xxx
					const parts = remark.split('|')
					let userRequest = ''
					let matchReason = ''
					
					for (const part of parts) {
						if (part.includes('用户原始需求:')) {
							userRequest = part.replace('用户原始需求:', '').trim()
						} else if (part.includes('匹配原因:')) {
							matchReason = part.replace('匹配原因:', '').trim()
						}
					}
					
					if (userRequest || matchReason) {
						return { 
							userRequest: userRequest ? '"' + userRequest + '"' : '', 
							matchReason 
						}
					}
				} catch (e) {
					console.error('解析备注失败', e)
				}
				return null
			},

			// 切换标签
			switchTab(index) {
				if (this.currentTab === index) return
				this.currentTab = index
				this.page = 1
				this.orderList = []
				this.hasMore = true
				// 切换标签时清空搜索
				if (index !== 0) {
					this.searchKeyword = ''
				}
				this.loadOrders()
			},

			// 处理搜索（防抖）
			handleSearch() {
				if (this.currentTab !== 0) return // 只在全部标签下搜索
				
				// 清除之前的定时器
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
				}
				
				// 设置新的定时器，300ms后执行搜索
				this.searchTimer = setTimeout(() => {
					this.performSearch()
				}, 300)
			},
			
			// 执行搜索（前端过滤）
			performSearch() {
				if (this.currentTab !== 0) return
				
				const keyword = this.searchKeyword.trim().toLowerCase()
				
				if (!keyword) {
					// 没有搜索关键词，显示所有订单
					this.orderList = [...this.allOrders]
				} else {
					// 根据服务名称过滤订单
					this.orderList = this.allOrders.filter(order => {
						const serviceName = (order.serviceName || '').toLowerCase()
						return serviceName.includes(keyword)
					})
				}
			},

			// 清空搜索
			clearSearch() {
				this.searchKeyword = ''
				// 清除防抖定时器
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
				// 立即显示所有订单
				this.orderList = [...this.allOrders]
			},

			// 强制刷新订单数据
			refreshOrders() {
				// 重置分页状态
				this.page = 1
				this.hasMore = true
				this.isLoading = false
				this.isRefreshing = false

				// 强制重新加载
				this.loadOrders()
			},

			// 加载订单数据
			async loadOrders() {
				// 如果正在加载，直接返回（避免重复请求）
				if (this.isLoading) return
				
				// 如果是刷新操作（page=1）或者还有更多数据，才继续加载
				if (!this.isRefreshing && this.page > 1 && !this.hasMore) return
				
				this.isLoading = true

				try {
					// 构建查询参数
					const query = {
						pageNum: this.page,
						pageSize: this.pageSize
					}

					// 根据当前标签添加状态筛选
					if (this.currentTab !== 0) {
						// 服务订单状态映射：1-待接单, 2-已接单, 3-服务中, 4-评价
						const statusArray = ['0', '1', '2', '3'] // 0-待接单, 1-已接单, 2-服务中, 3-已完成
						if (this.currentTab === 4) {
							// 评价标签页：查询已完成待评价的订单
							query.orderStatus = '3' // 已完成状态
							// 筛选未评价的订单（rating为null或0）
						} else {
							// 其他标签页：按状态筛选
							query.orderStatus = statusArray[this.currentTab - 1]
						}
					}

					// 前端搜索，不再传递搜索参数到后端

					// 调用后端API
					const response = await listServiceorder(query)
					
					if (response.code === 200 && response.rows) {
						// 处理订单数据
						const orders = response.rows.map(order => this.formatOrderData(order))
						
						// 更新列表数据
						if (this.page === 1) {
							this.orderList = orders
							// 在全部标签下，保存所有订单用于前端搜索
							if (this.currentTab === 0) {
								this.allOrders = [...orders]
							}
						} else {
							this.orderList = [...this.orderList, ...orders]
							// 在全部标签下，追加到所有订单
							if (this.currentTab === 0) {
								this.allOrders = [...this.allOrders, ...orders]
							}
						}

						// 判断是否还有更多数据
						const total = response.total || 0
						this.hasMore = this.orderList.length < total
					} else {
						// API返回失败
						if (this.page === 1) {
							this.orderList = []
						}
						this.hasMore = false
					}
				} catch (error) {
					console.error('加载订单列表异常:', error)
					if (this.page === 1) {
						this.orderList = []
					}
					this.hasMore = false
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					this.isLoading = false
					this.isRefreshing = false
				}
			},

			// 格式化服务订单数据
			formatOrderData(order) {
				// 服务订单状态映射 (orderStatus字段)
				const statusTextMap = {
					'0': 'pending',    // 待接单
					'1': 'accepted',   // 已接单
					'2': 'serving',    // 服务中
					'3': 'completed',  // 已完成
					'4': 'cancelled',  // 已取消
					'5': 'rejected',   // 已拒绝
					'6': 'closed'      // 已关闭
				}
				
				const status = statusTextMap[order.orderStatus] || 'pending'
				const statusInfo = this.statusMap[status] || this.statusMap.pending
				
				const formattedOrder = {
					id: order.orderId,
					createTime: order.createTime || '',
					status: status,
					statusText: statusInfo.text,
					statusClass: statusInfo.class,
					isReviewed: order.rating != null && order.rating > 0,  // 有评分即为已评价
					
					// 服务订单特有字段
					serviceName: order.serviceName || '服务项目',
					serviceId: order.serviceId,
					icon: order.icon || '',  // 添加服务图标字段
					contactName: order.contactName || '',
					contactPhone: order.contactPhone || '',
					appointmentDate: order.appointmentDate || '',
					appointmentPeriod: order.appointmentPeriod || '',
					serviceAddress: order.detailAddress || '',
					
					// 价格相关
					price: order.price || 0,
					subsidyAmount: order.subsidyAmount || 0,
					actualAmount: order.actualAmount || 0,
					useSubsidy: order.useSubsidy || '0',
					
					// 其他信息
					remark: order.remark || '',
					rating: order.rating || null,
					evaluationContent: order.evaluationContent || '',
					rejectReason: order.rejectReason || '', // 拒绝原因

					// 用户信息 - 从后端返回的订单数据中获取
					userId: order.userId || '',
					deptId: order.deptId || '',
				}
				
				return formattedOrder
			},

			// 加载更多
			loadMore() {
				if (!this.hasMore) return
				this.page++
				this.loadOrders()
			},

			// 下拉刷新
			async onRefresh() {
				this.isRefreshing = true
				this.page = 1
				this.hasMore = true
				this.orderList = [] // 清空列表
				
				try {
					// 刷新订单列表
					await this.loadOrders()
					// 刷新评价统计
					await this.loadReviewStats()
				} catch (error) {
					console.error('刷新失败:', error)
					uni.showToast({
						title: '刷新失败',
						icon: 'none'
					})
				}
			},

			// 处理从详情页打开评价弹窗的事件
			handleOpenReviewModal(data) {
				if (data && data.orderId) {
					this.goToReview(data.orderId)
				}
			},

			// 评价订单
			goToReview(orderId) {
				// 打开评价弹窗
				this.reviewData = {
					orderId: orderId,
					rating: 5,
					content: ''
				}
				this.showReviewModal = true
			},

			// 设置评分
			setRating(star) {
				this.reviewData.rating = star
			},

			// 关闭评价弹窗
			closeReviewModal() {
				this.showReviewModal = false
				this.reviewData = {
					orderId: null,
					rating: 5,
					content: ''
				}
			},

			// 提交评价
			async submitReview() {
				// 验证
				if (!this.reviewData.content.trim()) {
					uni.showToast({
						title: '请输入评价内容',
						icon: 'none'
					})
					return
				}

				try {
					this.submittingReview = true

					// 调用评价接口
					const response = await evaluationServiceorder({
						orderId: this.reviewData.orderId,
						rating: this.reviewData.rating,
						evaluationContent: this.reviewData.content
					})

					if (response.code === 200) {
						uni.showToast({
							title: '评价成功',
							icon: 'success'
						})

						// 关闭弹窗
						this.closeReviewModal()

						// 刷新评价统计
						this.loadReviewStats()

						// 刷新订单列表
						this.refreshOrders()
					} else {
						uni.showToast({
							title: response.msg || '评价失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.error('提交评价失败:', error)
					uni.showToast({
						title: '评价失败，请重试',
						icon: 'none'
					})
				} finally {
					this.submittingReview = false
				}
			},

			// 跳转到评价中心
			goToReviewCenter() {
				uni.navigateTo({
					url: '/pages/shopping/review/center'
				})
			},

			// 获取服务图标路径
			getServiceIcon(iconPath) {
				if (!iconPath) {
					return '/static/images/default-service.png'
				}
				
				// 如果是完整URL，直接返回
				if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
					return iconPath
				}
				
				// 如果是相对路径，拼接baseUrl
				if (iconPath.startsWith('/')) {
					return config.baseUrl + iconPath
				}
				
				return '/static/images/default-service.png'
			},

			// 查看我的评价
			viewMyReview(orderId) {
				// 从订单列表中查找该订单
				const order = this.orderList.find(o => o.id === orderId);
				
				if (order && order.evaluationContent) {
					// 使用弹窗显示评价内容
					uni.showModal({
						title: '我的评价',
						content: order.evaluationContent,
						showCancel: false,
						confirmText: '确定'
					});
				} else {
					uni.showToast({
						title: '暂无评价内容',
						icon: 'none'
					});
				}
			},

			// 加载用户信息
			loadUserInfo() {
				this.userInfo = uni.getStorageSync('userInfo') || {
					nickname: '用户',
					avatar: '/static/images/profile.jpg'
				}
			},

			// 加载评价统计
			loadReviewStats() {
				const reviews = uni.getStorageSync('userReviews') || []
				this.reviewStats.totalReviews = reviews.length
			},

			// 取消订单
			async cancelOrder(orderId) {
				uni.showModal({
					title: '取消预约',
					content: '确定要取消该预约吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								uni.showLoading({ title: '取消中...' })
								
								// 调用取消预约API
								const response = await cancelServiceorder({ orderId })
								
								uni.hideLoading()
								
								if (response.code === 200) {
									uni.showToast({
										title: '取消成功',
										icon: 'success'
									})
									
									// 通过 WebSocket 发送取消消息
									this.sendCancelMessage(orderId)
									
									// 刷新订单列表
									this.refreshOrders()
								} else {
									uni.showToast({
										title: response.msg || '取消失败',
										icon: 'none'
									})
								}
							} catch (error) {
								uni.hideLoading()
								console.error('取消预约失败:', error)
								uni.showToast({
									title: '取消失败，请重试',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			/**
			 * 通过 WebSocket 发送取消订单消息
			 * @param {String} orderId - 订单ID
			 */
			sendCancelMessage(orderId) {
				// 从订单列表中查找对应的订单
				let order = this.orderList.find(item => item.id === orderId)
				if (!order) {
					// 如果当前列表中没有，尝试从 allOrders 中查找
					order = this.allOrders.find(item => item.id === orderId)
				}

				if (!order) {
					console.error('[订单页面] 未找到订单信息，无法发送取消消息')
					return
				}

				// 从订单对象中获取 userId 和 deptId
				const userId = order.userId
				const deptId = order.deptId

				if (!userId || !deptId) {
					console.error('[订单页面] 订单中缺少用户ID或部门ID')
					return
				}

				// 构建消息数据
				const message = {
					type: 'service_order_cancel',
					data: {
						orderId: orderId,
						userId: userId,
						deptId: deptId,
						timestamp: Date.now()
					},
					timestamp: Date.now()
				}

				// 发送消息
				websocket.send(message)
			},

			// 修改预约
			editOrder(orderId) {
				// TODO: 跳转到修改预约页面
				uni.navigateTo({
					url: `/pages/server/booking/index?orderId=${orderId}&mode=edit`
				})
			},

			// 删除预约
			async deleteOrder(orderId) {
				uni.showModal({
					title: '删除预约',
					content: '确定要删除该预约吗？删除后将无法恢复。',
					success: async (res) => {
						if (res.confirm) {
							try {
								uni.showLoading({ title: '删除中...' })
								
								// 调用删除预约API
								const response = await delServiceorder(orderId)
								
								uni.hideLoading()
								
								if (response.code === 200) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									})
									
									// 刷新订单列表
									this.refreshOrders()
								} else {
									uni.showToast({
										title: response.msg || '删除失败',
										icon: 'none'
									})
								}
							} catch (error) {
								uni.hideLoading()
								console.error('删除预约失败:', error)
								uni.showToast({
									title: '删除失败，请重试',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			// 查看订单详情
			viewOrderDetail(orderId) {
				uni.navigateTo({
					url: `/pages/order/detail?orderId=${orderId}`
				})
			},
			
			// 确认完成服务
			confirmComplete(orderId) {
				uni.showModal({
					title: '确认完成',
					content: '确认服务已完成吗？',
					success: (res) => {
						if (res.confirm) {
							// TODO: 调用完成服务API
							uni.showToast({
								title: '已确认完成',
								icon: 'success'
							})
							
							// 刷新订单列表
							this.refreshOrders()
						}
					}
				})
			},

			// ============ WebSocket 相关方法 ============

			/**
			 * 连接 WebSocket
			 */
			connectWebSocket() {
				// 获取用户信息
				const userInfo = uni.getStorageSync('userInfo')
				
				// 尝试从多个可能的字段获取 userId
				let userId = null
				
				if (userInfo) {
					// 尝试不同的字段名
					userId = userInfo.userId || userInfo.id || userInfo.user_id || userInfo.uid
				}
				
				// 如果 userInfo 中没有，尝试从已加载的订单中获取
				if (!userId && this.orderList.length > 0) {
					userId = this.orderList[0].userId
				}
				
				if (!userId) {
					// 延迟连接，等待订单数据加载
					this.wsStatus = 'pending'
					return
				}

				// 连接 WebSocket
				websocket.connect(userId)

				// 订阅连接状态变化
				const unsubscribeStatus = websocket.subscribe('status', (status) => {
					this.handleConnectionStatus(status)
				})
				this.unsubscribeList.push(unsubscribeStatus)

				// 订阅订单创建消息
				const unsubscribeCreate = websocket.subscribe('service_order_create', (message) => {
					this.handleOrderCreate(message)
				})
				this.unsubscribeList.push(unsubscribeCreate)

				// 订阅订单更新消息
				const unsubscribeUpdate = websocket.subscribe('service_order_update', (message) => {
					this.handleOrderUpdate(message)
				})
				this.unsubscribeList.push(unsubscribeUpdate)

				// 订阅订单取消/拒绝消息
				const unsubscribeRejectCancel = websocket.subscribe('service_order_reject_cancel', (message) => {
					this.handleOrderRejectCancel(message)
				})
				this.unsubscribeList.push(unsubscribeRejectCancel)
			},

			/**
			 * 断开 WebSocket 连接
			 */
			disconnectWebSocket() {
				// 取消所有订阅
				this.unsubscribeList.forEach(unsubscribe => {
					if (typeof unsubscribe === 'function') {
						unsubscribe()
					}
				})
				this.unsubscribeList = []

				// 关闭 WebSocket 连接（订单页面独占，离开页面时断开）
				websocket.close()
				
				// 重置连接状态
				this.wsStatus = ''
			},

			/**
			 * 处理连接状态变化
			 * @param {String} status - 连接状态
			 */
			handleConnectionStatus(status) {
				// 防止页面已卸载后继续处理消息
				if (this.isPageUnloaded) return
				
				this.wsStatus = status
			},

			/**
			 * 处理订单创建消息
			 * @param {Object} message - 消息对象
			 */
			handleOrderCreate(message) {
				// 防止页面已卸载后继续处理消息
				if (this.isPageUnloaded) return
				
				const orderData = message.data
				if (!orderData) return

				// 格式化订单数据
				const newOrder = this.formatOrderData(orderData)

				// 判断是否在当前标签页显示
				if (this.shouldShowInCurrentTab(newOrder)) {
					// 插入到列表顶部
					this.orderList.unshift(newOrder)
					
					// 如果在全部标签，也添加到 allOrders
					if (this.currentTab === 0) {
						this.allOrders.unshift(newOrder)
					}

					// 显示通知
					uni.showToast({
						title: '收到新的服务订单',
						icon: 'none',
						duration: 2000
					})
				}
			},

			/**
			 * 处理订单更新消息
			 * @param {Object} message - 消息对象
			 */
			handleOrderUpdate(message) {
				// 防止页面已卸载后继续处理消息
				if (this.isPageUnloaded) return
				
				const orderData = message.data
				if (!orderData || !orderData.orderId) {
					console.warn('[订单页面] 消息数据为空或缺少订单ID')
					return
				}

				// 状态映射
				const statusTextMap = {
					'0': 'pending',    // 待接单
					'1': 'accepted',   // 已接单
					'2': 'serving',    // 服务中
					'3': 'completed',  // 已完成
					'4': 'cancelled',  // 已取消
					'5': 'rejected'    // 已拒绝
				}
				
				const newStatus = statusTextMap[orderData.orderStatus]
				if (!newStatus) {
					console.warn('[订单页面] 未知的订单状态:', orderData.orderStatus)
					return
				}
				
				const newStatusInfo = this.statusMap[newStatus]

				// 查找订单在列表中的位置
				const index = this.orderList.findIndex(o => o.id === orderData.orderId)

				if (index !== -1) {
					// 找到订单，只更新状态字段
					const order = this.orderList[index]
					console.log('[订单页面] 更新订单状态:', {
						orderId: orderData.orderId,
						oldStatus: order.status,
						newStatus: newStatus
					})
					
					// 使用 Vue.set 或 this.$set 确保响应式更新
					this.$set(this.orderList[index], 'status', newStatus)
					this.$set(this.orderList[index], 'statusText', newStatusInfo.text)
					this.$set(this.orderList[index], 'statusClass', newStatusInfo.class)
					
					// 显示更新提示
					uni.showToast({
						title: `订单状态已更新: ${newStatusInfo.text}`,
						icon: 'none',
						duration: 1500
					})
					
					// 同步更新 allOrders
					if (this.currentTab === 0) {
						const allIndex = this.allOrders.findIndex(o => o.id === orderData.orderId)
						if (allIndex !== -1) {
							this.$set(this.allOrders[allIndex], 'status', newStatus)
							this.$set(this.allOrders[allIndex], 'statusText', newStatusInfo.text)
							this.$set(this.allOrders[allIndex], 'statusClass', newStatusInfo.class)
						}
					}
				} else {
					console.warn('[订单页面] 订单不在列表中，无法更新状态，订单ID:', orderData.orderId)
				}
			},

			/**
			 * 处理订单取消/拒绝消息
			 * @param {Object} message - 消息对象
			 */
			handleOrderRejectCancel(message) {
				// 防止页面已卸载后继续处理消息
				if (this.isPageUnloaded) return
				
				const orderData = message.data
				if (!orderData || !orderData.orderId) return

				// 状态映射
				const statusTextMap = {
					'4': 'cancelled',  // 已取消
					'5': 'rejected'    // 已拒绝
				}
				
				const newStatus = statusTextMap[orderData.orderStatus]
				if (!newStatus) return
				
				const newStatusInfo = this.statusMap[newStatus]

				// 查找订单在列表中的位置
				const index = this.orderList.findIndex(o => o.id === orderData.orderId)

				if (index !== -1) {
					// 更新订单状态字段
					this.$set(this.orderList[index], 'status', newStatus)
					this.$set(this.orderList[index], 'statusText', newStatusInfo.text)
					this.$set(this.orderList[index], 'statusClass', newStatusInfo.class)
					
					// 如果是拒绝状态，更新拒绝原因
					if (newStatus === 'rejected' && orderData.rejectReason) {
						this.$set(this.orderList[index], 'rejectReason', orderData.rejectReason)
					}
					
					// 同步更新 allOrders
					if (this.currentTab === 0) {
						const allIndex = this.allOrders.findIndex(o => o.id === orderData.orderId)
						if (allIndex !== -1) {
							this.$set(this.allOrders[allIndex], 'status', newStatus)
							this.$set(this.allOrders[allIndex], 'statusText', newStatusInfo.text)
							this.$set(this.allOrders[allIndex], 'statusClass', newStatusInfo.class)
							if (newStatus === 'rejected' && orderData.rejectReason) {
								this.$set(this.allOrders[allIndex], 'rejectReason', orderData.rejectReason)
							}
						}
					}

					// 显示提示
					const statusText = newStatus === 'cancelled' ? '已取消' : '已拒绝'
					let content = `订单${statusText}，已退款到原支付账户`
					
					// 如果有拒绝原因，显示在弹窗中
					if (newStatus === 'rejected' && orderData.rejectReason) {
						content += `\n\n拒绝原因：${orderData.rejectReason}`
					}
					
					uni.showModal({
						title: '订单状态变更',
						content: content,
						showCancel: false,
						confirmText: '知道了'
					})
				}
			},

			/**
			 * 判断订单是否应该在当前标签页显示
			 * @param {Object} order - 订单对象
			 * @returns {Boolean}
			 */
			shouldShowInCurrentTab(order) {
				if (this.currentTab === 0) {
					// 全部标签，显示所有订单
					return true
				}

				// 其他标签根据状态判断
				const tabStatusMap = {
					1: 'pending',    // 待接单
					2: 'accepted',   // 已接单
					3: 'serving',    // 服务中
					4: 'completed'   // 评价（已完成）
				}

				const expectedStatus = tabStatusMap[this.currentTab]
				
				// 评价标签额外判断是否已评价
				if (this.currentTab === 4) {
					return order.status === expectedStatus && !order.isReviewed
				}

				return order.status === expectedStatus
			},

		}
	}
</script>

<style lang="scss">
	.order-container {
		background-color: #f8f8f8;
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.order-tabs {
		display: flex;
		background-color: #fff;
		padding: 10rpx 0 20rpx 0;
		flex-shrink: 0;
		z-index: 100;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
		position: relative;

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #666;
			position: relative;
			padding: 16rpx 0;
			transition: all 0.3s;

			&.active {
				color: #3ec6c6;
				font-weight: 600;
				font-size: 30rpx;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 6rpx;
					background: linear-gradient(90deg, #3ec6c6, #6be0e0);
					border-radius: 6rpx;
					box-shadow: 0 2rpx 6rpx rgba(62, 198, 198, 0.3);
				}
			}
		}
	}

	// 搜索框样式
	.search-container {
		background: #fff;
		padding: 20rpx 32rpx;
		flex-shrink: 0;
		z-index: 99;
		
		.search-box {
			display: flex;
			align-items: center;
			background: #f7f8fa;
			border-radius: 100rpx;
			padding: 16rpx 24rpx;
			position: relative;
			transition: background 0.3s;

			&:active {
				background: #f0f2f5;
			}

			.search-input {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				margin-left: 16rpx;
				background: transparent;
				border: none;
				outline: none;
				height: 40rpx;
				line-height: 40rpx;

				&::placeholder {
					color: #999;
				}
			}

			.clear-btn {
				margin-left: 16rpx;
				padding: 8rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				opacity: 0.6;
				&:active {
					opacity: 1;
				}
			}
		}
	}

	// 我的评价模块样式
	.my-review-section {
		background: #fff;
		margin: 20rpx 24rpx;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
		flex-shrink: 0;

		.review-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 32rpx;
		}

		.review-info {
			display: flex;
			align-items: center;
			gap: 24rpx;
		}

		.user-avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50rpx;
			border: 4rpx solid #f7f8fa;
		}

		.user-detail {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
		}

		.username {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.review-stats {
			font-size: 24rpx;
			color: #999;
			background: #f7f8fa;
			padding: 4rpx 16rpx;
			border-radius: 100rpx;
			display: inline-block;
		}

		.review-action {
			display: flex;
			align-items: center;
			gap: 4rpx;
		}

		.action-text {
			font-size: 26rpx;
			color: #999;
		}
	}

	.order-list {
		flex: 1;
		padding: 0 24rpx 24rpx;
		height: 0;
	}

	.empty-order {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 160rpx 0;

		.empty-image {
			font-size: 120rpx;
			margin-bottom: 32rpx;
			color: #e0e0e0;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
			letter-spacing: 1rpx;
		}
	}

	.order-item {
		background-color: #fff;
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		padding: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		transition: transform 0.2s;

		&:active {
			transform: scale(0.995);
		}

		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 24rpx;
			margin-bottom: 0; 
			border-bottom: none; /* 去掉分割线，用间距代替 */

			.order-info {
				display: flex;
				align-items: center;
				gap: 16rpx;
			}

			.order-time {
				font-size: 24rpx;
				color: #999;
				background: #f8f9fa;
				padding: 6rpx 16rpx;
				border-radius: 8rpx;
			}

			.order-no {
				font-size: 22rpx;
				color: #999;
			}

			.order-status {
				font-size: 24rpx;
				padding: 8rpx 20rpx;
				border-radius: 100rpx;
				font-weight: 500;
				
				&.status-pending {
					color: #ff9900;
					background: rgba(255, 153, 0, 0.08);
				}
				&.status-accepted {
					color: #2979ff;
					background: rgba(41, 121, 255, 0.08);
				}
				&.status-serving {
					color: #0ac160;
					background: rgba(10, 193, 96, 0.08);
				}
				&.status-shipping {
					color: #0ac160;
					background: rgba(10, 193, 96, 0.08);
				}
				&.status-received {
					color: #9c27b0;
					background: rgba(156, 39, 176, 0.08);
				}
				&.status-completed {
					color: #666666;
					background: #f5f5f5;
				}
				&.status-cancelled {
					color: #999999;
					background: #f5f5f5;
				}
				&.status-rejected {
					color: #ff5722;
					background: rgba(255, 87, 34, 0.08);
				}
				&.status-closed {
					color: #999999;
					background: #f5f5f5;
				}
				&.status-refunded {
					color: #ff5722;
					background: rgba(255, 87, 34, 0.08);
				}
			}
		}

		// 服务订单内容
		.service-order-content {
			padding: 20rpx;
			background: #f9f9f9;
			border-radius: 16rpx;
			margin: 0 0 24rpx 0;
			
			.service-header {
				display: flex;
				gap: 24rpx;
				
				.service-icon {
					width: 140rpx;
					height: 140rpx;
					border-radius: 12rpx;
					flex-shrink: 0;
					background: #fff;
					border: 1rpx solid #f0f0f0;
				}
				
				.service-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					padding: 4rpx 0;
					
					.service-name-row {
						display: flex;
						align-items: center;
						flex-wrap: wrap;
						gap: 12rpx;
						margin-bottom: 12rpx;
						
						.service-name {
							font-size: 30rpx;
							font-weight: 600;
							color: #333;
							line-height: 1.4;
						}
						
						.voice-badge {
							display: inline-flex;
							align-items: center;
							gap: 6rpx;
							background: linear-gradient(135deg, #3ec6c6 0%, #2bb3b3 100%);
							color: #fff;
							font-size: 20rpx;
							padding: 6rpx 14rpx;
							border-radius: 100rpx;
							font-weight: 500;
							box-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.3);
							
							text {
								line-height: 1;
							}
						}
					}
					
					.service-detail {
						.detail-item {
							display: flex;
							align-items: flex-start;
							margin-bottom: 8rpx;
							
							&:last-child {
								margin-bottom: 0;
							}
							
							.detail-text {
								font-size: 24rpx;
								color: #666;
								margin-left: 8rpx;
								line-height: 1.4;
								flex: 1;
							}
						}
					}
				}
			}
		}

		// 语音下单备注提示框
		.voice-order-remark {
			margin: 0 0 16rpx 0;
			padding: 16rpx 20rpx;
			background: #f8fcfc;
			border-radius: 12rpx;
			
			.remark-detail {
				.remark-item {
					display: flex;
					align-items: flex-start;
					margin-bottom: 8rpx;
					gap: 8rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					uni-icons {
						flex-shrink: 0;
						margin-top: 4rpx;
					}
					
					.remark-value {
						font-size: 24rpx;
						color: #666;
						line-height: 1.5;
						word-break: break-all;
						flex: 1;
						
						&.highlight {
							color: #3ec6c6;
							font-weight: 500;
							font-size: 26rpx;
						}
					}
				}
			}
		}

		// 拒绝原因提示框
		.reject-reason {
			margin: 20rpx 0 0 0;
			padding: 20rpx 24rpx;
			background: #fffbf0;
			border-radius: 12rpx;
			display: flex;
			align-items: flex-start;
			gap: 8rpx;
			
			.reason-title {
				font-size: 26rpx;
				color: #fa8c16;
				font-weight: 500;
				flex-shrink: 0;
				line-height: 1.5;
			}
			
			.reason-content {
				font-size: 26rpx;
				color: #8c5a00;
				line-height: 1.5;
				flex: 1;
			}
		}

		.order-footer {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			justify-content: flex-end;
			border-top: 2rpx solid #f7f8fa;
			padding-top: 20rpx;
			
			.order-summary {
				width: 100%;
				display: flex;
				justify-content: flex-end;
				align-items: baseline;
				gap: 16rpx;
				margin-bottom: 24rpx;
				
				.total-text {
					font-size: 26rpx;
					color: #999;
				}
				
				.subsidy-text {
					font-size: 24rpx;
					color: #52c41a;
					background: rgba(82, 196, 26, 0.1);
					padding: 2rpx 8rpx;
					border-radius: 4rpx;
				}
				
				.amount-wrapper {
					display: flex;
					align-items: baseline;
					gap: 12rpx;
				}
				
				.total-price {
					font-size: 34rpx;
					color: #ff5555;
					font-weight: bold;
					font-family: DIN, -apple-system, Helvetica, sans-serif;
					
					&.refunded {
						color: #ccc;
						text-decoration: line-through;
						font-size: 28rpx;
					}
				}
				
				.refund-tag {
					padding: 4rpx 12rpx;
					font-size: 22rpx;
					color: #52c41a;
					background: #f6ffed;
					border: 1rpx solid #b7eb8f;
					border-radius: 8rpx;
					line-height: 1.2;
				}
			}
			.order-actions {
				display: flex;
				justify-content: flex-end;
				gap: 20rpx;
				width: 100%;
				
				.action-btn {
					padding: 0 32rpx;
					height: 60rpx;
					line-height: 60rpx;
					font-size: 26rpx;
					border-radius: 100rpx;
					font-weight: 500;
					margin: 0;
					min-width: 140rpx;
					white-space: nowrap;
					box-sizing: border-box;
					
					&::after {
						border: none;
					}

					&:active {
						opacity: 0.8;
						transform: scale(0.98);
					}

					&.primary {
						color: #fff;
						background: linear-gradient(135deg, #3ec6c6, #2bb3b3);
						box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
					}
					
					&.secondary, &.remind, &.review, &.test-ship, &.test-review {
						background: #fff;
						border: 2rpx solid #3ec6c6;
						color: #3ec6c6;
					}
					
					&.cancel {
						color: #999;
						background: #fff;
						border: 2rpx solid #e0e0e0;
					}
					
					&.delete {
						color: #ff5555;
						background: #fff;
						border: 2rpx solid #ffcdd2;
					}
					
					&.reviewed {
						color: #999;
						border: 2rpx solid #eee;
						background: #f9f9f9;
					}
					
					&[disabled] {
						color: #ccc !important;
						background: #f5f5f5 !important;
						border-color: #eee !important;
						box-shadow: none;
					}
				}
			}
		}
	}

	.loading-more, .no-more {
		text-align: center;
		padding: 40rpx;
		font-size: 24rpx;
		color: #bbb;
		display: flex;
		align-items: center;
		justify-content: center;

		uni-icons {
			margin-right: 10rpx;
		}
	}

	// 评价弹窗样式
	.review-modal {
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
		
		.review-content {
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
			
			.review-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 32rpx 40rpx;
				border-bottom: 2rpx solid #f7f8fa;
				
				.review-title {
					font-size: 34rpx;
					font-weight: bold;
					color: #333;
				}
			}
			
			.review-body {
				padding: 40rpx;
				
				.review-item {
					margin-bottom: 40rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.review-label {
						display: block;
						font-size: 28rpx;
						color: #666;
						margin-bottom: 20rpx;
						font-weight: 500;
					}
					
					.star-rating {
						display: flex;
						gap: 16rpx;
						justify-content: center;
					}
					
					.review-textarea {
						width: 100%;
						min-height: 200rpx;
						padding: 24rpx;
						border: none;
						background: #f7f8fa;
						border-radius: 16rpx;
						font-size: 28rpx;
						line-height: 1.6;
						box-sizing: border-box;
						color: #333;
						
						&::placeholder {
							color: #bbb;
						}
					}
					
					.char-count {
						display: block;
						font-size: 24rpx;
						color: #ccc;
						text-align: right;
						margin-top: 12rpx;
					}
				}
			}
			
			.review-footer {
				display: flex;
				gap: 24rpx;
				padding: 24rpx 40rpx 40rpx;
				
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
