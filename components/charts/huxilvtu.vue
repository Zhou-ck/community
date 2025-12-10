<template>
  <view>
	  <view class="head_info" v-if="!!sortedSleepData.length">
	  	<view class="head_info_item">平均呼吸:{{sleepReport.bm !== undefined ? sleepReport.bm : '--'}}</view>
	  	<!-- <view class="head_info_item">呼吸暂停:{{sleepReport.hxztcs?sleepReport.hxztcs:0}}</view> -->
	  </view>
    <!-- <canvas canvas-id="xl" id="xl" class="charts" @touchend="tap" v-if="!!sortedSleepData.length"/> -->
    <canvas canvas-id="xl" id="xl" class="charts" @touchmove="tap($event)" @touchend="tap($event)" v-if="!!sortedSleepData.length"/>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js';
import {formatDatesMinute, formatDate} from '@/utils/getdate'
var uChartsInstance = {};
export default {
	props: {
	  sleepReport:{
	  	type: Object,
	  	required: true,
	  	default: {} // 设置默认值为空对象
	  },
	  name:{
	    type: String,
	    required: true,
	    default: '' // 设置默认值为空对象
	  }
	},
	/* watch:{
		sleepReport: {
			handler(newVal) {
				if (newVal?.tenDatas) {
					this.sortedSleepData = newVal.tenDatas;
					this.processData();
				}
			},
			deep: true,
			immediate: true
		}
	}, */
  data() {
    return {
      cWidth: 700,
      cHeight: 400,
	  sortedSleepData:[]
    };
  },
  mounted() {
    //这里的 750 对应 css .charts 的 width
    this.cWidth = uni.upx2px(700);
    //这里的 500 对应 css .charts 的 height
    this.cHeight = uni.upx2px(400);
    // this.getServerData();
	this.processData();
  },
  methods: {
	/* 处理传递来的睡眠数据中的时间*/
	processData(){
		this.sortedSleepData = this.sleepReport.tenDatas;
		const len = this.sortedSleepData.length;
		if(len == 0) return;
		this.sortedSleepData[0].createTime=formatDate(new Date(this.sleepReport.startSleepTime));
		this.sortedSleepData[len-1].createTime=formatDate(new Date(this.sleepReport.endSleepTime));
		
		for(let i=0;i<this.sortedSleepData.length;i++){
			this.sortedSleepData[i].time=formatDatesMinute(new Date(this.sortedSleepData[i].createTime))
		}
		this.getServerData()
	},
	/* 取最大值*/
	getMaxValue(arr){
		let max=10;
		for(let i = 0;i<arr.length;i++){
		  if(arr[i]>max){
			  max=arr[i];
		  }
		}
		return max;
	},
	  /* 设置图表数据 */
    getServerData() {
      //模拟从服务器获取数据时的延时
        //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
        let res = {
            // categories: ["22:40","","","","","","23:40","","","","","","00:40","","","","","","01:40","","","","","","02:40","","","","","","03:40","","","","","","04:40","","","","","","05:40"],
            categories: [],
            series: [
              {
                name: this.name+"/分",
                // data: [15,12,15,13,18,12,15,12,15,13,18,12,15,12,15,13,18,12,15,12,15,13,18,12,15,12,15,13,18,12,15,12,15,13,18,12,15,12,15,13,18,12]
                data: []
              }
            ],
			max:0
          };
		  for(let i=0;i<this.sortedSleepData.length;i++){
			  if(i%6===0){
			  	res.categories.push(this.sortedSleepData[i].time)
			  }else if(i===this.sortedSleepData.length - 1 && (i%6) > 3){
			  	res.categories.push(this.sortedSleepData[i].time)
			  }else{
			  	res.categories.push("")
			  }
			  res.series[0].data.push(Number(this.sortedSleepData[i].br))
		  }
		  res.max=this.getMaxValue(res.series[0].data)
		  // console.log(res)
        this.drawCharts('xl', res);
    
    },
    drawCharts(id,datas){
      const ctx = uni.createCanvasContext(id, this);
      uChartsInstance[id] = new uCharts({
        type: "area",
        context: ctx,
        width: this.cWidth,
        height: this.cHeight,
        categories: datas.categories,//横坐标
        series: datas.series,
        animation: false,
        background: "#FFFFFF",
        color: ["#08cb2d","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [10,10,0,10],
        enableScroll: false,
		dataLabel:false,//是否显示图表区域内数据点上方的数据文案
		dataPointShape:false,//是否显示数据点的图形标识
        legend: {},
        xAxis: {
          disableGrid: true,
		  fontSize:9,
		  // labelCount:36,//数据点文字（刻度点）单屏幕限制显示的数量
		  // itemCount:36,
		  // scrollShow:true,
		  // scrollColor:'#08cb2d'
        },
        yAxis: {
          gridType: "dash",//虚线
          dashLength: 2,//虚线长度
		  disableGrid: true,//隐藏横线
		  data: [{
			  fontSize:9,
		  	fontColor: '#999999',
			min:0,
			max:(datas.max-datas.max%5+10)
		  }]
        },
        extra: {
          area: {
            type: "curve",//区域图类型，可选值："straight"尖角折线模式,"curve"曲线圆滑模式,"step"时序图模式
            opacity: 0.9,//区域图透明度
            addLine: true,//是否叠加相应的折线
            width: 1,//叠加的折线宽度
            gradient: true,//是否开启区域图渐变色
            activeType: "none"//激活指示点类型，可选值："none"不启用激活指示点,"hollow"空心点模式,"solid"实心点模式
			
          }
        }
      });
    },
    tap(e){
		// console.log(e)
      uChartsInstance[e.target.id].touchLegend(e);
      uChartsInstance[e.target.id].showToolTip(e);
    }
  }
};
</script>

<style lang="scss" scoped>
  .charts{
    width: 700rpx;
    height: 400rpx;
  }
  .head_info{
	  font-size: 25rpx;
	  color:#969696;
	  line-height: 60rpx;
	  background-color: #152949;
	  border-color: #152949;
	  padding: 0 130rpx;
	  padding-top: 30rpx;
	  display: flex;
	  justify-content: space-around;
	  .head_info_item{
		  background-color: #26395a;
		  width: 200rpx;
		  border: 1px solid #26395a;
		  border-radius: 15rpx;text-align: center;
	  }
  }
</style>