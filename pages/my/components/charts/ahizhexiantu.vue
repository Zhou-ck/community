<template>
  <view>
    <canvas canvas-id="ahi" id="ahi" class="charts" @touchend="tap"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
  props: {
    sleepWeekData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      cWidth: 700,
      cHeight: 500
    };
  },
  mounted() {
    //这里的 750 对应 css .charts 的 width
    this.cWidth = uni.upx2px(700);
    //这里的 500 对应 css .charts 的 height
    this.cHeight = uni.upx2px(500);
    // this.getServerData();
  },
  watch: {
    sleepWeekData: {
      handler(newVal) {
        this.getServerData();
      },
      deep: true
    }
  },
  methods: {
    getServerData() {
        
      //模拟从服务器获取数据时的延时
    //   setTimeout(() => {
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
            categories: ["周一","周二","周三","周四","周五","周六","周日"],
            series: [
              {
                name: "AHI",
                linearColor: [ [0,"#1890FF"], [0.25,"#00B5FF"], [ 0.5,"#00D1ED"], [ 0.75,"#00E6BB"],  [1,"#90F489"] ],
                setShadow: [ 3, 8, 10, "#1890FF" ],
                data: this.sleepWeekData
              }
            ]
          };
          // console.log(res);
          this.drawCharts('ahi', res);
    //   }, 500);
    },
    drawCharts(id,data){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "line",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,30,0,15],
        dataLabel: true,
        dataPointShape: true,
        enableScroll: false,
        legend: {},
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
          data: [
            {
              min: 0,
            //   max: 150
            }
          ]
        },
        extra: {
          line: {
            type: "curve",
            width: 2,
            activeType: "hollow",
            linearType: "custom",
            // onShadow: true,
            animation: "horizontal"
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
    width: 750rpx;
    height: 500rpx;
  }
</style>