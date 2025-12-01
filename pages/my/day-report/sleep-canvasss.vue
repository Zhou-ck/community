<template>
	<view class="chartBox">
	
		<view style="width:100%;text-align: center;font-weight: bold;font-size: 30rpx;">
			<view style="display: flex; justify-content: center; align-items: center;">
				<text style="font-size: 40rpx;">睡眠状态</text>
				<!-- <uni-tooltip content="tooltip显示的内容" placement="left"> -->
					<uni-icons type="help-filled" size="22" color="#bbb" @click="showTip" style="font-weight: lighter;"></uni-icons>
				  <!-- <icon type="info" size="20" color="#bbb" @click="showTip" style="padding: 0 0 0 10rpx;"/> -->
				<!-- </uni-tooltip> -->
			</view>
			<view style="color: #888;font-size:26rpx">({{startTime}}&nbsp;~&nbsp;{{endTime}})</view>
		</view>
		<!-- 睡眠信息展示 -->
		<view class="sleep_info" v-if="Object.keys(touchValue).length != 0">
			<view class="info_box" :style="{'background-color': colors[touchValue.sleepState]}">
				<text class="time_text">{{touchValue.startTime}} - {{touchValue.endTime}}</text>
				<text class="state_text">状态：{{touchValue.sleepStateText}}</text>
			</view>
		</view>
		<view class="sleep_info" v-else>
			<view class="info_box" style="background: rgba(62, 209, 150, 1.0);">
				<text class="time_text" style="color: #000;">{{sss}}</text>
				<text class="state_text" style="color: #000;">睡眠时长</text>
			</view>
		</view>

		<!-- Canvas图表 -->
		<view class="chart-container" style="position: relative;">
			<canvas style="width:100%; height:150px;" canvas-id="canvas" id="canvas"></canvas>
			<!-- 添加位置指示器 -->
			<view v-if="currentSegment" class="position-indicator" :style="{
                    left: currentSegment.rect.x + 'px',
                    width: currentSegment.rect.w + 'px',
                    // backgroundColor: getIndicatorColor(currentSegment.state),
                    backgroundImage: getIndicatorColor(currentSegment.state)
                }">
			</view>
		</view>

		<!-- 时间轴 -->
		<movable-area class="movaBox">
			<movable-view class="movaDot" direction="horizontal" @change="onChange" @touchstart="onTouchStart" @touchend="onTouchEnd">
				<view class="dot_line"></view>
			</movable-view>
		</movable-area>
		
		<!-- 睡眠统计信息 -->
		<view class="sleep_stats" >
			<view class="stat_item" v-for="(status, index) in status" :key="index">
				<view class="color_dot" :style="{'background-color': colors[index]}"></view>
				<text style="width:30px;text-align: center;white-space: nowrap;">{{status}}</text>
				<text class="time">{{calculateDuration(index)}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {formatDate, formatDateMonthDayHourMinute} from '@/utils/getdate.js'
	import {formatSleepCanvasForTenDatasss} from '@/utils/handleSleepReport.js'
	import { throttle } from 'lodash';
	
	export default {
		props: {
		  sleepDatas: {
		    type: Array,
		    required: true,
		    default: [] // 设置默认值为空对象
		  }/* ,
		  startTimeStamp:{
			  type: Number,
			  required: true,
			  default: new Date().getTime() // 设置默认值为空对象
		  },
		  endTimeStamp:{
			  type: Number,
			  required: true,
			  default: new Date().getTime() // 设置默认值为空对象
		  } */
		},
		watch:{
			sleepDatas(newValue,oldValue){
				// console.log(newValue);
				
				//1.按时间戳排序
				let a = [...this.sleepDatas].sort((a, b) => a.timeStamp - b.timeStamp);

				//3.整理数据为对应格式
				this.formatSleepData();
				
				//4.调用画布
				this.init();
				
				
			}
		},
		data() {
			return {
				sleepData: [/* {
						startTime: "2024-09-18 23:35:42",
						endTime: "2024-09-18 23:41:43",
						startTimestamp: 1726673742000,
						endTimestamp: 1726674103000,
						state: 2
					}
				 */],
				/* colors: ["#ffb908", "#ff9b0e", "#df6aff", "#8307ff"],
				status: ["清醒", "REM", "浅睡", "深睡"], */
				colors: ["#ffb908", "#ff9b0e", "#df6aff", "#8307ff"],
				status: ["离床", "清醒", "浅睡", "深睡"],
				statusTime: ["", "", "", ""],
				touchValue: {},
				width: 0,
				height: 0,
				radius: 3,
				_lastDrawData: null,
				isDrawing: false,
				canvasContext: null,
				currentSegment: null,
				chartData: []
			};
		},
		computed:{
			sss(){
				const totalDuration = this.sleepData.reduce((acc, curr) => {
					if (curr.state === 2 || curr.state === 3) {
						return acc + (curr.endTimestamp - curr.startTimestamp);
					}
					return acc;
				}, 0);
				const hours = Math.floor(totalDuration / (1000 * 60 * 60));
				let minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
				const second = Math.round(((totalDuration % (1000 * 60 * 60)) % (1000 * 60)/ 1000));
				if(second>=60 || second >0) {
					minutes += 1
				};
				// console.log(second);
				return `${hours}小时${minutes}分钟`;
			},
			startTime(){
				// console.log(this.sleepData);
				let r = '';
				if(this.sleepData.length == 0) return `${r}`;
				r = formatDateMonthDayHourMinute(new Date(this.sleepData[0].startTimestamp));
				return `${r}`;
			},
			endTime(){
				// console.log(this.sleepData);
				
				let r = '';
				if(this.sleepData.length == 0) return `${r}`;
				r = formatDateMonthDayHourMinute(new Date(this.sleepData[this.sleepData.length-1].endTimestamp));
				return `${r}`;
			}
		},
		async mounted() {
			try {
				await this.getWidthAndHeight();
				this.canvasContext = uni.createCanvasContext('canvas', this);
				//3.整理数据为对应格式
				this.formatSleepData();
				//4.调用画布
				// this.init();
			} catch (error) {
				console.error('Canvas初始化失败:', error);
			}
		},

		methods: {
			
			/** 将格式化睡眠数据为对应的格式 al属性（0-1-2） */
			formatSleepData(){
				this.touchValue = {};
				this.currentSegment = null;
				
				// 验证数据
				if (!this.sleepDatas || !Array.isArray(this.sleepDatas) || this.sleepDatas.length === 0) {
					console.warn('[sleep-canvasss] sleepDatas is empty or invalid:', this.sleepDatas);
					this.sleepData = [];
					return;
				}
				
				// console.log(this.sleepDatas);
				this.sleepData = formatSleepCanvasForTenDatasss(this.sleepDatas);
				// console.log(this.sleepData);
				this.init();
			},
			
			
			/** 获取画布的宽高 */
			getWidthAndHeight() {
				return new Promise((resolve, reject) => {
					const query = uni.createSelectorQuery().in(this);
					query.select('#canvas')
						.boundingClientRect(result => {
							if (result) {
								this.width = result.width || 300;
								this.height = result.height || 150;

								if (this.width < 100 || this.height < 100) {
									console.warn('Canvas尺寸可能不合理，使用默认值');
									this.width = Math.max(this.width, 300);
									this.height = Math.max(this.height, 150);
								}
								resolve(true);
							} else {
								reject(new Error('获取Canvas尺寸失败'));
							}
						})
						.exec();
				});
			},

			/**  */
			init() {
				// let yValue = [this.height - 110, this.height - 80, this.height - 50, this.height - 20];
				let yValue = [this.height - 110, this.height - 80, this.height - 50, this.height - 20];
				// let yValue = [离床, 清醒, 浅睡, 深睡];
				let xValue = 0;
				// console.log( JSON.parse(JSON.stringify(this.sleepData)));
				// 计算每个区间的原始宽度
				let originalWidths = this.sleepData.map(item => {
					return item.endTimestamp - item.startTimestamp;
				});
				// console.log(originalWidths);
				// 计算总的原始宽度
				let totalOriginalWidth = originalWidths.reduce((sum, width) => sum + width, 0);

				// 计算缩放比例（留出一些边距）
				let availableWidth = this.width * 0.95;
				let scaleRatio = availableWidth / totalOriginalWidth;

				// console.log(availableWidth,scaleRatio,totalOriginalWidth);

				// 计算每个区间的矩形参数
				for (let index = 0; index < this.sleepData.length; index++) {
					let item = this.sleepData[index];
					let yHeight = this.height * 0.13;

					// let xWidth = Math.max(3, Math.floor((item.endTimestamp - item.startTimestamp) * scaleRatio));
					let xWidth = Math.max(1.5, Math.floor((item.endTimestamp - item.startTimestamp) * scaleRatio));
					let state = item.state;//深睡、浅睡、清醒、离床 状态

					item.rect = {
						x: xValue,//x轴起始位置(图)
						y: yValue[state],//y轴起始位置(图)
						w: xWidth,//x轴画多长(图)
						h: yHeight//y轴画多长(图)
					};

					if (index < this.sleepData.length - 1) {
						let nextState = this.sleepData[index + 1].state;
						item.line = {
							x1: xValue + xWidth,//x轴起始位置(线)
							y1: yValue[state] + (state > nextState ? yHeight - this.radius : this.radius),//y轴起始位置(线)
							x2: xValue + xWidth,//x轴画多长(线)
							y2: yValue[nextState] + (state > nextState ? this.radius : yHeight - this.radius)//y轴画多长(线)
						};
					}
					xValue += xWidth;
				}

				// 处理圆角和连接线
				for (let index = 0; index < this.sleepData.length; index++) {
					let item = this.sleepData[index];
					let upOne = index > 0 ? this.sleepData[index - 1] : null;
					let nextOne = index < this.sleepData.length - 1 ? this.sleepData[index + 1] : null;

					item.left = upOne ? upOne.state < item.state : false;
					item.right = nextOne ? item.state > nextOne.state : false;
				}

				//画图
				this.draft();
			},

			draft() {
				if (this.isDrawing) return;
				this.isDrawing = true;

				try {
					const currentData = JSON.stringify(this.sleepData);
					// console.log(this._lastDrawData === currentData , !this.touchValue.touchX);
					if (this._lastDrawData === currentData && !!this.touchValue.touchX) {
						this.isDrawing = false;
						return;
					}
					this._lastDrawData = currentData;

					const context = this.canvasContext;
					if (!context) {
						throw new Error('Canvas context未初始化');
					}

					context.clearRect(0, 0, this.width, this.height);//清除画布上在该矩形区域内的内容

					const gradientStartY = Math.max(0, this.height - 110);
					const gradientEndY = Math.max(0, this.height - 20);
					const gg = context.createLinearGradient(0, gradientStartY, 0, gradientEndY);

					try {
						gg.addColorStop(0, this.colors[0]);
						gg.addColorStop(0.33, this.colors[1]);
						gg.addColorStop(0.66, this.colors[2]);
						gg.addColorStop(1, this.colors[3]);
					} catch (error) {
						console.error('渐变设置失败:', error);
					}

					context.setLineWidth(0.3);
					context.setStrokeStyle(gg);
					context.setFillStyle(gg);

					this.drawSleepData(context);

					context.draw(true, () => {
						this.isDrawing = false;
					});
				} catch (error) {
					console.error('绘制失败:', error);
					this.isDrawing = false;
				}
			},

			drawSleepData(context) {
				for (let index = 0; index < this.sleepData.length; index++) {
					const item = this.sleepData[index];
					if (!item?.rect) continue;

					context.beginPath();
					//画图
					this.drawRectangle(
						context,
						item.rect.x,
						item.rect.y,
						item.rect.w,
						item.rect.h,
						item.left,
						item.right
					);
					context.fill();

					//画线
					if (index < this.sleepData.length - 1 && item.line) {
						context.beginPath();
						context.moveTo(item.line.x1, item.line.y1);
						context.lineTo(item.line.x2, item.line.y2);
						context.stroke();
					}
				}

				if (this.touchValue?.touchX) {
					const gline = context.createLinearGradient(0, 0, 0, this.height);
					gline.addColorStop(0, 'rgba(241,244,245,0)');
					gline.addColorStop(0.5, 'rgba(241,244,245,1)');
					gline.addColorStop(1, 'rgba(241,244,245,0)');

					context.setStrokeStyle(gline);
					context.setFillStyle(gline);
					context.fillRect(this.touchValue.touchX, 0, 0.5, this.height);
					context.fill();
				}
			},

			/** 画图(含圆角设置) */
			drawRectangle(context, x, y, width, height, left, right) {
				let rset = this.radius;
				if (width < this.radius * 2) {
					// console.log(width,this.radius * 2);
					rset = width / 2;
				}

				let lr = left ? -1 * rset : rset;
				let rr = right ? -1 * rset : rset;

				let arr = [];
				arr.push([x + rset, y + lr, Math.PI, left ? Math.PI / 2 : Math.PI * 3 / 2]);
				arr.push([x + width - rset, y]);
				arr.push([x + width - rset, y + rr, right ? Math.PI / 2 : Math.PI * 3 / 2, 0]);
				arr.push([x + width, y + height + rr]);
				arr.push([x + width - rset, y + height + rr, 0, right ? Math.PI / 2 : Math.PI * 3 / 2]);
				arr.push([x + rset, y + height]);
				arr.push([x + rset, y + height + lr, left ? Math.PI / 2 : Math.PI * 3 / 2, Math.PI]);
				arr.push([x, y + rr]);

				context.beginPath();

				context.arc(arr[0][0], arr[0][1], rset, arr[0][2], arr[0][3], left);
				context.lineTo(arr[1][0], arr[1][1]);
				context.arc(arr[2][0], arr[2][1], rset, arr[2][2], arr[2][3], right);
				context.lineTo(arr[3][0], arr[3][1]);
				context.arc(arr[4][0], arr[4][1], rset, arr[4][2], arr[4][3], !right);
				context.lineTo(arr[5][0], arr[5][1]);
				context.arc(arr[6][0], arr[6][1], rset, arr[6][2], arr[6][3], !left);
				context.lineTo(arr[7][0], arr[7][1]);

				context.closePath();
			},
			
			/** 计算 深睡、浅睡、清醒、离床 的时间 */
			calculateDuration(state) {
				// console.log(state);
				const totalDuration = this.sleepData.reduce((acc, curr) => {
					if (curr.state === state) {
						return acc + (curr.endTimestamp - curr.startTimestamp);
					}
					return acc;
				}, 0);
				let hours = Math.floor(totalDuration / (1000 * 60 * 60));
				let minutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
				let second = Math.round(((totalDuration % (1000 * 60 * 60)) % (1000 * 60)/ 1000));
				if(second==60){
					second = 0;
					minutes++;
				}
				if(minutes==60){
					minutes = 0;
					hours++;
				}
				return `${hours}小时${minutes}分钟${second}秒`;
			},

			onTouchStart() {
				this.$emit('touchstart');
			},

			onTouchEnd() {
				this.$emit('touchend');
				this.touchValue = {};
				this.currentSegment = null;
			},

			onChange(e) {
				// console.log(this.currentSegment);
				if (!this.sleepData.length) return;
				this.handleSleepcharts(e);
				this.$emit('change', this.touchValue);
			}, // 每隔 200ms 执行一次

			handleSleepcharts(e) {
				const movableAreaWidth = this.width;
				const dotWidth = 30; // movaDot的宽度（rpx转px）
				const effectiveWidth = movableAreaWidth - dotWidth;

				// 计算相对于图表的实际位置
				const touchX = (e.detail.x / effectiveWidth) * this.width;

				// 查找当前位置对应的睡眠段
				let found = false;
				this.sleepData.forEach(item => {
					if (touchX >= item.rect.x && touchX <= item.rect.x + item.rect.w && !found) {
						found = true;
						this.currentSegment = item; // 更新当前段
						this.touchValue = {
							startTime: this.formatTime(item.startTime),
							endTime: this.formatTime(item.endTime),
							sleepState: item.state,
							sleepStateText: this.status[item.state],
							touchX: touchX
						};
					}
				});

				if (!found) {
					this.currentSegment = null;
				}

				// this.draft(); // 重绘以显示指示线
			},

			formatTime(timeString) {
				// console.log(timeString);
				const date = new Date(timeString);
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			},

			// 获取指示器颜色
			getIndicatorColor(state) {
				// console.log(state);
				// 将16进制颜色转换为rgba格式，添加0.3的透明度
				const hexColor = this.colors[state];
				const r = parseInt(hexColor.slice(1, 3), 16);
				const g = parseInt(hexColor.slice(3, 5), 16);
				const b = parseInt(hexColor.slice(5, 7), 16);
				// return `rgba(${r}, ${g}, ${b}, 0.3)`;
				// background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);
				if(state == 3){
					//深睡
					return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.1) 0%, rgba(${r}, ${g}, ${b}, 0.3) 5%, rgba(${r}, ${g}, ${b}, 0.3) 20%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
				}else if(state == 2){
					//浅睡
					return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.1) 0%, rgba(${r}, ${g}, ${b}, 0.3) 20%, rgba(${r}, ${g}, ${b}, 0.3) 30%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
				}else if(state == 1){
					//清醒
					return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.1) 0%, rgba(${r}, ${g}, ${b}, 0.3) 40%, rgba(${r}, ${g}, ${b}, 0.3) 50%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
				}else if(state == 0){
					//离床
					return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.1) 0%, rgba(${r}, ${g}, ${b}, 0.3) 60%, rgba(${r}, ${g}, ${b}, 0.3) 70%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
				}else{
					//其它
					return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.3) 0%, rgba(${r}, ${g}, ${b}, 0.1) 100%)`;
				}
				
			},
			
			//文字提示
			showTip(){
				uni.showModal({
					title: '睡眠状态说明',
					showCancel: false,
					confirmText: `我知道了`,
					content: '此处仅显示处于 T-1日20:00:00~T日09:00:00 间的睡眠状态,若需查看更多请查看各段睡眠报告^v^',
					success: function (res) {
						if (res.confirm) {
							// console.log('用户点击确定');
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			}
		}
	};
</script>

<style>
	.chartBox {
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
		padding: 30rpx 40rpx;
		/* margin: 10rpx; */
	}

	.sleep_stats {
		display: flex;
		justify-content: space-around;
		margin-bottom: 20rpx;
		flex-wrap: wrap;
	}

	.stat_item {
		display: flex;
		width: 42%;
		align-items: center;
		margin: 10rpx 0;
	}

	.color_dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		margin-right: 8rpx;
	}

	.time {
		font-size: 24rpx;
		color: #666;
		margin-left: 8rpx;
		white-space: nowrap;
	}

	.sleep_info {
		display: flex;
		justify-content: center;
		margin: 20rpx 0;
	}

	.info_box {
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.time_text {
		color: #ffffff;
		font-size: 28rpx;
		font-weight: bold;
	}

	.state_text {
		color: #ffffff;
		font-size: 24rpx;
		margin-top: 4rpx;
	}

	.movaBox {
		width: 100%;
		height: 18px;
		margin: 30rpx 5rpx;
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 18px;
		position: relative;
	}

	.movaDot {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background-color: #ffffff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: transform 0.1s;
	}

	.movaDot:active {
		transform: scale(1.1);
	}

	.dot_line {
		width: 2rpx;
		height: 20rpx;
		background-color: #666;
	}

	.position-indicator {
		position: absolute;
		top: 0;
		height: 150px;
		pointer-events: none;
		transition: all 0.3s ease;
	}

	.chart-container {
		position: relative;
		width: 100%;
		height: 150px;
	}
</style>