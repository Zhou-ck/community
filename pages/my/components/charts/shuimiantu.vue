<template>
		<view style="width: 670rpx;margin: 0 auto;">
			<!-- Canvas 画布，用于绘制图表 -->
			<canvas canvas-id="tu" style="width: 670rpx; height: 400rpx;background: #152949;margin: 0 auto;"v-if="!!chartData.length"></canvas>
			<view class="tuli" v-if="!!sleepReport.deepSleepRatio||!!sleepReport.lightSleepRatio||!!sleepReport.soberSleepRatio">
				<view class="tuli_item" v-if="!!sleepReport.deepSleepRatio">
					<view class="item_tit">
						<text style="color: #993cef;font-size: 36rpx; margin-right:10rpx;">●</text>
						<text style="color: #993cef; ">深睡眠</text>
					</view>
					<view class="item_content">
						<text style="color: #993cef; ">{{parseInt(0.01*sleepReport.duration*sleepReport.deepSleepRatio/60).toFixed(0)}}时{{(0.01*sleepReport.duration*sleepReport.deepSleepRatio%60).toFixed(0)}}分</text>
					</view>
				</view>
				<view class="tuli_item" v-if="!!sleepReport.lightSleepRatio">
					<view class="item_tit">
						<text style="color: #c26dd6;font-size: 36rpx; margin-right:10rpx;">●</text>
						<text style="color: #c26dd6; ">浅睡眠</text>
					</view>
					<view class="item_content">
						<text style="color: #c26dd6; ">{{parseInt(0.01*sleepReport.duration*sleepReport.lightSleepRatio/60).toFixed(0)}}时{{(0.01*sleepReport.duration*sleepReport.lightSleepRatio%60).toFixed(0)}}分</text>
					</view>
				</view>
				<view class="tuli_item" v-if="!!sleepReport.soberSleepRatio">
					<view class="item_tit">
						<text style="color: #f27f89;font-size: 36rpx; margin-right:10rpx;">●</text>
						<text style="color: #f27f89; ">清醒</text>
					</view>
					<view class="item_content">
						<text style="color: #f27f89; ">{{parseInt(0.01*sleepReport.duration*sleepReport.soberSleepRatio/60).toFixed(0)}}时{{(0.01*sleepReport.duration*sleepReport.soberSleepRatio%60).toFixed(0)}}分</text>
					</view>
				</view>
			</view>
		</view>
</template>

<script>
	import {setTimeout} from 'timers';
	import {formatDatesMinute} from '@/utils/getdate'
	export default {
		props: {
		  sleepData: {
		    type: Array,
		    required: true,
		    default: [] // 设置默认值为空对象
		  },
		  sleepReport:{
			  type: Object,
			  required: true,
			  default: {} // 设置默认值为空对象
		  }
		},
		watch:{
			sleepData(newValue,oldValue){
				// console.log(this.sleepData,this.sleepReport);
				//按时间戳排序
				let a = [...newValue].sort((a, b) => a.timeStamp - b.timeStamp);
				// console.log(a,']]]]]')
				//筛选出在开始和结束时间之间的数据
				this.sortedSleepData=a.filter(item => item.timeStamp>=this.sleepReport.startTimeStamp&&item.timeStamp<=this.sleepReport.endTimeStamp)
				// console.log(this.sortedSleepData,"[[[[[]]]]]")
				//格式化传递来的睡眠数据中的时间
				this.processData()
				this.setChartData()
			},
			sleepReport(newValue,oldValue){
				// console.log(newValue,"===",oldValue)
			}
		},
		data() {
			return {
				huabi: null,
				chartData: [],
				sortedSleepData:[]
			};
		},
		mounted() {
			/* 创建画布 */
			this.huabi = uni.createCanvasContext('tu', this)
			// this.setChartData()
			// this.huahua()
			// console.log("=**",this.sleepData)
			// console.log("=++",this.sleepReport)
		},
		
		methods: {
			/* 处理传递来的睡眠数据中的时间*/
			processData(){
				for(let i=0;i<this.sortedSleepData.length;i++){
					this.sortedSleepData[i].time=formatDatesMinute(new Date(this.sortedSleepData[i].createTime))
					// console.log(this.sortedSleepData[i].time)
				}
			},
			/* 设置图表数据 */
			setChartData(){
				this.chartData=[];
				for(let i=0;i<this.sortedSleepData.length;i++){
					/* Math.floor(Math.random() * 3)
					this.chartData.push(Math.floor(Math.random() * 3)) */
					this.chartData.push(Number(this.sortedSleepData[i].al))
					// console.log(this.sortedSleepData[i].createTime)
				}
				// console.log(this.chartData)
				// console.log(this.sortedSleepData.length,this.chartData)
				this.huahua();
			},
			
			huahua() {
				// console.log(this.chartData)
				// console.log(this.cunzai, "===", this.huodong, "===", this.wochuang)
				const {huabi,chartData} = this;
				const num=chartData.length;//48个
				/**
				 * @总宽度 350
				 * @数据长度 num=48个
				 * @每个的宽度为 350/num     350/45=7.777778
				 */
				// const kuan = 300/num;//十分钟1格，要根据睡眠时长得到数组变成动态的宽度
				const kuan = uni.upx2px(670/num);//十分钟1格，要根据睡眠时长得到数组变成动态的宽度
				const padding = 15;//外边距手动加上
				const lineHeight = uni.upx2px(100);//一栏的高度
				
				
				huabi.clearRect(0, 0, kuan*num, lineHeight*4 - padding*4 + 2); //清除画布上在该矩形区域内的内容。
				// 绘制 x坐标轴
				huabi.beginPath();
				huabi.setStrokeStyle('#a3a3a3');
				huabi.setLineWidth(1);
				huabi.moveTo(padding, lineHeight*4 - padding*4 + 2); //10,140横开始
				huabi.lineTo(kuan*num+padding*2, lineHeight*4 - padding*4 + 2); //320,140横结束,kuan*num为横线的长度
				huabi.setFontSize(9)
				huabi.stroke();
				
				/* 绘制坐标轴分割线--中间的 */
				huabi.beginPath();
				huabi.setStrokeStyle('#a3a3a3');
				huabi.setLineWidth(1);
				huabi.moveTo(padding, lineHeight*3 - padding*4); //10,140横开始
				huabi.lineTo(kuan*num+padding, lineHeight*3 - padding*4); //320,140横结束
				huabi.setFontSize(9)
				huabi.stroke();
				
				/* 绘制坐标轴分割线--上方的 */
				huabi.beginPath();
				huabi.setStrokeStyle('#a3a3a3');
				huabi.setLineWidth(1);
				huabi.moveTo(padding, lineHeight*2 - padding*4); //10,140横开始
				huabi.lineTo(kuan*num+padding, lineHeight*2 - padding*4); //320,140横结束
				huabi.setFontSize(11)
				// 设置填充颜色为红色
				huabi.fillStyle = '#6c7075';
				huabi.stroke();
				
				/* 绘制x轴的坐标值的标线*/
				for (let i = 0; i <(num/6+1); i++) {
					huabi.moveTo(padding + kuan*6 * i, lineHeight*4 - padding*4 +1); //10,140
					huabi.lineTo(padding + kuan*6 * i, lineHeight*4 - padding*4 + 6); //10，140
				}
				huabi.setFontSize(8)
				/* 设置x轴坐标值 */
				/* for (let i = 0; i < (num/6+1); i++) {
					// huabi.fillText('1'+i+':32', padding + kuan*6 * i - 15, lineHeight*4 - padding*4 + 20) //坐标文字
				} */
				for(let i=0;i<(this.sortedSleepData.length);i++){
					if(i%6===0){
						huabi.fillText(this.sortedSleepData[i].time, padding + kuan * i - 15, lineHeight*4 - padding*4 + 20) //坐标文字
					}
					if(i===this.sortedSleepData.length - 1 && (i%6) > 6){
						huabi.fillText(this.sortedSleepData[i].time, padding + kuan * (i+0) - 15, lineHeight*4 - padding*4 + 20) //坐标文字
					}
					// console.log(this.sortedSleepData[i].time)
				}
				
					
				huabi.stroke();


				for (let i = 0; i < chartData.length; i++) {
					if(chartData[i]===0){
						huabi.setFillStyle('#993cef') //上色
						huabi.beginPath(); // 开始路径
						huabi.rect(kuan * i + padding, lineHeight*4 - lineHeight*1 - padding*4, kuan, lineHeight)
						huabi.fill() // 使用当前填充颜色填充矩形
						huabi.closePath(); // 关闭路径
					}else if(chartData[i]===1){
						huabi.setFillStyle('#c26dd6') //上色
						huabi.beginPath(); // 开始路径
						huabi.rect(kuan * i + padding, lineHeight*4 - lineHeight*2 - padding*4, kuan, lineHeight)
						huabi.fill() // 使用当前填充颜色填充矩形
						huabi.closePath(); // 关闭路径
					}else if(chartData[i]===2){
						huabi.setFillStyle('#f27f89') //上色
						huabi.beginPath(); // 开始路径
						huabi.rect(kuan * i + padding, lineHeight*4 - lineHeight*3 - padding*4, kuan, lineHeight)
						huabi.fill() // 使用当前填充颜色填充矩形
						huabi.closePath(); // 关闭路径
					}else{
						huabi.setFillStyle('#152949') //上色
						huabi.beginPath(); // 开始路径
						huabi.rect(kuan * i + padding, lineHeight*4 - lineHeight*3 - padding*4, kuan, lineHeight)
						huabi.fill() // 使用当前填充颜色填充矩形
						huabi.closePath(); // 关闭路径
					}
					
				}
				huabi.draw() //显示
			}
		}
	};
</script>

<style lang="scss">
	.tuli{
		// background: #fff;
		padding: 5rpx 20rpx;
		display: flex;
		justify-content: space-around;
		font-size: 28rpx;
		
		flex-wrap: wrap;
		.tuli_item{
			min-width: 200rpx;//750-25-25-20-20=660   660/330
			margin: 10rpx 0;
			display: flex;
			flex-direction: column;
			.item_tit{
				margin: 0 auto;
				font-size: 28rpx;
				color: #8c98b8;
				line-height: 40rpx;
			}
			.item_content{
				margin: 0 auto;
				font-size: 24rpx;
				color: #525e7c;
				line-height: 30rpx;
			}
		}
	}
</style>