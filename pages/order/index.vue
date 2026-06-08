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
					placeholder="搜索服务名称或订单编号"
					v-model="searchKeyword"
					@input="handleSearch"
					@confirm="handleSearch"
				/>
				<view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
					<uni-icons type="clear" size="16" color="#999"></uni-icons>
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

			<view v-else class="order-item" v-for="(order, index) in orderList" :key="order.id" @click="viewOrderDetail(order.id)">
				<view class="order-header">
					<view class="order-info">
						<text class="order-time">{{ order.createTime }}</text>
						<view class="order-no-wrapper" @longpress.stop="copyOrderNo(order.orderNo || order.id)">
							<text class="order-no-label">订单号：</text>
							<text class="order-no">{{ order.orderNo || order.id }}</text>
							<uni-icons type="copy" size="14" color="#999"></uni-icons>
						</view>
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
								<view class="package-badge" v-if="order.orderSource === '2' || order.orderSource === 2">
									<uni-icons type="wallet" size="12" color="#fff"></uni-icons>
									<text>套餐订单</text>
								</view>
								<view class="voice-badge" v-if="order.orderSource === '5' || order.orderSource === 5" @click.stop="playVoice(order)">
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
								<!-- 服务商信息 -->
								<view class="detail-item" v-if="order.providerName">
									<uni-icons type="shop" size="14" color="#999"></uni-icons>
									<text class="detail-text">服务商：{{ order.providerName }}</text>
								</view>
								<!-- 服务人员信息 -->
								<view class="detail-item" v-if="order.staffName">
									<uni-icons type="person-filled" size="14" color="#999"></uni-icons>
									<text class="detail-text">服务人员：{{ order.staffName }}</text>
									<!-- 核销方式标签（紧跟服务人员信息） -->
									<view class="inline-method-badge" v-if="order.status === 'completed' && order.verificationMethod">
										<uni-icons :type="getVerificationMethodIcon(order.verificationMethod)" size="10" color="#fff"></uni-icons>
										<text>{{ getVerificationMethodText(order.verificationMethod) }}</text>
									</view>
								</view>
								<!-- 用户备注（非语音下单、非关闭状态时显示） -->
								<view class="detail-item" v-if="order.remark && order.status !== 'closed' && order.orderSource !== '5' && order.orderSource !== 5">
									<uni-icons type="chat" size="14" color="#999"></uni-icons>
									<text class="detail-text remark-text">备注：{{ order.remark }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 语音下单备注提示 -->
				<view class="voice-order-remark" v-if="(order.orderSource === '5' || order.orderSource === 5) && order.remark && parseVoiceRemark(order.remark)">
					<view class="remark-detail">
						<view class="remark-item" v-if="parseVoiceRemark(order.remark).userRequest">
							<uni-icons type="person" size="14" color="#E07A4F"></uni-icons>
							<text class="remark-value highlight">{{ parseVoiceRemark(order.remark).userRequest }}</text>
						</view>
						<view class="remark-item" v-if="parseVoiceRemark(order.remark).matchReason">
							<uni-icons type="compose" size="14" color="#999"></uni-icons>
							<text class="remark-value secondary">{{ parseVoiceRemark(order.remark).matchReason }}</text>
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
					<view class="order-actions" @click.stop>
						<!-- 待接单状态 -->
						<template v-if="order.status === 'pending'">
							<button class="action-btn delete" @click="deleteOrder(order.id)">删除订单</button>
							<button class="action-btn secondary" @click="editOrder(order.id)">修改预约</button>
							<button class="action-btn cancel" @click="cancelOrder(order.id)">取消预约</button>
						</template>

						<!-- 已接单状态 -->
						<template v-if="order.status === 'accepted'">
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
						</template>

						<!-- 待核销状态 -->
						<template v-if="order.status === 'verifying'">
							<button class="action-btn secondary" @click="showVerificationCode(order)">查看核销码</button>
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
						</template>

						<!-- 服务中状态 -->
						<template v-if="order.status === 'serving'">
							<button class="action-btn secondary" @click="showVerificationCode(order)">查看核销码</button>
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
						</template>

						<!-- 已完成状态 - 根据是否已评价显示不同按钮 -->
						<template v-if="order.status === 'completed'">
							<button class="action-btn secondary" @click="viewOrderDetail(order.id)">查看详情</button>
							
							<button class="action-btn review" @click="goToReview(order.id)">
								{{ order.evaluationFlag === '1' ? '再次评价' : '立即评价' }}
							</button>
							<button class="action-btn reviewed" v-if="order.evaluationFlag === '1'" @click="viewMyReview(order.id)">查看评价</button>
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

		<!-- 评价弹窗组件 -->
		<ReviewModal
			:visible="showReviewModal"
			:mode="reviewMode"
			:isAppend="isAppendReview"
			:orderInfo="reviewData.orderInfo"
			:rating="reviewData.rating"
			:content="reviewData.content"
			:images="reviewData.images"
			:selectedTags="reviewData.selectedTags"
			:createTime="reviewData.createTime"
			:submitting="submittingReview"
			@close="closeReviewModal"
			@update:rating="reviewData.rating = $event"
			@update:content="reviewData.content = $event"
			@update:images="reviewData.images = $event"
			@toggle-tag="handleToggleTag"
			@submit="submitReview"
		/>

		<!-- 核销码弹窗组件 -->
		<VerificationModal
			:visible="showVerificationModal"
			:code="verificationCode"
			:loading="verificationCodeLoading"
			:qrcodeUrl="qrcodeImageUrl"
			@close="closeVerificationModal"
			@manual-confirm="handleManualConfirm"
			@qrcode-load="handleQrcodeLoad"
			@qrcode-error="handleQrcodeError"
		/>
	</view>
</template>

<script>
	import { listServiceorder, cancelServiceorder, updateServiceorder, delServiceorder, evaluationServiceorder, completeServiceorder } from '@/api/service'
	import { ORDER_STATUS_MAP, ORDER_STATUS_CODE_MAP, getServiceIcon as _getServiceIcon } from '@/utils/service-helper'
	import websocket from '@/utils/websocket.js'
	import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	import config from '@/config.js'
	import verificationMixin from '@/mixins/verification-mixin.js'
	import VerificationModal from '@/components/verification-modal/verification-modal.vue'
	import ReviewModal from '@/components/review-modal/review-modal.vue'
	
	export default {
		mixins: [verificationMixin],
		components: {
			'uni-icons': uniIcons,
			VerificationModal,
			ReviewModal
		},
		data() {
			return {
				config: config, // 配置对象
				tabs: ['全部', '待接单', '已接单', '服务中', '已完成'],
				currentTab: 0,
				orderList: [],
				allOrders: [],
				searchKeyword: '',
				searchTimer: null,
				page: 1,
				pageSize: 10,
				isLoading: false,
				hasMore: true,
				isRefreshing: false,
				// 评价相关
				showReviewModal: false,
				reviewMode: 'edit', // 'edit' 或 'view'
				submittingReview: false,
				isAppendReview: false, // 是否为追评模式
				reviewData: {
					orderId: null,
					orderInfo: null,
					rating: 0,
					content: '',
					images: [],
					selectedTags: [],
					createTime: ''
				},
				statusMap: ORDER_STATUS_MAP,
				
				// WebSocket 相关
				wsStatus: '', // WebSocket 连接状态: pending, connecting, connected, reconnecting, error, failed, closed
				unsubscribeList: [], // 取消订阅函数列表
				isPageUnloaded: false, // 页面是否已卸载，防止卸载后继续处理消息
				
				// 音频播放相关
				innerAudioContext: null, // 音频上下文
				currentPlayingOrderId: null, // 当前正在播放的订单ID
			}
		},
	
		onLoad(options) {
			// 重置页面卸载标记（防止页面缓存复用）
			this.isPageUnloaded = false
			
			// 如果有状态参数，切换到对应标签
			if (options.status) {
				this.currentTab = parseInt(options.status)
			}
			this.loadOrders()

			// 连接 WebSocket
			this.connectWebSocket()
			
			// 监听打开评价弹窗事件
			uni.$on('openReviewModal', this.handleOpenReviewModal)
		},

		onShow() {
			// 检查是否登录
			if (!this.$store.getters.token) {
				uni.showModal({
					title: '提示',
					content: '请先登录后再查看订单',
					confirmText: '去登录',
					cancelText: '返回',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/pages/login'
							})
						} else {
							// 返回首页
							uni.switchTab({
								url: '/pages/index'
							})
						}
					}
				})
				return
			}
			
			// 重置页面卸载标记
			this.isPageUnloaded = false
			
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
			
			// 清理音频资源
			if (this.innerAudioContext) {
				this.innerAudioContext.stop()
				this.innerAudioContext.destroy()
				this.innerAudioContext = null
			}
			
			// 移除事件监听
			uni.$off('openReviewModal', this.handleOpenReviewModal)
		},
		methods: {
			// 复制订单号
			copyOrderNo(orderNo) {
				if (!orderNo) return
				
				uni.setClipboardData({
					data: orderNo,
					success: () => {
						uni.showToast({
							title: '订单号已复制',
							icon: 'success',
							duration: 1500
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
			
			// 解析语音下单备注
			parseVoiceRemark(remark) {
				if (!remark || !remark.includes('|')) return null
				
				try {
					// 格式: 智能匹配服务|用户原始需求:xxx|匹配原因:xxx
					const parts = remark.split('|')
					let userRequest = ''
					let matchReason = ''
					
					// 使用传统 for 循环替代 for...of
					for (let i = 0; i < parts.length; i++) {
						const part = parts[i]
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

			// 播放语音
			playVoice(order) {
				if (!order.filename) {
					uni.showToast({
						title: '暂无语音文件',
						icon: 'none'
					})
					return
				}
				
				// 构建完整的音频URL
				// 正确的路径格式：/api/audio/demand/
				let url = config.baseUrl + '/api/audio/demand/' + order.filename
				
				console.log('播放语音URL:', url)
				
				// 如果已经在播放同一个订单的语音，则停止播放
				if (this.currentPlayingOrderId === order.id && this.innerAudioContext) {
					this.innerAudioContext.stop()
					this.currentPlayingOrderId = null
					uni.showToast({
						title: '已停止播放',
						icon: 'none'
					})
					return
				}
				
				// 停止之前的播放
				if (this.innerAudioContext) {
					this.innerAudioContext.stop()
					this.innerAudioContext.destroy()
				}
				
				// 直接尝试播放，不再检查文件
				this.startPlayAudio(url, order.id)
			},
			
			// 开始播放音频
			startPlayAudio(audioUrl, orderId) {
				try {
					// 确保音频实例存在
					if (!this.innerAudioContext) {
						this.innerAudioContext = uni.createInnerAudioContext()
						
						// 播放结束
						this.innerAudioContext.onEnded(() => {
							console.log('语音播放完成')
							this.currentPlayingOrderId = null
						})
						
						// 播放错误
						this.innerAudioContext.onError((res) => {
							console.error('语音播放失败 - 原始错误对象:', res)
							console.error('音频URL:', audioUrl)
							
							let errorMsg = '语音播放失败'
							
							// 安全地访问 res 对象
							if (res && typeof res === 'object') {
								console.error('错误代码:', res.errCode)
								console.error('错误信息:', res.errMsg)
								
								if (res.errCode === 10001) {
									errorMsg = '音频格式不支持'
								} else if (res.errCode === 10002) {
									errorMsg = '网络错误'
								} else if (res.errCode === 10003) {
									errorMsg = '文件错误'
								} else if (res.errCode === 10004) {
									errorMsg = '音频格式错误'
								} else if (res.errMsg) {
									errorMsg = res.errMsg
								}
							}
							
							uni.showToast({
								title: errorMsg,
								icon: 'none',
								duration: 2000
							})
							this.currentPlayingOrderId = null
						})
					}
					
					// 停止当前播放
					this.innerAudioContext.stop()
					
					// 设置新的音频源
					this.innerAudioContext.src = audioUrl
					
					// 记录当前播放的订单ID
					this.currentPlayingOrderId = orderId
					
					// 开始播放
					this.innerAudioContext.play()
					
					console.log('开始播放语音')
					uni.showToast({
						title: '正在播放语音',
						icon: 'none',
						duration: 1000
					})
				} catch (e) {
					console.error('播放音频异常:', e)
					uni.showToast({ 
						title: '播放失败: ' + e.message, 
						icon: 'none' 
					})
					this.currentPlayingOrderId = null
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
			
			// 执行搜索（后端查询）
			performSearch() {
				if (this.currentTab !== 0) return
				
				// 重置分页并重新加载数据
				this.page = 1
				this.hasMore = true
				this.orderList = []
				this.allOrders = []
				this.loadOrders()
			},

			// 清空搜索
			clearSearch() {
				this.searchKeyword = ''
				// 清除防抖定时器
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
					this.searchTimer = null
				}
				// 重新加载订单数据
				this.page = 1
				this.hasMore = true
				this.orderList = []
				this.allOrders = []
				this.loadOrders()
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
						// 服务订单状态映射：0-待接单, 1-已接单, 2-服务中, 3-已完成, 8-待核销
						if (this.currentTab === 4) {
							// 已完成标签页：查询已完成的订单（包括已评价和待评价）
							query.orderStatus = '3' // 已完成状态
						} else if (this.currentTab === 3) {
							// 服务中标签页：需要查询服务中(2)和待核销(8)的订单
							// 由于后端不支持多状态查询，需要分别查询并合并
							await this.loadOrdersWithMultipleStatus(['2', '8'], query)
							return
						} else {
							// 其他标签页：按状态筛选
							const statusArray = ['0', '1', '2', '3'] // 0-待接单, 1-已接单, 2-服务中, 3-已完成
							query.orderStatus = statusArray[this.currentTab - 1]
						}
					}

					// 添加搜索关键词和套餐订单过滤控制
					const keyword = this.searchKeyword.trim()
					if (keyword) {
						// 判断是否为订单编号（通常为数字或特定格式）
						const isOrderNumber = /^[A-Za-z0-9\-_]+$/.test(keyword) && keyword.length >= 6
						
						if (isOrderNumber) {
							// 输入订单编号查询时：包含套餐订单，但只显示一周内未完成的
							query.orderNo = keyword
							query.excludePackageByDefault = false
						} else {
							// 按服务名称搜索时：排除套餐订单
							query.serviceName = keyword
							query.excludePackageByDefault = false
						}
					} else {
						// 未输入搜索关键词时：排除套餐订单
						query.excludePackageByDefault = false
					}
					
					// 调用后端API
					const response = await listServiceorder(query)
					
					if (response.code === 200 && response.rows) {
						// 处理订单数据
						let orders = response.rows.map(order => this.formatOrderData(order))
						
						// 前端额外过滤：确保套餐订单只显示一周内未完成的
						orders = this.filterPackageOrders(orders)
						
						// 更新列表数据
						if (this.page === 1) {
							this.orderList = orders
							// 保存所有订单数据
							this.allOrders = [...orders]
						} else {
							this.orderList = [...this.orderList, ...orders]
							// 追加到所有订单
							this.allOrders = [...this.allOrders, ...orders]
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

			// 过滤套餐订单：只显示一周内未完成的套餐订单
			filterPackageOrders(orders) {
				const now = new Date()
				const oneWeekFromNow = new Date()
				oneWeekFromNow.setDate(now.getDate() + 7)
				
				return orders.filter(order => {
					// 如果不是套餐订单，直接保留
					if (order.orderSource !== '2' && order.orderSource !== 2) {
						return true
					}
					
					// 套餐订单需要满足两个条件：
					// 1. 预约时间在一周内（从今天开始算）
					// 2. 状态不是已完成
					
					// 检查预约时间是否在一周内
					if (!order.appointmentDate) {
						// 如果没有预约时间，不显示
						return false
					}
					
					const appointmentDate = new Date(order.appointmentDate)
					// 预约时间应该在今天到一周后之间
					const isWithinOneWeek = appointmentDate >= now && appointmentDate <= oneWeekFromNow
					
					// 检查是否未完成（排除已完成、已取消、已拒绝、已关闭状态）
					const isNotCompleted = !['completed', 'cancelled', 'rejected', 'closed'].includes(order.status)
					
					return isWithinOneWeek && isNotCompleted
				})
			},

			// 处理多状态查询（用于服务中标签页查询状态2和8）
			async loadOrdersWithMultipleStatus(statusArray, baseQuery) {
				try {
					let allOrders = []
					
					// 分别查询每个状态的订单
					for (const status of statusArray) {
						const query = {
							...baseQuery,
							orderStatus: status
						}
						
						const response = await listServiceorder(query)
						
						if (response.code === 200 && response.rows) {
							const orders = response.rows.map(order => this.formatOrderData(order))
							allOrders = [...allOrders, ...orders]
						}
					}
					
					// 前端额外过滤：确保套餐订单只显示一周内未完成的
					allOrders = this.filterPackageOrders(allOrders)
					
					// 按创建时间倒序排序
					allOrders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
					
					// 更新列表数据
					if (this.page === 1) {
						this.orderList = allOrders
						this.allOrders = [...allOrders]
					} else {
						this.orderList = [...this.orderList, ...allOrders]
						this.allOrders = [...this.allOrders, ...allOrders]
					}
					
					// 多状态查询暂时不支持分页，设置hasMore为false
					this.hasMore = false
					
				} catch (error) {
					console.error('多状态查询订单列表异常:', error)
					if (this.page === 1) {
						this.orderList = []
					}
					this.hasMore = false
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				}
			},

			formatOrderData(order) {
				const status = ORDER_STATUS_CODE_MAP[order.orderStatus] || 'pending'
				const statusInfo = this.statusMap[status] || this.statusMap.pending
				
				const formattedOrder = {
					id: order.orderId,
					orderNo: order.orderNo || null,  // 订单号，优先显示
					createTime: order.createTime || '',
					status: status,
					statusText: statusInfo.text,
					statusClass: statusInfo.class,
					evaluationFlag: order.evaluationFlag || '0',  // 评价标识：0-未评价，1-已评价
					isReviewed: order.evaluationFlag === '1',  // 根据evaluationFlag判断是否已评价
					
					// 服务订单特有字段
					serviceName: order.serviceName || '服务项目',
					serviceId: order.serviceId,
					icon: order.icon || '',  // 添加服务图标字段
					contactName: order.contactName || '',
					contactPhone: order.contactPhone || '',
					appointmentDate: order.appointmentDate || '',
					appointmentPeriod: order.appointmentPeriod || '',
					serviceAddress: order.detailAddress || '',
					providerName: order.providerName || '',  // 服务商名称
					staffName: order.staffName || '',  // 服务人员姓名
					staffPhone: order.staffPhone || '',  // 服务人员电话
					
					// 价格相关
					price: order.price || 0,
					subsidyAmount: order.subsidyAmount || 0,
					actualAmount: order.actualAmount || 0,
					useSubsidy: order.useSubsidy || '0',
					
					// 其他信息
					orderType: order.orderType || '0',  // 订单类型：0-普通下单，1-语音下单
					orderSource: order.orderSource || '0',  // 订单来源：0-普通订单，2-套餐订单
					filename: order.filename || '',  // 语音文件路径
					remark: order.remark || '',
					rating: order.rating || null,
					evaluationContent: order.evaluationContent || '',
					evaluationImages: order.evaluationImages || '',  // 评价图片
					evaluationTime: order.evaluationTime || '',  // 评价时间
					rejectReason: order.rejectReason || '', // 拒绝原因
					verificationMethod: order.verificationMethod || '', // 核销方式

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
				const order = this.orderList.find(o => o.id === orderId) || this.allOrders.find(o => o.id === orderId)
				
				// 判断是首评还是追评
				this.isAppendReview = order && order.evaluationFlag === '1'
				this.reviewMode = 'edit'
				this.reviewData = {
					orderId: orderId,
					orderInfo: order ? {
						serviceName: order.serviceName,
						providerName: order.providerName,
						icon: this.getServiceIcon(order.icon)
					} : null,
					rating: 0,
					content: '',
					images: [],
					selectedTags: [],
					createTime: ''
				}
				this.showReviewModal = true
			},
			
			// 切换标签选择
			handleToggleTag(tag) {
				const index = this.reviewData.selectedTags.indexOf(tag)
				if (index > -1) {
					this.reviewData.selectedTags.splice(index, 1)
				} else {
					this.reviewData.selectedTags.push(tag)
				}
			},

			// 关闭评价弹窗
			closeReviewModal() {
				this.showReviewModal = false
				this.reviewMode = 'edit'
				this.reviewData = {
					orderId: null,
					orderInfo: null,
					rating: 0,
					content: '',
					images: [],
					selectedTags: [],
					createTime: ''
				}
			},

			// 提交评价
			async submitReview() {
				// 组合评价内容：标签 + 自定义内容
				let finalContent = ''
				if (this.reviewData.selectedTags.length > 0) {
					finalContent = this.reviewData.selectedTags.join('、')
				}
				if (this.reviewData.content.trim()) {
					if (finalContent) {
						finalContent += '；' + this.reviewData.content.trim()
					} else {
						finalContent = this.reviewData.content.trim()
					}
				}

				try {
					this.submittingReview = true

					// 上传图片
					let uploadedImages = []
					if (this.reviewData.images && this.reviewData.images.length > 0) {
						uni.showLoading({ title: '上传图片中...' })
						for (let i = 0; i < this.reviewData.images.length; i++) {
							try {
								const uploadResult = await this.$upload({
									url: '/common/upload',
									filePath: this.reviewData.images[i],
									name: 'file'
								})
								if (uploadResult.code === 200 && uploadResult.fileName) {
									uploadedImages.push(uploadResult.fileName)
								}
							} catch (uploadError) {
								console.error('图片上传失败:', uploadError)
							}
						}
						uni.hideLoading()
					}

					// 调用评价接口
					const evaluationData = {
						orderId: this.reviewData.orderId,
						rating: this.reviewData.rating,
						evaluationContent: finalContent
					}
					if (uploadedImages.length > 0) {
						evaluationData.evaluationImages = JSON.stringify(uploadedImages)
					}
					const response = await evaluationServiceorder(evaluationData)

					if (response.code === 200) {
						uni.showToast({
							title: '评价成功',
							icon: 'success'
						})

						// 关闭弹窗
						this.closeReviewModal()

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

			getServiceIcon(iconPath) {
				return _getServiceIcon(iconPath)
			},
			
			// 获取核销方式文本
			getVerificationMethodText(method) {
				const methodMap = {
					'SCAN': '扫码核销',
					'MANUAL': '手动核销',
					'RESIDENT': '居民确认'
				}
				return methodMap[method] || method
			},
			
			// 获取核销方式图标
			getVerificationMethodIcon(method) {
				const iconMap = {
					'SCAN': 'scan',
					'MANUAL': 'hand-up',
					'RESIDENT': 'person-filled'
				}
				return iconMap[method] || 'checkmark-circle'
			},
			
			// 获取核销方式样式类
			getVerificationMethodClass(method) {
				if (method === 'RESIDENT') {
					return 'method-resident'
				} else if (method === 'SCAN') {
					return 'method-scan'
				} else if (method === 'MANUAL') {
					return 'method-manual'
				}
				return 'method-default'
			},

			// 查看我的评价
			viewMyReview(orderId) {
				const order = this.orderList.find(o => o.id === orderId) || this.allOrders.find(o => o.id === orderId)
				
				if (order && order.evaluationFlag === '1') {
					// 跳转到评价列表页面
					uni.navigateTo({
						url: `/pages/evaluation/list?orderId=${orderId}`
					})
				} else {
					uni.showToast({
						title: '暂无评价内容',
						icon: 'none'
					})
				}
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
			
			// 核销成功回调（混入会调用此方法）
			onVerificationSuccess() {
				// 刷新订单列表
				this.refreshOrders()
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

				// 检查订单是否已存在（避免重复）
				const existsInList = this.orderList.some(o => o.id === newOrder.id)
				if (existsInList) {
					console.log('订单已存在，跳过添加:', newOrder.id)
					return
				}

				// 判断是否在当前标签页显示
				if (this.shouldShowInCurrentTab(newOrder)) {
					// 插入到列表顶部
					this.orderList.unshift(newOrder)
					
					// 如果在全部标签，也添加到 allOrders
					if (this.currentTab === 0) {
						const existsInAll = this.allOrders.some(o => o.id === newOrder.id)
						if (!existsInAll) {
							this.allOrders.unshift(newOrder)
						}
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

				// 使用统一的状态映射
				const newStatus = ORDER_STATUS_CODE_MAP[orderData.orderStatus]
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

				// 使用统一的状态映射
				const newStatus = ORDER_STATUS_CODE_MAP[orderData.orderStatus]
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
			}
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
				color: #E07A4F;
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
					background: linear-gradient(90deg, #E07A4F, #6be0e0);
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

	.order-list {
		flex: 1;
		padding: 24rpx 24rpx 24rpx;
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
			align-items: flex-start;
			padding-bottom: 24rpx;
			margin-bottom: 0; 
			border-bottom: none; /* 去掉分割线，用间距代替 */

			.order-info {
				display: flex;
				flex-direction: column;
				gap: 12rpx;
				flex: 1;
				min-width: 0; // 允许内容收缩
			}

			.order-time {
				font-size: 24rpx;
				color: #999;
				background: #f8f9fa;
				padding: 6rpx 16rpx;
				border-radius: 8rpx;
				align-self: flex-start;
			}

			.order-no-wrapper {
				display: flex;
				align-items: center;
				gap: 6rpx;
				padding: 6rpx 16rpx;
				background: #f8f9fa;
				border-radius: 8rpx;
				max-width: 100%;
				align-self: flex-start;
				
				&:active {
					background: #eff0f1;
				}
			}

			.order-no-label {
				font-size: 22rpx;
				color: #999;
				flex-shrink: 0;
			}

			.order-no {
				font-size: 22rpx;
				color: #999;
				word-break: break-all;
				flex: 1;
				min-width: 0;
			}

			.order-status {
				font-size: 24rpx;
				padding: 8rpx 20rpx;
				border-radius: 100rpx;
				font-weight: 500;
				
				&.status-pending {
					color: #E8A84C;
					background: rgba(255, 153, 0, 0.08);
				}
				&.status-accepted {
					color: #2979ff;
					background: rgba(41, 121, 255, 0.08);
				}
				&.status-serving {
					color: #5AAB7A;
					background: rgba(10, 193, 96, 0.08);
				}
				&.status-shipping {
					color: #5AAB7A;
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
				&.status-dispatching {
					color: #fa8c16;
					background: rgba(250, 140, 22, 0.08);
				}
				&.status-verifying {
					color: #5AAB7A;
					background: rgba(82, 196, 26, 0.08);
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
						
						.package-badge {
							display: inline-flex;
							align-items: center;
							gap: 6rpx;
							background: linear-gradient(135deg, #fa8c16 0%, #f57c00 100%);
							color: #fff;
							font-size: 20rpx;
							padding: 6rpx 14rpx;
							border-radius: 100rpx;
							font-weight: 500;
							box-shadow: 0 2rpx 8rpx rgba(250, 140, 22, 0.3);
							
							text {
								line-height: 1;
							}
						}
						
						.voice-badge {
							display: inline-flex;
							align-items: center;
							gap: 6rpx;
							background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
							color: #fff;
							font-size: 20rpx;
							padding: 6rpx 14rpx;
							border-radius: 100rpx;
							font-weight: 500;
							box-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.3);
							cursor: pointer;
							transition: all 0.2s;
							
							&:active {
								transform: scale(0.95);
								opacity: 0.8;
							}
							
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
							
							// 内联核销方式标签
							.inline-method-badge {
								display: inline-flex;
								align-items: center;
								gap: 4rpx;
								padding: 4rpx 12rpx;
								border-radius: 100rpx;
								font-size: 20rpx;
								font-weight: 500;
								margin-left: 12rpx;
								flex-shrink: 0;
								background: linear-gradient(135deg, #5AAB7A 0%, #5AAB7A 100%);
								color: #fff;
								box-shadow: 0 2rpx 6rpx rgba(82, 196, 26, 0.25);
								
								text {
									line-height: 1;
								}
							}
						}
					}
				}
			}
		}

		// 语音下单备注提示框
		.voice-order-remark {
			margin: 0 0 24rpx 0;
			padding: 24rpx;
			background: #f0fafa;
			border-radius: 16rpx;
			border: 1rpx solid rgba(62, 198, 198, 0.1);
			position: relative;
			overflow: hidden;

			&::before {
				content: 'AI 智能匹配';
				position: absolute;
				top: 0;
				right: 0;
				background: rgba(62, 198, 198, 0.1);
				color: #E07A4F;
				font-size: 18rpx;
				padding: 4rpx 12rpx;
				border-bottom-left-radius: 12rpx;
				font-weight: bold;
				letter-spacing: 1rpx;
			}
			
			.remark-detail {
				.remark-item {
					display: flex;
					align-items: flex-start;
					margin-bottom: 16rpx;
					gap: 12rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					uni-icons {
						flex-shrink: 0;
						margin-top: 6rpx;
						background: rgba(62, 198, 198, 0.1);
						padding: 6rpx;
						border-radius: 8rpx;
					}
					
					.remark-value {
						font-size: 26rpx;
						color: #333;
						line-height: 1.6;
						word-break: break-all;
						flex: 1;
						
						&.highlight {
							color: #C96A42;
							font-weight: 500;
							font-size: 28rpx;
							display: block;
							padding: 4rpx 0;
						}

						&.secondary {
							color: #888;
							font-size: 24rpx;
							font-style: italic;
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
					color: #5AAB7A;
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
					color: #D95C5C;
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
					color: #5AAB7A;
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
					transition: all 0.3s ease;
					position: relative;
					overflow: hidden;
					
					&::after {
						border: none;
					}
					
					// 添加按钮点击波纹效果
					&::before {
						content: '';
						position: absolute;
						top: 50%;
						left: 50%;
						width: 0;
						height: 0;
						border-radius: 50%;
						background: rgba(255, 255, 255, 0.3);
						transform: translate(-50%, -50%);
						transition: width 0.6s, height 0.6s;
					}

					&:active {
						transform: scale(0.96);
						
						&::before {
							width: 200rpx;
							height: 200rpx;
						}
					}

					&.primary {
						color: #fff;
						background: linear-gradient(135deg, #E07A4F 0%, #C96A42 100%);
						box-shadow: 0 6rpx 16rpx rgba(62, 198, 198, 0.35);
						border: none;
						
						&:active {
							box-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.25);
						}
					}
					
					&.secondary {
						background: linear-gradient(135deg, #fff 0%, #f8fcfc 100%);
						border: 2rpx solid #E07A4F;
						color: #E07A4F;
						box-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.1);
						
						&:active {
							background: linear-gradient(135deg, #f0fafa 0%, #e6f7f7 100%);
							box-shadow: 0 1rpx 4rpx rgba(62, 198, 198, 0.15);
						}
					}
					
					&.remind, &.review, &.test-ship, &.test-review {
						background: #fff;
						border: 2rpx solid #E07A4F;
						color: #E07A4F;
						box-shadow: 0 2rpx 6rpx rgba(62, 198, 198, 0.08);
					}
					
					&.cancel {
						color: #999;
						background: #fff;
						border: 2rpx solid #e0e0e0;
						box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
						
						&:active {
							background: #f5f5f5;
						}
					}
					
					&.delete {
						color: #D95C5C;
						background: #fff;
						border: 2rpx solid #ffcdd2;
						box-shadow: 0 2rpx 6rpx rgba(255, 85, 85, 0.1);
						
						&:active {
							background: #fff5f5;
						}
					}
					
					&.reviewed {
						color: #999;
						border: 2rpx solid #eee;
						background: #f9f9f9;
						box-shadow: none;
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
</style>
