<template>
	<view class="notice-page">
		<!-- 搜索栏 -->
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

		<!-- 公告列表 -->
		<view class="notice-list">
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
				<view class="notice-content">{{ item.content }}</view>
				<view class="notice-footer">
					<text class="notice-time">{{ item.time }}</text>
					<view class="notice-tag" :class="{ important: item.important }">
						{{ item.important ? '重要' : '普通' }}
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="filteredNoticeList.length === 0" class="empty-state">
				<text class="iconfontB icon-yonghupingjia empty-icon"></text>
				<text class="empty-text">{{ searchKeyword ? '未找到相关公告' : '暂无公告通知' }}</text>
			</view>
		</view>

		<!-- 公告详情弹窗 -->
		<!-- 已改为跳转详情页 -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 0,
				searchKeyword: '',
				showDetailModal: false,
				currentNotice: null,
				searchTimer: null,
				noticeList: [
					{
						id: 1,
						title: '社区养老服务中心新增康复理疗项目',
						content: '为更好地服务社区老年人，我中心新增康复理疗项目，包括推拿、艾灸、理疗等服务，欢迎广大居民咨询预约。服务时间：周一至周五 9:00-17:00。',
						time: '2024-11-20 10:30',
						important: true
					},
					{
						id: 2,
						title: '关于开展社区健康体检活动的通知',
						content: '为关爱社区居民身体健康，将于12月1日-12月15日开展免费健康体检活动，请符合条件的居民携带身份证到社区服务中心登记预约。',
						time: '2024-11-18 14:20',
						important: true
					},
					{
						id: 3,
						title: '助餐服务时间调整通知',
						content: '因厨房设备升级改造，助餐服务时间临时调整为11:00-13:00，17:00-19:00，给您带来的不便敬请谅解。',
						time: '2024-11-15 09:15',
						important: false
					},
					{
						id: 4,
						title: '社区图书室新书上架通知',
						content: '社区图书室近期新增图书200余册，涵盖文学、历史、养生等多个类别，欢迎居民前来借阅。借阅时间：周一至周日 8:00-20:00。',
						time: '2024-11-12 16:45',
						important: false
					},
					{
						id: 5,
						title: '冬季用电用气安全提醒',
						content: '冬季来临，请注意用电用气安全：1.定期检查电线、插座；2.使用合格的电热设备；3.保持室内通风；4.燃气使用后及时关闭阀门。',
						time: '2024-11-10 11:00',
						important: true
					},
					{
						id: 6,
						title: '社区文化活动中心开放时间调整',
						content: '自11月1日起，社区文化活动中心开放时间调整为：周一至周日 8:00-21:00，节假日照常开放。',
						time: '2024-10-28 10:00',
						important: false
					},
					{
						id: 7,
						title: '关于更换智能门禁系统的通知',
						content: '为提升社区安全管理水平，将于12月中旬更换智能门禁系统，届时需要居民重新录入人脸信息，具体时间另行通知。',
						time: '2024-10-25 15:30',
						important: false
					},
					{
						id: 8,
						title: '社区志愿者招募通知',
						content: '社区现招募志愿者若干名，主要协助开展社区活动、帮扶困难群众等工作，有意者请到社区服务中心报名。',
						time: '2024-10-20 09:00',
						important: false
					}
				]
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
		},
		methods: {

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
	background: rgba(240, 244, 247, 0.95);
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
	padding: 0 24rpx 40rpx;
	min-height: calc(100vh - 180rpx);
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
