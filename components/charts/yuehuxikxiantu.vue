<template>
  <view>
    <!-- <canvas canvas-id="hxkxt" id="hxkxt" class="charts" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"/> -->
    <canvas canvas-id="yhxkxt" id="yhxkxt" class="charts" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
	props:{
		sleepMonthData:{
			type:Object,
			required: true,
			default: {} // 设置默认值为空对象
		}
	},
  watch:{
  	sleepMonthData: {
  	    handler(newValue, oldValue) {  
  	      // console.log("sleepMonthData或其内部值发生了变化");  
  	      // 这里可以处理你的逻辑
  		  this.getServerData();
  	    },  
  	    deep: true, // 启用深度监听  
  	    immediate: false // 是否立即以当前的 prop 值触发回调
  	  }
  },
  data() {
    return {
      cWidth: 700,
      cHeight: 500
    };
  },
  mounted() {
    //这里的 700 对应 css .charts 的 width
    this.cWidth = uni.upx2px(700);
    //这里的 500 对应 css .charts 的 height
    this.cHeight = uni.upx2px(500);
    // this.getServerData();
  },
  methods: {
    getServerData() {
      //模拟从服务器获取数据时的延时
      setTimeout(() => {
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
			//日期
            // categories: ["周一","周二","周三","周四","周五","周六","周日"],
			categories:this.sleepMonthData.categories,
            series: [
              {
				/*
				 *  +最大呼吸数+
				 *  +最小呼吸数+
				 *  +平均呼吸数+
				 *  开盘-前一天的呼吸平均值
				 *  收盘-当天的呼吸平均值
				 *  最低-当天最小呼吸数
				 *  最高-当天最大呼吸数
				 */
                name: "呼吸指数",
                data: [
					/* [前一天的呼吸平均值,当天的呼吸平均值,当天最小呼吸数,2362.94] */
					[15,17,10,24],//1
					[17,14,10,23],//2
					[14,18,10,25],//3
					[15,16,10,29],//4
					[16,20,10,35],//5
					[20,15,10,20],//6
					[15,18,10,27],//7
				]
              }
            ]
          };
		   res.series[0].data=this.sleepMonthData.series[0].data
        this.drawCharts('yhxkxt', res);
      }, 500);
    },
    drawCharts(id,data){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "candle",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: data.categories,
        series: data.series,
        animation: true,
        rotate: false,
        rotateLock: false,
        background: "#FFFFFF",
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [25,15,0,15],
        dataLabel: false,
        enableScroll: true,
        enableMarkLine: true,
        legend: {},
        xAxis: {
          labelCount: 7,
          itemCount:7,
          disableGrid: true,
          gridColor: "#CCCCCC",
          gridType: "solid",
          dashLength: 4,
          scrollShow: true,
          scrollAlign: "left",
          scrollColor: "#A6A6A6",
          scrollBackgroundColor: "#EFEBEF"
        },
        yAxis: {
			data:[
				{
					min:0,
					max:40
				}
			]
		},
        extra: {
          candle: {
            color: {
              upLine: "#f04864",
              upFill: "#f04864",
              downLine: "#2fc25b",
              downFill: "#2fc25b"
            },
            average: {
              show: true,
              name: [
                "日均",
                "MA10",
                "MA30"
              ],
              day: [1],
              color: [
                "#1890ff",
                "#2fc25b",
                "#facc14"
              ]
            }
          },
          markLine: {
            type: "dash",
            dashLength: 5,
            data: [
              {
                value: 12,
                lineColor: "#f04864",
                showLabel: true
              },
              {
                value: 20,
                lineColor: "#f04864",
                showLabel: true
              }
            ]
          },
          tooltip: {
            showCategory: true//是否显示顶部category标题（x轴对应点位）
          }
        }
      });
    },
    touchstart(e){
      uChartsInstance[e.target.id].scrollStart(e);
    },
    touchmove(e){
      uChartsInstance[e.target.id].scroll(e);
    },
    touchend(e){
		// console.log('=======',e)
      uChartsInstance[e.target.id].scrollEnd(e);
      uChartsInstance[e.target.id].touchLegend(e);
      // uChartsInstance[e.target.id].showToolTip(e);//
    }
  }
};
</script>

<style scoped>
  .charts{
    width: 700rpx;
    height: 500rpx;
  }
</style>