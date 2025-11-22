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
					<text class="order-time">{{ order.createTime }}</text>
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
							<view class="service-name">{{ order.serviceName || '服务项目' }}</view>
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
							</view>
						</view>
					</view>
				</view>

				<view class="order-footer">
					<view class="order-summary">
						<text class="total-text">服务价格：￥{{ order.price }}</text>
						<text class="subsidy-text" v-if="order.useSubsidy === '1' && order.subsidyAmount > 0">补贴：-￥{{ order.subsidyAmount }}</text>
						<view class="amount-wrapper">
							<text class="total-price" :class="{ 'refunded': order.status === 'cancelled' || order.status === 'rejected' }">
								实付：￥{{ order.actualAmount }}
							</text>
							<text v-if="order.status === 'cancelled' || order.status === 'rejected'" class="refund-tag">
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
						
						<!-- 已取消/已拒绝状态 -->
						<template v-if="order.status === 'cancelled' || order.status === 'rejected'">
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
					rejected: { text: '已拒绝', class: 'status-rejected' }
				}
			}
		},
		onLoad(options) {
			// 如果有状态参数，切换到对应标签
			if (options.status) {
				this.currentTab = parseInt(options.status)
			}
			this.loadUserInfo()
			this.loadReviewStats()
			this.loadOrders()

			// 监听订单更新事件
			uni.$on('orderUpdated', this.handleOrderUpdated)
			// 监听打开评价弹窗事件
			uni.$on('openReviewModal', this.handleOpenReviewModal)
		},

		onShow() {
			// 页面显示时刷新评价统计和订单数据
			this.loadReviewStats()
			// 强制刷新订单数据
			this.refreshOrders()
		},

		onUnload() {
			// 移除事件监听
			uni.$off('orderUpdated', this.handleOrderUpdated)
			uni.$off('openReviewModal', this.handleOpenReviewModal)
			// 清除搜索防抖定时器
			if (this.searchTimer) {
				clearTimeout(this.searchTimer)
				this.searchTimer = null
			}
		},
		methods: {
			// 处理订单更新事件
			handleOrderUpdated(data) {
				console.log('收到订单更新事件:', data)
				// 刷新评价统计
				this.loadReviewStats()
				// 强制刷新订单数据
				this.refreshOrders()
			},

			// 处理打开评价弹窗事件
			handleOpenReviewModal(data) {
				console.log('打开评价弹窗:', data)
				if (data && data.orderId) {
					this.goToReview(data.orderId)
				}
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
					console.log('查询订单列表参数:', query)

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
						
						console.log('订单列表加载成功:', { total, current: this.orderList.length, hasMore: this.hasMore })
					} else {
						// API返回失败
						if (this.page === 1) {
							this.orderList = []
						}
						this.hasMore = false
						console.warn('获取订单列表失败:', response.msg)
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
					'5': 'rejected'    // 已拒绝
				}
				
				const status = statusTextMap[order.orderStatus] || 'pending'
				const statusInfo = this.statusMap[status] || this.statusMap.pending
				
				return {
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
					serviceAddress: order.serviceAddress || '',
					
					// 价格相关
					price: order.price || 0,
					subsidyAmount: order.subsidyAmount || 0,
					actualAmount: order.actualAmount || 0,
					useSubsidy: order.useSubsidy || '0',
					
					// 其他信息
					remark: order.remark || '',
					rating: order.rating || null,
					evaluationContent: order.evaluationContent || ''
				}
			},

			// 加载更多
			loadMore() {
				if (!this.hasMore) return
				this.page++
				this.loadOrders()
			},

			// 下拉刷新
			async onRefresh() {
				console.log('触发下拉刷新')
				this.isRefreshing = true
				this.page = 1
				this.hasMore = true
				this.orderList = [] // 清空列表
				
				try {
					// 重新加载订单数据
					await this.loadOrders()
					
					// 同时刷新评价统计
					await this.loadReviewStats()
					
					// 刷新成功提示（可选）
					console.log('刷新完成')
				} catch (error) {
					console.error('刷新失败:', error)
					uni.showToast({
						title: '刷新失败',
						icon: 'none'
					})
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
		padding: 10rpx 0;
		flex-shrink: 0; /* 不允许收缩 */
		z-index: 100;

		.tab-item {
			flex: 1;
			text-align: center;
			font-size: 28rpx;
			color: #666;
			position: relative;
			padding: 20rpx 0;

			&.active {
				color: #3ec6c6;
				font-weight: 500;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 40rpx;
					height: 4rpx;
					background-color: #3ec6c6;
					border-radius: 2rpx;
				}
			}
		}
	}

	// 搜索框样式
	.search-container {
		background: #fff;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0; /* 不允许收缩 */
		z-index: 99;
		.search-box {
			display: flex;
			align-items: center;
			background: #f8f9fa;
			border-radius: 24rpx;
			padding: 16rpx 20rpx;
			position: relative;

			.search-input {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				margin-left: 16rpx;
				background: transparent;
				border: none;
				outline: none;

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
			}
		}


	}

	// 我的评价模块样式
	.my-review-section {
		background: #fff;
		margin: 0 20rpx 20rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
		flex-shrink: 0; /* 不允许收缩 */

		.review-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 32rpx 24rpx;
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
			border: 2rpx solid #f0f0f0;
		}

		.user-detail {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
		}

		.username {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}

		.review-stats {
			font-size: 24rpx;
			color: #999;
		}

		.review-action {
			display: flex;
			align-items: center;
			gap: 8rpx;
		}

		.action-text {
			font-size: 28rpx;
			color: #666;
		}
	}

	.order-list {
		flex: 1;
		padding: 20rpx;
		height: 0; /* 关键：配合flex布局，让scroll-view正确计算高度 */
	}

	.empty-order {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 180rpx 0;

		.empty-image {
			font-size: 160rpx;
			margin-bottom: 32rpx;
			color: #ff9db5;
			opacity: 0.8;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
			letter-spacing: 1rpx;
		}
	}

	.order-item {
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 20rpx;
			border-bottom: 2rpx solid #f5f5f5;

			.order-time {
				font-size: 24rpx;
				color: #999;
			}

			.order-status {
				font-size: 24rpx;
				padding: 6rpx 16rpx;
				border-radius: 8rpx;
				font-weight: 500;
				
				&.status-pending {
					color: #ff9900;
					background: rgba(255, 153, 0, 0.1);
				}
				&.status-accepted {
					color: #2979ff;
					background: rgba(41, 121, 255, 0.1);
				}
				&.status-serving {
					color: #0ac160;
					background: rgba(10, 193, 96, 0.1);
				}
				&.status-shipping {
					color: #0ac160;
					background: rgba(10, 193, 96, 0.1);
				}
				&.status-received {
					color: #9c27b0;
					background: rgba(156, 39, 176, 0.1);
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
					background: rgba(255, 87, 34, 0.1);
				}
				&.status-refunded {
					color: #ff5722;
					background: rgba(255, 87, 34, 0.1);
				}
			}
		}

		// 服务订单内容
		.service-order-content {
			padding: 20rpx;
			background: #f8f9fa;
			border-radius: 8rpx;
			margin: 16rpx 0;
			
			.service-header {
				display: flex;
				gap: 20rpx;
				
				.service-icon {
					width: 120rpx;
					height: 120rpx;
					border-radius: 12rpx;
					flex-shrink: 0;
					background: #fff;
				}
				
				.service-info {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					
					.service-name {
						font-size: 30rpx;
						font-weight: 600;
						color: #333;
						margin-bottom: 12rpx;
						line-height: 1.3;
					}
					
					.service-detail {
						.detail-item {
							display: flex;
							align-items: center;
							margin-bottom: 10rpx;
							
							&:last-child {
								margin-bottom: 0;
							}
							
							.detail-text {
								font-size: 24rpx;
								color: #666;
								margin-left: 8rpx;
								line-height: 1.4;
							}
						}
					}
				}
			}
		}

		.order-footer {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			justify-content: flex-end;
			border-top: 2rpx solid #f5f5f5;
			padding-top: 10rpx;
			.order-summary {
				width: 100%;
				display: flex;
				justify-content: flex-end;
				align-items: center;
				gap: 16rpx;
				margin-bottom: 12rpx;
				
				.total-text {
					font-size: 26rpx;
					color: #666;
				}
				
				.subsidy-text {
					font-size: 24rpx;
					color: #52c41a;
				}
				
				.amount-wrapper {
					display: flex;
					align-items: center;
					gap: 12rpx;
				}
				
				.total-price {
					font-size: 32rpx;
					color: #ff5555;
					font-weight: bold;
					
					&.refunded {
						color: #999;
						text-decoration: line-through;
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
				.action-btn {
					padding: 0 38rpx;
					height: 64rpx;
					line-height: 64rpx;
					font-size: 28rpx;
					border-radius: 36rpx;
					font-weight: 600;
					box-shadow: 0 2rpx 8rpx rgba(62,198,198,0.08);
					transition: box-shadow 0.2s, background 0.2s, color 0.2s;
					margin-right: 0;
					margin-left: 0;
					margin-bottom: 0;
					margin-top: 0;
					min-width: 120rpx;
					white-space: nowrap;
					text-overflow: initial;
					&:active {
						box-shadow: 0 1rpx 4rpx rgba(62,198,198,0.12);
						opacity: 0.92;
					}
					&.primary {
						color: #fff;
						background: #ff5555;
						border: none;
					}
					&.cancel, &.secondary, &.remind, &.review, &.test-ship, &.test-review {
						background: #fff;
						border: 2rpx solid #e0e0e0;
						color: #3ec6c6;
					}
					&.cancel {
						color: #999;
						border-color: #e0e0e0;
					}
					&.remind {
						color: #ff9900;
						border-color: #ffe0b2;
					}
					&.review {
						color: #9c27b0;
						border-color: #e1bee7;
					}
					&.delete {
						color: #ff5555;
						border-color: #ffcdd2;
					}
					&.reviewed {
						color: #666;
						border-color: #ddd;
						background: #f8f8f8;
					}
					&.test-ship {
						color: #3ec6c6;
						border-color: #b2ebf2;
					}
					&.test-review {
						color: #67c23a;
						border-color: #d0f5e0;
					}
					&[disabled] {
						color: #bbb !important;
						background: #f5f5f5 !important;
						border-color: #eee !important;
					}
				}
			}
		}

		.logistics-info {
			margin-top: 20rpx;
			padding: 24rpx 20rpx;
			background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
			border-radius: 12rpx;
			border-left: 4rpx solid #67c23a;
			position: relative;
			overflow: hidden;
			cursor: pointer;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				right: 0;
				width: 60rpx;
				height: 60rpx;
				background: rgba(103, 194, 58, 0.1);
				border-radius: 0 12rpx 0 60rpx;
			}

			.logistics-header {
				display: flex;
				align-items: flex-start;
				gap: 12rpx;
				position: relative;
				z-index: 1;

				.logistics-status {
					font-size: 28rpx;
					color: #67c23a;
					font-weight: 600;
					white-space: nowrap;
				}

				.logistics-detail {
					font-size: 24rpx;
					color: #666;
					flex: 1;
					line-height: 1.4;
					margin-top: 2rpx;
				}
			}
		}
	}

	.loading-more, .no-more {
		text-align: center;
		padding: 30rpx;
		font-size: 24rpx;
		color: #999;
		display: flex;
		align-items: center;
		justify-content: center;

		uni-icons {
			margin-right: 10rpx;
		}
	}

	.order-card {
		background: #fff;
		border-radius: 18rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
		margin: 24rpx 20rpx;
		padding: 28rpx 24rpx 20rpx 24rpx;
		font-size: 28rpx;
		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 18rpx;
			.order-status {
				color: #ff9800;
				font-weight: bold;
				font-size: 30rpx;
			}
			.order-number {
				color: #bbb;
				font-size: 24rpx;
			}
		}
		.order-body {
			.order-info {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 10rpx;
				.order-total {
					color: #333;
					.price {
						color: #ff5555;
						font-weight: bold;
						font-size: 32rpx;
					}
				}
			}
			.order-logistics {
				color: #888;
				font-size: 26rpx;
				.logistics-number {
					color: #3ec6c6;
					font-weight: bold;
				}
			}
		}
		.order-actions {
			display: flex;
			justify-content: flex-end;
			margin-top: 18rpx;
			button {
				margin-left: 16rpx;
				border-radius: 32rpx;
				font-size: 26rpx;
				padding: 0 32rpx;
				height: 56rpx;
				line-height: 56rpx;
				border: none;
				&.btn-more {
					background: #f5f5f5;
					color: #666;
				}
				&.btn-normal {
					background: #fff;
					color: #3ec6c6;
					border: 1rpx solid #3ec6c6;
				}
				&.btn-confirm {
					background: linear-gradient(90deg, #3ec6c6, #36b3b3);
					color: #fff;
					font-weight: bold;
					box-shadow: 0 2rpx 8rpx rgba(62,198,198,0.12);
				}
			}
		}
	}

	// 评价弹窗样式
	.review-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.review-content {
			width: 600rpx;
			background: #fff;
			border-radius: 16rpx;
			overflow: hidden;
			
			.review-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 32rpx;
				border-bottom: 2rpx solid #f5f5f5;
				
				.review-title {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
			}
			
			.review-body {
				padding: 32rpx;
				
				.review-item {
					margin-bottom: 32rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.review-label {
						display: block;
						font-size: 28rpx;
						color: #333;
						margin-bottom: 16rpx;
						font-weight: 500;
					}
					
					.star-rating {
						display: flex;
						gap: 12rpx;
					}
					
					.review-textarea {
						width: 100%;
						min-height: 180rpx;
						padding: 16rpx;
						border: 2rpx solid #e0e0e0;
						border-radius: 8rpx;
						font-size: 28rpx;
						line-height: 1.6;
						box-sizing: border-box;
					}
					
					.char-count {
						display: block;
						font-size: 24rpx;
						color: #999;
						text-align: right;
						margin-top: 8rpx;
					}
				}
			}
			
			.review-footer {
				display: flex;
				gap: 24rpx;
				padding: 24rpx 32rpx 32rpx;
				
				button {
					flex: 1;
					height: 80rpx;
					line-height: 80rpx;
					border-radius: 40rpx;
					font-size: 28rpx;
					font-weight: 500;
					border: none;
					
					&.cancel-btn {
						background: #f5f5f5;
						color: #666;
					}
					
					&.submit-btn {
						background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
						color: #fff;
					}
				}
			}
		}
	}
</style>
