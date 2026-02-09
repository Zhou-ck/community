<template>
	<view class="notice-page">
		<!-- 搜索栏（固定） -->
		<view class="search-container">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input 
					class="search-input" 
					v-model="searchKeyword" 
					placeholder="搜索公告标题或内容"
					@input="onSearchInput"
					@confirm="handleSearch"
				/>
				<uni-icons 
					v-if="searchKeyword" 
					type="clear" 
					size="16" 
					color="#999" 
					@click="clearSearch"
				></uni-icons>
			</view>
		</view>

		<!-- 公告列表（可滚动+下拉刷新） -->
		<scroll-view 
			class="notice-list" 
			scroll-y
			refresher-enabled
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
		>
			<view 
				class="notice-card" 
				v-for="(item, index) in filteredNoticeList" 
				:key="index"
				@click="viewNoticeDetail(item)"
			>
				<view class="notice-header">
					<view class="notice-icon">
						<uni-icons type="sound-filled" size="20" color="#ff6b35"></uni-icons>
					</view>
					<view class="notice-title">{{ item.title }}</view>
				</view>
				<view class="notice-content">{{ formatContent(item.content) }}</view>
				<view class="notice-footer">
					<text class="notice-time">{{ item.time }}</text>
					<view class="notice-tag" :class="{ important: item.important }">
						{{ item.important ? '重要' : '普通' }}
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="filteredNoticeList.length === 0 && !loading" class="empty-state">
				<text class="iconfontB icon-yonghupingjia empty-icon"></text>
				<text class="empty-text">{{ searchKeyword ? '未找到相关公告' : '暂无公告通知' }}</text>
			</view>
			
			<!-- 底部占位 -->
			<view style="height: 40rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { listNotice } from '@/api/notice.js'
	
	export default {
		data() {
			return {
				statusBarHeight: 0,
				searchKeyword: '',
				showDetailModal: false,
				currentNotice: null,
				searchTimer: null,
				noticeList: [],
				loading: false,
				isRefreshing: false,
				queryParams: {
					pageNum: 1,
					pageSize: 20
				}
			}
		},
		computed: {
			filteredNoticeList() {
				if (!this.searchKeyword) {
					return this.noticeList
				}
				const keyword = this.searchKeyword.toLowerCase()
				return this.noticeList.filter(item => {
					return item.title.toLowerCase().includes(keyword) || 
						   item.content.toLowerCase().includes(keyword)
				})
			}
		},
		onLoad() {
			// 获取系统状态栏高度
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight || 0
			this.getNoticeList()
		},
		methods: {
			// 获取公告列表
			async getNoticeList() {
				this.loading = true
				try {
					const res = await listNotice(this.queryParams)
					if (res.code === 200) {
						this.noticeList = (res.rows || []).map(item => ({
							id: item.noticeId,
							title: item.noticeTitle,
							content: item.noticeContent,
							time: item.createTime,
							important: item.noticeType === '1' // 1-通知 2-公告，可根据实际调整
						}))
					}
				} catch (e) {
					console.error('获取公告列表失败:', e)
					uni.showToast({
						title: '获取公告失败',
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
				await this.getNoticeList()
			},

			// 搜索输入
			onSearchInput() {
				// 防抖处理
				if (this.searchTimer) {
					clearTimeout(this.searchTimer)
				}
				this.searchTimer = setTimeout(() => {
					this.handleSearch()
				}, 300)
			},

			// 执行搜索
			handleSearch() {
				console.log('搜索关键词:', this.searchKeyword)
				// 搜索逻辑已在 computed 中实现
			},

			// 清除搜索
			clearSearch() {
				this.searchKeyword = ''
			},

			// 格式化内容，去除HTML标签并处理换行
			formatContent(content) {
				if (!content) return ''
				// 将<p>、<br>等标签转换为换行，然后去除其他HTML标签
				return content
					.replace(/<\/p>/gi, '\n')
					.replace(/<p[^>]*>/gi, '')
					.replace(/<br\s*\/?>/gi, '\n')
					.replace(/<[^>]+>/g, '')
					.replace(/&nbsp;/g, ' ')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&amp;/g, '&')
					.replace(/\n\s*\n/g, '\n')
					.trim()
			},

			// 查看公告详情
			viewNoticeDetail(notice) {
				uni.navigateTo({
					url: `/pages/server/notice/detail?item=${encodeURIComponent(JSON.stringify(notice))}`
				})
			},

			// 关闭详情弹窗
			// closeDetailModal() {
			// 	this.showDetailModal = false
			// 	this.currentNotice = null
			// }
		},
		onUnload() {
			// 清除定时器
			if (this.searchTimer) {
				clearTimeout(this.searchTimer)
				this.searchTimer = null
			}
		}
	}
</script>

<style lang="scss" scoped>
@import '@/static/fontB/iconfont.css';

.notice-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #f0f4f7 0%, #f8f9fa 100%);
}

/* 搜索栏 */
.search-container {
	background: linear-gradient(180deg, #f0f4f7 0%, rgba(240, 244, 247, 0.95) 100%);
	padding: 24rpx;
}

.search-box {
	display: flex;
	align-items: center;
	height: 80rpx;
	background: #fff;
	border-radius: 40rpx;
	padding: 0 32rpx;
	gap: 16rpx;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

	&:active {
		transform: scale(0.995);
		box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.1);
	}
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333;
	height: 100%;

	&::placeholder {
		color: #bbb;
	}
}

/* 公告列表 */
.notice-list {
	height: calc(100vh - 128rpx);
	padding: 0 24rpx;
	box-sizing: border-box;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.notice-card {
	background: #fff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	animation: slideUp 0.5s ease backwards;

	@for $i from 1 through 10 {
		&:nth-child(#{$i}) {
			animation-delay: #{$i * 0.05}s;
		}
	}

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 8rpx;
		height: 100%;
		background: #f0f0f0;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	&:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
}

.notice-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.notice-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #fff5f2 0%, #ffece6 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.notice-title {
	flex: 1;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.4;
}

.notice-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 24rpx;
	padding-left: 84rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

.notice-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-left: 84rpx;
}

.notice-time {
	font-size: 24rpx;
	color: #999;
}

.notice-tag {
	padding: 6rpx 20rpx;
	border-radius: 100rpx;
	font-size: 22rpx;
	font-weight: 500;
	background: #f5f7fa;
	color: #666;
	transition: all 0.3s ease;

	&.important {
		background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
		color: #fff;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.2);
	}
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 150rpx 0;
}

.empty-icon {
	font-size: 96rpx;
	color: #ccc;
	opacity: 0.6;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	margin-top: 20rpx;
}

/* 详情弹窗 */
/* 已改为跳转详情页，样式移除 */
</style>
