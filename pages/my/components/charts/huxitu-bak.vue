<template>
	<view>
		<view class="container">
			<!-- Canvas 画布，用于绘制图表 -->
			<canvas canvas-id="myCanvas" style="width: 100%; height: 300px;"></canvas>
		</view>
	</view>
</template>

<script>
	import {getDeviceRealTimeData} from '@/api/system/device'; // 引入获取实时数据的 API 函数
	import {getModel} from '@/api/system/model.js'; // 引入获取模型数据的 API 函数
	import {getProduct} from '@/api/system/product';
	import {getDeviceList,} from '@/api/system/device';// getDevicelistZsb
	export default {
		props:{
			queryParams:{
				type:Object,
				default: () => ({}), // 设置默认值为空对象
			}
		},
		data() {
			return {
				bool: true,
				device: [],
				dataPoints: [{
					type: "line",
					smooth: true,
					areaStyle: {},
					data: [],
					i: 0,
				}],
				interval: null,
				intervalFaig: 0,
				IDxAxisColor: '#ebf8ac',
				xAxisLabelColor: '#ebf8ac',
				// startTime: null, // 记录加载开始的时间
				analysisFalg: 1, //解析数据时用的一个标识数
				deviceRealTimeData: {}, //设备的实时数据
				deviceInfo: [],
				breathe: null, //呼吸波形十六进制类型的
				breatheData: [], //用于存放呼吸波形十进制的数据
				falg: 0, //
				intervalData: null, //用于存放记录一秒钟请求数据的定时器标识数 
			};
		},
		onReady() {
			this.initCanvas(); // 初始化画布
		},
		mounted() {
			this.jiazai()//创建定时器请求数据
		},
		beforeDestroy(){
			this.xiaohui()//销毁请求数据定时器
		},
		methods: {
			//解析数据（将传进来的十六进制字符串分割、解析为十六进制）
			analyseData(breathe) {
				this.analysisFalg = 1
				for (let i = 2; i < breathe.length; i += 2) {
					const indexFalg = this.analysisFalg + 2
					const hexadecimalData = breathe.slice(this.analysisFalg, indexFalg) //分割出来的十六进制
					const decimalismData = parseInt(hexadecimalData, 16) //解析好的十进制
					this.analysisFalg = this.analysisFalg + 2
					this.breatheData.push(decimalismData)
					// if(this.breatheData.length > 10){
					// 	this.breatheData = null
					// }
					// console.log(hexadecimalData, "======转换为十进制============", decimalismData, "----", this.breatheData)
				}
			},
			// 加载数据
			jiazai() {
				this.getData()
				this.intervalFaig++; //用于限制之开启
				if (this.intervalFaig <= 1) {
					// this.startTime = new Date(); // 记录加载开始时间
					this.intervalData = setInterval(this.getData, 1000)
					this.interval = setInterval(this.updateData, 200); // 每秒更新一次数据
				}
			},
			// 停止加载数据
			xiaohui() {
				this.intervalFaig = 0;
				clearInterval(this.interval); // 清除定时器
				clearInterval(this.intervalData); // 清除定时器
			},
			// 初始化Canvas
			initCanvas() {
				const ctx = uni.createCanvasContext('myCanvas', this);
				ctx.setFillStyle('#0f375f'); // 设置画布背景颜色
				ctx.fillRect(0, 0, 375, 300); // 绘制背景
				ctx.draw();
			},
			// 更新数据
			updateData() {
				const now = new Date();
				this.dataPoints[0].i++;
				let data = 0
				// console.log("=======================================================================")
				if (this.falg <= 1000) {
					data = this.breatheData[this.falg]
					this.falg++;
				}
				let dataItem = [
					now,
					data,
					// Math.sin(this.dataPoints[0].i) // 使用正弦函数模拟数据
				]
				this.dataPoints[0].data.push(dataItem);
				// console.log(this.dataPoints[0].data,"---------------")
				if (this.dataPoints[0].data.length > 32) {
					this.dataPoints[0].data.shift(); // 保持数据点数量不超过32个
				}
				this.drawChart(); // 绘制图表
			},

			//获取设备的实时数据
			getData() {
				//设备的实时数据
				getDeviceRealTimeData(this.queryParams).then((res) => {
					//判断用户点击设备有没有上传数据
					if (res.data == undefined) {
						this.hintShowModal()
					}
					if (res.data !== undefined) {
						this.deviceRealTimeData = JSON.parse(JSON.parse(res.data).params)
						for (let key in this.deviceRealTimeData) {
							if (key == "bc") {
								this.breathe = this.deviceRealTimeData[key]
								this.analyseData(this.breathe)
							}
						}
					}
				});

			},
			//提示弹窗
			hintShowModal() {
				uni.showModal({
					title: "提示",
					content: '此设备还没有上传数据,是否确定返回上一页',
					success: function(res) {
						if (res.confirm) {
							uni.navigateBack({
								delta: 1 // 返回上一页
							});
						}
					}
				})
			},
			// 绘制图表
			drawChart() {
				const ctx = uni.createCanvasContext('myCanvas');
				const width = 375;
				const height = 300;
				const margin = 50;
				const numYSegments = 8;
				const minY = Math.min(...this.dataPoints[0].data.map(d => d[1])) - 0.5;
				const maxY = Math.max(...this.dataPoints[0].data.map(d => d[1])) + 0.5;
				const yRange = maxY - minY;

				ctx.clearRect(0, 0, width, height); // 清空画布

				// 绘制背景
				ctx.setFillStyle('#0f375f');
				ctx.fillRect(0, 0, width, height);

				// 绘制Y轴网格线
				ctx.setStrokeStyle('rgba(255,255,255,0.21)');
				for (let i = 0; i <= numYSegments; i++) {
					const y = margin + i * (height - 2 * margin) / numYSegments;
					ctx.beginPath();
					ctx.moveTo(margin, y);
					ctx.lineTo(width - 10, y);
					ctx.stroke();
				}

				// 绘制坐标轴
				ctx.setStrokeStyle('rgba(255,255,255,.88)');
				ctx.beginPath();
				ctx.moveTo(margin, margin);
				ctx.lineTo(margin, height - margin);
				ctx.setStrokeStyle(this.xAxisColor);
				ctx.moveTo(margin, height - margin);
				ctx.lineTo(width - 10, height - margin);
				ctx.stroke();
				ctx.setFontSize(12);
				ctx.setFillStyle(this.xAxisLabelColor);
				ctx.fillText('呼吸', 10, 20);
				ctx.setFillStyle('#ebf8ac');
				for (let i = 0; i <= numYSegments; i++) {
					const yValue = minY + i * yRange / numYSegments;
					const y = height - margin - (i * (height - 2 * margin) / numYSegments);
					ctx.fillText(yValue.toFixed(2), margin - 30, y + 3);
				}

				// 绘制数据线条和数据点
				if (this.dataPoints[0].data.length > 0) {
					ctx.beginPath();
					const gradient = ctx.createLinearGradient(0, margin, 0, height - margin);
					gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
					gradient.addColorStop(1, 'rgba(75, 0, 130, 1)');
					ctx.setStrokeStyle(gradient);
					ctx.setLineWidth(2);

					this.dataPoints[0].data.forEach((point, index) => {
						const x = margin + (index * (width - 2 * margin) / (this.dataPoints[0].data.length - 1));
						const y = height - margin - ((point[1] - minY) * (height - 2 * margin) / yRange);

						if (index === 0) {
							ctx.moveTo(x, y);
						} else {
							ctx.lineTo(x, y);
						}
					});
					ctx.stroke();

					// 填充曲线下方的区域
					ctx.lineTo(width - margin, height - margin); // 从最后一个点连线到X轴
					ctx.lineTo(margin, height - margin); // 再从X轴连回到第一个点
					ctx.setFillStyle(gradient); // 使用与线条相同的渐变色
					// ctx.fill();

					// 绘制数据点
					this.dataPoints[0].data.forEach((point, index) => {
						const x = margin + (index * (width - 2 * margin) / (this.dataPoints[0].data.length - 1));
						const y = height - margin - ((point[1] - minY) * (height - 2 * margin) / yRange);
						const colorValue = Math.round((point[1] - minY) / yRange * 255);

						ctx.setFillStyle(`rgba(${colorValue}, ${255 - colorValue}, 255, 1)`);
						ctx.beginPath();
						ctx.arc(x, y, 1, 0, 2 * Math.PI); // 绘制圆点
						ctx.fill();
					});
				}

				// 显示加载时间
				// const elapsedTime = (new Date() - this.startTime) / 1000; // 计算已加载时间
				// ctx.setFillStyle('#FFFFFF');
				// ctx.fillText(`加载时间: ${elapsedTime.toFixed(2)} 秒`, margin, height - margin / 2);

				ctx.draw();
			},
		}
	};
</script>

<style lang="scss">
	.container {
		padding: 10px;
	}
</style>