<template>
  <view>
    <canvas canvas-id="zsmt" id="zsmt" class="charts" @touchend="tap"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
	props: {
	  sleepWeekData: {
	    type: Array,
	    required: true,
	    default: [] // 设置默认值为空对象
	  }
	},
	watch:{
		sleepWeekData: {
		    handler(newValue, oldValue) {  
		      // console.log("sleepWeekData或其内部值发生了变化");  
		      // 这里可以处理你的逻辑
			  this.getServerData();
		    },  
		    deep: false, // 启用深度监听  
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
     /* setTimeout(() => { */
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
            categories: ["周一","周二","周三","周四","周五","周六","周日"],
            series: [
              {
                name: "深睡眠",
                textColor: "rgba(0,0,0,0)",
                data: [15,16,11,13,13,18,""]
              },
              {
                name: "浅睡眠",
                textColor: "rgba(0,0,0,0)",
                data: [18,17,11,14,6,18,""]
              },
              {
                name: "清醒",
                textColor: "rgba(0,0,0,0)",
                data: [1,5,2,4,2,1,2]
              }
            ]
          };
		  // console.log(this.sleepWeekData)
		  res.series[0].data=this.sleepWeekData[0].data;
		  res.series[1].data=this.sleepWeekData[1].data;
		  res.series[2].data=this.sleepWeekData[2].data;
        this.drawCharts('zsmt', res);
      /* }, 500); */
    },
    drawCharts(id,res){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "column",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: res.categories,
        series: res.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#9944e8","#cd2edc","#fcc025","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,15,0,5],
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          data: [
            {
              min: 0
            }
          ]
        },
        extra: {
          column: {
            type: "group",//柱状图类型，可选值：'group'分组柱状图,'stack'堆叠柱状图,'meter'温度计式图
            width: 10,
			barBorderCircle:true,
			barBorderRadius:[ 10, 0, 10, 0],
			linearType:'custom',//渐变类型，可选值："none"关闭渐变,"opacity"透明渐变,"custom"自定义颜色
			linearOpacity:0.4,
			customColor:["#9944e8","#cd2edc","#fcc025"],
			// colorStop:0.5,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            labelPosition: "center"
          }
        }
      });
    },
    tap(e){
      uChartsInstance[e.target.id].touchLegend(e);
      uChartsInstance[e.target.id].showToolTip(e);
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