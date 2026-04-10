<template>
	<view class="institution-page">
		<!-- 顶部搜索区域 -->
		<view class="search-header">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999"></uni-icons>
				<input class="search-input" type="text" placeholder="搜索养老机构" placeholder-style="color: #999"
					v-model="keyword" />
			</view>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-tabs">
			<view class="tab-item" :class="{ active: currentFilter === index }" v-for="(tab, index) in filterTabs"
				:key="index" @click="handleFilterChange(index)">
				<text>{{ tab.name }}</text>
				<uni-icons v-if="index > 0" :type="currentFilter === index ? 'arrowdown' : 'arrowdown'" size="12"
					:color="currentFilter === index ? '#2196F3' : '#666'"></uni-icons>
			</view>
		</view>

		<!-- 机构列表 -->
		<view class="institution-list">
			<view class="institution-card" v-for="(item, index) in institutionList" :key="index"
				@click="toDetail(item)">
				<view class="card-left">
					<image :src="item.image" mode="aspectFill" class="card-image"></image>
					<view class="type-tag" :class="item.type === '公立' ? 'public' : 'private'">
						{{ item.type }}
					</view>
				</view>

				<view class="card-right">
					<view class="header-row">
						<text class="title">{{ item.name }}</text>
						<text class="distance">{{ item.distance }}km</text>
					</view>

					<view class="rating-row">
						<view class="stars">
							<uni-icons type="star-filled" size="14" color="#FF9800" v-for="n in 5" :key="n"
								v-if="n <= Math.floor(item.rating)"></uni-icons>
							<uni-icons type="star-filled" size="14" color="#E0E0E0" v-for="n in 5" :key="n + 5"
								v-if="n > Math.floor(item.rating)"></uni-icons>
						</view>
						<text class="score">{{ item.rating }}分</text>
						<text class="comments">{{ item.commentCount }}条评价</text>
					</view>

					<view class="info-row">
						<text class="label">床位:</text>
						<text class="value">{{ item.beds }}张</text>
						<view class="divider"></view>
						<text class="label">入住率:</text>
						<text class="value">{{ item.occupancyRate }}</text>
					</view>

					<view class="price-row">
						<view class="price-box">
							<text class="currency">¥</text>
							<text class="price">{{ item.minPrice }}</text>
							<text class="unit">起/月</text>
						</view>
					</view>

					<view class="tags-row">
						<view class="tag" v-for="(tag, tIndex) in item.tags" :key="tIndex">
							{{ tag }}
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="institutionList.length === 0" class="empty-state">
				<uni-icons type="info" size="50" color="#ccc"></uni-icons>
				<text>暂无相关机构</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				currentFilter: 0,
				filterTabs: [{
						name: '综合排序'
					},
					{
						name: '距离最近'
					},
					{
						name: '价格最低'
					},
					{
						name: '评分最高'
					}
				],
				// 模拟数据
				institutionList: [{
						id: 1,
						name: '夕阳红康养中心',
						image: 'https://www.aigather.katlot.cn/sourcePic/photo/1.jpg',
						type: '公立',
						rating: 4.8,
						commentCount: 128,
						distance: 1.2,
						beds: 300,
						occupancyRate: '95%',
						minPrice: 3500,
						tags: ['医养结合', '医保定点', '24h看护']
					},
					{
						id: 2,
						name: '金色年华护理院',
						image: 'https://www.aigather.katlot.cn/sourcePic/photo/4.png',
						type: '民办',
						rating: 4.5,
						commentCount: 86,
						distance: 3.5,
						beds: 500,
						occupancyRate: '80%',
						minPrice: 4800,
						tags: ['高端护理', '康复训练', '园林式']
					},
					{
						id: 3,
						name: '幸福社区养老院',
						image: 'https://www.aigather.katlot.cn/sourcePic/photo/5.jpg',
						type: '公立',
						rating: 4.2,
						commentCount: 56,
						distance: 0.8,
						beds: 120,
						occupancyRate: '90%',
						minPrice: 2800,
						tags: ['社区嵌入', '日间照料', '性价比高']
					},
					{
						id: 4,
						name: '仁爱老年公寓',
						image: 'https://www.aigather.katlot.cn/sourcePic/photo/6.png',
						type: '民办',
						rating: 4.9,
						commentCount: 203,
						distance: 5.6,
						beds: 800,
						occupancyRate: '85%',
						minPrice: 6000,
						tags: ['五星级', '国际标准', '失智照护']
					}
				]
			}
		},
		methods: {
			handleFilterChange(index) {
				this.currentFilter = index;
				uni.showToast({
					title: `按${this.filterTabs[index].name}筛选`,
					icon: 'none'
				});
				// 实际开发中这里会调用接口重新排序
			},
			toDetail(item) {
				uni.showToast({
					title: `查看：${item.name}`,
					icon: 'none'
				});
				// uni.navigateTo({
				// 	url: `/pages/server/institution/detail?id=${item.id}`
				// })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.institution-page {
		min-height: 100vh;
		background-color: #f5f7fa;
		padding-bottom: 40rpx;
	}

	.search-header {
		background-color: #fff;
		padding: 20rpx 30rpx;
		position: sticky;
		top: 0;
		z-index: 100;

		.search-box {
			background-color: #f5f7fa;
			border-radius: 36rpx;
			height: 72rpx;
			display: flex;
			align-items: center;
			padding: 0 24rpx;
			gap: 12rpx;

			.search-input {
				flex: 1;
				font-size: 28rpx;
				color: #333;
			}
		}
	}

	.filter-tabs {
		display: flex;
		background-color: #fff;
		padding: 20rpx 0;
		margin-bottom: 20rpx;
		border-top: 1rpx solid #f5f5f5;

		.tab-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #666;
			gap: 4rpx;

			&.active {
				color: #2196F3;
				font-weight: 500;
			}
		}
	}

	.institution-list {
		padding: 0 24rpx;
	}

	.institution-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		display: flex;
		gap: 24rpx;

		.card-left {
			width: 200rpx;
			height: 200rpx;
			border-radius: 12rpx;
			overflow: hidden;
			position: relative;
			flex-shrink: 0;

			.card-image {
				width: 100%;
				height: 100%;
			}

			.type-tag {
				position: absolute;
				top: 0;
				left: 0;
				padding: 4rpx 12rpx;
				font-size: 20rpx;
				color: #fff;
				border-bottom-right-radius: 12rpx;

				&.public {
					background: linear-gradient(135deg, #4CAF50, #81C784);
				}

				&.private {
					background: linear-gradient(135deg, #FF9800, #FFB74D);
				}
			}
		}

		.card-right {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.header-row {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;

				.title {
					font-size: 30rpx;
					font-weight: bold;
					color: #333;
					line-height: 1.4;
					flex: 1;
					margin-right: 16rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1;
					overflow: hidden;
				}

				.distance {
					font-size: 22rpx;
					color: #999;
					flex-shrink: 0;
					margin-top: 4rpx;
				}
			}

			.rating-row {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.stars {
					display: flex;
				}

				.score {
					font-size: 26rpx;
					color: #FF9800;
					font-weight: bold;
				}

				.comments {
					font-size: 22rpx;
					color: #999;
					margin-left: 8rpx;
				}
			}

			.info-row {
				display: flex;
				align-items: center;
				font-size: 24rpx;
				color: #666;

				.divider {
					width: 2rpx;
					height: 20rpx;
					background-color: #eee;
					margin: 0 12rpx;
				}
				
				.label {
					color: #999;
					margin-right: 4rpx;
				}
			}

			.price-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				
				.price-box {
					color: #ff4d4f;
					
					.currency {
						font-size: 24rpx;
					}
					
					.price {
						font-size: 36rpx;
						font-weight: bold;
						margin: 0 2rpx;
					}
					
					.unit {
						font-size: 22rpx;
						color: #999;
					}
				}
			}

			.tags-row {
				display: flex;
				flex-wrap: wrap;
				gap: 8rpx;

				.tag {
					font-size: 20rpx;
					color: #2196F3;
					background-color: #E3F2FD;
					padding: 2rpx 10rpx;
					border-radius: 6rpx;
				}
			}
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		color: #999;
		gap: 20rpx;
		font-size: 28rpx;
	}
</style>
