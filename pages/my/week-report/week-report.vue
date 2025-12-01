<template>
    <view class="alls">
        <!-- <button @click="getWeekReport()">getWeekReport</button> -->
        <!-- 日期选择区域 -->
        <view class="summarize">
            <view class="headd">
                <text class="text_a" @click="prevWeek">上一周</text>
                <uni-data-picker class="text_b" v-model="weekRange" readonly type="date" start="1949-10-01" end="2024-12-31">{{ !!weekRange?weekRange:'--' }}</uni-data-picker>  
                <text class="text_a" @click="nextWeek">后一周</text>
            </view>
        </view>
		
		<!-- 周报告分析区域 -->
		<view class="summarize">
		    <view >
		        <zhoushuimiantu :sleepWeekData="weekSleepDatas"></zhoushuimiantu>
		    </view>
		    <view class="contents">
		        <view class="info_head">周报告分析</view>
		        <view class="info_content">
		            <view class="info_head_itemm">
		                <text class="ite_text_a">{{weekSleepTimeFormat}}</text>
		                <text class="ite_text_b">本周睡眠时间</text>
		            </view>
		            <view class="info_head_item">
		                <view class="info_head_item_a">
		                    <text class="ite_text_a">{{weekSleepTimeDiffFormat}}</text>
                            <text class="ite_text_b">较上周
                                <text v-if="(weekSleepTimeDiff>0)" style="color: #3ed196;font-size: 40rpx;font-weight: bolder;">↑</text>
                                <text v-if="(weekSleepTimeDiff<0)" style="color: #f56c6c;font-size: 40rpx;font-weight: bolder;">↓</text>
                            </text>
                    </view>
		                
		            </view>
		        </view>
		    </view>
		    <view class="foots">
		        <view class="foots_item">
		            <view class="item_left">
		                <view class="tu">{{ weekDeepSleepPercentage?weekDeepSleepPercentage:0 }}%</view>
		                <text class="texts">深睡眠</text>
		            </view>
		            <view class="item_right">
		                <view class="texts">{{ weekDeepSleepPercentageDiff?Math.abs(weekDeepSleepPercentageDiff):0 }}%</view>
		                <text class="tuu" v-if="(weekDeepSleepPercentageDiff>0)">↑</text>
		                <text class="tuu" v-if="(weekDeepSleepPercentageDiff<0)">↓</text>
		                <text class="tuu" v-if="(weekDeepSleepPercentageDiff===0)">--</text>
		            </view>
		        </view>
		        <view class="foots_item">
		            <view class="item_left">
		                <view class="tu">{{ weekQianShuiShiChangPercentage?weekQianShuiShiChangPercentage:0 }}%</view>
		                <text class="texts">浅睡眠</text>
		            </view>
		            <view class="item_right">
		                <view class="texts">{{ weekQianShuiShiChangPercentageDiff?Math.abs(weekQianShuiShiChangPercentageDiff):0 }}%</view>
		                <text class="tuu" v-if="(weekQianShuiShiChangPercentageDiff>0)">↑</text>
		                <text class="tuu" v-if="(weekQianShuiShiChangPercentageDiff<0)">↓</text>
		                <text class="tuu" v-if="(weekQianShuiShiChangPercentageDiff===0)">——</text>
		            </view>
		        </view>
		    </view>
		</view>
        
		<!-- 在床时间图 -->
        <view class="on_bed chart-card">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #3ed196; box-shadow: 0 0 15rpx rgba(62, 209, 150, 0.4);"></view>
				<view class="chart-name">周在床时长</view>
			</view>
            <view>
                <zaichuangshichangtu :sleepWeekData="weekOnBedTimeArr"></zaichuangshichangtu>
            </view>
            <view class="on_bed_texts">
                <view class="on_bed_texts_item">
                    <text class="bed_item_text_a" style="white-space: nowrap;" >{{ weekOnBedTimeMinFormat }}</text>
                    <text class="bed_item_text_b">最短</text>
                </view>
                <view class="on_bed_texts_item">
                    <text class="bed_item_text_a" style="white-space: nowrap;" >{{ weekOnBedTimeAvgFormat }}</text>
                    <text class="bed_item_text_b">平均</text>
                </view>
                <view class="on_bed_texts_item">
                    <text class="bed_item_text_a" style="white-space: nowrap;" >{{ weekOnBedTimeMaxFormat }}</text>
                    <text class="bed_item_text_b">最长</text>
                </view>
            </view>
        </view>
        
		<!-- 翻身次数图 -->
        <view class="turn chart-card">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #73c0de; box-shadow: 0 0 15rpx rgba(115, 192, 222, 0.4);"></view>
				<view class="chart-name">周翻转身体</view>
			</view>
            <view>
                <fanzhuan :sleepWeekData="weekFanShenNumArr"></fanzhuan>
            </view>
        </view>

        <!-- 平均心率 -->
        <view class="xinlv chart-card">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #EE3a66; box-shadow: 0 0 15rpx rgba(238, 58, 102, 0.4);"></view>
				<view class="chart-name">平均心率</view>
			</view>
            <view>
                <xinlvzhexiantu :sleepWeekData="weekXinlvValueAvgArr"></xinlvzhexiantu>
            </view>
        </view>

        <!-- 平均呼吸 -->
        <view class="breathe chart-card">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #73de91; box-shadow: 0 0 15rpx rgba(115, 222, 145, 0.4);"></view>
				<view class="chart-name">平均呼吸</view>
			</view>
            <view>
                <huxizhexiantu :sleepWeekData="weekHuXiValueAvgArr"></huxizhexiantu>
            </view>
        </view>

        <!-- AHI呼吸指数图 -->
        <view class="breathee chart-card">
            <view class="chart-header">
				<view class="chart-bar" style="background-color: #0ee7e0; box-shadow: 0 0 15rpx rgba(14, 231, 224, 0.4);"></view>
				<view class="chart-name">AHI指数</view>
			</view>
            <view>
                <ahizhexiantu :sleepWeekData="weekAhiValueArr"></ahizhexiantu>
            </view>
        </view>
    </view>
</template>
 
<script>
    import { formatDatesDay,formatDate } from '@/utils/getdate.js'
    import { fenGeWeekReports, sortTenData, huoQuShuiMianShiDuan, huoQuShuiMianShiDuanFormat } from '@/utils/handleSleepReport.js'
    import zhoushuimiantu from '@/components/charts/zhoushuimiantu.vue'
    import zaichuangshichangtu from '@/components/charts/zaichuangshichangtu.vue'
    import fanzhuan from '@/components/charts/fanzhuan.vue'
    import ahizhexiantu from '@/components/charts/ahizhexiantu.vue'
    import huxizhexiantu from '@/components/charts/huxizhexiantu.vue'
    import xinlvzhexiantu from '@/components/charts/xinlvzhexiantu.vue'
    import { listReportsleep } from '@/api/reportsleep.js'
    import { listTensleep } from '@/api/tensleep.js'
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
		  queryparams: {
			  type: Object,
			  default: () => ({}) // 接收父组件传递的查询参数
		  },
		  isShare:{
			  type: Boolean,
			  required: true,
			  default: false // 设置默认值为空对象
		  }
        },
        data() {
            return {
                queryParams: {
                    productKey: null,
                    deviceKey: null,
                    deviceId: null,
                    // identifier: 'bc',
                    date:null,//日期
                    moduleId: null,
                    weekBegin:null,//周开始
                    weekEnd:null//周结束
                },
               
                selectedDate: '', // 初始选中的日期
                weekRange:null, // 显示选中的周范围
                timeStampStart:null,
                timeStampEnd:null,
              
                //新的变量↓
                weekSleepDatas:[[],[],[]],//本周的睡眠图的数据
                weekSleepTime:0,//本周的睡眠时长
                lastWeekSleepTime:0,//上周的睡眠时长
                weekSleepTimeDiff:0,//本周与上周的睡眠时长差值
                weekDeepSleepPercentage:0,//本周的深睡百分比
                weekQianShuiShiChangPercentage:0,//本周的浅睡百分比
                lastWeekDeepSleepPercentage:0,//上周的深睡百分比
                lastWeekQianShuiShiChangPercentage:0,//上周的浅睡百分比
                weekDeepSleepPercentageDiff:0,//本周与上周的深睡百分比差值
                weekQianShuiShiChangPercentageDiff:0,//本周与上周的浅睡百分比差值
                weekOnBedTimeArr:[],//本周每一天的在床时长
                weekOnBedTimeMin:0,//本周在床时长的最小值
                weekOnBedTimeMax:0,//本周在床时长的最大值
                weekOnBedTimeAvg:0,//本周在床时长的平均值
                weekFanShenNumArr:[],//本周每一天的翻身次数
                weekAhiValueArr:[],//本周每一天的AHI值
                weekHuXiValueAvgArr:[],//本周每一天的呼吸次数平均值
                weekXinlvValueAvgArr:[],//本周每一天的心率平均值
                //新的变量↑

            }
        },
        components:{
            zhoushuimiantu,
            zaichuangshichangtu,
            fanzhuan,
            ahizhexiantu,
            huxizhexiantu,
            xinlvzhexiantu
        },
        computed:{
            //本周与睡眠时长（格式**小时**分钟）
            weekSleepTimeFormat(){
                const hours = Math.floor(this.weekSleepTime / 60);
                const minutes = this.weekSleepTime % 60;
                return `${hours}小时${minutes}分钟`;
            },
            //本周与上周的睡眠时长差值（格式**小时**分钟）
            weekSleepTimeDiffFormat(){
                const weekSleepTimeDiff = Math.abs(this.weekSleepTimeDiff);
                const hours = Math.floor(weekSleepTimeDiff / 60);
                const minutes = weekSleepTimeDiff % 60;
                return `${hours}小时${minutes}分钟`;
            },
            //本周在床时长总和（格式**小时**分钟）
            weekOnBedTimeFormat(){
                const hours = Math.floor(this.weekOnBedTime / 60);
                const minutes = this.weekOnBedTime % 60;
                return `${hours}小时${minutes}分钟`;
            },
            //本周在床时长平均值（格式**小时**分钟）
            weekOnBedTimeAvgFormat(){
                const hours = Math.floor(this.weekOnBedTimeAvg / 60);
                const minutes = this.weekOnBedTimeAvg % 60;
                return `${hours}小时${minutes}分钟`;
            },
            //本周在床时长最小值（格式**小时**分钟）
            weekOnBedTimeMinFormat(){
                const hours = Math.floor(this.weekOnBedTimeMin / 60);
                const minutes = this.weekOnBedTimeMin % 60;
                return `${hours}小时${minutes}分钟`;
            },
            //本周在床时长最大值（格式**小时**分钟）
            weekOnBedTimeMaxFormat(){
                const hours = Math.floor(this.weekOnBedTimeMax / 60);
                const minutes = this.weekOnBedTimeMax % 60;
                return `${hours}小时${minutes}分钟`;
            }
        },
        mounted() {
            if(this.productKey!=null && this.deviceKey!=null){
                
                this.queryParams.productKey	= this.productKey;
                this.queryParams.deviceKey 	= this.deviceKey;
                this.queryParams.deviceId 	= this.queryparams.deviceId;
                
                this.queryParams.date		=	formatDatesDay(new Date);
                this.chooseDate				=	formatDatesDay(new Date);
                this.selectedDate			=	formatDatesDay(new Date);
                this.calculateWeekRange(); // 初始化时计算周范围
                
                this.timeStampStart			=	new Date( this.queryParams.weekBegin+' 00:00:00').getTime();
                this.timeStampEnd			=	new Date( this.queryParams.weekEnd+' 23:59:59').getTime();
                this.queryParams.timeStampStart	=	this.timeStampStart;
                this.queryParams.timeStampEnd	=	this.timeStampEnd;
            }
        },
        methods: {
            
            /* 计算当前选中日期所在周的日期范围 */
            calculateWeekRange() {
                const date = new Date(this.selectedDate);//当前日期
                const weekBegin = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 2);
                const weekEnd   = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 8);
                const taday = new Date();//当前日期
                // console.log(formatDatesDay(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 8)))//当天所在周的后一周的周一的日期
                // console.log(formatDatesDay(weekEnd))
                const tadayNextWeekStart=new Date(formatDatesDay(new Date(taday.getFullYear(), taday.getMonth(), taday.getDate() - taday.getDay() + 8))).getTime()
                // console.log(date.getTime(),"======",weekBegin.getTime(),"======",weekEnd.getTime())
                if(tadayNextWeekStart < new Date(formatDatesDay(weekEnd)).getTime()){
                    const date = new Date(this.selectedDate);
                    date.setDate(date.getDate() - 7);
                    this.selectedDate = date.toISOString().split('T')[0];
                    // console.log(this.selectedDate)
                    this.$modal.msg("已经到尽头了~")
                    return
                }else{
                    // console.log(weekBegin.toISOString().split('T')[0],"===",weekEnd.toISOString().split('T')[0],"---",date.toISOString().split('T')[0])
                    this.queryParams.weekBegin=weekBegin.toISOString().split('T')[0]
                    this.queryParams.weekEnd=weekEnd.toISOString().split('T')[0]
                    
                    // console.log(this.queryParams)  //周开始和周结束
                    //页面上显示的格式化后的日期
                    this.weekRange = `${weekBegin.toISOString().split('T')[0]}-${weekEnd.toISOString().split('T')[0]}`;
                    this.timeStampStart=new Date( this.queryParams.weekBegin+' 00:00:00').getTime()
                    
                    this.timeStampEnd=new Date( this.queryParams.weekEnd+' 23:59:59').getTime()
                    this.queryParams.timeStampStart=this.timeStampStart
                    this.queryParams.timeStampEnd=this.timeStampEnd

                    // 查询实时数据
                    this.getWeekReport();
                }
            },  
            /* 上一周 */
            prevWeek() {  
                const date = new Date(this.selectedDate);
                date.setDate(date.getDate() - 7);
                this.selectedDate = date.toISOString().split('T')[0];
                this.calculateWeekRange();
            },  
            /* 后一周 */
            nextWeek() {
                const date = new Date(this.selectedDate);
                date.setDate(date.getDate() + 7);
                this.selectedDate = date.toISOString().split('T')[0];
                this.calculateWeekRange();
            },
            
            /* 查询实时数据 */
            async getWeekReport(){

                // 1.同时调用getWeekEveryDayReport和getLastWeekEveryDayReport两个方法请求本周和上周的睡眠报告，使用promise.allSettled
                const [weekReportsArr, lastWeekReportsArr] = await Promise.all([
                    this.getWeekEveryDayReport(),//本周的睡眠报告
                    this.getLastWeekEveryDayReport()//上周的睡眠报告
                ]);

                //处理本周与上周的睡眠报告
                await this.startCalculate(weekReportsArr,lastWeekReportsArr);

                // console.log(res,res.rows)
            },

            /** 取出本周每一天的睡眠报告 */
            async getWeekEveryDayReport(){
                const query={
                    deviceKey: this.deviceKey,
                    productKey: this.productKey,
                    startTimeStamps: this.timeStampStart,
                    endTimeStamps: this.timeStampEnd
                }
                // 只有当 deviceId 存在且不为空时才添加
                if(this.queryparams.deviceId) {
                    query.deviceId = this.queryparams.deviceId;
                }

                // 1.请求本周每一天的睡眠报告
                const res = await listReportsleep(query);
                
                // 2.分割出周一到周日每一天的睡眠报告
                let weekReportsArr =  fenGeWeekReports(res.rows, this.timeStampStart, this.timeStampEnd);

                await Promise.all(weekReportsArr.map(async (item) => {
                    await this.getTenData(item.reports);  
                }));

                return weekReportsArr;
            },
            /** 取出上周每一天的睡眠报告 */
            async getLastWeekEveryDayReport(){
                const lastStartTimeStamps = this.timeStampStart - 86400000 * 7;
                const lastEndTimeStamps = this.timeStampEnd - 86400000 * 7;
                const query={
                    deviceKey: this.deviceKey,
                    productKey: this.productKey,
                    startTimeStamps: lastStartTimeStamps,
                    endTimeStamps: lastEndTimeStamps
                }
                // 只有当 deviceId 存在且不为空时才添加
                if(this.queryparams.deviceId) {
                    query.deviceId = this.queryparams.deviceId;
                }

                // 1.请求本周每一天的睡眠报告
                const res = await listReportsleep(query);
                
                // 2.分割出周一到周日每一天的睡眠报告
                let lastWeekReportsArr =  fenGeWeekReports(res.rows, lastStartTimeStamps, lastEndTimeStamps);

                await Promise.all(lastWeekReportsArr.map(async (item) => {
                    await this.getTenData(item.reports);  // 添加 await
                }))
                // console.log(lastWeekReportsArr);
                return lastWeekReportsArr;
            },

            /** 取出十分钟睡眠数据 */
			async getTenData(reports){
				//1.遍历n段睡眠报告
				await Promise.all(reports.map(async (report) => {
					//2.构建请求参数
					const queryTen={
						pageNum: 1,
						pageSize: 300,
					    deviceKey: this.deviceKey,
					    productKey: this.productKey,
					    sleepStartTimestamp:report.startSleepTime,
					    sleepEndTimestamp:report.endSleepTime
					}
					// 只有当 deviceId 存在且不为空时才添加
					if(this.queryparams.deviceId) {
						queryTen.deviceId = this.queryparams.deviceId;
					}
					//3.发送请求
					// const res = await listTen(queryTen);
					let huxizantingcishu = 0;
					const ress = await this.getHuXiZanTing(report.startSleepTime,report.endSleepTime);
					huxizantingcishu = ress.rows.length;
					
					//4.对十分钟数据进行排序
					// const tenDatas = sortTenData(res.rows);
					//5.截取出睡眠时段的十分钟数据(去掉头尾的 清醒 和 无 )
					// const shuiMianShiDuanTenDatas = huoQuShuiMianShiDuan(tenDatas);
					//6.获取睡眠时段格式化数据
					// const shuiMianshiDuanFormat = huoQuShuiMianShiDuanFormat(shuiMianShiDuanTenDatas);
					
					//7.直接赋值而不是用$set
					report.huxizantingcishu = huxizantingcishu;
					// report.tenDatas = tenDatas;
					// report.shuiMianshiDuanFormat = shuiMianshiDuanFormat;
				}));
			},


            /** 获取呼吸暂停次数 */
			async getHuXiZanTing(timeStampStart,timeStampEnd){
				const queryParams = {
					pageNum: 1,
					pageSize: 300,
					deviceKey: this.deviceKey,//devicekey
					productKey: this.productKey,//productkey
					// isShare: this.isShare,//是否是被分享的设备
					// date:this.queryParams.date,
					// selectTime:  new Date(this.chooseDate).getTime(),
					StartTime:timeStampStart,
					EndTime:timeStampEnd
				}
				// 只有当 deviceId 存在且不为空时才添加
				if(this.queryparams.deviceId) {
					queryParams.deviceId = this.queryparams.deviceId;
				}
				return await listTensleep(queryParams);
			},

            /** 开始计算所需的数据 */
            async startCalculate(weekReportsArr,lastWeekReportsArr){
                // console.log(weekReportsArr, lastWeekReportsArr);
                //A.设置睡眠图的数据start
                //1.初始化睡眠图的数据
                let sleepChartDatas = [[],[],[]];

                //2.处理本周的睡眠图的数据
                for(let item of weekReportsArr){
                    sleepChartDatas[0].push(item.allData.shenShuiShiChangALL);//深睡
                    sleepChartDatas[1].push(item.allData.qianShuiShiChangALL);//浅睡
                    sleepChartDatas[2].push(item.allData.qingXingShiChangALL);//清醒
                }

                //3.给睡眠图的数据赋值
                this.weekSleepDatas = sleepChartDatas;
                // console.log(this.weekSleepDatas);
                //设置睡眠图的数据end

                //B.计算本周和上周的睡眠时长，不含清醒
                //1.计算本周的睡眠时长
                let weekSleepTime = 0;
                let weekDeepSleepTime = 0;
                let weekQianShuiShiChangTime = 0;
                let weekOnBedTime = 0;
                let weekOnBedTimeArr = [];
                let weekOnBedTimeMin = 0;
                let weekOnBedTimeMax = 0;
                let weekOnBedTimeAvg = 0;
                let firstFlag = true;//作用是记录是否是第一次执行
                let count = 0;//作用是记录执行的次数

                let weekFanShenNumArr = [];
                let weekAhiValueArr = [];
                let weekHuXiValueAvgArr = [];//本周每一天的呼吸次数平均值
                let weekXinlvValueAvgArr = [];//本周每一天的心率平均值
                
                for(let item of weekReportsArr){
                    // console.log(item);
                    
                    weekDeepSleepTime += item.allData.shenShuiShiChangALL;
                    weekQianShuiShiChangTime += item.allData.qianShuiShiChangALL;
                    weekSleepTime += item.allData.shenShuiShiChangALL + item.allData.qianShuiShiChangALL;
                    weekOnBedTime += item.allData.shenShuiShiChangALL + item.allData.qianShuiShiChangALL + item.allData.qingXingShiChangALL;
                    weekOnBedTimeArr.push(item.allData.zaiChuangShiChangALL);
                    weekFanShenNumArr.push(item.allData.fanShenCiShuALL);
                    
                    if(item.allData.sleepTimeAll != 0){
                        //计算AHI值
                        let breatheStopSum = 0;//呼吸暂停次数
                        let reportNum = 0;//报告数
                        let huXiValue = 0;//呼吸次数
                        let xinlvValue = 0;//心率
                        for(let report of item.reports){
                            const breathRate = Number(report.bm); // bm = 平均呼吸 (新字段)
                            const heartRate = Number(report.bn); // bn = 平均心跳 (新字段)
                            const breathStop = Number(report.bo); // bo = 呼吸暂停次数 (新字段)
                            
                            if(!isNaN(breathStop)) breatheStopSum += breathStop;
                            if(!isNaN(breathRate)) huXiValue += breathRate;
                            if(!isNaN(heartRate)) xinlvValue += heartRate;
                            reportNum++;
                        }
                        const TST = Math.round(item.allData.sleepTimeAll * 10 / 60)  /10;//睡眠时长（不含清醒)(单位：小时)

                        let num = (breatheStopSum / TST) * 10;
                        let AHI = Math.round(num) / 10;
                        weekAhiValueArr.push(AHI);
                        
                        weekHuXiValueAvgArr.push(reportNum > 0 ? Math.round(huXiValue / reportNum) : 0);
                        weekXinlvValueAvgArr.push(reportNum > 0 ? Math.round(xinlvValue / reportNum) : 0);
                    } else {
                        weekAhiValueArr.push(0);
                        weekHuXiValueAvgArr.push(0);
                        weekXinlvValueAvgArr.push(0);
                    }
                    
                    
                    //计算在床时长
                    if(item.allData.zaiChuangShiChangALL != 0){
                        if(firstFlag){
                            //第一次执行时，直接赋值
                            weekOnBedTimeMax = item.allData.zaiChuangShiChangALL;
                            weekOnBedTimeMin = item.allData.zaiChuangShiChangALL;
                            firstFlag = false;
                            // console.log("第一次执行时，直接赋值",weekOnBedTimeMax,weekOnBedTimeMin,count);
                        }
                        //如果当前值大于最大值，则更新最大值
                        if(item.allData.zaiChuangShiChangALL > weekOnBedTimeMax){
                            weekOnBedTimeMax = item.allData.zaiChuangShiChangALL;
                        }
                        //如果当前值小于最小值，则更新最小值
                        if(item.allData.zaiChuangShiChangALL < weekOnBedTimeMin && item.allData.zaiChuangShiChangALL != 0){
                            weekOnBedTimeMin = item.allData.zaiChuangShiChangALL;
                        }
                        count++;
                    }
                }
                //2.计算上周的睡眠时长
                let lastWeekSleepTime = 0;
                let lastWeekDeepSleepTime = 0;
                let lastWeekQianShuiShiChangTime = 0;
                let lastWeekOnBedTime = 0;
                for(let item of lastWeekReportsArr){
                    lastWeekDeepSleepTime += item.allData.shenShuiShiChangALL;
                    lastWeekQianShuiShiChangTime += item.allData.qianShuiShiChangALL;
                    lastWeekSleepTime += item.allData.shenShuiShiChangALL + item.allData.qianShuiShiChangALL;
                    lastWeekOnBedTime += item.allData.shenShuiShiChangALL + item.allData.qianShuiShiChangALL + item.allData.qingXingShiChangALL;
                }

                this.weekSleepTime = weekSleepTime;
                this.lastWeekSleepTime = lastWeekSleepTime;
                // console.log("本周的睡眠时长：",weekSleepTime,"分钟");
                // console.log("上周的睡眠时长：",lastWeekSleepTime,"分钟");

                //C.计算本周与上周的睡眠时长差值
                const sleepTimeDiff = weekSleepTime - lastWeekSleepTime;
                this.weekSleepTimeDiff = sleepTimeDiff;
                // console.log("本周与上周的睡眠时长差值：",sleepTimeDiff,"分钟");


                //D.计算本周的深睡、浅睡百分比，及相对于上周来说上升下降了多少个百分点
                //1.计算本周的深睡百分比
                const weekDeepSleepPercentage = Math.round((weekDeepSleepTime / weekOnBedTime) * 100);
                this.weekDeepSleepPercentage = weekDeepSleepPercentage;
                // console.log("本周的深睡百分比：",weekDeepSleepPercentage,"%");

                //2.计算本周的浅睡百分比
                const weekQianShuiShiChangPercentage = Math.round((weekQianShuiShiChangTime / weekOnBedTime) * 100);
                this.weekQianShuiShiChangPercentage = weekQianShuiShiChangPercentage;
                // console.log("本周的浅睡百分比：",weekQianShuiShiChangPercentage,"%");

                //3.计算上周的深睡百分比
                const lastWeekDeepSleepPercentage = Math.round((lastWeekDeepSleepTime / lastWeekOnBedTime) * 100);
                this.lastWeekDeepSleepPercentage = lastWeekDeepSleepPercentage;
                // console.log("上周的深睡百分比：",lastWeekDeepSleepPercentage,"%");

                //4.计算上周的浅睡百分比
                const lastWeekQianShuiShiChangPercentage = Math.round((lastWeekQianShuiShiChangTime / lastWeekOnBedTime) * 100);
                this.lastWeekQianShuiShiChangPercentage = lastWeekQianShuiShiChangPercentage;
                // console.log("上周的浅睡百分比：",lastWeekQianShuiShiChangPercentage,"%");

                //5.计算本周与上周的深睡百分比差值
                const weekDeepSleepPercentageDiff = weekDeepSleepPercentage - lastWeekDeepSleepPercentage;
                this.weekDeepSleepPercentageDiff = weekDeepSleepPercentageDiff;
                // console.log("本周与上周的深睡百分比差值：",weekDeepSleepPercentageDiff,"%");

                //6.计算本周与上周的浅睡百分比差值
                const weekQianShuiShiChangPercentageDiff = weekQianShuiShiChangPercentage - lastWeekQianShuiShiChangPercentage;
                this.weekQianShuiShiChangPercentageDiff = weekQianShuiShiChangPercentageDiff;
                // console.log("本周与上周的浅睡百分比差值：",weekQianShuiShiChangPercentageDiff,"%");
                
                //E.计算本周在床时长
                this.weekOnBedTimeArr = weekOnBedTimeArr;
                this.weekOnBedTimeMin = weekOnBedTimeMin;
                this.weekOnBedTimeMax = weekOnBedTimeMax;
                weekOnBedTimeAvg = Math.round(weekOnBedTime / count);
                this.weekOnBedTimeAvg = weekOnBedTimeAvg;
                // console.log("本周在床时长总和：",weekOnBedTime,"分钟");
                // console.log("本周在床时长平均值：",weekOnBedTimeAvg,"分钟");
                // console.log("本周在床时长最小值：",weekOnBedTimeMin,"分钟");
                // console.log("本周在床时长最大值：",weekOnBedTimeMax,"分钟");

                //F.计算本周的翻身次数
                this.weekFanShenNumArr = weekFanShenNumArr;
                // console.log("本周的翻身次数：",weekFanShenNumArr);
                
                //G.计算本周的AHI值
                this.weekAhiValueArr = weekAhiValueArr;
                // console.log("本周的AHI值：",weekAhiValueArr);

                //H.计算本周的呼吸次数平均值
                this.weekHuXiValueAvgArr = weekHuXiValueAvgArr;
                // console.log("本周的呼吸次数平均值：",weekHuXiValueAvgArr);

                //I.计算本周的心率平均值
                this.weekXinlvValueAvgArr = weekXinlvValueAvgArr;
                // console.log("本周的心率平均值：",weekXinlvValueAvgArr);
            },

        }
    }
</script>
 
<style lang="scss" scoped>
    .alls {
        /* 睡眠总结区域 */
        .summarize {
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            padding: 40rpx 0rpx 2rpx 0rpx;
            margin: 25rpx auto;
            width: 700rpx;
            background: #fff;
            border-radius: 10rpx;
 
            .headd {
                // padding: 10rpx 10rpx;
                  padding: 0 25rpx 30rpx 25rpx;
                font-size: 28rpx;
                display: flex;
                justify-content: space-between;
                align-items: center;
 
                .text_a {
                    color: #3ed196;
                    background-color: rgba(62, 209, 150, 0.1);
                    padding: 12rpx 24rpx;
                    border-radius: 30rpx;
                    font-weight: bold;
                }
 
                .text_b {
                    color: #3ed196;
                    text-align: center;
                    font-size: 34rpx;
                    font-weight: bold;
                }
            }
            
            .contents{
                padding: 0 25rpx;
                .info_head{
                    font-size: 40rpx;
                    line-height: 80rpx;
                    text-align: center;
                    color: #3ed196;
                    font-weight: 800;
                }
                .info_content{
                    // border: 1px solid #3ed196;
                    background: rgba(62, 209, 150,0.2);
                    border-radius: 25rpx;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-around;
                    padding: 20rpx ;
                    
                    .info_head_itemm{
                        width: 50%;
                        // height: 100rpx;
                        display: flex;
                        flex-wrap: wrap;
                        flex-direction: column;
                        justify-content: space-around;
                        // border: 1px solid #bcbc00;
                        font-size: 30rpx;
                        line-height: 50rpx;
                        
                        .ite_text_a{
                            margin: 0 auto;
                            color: #3ed196;
                            font-size: 40rpx;
                            font-weight: 700;
                            white-space: nowrap;
                        }
                        .ite_text_b{
                            margin: 0 auto;
                            color: #666;
                        }
                    }
                    .info_head_item{
                        width: 50%;
                        // height: 100rpx;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-around;
                        // border: 1px solid #d19347;
                        font-size: 30rpx;
                        line-height: 50rpx;
                        .info_head_item_a{
                            display: flex;
                            flex-direction: column;
                            .ite_text_a{
                                margin: 0 auto;
                                color: #3ed196;
                                font-size: 40rpx;
                                font-weight: 700;
                                white-space: nowrap;
                            }
                            .ite_text_b{
                                margin: 0 auto;
                                color: #666;
                            }
                        }
                        .info_head_item_b{
                            width: 50%;
                            margin: auto;
                            font-size: 40rpx;
                            font-weight: bold;
                        }
                    }
                }
            }
            
            .foots{
                padding: 0 25rpx;
                .foots_item{
                    height: 120rpx;
                    display: flex;
                    justify-content: space-between;
                    line-height: 60rpx;
                    font-size: 40rpx;
                    color: #999;
                    .item_left{
                        display: flex;
                        justify-content: space-between;
                        .tu{
                            width:  80rpx;
                            height: 80rpx;
                            margin: auto 15rpx;
                            border-radius: 60%;
                            border: 3px solid #3ed196;
                            text-align: center;
                            font-size: 25rpx;
                            line-height: 72rpx;
                            color: #3ed196;
                        }
                        .texts{
                            margin: auto 0;
                        }
                    }
                    .item_right{
                        margin-right: 40rpx;
                        display: flex;
                        justify-content: space-between;
                        .tuu{
                            margin: auto 20rpx;
                            color: #3ed196;
                            font-weight: 700;
                            min-width: 40rpx;
                            max-width: 40rpx;
                        }
                        .texts{
                            margin: auto 0;
                        }
                    }
                }
            }
        }
        
        .chart-card {
            box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
            background: #fff;
            border-radius: 24rpx;
            margin: 30rpx auto;
            padding: 30rpx;
            width: 700rpx;
            box-sizing: border-box;

            .chart-header {
                display: flex;
                align-items: center;
                margin-bottom: 30rpx;
                
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

        .on_bed {
            .chart-header {
                .chart-bar { background-color: #3ed196; }
                .chart-name { color: #3ed196; }
            }
            
            .on_bed_texts{
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
                margin-top: 20rpx;
                
                .on_bed_texts_item{
                    display: flex;
                    flex-direction: column;
                    width: 30%;
                    text-align: center;
                    
                    .bed_item_text_a{
                        margin: 0 auto;
                        color: #3ed196;
                        font-size: 38rpx;
                        font-weight: 700;
                    }
                    .bed_item_text_b{
                        font-size: 28rpx;
                        margin: 8rpx auto 0;
                        color: #999;
                    }
                }
            }
        }
        
        .respiratory {
            .chart-header {
                .chart-bar { background-color: #aaaaff; }
                .chart-name { color: #aaaaff; }
            }
            
            .on_bed_texts{
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
                margin-top: 20rpx;
                
                .on_bed_texts_item{
                    display: flex;
                    flex-direction: column;
                    width: 30%;
                    text-align: center;
                    
                    .bed_item_text_a{
                        margin: 0 auto;
                        color: #aaaaff;
                        font-size: 38rpx;
                        font-weight: 700;
                    }
                    .bed_item_text_b{
                        font-size: 28rpx;
                        margin: 8rpx auto 0;
                        color: #999;
                    }
                }
            }
        }

        .heart_rate {
            .chart-header {
                .chart-bar { background-color: #f93c63; }
                .chart-name { color: #f93c63; }
            }

            .on_bed_texts{
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
                margin-top: 20rpx;
                
                .on_bed_texts_item{
                    display: flex;
                    flex-direction: column;
                    width: 30%;
                    text-align: center;
                    
                    .bed_item_text_a{
                        margin: 0 auto;
                        color: #f93c63;
                        font-size: 38rpx;
                        font-weight: 700;
                    }
                    .bed_item_text_b{
                        font-size: 28rpx;
                        margin: 8rpx auto 0;
                        color: #999;
                    }
                }
            }
        }

        .turn {
            .chart-header {
                .chart-bar { background-color: #73c0de; }
                .chart-name { color: #73c0de; }
            }
        }

        .xinlv {
            .chart-header {
                .chart-bar { background-color: #EE3a66; }
                .chart-name { color: #EE3a66; }
            }
        }

        .breathe {
            .chart-header {
                .chart-bar { background-color: #73de91; }
                .chart-name { color: #73de91; }
            }
        }

        .breathee {
            .chart-header {
                .chart-bar { background-color: #0ee7e0; }
                .chart-name { color: #0ee7e0; }
            }
        }
    }
</style>