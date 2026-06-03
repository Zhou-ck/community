<template>
  <view>
    <!-- 定义一个 canvas 画布，绑定 ID 和事件，用于绘制睡眠得分的图表 -->
    <canvas :canvas-id="cid" :id="cid" class="charts" @touchend="tap"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js'; // 引入 uCharts 库
var uChartsInstance = {}; // 用于存储 uCharts 实例
export default {
	props: {
		/* 
		 * */

	  sleepReportInfo:{
		  type: Number,
		  required: true,
		  default: 0 // 设置默认值为空对象
	  },
	  index:{
		  type:Number,
		  required: false,
		  default: 0 ,// 设置默认值为空对象
	  }
	},
  data() {
    return {
      cWidth: 655,  // 初始化画布的宽度
      cHeight: 350  ,// 初始化画布的高度
	  name:'shuiman',
	  cid:'sleepScore',
    };
  },
  mounted() {
    // 将 CSS 定义的宽度转换为像素值，并更新 cWidth
    this.cWidth = uni.upx2px(655);
    // 将 CSS 定义的高度转换为像素值，并更新 cHeight
    this.cHeight = uni.upx2px(350);
    if(this.index){
		this.getServerData();  // 获取数据并绘制图表
	}
  },
  watch:{
	  // 监听sleepReportInfo的变化  
	  sleepReportInfo: {
	    handler(newValue, oldValue) {
	      this.getServerData();
	    },
		deep: true,
		immediate: true
	  },
  },
  methods: {
    getServerData() {
      // 模拟从服务器获取数据时的延时
	  const self=this;
      setTimeout(() => {
        // 模拟服务器返回数据
        let res = {
            series: [
              {
                name: self.name,  // 数据系列的名称
                color: "#3ed196",  // 数据系列的颜色
                data: Number(this.sleepReportInfo)/100  // 数据系列的值
              }
            ],
			title: {
			  name: Number(this.sleepReportInfo),  // 图表标题内容
			}
          };
        this.drawCharts(this.cid, res);  // 调用绘图方法，绘制图表
		// console.log("cid:",this.cid)
		// console.log("sleepReportInfo:",this.sleepReportInfo)
      }, 500);  // 延时 500 毫秒
    },
    drawCharts(id, data){
      // 创建 canvas 上下文，用于绘图
      const ctx = uni.createCanvasContext(id, this);
      // 创建 uCharts 实例，配置图表的各项属性
      uChartsInstance[id] = new uCharts({
        type: "arcbar",  // 图表类型为弧形条
        context: ctx,  // 传入 canvas 上下文
        width: this.cWidth,  // 图表的宽度
        height: this.cHeight,  // 图表的高度
        series: data.series,  // 数据系列
        animation: true,  // 开启动画效果
        background: "#FFFFFF",  // 图表背景颜色
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],  // 数据系列的颜色组
        padding: undefined,  // 图表内边距
        title: {
          name: data.title.name?data.title.name:'0',  // 图表标题内容
          fontSize: 50,  // 标题字体大小
          color: "#000000"  ,// 标题颜色
        },
        subtitle: {
          name: "睡眠得分",  // 副标题内容
          fontSize: 20,  // 副标题字体大小
          color: "#888"  ,// 副标题颜色
		  offsetX: 0,  // 副标题的X轴偏移量，可以调整以增加左右间距
		  offsetY: 10  // 副标题的Y轴偏移量，增加上下间距
        },
        extra: {
          arcbar: {
            type: "circle",  // 弧形条的类型为圆形
            width: 12,  // 弧形条的宽度
            backgroundColor: "#E9E9E9",  // 弧形条的背景颜色
            startAngle: 1.5,  // 弧形条的起始角度
            endAngle: 0.25,  // 弧形条的结束角度
            gap: 2  // 弧形条之间的间隙
          }
        }
      });
    },
    tap(e){
		// console.log(e,"===")
      // 处理图例点击事件
      uChartsInstance[e.target.id].touchLegend(e);
      // 显示提示工具栏
      uChartsInstance[e.target.id].showToolTip(e);
	  // console.log(uChartsInstance,"===")
    }
  }
};
</script>

<style scoped>
  /* 定义图表的宽度和高度 */
  .charts{
    width: 700rpx;
    height: 360rpx;
  }
</style>
