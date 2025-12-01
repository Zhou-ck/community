<template>
    <view class="all">
        <view class="navigation">
            <view :class="dayChoose?'navigation_item_choose':'navigation_item'" @click="setChoose1()">日报告</view>
            <view :class="weekChoose?'navigation_item_choose':'navigation_item'" @click="setChoose2()">周报告</view>
            <view :class="monthChoose?'navigation_item_choose':'navigation_item'" @click="setChoose3()">月报告</view>
        </view>
        <view class="components">
            <dayReportVue v-if="dayChoose" :productKey="queryParams.productKey || ''" :deviceKey="queryParams.deviceKey || ''" :queryparams="queryParams" :isShare="isShare"/>
            <weekReport v-if="weekChoose" :productKey="queryParams.productKey || ''" :deviceKey="queryParams.deviceKey || ''" :queryparams="queryParams" :isShare="isShare"/>
            <monthReport v-if="monthChoose &&queryParams.productKey && queryParams.deviceKey" :productKey="queryParams.productKey || ''" :deviceKey="queryParams.deviceKey || ''" :isShare="isShare" @toDayReport="setChoose1"/>
        </view>
    </view>
</template>
 
<script>
    import dayReportVue from '@/pages/my/day-report/day-report.vue'
    import weekReport from '@/pages/my/week-report/week-report.vue'
    import monthReport from '@/pages/my/month-report/month-report.vue'
	
    import {listReportsleep} from '@/api/reportsleep.js'
	
    export default {
        data() {
            return {
                deviceInfo:null,
                queryParams: {
                    productKey: '',
                    deviceKey: '',
                    // identifier: 'bc',
                    moduleId: null,
                    deviceId:null
                },
                dayChoose:true,
                weekChoose:false,
                monthChoose:false,
                //日报告的信息1
                daySleepReportData:{
                    deepSleep:null,//深睡眠比例 -bi-
                    lightSleep:null,//浅睡眠比例 -bh-
                    sleepFrequency:null,//睡眠次数 -
                    bodyRollFrequency:null,//翻身次数 -bl-
                    outOfBedFrequency:null,//离床次数 -bk-
                },
                //日报告的信息2--睡眠报告s
                sleepReport:[
                    {
                        score:null,//睡眠得分 -av-
                        period:null,//睡眠时段 -
                        duration:null,//睡眠时长 -bf-
                        deepSleepRatio:null,//深睡占比 -bi-
                        inBedPperiod:null,//在床时段 -
                        inBedTime:null,//在床时间 -
                        sleepRatio:null//睡眠占比 -
                    }
                ],
				isShare: false
                
            }
        },
        components:{
            dayReportVue,
            weekReport,
            monthReport
        },
        onLoad(param) {
            if(param.productKey!=null && param.deviceKey!=null){
                this.addDeviceFlag = !!param.show&&param.show=="a"?false:true;
                //添加完设备后跳转来的8266BSSID从这里取
                // console.log("参数:",param)

                // 立即设置 queryParams，让子组件能立即使用
                this.queryParams.productKey = param.productKey;
                this.queryParams.deviceKey = param.deviceKey;
                if(param.deviceId) {
                    this.queryParams.deviceId = param.deviceId;
                }

                let queryParams ={
                    productKey:param.productKey,
                    deviceKey:param.deviceKey
                }
                if(param.deviceId) {
                    queryParams.deviceId = param.deviceId;
                }
                if( param.isShare == 'true' ){
                    this.isShare=true;
                    queryParams.isShare = true;
                }else{
                    this.isShare=false;
                }
                listReportsleep(queryParams).then(res=>{
                    // console.log(res);
                    if (res.code === 200 && res.rows && res.rows.length > 0) {
                        // 1. 获取最新的一条报告数据作为头部展示
                        const latestReport = res.rows[0];
                        this.deviceInfo = latestReport;

                        // 解析日报告概览信息
                        this.daySleepReportData = {
                            deepSleep: latestReport.bi || 0,      // 深睡时长占比
                            lightSleep: latestReport.bh || 0,     // 浅睡时长占比
                            sleepFrequency: latestReport.bj || 0, // 离床时长
                            bodyRollFrequency: latestReport.bl || 0, // 翻身次数
                            outOfBedFrequency: latestReport.bk || 0  // 离床次数
                        };

                        // 2. 解析列表数据
                        this.sleepReport = res.rows.map(item => {
                            return {
                                score: item.av || 0,           // 睡眠得分
                                period: item.createTime,       // 报告时间作为时段
                                duration: item.bf || 0,        // 睡眠时长
                                deepSleepRatio: item.bi || 0,  // 深睡占比
                                inBedPperiod: item.startTimeStamps ? `${this.formatTime(item.startTimeStamps)}-${this.formatTime(item.endTimeStamps)}` : '', // 在床时段
                                inBedTime: item.bg || 0,       // 在床时间(猜测bg或暂无)
                                sleepRatio: 0                  // 睡眠占比(需计算或暂无)
                            }
                        });

                        this.queryParams.productKey = latestReport.productKey
                        this.queryParams.deviceKey = latestReport.deviceKey
                        this.queryParams.moduleId = latestReport.modelId
                        this.queryParams.deviceId = latestReport.deviceId
                    }
                })
            }
        },
        methods: {
            // 格式化时间戳 HH:mm
            formatTime(timestamp) {
                if (!timestamp) return '';
                const date = new Date(timestamp);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            },
            /* 选项卡1 */
            setChoose1(e){
                if(e){
                    // console.log('这是回传的参数aa:',e)

                    this.queryParams.productKey        = e.value.productKey
                    this.queryParams.deviceKey        = e.value.deviceKey
                    this.queryParams.date            = e.value.date
                    this.queryParams.nowMonth        = e.value.nowMonth
                    this.queryParams.nowMonthDays    = e.value.nowMonthDays
                    // console.log('现在的请求参数aa:',this.queryParams)
                }
                this.dayChoose=true;
                this.weekChoose=false;
                this.monthChoose=false;
            },
            /* 选项卡2 */
            setChoose2(){
                this.dayChoose=false;
                this.weekChoose=true;
                this.monthChoose=false;
            },
            /* 选项卡3 */
            setChoose3(){
                this.dayChoose=false;
                this.weekChoose=false;
                this.monthChoose=true;
            },
            
        }
    }
</script>
 
<style lang="scss" scoped>
    .all{
        padding: 25rpx;
        font-size: $uni-font-size-base;
        
        .navigation{
            width: 700rpx;
            height: 60rpx;
            display: flex;
            color: #3ed196;
            text-align: center;
            line-height: 60rpx;
            background: #fff;
            
            .navigation_item{
                width: 233rpx;
                border: 1px solid #3ed196;
            }
            .navigation_item_choose{
                width: 233rpx;
                border: 1px solid #3ed196;
                color: #fff;
                background: #3ed196;
            }
        }
        .components{
            margin: 0;
            padding: 0;
        }
        
    }
    
</style>