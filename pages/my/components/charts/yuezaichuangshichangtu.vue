<template>
  <view>
    <canvas canvas-id="zcsct" id="zcsct" class="charts" @touchstart="touchstart" @touchmove="touchmove" @touchend="tap"/>
  </view>
</template>
 
<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
  props: {
    monthOnBedTimeArr: {
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
  watch:{
    monthOnBedTimeArr: {
      handler(newValue, oldValue) {
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
  },
  methods: {
    getServerData() {
        let res = {
            categories: this.monthEveryDayArr,
            series: [
              {
                name: "在床时长",
                textColor: "rgba(0,0,0,0)",
                data: this.monthOnBedTimeArr
              },
            ]
          };
          res.series[0].data=this.monthOnBedTimeArr
        this.drawCharts('zcsct', res);
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
        color: ["#3ed196","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,30,0,5],
        enableScroll: false,
        legend: {},
        enableScroll: true,
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
              min: 0,
              formatter: (value,index,opts)=>{
                return `${Math.floor(value/60)}时${Math.round(value%60)}分`
              }
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
            customColor:["#51dd9a","#cd2edc","#fcc025"],
            // colorStop:0.5,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            labelPosition: "center"
          },
          tooltip:{
            formatterSc: (value)=>{
              return `${Math.floor(value/60)}小时${Math.round(value%60)}分钟`
            }
          }
        }
      });
    },
    tap(e){
      uChartsInstance[e.target.id].scrollEnd(e);
      uChartsInstance[e.target.id].touchLegend(e);
      uChartsInstance[e.target.id].showToolTip(e);
    },
    touchstart(e){
      uChartsInstance[e.target.id].scrollStart(e);
    },
    touchmove(e){
      uChartsInstance[e.target.id].scroll(e);
    },
  }
};
</script>
 
<style scoped>
  .charts{
    width: 700rpx;
    height: 500rpx;
  }
</style>