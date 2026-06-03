<template>
	<view class="sleep-report-container">
		<!-- 简单的加载状态 -->
		<view v-if="isLoading" class="loading-container">
			<text>数据加载中...</text>
		</view>
		
		<!-- 主要内容 -->
		<view v-else class="main-content">
			<!-- 顶部数据区域 -->
			<view class="header-section">
				<view class="header-item">
					<view class="item-title">在床时长</view>
					<view class="item-value">{{sleepReportItem.onbedTimeFormat || '--'}}</view>
				</view>
				<view class="header-item">
					<view class="item-title">睡眠得分</view>
					<view class="item-value">
						{{sleepReportItem.av || sleepReportItem.smzlpf || '--'}}
						<text class="score-status" v-if="sleepReportItem.av || sleepReportItem.smzlpf">
							{{(sleepReportItem.av || sleepReportItem.smzlpf) >= 80 ? '佳' : '不佳'}}
						</text>
					</view>
				</view>
			</view>
			
			<!-- 睡眠状态图表 -->
			<view class="chart-section" v-if="showSleepCanvas">
				<sleepCanvas :sleepDatas="sleepData" :sleepReport="sleepReportItem" />
			</view>
			
			<!-- 底部统计数据 -->
			<view class="stats-section">
				<view class="stat-item">
					<view class="stat-value">{{sleepReportItem.startSleepTimeFormat || '--'}}</view>
					<view class="stat-label">入床时间</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{displayAvgHeartRate}}</view>
					<view class="stat-label">平均心跳</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{sleepReportItem.bk !== undefined ? sleepReportItem.bk : '--'}} 次</view>
					<view class="stat-label">离床次数</view>
				</view>
				<view class="stat-item">
					<view class="stat-value">{{sleepReportItem.bl !== undefined ? sleepReportItem.bl : '--'}} 次</view>
					<view class="stat-label">翻身次数</view>
				</view>
			</view>
			
			<!-- 自动加载所有图表 - 延迟加载避免卡顿 -->
			
			<!-- 深浅睡眠比例图 - 安全版本 -->
			<view class="chart-section" v-if="chartLoaded.sleepRatio">
				<view class="chart-title">睡眠比例图</view>
				<view v-if="!chartError.sleepRatio" class="chart-container">
					<shuimianyuanhuantu :sleepReport="sleepReportItem" />
				</view>
				<view v-else class="chart-error">
					<text>图表加载失败: {{chartError.sleepRatio}}</text>
					<view class="retry-chart-btn" @click="retryChart('sleepRatio')">
						<text>重试</text>
					</view>
				</view>
			</view>
			
			<!-- 呼吸图 -->
			<view class="chart-section" v-if="chartLoaded.breathing">
				<view class="chart-title">呼吸数值</view>
				<view v-if="!chartError.breathing" class="chart-container">
					<huxilvtu :sleepReport="sleepReportItem" :name="'呼吸数值'" />
				</view>
				<view v-else class="chart-error">
					<text>图表加载失败: {{chartError.breathing}}</text>
					<view class="retry-chart-btn" @click="retryChart('breathing')">
						<text>重试</text>
					</view>
				</view>
			</view>
			
			<!-- 心率图 -->
			<view class="chart-section" v-if="chartLoaded.heartRate">
				<view class="chart-title">心率数值</view>
				<view v-if="!chartError.heartRate" class="chart-container">
					<xinlvtu :sleepReport="sleepReportItem" :name="'心率数值'" />
				</view>
				<view v-else class="chart-error">
					<text>图表加载失败: {{chartError.heartRate}}</text>
					<view class="retry-chart-btn" @click="retryChart('heartRate')">
						<text>重试</text>
					</view>
				</view>
			</view>
			
			<!-- 翻身次数图 -->
			<view class="chart-section" v-if="chartLoaded.rollOver">
				<view class="chart-title">翻身次数</view>
				<view v-if="!chartError.rollOver" class="chart-container">
					<huodongztu :sleepReport="sleepReportItem" :name="'翻身次数'" />
				</view>
				<view v-else class="chart-error">
					<text>图表加载失败: {{chartError.rollOver}}</text>
					<view class="retry-chart-btn" @click="retryChart('rollOver')">
						<text>重试</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import shuimianyuanhuantu from '@/pages/my/components/charts/shuimianyuanhuantu.vue'
import huxilvtu from '@/pages/my/components/charts/huxilvtu.vue'
import xinlvtu from '@/pages/my/components/charts/xinlvtu.vue'
import huodongztu from '@/pages/my/components/charts/huodongztu.vue'
import sleepCanvas from '@/pages/my/components/charts/sleep-canvas.vue'

export default {
	name: 'SleepReportInfo',
	components: {
		shuimianyuanhuantu,
		huxilvtu,
		xinlvtu,
		huodongztu,
		sleepCanvas
	},
	data() {
		return {
			isLoading: false,
			sleepReportItem: {},
			sleepData: [],
			showSleepCanvas: false,
			showChartButtons: false,
			timeDisplay: '',
			chartLoaded: {
				sleepRatio: false,
				breathing: false,
				heartRate: false,
				rollOver: false
			},
			chartError: {
				sleepRatio: null,
				breathing: null,
				heartRate: null,
				rollOver: null
			}
		}
	},
	computed: {
		// 简单的计算属性，避免复杂逻辑
		canShowData() {
			return this.sleepReportItem && Object.keys(this.sleepReportItem).length > 0;
		},
		// 显示平均心跳：优先使用bn字段，如果为0则从TenDatas计算
		displayAvgHeartRate() {
			if (this.sleepReportItem.bn && this.sleepReportItem.bn > 0) {
				return this.sleepReportItem.bn;
			}
			// 从TenDatas计算平均心跳
			if (this.sleepReportItem.tenDatas && this.sleepReportItem.tenDatas.length > 0) {
				const heartRates = this.sleepReportItem.tenDatas.map(item => Number(item.bs) || 0).filter(v => v > 0);
				if (heartRates.length > 0) {
					const sum = heartRates.reduce((a, b) => a + b, 0);
					return Math.round(sum / heartRates.length);
				}
			}
			return '--';
		}
	},
	onLoad(param) {
		console.log('进入睡眠详情页面');
		
		// 简单延迟避免阻塞
		setTimeout(() => {
			this.loadData();
		}, 100);
	},
	methods: {
		// 简化的数据加载方法
		loadData() {
			try {
				console.log('开始加载数据...');
				
				// 从Store获取数据
				const storeData = this.$store.getters['getSleepReportItem']();
				
				if (storeData) {
					this.sleepReportItem = storeData;
					console.log('睡眠数据:', storeData);
					console.log('平均心跳字段检查:', {
						'bn字段值': storeData.bn,
						'bn字段类型': typeof storeData.bn,
						'是否为数字': !isNaN(storeData.bn),
						'完整数据键': Object.keys(storeData)
					});
					
					// 处理睡眠数据
					if (storeData.tenDatas && Array.isArray(storeData.tenDatas)) {
						this.sleepData = storeData.tenDatas;
					}
					
					// 简单时间显示
					if (storeData.startSleepTimeFormat && storeData.endSleepTimeFormat) {
						this.timeDisplay = `${storeData.startSleepTimeFormat} ~ ${storeData.endSleepTimeFormat}`;
					}
					
					// 延迟加载图表避免阻塞
					setTimeout(() => {
						this.showSleepCanvas = true;
					}, 200);
					
					// 自动加载所有图表 - 错开时间避免同时渲染卡顿
					this.autoLoadAllCharts();
				}
				
				this.isLoading = false;
				console.log('数据加载完成');
				
			} catch (error) {
				console.error('加载数据失败:', error);
				this.isLoading = false;
			}
		},
		
		// 显示图表选项
		showMoreCharts() {
			console.log('显示图表加载选项');
			this.showChartButtons = true;
		},
		
		// 安全加载单个图表
		loadChart(chartType) {
			console.log('准备加载图表:', chartType);
			
			try {
				// 检查数据是否完整
				if (!this.sleepReportItem || Object.keys(this.sleepReportItem).length === 0) {
					console.error('睡眠数据不完整，无法加载图表');
					uni.showToast({
						title: '数据不完整，无法加载图表',
						icon: 'none'
					});
					return;
				}
				
				// 验证图表所需的特定数据
				if (chartType === 'sleepRatio') {
					console.log('验证睡眠比例数据:', {
						'bg(清醒占比)': this.sleepReportItem.bg,
						'bh(浅睡占比)': this.sleepReportItem.bh,
						'bi(深睡占比)': this.sleepReportItem.bi,
						'旧字段sssczb': this.sleepReportItem.sssczb,
						'旧字段jssczb': this.sleepReportItem.jssczb,
						'旧字段qxsczb': this.sleepReportItem.qxsczb,
						完整数据: this.sleepReportItem
					});
					
					// 检查新字段名
					const hasNewRatioData = this.sleepReportItem.bg !== undefined && 
											this.sleepReportItem.bh !== undefined && 
											this.sleepReportItem.bi !== undefined;
					
					// 检查旧字段名（兼容性）
					const hasOldRatioData = this.sleepReportItem.sssczb !== undefined && 
											this.sleepReportItem.jssczb !== undefined && 
											this.sleepReportItem.qxsczb !== undefined;
					
					if (!hasNewRatioData && !hasOldRatioData) {
						console.error('睡眠比例数据缺失:', {
							'新字段bg': this.sleepReportItem.bg,
							'新字段bh': this.sleepReportItem.bh,
							'新字段bi': this.sleepReportItem.bi,
							'旧字段sssczb': this.sleepReportItem.sssczb,
							'旧字段jssczb': this.sleepReportItem.jssczb,
							'旧字段qxsczb': this.sleepReportItem.qxsczb
						});
						this.chartError[chartType] = `睡眠比例数据缺失 - 新字段(bg:${this.sleepReportItem.bg}, bh:${this.sleepReportItem.bh}, bi:${this.sleepReportItem.bi}) 旧字段(sssczb:${this.sleepReportItem.sssczb}, jssczb:${this.sleepReportItem.jssczb}, qxsczb:${this.sleepReportItem.qxsczb})`;
						return;
					}
				}
				
				// 延迟加载避免阻塞
				setTimeout(() => {
					console.log('开始加载图表:', chartType);
					
					// 使用 try-catch 捕获图表加载错误
					try {
						this.chartLoaded[chartType] = true;
						console.log('图表加载完成:', chartType);
					} catch (chartError) {
						console.error('图表渲染失败:', chartType, chartError);
						this.chartError[chartType] = chartError.message || '图表渲染失败';
						this.chartLoaded[chartType] = false;
					}
				}, 100);
				
			} catch (error) {
				console.error('加载图表失败:', chartType, error);
				this.chartError[chartType] = error.message || '加载失败';
				uni.showToast({
					title: `加载${chartType}图表失败`,
					icon: 'none'
				});
			}
		},
		
		// 重试加载图表
		retryChart(chartType) {
			console.log('重试加载图表:', chartType);
			this.chartError[chartType] = null;
			this.chartLoaded[chartType] = false;
			
			// 延迟后重新加载
			setTimeout(() => {
				this.loadChart(chartType);
			}, 500);
		},
		
		// 自动加载所有图表 - 错开时间防止卡顿
		autoLoadAllCharts() {
			console.log('自动加载所有图表');
			
			// 睡眠比例图 - 800ms后加载
			setTimeout(() => {
				this.loadChart('sleepRatio');
			}, 800);
			
			// 呼吸图 - 1200ms后加载
			setTimeout(() => {
				this.loadChart('breathing');
			}, 1200);
			
			// 心率图 - 1600ms后加载
			setTimeout(() => {
				this.loadChart('heartRate');
			}, 1600);
			
			// 翻身图 - 2000ms后加载
			setTimeout(() => {
				this.loadChart('rollOver');
			}, 2000);
		}
	}
}
</script>

<style lang="scss" scoped>
.sleep-report-container {
	min-height: 100vh;
	background: #152949;
	
	.loading-container, .error-container, .no-data-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 60vh;
		color: #7986a9;
	}
	
	.loading-text, .error-text, .no-data-text {
		font-size: 32rpx;
		margin-bottom: 40rpx;
	}
	
	.retry-btn {
		background: #3cbbfe;
		color: white;
		padding: 20rpx 40rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
		border: none;
	}
	
	.main-content {
		width: 100%;
		
		.header-section {
			display: flex;
			padding: 50rpx 40rpx 30rpx;
			background: #152949;
			
			.header-item {
				flex: 1;
				text-align: center;
				
				.item-title {
					font-size: 30rpx;
					color: #7986a9;
					line-height: 40rpx;
					margin-bottom: 10rpx;
				}
				
				.item-value {
					font-size: 40rpx;
					color: #3cbbfe;
					line-height: 50rpx;
					font-weight: bold;
					
					.score-status {
						font-size: 30rpx;
						color: #7986a9;
						margin-left: 10rpx;
						font-weight: normal;
					}
				}
			}
		}
		
		.time-period {
			text-align: center;
			padding: 20rpx;
			background: #152949;
			position: relative;
			
			.time-text {
				color: #8c98b8;
				font-size: 28rpx;
			}
			
			.deep-sleep-tag {
				display: inline-block;
				background: #8a2be2;
				color: white;
				padding: 10rpx 20rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				margin-top: 20rpx;
				
				.tag-text {
					margin-left: 10rpx;
				}
			}
		}
		
		.chart-section {
			padding: 25rpx 15rpx;
			background: #152949;
			color: #fff;
			margin-bottom: 0;
			
			.chart-loading, .chart-error {
				text-align: center;
				padding: 80rpx 20rpx;
				color: #7986a9;
				font-size: 28rpx;
			}
			
			.chart-error {
				color: #ff6b6b;
			}
		}
		
		.stats-section {
			display: flex;
			flex-wrap: wrap;
			padding: 20rpx 40rpx;
			background: #26395a;
			
			.stat-item {
				width: 50%;
				text-align: center;
				margin: 15rpx 0;
				
				.stat-value {
					font-size: 32rpx;
					color: #8c98b8;
					line-height: 40rpx;
					margin-bottom: 5rpx;
				}
				
				.stat-label {
					font-size: 24rpx;
					color: #525e7c;
					line-height: 30rpx;
				}
			}
		}
		
		.show-more-btn {
			background: #3cbbfe;
			color: white;
			padding: 30rpx;
			margin: 40rpx 20rpx;
			border-radius: 15rpx;
			text-align: center;
			font-size: 30rpx;
			cursor: pointer;
			
			&:active {
				background: #2a9bd8;
			}
		}
		
		.chart-buttons {
			padding: 20rpx;
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
			
			.chart-btn {
				background: #26395a;
				color: white;
				padding: 20rpx 30rpx;
				border-radius: 10rpx;
				text-align: center;
				font-size: 28rpx;
				cursor: pointer;
				flex: 1;
				min-width: 160rpx;
				
				&:active {
					background: #1e2d47;
				}
			}
		}
		
		.chart-title {
			font-size: 32rpx;
			color: #3cbbfe;
			text-align: center;
			margin-bottom: 20rpx;
			font-weight: bold;
		}
		
		.chart-container {
			position: relative;
		}
		
		.retry-chart-btn {
			background: #ff6b6b;
			color: white;
			padding: 15rpx 30rpx;
			border-radius: 8rpx;
			text-align: center;
			font-size: 24rpx;
			margin-top: 20rpx;
			cursor: pointer;
			
			&:active {
				background: #e55555;
			}
		}
	}
}
</style>