<template>
	<view>
		<!-- 心电图显示区 -->
		<view class="displayarea">
			<view class="container">
				<!-- 网格画布 -->
				<view class="box2">
					<!-- 网格画布 -->
					<canvas canvas-id="line" style="width: 700rpx; height: 300px;"></canvas>
				</view>
				<!-- 心电图画布 -->
				<view class="box1">
					<!-- 心电图画布 -->
					<canvas canvas-id="ecgCanvas" style="width: 700rpx; height: 300px;"></canvas>
				</view>
			</view>
		</view>
		<!-- 开始心电图按钮 -->
		<button @click="startEcg()">开始心电图</button>
		<!-- 停止心电图按钮 -->
		<button @click="stopEcg()">停止心电图</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pointsPerSecond: 5, // 每秒钟绘制的点数
				duration: 10, // 心电图显示的持续时间（秒）
				frequency: 1, // 心电图的频率
				amplitude: 100, // 心电图的幅度
				offset: 150, // 心电图的偏移量
				ecgData: [], // 存储心电图数据的数组
				currentX: 0, // 当前X轴坐标
				ecgInterval: null, // 心电图绘制的定时器
				ecgIntervalFalg: 0,
				// 画布样式
				// canvasStyle: {
				// 	width: '100%',
				// 	height: '320px',
				// }, // 默认样式
			};
		},
		mounted() {
			this.drawGrid(); // 绘制网格
		},
		onLoad(queryParams) {
			// console.log(queryParams,"===============")
		},
		methods: {
			drawGrid() {
				// 绘制网格
				const canvasId = 'line';
				this.drawSmallGrid(canvasId);
				this.drawMediumGrid(canvasId);
				this.drawBigGrid(canvasId);
			},
			drawSmallGrid(canvasId) {
				// 绘制小网格
				// const ctx = uni.createCanvasContext(canvasId, this);
				const ctx = wx.createCanvasContext(canvasId, this);
				ctx.setFillStyle('#0f375f'); //这是测试用的背景色
				ctx.setStrokeStyle('#FFDFDF'); // 设置网格线颜色
				ctx.setLineWidth(1); // 设置网格线宽度
				// 绘制竖线
				// for (let x = 0.5; x < 750; x += 3) {
				for (let x = 0.5; x < 750; x += 3) {
					ctx.moveTo(x, 0);
					ctx.lineTo(x, 320);
				}
				// 绘制横线
				for (let y = 0.5; y < 320; y += 3) {
					ctx.moveTo(0, y);
					ctx.lineTo(750, y);
				}
				ctx.stroke(); // 绘制网格
				ctx.draw(true); // 更新画布
			},
			drawMediumGrid(canvasId) {
				// 绘制中网格
				// const ctx = uni.createCanvasContext(canvasId, this);
				const ctx = wx.createCanvasContext(canvasId, this);
				ctx.setStrokeStyle('#FFBFBF'); // 设置网格线颜色
				ctx.setLineWidth(1); // 设置网格线宽度
				// 绘制竖线
				for (let x = 0.5; x < 750; x += 15) {
					ctx.moveTo(x, 0);
					ctx.lineTo(x, 320);
				}
				// 绘制横线
				for (let y = 0.5; y < 320; y += 15) {
					ctx.moveTo(0, y);
					ctx.lineTo(750, y);
				}
				ctx.stroke(); // 绘制网格
				ctx.draw(true); // 更新画布
			},
			drawBigGrid(canvasId) {
				// 绘制大网格
				// const ctx = uni.createCanvasContext(canvasId, this);
				const ctx = wx.createCanvasContext(canvasId, this);
				ctx.setStrokeStyle('#e0514b'); // 设置网格线颜色
				// ctx.setStrokeStyle('##FFFFCC')
				ctx.setLineWidth(1); // 设置网格线宽度
				// 绘制竖线
				for (let x = 0.5; x < 750; x += 75) {
					ctx.moveTo(x, 0);
					ctx.lineTo(x, 320);
				}
				// 绘制横线
				for (let y = 0.5; y < 320; y += 75) {
					ctx.moveTo(0, y);
					ctx.lineTo(750, y);
				}
				ctx.stroke(); // 绘制网格
				ctx.draw(true); // 更新画布
			},
			generateECGData() {
				// 生成心电图数据
				this.ecgData = [];
				const totalPoints = this.pointsPerSecond * this.duration;
				const angularFrequency = 2 * Math.PI * this.frequency;
				for (let i = 0; i < totalPoints; i++) {
					const time = i / this.pointsPerSecond;
					// console.log(time, "------------")
					const value = this.amplitude * Math.sin(angularFrequency * time) + this.offset;
					this.ecgData.push(value);
				}
			},
			drawECG() {
				// 绘制心电图
				// const ctx = uni.createCanvasContext('ecgCanvas', this);
				const ctx = wx.createCanvasContext('ecgCanvas', this);
				// 清除画布内容
				ctx.clearRect(0, 0, 750, 320);
				ctx.setStrokeStyle('#000'); // 设置心电图线条颜色
				ctx.setLineWidth(2); // 设置心电图线条宽度
				ctx.beginPath(); // 开始绘制
				const pointsToDraw = this.ecgData.slice(0, 50);
				// console.log(pointsToDraw, "----------")
				pointsToDraw.forEach((value, index) => {
					const x = this.currentX + index * 15;
					const y = value;
					if (index === 0) {
						ctx.moveTo(x, y); // 移动到起始点
					} else {
						ctx.lineTo(x, y); // 连接到下一点
					}
				});
				ctx.stroke(); // 绘制心电图
				ctx.draw(true); // 更新画布
				// 更新当前X坐标
				this.currentX -= 15;
				if (this.currentX <= -750) {
					this.currentX = 0;
				}
			},
			startEcg() {
				// 开始心电图绘制
				this.generateECGData();
				this.ecgIntervalFalg++;
				if (this.ecgIntervalFalg++ <= 1) {
					// console.log("------次数----1230--")
					this.ecgInterval = setInterval(() => {
						this.drawECG();
					}, 1000);
				}
			},
			stopEcg() {
				// 停止心电图绘制
				this.ecgIntervalFalg = null
				clearInterval(this.ecgInterval);
			},
		},
	};
</script>

<style>
	/* 心电图显示区域 */
	.displayarea {
		height: 320px;
		/* 高度设定为320px */
	}

	.box1 {
		position: absolute;
		left: 25rpx;
		width: 700rpx;
		height: 320px;
	}

	.box2 {
		position: absolute;
		left: 25rpx;
		width: 700rpx;
		height: 320px;
	}
</style>