<template>
  <view>
    <canvas canvas-id="yfz" id="yfz" class="charts"  @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
	props: {
	  monthFanShenCiShuArr: {
	    type: Array,
	    required: true,
	    default: [] // 设置默认值为空对象
	  },
    monthEveryDayArr: {
	    type: Array,
	    required: true,
	    default: [] // 设置默认值为空对象
	  }
	},
  data() {
    return {
      cWidth: 700,
      cHeight: 500
    };
  },
  watch:{
  	monthFanShenCiShuArr: {
  	    handler(newValue, oldValue) {
  		  this.getServerData();
  	    },
  	    deep: true,
  	    immediate: false
  	  }
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
      let res = {
        // categories: ["周一","周二","周三","周四","周五","周六","周日"],
        categories: this.monthEveryDayArr,
        series: [
          {
            name: "翻转身体",
            textColor: "rgba(0,0,0,0)",
            data: this.monthFanShenCiShuArr
          },
        ]
      };
		  res.series[0].data = this.monthFanShenCiShuArr;
      this.drawCharts('yfz', res);
    },
    drawCharts(id,data){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "column",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,30,0,5],
        legend: {},
        enableScroll: true,
        enableMarkLine: true,
        xAxis: {
          disableGrid: true,
          itemCount:7,
          gridColor: "#CCCCCC",
          gridType: "solid",
          dashLength: 4,
          scrollShow: true,
          scrollAlign: "left",
          scrollColor: "#A6A6A6",
          scrollBackgroundColor: "#EFEBEF"
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
	  uChartsInstance[e.target.id].showToolTip(e);//点击时显示的图例
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