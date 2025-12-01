<template>
	<view class="calendar-box">
		<!-- <button @click="aa">aa</button> -->
		<!-- 上月下月标签 -->
		<view class="calendar-top-box">
			<!-- 左箭头图片，用于切换到上个月 -->
			<text class="text_a calendar-top-btn" @click="changeSub">上一月</text>
			<!-- 当前月份标题 -->
			<view class="calendar-top-title">{{!!formatMonth(todayMonth)?formatMonth(todayMonth):'--'}}</view>
			<!-- 右箭头图片，用于切换到下个月 -->
			<text class="text_a calendar-top-btn" @click="changeAdd">下一月</text>
		</view>

		<!-- 显示周几标题 -->
		<view class="calendar-week-box">
			<view class="week-title" v-for="(item,index) in weekList" :key="index">{{item}}</view>
		</view>

		<!-- 显示当前月份中的每一天 -->
		<view class="calendar-center-box">
			<!-- 根据月份数组渲染每天，并设置选中效果和背景颜色 -->
			<view class="calendar-center-tiem" :style="[index === 0 ? oneDayClass : {}, item.bgColor] " v-for="(item,index) in monthArr" :key="index" @click="onDayClick(item, index)">
				{{index + 1}}
				<!-- 当前选中日期的指示点 -->
				<view class="spot" v-if="monthIndex == index"></view>
			</view>
		</view>
		<!-- 日历底部状态指示，分别表示优质、良好、一般和差 -->
		<view class="calendar-bottom-box">
			<view class="calendar-bottom-item">
				<view style="margin: 0 auto;color: #20ABFF;">{{gradeA}}</view>
				<view class="calendar-bottom-item_bottom">
					<text class="blue-span"></text>
					<text style="color: #20ABFF;">优质</text>
				</view>
				<view style="margin: 0 auto;color: #20ABFF;">{{gradeAPercentage}}%</view>
			</view>
			<view class="calendar-bottom-item">
				<view style="margin: 0 auto;color: #39ba77;">{{gradeB}}</view>
				<view class="calendar-bottom-item_bottom">
					<text class="purple-span"></text>
					<text style="color: #39ba77;">良好</text>
				</view>
				<view style="margin: 0 auto;color: #39ba77;">{{gradeBPercentage}}%</view>
			</view>
			<view class="calendar-bottom-item">
				<view style="margin: 0 auto;color: #F5A000;">{{gradeC}}</view>
				<view class="calendar-bottom-item_bottom">
					<text class="yellow-span"></text>
					<text style="color: #F5A000;">一般</text>
				</view>
				<view style="margin: 0 auto;color: #F5A000;">{{gradeCPercentage}}%</view>
			</view>
			<view class="calendar-bottom-item"> 
				<view style="margin: 0 auto;color: #FF6E6E;">{{gradeD}}</view>
				<view class="calendar-bottom-item_bottom">
					<text class="red-span"></text>
					<text style="color: #FF6E6E;">差</text>
				</view>
				<view style="margin: 0 auto;color: #FF6E6E;">{{gradeDPercentage}}%</view>
			</view>
		</view>
		
		<!-- 日历版bottoms -->
		<view class="bottoms_end">
			<view class="bottoms_end_item">
				<text class="text_a">{{avgDaySleepScore || '--'}}</text>
				<text class="text_b">平均睡眠质量</text>
			</view>
			<view class="bottoms_end_item">
				<text class="text_a">{{avgDaySleepTime > 0 ? (parseInt(avgDaySleepTime/60) + '时' + (avgDaySleepTime%60) + '分') : '--'}}</text>
				<text class="text_b">平均睡眠时长</text>
			</view>
			<view class="bottoms_end_item">
				<text class="text_a">{{minDaySleepTime > 0 && minDaySleepTime !== Infinity ? (parseInt(minDaySleepTime/60) + '时' + (minDaySleepTime%60) + '分') : '--'}}</text>
				<text class="text_b">最短睡眠时长</text>
			</view>
			<view class="bottoms_end_item">
				<text class="text_a">{{maxDaySleepTime > 0 ? (parseInt(maxDaySleepTime/60) + '时' + (maxDaySleepTime%60) + '分') : '--'}}</text>
				<text class="text_b">最长睡眠时长</text>
			</view>
		</view>

		<!-- 在床时长图 -->
		<view class="turn">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #3ed196; box-shadow: 0 0 15rpx rgba(62, 209, 150, 0.4);"></view>
				<view class="chart-name">月在床时长</view>
			</view>
            <view>
                <yuezaichuangshichangtu :monthOnBedTimeArr="monthOnBedTimeArr" :monthEveryDayArr="monthEveryDayArr"></yuezaichuangshichangtu>
            </view>
        </view>

		<!-- 翻身次数图 -->
		<view class="turn">
			<view class="chart-header">
				<view class="chart-bar" style="background-color: #73c0de; box-shadow: 0 0 15rpx rgba(115, 192, 222, 0.4);"></view>
				<view class="chart-name">月翻身次数</view>
			</view>
			<view>
				<yuefanzhuan :monthFanShenCiShuArr="monthFanShenCiShuArr" :monthEveryDayArr="monthEveryDayArr"></yuefanzhuan>
			</view>
		</view>

		<!-- 心率图 -->
		<view class="turn">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #EE3a66; box-shadow: 0 0 15rpx rgba(238, 58, 102, 0.4);"></view>
				<view class="chart-name">月心率</view>
			</view>
            <view>
                <yuexinlvzhexiantu :monthHeartRateArr="monthHeartRateArr" :monthEveryDayArr="monthEveryDayArr"></yuexinlvzhexiantu>
            </view>
        </view>

		<!-- 呼吸率图 -->
		<view class="turn">
			<view class="chart-header">
				<view class="chart-bar" style="background-color: #73de91; box-shadow: 0 0 15rpx rgba(115, 222, 145, 0.4);"></view>
				<view class="chart-name">月呼吸率</view>
			</view>
			<view>
				<yuehuxizhexiantu :monthBreathRateArr="monthBreathRateArr" :monthEveryDayArr="monthEveryDayArr"></yuehuxizhexiantu>
			</view>
		</view>

	<!-- AHI指数 -->
	<view class="turn">
		<view class="chart-header">
			<view class="chart-bar" style="background-color: #0ee7e0; box-shadow: 0 0 15rpx rgba(14, 231, 224, 0.4);"></view>
			<view class="chart-name">月AHI指数</view>
		</view>
		<view>
			<yueahizhexiantu :monthAHIArr="monthAHIArr" :monthEveryDayArr="monthEveryDayArr"></yueahizhexiantu>
		</view>
	</view>
	</view>
</template>
<script>
	import dayjs from './day.js'
	import {formatDatesDay,formatDate,formatDatesMonth, getDayStartAndEndTimestamps} from '@/utils/getdate.js'
	import {listReportsleep} from '@/api/reportsleep.js'
	import {listTensleep} from '@/api/tensleep.js'
    import { sleepReportHandler, sleepReportHandlerAvg, fenGeMonthReports, sortTenData, huoQuShuiMianShiDuan, huoQuShuiMianShiDuanFormat } from '@/utils/handleSleepReport.js'

	import yuefanzhuan from '@/components/charts/yuefanzhuan.vue'
	import yueahizhexiantu from '@/components/charts/yueahizhexiantu.vue'
	import yuezaichuangshichangtu from '@/components/charts/yuezaichuangshichangtu.vue'
	import yuexinlvzhexiantu from '@/components/charts/yuexinlvzhexiantu.vue'
	import yuehuxizhexiantu from '@/components/charts/yuehuxizhexiantu.vue'


	export default {
		props: {
		  productKey: {
		    type: String,
		    required: true,
		    default: '' // 设置默认值为空对象
		  },
		  deviceKey:{
			  type: String,
			  required: true,
			  default: '' // 设置默认值为空对象
		  },

		},
		watch:{
			deviceKey:{
				handler(newValue,oldValue){
					this.initContent();
				},
				deep: true, // 启用深度监听
				immediate: false // 是否立即以当前的 prop 值触发回调
			},
		},
		components:{
			yuefanzhuan,
			yueahizhexiantu,
			yuezaichuangshichangtu,
			yuexinlvzhexiantu,
			yuehuxizhexiantu
		},
		data() {
			return {
				oneDay: 0, // 当前月份的第一天是周几
				oneDayClass: '', // 用于动态设置第一天的样式
				tabIndex: 1, // tab栏的索引
				weekList: ['日', '一', '二', '三', '四', '五', '六'], // 周几的列表
				monthArr: [], // 当前月份的每一天信息
				monthIndex: 0, // 当前选中的日期索引
				todayMonth: dayjs().format("YYYY-MM-DD"), // 当前月份
				oneDayTimeStamp:86400000-1,
				
				gradeA:0,//优质
				gradeB:0,//良好
				gradeC:0,//一般
				gradeD:0,//差
				gradeAPercentage:0,//优质百分比
				gradeBPercentage:0,//良好百分比
				gradeCPercentage:0,//一般百分比
				gradeDPercentage:0,//差百分比
				avgDaySleepTime:0,//平均睡眠时长
				avgDaySleepScore:0,//平均睡眠质量
				minDaySleepTime:0,//最短睡眠时长
				maxDaySleepTime:0,//最长睡眠时长
				timer:null,//定时器
				timerA:null,//定时器

				//xinde
				monthStartTimeStamp:0,
				monthEndTimeStamp:0,
				monthEveryDayArr:[],//月每一天
				monthAHIArr:[],//月AHI值
				monthOnBedTimeArr:[],//月在床时间
				monthHeartRateArr:[],//月心率
				monthBreathRateArr:[],//月呼吸率
				monthFanShenCiShuArr:[],//月翻身次数
				//xinde
			};
		},
		mounted() {
			this.initContent();
		},
		methods: {
			
			/* 切换到上个月 */
			changeSub(e) {
				// 将当前月份减1，并重置为该月的第一天
				this.todayMonth = dayjs(this.todayMonth).add(-1, 'month').startOf('month').format('YYYY-MM-DD')
				this.monthIndex = 0
				this.initContent()
				
			},
			
			/* 切换到下个月 */
			changeAdd(e) {
				if((new Date(formatDatesMonth(new Date())).getTime()<= new Date(formatDatesMonth(new Date(this.todayMonth))).getTime())){
					this.$modal.msg("已经到尽头了~")
					return
				}else{
					this.todayMonth = dayjs(this.todayMonth).add(1, 'month').startOf('month').format('YYYY-MM-DD')
					this.monthIndex = 0;
					this.initContent()
				}
			},
			
			/* 格式化当前月份为"YYYY年MM月"的形式 */
			formatMonth() {
				return dayjs(this.todayMonth).format('YYYY年MM月')
			},
			
			/** 初始渲染内容 */
			initContent(){
				if(!!this.productKey && !!this.deviceKey){
					this.processMonthData()
				}
			},


			/** 处理月份信息 */
			async processMonthData(){
				//获取当前月份包含的天数
				let daysInMonth = dayjs(this.todayMonth).daysInMonth();//本月一共多少天，即本月的最后一天是几号
				let start = 1//本月的1号
				let currentStart = dayjs(this.todayMonth).date(start);//当前日期
				let currentEnd = dayjs(this.todayMonth).date(daysInMonth).endOf('day');//当前日期
				const startTimeStamp=new Date(currentStart).getTime();//本月第一天0:0:0的时间戳
				const endTimeStamp=new Date(currentEnd).getTime();//本月最后一天23:59:59的时间戳
				
				this.monthStartTimeStamp=startTimeStamp;
				this.monthEndTimeStamp=endTimeStamp;

				this.getDaysArrayByMonth(daysInMonth,start);
			},

			
			/* 获取当前月份包含的所有天数 */
			async getDaysArrayByMonth(daysInMonth,start) {

				/* 获取当前月份的睡眠报告数据 */
				//1.构建请求参数
				const query={
				    deviceKey: this.deviceKey,
				    productKey: this.productKey,
				    startTimeStamps:this.monthStartTimeStamp,
				    endTimeStamps:this.monthEndTimeStamp
				}
				//2.发送请求
				const res = await listReportsleep(query);

				//3.分割出每个月的睡眠报告数据(加权均分算好了)
				let monthReports = fenGeMonthReports(res.rows,this.monthStartTimeStamp,this.monthEndTimeStamp);

				// 如果没有数据，创建默认的月份数据
				if(!monthReports || monthReports.length === 0){
					monthReports = [];
					for(let i = 1; i <= daysInMonth; i++){
						const currentDate = dayjs(this.todayMonth).date(i).format('YYYY-MM-DD');
						monthReports.push({
							date: currentDate,
							allData: {
								jiaquanPingJunFen: 0,
								sleepTimeAll: 0,
								zaiChuangShiChangALL: 0,
								AHI: 0,
								huXiZanTing: 0
							},
							reports: [],
							dayStartTimeStamp: dayjs(currentDate).startOf('day').valueOf(),
							dayEndTimeStamp: dayjs(currentDate).endOf('day').valueOf()
						});
					}
				}

				let monthEveryDay = monthReports.map(item => item.date.substring(5));
				this.monthEveryDayArr = monthEveryDay;

				//A.计算日历区域相关的数据
				this.getRiLiData(monthReports);

				//B.请求并计算AHI值
				this.getAHIValueArr(monthReports);

				//C.计算月在床时间的柱状图数据
				this.getMonthOnBedTimeArr(monthReports);

				//D.计算月心率折线图数据
				this.getMonthHeartRateArr(monthReports);

				//E.计算月呼吸率折线图数据
				this.getMonthBreathRateArr(monthReports);

				//F.计算月翻身次数折线图数据
				this.getMonthFlipCountArr(monthReports);


			},


			/** A计算日历区域相关的数据 */
			async getRiLiData(monthReports){
				let monthArr = [];

				for(let dayReport of monthReports){

					//赋值日期内容
					monthArr.push({
						date: dayReport.date,
						avgDaySleepScore: dayReport.avgDaySleepScore,
						allData: dayReport.allData
					});
				}
				/* 格式化每一天的日期，并设置背景颜色 */
				monthArr.forEach((item, index) => {
					//设置背景颜色
					monthArr[index].bgColor = this.getDayBgColor(1, 2, monthArr[index])

					// 如果日期是今天，则设置选中状态
					if (dayjs(monthArr[index].date).format("YYYY-MM-DD") == dayjs().format("YYYY-MM-DD")) {
						this.monthIndex = index;
					}
				});
				
				// 获取该月的第一天是周几
				if(monthArr.length > 0){
					this.getDaysWeek(monthArr[0].date);
				} else {
					// 如果没有数据，使用当前月份的第一天
					this.getDaysWeek(dayjs(this.todayMonth).startOf('month').format('YYYY-MM-DD'));
				}
				
				//赋值月份数组
				this.monthArr = monthArr;

				this.processData(monthArr);
			},

			/* 获取日期的背景颜色 */
			getDayBgColor(morning, night, dayData) {
				
				// let score = Math.round(Math.random() * 100); // 模拟早上颜色 //这个只是演示
				let score = dayData.avgDaySleepScore; // 模拟上颜色
				/* console.log('请求到的评分为：',score); */
				
				//是否周六日（0，6为周日周六，则返回灰色）-- // 判断是否是周末
				let isWeek = dayjs(dayData.date).day() //isWeek代表周几
				
				
				//表示今天之前或者以后 -- // 判断是否是今天
				let isToday = dayjs().format("YYYY-MM-DD") == dayData.date
				if (isToday) return {
					"border": "5rpx solid #3ed196",
					"color": "#3ed196"
				}
				
				// 判断是否是未来的日期,是的话设置颜色为 --#f1f1f1--
				let isFuture = dayData.date > dayjs().format("YYYY-MM-DD")
				if (isFuture) return {
					"background": "#f1f1f1"
				}
				
				return {
					"background": this.setColor(Number(score)),
					"color": "#FFFFFF",
					"score": score
				}
			},

			/* 判断是什么颜色 */
			setColor(num){
				if(num>90){
					// this.gradeA++;
					return '#20abff'
				}else if(num>75){
					// this.gradeB++;
					return '#39ba77'
				}else if(num>60){
					// this.gradeC++;
					return '#f5a000'
				}else if(num>0){
					// this.gradeD++
					return '#ff6e6e'
				}else{
					return '#f1f1f1'
				}
			},

			/* 获取当前星期几 */
			getDaysWeek(e) {
				let oneDay = dayjs(e).day() + 1 || 0// 当前月份的第一天是周几??????
				// console.log(dayjs(e).day(),"--");
				this.oneDayClass = {
					'grid-column-start': oneDay// 动态设置该天在日历中的位置
				}
			},

			/** 计算 睡眠质量 优质-良好-一般-差 的占比及数量 */
			processData(monthArr){
				let count = 0;
				this.gradeA=0;
				this.gradeB=0;
				this.gradeC=0;
				this.gradeD=0;
				this.gradeAPercentage=0;
				this.gradeBPercentage=0;
				this.gradeCPercentage=0;
				this.gradeDPercentage=0;
				let sleepTimeSum=0;
				let sleepScoreSum=0;
				let maxSleepTime =-Infinity;
				let minSleepTime =Infinity;
				let validDataCount = 0; // 有效数据计数
				
				for(let i = 0 ;i<monthArr.length;i++){
					const temp =monthArr[i]
					
					if(temp.avgDaySleepScore>90){
						this.gradeA=this.gradeA+1;
						// console.log("睡眠--优质")
					}else if(temp.avgDaySleepScore>75){
						this.gradeB=this.gradeB+1;
						// console.log("睡眠--良好")
					}else if(temp.avgDaySleepScore>60){
						this.gradeC=this.gradeC+1;
						// console.log("睡眠--一般")
					}else if(temp.avgDaySleepScore>0){
						this.gradeD=this.gradeD+1;
						// console.log("睡眠--差")
					}else{
						count++
						// console.log("无睡眠数据")
					}
					
					// 只处理有效的睡眠时长数据
					if(Number(temp.allData.sleepTimeAll) > 0){
						if(Number(temp.allData.sleepTimeAll)>maxSleepTime){
							maxSleepTime=Number(temp.allData.sleepTimeAll)
						}
						if(Number(temp.allData.sleepTimeAll)<minSleepTime){
							minSleepTime=Number(temp.allData.sleepTimeAll)
						}
						sleepTimeSum=sleepTimeSum+Number(temp.allData.sleepTimeAll)
						validDataCount++;
					}
					
					// 只处理有效的睡眠质量数据
					if(Number(temp.avgDaySleepScore) > 0){
						sleepScoreSum=sleepScoreSum+Number(temp.avgDaySleepScore)
					}
				}
				
				// 计算有效数据的统计信息
				if(!!(monthArr.length-count)){
					this.gradeAPercentage=(this.gradeA/(monthArr.length-count)*100).toFixed(1);
					this.gradeBPercentage=(this.gradeB/(monthArr.length-count)*100).toFixed(1);
					this.gradeCPercentage=(this.gradeC/(monthArr.length-count)*100).toFixed(1);
					this.gradeDPercentage=(this.gradeD/(monthArr.length-count)*100).toFixed(1);
					
					// 计算平均睡眠质量
					const validScoreCount = monthArr.length - count;
					if(validScoreCount > 0){
						this.avgDaySleepScore=(sleepScoreSum/validScoreCount).toFixed(1);
					} else {
						this.avgDaySleepScore = 0;
					}
					
					// 计算睡眠时长相关数据
					if(validDataCount > 0){
						this.avgDaySleepTime=(sleepTimeSum/validDataCount).toFixed(0);
						this.minDaySleepTime = minSleepTime === Infinity ? 0 : minSleepTime;
						this.maxDaySleepTime = maxSleepTime === -Infinity ? 0 : maxSleepTime;
					} else {
						this.avgDaySleepTime = 0;
						this.minDaySleepTime = 0;
						this.maxDaySleepTime = 0;
					}
				} else {
					// 完全没有数据时的处理
					this.avgDaySleepScore = 0;
					this.avgDaySleepTime = 0;
					this.minDaySleepTime = 0;
					this.maxDaySleepTime = 0;
				}
				
			},





			/** B.请求并计算AHI值 */
			async getAHIValueArr(monthReports){
				
				//第一天开始的时间戳
				const dayStartTimeStamp = monthReports[0].dayStartTimeStamp;
				//最后一天结束的时间戳
				const dayEndTimeStamp = monthReports[monthReports.length - 1].dayEndTimeStamp;

				//请求呼吸暂停次数
				const res = await this.getHuXiZanTing(dayStartTimeStamp,dayEndTimeStamp);

				//获取每一天的呼吸暂停次数
				for(let dayReport of monthReports){
					
					let huxizantingNum = 0;
					for(let report of dayReport.reports){
						for(let item of res.rows){
							if(item.endTime >= report.startSleepTime && item.endTime <= report.endSleepTime){
								huxizantingNum++;
							}
						}
					}
					dayReport.allData.huXiZanTing = huxizantingNum;

					const TST = Math.round(dayReport.allData.sleepTimeAll * 10 / 60)  /10;//睡眠时长（不含清醒)(单位：小时)
					if(TST>0){
						let num = (huxizantingNum / TST) * 10;
						let AHI = Math.round(num) / 10;
						dayReport.allData.AHI = AHI;
					}else{
						dayReport.allData.AHI = 0;
					}
				}


				this.monthAHIArr = monthReports.map(item => item.allData.AHI);

			},

			/** 获取呼吸暂停次数 */
			async getHuXiZanTing(timeStampStart,timeStampEnd){
				const queryParams = {
					pageNum: 1,
					pageSize: 300,
					deviceKey: this.deviceKey,//devicekey
					productKey: this.productKey,//productkey
					StartTime:timeStampStart,
					EndTime:timeStampEnd
				}
				return await listTensleep(queryParams);
			},

			/** C.计算月在床时间的柱状图数据 */
			async getMonthOnBedTimeArr(monthReports){
				// console.log(monthReports);

				this.monthOnBedTimeArr = monthReports.map(item => item.allData.zaiChuangShiChangALL);
			},

			/** D.计算月心率折线图数据 */
			async getMonthHeartRateArr(monthReports){
				// 清空之前的数据
				this.monthHeartRateArr = [];
				
				for (let dayReport of monthReports) {
					let heartRateNum = 0;
					let validCount = 0;
					for(let report of dayReport.reports){
						const heartRate = Number(report.bn); // bn = 平均心跳 (新字段)
						if(!isNaN(heartRate) && heartRate > 0){
							heartRateNum += heartRate;
							validCount++;
						}
					}
					if(validCount > 0){
						this.monthHeartRateArr.push(Math.round(heartRateNum/validCount));
					}else{
						this.monthHeartRateArr.push(0);
					}
				}

			},

			/** E.计算月呼吸率折线图数据 */
			async getMonthBreathRateArr(monthReports){
				// 清空之前的数据
				this.monthBreathRateArr = [];
				
				for (let dayReport of monthReports) {
					let breathRateNum = 0;
					let validCount = 0;
					for(let report of dayReport.reports){
						const breathRate = Number(report.bm); // bm = 平均呼吸 (新字段)
						if(!isNaN(breathRate) && breathRate > 0){
							breathRateNum += breathRate;
							validCount++;
						}
					}
					if(validCount > 0){
						this.monthBreathRateArr.push(Math.round(breathRateNum/validCount));
					}else{
						this.monthBreathRateArr.push(0);
					}
				}
			},

			/** F.计算月翻身次数折线图数据 */
			async getMonthFlipCountArr(monthReports){
				// 清空之前的数据
				this.monthFanShenCiShuArr = [];
				
				for (let dayReport of monthReports) {
					let fanshenNum = 0;
					let validCount = 0;
					for(let report of dayReport.reports){
						const flipCount = Number(report.bl); // bl = 翻身次数 (新字段)
						if(!isNaN(flipCount) && flipCount >= 0){
							fanshenNum += flipCount;
							validCount++;
						}
					}
					if(validCount > 0){
						this.monthFanShenCiShuArr.push(Math.round(fanshenNum/validCount));
					}else{
						this.monthFanShenCiShuArr.push(0);
					}
				}
			},

			/** 点击日历中的日期 */
			onDayClick(item, index) {

				let chuandideneirong ={
					pageNum: 1,
					pageSize: 300,
					productKey:this.productKey,
					deviceKey:this.deviceKey,
					date:item.date,
					nowMonth:this.todayMonth,
					// nowMonthDays:this.todayMonthDays
				}


				// console.log('选中的日期：',item.date)

                const chooseDateStamp = getDayStartAndEndTimestamps(new Date(item.date)).endTimestamp;
                const todayDateStamp = getDayStartAndEndTimestamps(new Date()).endTimestamp;
                if( chooseDateStamp > todayDateStamp){
                    this.$modal.msg("请选择今天及过去的时间~")
                    return;
                }else{
					this.$modal.loading("正在加载日报告...");
                }
				
                /* 跳转日报告页（回传参数） */
                this.$emit('toDayReport',{
                    value:chuandideneirong
                })
			},


















			
			
			
			

























































			
		}
	};
</script>

<style lang="scss">
	/* 当前选中日期的指示点 */
	.spot {
		display: flex;
		margin: 8rpx auto 0;
		width: 8rpx;
		height: 8rpx;
		background-color: #3ed196;
		border-radius: 50%;
	}

	/* 日历容器 */
	.calendar-box {
		overflow: hidden;
		margin: 0;
		width: 100%;
		background: #FFFFFF;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
		border-radius: 10rpx;
		box-sizing: border-box;
		
		/* 上月下月标签容器 */
		.calendar-top-box {
			display: flex;
			justify-content: space-between;
            align-items: center;
			margin: 20rpx 0;
            padding: 10rpx 20rpx;
			
            /* 左右按钮 */
            .calendar-top-btn {
                color: #3ed196;
                background-color: rgba(62, 209, 150, 0.1);
                padding: 12rpx 24rpx;
                border-radius: 30rpx;
                font-size: 28rpx;
                font-weight: bold;
            }

			/* 上月下月箭头图标 */
			.calendar-top-title {
				width: auto;
				text-align: center;
				height: 64rpx;
				font-size: 34rpx;
				font-weight: bold;
				color: #3ed196;
				line-height: 64rpx;
				margin: 0;
			}
			
			/* 当前月份标题 */
			.calendar-img {
				height: 32rpx;
				width: 32rpx;
				margin: 16rpx 0;
			}
		}
		
		/* 周几标题容器 */
		.calendar-week-box {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
			margin: 0 40rpx;
			grid-gap: 24rpx;
			
			/* 周几标题 */
			.week-title {
				width: 64rpx;
				text-align: center;
				height: 42rpx;
				font-size: 28rpx;
				font-weight: 500;
				color: #C5C5C5;
				line-height: 42rpx;
			}
		}
		
		/* 当前月份日期容器 */
		.calendar-center-box {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
			margin: 24rpx 40rpx;
			grid-gap: 24rpx;

			/* 日期样式 */
			.calendar-center-tiem {
				width: 56rpx;
				height: 56rpx;
				border-radius: 50%;
				line-height: 56rpx;
				text-align: center;

				font-size: 32rpx;
				color: #666666;
			}
		}

		/* 日历底部状态指示容器 */
		.calendar-bottom-box {
			margin: 32rpx 40rpx;
			display: flex;
			justify-content: space-between;
			/* 日历底部状态指示项 */
			.calendar-bottom-item {
				display: flex;
				font-size: 28rpx;
				color: #535353;
				line-height: 42rpx;
				display: flex;
				flex-direction: column;
				
				.calendar-bottom-item_bottom{
					display: flex;
					justify-content: space-around;
					/* 优质状态颜色 */
					.blue-span {
						display: block;
						width: 20rpx;
						height: 20rpx;
						background-color: #20ABFF;
						border-radius: 50%;
						margin: auto 16rpx auto 0;
					}
					
					/* 良好状态颜色 */
					.purple-span {
						display: block;
						width: 20rpx;
						height: 20rpx;
						background-color: #39ba77;
						border-radius: 50%;
						margin: auto 16rpx auto 0;
					}
					
					/* 一般状态颜色 */
					.yellow-span {
						display: block;
						width: 20rpx;
						height: 20rpx;
						background-color: #F5A000;
						border-radius: 50%;
						margin: auto 16rpx auto 0;
					}
					
					/* 差状态颜色 */
					.red-span {
						display: block;
						width: 20rpx;
						height: 20rpx;
						background-color: #FF6E6E;
						border-radius: 50%;
						margin: auto 16rpx auto 0;
					}
					
				}
				
				

			}
		}
	
		/* bottoms_end */
		.bottoms_end{
			padding: 15rpx;
			background: linear-gradient(20deg, rgba(70, 238, 168, 0.9), rgba(62, 209, 150,0.4), rgba(70, 238, 168, 0.9));
			display: flex;
			flex-wrap: wrap;
			.bottoms_end_item{
				width: 50%;
				display: flex;
				flex-direction: column;
				.text_a{
					font-size: 32rpx;
					color: #20abff;
					font-weight: 700;
					margin: 10rpx auto 2rpx auto;
				}
				.text_b{
					font-size: 30rpx;
					color:#888;
					font-weight: 700;
					margin: 0 auto 10rpx auto;
				}
			}
		}

		.turn{
            background: #fff;
            border-radius: 24rpx;
            margin: 30rpx auto;
            padding: 20rpx 20rpx 50rpx 20rpx;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
            width: 700rpx;
            box-sizing: border-box;

			.chart-header {
				display: flex;
				align-items: center;
				margin-bottom: 20rpx;
				padding-left: 10rpx;
				
				.chart-bar {
					width: 8rpx;
					height: 32rpx;
					border-radius: 4rpx;
					margin-right: 16rpx;
				}
				
				.chart-name {
					font-size: 32rpx;
					font-weight: bold;
					color: #333;
				}
			}
        }
	}
</style>