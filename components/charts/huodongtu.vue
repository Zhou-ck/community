<template>
	<view style="width: 665rpx;background: #fff;">
		<view class="container">
			<!-- Canvas 画布，用于绘制图表 -->
			<canvas canvas-id="tu" style="width: 665rpx; height: 265rpx;background: #fff;"></canvas>
			<view class="tuli">
				<view>
					<uni-icons type="smallcircle-filled" size="13" color="#808080"></uni-icons>
					<text style="color: #808080;">无人</text>
				</view>
				<view>
					<uni-icons type="smallcircle-filled" size="13" color="#ffb65f"></uni-icons>
					<text style="color: #ffb65f;">轻微活动</text>
				</view>
				<view>
					<uni-icons type="smallcircle-filled" size="13" color="#f0416d"></uni-icons>
					<text style="color: #f0416d;">频繁活动</text>
				</view>
				<view>
					<uni-icons type="smallcircle-filled" size="13" color="#28cc8b"></uni-icons>
					<text style="color: #28cc8b;">静止</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {setTimeout} from 'timers';
	export default {
		props: {
			cunzai: {
				type: Number,
				default: 0, // 设置默认值为空对象
			},
			huodong: {
				type: Number,
				default: 0, // 设置默认值为空对象
			},
			wochuang: {
				type: Number,
				default: 0, // 设置默认值为空对象
			},

		},
		data() {
			return {
				huabi: null,
				chartData: [],
				isNoPeople: true, //有人--无人
				isLightActivity: false, //轻微活动
				isFrequentActivity: false, //频繁活动
				isRepose: false, //静卧
				isRealData:false,//是否已经请求到了真实数据
				status: '' ,//当前状态
				dingshiqih1:null
			};
		},
		watch: {
			/* cunzai(newVal, oldVal) {
				if (newVal !== 1) {
					this.isNoPeople = true// 有人
				} else {
					this.isNoPeople = false// 无人
				}
			},
			huodong(newVal, oldVal) {
				if (newVal > 0 && newVal < 10) {// 轻微活动
					this.isLightActivity = true
					this.isFrequentActivity = false// 频繁活动
				} else if (newVal > 10) {// 频繁活动
					this.isLightActivity = false
					this.isFrequentActivity = true
				} else {// 静卧
					this.isLightActivity = false
					this.isFrequentActivity = false
				}
			},
			wochuang(newVal, oldVal) {
				if (newVal === 1) {
					this.isRepose = true
				} else {
					this.isRepose = false
				}
			} */
		},
		mounted() {
			/* 创建画布 */
			this.huabi = uni.createCanvasContext('tu', this)
			this.setDingShiQi()
			// console.log("销毁1")
		},
		beforeDestroy() {
			// console.log("销毁2")
			if(this.dingshiqih1!=null){
				clearInterval(this.dingshiqih1); // 清除定时器
				this.dingshiqih1=null;
			}
			
		},
		methods: {
			setStatus() {
				if (this.cunzai == 0) {//无人
					this.isNoPeople = true
					this.isRealData = true
					this.status = 'wuren'
				} else if (this.cunzai == 1) {//有人
					this.isNoPeople = false
					this.isRealData = true
				} else {//无数据
					this.isRealData = false
					// console.log("无数据")
				}
				// console.log(this.isNoPeople)
				
				if(this.huodong == 0 && !!this.isNoPeople && this.isRealData){// 无人
					this.isNoPeople = true
					this.isRepose = false
					this.status = 'wuren'
				} else if(this.huodong < 2 && !this.isNoPeople && this.isRealData){// 静止
					this.isLightActivity = false
					this.isFrequentActivity = false
					this.isRepose = true
					this.status = 'wochuang'
				} else if(this.huodong <= 30 && !this.isNoPeople && this.isRealData){// 轻微活动
					this.isLightActivity = true
					this.isFrequentActivity = false
					this.isRepose = false
					this.status = 'qingwei'
				} else if (this.huodong <= 60 && !this.isNoPeople && this.isRealData) {// 频繁活动
					this.isLightActivity = false
					this.isFrequentActivity = true
					this.isRepose = false
					this.status = 'pinfan'
				} else if (this.huodong <= 100 && !this.isNoPeople && this.isRealData) {// 频繁活动
					this.isLightActivity = false
					this.isFrequentActivity = true
					this.isRepose = false
					this.status = 'pinfan'
				} else {
					this.isLightActivity = false
					this.isFrequentActivity = false
					this.isRepose = false
					this.status = 'weizhi'//未知
				}
				// console.log(this.isLightActivity)
				// console.log(this.isFrequentActivity)
				
				
				/* if (this.wochuang === 1 && !this.isNoPeople) {
					this.isRepose = true
					this.status = 'wochuang'
				} else {
					this.isRepose = false
				} */
				// console.log(this.isRepose)
				// console.log(this.status)
				
				
			},

			setDingShiQi() {
				const self=this
				this.dingshiqih1 = setInterval(() => {
					this.setStatus(); // 请求新的数据
					const now = new Date();
					const seconds = now.getSeconds();
					if(this.chartData.length<5){
						this.chartData.push(
							{
								status:self.status,
								time:seconds
							}
						)
					}else{
						// this.chartData=[]//清空数据
						this.chartData.splice(0, 1);
						this.chartData.push(
							{
								status:self.status,
								time:seconds
							}
						)
					}
						this.huahua(); // 请求新的数据
					// console.log(this.chartData)
				},1000);
				/* this.dingshiqih2 = setInterval(() => {
					this.huahua(); // 请求新的数据
				},5000); */
			},


			huahua() {
				// console.log(this.chartData)
				// console.log(this.cunzai, "===", this.huodong, "===", this.wochuang)
				const {huabi,chartData} = this;
				// const kuan = 75;
				const kuan = uni.upx2px(150);
				
				const chang = uni.upx2px(180);
				const padding = 18;
				const width = kuan * 4 + padding * 2;
				const height = uni.upx2px(238);
				huabi.clearRect(0, 0, width, height); //清除画布上在该矩形区域内的内容。
				// 绘制坐标轴
				huabi.beginPath();
				huabi.setStrokeStyle('#a3a3a3');
				huabi.setLineWidth(1);
				huabi.moveTo(padding, height - padding); //10,140横开始
				huabi.lineTo(width - padding, height - padding); //320,140横结束
				huabi.setFontSize(12)
				/* 绘制x轴和坐标值*/
				for (let i = 0; i < 7; i++) {
					huabi.moveTo(padding + kuan * i, height - padding); //10,140
					huabi.lineTo(padding + kuan * i, height - padding + 5); //10，140
				}
				for (let i = 0; i < this.chartData.length; i++) {
					huabi.fillText(this.chartData[i].time+'S', padding + kuan * i - 8, height - padding + 20) //坐标文字
				}
					
				huabi.stroke();

				/* //x轴坐标线1
				huabi.moveTo(padding+bian*0, height - padding);//10,140
				huabi.lineTo(padding+bian*0, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*0-5, height - padding+15)
				//x轴坐标线2
				huabi.moveTo(padding+bian*1, height - padding);//10,140
				huabi.lineTo(padding+bian*1, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*1-5, height - padding+15)
				//x轴坐标线3
				huabi.moveTo(padding+bian*2, height - padding);//10,140
				huabi.lineTo(padding+bian*2, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*2-5, height - padding+15)
				//x轴坐标线4
				huabi.moveTo(padding+bian*3, height - padding);//10,140
				huabi.lineTo(padding+bian*3, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*3-5, height - padding+15)
				//x轴坐标线5
				huabi.moveTo(padding+bian*4, height - padding);//10,140
				huabi.lineTo(padding+bian*4, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*4-5, height - padding+15)
				//x轴坐标线6
				huabi.moveTo(padding+bian*5, height - padding);//10,140
				huabi.lineTo(padding+bian*5, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*5-5, height - padding+15)
				//x轴坐标线7
				huabi.moveTo(padding+bian*6, height - padding);//10,140
				huabi.lineTo(padding+bian*6, height - padding+5);//10，140
				huabi.fillText('55S', padding+bian*6-5, height - padding+15)
				huabi.stroke(); */



				// 固定Y轴刻度范围 (例如 0 - 200)
				const yMin = 0; // 最小值固定为0
				const yMax = 280; // 最大值固定为200
				const yRange = yMax - yMin;
				const yScale = (height - 2 * padding) / yRange;
				const xScale = (width - 2 * padding) / (this.maxPoint - 1);


				for (let i = 0; i < this.chartData.length-1; i++) {
					// console.log("开始",i,this.chartData[i].status,this.huodong);
					if(this.chartData[i].status==='wuren'){
						huabi.setFillStyle('#808080') //上色
					}else if(this.chartData[i].status==='qingwei'){
						huabi.setFillStyle('#ffb65f') //上色
					}else if(this.chartData[i].status==='pinfan'){
						huabi.setFillStyle('#f0416d') //上色
					}else if(this.chartData[i].status==='wochuang'){
						huabi.setFillStyle('#28cc8b') //上色
					}else{
						huabi.setFillStyle('#ffffff') //上色
					}
					huabi.beginPath(); // 开始路径
					huabi.rect(kuan * i + padding, height - chang - padding - 1, kuan, chang)
					huabi.fill() // 使用当前填充颜色填充矩形
					huabi.closePath(); // 关闭路径
				}
				huabi.draw() //显示
				/* console.log("开始1");
				huabi.rect(kuan * 0 + padding, height - chang - padding - 1, kuan, chang)
				huabi.setFillStyle('#808080') //上色
				huabi.fill() //填充 */


				/* console.log("开始2");
				huabi.beginPath()
				huabi.rect(kuan * 1 + padding, height - chang - padding - 1, kuan, chang)
				huabi.setFillStyle('#ffb65f') //上色
				huabi.fill() //填充
				// huabi.stroke()//描边 */


				/* console.log("开始3");
				huabi.beginPath()
				huabi.rect(kuan * 2 + padding, height - chang - padding - 1, kuan, chang)
				huabi.setFillStyle('#f0416d') //上色
				huabi.fill() //填充 */

				/* console.log("开始4c");
				huabi.beginPath()
				// 设置路径的起点
				// 创建从 (100, 100) 到 (100, 50) 和 (50, 50) 之间的圆弧路径
				huabi.rect(kuan * 3 + padding, height - chang - padding - 1, kuan, chang)
				huabi.setFillStyle('#28cc8b') //上色
				huabi.fill() //填充 */


				// huabi.draw() //显示
			}
		}
	};
</script>

<style lang="scss">
	
	.container{
		width: 655rpx;
		// background: #eee;
		.tuli {
			width:655rpx;
			display: flex;
			justify-content: space-around;
			font-size: 28rpx;
		}
	}
</style>