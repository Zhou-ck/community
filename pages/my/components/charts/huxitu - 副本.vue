<template>
  <view class="container">
    <!-- 画布组件，用于绘制曲线图 -->
    <canvas canvas-id="lineChart" style="width: 100%; height: 100px;"></canvas>
  </view>
</template>

<script>
export default {
  props: {
    huxibo: {
      type: String,
      required: true,
      default: "" // 设置默认值为空对象
    },
  },
  data() {
    return {
      huabi: null, // 画布上下文，用于绘图操作
      chartData: [], // 存储曲线图的数据点
      maxPoint: 30, // 曲线图最多显示的数据点数量
	  dataQueue: [], // 存储请求到的数据点队列
	  dingshiqi1:null,
	  dingshiqi2:null,
	  
    };
  },
  mounted() {
    // 初始化画布上下文
    this.huabi = uni.createCanvasContext('lineChart', this);
    // 开始定时获取数据并绘制曲线图
    this.startFetchingData();
  },
  beforeDestroy() {
  	clearInterval(this.dingshiqi1); // 清除定时器
  	clearInterval(this.dingshiqi2); // 清除定时器
  },
  methods: {
    /* 发请求*/
    async query() {
      const breathe = this.huxibo;
	  // console.log("这是呼吸波哈哈哈",this.huxibo)
      let analysisFalg = 1;
      const newChartData = [];
	  // console.log(breathe)
      for (let i = 2; i < breathe.length; i =i+ 2) {
        const indexFalg = analysisFalg + 2;
        const hexadecimalData = breathe.slice(analysisFalg, indexFalg); // 分割出来的十六进制
        const decimalismData = parseInt(hexadecimalData, 16); // 解析好的十进制
        analysisFalg = analysisFalg + 2;
        newChartData.push(decimalismData);
      }
    
      // 将新数据点推入队列
      this.dataQueue.push(...newChartData);
    },

    startFetchingData() {
      // 设置定时器，每秒钟从队列中取一个数据点
      this.dingshiqi1=setInterval(() => {
        if (this.dataQueue.length > 0) {
          const dataPoint = this.dataQueue.shift();
          this.addDataPoint(dataPoint);
          this.animateShift(); // 执行动画平滑显示
        }
      }, 400); // 每秒钟更新一个点
    
      // 设置定时器，每五秒钟请求一次新数据
      this.dingshiqi2=setInterval(() => {
        this.query(); // 请求新的数据
      }, 2000);
    },
	
	/* 添加数据点并更新曲线图 */
	  addDataPoint(dataPoint) {
	    this.chartData.push(dataPoint);
	    // 如果数据点数量超过最大值，则移除最早的数据点
	    if (this.chartData.length > this.maxPoint) {
	      this.chartData.shift();
	    }
	  },
	
    /* 更新曲线图数据 */
    updateChartData(newData) {
      this.chartData.push(...newData);
      // 如果数据点数量超过最大值，则移除最早的数据点
      while (this.chartData.length > (this.maxPoint-1)) {
        this.chartData.shift();
      }
    },

	/* 开始动画移动 */
	 animateShift() {
	   if (this.chartData.length < this.maxPoint) {
	     // 如果数据点数量少于maxPoint，直接重新绘制图表，而不执行移动动画
	     this.drawChart(0); // 传入 0 表示没有位移
	     return Promise.resolve(); // 返回已解析的Promise
	   }
	 
	   const animationFrames = 6; // 动画帧数，决定了平滑过渡的速度
	   let frame = 0;
	 
	   return new Promise(resolve => {
	     const animate = () => {
	       frame++;
	       this.drawChart(frame / animationFrames); // 传入当前动画进度
	 
	       if (frame < animationFrames) {
	         setTimeout(animate, 20); // 约等于60fps的帧率
	       } else {
	         resolve(); // 动画完成，解析Promise
	       }
	     };
	 
	     setTimeout(animate, 20);
	   });
	 },
	 
    /* 绘制曲线图 */
   drawChart(shiftRatio = 0) {
     const { huabi, chartData } = this;
     const width = uni.getSystemInfoSync().windowWidth;
     const height = 100;
     const padding = 10;
   
     huabi.clearRect(0, 0, width, height);
   
     // 绘制坐标轴
    /* huabi.beginPath();
     huabi.setStrokeStyle('#a3a3a3');
     huabi.setLineWidth(1);
     huabi.moveTo(padding, height - padding);
     huabi.lineTo(width - padding, height - padding);
     huabi.moveTo(padding, padding);
     huabi.lineTo(padding, height - padding);
     huabi.stroke(); */
   
     // 固定Y轴刻度范围 (例如 0 - 200)
     const yMin = 0;  // 最小值固定为0
     const yMax = 280;  // 最大值固定为200
     const yRange = yMax - yMin;
     const yScale = (height - 2 * padding) / yRange;
     const xScale = (width - 2 * padding) / (this.maxPoint - 1);
   
     huabi.beginPath();
   
     if (chartData.length >= 2) {
       let lastX = padding - Math.min(xScale * shiftRatio, padding); // 确保 lastX 不会小于 padding
       let lastY = height - padding - (chartData[0] - yMin) * yScale;
       huabi.moveTo(lastX, lastY);
   
       for (let index = 1; index < chartData.length; index++) {
         const value = chartData[index];
         const x = padding + index * xScale - xScale * shiftRatio; // 从右侧逐步移入
         const y = height - padding - (value - yMin) * yScale;
   
         // 添加平滑的控制点，使曲线更圆滑
         const controlX1 = (lastX * 2 + x) / 3;
         const controlY1 = lastY;
         const controlX2 = (lastX + 2 * x) / 3;
         const controlY2 = y;
         huabi.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, x, y);
   
         lastX = x;
         lastY = y;
       }
   
       huabi.setLineWidth(2);
       huabi.setStrokeStyle('#4bd59d');
       huabi.stroke();
     }
   
     huabi.draw();
   }

  },
};
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
