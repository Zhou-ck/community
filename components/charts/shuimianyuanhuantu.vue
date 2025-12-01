<template>
	<view>
		<!-- 定义一个canvas元素用于绘制图表，监听touchend事件以处理图表上的触摸操作 -->
		<canvas canvas-id="smyh" id="smyh" class="charts" @touchend="tap" />
	</view>
</template>

<script>
	import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js'; // 引入uCharts库 
	import {formatDatesMinute} from '@/utils/getdate'
	var uChartsInstance = {}; // 用于存储图表实例的对象  
	export default {
		props: {
		  /* sleepData: {
		    type: Array,
		    required: true,
		    default: [] // 设置默认值为空对象
		  }, */
		  sleepReport:{
		  	type: Object,
		  	required: true,
		  	default: {} // 设置默认值为空对象
		  },
		},
		watch:{
			/* sleepData(newValue,oldValue){
				console.log(newValue,"===",oldValue)
				//按时间戳排序
				let a = [...newValue].sort((a, b) => a.timeStamp - b.timeStamp);
				this.sortedSleepData=a.filter(item => item.timeStamp>=this.sleepReport.startTimeStamp&&item.timeStamp<=this.sleepReport.endTimeStamp)
				// for(let item of this.sleepData){
					// console.log(this.sortedSleepData)
					this.processData()
					// console.log("===================================================================",this.sleepReport)
				// }
				// this.getServerData();
				// this.setChartData()
			}, */
			/* sleepReport(newValue,oldValue){
				console.log(newValue,"===",oldValue)
				//按时间戳排序
				let a = [...this.sleepData].sort((a, b) => a.timeStamp - b.timeStamp);
				this.sortedSleepData=a.filter(item => item.timeStamp>=this.sleepReport.startTimeStamp&&item.timeStamp<=this.sleepReport.endTimeStamp)
				// for(let item of this.sleepData){
					// console.log(this.sortedSleepData)
					this.processData()
					// console.log("===================================================================",this.sleepReport)
				// }
				// this.getServerData();
				// this.setChartData()
			}, */
			/* sleepReport: {
				handler(newVal) {
				if (newVal?.tenDatas) {
					this.sortedSleepData = newVal.tenDatas;
					this.processData();
				}
				},
				deep: true,
				immediate: true
			} */
		},
		data() {
			return {
				cWidth: 700, // 初始画布宽度（设计稿宽度）
				cHeight: 500 ,// 初始画布高度（设计稿高度）
				// sortedSleepData: [],
			};
		},
		mounted() {
			//这里的 750 对应 css .charts 的 width
			// 使用uni.upx2px将设计稿中的rpx单位转换为实际设备的px单位  
			this.cWidth = uni.upx2px(750);
			//这里的 500 对应 css .charts 的 height
			this.cHeight = uni.upx2px(500);
			// this.getServerData(); // 调用方法获取服务器数据并绘制图表  
			this.processData();
		},
		methods: {
			/* 处理传递来的睡眠数据中的时间*/
			processData(){
				/* this.sortedSleepData = this.sleepReport.tenDatas;
				const len = this.sortedSleepData.length;
				if(len == 0) return;
				for(let i=0;i<this.sortedSleepData.length;i++){
					this.sortedSleepData[i].time=formatDatesMinute(new Date(this.sortedSleepData[i].createTime))
					// console.log("this.sortedSleepData[i].time")
				} */
				this.getServerData();
			},
			getServerData() {
				// console.log(this.sleepReport,'ahhahaasdasdasdasdasdsadasfasfasfasfdsafafawef34tr234t324t34t34');
				// 模拟从服务器获取数据，使用setTimeout模拟网络延迟  
				setTimeout(() => {
					//模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
					let res = {
						series: [{
							data: [{
								"name": "深睡",
								"value": Number(this.sleepReport.sssczb)
							}, {
								"name": "浅睡",
								"value": Number(this.sleepReport.jssczb)
							}, {
								"name": "清醒",
								"value": Number(this.sleepReport.qxsczb)
							}]
						}],
						subtitle: {//百分比文字
							name: Number(this.sleepReport.sssczb)+Number(this.sleepReport.jssczb)+''
						}
					};
					this.drawCharts('smyh', res); // 调用方法绘制图表  
				}, 500);
			},
			drawCharts(id, data) {
				// 创建canvas绘图上下文  
				const ctx = uni.createCanvasContext(id, this);
				// 创建uCharts图表实例
				uChartsInstance[id] = new uCharts({
					type: "ring", // 图表类型为环形图  
					context: ctx, // 绘图上下文  
					width: this.cWidth, // 画布宽度  
					height: this.cHeight, // 画布高度  
					series: data.series, // 数据系列  
					animation: true, // 是否开启动画  
					// ... 其他配置项，如旋转、背景色、数据标签等  
					// 注意：这里的标题和副标题可能与环形图的实际展示不符，通常环形图不需要这些
					rotate: false,
					rotateLock: false,
					background: "#152949",
					color: ["#993cef", "#c26dd6", "#f27f89"],
					padding: [5, 5, 5, 5],
					dataLabel: true,
					enableScroll: false,
					legend: {//图例
						show: true,
						position: "bottom",
						lineHeight: 25
					},
					title: {
						name: "睡眠比例",
						fontSize: 15,
						color: "#969696"
					},
					subtitle: {//百分比文字
						name: data.subtitle.name+'%',
						fontSize: 25,
						color: "#7cb5ec"
					},
					extra: {
						ring: {
							ringWidth: 15,//圆环宽度
							activeOpacity: 0.5,//选中后的颜色深浅
							activeRadius: 5,//选中后的边界范围
							offsetAngle: -90,//开始角度
							labelWidth: 15,//引线长度
							border: false,//描边显示
							borderWidth: 3,//描边宽度
							borderColor: "#FFFFFF",//描边颜色
							linearType: "custom",//渐变类型，可选值："none"关闭渐变,"custom"开启渐变
							centerColor:"#152949"
						}
					}
				});
			},
			tap(e) {
				// 处理触摸事件，如点击图例或显示提示信息  
				if (uChartsInstance[e.target.id]) {
					uChartsInstance[e.target.id].touchLegend(e); // 处理图例触摸事件  
					uChartsInstance[e.target.id].showToolTip(e); // 显示提示信息 
				}
			}
		}
	};
</script>

<style scoped>
	.charts {
		width: 700rpx;
		height: 500rpx;
		background: #152949;
	}
</style>