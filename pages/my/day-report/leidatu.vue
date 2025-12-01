<template>
  <view>
    <canvas canvas-id="leida" id="leida" class="charts" @touchend="tap"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
var uChartsInstance = {};
export default {
    props: {
      leidaDatas: {
        type: Object,
        required: false,
        default: {} // 设置默认值为空对象
      },
	  index: {
        type: Number,
        required: false,
        default: 0 // 设置默认值为空对象
	  }
    },
    watch:{
        leidaDatas: {
            handler(newValue, oldValue) {  
             // console.log(newValue); 
              // 这里可以处理你的逻辑
			  this.drawCharts(`leida`, this.leidaDatas);
            },  
            deep: true, // 启用深度监听  
            immediate: false // 是否立即以当前的 prop 值触发回调
          }
    },
  data() {
    return {
      cWidth: 750,
      cHeight: 500
    };
  },
  mounted() {
    //这里的 750 对应 css .charts 的 width
    this.cWidth = uni.upx2px(700);
    //这里的 500 对应 css .charts 的 height
    this.cHeight = uni.upx2px(500);
    this.getServerData();
  },
  methods: {
    getServerData() {
      /* //模拟从服务器获取数据时的延时
      setTimeout(() => {
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
            categories: ["维度1","维度2","维度3","维度4","维度5","维度6"],
            series: [
              {
                name: "成交量1",
                data: [90,110,165,195,187,172]
              },
              {
                name: "成交量2",
                data: [190,210,105,35,27,102]
              }
            ]
          };
        this.drawCharts('leida', res);
      }, 500); */
	  this.drawCharts('leida', this.leidaDatas);
    },
    drawCharts(id,data){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "radar",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [5,5,5,5],
        dataLabel: true, // 启用数据标签
        enableScroll: false,
        legend: {
          show: false,
          position: "right",
          lineHeight: 25
        },
        extra: {
          radar: {
            // gridType: "radar",//方形
			gridType: "circle",//圆形
            gridColor: "#CCCCCC",
            gridCount: 4,
            opacity: 0.2,
            max: 3.5,
            labelShow: true,
            border: true
          },
		  // 添加数据标签样式配置
		  dataLabel: {
		   show: true,
		   fontSize: 12,
		   color: '#333',
		   fontWeight: 'bold',
		   formatter: function(val) {
		     return val.toFixed(1); // 保留1位小数，根据需要调整
		   }
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