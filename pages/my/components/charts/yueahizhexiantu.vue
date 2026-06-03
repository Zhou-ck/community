<template>
  <view>
    <canvas canvas-id="yueahizhexiantu" id="yueahizhexiantu" class="charts" @touchstart="touchstart" @touchmove="touchmove" @touchend="tap"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
  props: {
    monthAHIArr: {
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
  mounted() {
    //这里的 750 对应 css .charts 的 width
    this.cWidth = uni.upx2px(700);
    //这里的 500 对应 css .charts 的 height
    this.cHeight = uni.upx2px(500);
    // this.getServerData();
  },
  watch: {
    monthAHIArr: {
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
            categories: this.monthEveryDayArr,
            series: [
              {
                name: "AHI指数",
                linearColor: [ [0,"#1890FF"], [0.25,"#00B5FF"], [ 0.5,"#00D1ED"], [ 0.75,"#00E6BB"],  [1,"#00D1ED"] ],
                setShadow: [ 3, 8, 10, "#1890FF" ],
                data: this.monthAHIArr
              }
            ]
          };
          // console.log(res);
          this.drawCharts('yueahizhexiantu', res);
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
        dataLabel: true,//是否显示数据标签
        dataPointShape: true,//是否显示数据点
        enableScroll: true,//是否启用滚动
        legend: {},
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
          gridType: "dash",
          dashLength: 2,
          data: [
            {
              min: 0,
            //   max: 150
             unit: "次"
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
      uChartsInstance[e.target.id].scrollEnd(e);
      uChartsInstance[e.target.id].touchLegend(e);
      uChartsInstance[e.target.id].showToolTip(e);
    },
    touchstart(e){
      uChartsInstance[e.target.id].scrollStart(e);
    },
    touchmove(e){
      uChartsInstance[e.target.id].scroll(e);
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