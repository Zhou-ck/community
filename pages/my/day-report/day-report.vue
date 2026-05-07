<template>
	<view class="day_report_all">
			<!-- 日期切换区域 -->
			<view class="summarize">
				<view class="headd">
					<text class="text_a" @click="changeDate($event,0)">前一天</text>
					<picker class="text_b" mode="date" start="1949-10-01" :end="nowDate" :value="chooseDate" @change="changeDate($event)">{{!!chooseDate?chooseDate:'--'}}</picker>
					<text class="text_a" @click="changeDate($event,1)">后一天</text>
				</view>
			</view>
			
			<!-- 睡眠报告均值数据展示 -->
			<view class="summarize" style="padding-top: 0rpx;" v-if="daySleppDatas.reports && daySleppDatas.reports.length > 0 && hasSleepData">
				<view class="sleep_times" >
					<view class="all_time">
						{{daySleppDatas.allData.sleepTimeFormat || '- -'}}
					</view>
					<view class="all_time_text">
						总睡眠时间
					</view>
					<view class="reference_value">
						(参考值：6-10小时)
					</view>
				</view>
				<view class="sleep_info" >
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">今日睡眠段数</text>
							<text class="sleep_info_text_b">(参考值：1次)</text>
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.shuiMianCiShuAll?daySleppDatas.allData.shuiMianCiShuAll:0}}</text>
							<text class="tc2">次</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">日均深睡比</text>
							<text class="sleep_info_text_b">(参考值：20%-60%)</text>
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.shenShuiBiAvg?daySleppDatas.allData.shenShuiBiAvg:0}}</text>
							<text class="tc2">%</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">日均浅睡眠比</text>
							<text class="sleep_info_text_b">(参考值：20%-80%)</text>
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.qianShuiBiAvg?daySleppDatas.allData.qianShuiBiAvg:0}}</text>
							<text class="tc2">%</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">日均清醒比</text>
							<text class="sleep_info_text_b"><!-- (参考值：20%-80%) --></text>
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.qingXingBiAvg?daySleppDatas.allData.qingXingBiAvg:0}}</text>
							<text class="tc2">%</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">日均翻身次数</text>
							<text class="sleep_info_text_b">(参考值：20-45次)</text>
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.fanShenCiShuAvg?daySleppDatas.allData.fanShenCiShuAvg:0}}</text>
							<text class="tc2">次</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">日均离床次数</text>
							<text class="sleep_info_text_b">(参考值：0-2次)</text>
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.liChuangCiShuAvg?daySleppDatas.allData.liChuangCiShuAvg:0}}</text>
							<text class="tc2">次</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item" style="display: flex; justify-content: center; align-items: center;">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">日均睡眠得分</text>
							<uni-icons type="help-filled" size="22" color="#bbb" @click="showTip" style="font-weight: lighter;"></uni-icons>
							<!-- <icon type="info" size="20" color="#bbb" @click="showTip" style="padding: 0 0 0 00rpx;"/> -->
							<text class="sleep_info_text_b"><!-- (参考值：0-2次) --></text>
						</view>
						<view class="sleep_info_text_c">
							<!-- 均分 -->
							<!-- <text class="tc1">{{!!daySleppDatas.allData.deFenAvg?daySleppDatas.allData.deFenAvg:0}}</text> -->
							<!-- 加权均分 -->
							<text class="tc1">{{!!daySleppDatas.allData.weightAvg?daySleppDatas.allData.weightAvg:0}}</text>
							<text class="tc2">分</text>
						</view>
					</view>
					<view class="sleep_info_left">
						<view class="sleep_info_left_item">
							<text class="sleep_info_icon">◆</text>
							<text class="sleep_info_text_a">呼吸暂停次数</text>
							<!-- <text class="sleep_info_text_b">(参考值：0-2次)</text> -->
						</view>
						<view class="sleep_info_text_c">
							<text class="tc1">{{!!daySleppDatas.allData.huxizantingcishu?daySleppDatas.allData.huxizantingcishu:0}}</text>
							<text class="tc2">次</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- AHI值数据展示 -->
			<view class="summarize" style="padding: 20rpx 20rpx 50rpx 20rpx;" v-if="daySleppDatas.reports && daySleppDatas.reports.length > 0 && AHIzhishuShow && hasSleepData">
				<view class="ahi" >
					AHI指数
					<uni-icons type="help-filled" size="22" color="#bbb" @click="showTipAHI" style="font-weight: lighter;"></uni-icons>
				</view>
				
				<!-- 当天AHI值 -->
				<view class="ahi_value">
					<view style="min-width: 110rpx;height: 0;"></view>
					<view v-if="ahiValue < 5" style="display: flex;align-items: center;line-height: 60px;flex-wrap: nowrap;">
						<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{ahiValue || '- -'}}</view>
						<view style="width: 160rpx;color: #ffffff;background-color: #1cd496;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">正常</view>
					</view>
					<view v-else-if="ahiValue >= 5 && ahiValue < 15" style="display: flex;align-items: center;line-height: 60px;">
						<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{ahiValue || '- -'}}</view>
						<view style="width: 160rpx;color: #ffffff;background-color: #ffaa00;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">低风险</view>
					</view>
					<view v-else-if="ahiValue >= 15 && ahiValue < 30" style="display: flex;align-items: center;line-height: 60px;">
						<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{ahiValue || '- -'}}</view>
						<view style="width: 160rpx;color: #ffffff;background-color: #fd5c0c;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">中风险</view>
					</view>
					<view v-else-if="ahiValue >= 30" style="display: flex;align-items: center;line-height: 60px;">
						<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{ahiValue || '- -'}}</view>
						<view style="width: 160rpx;color: #ffffff;background-color: #d8090f;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">高风险</view>
					</view>
				</view>
				
				<!-- 较前一天 -->
				<view class="ahi_value">
					<view style="min-width: 110rpx;height: 0;"></view>
					<view style="font-weight: bold;padding-left: 5px;margin: 0 50rpx 0 30rpx;">较前一天：</view>
					<view class="" v-if="(!Number.isNaN(yesterdayAhiValue)?yesterdayAhiValue:0) - (!Number.isNaN(ahiValue)?ahiValue:0) < 0">
						<!-- 减少 {{Math.abs(breatheStopCha)}}次 -->
						减少 {{Math.abs((!Number.isNaN(yesterdayAhiValue)?yesterdayAhiValue:0) - (!Number.isNaN(ahiValue)?ahiValue:0)).toFixed(1)}}次/小时
						<!-- <uni-icons fontFamily="xiajiang" size="22" color="#00aa00" >{{'&#xe64e;'}}{{Math.abs(breatheStopCha)}}次</uni-icons> -->
					</view>
					<view class="" v-else-if="(!Number.isNaN(yesterdayAhiValue)?yesterdayAhiValue:0) - (!Number.isNaN(ahiValue)?ahiValue:0)==0">
						相同
						<!-- <uni-icons fontFamily="xiajiang" size="16" color="#000" >相同</uni-icons> -->
					</view>
					<view class="" v-else-if="(!Number.isNaN(yesterdayAhiValue)?yesterdayAhiValue:0) - (!Number.isNaN(ahiValue)?ahiValue:0)>0">
						<!-- 增加 {{Math.abs(breatheStopCha)}}次 -->
						增加 {{Math.abs((!Number.isNaN(yesterdayAhiValue)?yesterdayAhiValue:0) - (!Number.isNaN(ahiValue)?ahiValue:0)).toFixed(1)}}次/小时
						<!-- <uni-icons fontFamily="shangsheng" size="22" color="#ff5500" >{{'&#xe64e;'}}{{Math.abs(breatheStopCha)}}次</uni-icons> -->
					</view>
					
					<!-- <view class="" v-if="ahiCha<0">AHI较前一天降低{{Math.abs(ahiCha)}}</view>
					<view class="" v-else-if="ahiCha==0">AHI与前一天相同</view>
					<view class="" v-else-if="ahiCha>0">AHI较前一天升高{{Math.abs(ahiCha)}}</view> -->
				</view>
				
				<!-- 昨天 与 今天 的数据 -->
				<view style="margin-top: 30rpx;display: flex;flex-wrap: nowrap;justify-content: space-around;">
					<!-- 昨天 -->
					<view style="width: auto;border-radius: 20rpx;padding: 10rpx;text-align: center;">
						<text style="font-weight: bold;color: rgba(255, 127, 80, 1);">前一天</text>
						<view style="border-radius: 20rpx;padding: 10rpx;background: rgba(255, 127, 80, 0.2);font-size: 26rpx;text-align: left;padding-left: 30rpx;margin-top: 15rpx;">
							<view style="white-space: nowrap;">总呼吸暂停次数：{{yesterdaySleppDatas.allData.huxizantingcishu || '- -'}}次</view>
							<view class="">AHI：{{!Number.isNaN(yesterdayAhiValue)?yesterdayAhiValue:0}} 次/小时</view>
						</view>
						
					</view>
					<!-- 今天 -->
					<view style="width: auto;border-radius: 20rpx;padding: 10rpx;text-align: center;">
						<text style="font-weight: bold;color: rgba(28, 212, 150, 1);">当天</text>
						<view style="border-radius: 20rpx;padding: 10rpx;background: rgba(28, 212, 150, 0.2);font-size: 26rpx;text-align: left;padding-left: 30rpx;margin-top: 15rpx;">
							<view style="white-space: nowrap;">总呼吸暂停次数：{{daySleppDatas.allData.huxizantingcishu || '- -'}} 次</view>
							<view class="">AHI：{{!Number.isNaN(ahiValue)?ahiValue:0}} 次/小时</view>
						</view>
						
						<!-- <view class="">与前一天的呼吸暂停次数差为：{{breatheStopCha}}</view>
						<view class="" v-if="breatheStopCha<0">呼吸暂停比前一天减少{{Math.abs(breatheStopCha)}}次</view>
						<view class="" v-else-if="breatheStopCha==0">呼吸暂停次数与前一天相同，均为{{Math.abs(breatheStopCha)}}次</view>
						<view class="" v-else-if="breatheStopCha>0">呼吸暂停比前一天增加{{Math.abs(breatheStopCha)}}次</view>
						<view class="" v-if="ahiCha<0">AHI较前一天降低{{Math.abs(ahiCha)}}</view>
						<view class="" v-else-if="ahiCha==0">AHI与前一天相同</view>
						<view class="" v-else-if="ahiCha>0">AHI较前一天升高{{Math.abs(ahiCha)}}</view> -->
					</view>
				</view>
				
			</view>
			
			<!-- 当天睡眠状态图（有实际睡眠数据时才显示） -->
			<view class="" v-if="dayTenDatas.length>0 && hasSleepData">
				<sleepCanvasss  :sleepDatas="dayTenDatas" :startTimeStamp="startTimeStamp" :endTimeStamp="endTimeStamp" />
			</view>
			
			<!-- 今天 - 昨天 对比数据展示 -->
			<view v-show="showDuiBiFlag" v-if="daySleppDatas.reports && daySleppDatas.reports.length > 0 && hasSleepData">
				<view class="duibishuju" v-if="!Number.isNaN(shuiMianShiChangCha)">
					<view>
						<text style="color: #a214a3;">睡眠时长</text>  
						<text style="">与昨日相比 </text>  
						<text v-if="shuiMianShiChangCha>0" style="color: #41a863;font-weight: bold;float: right;">
							增加 {{smscc || '- -'}}
							<!-- <uni-icons fontFamily="xiajiang"  color="#d42d00" >{{'&#xe64e;'}}{{smscc}}</uni-icons> -->
						</text>  
						<text v-else-if="shuiMianShiChangCha==0" style="color: #000000;font-weight: bold;float: right;">未发生变化</text>  
						<text v-else-if="shuiMianShiChangCha<0" style="color: #d42d00;font-weight: bold;float: right;">
							减少 {{smscc || '- -'}}
							<!-- <uni-icons fontFamily="xiajiang"  color="#d42d00" >{{'&#xe64e;'}}{{smscc}}</uni-icons> -->
						</text>  
					</view>
				</view>
				<view class="duibishuju" v-if="!Number.isNaN(shenShuiShiChangCha)">
					<view>
						<text style="color: #a214a3;">深睡眠</text>  
						<text style="">与昨日相比 </text>  
						<text v-if="shenShuiShiChangCha>0" style="color: #41a863;font-weight: bold;float: right;">
							增加 {{ssscc || '- -'}}
							<!-- <uni-icons fontFamily="xiajiang"  color="#d42d00" >{{'&#xe64e;'}}{{ssscc}}</uni-icons> -->
						</text>  
						<text v-else-if="shenShuiShiChangCha==0" style="color: #000000;font-weight: bold;float: right;">未发生变化</text>  
						<text v-else-if="shenShuiShiChangCha<0" style="color: #d42d00;font-weight: bold;float: right;">
							减少 {{ssscc || '- -'}}
							<!-- <uni-icons fontFamily="xiajiang"  color="#d42d00" >{{'&#xe64e;'}}{{ssscc}}</uni-icons> -->
						</text>  
					</view>
				</view>
				<view class="duibishuju" v-if="!Number.isNaN(qianShuiShiChangCha)">
					<view>
						<text style="color: #a214a3;">浅睡眠</text>  
						<text style="">与昨日相比 </text>  
						<text v-if="qianShuiShiChangCha>0" style="color: #41a863;font-weight: bold;float: right;;">
							增加 {{qsscc || '- -'}}
							<!-- <uni-icons fontFamily="shangsheng"  color="#00aa00" >{{'&#xe64e;'}}{{qsscc}}</uni-icons> -->
						</text>  
						<text v-else-if="qianShuiShiChangCha==0" style="color: #000000;font-weight: bold;float: right;">未发生变化</text>  
						<text v-else-if="qianShuiShiChangCha<0" style="color: #d42d00;font-weight: bold;float: right;">
							减少 {{qsscc || '- -'}}
							<!-- <uni-icons fontFamily="xiajiang"  color="#d42d00" >{{'&#xe64e;'}}{{qsscc}}</uni-icons> -->
						</text>  
					</view>
				</view>
				<!-- <view class="duibishuju" v-if="!Number.isNaN(qingXingShiChangCha)">
					<view>
						<text style="color: #a214a3;">清醒时长</text>  
						<text style="">与昨日相比 </text>  
						<text v-if="qingXingShiChangCha>0" style="color: #41a863;font-weight: bold;float: right;">增加 {{qxscc}}</text>  
						<text v-else-if="qingXingShiChangCha==0" style="color: #000000;font-weight: bold;float: right;">未发生变化</text>  
						<text v-else-if="qingXingShiChangCha<0" style="color: #d42d00;font-weight: bold;float: right;">减少 {{qxscc}}</text>  
					</view>
				</view> -->
				<view class="duibishuju" v-if="!Number.isNaN(shenShuiZhanBiCha)">
					<view>
						<text style="color: #a214a3;">深睡占比</text>
						<text style="">与昨日相比 </text>
						<text v-if="shenShuiZhanBiCha>0" style="color: #41a863;font-weight: bold;float: right;">上升 {{shenShuiZhanBiCha || '- -'}} 个百分点</text>  
						<text v-else-if="shenShuiZhanBiCha==0" style="color: #000000;font-weight: bold;float: right;">未发生变化</text>  
						<text v-else-if="shenShuiZhanBiCha<0" style="color: #d42d00;font-weight: bold;float: right;">下降 {{Math.abs(shenShuiZhanBiCha) || '- -'}} 个百分点</text>  
					</view>
					<view style="height: 25px;width: 100%;background: #eee;border-radius: 10rpx;margin-top: 30rpx;">
						<!-- <view :style="`height: 25px;width: ${Math.abs(shenShuiZhanBiCha)*2}%;background: ${shenShuiZhanBiCha<0?'#fe9307':'#1ed394'};border-radius: 10rpx;`"></view> -->
						<view :style="{
							height: '25px',
							width: `${Math.abs(shenShuiZhanBiCha)*2}%`,
							background: shenShuiZhanBiCha<0?'#fe9307':'#1ed394',
							borderRadius: '10rpx'
						}"></view>
					</view>
				</view>
				<view class="duibishuju" v-if="!Number.isNaN(qianShuiZhanBiCha)">
					<view>
						<text style="color: #a214a3;">翻身次数</text>  
						<text style="">与昨日相比 </text>  
						<text v-if="fanShenCiShiCha>0" style="color: #41a863;font-weight: bold;float: right;">多 {{fanShenCiShiCha || '- -'}} 次</text>  
						<text v-else-if="fanShenCiShiCha==0" style="color: #000000;font-weight: bold;float: right;">未发生变化</text>  
						<text v-else-if="fanShenCiShiCha<0" style="color: #d42d00;font-weight: bold;float: right;;">少 {{Math.abs(fanShenCiShiCha) || '- -'}} 次</text>  
					</view>
					<view style="height: 25px;width: 100%;background: #eee;border-radius: 10rpx;margin-top: 30rpx;">
						<!-- <view :style="`height: 25px;width: ${100,Math.abs(fanShenCiShiCha)*2>100?100:Math.abs(fanShenCiShiCha)*2}%;background: ${fanShenCiShiCha<0?'#fe9307':'#1ed394'};border-radius: 10rpx;`"></view> -->
						<!-- <view :style="computedFanShenStyle"></view> -->
						<view :style="{
							height: '25px',
							width: `${Math.min(Math.abs(fanShenCiShiCha) * 2, 100)}%`,
							background: fanShenCiShiCha < 0 ? '#fe9307' : '#1ed394',
							borderRadius: '10rpx'
						  }"></view>
					</view>
				</view>
			</view>
	
			<!-- 睡眠报告区域 -->
			<view class="sleep_report_area" v-if="daySleppDatas.reports && daySleppDatas.reports.length > 0 && hasSleepData && !!show">
				<view v-for="(report,index) of daySleppDatas.reports" :key="index" v-if="report.sleepTimeAll > 0" style="box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);margin-bottom: 30rpx;background: #fff;border-radius: 15rpx;padding: 30rpx 10rpx ;">
					
					<!-- 睡眠报告图 -->
					<view class="report_head"  @click="goReportInfo(index,report)" >
						<view class="tit">第{{index+1}}段 睡眠报告</view>
						<!-- <text>睡眠报告1</text> -->
						<view class="pic">
							<!-- 睡眠得分图 -->
							<yuanhuantuVue  :sleepReportInfo="Number(report.av)" :index="Number(report.timeStamp)"/>
						</view>
					</view>
					
					<!-- 睡眠报告图下的数据 -->
					<view class="report_foot">
						<view class="report_foot_item">
							<text class="title">睡眠时段</text>
							<text class="content">{{report.shuiMianshiDuanFormat || '- -'}}</text>
						</view>
						<view class="report_foot_item">
							<text class="title">睡眠时长</text>
							<text class="content"><text style="color: #a214a3;font-size: 38rpx;margin: 0 10rpx;white-space: nowrap;">{{report.sleepTimeFormat || '- -'}}</text></text>
						</view>
						<view class="report_foot_item">
							<text class="title">睡眠占比</text>
							<text class="content">{{report.shuiMianBi || '- -'}} %</text>
						</view>
						<view class="report_foot_item">
							<text class="title">平均心跳</text>
							<text class="content">{{report.bn !== undefined && report.bn !== null ? report.bn : (report.pjxt || '- -')}} 次</text>
						</view>
						<view class="report_foot_item">
							<text class="title">在床时长</text>
							<text class="content"><text style="color: #a214a3;font-size: 38rpx;margin: 0 10rpx;white-space: nowrap;">{{report.onbedTimeFormat || '- -'}}</text></text>
						</view>
						<view class="report_foot_item">
							<text class="title">深睡占比</text>
							<text class="content">{{report.bi !== undefined && report.bi !== null ? report.bi : (report.sssczb || '- -')}} %</text>
						</view>
					</view>
					
					<hr style="border: none; border-top: 1px solid #ccc;margin: 20rpx 30rpx;"/>
					
					<!-- 失眠指数 -->
					<view class="shi_m">
						<!-- 失眠指数 -->
						<view style="font-weight: bold; padding: 0 20rpx;line-height: 30px;">
							<view style="display: flex;align-items: center;justify-content: center;font-weight: bold;font-size: 20px;margin-top: 40rpx;">
								失眠指数
								<uni-icons type="help-filled" size="22" color="#bbb" @click="showTipShiMianZhiShu" style="font-weight: lighter;"></uni-icons>
							</view>
							<view>
								失眠指数： 
								<text style="color: #a214a3;font-weight: lighter;">{{report.shuimianzhishu || '- -'}}</text> 
							</view>
							<!-- <view>睡眠质量评估: <text>{{report.quality}}</text> </view> -->
							<view>
								失眠风险： 
								<text style="color: #a214a3;font-weight: lighter;">{{report.severity || '- -'}}</text> 
							</view>
							<view>
								建议：
								<text style="color: #a214a3;font-weight: lighter;">
								{{report.recommendation || '- -'}}</text>
							</view>
							<view>
								入睡前的清醒时长：
								<text style="color: #a214a3;font-weight: lighter;">
								{{report.rsqqxsc || '- -'}}分钟</text>
							</view>
							<view>
								睡眠中的清醒时长：
								<text style="color: #a214a3;font-weight: lighter;">
								{{report.smzqxsc || '- -'}}分钟</text>
							</view>
							<view>
								睡眠中的清醒次数：
								<text style="color: #a214a3;font-weight: lighter;">
								{{report.smzqxcs || '- -'}}次</text>
							</view>
						</view>
						
						<!-- {{report.leidatuDatas}} -->
						<leidatuVue :leidaDatas="report.leidatuDatas" :index="index"/>
					</view>
					
					<hr style="border: none; border-top: 1px solid #ccc;margin: 20rpx 30rpx;"/>
					
					<!-- 精神压力 -->
					<!-- <view style="border-radius: 20rpx;background: rgba(123, 227, 255, 0.2);"> -->
					<view class="jing_s">
						<!-- 精神压力 -->
						<view style="font-weight: bold; padding: 10rpx 20rpx 20rpx 20rpx;line-height: 30px;">
							<view style="display: flex;align-items: center;justify-content: center;font-weight: bold;font-size: 20px;line-height: 100rpx;">
								精神压力指数
								<uni-icons type="help-filled" size="22" color="#bbb" @click="showTipJingShenYaLiZhiShu" style="font-weight: lighter;"></uni-icons>
							</view>
							<view style="display: flex;">
								压力指数： 
								<view style="color: #a214a3;font-weight: lighter;margin-right: 30rpx;">{{report.jingshenyali || '- -'}}</view> 
								<view v-if="report.jingshenyali<=30" style="background: #7be3ff;border-radius: 15rpx;
									width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">放松</view>
								<view v-else-if="report.jingshenyali<=60" style="background: #1cd496;border-radius: 15rpx;
									width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">正常</view>
								<view v-else-if="report.jingshenyali<=80" style="background: #ffaa00;border-radius: 15rpx;
									width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">中等压力</view>
								<view v-else-if="report.jingshenyali<=100" style="background: #fd5c0c;border-radius: 15rpx;
									width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">高压危险</view>
							</view>
							<view style="display: flex;">
								<view style="white-space: nowrap;">建议： </view>
								<view v-if="report.jingshenyali<=30" style="color: #333;font-weight: lighter;margin-right: 30rpx;">
									您的压力值为{{report.jingshenyali || '- -'}}，属于放松状态，您可以继续保持当前作息规律，避免熬夜；可以每天进行30分钟的有氧运动及睡前冥想或听轻音乐等。
								</view> 
								<view v-else-if="report.jingshenyali<=60" style="color: #333;font-weight: lighter;margin-right: 30rpx;">
									您的压力值为{{report.jingshenyali || '- -'}}，属于正常状态，您可以每天尝试5分钟的深呼吸练习；同时需要注意午后不喝咖啡/茶，睡前1小时不用手机以减少对睡眠的刺激。
								</view> 
								<view v-else-if="report.jingshenyali<=80" style="color: #333;font-weight: lighter;margin-right: 30rpx;">
									您的压力值为{{report.jingshenyali || '- -'}}，属于中等压力，您在睡前20分钟可以尝试正念冥想或温水泡脚，同时减少酒精/香烟等刺激性物质的摄入，尽量只在真正困倦时上床，提高睡眠效率。
								</view> 
								<view v-else-if="report.jingshenyali<=100" style="color: #333;font-weight: lighter;margin-right: 30rpx;">
									您的压力值为{{report.jingshenyali || '- -'}}，属于高压危险，在难以入睡时可以尝试4-7-8呼吸法（吸气4秒→屏息7秒→呼气8秒）进行缓解；并对睡眠环境进行调整，卧室黑暗、安静，可使用白噪音。
									<br />
									<text style="color: #f00;font-weight: bold;">注意：若高压持续3天以上，建议及时咨询医生或心理专家。</text>
								</view> 
								
								<!-- 
								<view v-if="report.jingshenyali<=30" style="background: #7be3ff;border-radius: 15rpx;width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">放松</view>
								<view v-else-if="report.jingshenyali<=60" style="background: #1cd496;border-radius: 15rpx;width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">正常</view>
								<view v-else-if="report.jingshenyali<=80" style="background: #ffaa00;border-radius: 15rpx;width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">中等压力</view>
								<view v-else-if="report.jingshenyali<=100" style="background: #fd5c0c;border-radius: 15rpx;width: 160rpx;color: #ffffff;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">高压危险</view>
								 -->
							</view>
							<!-- <view>睡眠质量评估: <text>{{report.quality}}</text> </view> -->
							<view style="">
								压力区间说明： 
								<view style="font-weight: lighter;display: flex;flex-direction: column;padding-left: 118px;line-height: 40rpx;font-size: 28rpx;margin-top: -40rpx;">
									<!-- 分数区间	压力等级	生理表现	临床对应参考
									​​0-30​​	放松状态	深睡占比≥35%，翻身频率<0.03次/分钟，HRV（SDNN）>50ms	PSQI<5（睡眠质量好）
									​​30-60​​	正常压力	深睡25-35%，翻身0.03-0.06次/分钟，HRV 30-50ms	正常生活压力水平
									​​60-80​​	中等压力	深睡15-25%，翻身0.06-0.1次/分钟，HRV 20-30ms，呼吸紊乱	HADS焦虑评分8-10（轻度焦虑）
									​​80-100​​	高压危险	深睡<15%，翻身>0.1次/分钟，HRV<20ms，呼吸急促（标准差>6次/分钟）	皮质醇水平>18μg/dl（生理应激） -->
									<!-- 1. ​​公式权重分析​​
									​​深睡占比（40%权重）​​
									每减少10%深睡 → 压力指数+4分
									例：深睡从30%降至20% → (1-0.2)-(1-0.3)=0.1 → 总分+4分
									​​翻身频率（30%权重）​​
									假设在床时长=480分钟：
									翻身15次 → 15/480=0.031次/分钟 → 贡献9.3分
									翻身48次 → 48/480=0.1次/分钟 → 贡献30分（触达上限）
									​​心跳变异性（20%权重）​​
									SDNN=15ms → 15/10=1.5 → 贡献30分
									SDNN=5ms → 5/10=0.5 → 贡献10分
									​​呼吸紊乱（10%权重）​​
									标准差=4次/分钟 → 4/5=0.8 → 贡献8分 -->
									<text style="color: #333;">0~30：放松状态</text>
									<text style="color: #333;">30~60：正常压力</text>
									<text style="color: #333;">60~80：中等压力</text>
									<text style="color: #333;">80~100：高压危险</text>
								</view>
							</view>
						</view>
					</view>
					
					
					<hr v-if="report.AHI" style="border: none; border-top: 1px solid #ccc;margin: 20rpx 30rpx;"/>
					
					
					<!-- AHI值数据展示 -->
					<view class="ahi_z" v-if="AHIzhishuShow && report.AHI">
						<view style="text-align: center;font-size: 40rpx;font-weight: bold;white-space: nowrap;">
							AHI指数
							<uni-icons type="help-filled" size="22" color="#bbb" @click="showTipAHI" style="font-weight: lighter;"></uni-icons>
						</view>
						
						<!-- 当天AHI值 -->
						<view v-if="report.AHI" style="display: flex;justify-content: flex-start;">
							<view v-if="report.AHI < 5" style="display: flex;align-items: center;line-height: 60px;flex-wrap: nowrap;">
								<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{report.AHI || '- -'}}</view>
								<view style="width: 160rpx;color: #ffffff;background-color: #1cd496;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">正常</view>
							</view>
							<view v-else-if="report.AHI >= 5 && report.AHI < 15" style="display: flex;align-items: center;line-height: 60px;">
								<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{report.AHI || '- -'}}</view>
								<view style="width: 160rpx;color: #ffffff;background-color: #ffaa00;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">低风险</view>
							</view>
							<view v-else-if="report.AHI >= 15 && report.AHI < 30" style="display: flex;align-items: center;line-height: 60px;">
								<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{report.AHI || '- -'}}</view>
								<view style="width: 160rpx;color: #ffffff;background-color: #fd5c0c;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">中风险</view>
							</view>
							<view v-else-if="report.AHI >= 30" style="display: flex;align-items: center;line-height: 60px;">
								<view style="padding-left: 5px;margin: 0 50rpx 0 30rpx;font-weight: bold;">AHI值：{{report.AHI || '- -'}}</view>
								<view style="width: 160rpx;color: #ffffff;background-color: #d8090f;border-radius: 15rpx;text-align: center;font-weight: bold;height: 30px;line-height: 30px;">高风险</view>
							</view>
						</view>
						<view v-if="report.AHI" style="display: flex;justify-content: center;">
								<view style="font-weight: bold;color: #888;">每小时发生呼吸暂停次数 {{report.AHI || '- -'}} 次</view>
						</view>
						
					</view>
					
				</view>
				<button @click="closeReports()" style="color: #888;font-size: 16px;">{{`收起所有报告`}}</button>
			</view>
			<view v-else-if="!daySleppDatas.reports || daySleppDatas.reports.length==0 || !hasSleepData" style="text-align: center;font-size: 15px;height: auto;color: #aaa;">
				<image src="/static/devicetypeicon/kongkongde.svg" style="width: 250px;margin-top: 90px;margin-bottom: -20px;" />
				<view style="font-weight: bold;">该设备在此日期无睡眠报告数据</view>
			</view>
			<view v-else>
				<button @click="showReports()" style="color: #3ed196;font-size: 16px;"> {{`点击 展开所有报告`}} </button>
			</view>
						
		<!-- </scroll-view> -->
	</view>
</template>

<script>
	// import {getDeviceRealTimeData} from '@/api/system/device'
	// import {getTenMinData,getDaySleepReportData} from '@/api/system/devicelog'
	import {listReportsleep} from '@/api/reportsleep.js'
	import {listTensleep} from '@/api/tensleep.js'
	import {listDevice} from '@/api/device.js'
	
	import yuanhuantuVue from '@/components/charts/yuanhuantu.vue'
	import leidatuVue from './leidatu.vue'
	
	import {formatDatesDay, formatDatesMinute, formatDate} from '@/utils/getdate.js'
	import { sleepReportHandler, sleepReportHandlerAvg, sortTenData, huoQuShuiMianShiDuan, huoQuShuiMianShiDuanFormat, formatSleepCanvasForTenDatas, formatSleepCanvasForTenDatasss, calculateStandardDeviation } from '@/utils/handleSleepReport.js'
	import sleepCanvasss from './sleep-canvasss.vue'
	
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
		  queryparams:{
			  type: Object,
			  required: true,
			  default: {} // 设置默认值为空对象
		  },
		  isShare:{
			  type: Boolean,
			  required: true,
			  default: false // 设置默认值为空对象
		  }
		},
		watch:{
			productKey: {
			  handler(newValue, oldValue) {
			    this.initContent();
			  },
			  deep: true,
			  immediate: false
			}
		},
		computed:{
			//睡眠时长差
			smscc(){
				const mins = Math.abs(this.shuiMianShiChangCha);
				const hour = Math.floor(mins / 60);
				const min = mins % 60 ;
				if(hour==0){
					return `${min}分钟`
				}
				return `${hour}小时${min}分钟`
			},
			//深睡时长差
			ssscc(){
				const mins = Math.abs(this.shenShuiShiChangCha);
				const hour = Math.floor(mins / 60);
				const min = mins % 60 ;
				if(hour==0){
					return `${min}分钟`
				}
				return `${hour}小时${min}分钟`
			},
			//浅睡时长差
			qsscc(){
				const mins = Math.abs(this.qianShuiShiChangCha);
				const hour = Math.floor(mins / 60);
				const min = mins % 60 ;
				if(hour==0){
					return `${min}分钟`
				}
				return `${hour}小时${min}分钟`
			},
			//清醒时长差
			qxscc(){
				const mins = Math.abs(this.qingXingShiChangCha);
				const hour = Math.floor(mins / 60);
				const min = mins % 60 ;
				if(hour==0){
					return `${min}分钟`
				}
				return `${hour}小时${min}分钟`
			},
			//今天AHI值
			ahiValue(){
				// console.log(this.daySleppDatas.allData);
				
				// const breatheStopSum = this.daySleppDatas.allData.breatheStopSum;//呼吸暂停次数
				const breatheStopSum = this.daySleppDatas.allData.huxizantingcishu;//呼吸暂停次数
				
				const TST = Math.round(this.daySleppDatas.allData.sleepTimeAll * 10 / 60)  /10;//睡眠时长（不含清醒)(单位：小时)
				console.log(TST);
				if(!TST){
					return `${0}`;
				}
				let num = (breatheStopSum / TST) * 10;
				let AHI = Math.round(num) / 10;
				return `${AHI}`;
				// return 30;
			},
			//昨天AHI值
			yesterdayAhiValue(){
				// const breatheStopSum = this.yesterdaySleppDatas.allData.breatheStopSum//呼吸暂停次数
				const breatheStopSum = this.yesterdaySleppDatas.allData.huxizantingcishu;//呼吸暂停次数
				
				const TST = Math.round(this.yesterdaySleppDatas.allData.sleepTimeAll * 10 / 60)  /10;
				if(!TST){
					return `${0}`;
				}
				let num = (breatheStopSum / TST) * 10;
				let AHI = Math.round(num) / 10;
				return `${AHI}`;
				// return 30;
			},
			//今天和昨天的AHI值差
			ahiCha(){
				const todayBreatheStopSum = this.daySleppDatas.allData.huxizantingcishu
				const todayTST = Math.round(this.daySleppDatas.allData.sleepTimeAll * 10 / 60)  /10;
				let todayNum = (todayBreatheStopSum / todayTST) * 10;
				let todayAHI = Math.round(todayNum) / 10;
				
				
				const yesterdaybreatheStopSum = this.yesterdaySleppDatas.allData.huxizantingcishu
				const yesterdayTST = Math.round(this.yesterdaySleppDatas.allData.sleepTimeAll * 10 / 60)  /10;
				let yesterdayNum = (yesterdaybreatheStopSum / yesterdayTST) * 10;
				let yesterdayAHI = Math.round(yesterdayNum) / 10;
				
				const ahicha = todayAHI - yesterdayAHI;
				return `${ahicha}`;
				// return 30;
			},
			// 判断是否有实际睡眠数据（不全是清醒/离床状态）
			hasSleepData(){
				// 优先检查睡眠报告数据
				if(this.daySleppDatas.reports && this.daySleppDatas.reports.length > 0) {
					// 如果有睡眠报告，检查是否有有效的睡眠时长
					const hasValidReport = this.daySleppDatas.reports.some(report => 
						(report.sleepTimeAll && Number(report.sleepTimeAll) > 0) ||
						(report.bf && Number(report.bf) > 0)
					);
					
					// 如果睡眠报告显示有睡眠时长，认为有数据
					if(hasValidReport && this.daySleppDatas.allData.sleepTimeAll > 0) {
						return true;
					}
				}
				
				// 备用检查：如果有十分钟数据且不全是清醒/无数据状态
				if(this.dayTenDatas && this.dayTenDatas.length > 0) {
					// al字段: '0'=深睡, '1'=浅睡, '2'=清醒, '3'=无数据
					const hasSleepState = this.dayTenDatas.some(item => 
						item.al === '0' || item.al === '1' || item.al === 0 || item.al === 1
					);
					
					// 如果有睡眠状态且总睡眠时长大于0，认为有数据
					if(hasSleepState && this.daySleppDatas.allData.sleepTimeAll > 0) {
						return true;
					}
				}
				
				return false;
			}
		},
		data() {
			return {
				deviceInfo:null,
				queryParams: {
					productKey: '',
					deviceKey: null,
					// identifier: 'bc',
					date:null,//日期
					moduleId: null,
					deviceId:null,
				},

				nowDate:null,//当天时间
				chooseDate:null,//选中的日期
				timeStampStart:null,//开始时间
				timeStampEnd:null,//截止时间
				timer:null,//定时器
				
				///new - start
				daySleppDatasTemp: {
					allData: {
						sleepTimeAll		: 0,	//总睡眠时长
						sleepTimeFormat		: '',	//总睡眠时长
						shenShuiBiAvg		: 0,	//日均深睡占比
						qianShuiBiAvg		: 0,	//日均浅睡占比
						qingXingBiAvg		: 0,	//日均清醒占比
						shuiMianCiShuAll	: 0,	//睡眠次数
						fanShenCiShuAvg		: 0,	//日均翻身次数
						liChuangCiShuAvg	: 0,	//日均离床次数
						deFenAvg			: 0,	//日均睡眠得分
						breatheStopSum		: 0,	//总呼吸暂停次数
						zaiChuangShiChangALL: 0,	//总在床时长
						shenShuiShiChangALL	: 0,	//总深睡时长
						qianShuiShiChangALL	: 0,	//总浅睡时长
						qingXingShiChangALL	: 0,	//总清醒时长
						fanShenCiShuALL		: 0,	//总翻身次数
						liChuangCiShuALL	: 0,	//总离床次数
					},
					reports: [
						/* {
							//报告开始时间
							//报告结束时间
						} */
					]
				},//一天的睡眠数据
				daySleppDatas: {
					allData: {
						sleepTimeAll		: 0,	//总睡眠时长
						sleepTimeFormat		: '',	//总睡眠时长
						shenShuiBiAvg		: 0,	//日均深睡占比
						qianShuiBiAvg		: 0,	//日均浅睡占比
						qingXingBiAvg		: 0,	//日均清醒占比
						shuiMianCiShuAll	: 0,	//睡眠次数
						fanShenCiShuAvg		: 0,	//日均翻身次数
						liChuangCiShuAvg	: 0,	//日均离床次数
						deFenAvg			: 0,	//日均睡眠得分
						breatheStopSum		: 0,	//总呼吸暂停次数
						zaiChuangShiChangALL: 0,	//总在床时长
						shenShuiShiChangALL	: 0,	//总深睡时长
						qianShuiShiChangALL	: 0,	//总浅睡时长
						qingXingShiChangALL	: 0,	//总清醒时长
						fanShenCiShuALL		: 0,	//总翻身次数
						liChuangCiShuALL	: 0,	//总离床次数
					},
					reports: [
						/* {
							//报告开始时间
							//报告结束时间
						} */
					]
				},//一天的睡眠数据
				yesterdaySleppDatasTemp: {
					allData: {
						sleepTimeAll		: 0,	//总睡眠时长
						sleepTimeFormat		: '',	//总睡眠时长
						shenShuiBiAvg		: 0,	//日均深睡占比
						qianShuiBiAvg		: 0,	//日均浅睡占比
						qingXingBiAvg		: 0,	//日均清醒占比
						shuiMianCiShuAll	: 0,	//睡眠次数
						fanShenCiShuAvg		: 0,	//日均翻身次数
						liChuangCiShuAvg	: 0,	//日均离床次数
						deFenAvg			: 0,	//日均睡眠得分
						breatheStopSum		: 0,	//总呼吸暂停次数
						zaiChuangShiChangALL: 0,	//总在床时长
						shenShuiShiChangALL	: 0,	//总深睡时长
						qianShuiShiChangALL	: 0,	//总浅睡时长
						qingXingShiChangALL	: 0,	//总清醒时长
						fanShenCiShuALL		: 0,	//总翻身次数
						liChuangCiShuALL	: 0,	//总离床次数
					},
					reports: [
						/* {
							//报告开始时间
							//报告结束时间
						} */
					]
				},//一天的睡眠数据
				yesterdaySleppDatas: {
					allData: {
						sleepTimeAll		: 0,	//总睡眠时长
						sleepTimeFormat		: '',	//总睡眠时长
						shenShuiBiAvg		: 0,	//日均深睡占比
						qianShuiBiAvg		: 0,	//日均浅睡占比
						qingXingBiAvg		: 0,	//日均清醒占比
						shuiMianCiShuAll	: 0,	//睡眠次数
						fanShenCiShuAvg		: 0,	//日均翻身次数
						liChuangCiShuAvg	: 0,	//日均离床次数
						deFenAvg			: 0,	//日均睡眠得分
						breatheStopSum		: 0,	//总呼吸暂停次数
						zaiChuangShiChangALL: 0,	//总在床时长
						shenShuiShiChangALL	: 0,	//总深睡时长
						qianShuiShiChangALL	: 0,	//总浅睡时长
						qingXingShiChangALL	: 0,	//总清醒时长
						fanShenCiShuALL		: 0,	//总翻身次数
						liChuangCiShuALL	: 0,	//总离床次数
					},
					reports: [
						/* {
							//报告开始时间
							//报告结束时间
						} */
					]
				},//一天的睡眠数据
				show:false,//是否展开
				shuiMianShiChangCha: 0,//今天与昨天的 睡眠时长 差（正数为增加了，负数为减少了)
				shenShuiShiChangCha: 0,//今天与昨天的 深睡时长 差（正数为增加了，负数为减少了)
				qianShuiShiChangCha: 0,//今天与昨天的 浅睡时长 差（正数为增加了，负数为减少了)
				qingXingShiChangCha: 0,//今天与昨天的 清醒时长 差（正数为增加了，负数为减少了)
				
				shenShuiZhanBiCha: 0,//今天与昨天的 深睡占比 差（正数为增加了，负数为减少了)
				qianShuiZhanBiCha: 0,//今天与昨天的 浅睡占比 差（正数为增加了，负数为减少了)
				fanShenCiShiCha: 0,//今天与昨天的 翻身次数 差（正数为增加了，负数为减少了)
				
				breatheStopCha: 0,//今天与昨天的 呼吸暂停次数次数 差（正数为增加了，负数为减少了)
				
				showDuiBiFlag: false,//于昨天数据的对比计算完成后改为true
				
				dayTenDatas: [],//20:00~08:00点间的睡眠图数据
				startTimeStamp: new Date().getTime(),//20:00~08:00点间的睡眠图数据
				endTimeStamp: new Date().getTime(),//20:00~08:00点间的睡眠图数据
				slefRefresherFlag: false,//自定义下拉刷新状态
				scrollRefresherEnabledFlag: true,//是否开启自定义下拉刷新
				leidatuDatas: {},//雷达图数据
				
				AHIzhishuShow : true,//暂不开放AHI指数的展示！！！需要展示是改为true即可
				
				///new - end
			}
		},
		components:{
			yuanhuantuVue,
			sleepCanvasss,
			leidatuVue
		},
		
		mounted() {
			this.timer = setTimeout(this.initContent,100);
			
		},
		beforeDestroy() {
			this.closeTimer(); // 销毁定时器
		},
		methods: {
			showReports(){
				this.show = true;
			},
			closeReports(){
				this.show = false;
			},
			/** 初始渲染内容 */
			async initContent(){
				if(!!this.productKey && !!this.deviceKey){
					//1 查询当前设备信息
					let queryParams ={
						productKey:this.productKey,
						deviceKey:this.deviceKey
					}
					if(this.isShare){
						queryParams.isShare = true;
					}
					const res = await listDevice(queryParams);
						
					this.deviceInfo			= res.rows[0];
					
					this.queryParams.productKey	= res.rows[0].productKey;
					this.queryParams.deviceKey	= res.rows[0].deviceKey;
					this.queryParams.date		= formatDatesDay(new Date());
					this.nowDate				= formatDatesDay(new Date());
					
					if(this.queryparams.date){
						this.chooseDate		= this.queryparams.date;
					}else{
						this.chooseDate		= formatDatesDay(new Date());
					}
					
					//获取当天的00:00:00时间戳
					this.timeStampStart				= new Date(this.chooseDate+' 00:00:00').getTime();
					//获取当天的23:59:59时间戳
					this.timeStampEnd				= new Date(this.chooseDate+' 23:59:59').getTime();
					
					if(this.queryparams.date){
						this.queryParams.date		= this.queryparams.date;
						this.chooseDate				= this.queryparams.date;
					}
					if(this.queryparams.date){
						this.queryParams.nowMonth	= this.queryparams.nowMonth;
					}
					if(this.queryparams.date){
						this.queryParams.nowMonthDays	= this.queryparams.nowMonthDays;
					}
					this.getTwoDayReportsData();
						
				} else {
					// console.log("首次渲染时执行了这里导致渲染不出数据")
				}
			},
			
			/** 销毁定时器 */
			closeTimer(){
				if(this.timer){
					clearTimeout(this.timer);
					this.timer = null;
				}
			},
			
			/* 改变触发的时间 */
			changeDate(e,handle){
				if(e.detail.value){
					this.closeReports();
					this.chooseDate=e.detail.value
					this.queryParams.date=e.detail.value
					this.timeStampStart=new Date(e.detail.value+' 00:00:00').getTime()
					this.timeStampEnd=new Date(e.detail.value+' 23:59:59').getTime()
					// console.log(">>>",this.timeStampStart,">>>",this.timeStampEnd,"<<<")
				}else if(handle===0){
					this.closeReports();
					// 将字符串转换为日期对象
					let date = new Date(this.chooseDate);
					// 减去一天
					date.setDate(date.getDate() - 1);
					// 将日期对象转换回字符串
					this.chooseDate = date.toISOString().split('T')[0];  // 格式为 'YYYY-MM-DD'
					this.timeStampStart=new Date(this.chooseDate+' 00:00:00').getTime()
					this.timeStampEnd=new Date(this.chooseDate+' 23:59:59').getTime()
					// console.log(">>>",this.timeStampStart,">>>",this.timeStampEnd,"<<<")
					this.queryParams.date=this.chooseDate
				}else if(handle===1){
					// 将字符串转换为日期对象
					let date = new Date(this.chooseDate);
					// 创建当前日期对象，并将时间部分设置为 00:00:00
					let today = new Date();
					// today.setHours(0, 0, 0, 0);  // 将当前日期的时间部分设置为 00:00:00，以便仅比较日期
					// 加一天
					// 如果加一天后的日期超过当前日期，则保持原来的日期不变
					// console.log("===========")
					// date.setHours(0, 0, 0, 0);
					today.setHours(8, 0, 0, 0);
					
					date.setDate(date.getDate() + 1);
					
					// console.log(date.getTime() > today.getTime())
					if (date.getTime() > today.getTime()) {
						// console.log("-----------")
						date.setDate(date.getDate() - 1);  // 恢复为原来的日期
						// console.log(date,date.getTime(),date.toISOString())//Fri Oct 11 2024 00:00:00 GMT+0800 (中国标准时间) 1728576000000 '2024-10-10T16:00:00.000Z'
						// console.log(today,today.getTime(),today.toISOString())//Fri Oct 11 2024 00:00:00 GMT+0800 (中国标准时间) 1728576000000 '2024-10-10T16:00:00.000Z'
						this.$modal.msg('已经到尽头了~');
						// console.log("===========")
					}else{
						this.closeReports();
					}
					// 将日期对象转换回字符串
					// this.chooseDate = date.toISOString().split('T')[0];  // 格式为 'YYYY-MM-DD'
					this.chooseDate = formatDatesDay(date)
					// console.log(this.chooseDate)	//2024-10-11
					this.timeStampStart=new Date(this.chooseDate+' 00:00:00').getTime()
					this.timeStampEnd=new Date(this.chooseDate+' 23:59:59').getTime()
					// console.log(">>>",this.timeStampStart,">>>",this.timeStampEnd,"<<<")
					// console.log(this.chooseDate);
					this.queryParams.date=this.chooseDate;
				}
				
				// console.log(this.queryParams)
				// this.getRealValue()
				this.getTwoDayReportsData();
			},
			
			/* 跳转报告详情页 */
			goReportInfo(reportIndex,sleepReportItem){this.$modal.loading("加载中...");
				
				//将sleepReportItem存入store
				this.$store.commit('SET_SLEEP_REPORT_ITEM',JSON.parse(JSON.stringify(sleepReportItem)));
				
				let startTime=null;
				let endTime=null;
				// 兼容timeStamp和tts字段
				endTime=sleepReportItem.timeStamp || sleepReportItem.tts || sleepReportItem.endSleepTime;
				startTime=endTime-(Number(sleepReportItem.duration) * 60*1000);
				
				//传递productKey、deviceKey、reportIndex、date、startTime、endTime、isShare
				this.$tab.navigateTo('/pages/my/sleep-report-info/sleep-report-info?productKey='+this.productKey+'&deviceKey='+this.deviceKey+'&reportIndex='+reportIndex+'&date='+this.queryParams.date+'&startTime='+startTime+'&endTime='+endTime+'&isShare='+this.isShare)
				
			},
			
			/** 获取今天和昨天的睡眠报告数据 */
			async getTwoDayReportsData(){
				this.$modal.loading("加载中...");
				let timer = setTimeout(()=>{
					this.$modal.closeLoading();
				},3000)
				this.dayTenDatas = [];//重置变量
				this.showDuiBiFlag = false;//重置变量
				/* //1.获取 当天 睡眠报告的内容
				await this.getDayreport();
				//2.获取 前一天 睡眠报告的内容
				await this.getYesterdayReport(); */
				
				await Promise.all([
					//1.获取 当天 睡眠报告的内容    //2.获取 前一天 睡眠报告的内容
					this.getTwoDaysReports(),
					
					//获取 20:00~08:00 间的十分钟睡眠数据
					this.getNSleepCanvasNewTenDatas()
				]);
				
				//对比 今天 和 昨天 数据的数据
				this.duibiDatas();
				this.slefRefresherFlag = false;
				// console.log("关闭下拉刷新");
				this.$modal.closeLoading();
				if(!!timer){
					clearTimeout(timer);
					timer = null;
				}
			},
			
			/** 获取今昨两天的睡眠报告数据 */
			async getTwoDaysReports(){
				//1.列出时间戳
				let oneDayTimeStamp = 24*60*60*1000;
				let todayStartTimeStamp = this.timeStampStart;
				let todayEndTimeStamp = this.timeStampEnd;
				let yesterdayStartTimeStamp = this.timeStampStart - oneDayTimeStamp;
				let yesterdayEndTimeStamp = this.timeStampEnd - oneDayTimeStamp;
				//2.构建查询参数
				const query={
				    deviceKey: this.deviceKey,
				    productKey: this.productKey,
					deviceId: this.queryparams.deviceId,
				    startTimeStamps:yesterdayStartTimeStamp,
				    endTimeStamps:todayEndTimeStamp
				}
				//3.发送请求
				let res = await listReportsleep(query);//获取两天的睡眠报告数据
				// console.log(res.rows);
				let yesterdayReports = [];
				let todayReports = [];
				
				for(let report of res.rows){
					// 兼容timeStamp和tts字段
					const reportEndTime = report.timeStamp || report.tts || report.endSleepTime;
					
					// 调试日志：查看报告归属判断
					console.log('报告归属判断:', {
						'report.timeStamp': report.timeStamp,
						'report.tts': report.tts,
						'report.endSleepTime': report.endSleepTime,
						'使用的结束时间': reportEndTime,
						'报告时间': new Date(reportEndTime).toLocaleString(),
						'当天开始时间': new Date(todayStartTimeStamp).toLocaleString(),
						'归属': reportEndTime < todayStartTimeStamp ? '昨天' : '今天'
					});
					
					if(reportEndTime < todayStartTimeStamp){
						yesterdayReports.push(report);
					}else{
						todayReports.push(report);
					}
				}
				
				await Promise.all([
					//1.获取 当天 睡眠报告的内容
					this.getDayreport(todayReports),
					//2.获取 前一天 睡眠报告的内容
					this.getYesterdayReport(yesterdayReports)
				]);
				
			},
			/* 获取当天一天的数据 */
			async getDayreport(todayRepportss){
				//1.
				let todayRepports = todayRepportss;
				//2.查询日睡眠报告内容(可能有多段睡眠)
				
				// 调试：查看原始报告数据中的睡眠占比字段
				console.log('[日报告调试] 原始报告睡眠占比:', todayRepports.map(r => ({
					bg: r.bg, // 清醒占比
					bh: r.bh, // 浅睡占比
					bi: r.bi, // 深睡占比
					bn: r.bn  // 平均心跳
				})));
				
				this.daySleppDatasTemp = sleepReportHandler(todayRepports);//调用工具类处理睡眠报告（不包含十分钟数据的）
				// console.log(this.daySleppDatasTemp);
				
				//3.查询十分钟数据
				await this.getTenData(this.daySleppDatasTemp.reports);
				
				//4.删除延迟上报的睡眠报告(容忍每小时丢失1条数据)
				for(let i = this.daySleppDatasTemp.reports.length - 1; i >= 0; i--) {
				    const report = this.daySleppDatasTemp.reports[i];
				    // console.log(report);
				    const smzb = Number(report.bg) + Number(report.bi); //浅睡+深睡占比
				    const tiaoshuMin = Math.floor(Number(report.bf) * (smzb / 100));//除去清醒的睡眠分钟数
				    const minRequired = Math.floor(tiaoshuMin / 10);//正常情况下120min应该传的十分钟数据条数
					
					const allowNum = 3;//每小时允许丢失的条数
					//1条时,60min/60=补1		120min/60=补2
					//2条时,60min/30=补2		120min/30=补4
					//3条时,60min/20=补3		120min/20=补6
				    let diushiNum = Math.ceil(tiaoshuMin / (60 / allowNum));//允许丢失的条数总和
					//如果(实际的十分钟数据条数 + 允许丢失的条数总和 < 正常情况下应该传的十分钟数据总条数)则删除此条记录
				    if(!!report.tenDatas && report.tenDatas.length + diushiNum < minRequired) {//容忍丢失(容忍每小时丢失1条数据)
				        this.daySleppDatasTemp.reports.splice(i, 1); // 删除当前元素
				    }
				}
				
				
				this.getTodayHuxizantingAll();
				
				//更新睡眠段数为过滤后的实际段数
				this.daySleppDatasTemp.allData['shuiMianCiShuAll'] = this.daySleppDatasTemp.reports.length;
				
				//5.给渲染的数据赋值(最好在这里进行赋值，不然会闪一下)
				//6.计算加权平均分
				const weightAvg = sleepReportHandlerAvg(this.daySleppDatasTemp)
				this.daySleppDatasTemp.allData['weightAvg'] = weightAvg;
				try{
					this.huoqushimianzhishu();
					this.huoqujingshenyalizhishu();
				}catch(err){
					console.log(err);
				}
				this.daySleppDatas = JSON.parse(JSON.stringify(this.daySleppDatasTemp));
				console.log('-----------');
				console.log(this.daySleppDatas);
			},
			/** 计算当日睡眠报告呼吸暂停次数 */
			getTodayHuxizantingAll(){
				let count = 0;
				for(let report of this.daySleppDatasTemp.reports){
					count += Number(report.bo) || 0; // 使用bo（呼吸暂停次数）
					let TST = Math.round(report.sleepTimeAll * 10 / 60) / 10;
					if(!!TST){
						let num = ((Number(report.bo) || 0) / TST) * 10;
						let AHI = Math.round(num) / 10;
						this.$set(report,'AHI',AHI)
					}
				}
				this.daySleppDatasTemp.allData['huxizantingcishu'] = count;
			},
			/** 计算前一天的睡眠报告呼吸暂停次数 */
			getYesterDayHhuxizantingAll(){
				let count = 0;
				for(let report of this.yesterdaySleppDatasTemp.reports){
					count += Number(report.bo) || 0; // 使用bo（呼吸暂停次数）
				}
				this.yesterdaySleppDatasTemp.allData['huxizantingcishu'] = count;
			},
			/* 获取昨天一天的数据 */
			async getYesterdayReport(yesterdayReportss){
				//1.处理数据
				this.yesterdaySleppDatasTemp = sleepReportHandler(yesterdayReportss);
				console.log('【日报告调试-昨天】处理后:', this.yesterdaySleppDatasTemp.allData);
				
				//2.查询十分钟数据
				await this.getTenData(this.yesterdaySleppDatasTemp.reports);
				
				//3.删除延迟上报的睡眠报告
				for(let i = this.yesterdaySleppDatasTemp.reports.length - 1; i >= 0; i--) {
				    const report = this.yesterdaySleppDatasTemp.reports[i];
				    const smzb = Number(report.bg) + Number(report.bi);
				    const tiaoshuMin = Math.floor(Number(report.bf) * (smzb / 100));
				    const minRequired = Math.floor(tiaoshuMin / 10);
				    if(!!report.tenDatas && report.tenDatas.length + Math.ceil(tiaoshuMin/60) < minRequired) {
				        this.yesterdaySleppDatasTemp.reports.splice(i, 1);
				    }
				}
				this.getYesterDayHhuxizantingAll();
				
				//更新昨天睡眠段数
				this.yesterdaySleppDatasTemp.allData['shuiMianCiShuAll'] = this.yesterdaySleppDatasTemp.reports.length;
				
				//4.给渲染的数据赋值
				this.yesterdaySleppDatas = JSON.parse(JSON.stringify(this.yesterdaySleppDatasTemp));
			},
			
			/** 取出十分钟睡眠数据 */
			async getTenData(reports){
				//1.遍历n段睡眠报告
				// for(let report of reports){
				await Promise.all(reports.map(async (report) => {
				// 验证时间戳有效性
				if (!report.startSleepTime || !report.endSleepTime || 
				    isNaN(report.startSleepTime) || isNaN(report.endSleepTime)) {
					console.warn('[getTenData] 无效的时间戳，跳过此报告:', report);
					return;
				}
				
				//2.构建请求参数
				const queryTen={
					pageNum: 1,
					pageSize: 300,
				    deviceKey: this.deviceKey,//devicekey
				    productKey: this.productKey,//productkey
					isShare: this.isShare,//是否是被分享的设备
					date:this.queryParams.date,
				    selectTime:  new Date(this.chooseDate).getTime(),
				    sleepStartTimestamp:report.startSleepTime,
				    sleepEndTimestamp:report.endSleepTime
				}
				//3.发送请求
				const res = await listTensleep(queryTen);
				//统计呼吸暂停次数（从十分钟数据的bw字段累计）
				let hxztcs = 0;
				for(let tenData of res.rows){
					hxztcs += Number(tenData.bw) || 0;
				}
				this.$set(report, 'hxztcs', hxztcs); // 呼吸暂停次数，不要覆盖bn（平均心跳）
				//4.对十分钟数据进行排序
				const tenDatas = sortTenData(res.rows);
				//5.添加十分钟数据
				this.$set(report, 'tenDatas', tenDatas);
				//6.截取出睡眠时段的十分钟数据(去掉头尾的 清醒 和 无 )
				const shuiMianShiDuanTenDatas = huoQuShuiMianShiDuan(tenDatas);
				//7.获取睡眠时段 并 赋值
				this.$set(report, 'shuiMianshiDuanFormat', huoQuShuiMianShiDuanFormat(shuiMianShiDuanTenDatas));
			}));
			},
			
			/** 获取当天所有睡眠的十分钟数据 */
			async getNSleepCanvasNewTenDatas(){
				//1.当天20:00:00的时间戳
				const starTimeStamp = new Date(this.chooseDate + ' 20:00:00').getTime();
				//2.次日09:00:00的时间戳
				const nextDayDate = new Date(new Date(this.chooseDate + ' 00:00:00').getTime() + 24 * 60 * 60 * 1000);
				const nextDayStr = `${nextDayDate.getFullYear()}-${String(nextDayDate.getMonth()+1).padStart(2,'0')}-${String(nextDayDate.getDate()).padStart(2,'0')}`;
				const endTimeStamp = new Date(nextDayStr + ' 09:00:00').getTime();
				
				// 验证时间戳有效性
				if (!this.chooseDate || isNaN(starTimeStamp) || isNaN(endTimeStamp)) {
					console.error('[getNSleepCanvasNewTenDatas] 无效的时间戳:', {
						chooseDate: this.chooseDate,
						starTimeStamp,
						endTimeStamp
					});
					return;
				}
				
				//3.构建请求参数
				const queryTen={
					pageNum: 1,
					pageSize: 300,
					deviceKey: this.deviceKey,
					productKey: this.productKey,
					deviceId: this.queryparams.deviceId,
					sleepStartTimestamp: starTimeStamp,
					sleepEndTimestamp: endTimeStamp
				}
				//4.发送请求
				const res = await listTensleep(queryTen);
				console.log('[睡眠状态调试] 查询时间范围:', new Date(starTimeStamp).toLocaleString(), '~', new Date(endTimeStamp).toLocaleString());
				console.log('[睡眠状态调试] 十分钟数据原始结果:', res.rows?.length || 0, '条');
				//5.对十分钟数据进行排序
				const tenDatas = sortTenData(res.rows);
				//6.使用完整的十分钟数据
				if(tenDatas.length == 0) {
					return;
				}
				//7.给props变量赋值 
				this.startTimeStamp = starTimeStamp;
				//8.给props变量赋值
				this.endTimeStamp = endTimeStamp;
				//9.深拷贝十分钟数据
				this.dayTenDatas = JSON.parse(JSON.stringify(tenDatas));
			},
			
			/** 今天和昨天数据的数据进行对比 */
			duibiDatas(){
				const smscChange = this.daySleppDatas.allData.sleepTimeAll - this.yesterdaySleppDatas.allData.sleepTimeAll;
				const ssscChange = this.daySleppDatas.allData.shenShuiShiChangALL - this.yesterdaySleppDatas.allData.shenShuiShiChangALL;
				const qsscChange = this.daySleppDatas.allData.qianShuiShiChangALL - this.yesterdaySleppDatas.allData.qianShuiShiChangALL;
				const qxscChange = this.daySleppDatas.allData.qingXingShiChangALL - this.yesterdaySleppDatas.allData.qingXingShiChangALL;
				
				console.log("睡眠时长差等于：",smscChange);
				this.shuiMianShiChangCha = smscChange;
				this.shenShuiShiChangCha = ssscChange;
				this.qianShuiShiChangCha = qsscChange;
				this.qingXingShiChangCha = qxscChange;
				
				const sszbChange = this.daySleppDatas.allData.shenShuiBiAvg - this.yesterdaySleppDatas.allData.shenShuiBiAvg;
				const qszbChange = this.daySleppDatas.allData.qianShuiBiAvg - this.yesterdaySleppDatas.allData.qianShuiBiAvg;
				this.shenShuiZhanBiCha = sszbChange;
				this.qianShuiZhanBiCha = qszbChange;
				
				const fscsChange = this.daySleppDatas.allData.fanShenCiShuALL - this.yesterdaySleppDatas.allData.fanShenCiShuALL;
				this.fanShenCiShiCha = fscsChange;
				
				const breatheStopChange = this.daySleppDatas.allData.huxizantingcishu - this.yesterdaySleppDatas.allData.huxizantingcishu;
				this.breatheStopCha = breatheStopChange;
				
				this.showDuiBiFlag = true;
			},
			
			/** 自定义下拉刷新被触发时的事件 */
			slefRefresher(){
				this.slefRefresherFlag=true;
				this.getTwoDayReportsData();
			},
			
			/** 滚动时触发 */
			scroll(event) {//没有被触发
				// console.log(event);
				if (event.detail.scrollTop === 0) {
					this.scroll_refresher_enabled = true
				} else {
					this.scroll_refresher_enabled = false
				}
			},
			/** 睡眠均分的计算描述 */
			showTip(){
				uni.showModal({
					title: '日均睡眠得分说明',
					showCancel: false,
					confirmText: `我知道了`,
					content: '将各段睡眠报告分数加权平均计算得出。 计算规则：( <2h 的睡眠报告得分权重占5%; <=2h 且 <4h 的睡眠报告得分权重占15%; >=4h 的睡眠报告得分权重占80%)',
					success: function (res) {
						if (res.confirm) {
							// console.log('用户点击确定');
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			
			/** AHI指数的提示 */
			showTipAHI(){
				uni.showModal({
					title: 'AHI指数',
					showCancel: false,
					confirmText: `我知道了`,
					content: 'AHI是指每小时睡眠内呼吸暂停加上低通气的次数，是判断睡眠呼吸暂停程度的重要指标。AHI指数小于5属于正常，5~15属于低风险睡眠呼吸暂停，15~30属于中等风险，大于30属于重度。当AHI指数大于30时，建议您及时就医检查。',
					success: function (res) {
						if (res.confirm) {
							// console.log('用户点击确定');
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			/** 计算失眠指数 */
			huoqushimianzhishu(){
				for(let report of this.daySleppDatasTemp.reports){
					let rsqqxsc = 0;//入睡前的清醒时长✔
					let smzqxsc = 0;//睡眠中的清醒时长
					let smzqxcs = 0;//睡眠中清醒次数
					let smsc = 0;//睡眠时长✔
					let zcsc = 0;//在床时长✔
					
					zcsc = Number(report.bf); //睡眠总时长 (新字段bf)
					smsc = report.sleepTimeAll;
					
					//睡眠分段
					const shuimianduan = formatSleepCanvasForTenDatas(JSON.parse(JSON.stringify(report)));
					if(!shuimianduan || shuimianduan.length === 0) {
						// 没有分段数据，跳过本次循环
						continue;
					}
					//入睡index
					let rushuiIndex = 0;
					for(let i=0;i<shuimianduan.length;i++){
						const d = shuimianduan[i];
						if(d.state != 0 && d.state != 1){
							rsqqxsc = Math.round((d.endTimestamp - shuimianduan[0].startTimestamp)/(60*1000));
							rushuiIndex = i;
							break;
						}
					}
					//醒来index
					let xinglaiIndex = 0;
					for(let i=shuimianduan.length-1;i >= 0;i--){
						const d = shuimianduan[i];
						if(d.state != 0 && d.state != 1){
							xinglaiIndex = i;
							break;
						}
					}
					//入睡到醒来间的数据
					for(let i = rushuiIndex; i<=xinglaiIndex; i++){
						const d = shuimianduan[i];
						if(d.state == 0 || d.state == 1){
							smzqxcs += 1;
							smzqxsc += d.endTimestamp - d.startTimestamp;
						}
					}
					smzqxsc = Math.round(smzqxsc/(60*1000));
					// console.log("入睡前的清醒时长为(分钟)",rsqqxsc);
					// console.log("睡眠中的清醒时长为(分钟)",smzqxsc);
					// console.log("睡眠中的清醒次数为(次)",smzqxcs);
					// console.log("睡眠时长为(分钟)",smsc);
					// console.log("在床时长为(分钟)",zcsc);
					// 因子计算（根据临床标准0-3分）
					// 1. 入睡潜伏期因子（入睡困难程度）
					let rushuiFactor = 0;
					if (rsqqxsc <= 15) rushuiFactor = 0;
					else if (rsqqxsc <= 30) rushuiFactor = 1;
					else if (rsqqxsc <= 45) rushuiFactor = 2;
					else rushuiFactor = 3;
					
					// 2. 觉醒次数因子（睡眠中断程度）
					let jiaoxingFactor = 0;
					if (smzqxcs === 0) jiaoxingFactor = 0;
					else if (smzqxcs <= 2) jiaoxingFactor = 1;
					else if (smzqxcs <= 4) jiaoxingFactor = 2;
					else jiaoxingFactor = 3;
					
					// 3. 睡眠效率因子（睡眠质量）
					const sleepEfficiency = smsc / zcsc;
					let efficiencyFactor = 0;
					if (sleepEfficiency > 0.85) efficiencyFactor = 0;
					else if (sleepEfficiency > 0.75) efficiencyFactor = 1;
					else if (sleepEfficiency > 0.65) efficiencyFactor = 2;
					else efficiencyFactor = 3;
					
					// 4. 清醒时间因子（有效睡眠损失）
					let qingxingFactor = 0;
					if (smzqxsc <= 20) qingxingFactor = 0;
					else if (smzqxsc <= 40) qingxingFactor = 1;
					else if (smzqxsc <= 60) qingxingFactor = 2;
					else qingxingFactor = 3;
					
					// 失眠指数计算（加权平均）
					// const weights = {W1: 0.3, W2: 0.2, W3: 0.3, W4: 0.2};
					const weights = {W1: 3, W2: 2, W3: 3, W4: 2}; // 修改权重系数
					/* const shuimianzhishu = 
					  rushuiFactor * weights.W1 + 
					  jiaoxingFactor * weights.W2 + 
					  efficiencyFactor * weights.W3 + 
					  qingxingFactor * weights.W4; */
					const shuimianzhishu = 
					  rushuiFactor +
					  jiaoxingFactor + 
					  efficiencyFactor +
					  qingxingFactor ;
					
					// 调整评估阈值
					let quality = "良好";
					let severity = "正常";
					let recommendation = "保持良好作息";
					
					if (shuimianzhishu <= 3) {
					  quality = "良好";
					  severity = "正常";
					  recommendation = "保持良好作息";
					} else if (shuimianzhishu <= 6) {
					  quality = "一般";
					  severity = "轻度失眠风险";
					  recommendation = "注意减压";
					} else if (shuimianzhishu <= 9) {
					  quality = "较差";
					  severity = "中度失眠风险";
					  recommendation = "建议行为认知疗法";
					} else {
					  quality = "差";
					  severity = "重度失眠风险";
					  recommendation = "建议就医评估";
					}
					//睡眠指数 = (入睡潜伏期因子 * W1) + (觉醒次数因子 * W2) + (睡眠效率因子 * W3) + (清醒时间因子 * W4)
					// const = shuimianzhishu = 0;
					/* console.log({
						index: shuimianzhishu,
						factors: {
							rushuiFactor,
							jiaoxingFactor,
							efficiencyFactor,
							qingxingFactor
						},
						efficiency: (sleepEfficiency * 100).toFixed(1),
						quality,
						severity,
						recommendation
					}); */
					
					//雷达图数据：
					let leidatuDatas = {
						categories: ["入睡潜伏","觉醒次数","睡眠效率","清醒时间"],
						series: [
							{
								name: "",
								data: [rushuiFactor,jiaoxingFactor,efficiencyFactor,qingxingFactor]
							}/* ,
							{
								name: "成交量2",
								data: [190,210,105]
							} */
						]
					}
					// console.log(leidatuDatas.series[0].data);
					report.shuimianzhishu = Math.round((shuimianzhishu*10))/10;
					report.quality = quality;//评估睡眠质量
					report.severity = severity;//失眠风险评估
					report.recommendation = recommendation;//建议疗法
					
					report.rsqqxsc = rsqqxsc;//入睡前的清醒时长
					report.smzqxsc = smzqxsc;//睡眠中的清醒时长
					report.smzqxcs = smzqxcs;//睡眠中的清醒次数
					report.smsc = smsc;//睡眠时长
					report.zcsc = zcsc;//在床时长
					
					report.leidatuDatas = leidatuDatas;
				}
			},
			
			/** 失眠指数提示 */
			showTipShiMianZhiShu(){
				uni.showModal({
					title: '失眠指数',
					showCancel: false,
					confirmText: `我知道了`,
					content: '失眠指数最大值为12。数值越高失眠风险等级越高。小于3属于正常，3~6属于轻度失眠风险，6~9属于中度失眠风险，大于9属于重度失眠风险。当失眠指数大于9时，建议您及时就医。',
					success: function (res) {
						if (res.confirm) {
							// console.log('用户点击确定');
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			
			/** 获取精神压力指数 */
			huoqujingshenyalizhishu(){
				// 强制加空值和数组判断，防止undefined被遍历
				const reports = (this.daySleppDatasTemp && Array.isArray(this.daySleppDatasTemp.reports)) ? this.daySleppDatasTemp.reports : [];
				if(reports.length === 0){
					return;
				}
				for(let report of reports){
					//深睡占比✔
					let shenshuizhanbi = 0;
					//翻身次数✔
					let fanshencishu = 0;
					//在床时长✔
					let zaichuangshichang = 0;
					//心跳标准差
					let xintiaobiaozhuncha = 0;
					//呼吸标准差
					let huxibiaozhuncha = 0;
					
					//心率数组
					let xinlvArr = [];
					
					//呼吸率数组
					let huxiArr = [];
					
					//赋已有值
					shenshuizhanbi = Number(report.bi) / 100; //深睡占比
					fanshencishu = Number(report.bl); //翻身次数
					// zaichuangshichang = (Math.round(Number(report.bf)*10/60))/10;
					zaichuangshichang = Number(report.bf); //睡眠总时长
					
					//离床次数
					let lichaungcishu = 0;
					
					//遍历出心率数组数据(需要排除离床时的数据)  //遍历出呼吸率数组(需要排除离床时的数据)
					if(!report.tenDatas) continue;
					for(let tenData of report.tenDatas){
						if(tenData.al !=3){//bs-十分钟内平均心跳
							xinlvArr.push(Number(tenData.bs));
							huxiArr.push(Number(tenData.br));
						}else{
							lichaungcishu +=1;
						}
					}
					console.log(xinlvArr);
					// console.log(huxiArr);
					// console.log(lichaungcishu);
					// console.log(zaichuangshichang);
					
					//计算心率样本标准差（默认）
					let sampleXinLvSD = 0;
					try{
						sampleXinLvSD = calculateStandardDeviation(xinlvArr);
					}catch(err){
					}
					
					// console.log(`心率样本标准差: ${sampleXinLvSD.toFixed(2)}`); // 输出：5.8
					xintiaobiaozhuncha = sampleXinLvSD.toFixed(2);
					//计算呼吸率样本标准差（默认
					let sampleHuXiLvSD = 0;
					try{
						sampleHuXiLvSD = calculateStandardDeviation(huxiArr);
					}catch(err){
					}
					
					// console.log(`呼吸率样本标准差: ${sampleHuXiLvSD.toFixed(2)}`); // 输出：5.8
					huxibiaozhuncha = sampleHuXiLvSD.toFixed(2);
					
					/* let normalized_deep = 1 - shenshuizhanbi;
					
					let normalized_turnover = Math.min(fanshencishu/zaichuangshichang, 0.1)*10;
					
					let normalized_hr_sd = xintiaobiaozhuncha/10;
					
					let normalized_rr_sd = huxibiaozhuncha/5;
					
					let stress = (0.4 * normalized_deep + 0.3 * normalized_turnover + 0.2 * normalized_hr_sd + 0.1 * normalized_rr_sd)*100; */
					
					//计算精神压力指数=( (0.4 * (1-深水占比)) + (0.3 * (翻身次数/在床时长)) + (0.2 * (心跳标准差 /10) ) + (0.1 * (呼吸标准差/5)) ) * 100；区间:[0，30，60，100]
					let stressScore = 0;
					stressScore = (
						(0.4 * (1 - shenshuizhanbi)) +
						(0.3 * (fanshencishu / (zaichuangshichang * 60))) +
						(0.2 * (xintiaobiaozhuncha / 10)) +
						(0.1 * (huxibiaozhuncha / 5))
					) * 100;
					
					// console.log((1 - shenshuizhanbi));
					// console.log((fanshencishu / zaichuangshichang));
					// console.log((xintiaobiaozhuncha / 10));
					// console.log((huxibiaozhuncha / 5));
					// console.log(stressScore);
					//将精神压力指数添加到源数据中
					report.jingshenyali = Math.round(Math.min(Math.max(stressScore, 0), 100));
				}
				
				
			},
			
			/** 精神压力指数提示 */
			showTipJingShenYaLiZhiShu(){
				uni.showModal({
					title: '精神压力指数',
					showCancel: false,
					confirmText: `我知道了`,
					content: '计算规则 (0.4 * (1-深睡占比)) + (0.3 * (翻身次数/在床时长)) + (0.2 * (心跳标准差 /10) ) + (0.1 * (呼吸标准差/5)) ) * 100',
					success: function (res) {
						if (res.confirm) {
							// console.log('用户点击确定');
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			
		}
	}
</script>

<style lang="scss" scoped>
	.day_report_all {
		font-size: $all-font-size-medium;
		/* 睡眠总结区域 */
		.summarize {
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
			padding: 40rpx 25rpx 2rpx 25rpx;
			width: 700rpx;
			background: #fff;
			border-radius: 10rpx;

			.headd {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				margin-top: 0;
				// padding: 10rpx 10rpx;

				.text_a {
					color: #3ed196;
					background-color: rgba(62, 209, 150, 0.1);
					padding: 12rpx 24rpx;
					border-radius: 30rpx;
					font-size: 28rpx;
					font-weight: bold;
				}

				.text_b {
					color: #3ed196;
					font-size: 34rpx;
					font-weight: bold;
				}
			}

			.sleep_times {
				display: flex;
				flex-direction: column;
				margin-top: 0rpx;

				.all_time {
					margin: 30rpx auto 10rpx auto;
					font-size: $all-font-size-big-pro;
				}

				.all_time_text {
					margin: 10rpx auto 0 auto;
					font-size: $all-font-size-medium-pro;
				}

				.reference_value {
					margin: 0 auto 10rpx auto;
					font-size: $all-font-size-small-pro;
					color: #ccc;
				}
			}

			.sleep_info {
				font-size: $all-font-size-medium;
				line-height: 50rpx;

				.sleep_info_left {
					margin: 30rpx 0;
					display: flex;
					justify-content: space-between;

					.sleep_info_left_item {

						.sleep_info_icon{
							color: #ff7f50;
							font-size: $all-font-size-small-pro;
							line-height: 50rpx;
						}
						
						.sleep_info_text_a {
							margin: 0 10rpx;
						}

						.sleep_info_text_b {
							font-weight: 400;
							font-size: $all-font-size-small-pro;
							color: #999;
						}
					}

					.sleep_info_text_c {
						.tc1 {
							font-weight: 700;
							color: #a214a3;
							margin: 0 10rpx;
						}

						.tc2 {
							font-size: $all-font-size-small-pro;
							color: #999;
							font-weight: 400;
							margin-right: 20rpx;
						}
					}
				}
			}
			
			.ahi{
				font-size: $all-font-size-big-pro;
				text-align: center;
				font-weight: bold;
				white-space: nowrap;
			}
			.ahi_value{
				display: flex;
				justify-content: left;
				align-items: center;
				flex-wrap: nowrap;
				white-space: nowrap;
				font-size: $all-font-size-small-pro;
			}
			
			
		}
		
		
		/* 与昨天的数据对比区域 */
		.duibishuju{
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
			border-radius: 10rpx;
			background: #fff;
			padding: 30rpx 20rpx;
			margin: 20rpx 0;
			font-size: $all-font-size-medium;
		}
		
		/* 睡眠报告区域 */
		.sleep_report_area{
			padding: 0rpx;
			margin: 20rpx 0;
			width: 700rpx;
			background: #eee;
			border-radius: 10rpx;
			
			.report_head{
				display: flex;
				flex-direction: column;
				font-size: $all-font-size-medium-pro;
				.tit{
					margin: 10rpx auto;
					font-weight: bold;
					border-radius: 10rpx;
					background: #3ed196;
					color: #222;
					width: 160px;
					text-align: center;
					line-height: 45px;
					margin-bottom: 25px;
				}
				.pic{
					margin: 0 auto;
					width: 100%;
					// height: 300px;
				}
			}
			
			.report_foot{
				margin-top: 20rpx;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				line-height: 20px;
				justify-content: space-between;
				.report_foot_item{
					min-width: 220rpx;
					max-width: 220rpx;
					display: flex;
					flex-direction: column;
					.title{
						font-size: $all-font-size-medium;
						margin: 0 auto 10rpx auto;
						color: #999;
					}
					.content{
						margin:0rpx auto 10rpx auto;
						color: #888;
						font-size: $all-font-size-medium;
						font-weight: 700;
					}
				}
			}
			
			.shi_m{
				font-size: $all-font-size-medium;
			}
			.jing_s{
				font-size: $all-font-size-medium;
			}
			.ahi_z{
				font-size: $all-font-size-medium;
			}
			
		}
	}
</style>