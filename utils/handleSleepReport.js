import { formatDatesMinute, formatDate, formatDatesDay } from '@/utils/getdate.js'

/**  
 * 处理睡眠报告数据，
 * @param {reports} reports - 某一天的睡眠报告
 * @returns {dayReportResult} - 处理后的睡眠报告数据
 */  
export function sleepReportHandler(reports) {
	//1.计算一天的睡眠数据
	let dayReportResult = {
		allData: {
			//总睡眠时长
			//日均深睡占比
			//日均浅睡占比
			//日均清醒占比
			//睡眠次数
			//日均翻身次数
			//日均离床次数
			//日均睡眠得分
			//在床总时长
			//深睡总时长
			//浅睡总时长
			//清醒总时长
			//翻身总时长
			//离床总时长
		},
		reports: [
			/* {
				//报告开始时间
				//报告结束时间
			} */
		]
	};
	
	const reportNum 		= reports.length;	//睡眠报告的段数
	
	let sleepTimeAll		= 0;	//总睡眠时长
	let shenShuiBiAvg		= 0;	//日均深睡占比
	let qianShuiBiAvg		= 0;	//日均浅睡占比
	let qingXingBiAvg		= 0;	//日均清醒占比
	let shuiMianCiShuAll	= 0;	//睡眠次数
	let fanShenCiShuAvg		= 0;	//日均翻身次数
	let liChuangCiShuAvg	= 0;	//日均离床次数
	let deFenAvg			= 0;	//日均睡眠得分
	let breatheStopSum		= 0;	//总呼吸暂停次数
	
	let zaiChuangShiChangALL= 0;	//在床时长
	let shenShuiShiChangALL	= 0;	//深睡时长
	let qianShuiShiChangALL	= 0;	//浅睡时长
	let qingXingShiChangALL	= 0;	//清醒时长
	let fanShenCiShuALL		= 0;	//翻身时长
	let liChuangCiShuALL	= 0;	//离床时长
	
	for(let report of reports){
		// 验证必需的bf字段 (睡眠总时长)
		if (!report.bf) {
			continue;
		}
		
		// 处理时间戳字段 - 兼容多种时间戳格式
		if (!report.timeStamp) {
			// 优先使用tts字段 (API返回的时间戳字段)
			if (report.tts) {
				report.timeStamp = report.tts;
			} else if (report.endTimeStamps) {
				report.timeStamp = report.endTimeStamps;
			} else if (report.startTimeStamps) {
				report.timeStamp = report.startTimeStamps + (report.bf * 60 * 1000);
			} else {
				continue;
			}
		}
		
		shenShuiBiAvg 	+= Number(report.bi) || 0;//累加深睡比 (新字段bi-深睡时长占比)
		qianShuiBiAvg 	+= Number(report.bh) || 0;//累加浅睡比 (新字段bh-浅睡时长占比)
		qingXingBiAvg 	+= Number(report.bg) || 0;//累加清醒比 (新字段bg-清醒时长占比)
		shuiMianCiShuAll+= 1;
		fanShenCiShuAvg += Number(report.bl) || 0; //翻身次数 (新字段bl)
		liChuangCiShuAvg+= Number(report.bk) || 0; //离床次数 (新字段bk)
		deFenAvg 		+= Number(report.av) || 0; //睡眠质量评分 (新字段av)
		breatheStopSum		+= Number(report.bo) || 0; //呼吸暂停次数 (新字段bo)
		
		
		zaiChuangShiChangALL+= Number(report.bf) || 0; //睡眠总时长 (新字段bf)
		shenShuiShiChangALL	+= Math.round((Number(report.bf) || 0) * ((Number(report.bi) || 0)/100));
		qianShuiShiChangALL	+= Math.round((Number(report.bf) || 0) * ((Number(report.bh) || 0)/100));
		qingXingShiChangALL	+= Math.round((Number(report.bf) || 0) * ((Number(report.bg) || 0)/100));
		fanShenCiShuALL		+= Number(report.bl) || 0;
		liChuangCiShuALL	+= Number(report.bk) || 0;
		
		let shuiMianShiChang = (Number(report.bf) || 0) * (((Number(report.bi) || 0)+(Number(report.bh) || 0))/100);//总时长 * ((深睡占比+浅睡占比)/100)

		sleepTimeAll 	+= Number(Math.round(shuiMianShiChang)) || 0;
		
		
		report.sleepTimeAll		= sleepTimeAll;
		// 确保时间戳计算不会产生NaN
		const timestamp = Number(report.timeStamp);
		const duration = Number(report.bf); //睡眠总时长 (新字段bf)
		report.startSleepTime	= timestamp - duration * 60 * 1000;
		report.endSleepTime		= timestamp;
		report.shuiMianBi		= Number(report.bi) + Number(report.bh); //深睡+浅睡占比
		report.sleepTimeFormat 	= formatMin(Number(Math.round(shuiMianShiChang)));
		report.onbedTimeFormat 	= formatMin(Number(report.bf)); //睡眠总时长 (新字段bf)
		report.startSleepTimeFormat	= formatDatesMinute(new Date(report.startSleepTime));
		report.endSleepTimeFormat	= formatDatesMinute(new Date(report.endSleepTime));
		report.shuiMianShiduan	= `${formatDatesMinute(new Date(report.startSleepTime))}-${formatDatesMinute(new Date(report.endSleepTime))}`;
		
		dayReportResult.reports.push(report);//将本段睡眠报告放入返回结果中
		
	}
	
	//将当天的总数据放入统计结果中
	dayReportResult.allData = {
		sleepTimeAll		: sleepTimeAll,
		sleepTimeFormat 	: formatMin(sleepTimeAll),
		shenShuiBiAvg		: Math.round(shenShuiBiAvg / reportNum),
		qianShuiBiAvg		: Math.round(qianShuiBiAvg / reportNum),
		qingXingBiAvg		: Math.round(qingXingBiAvg / reportNum),
		shuiMianCiShuAll	: shuiMianCiShuAll,
		fanShenCiShuAvg		: Math.round(fanShenCiShuAvg / reportNum),
		liChuangCiShuAvg	: Math.round(liChuangCiShuAvg / reportNum),
		deFenAvg			: Math.round(deFenAvg / reportNum),
		breatheStopSum		: breatheStopSum,
		huxizantingcishu	: breatheStopSum,  // 日报告期待的字段名
		zaiChuangShiChangALL: zaiChuangShiChangALL,
		shenShuiShiChangALL	: shenShuiShiChangALL,
		qianShuiShiChangALL	: qianShuiShiChangALL,
		qingXingShiChangALL	: qingXingShiChangALL,
		fanShenCiShuALL	   	: fanShenCiShuALL,
		liChuangCiShuALL	: liChuangCiShuALL
	}
	
	return dayReportResult;
}

/** 计算睡眠报告的加权平均分 */
export function sleepReportHandlerAvg(sleppDatas) {
	let reports = sleppDatas.reports;

	if(reports.length == 0) return 0;

	const fourHours = 4 * 60;
	const zeroHours = 0;
	const twoHours 	= 2 * 60;
	let weightAvg = 0;
	let scoreSum  = 0;
	let weightSum = 0;
	for(let report of reports){
		const sleepMinute = Number(report.bf); //睡眠总时长 (新字段bf)
		if(sleepMinute < twoHours){// <2h, 占比 5%
			scoreSum  += Number(report.av) * 5; //睡眠质量评分 (新字段av)
			weightSum += 5;
		}else if(sleepMinute >= fourHours){// >4h, 占比 80%
			scoreSum += Number(report.av) * 80; //睡眠质量评分 (新字段av)
			weightSum += 80;
		}else{// >=2h &&<4h, 占比 15%
			scoreSum += Number(report.av) * 15; //睡眠质量评分 (新字段av)
			weightSum += 15;
		}
	}
	weightAvg = Math.round(scoreSum / weightSum);
	// console.log(`${scoreSum}/${weightSum}=${weightAvg}`)
	
	return weightAvg;
}

export function formatMin(min){
	let hour = Math.floor(min / 60);
	let minute = Math.round(min % 60);
	
	return `${hour}小时${minute}分钟`;
}

/** 安时间戳对十分钟数据进行排序 */
export function sortTenData(tenDatas){
	// 先将tts字段转换为timeStamp字段（十分钟数据使用tts字段）
	tenDatas.forEach(item => {
		if (!item.timeStamp && item.tts) {
			item.timeStamp = item.tts;
		}
	});
	
	let tenDatasResult = [...tenDatas].sort((a, b) => a.timeStamp - b.timeStamp);
	/* let first = JSON.parse(JSON.stringify(tenDatasResult[0]));
	first.timeStamp = first.timeStamp - 10*60*1000;
	first.createTime = formatDate(new Date(first.timeStamp));
	tenDatasResult.unshift(first); */
	return tenDatasResult;
}

/** 获取睡眠时段的十分钟数据（排除首尾清醒区间） / 睡眠状态（离床时/实时探测模式下上报） 0：深睡 1：浅睡 2：清醒 3：无 */
export function huoQuShuiMianShiDuan(tenDatas) {
  if (!tenDatas?.length) return [];

  // 1.找到开头连续清醒状态的结束位置
  let start = 0;
  while (start < tenDatas.length && (tenDatas[start].al == '2' || tenDatas[start].al == '3')) {
    start++;
  }

  // 2.找到结尾连续清醒状态的起始位置
  let end = tenDatas.length;
  while (end > start && (tenDatas[end - 1].al == '2' || tenDatas[end - 1].al == '3')) {
    end--;
  }

  // 3.截取中间有效数据（排除首尾清醒区间）
  let temDataResult = JSON.parse(JSON.stringify(tenDatas.slice(start, end)));

  //4.向开头加一条数据作为第一条十分钟数据的开头，因为十分钟数据代表的是过去的十分钟的状态。(上报时间戳-10分钟)
  if(temDataResult.length > 0){
	  let first = JSON.parse(JSON.stringify(temDataResult[0]));
	  if(first.timeStamp && !isNaN(first.timeStamp)) {
		  first.timeStamp = first.timeStamp - 10*60*1000;
		  first.createTime = formatDate(new Date(first.timeStamp));
		  temDataResult.unshift(first);//添加到数组头部
	  }
  }
  
  return temDataResult;
}

/** 获取睡眠时段 */
export function huoQuShuiMianShiDuanFormat(tenDatas){
	let len = tenDatas.length;
	if( len == 0 ) return ' - - ';
	let startTimeStamp = tenDatas[0].timeStamp;
	let endTimeStamp = tenDatas[len-1].timeStamp;
	
	return`${formatDatesMinute(new Date(startTimeStamp))}-${formatDatesMinute(new Date(endTimeStamp))}`;
}

/** 格式化深浅睡睡眠图 */
export function formatSleepCanvasForTenDatas(sleepReport){
	// console.log(sleepReport);
	// 检查sleepReport和tenDatas是否存在
	if(!sleepReport || !sleepReport.tenDatas) {
		// console.warn('sleepReport or tenDatas is undefined');
		return [];
	}
	
	let sortedSleepData = sleepReport.tenDatas

	if(sortedSleepData.length == 0 ) return [];
	
	let currentState = -1;
	let lastState = -1;

	const sleepStartTime = formatDate(new Date(sleepReport.startSleepTime));//开始时间
	const endStartTime = formatDate(new Date(sleepReport.endSleepTime));//结束时间
	const sleepStartTimeStamp = sleepReport.startSleepTime;//开始时间戳
	const sleepEndTimeStamp = sleepReport.endSleepTime;//结束时间戳
	
	
	if(sleepStartTimeStamp<sortedSleepData[0].timeStamp){
		
		let firstData = JSON.parse(JSON.stringify(sortedSleepData[0]));
		firstData.createTime = sleepStartTime;
		firstData.timeStamp = sleepStartTimeStamp;
		// firstData.al = 2;
		sortedSleepData.unshift(firstData);
	}
	
	let curData = {
		startTime: '',
		endTime: '',
		startTimestamp: sleepStartTimeStamp,
		endTimestamp: null,
		state: null
	}
	let sEndData=[];
	//1.循环内容
	for(let i=0;i < sortedSleepData.length;i++){
		let stateeee = sortedSleepData[i].al;
		if(stateeee == 0){
			stateeee = 3;
		} else if(stateeee == 1){
			stateeee = 2;
		} else if(stateeee == 2){
			stateeee = 1;
		} else {
			stateeee = 0;
		}
		
		
		currentState = stateeee;
		
		if(lastState == currentState){//某段中
			
			curData.endTime 		= sortedSleepData[i].createTime;
			curData.endTimestamp 	= sortedSleepData[i].timeStamp;
			
		} else if (lastState == -1){//报告始
			
			curData.startTime 		= sleepStartTime;
			curData.endTime 		= sortedSleepData[i].createTime;
			curData.startTimestamp 	= sleepStartTimeStamp;
			curData.endTimestamp 	= sortedSleepData[i].timeStamp;
			curData.state 			= stateeee;
			
			lastState 				= stateeee;
			
		} else {//某段未
			sEndData.push(JSON.parse(JSON.stringify(curData)));//添加一段
			
			//开始新的一段
			curData.startTime 		= sortedSleepData[i-1].createTime;
			curData.endTime 		= sortedSleepData[i].createTime;
			curData.startTimestamp	= sortedSleepData[i-1].timeStamp;
			curData.endTimestamp 	= sortedSleepData[i].timeStamp;
			curData.state 			= stateeee;
			
			lastState 				= stateeee;
			
		}
	}
	const endTimee = curData.endTime;
	const endTimestampp = curData.endTimestamp;
	/* if(curData.state != 3){//不是深睡直接加
		// console.log("执行了1",curData);
		curData.endTime = endStartTime;
		curData.endTimestamp = sleepEndTimeStamp;
		sEndData.push(JSON.parse(JSON.stringify(curData)));
	}else{
		sEndData.push(JSON.parse(JSON.stringify(curData)));
		// console.log("执行了2",curData);
		//开始新的一段
		curData.startTime 		= endTimee;
		curData.endTime 		= endStartTime;
		curData.startTimestamp	= endTimestampp;
		curData.endTimestamp 	= sleepEndTimeStamp;
		curData.state 			= 2;
		sEndData.push(JSON.parse(JSON.stringify(curData)));
	} */
	// 处理结束时间
	curData.endTime = endStartTime;
	curData.endTimestamp = sleepEndTimeStamp;
	sEndData.push(JSON.parse(JSON.stringify(curData)));
	
	return sEndData;
}

/** 格式化深浅睡睡眠图20:00~8:00间的十分钟数据处理 */
/* export function formatSleepCanvasForTenDatasss(sleepReport, startTimeStamp, endTimeStamp){ */
export function formatSleepCanvasForTenDatasss(sleepReport){
	// 检查sleepReport是否存在且不为空
	if(!sleepReport || !Array.isArray(sleepReport) || sleepReport.length === 0) {
		console.warn('[formatSleepCanvasForTenDatasss] sleepReport is undefined, not an array, or empty:', sleepReport);
		return [];
	}
	
	// let sortedSleepData = sleepReport;
	let sortedSleepData = huoQuShuiMianShiDuan(sleepReport);
	
	// 检查sortedSleepData是否存在
	if(!sortedSleepData || sortedSleepData.length === 0) {
		console.warn('[formatSleepCanvasForTenDatasss] sortedSleepData is undefined or empty');
		return [];
	}
	
	// 检查时间戳是否存在（使用处理后的sortedSleepData而不是原始sleepReport）
	if(sortedSleepData[0].timeStamp === undefined || sortedSleepData[0].timeStamp === null || 
	   sortedSleepData[sortedSleepData.length-1].timeStamp === undefined || sortedSleepData[sortedSleepData.length-1].timeStamp === null) {
		console.warn('[formatSleepCanvasForTenDatasss] timeStamp is undefined or null in sortedSleepData', sortedSleepData);
		return [];
	}
	
	// 直接复制数值，不需要 JSON 序列化
	let startStamp = sortedSleepData[0].timeStamp
	let endStamp = sortedSleepData[sortedSleepData.length-1].timeStamp
	if(sortedSleepData.length == 0 ) return [];
	
	let currentState = -1;
	let lastState = -1;

	const sleepStartTime = formatDate(new Date(startStamp));//开始时间
	const endStartTime = formatDate(new Date(endStamp));//结束时间
	const sleepStartTimeStamp = startStamp;//开始时间戳
	const sleepEndTimeStamp = endStamp;//结束时间戳
	
	
	if(sleepStartTimeStamp<sortedSleepData[0].timeStamp){
		
		let firstData = JSON.parse(JSON.stringify(sortedSleepData[0]));
		firstData.createTime = sleepStartTime;
		firstData.timeStamp = sleepStartTimeStamp;
		// firstData.al = 2;
		sortedSleepData.unshift(firstData);
	}
	
	let curData = {
		startTime: '',
		endTime: '',
		startTimestamp: sleepStartTimeStamp,
		endTimestamp: null,
		state: null
	}
	let sEndData=[];
	//1.循环内容( 0：深睡 1：浅睡 2：清醒 3：无)
	for(let i=0;i < sortedSleepData.length;i++){
		let stateeee = sortedSleepData[i].al;
		if(stateeee == 0){
			stateeee = 3;//深睡
		} else if(stateeee == 1){
			stateeee = 2;//浅睡
		} else if(stateeee == 2){
			stateeee = 1;//清醒
		} else {
			stateeee = 0;//无
		}
		
		
		currentState = stateeee;
		
		if(lastState == currentState){//某段中
			
			curData.endTime 		= sortedSleepData[i].createTime;
			curData.endTimestamp 	= sortedSleepData[i].timeStamp;
			
		} else if (lastState == -1){//报告始
			
			curData.startTime 		= sleepStartTime;
			curData.endTime 		= sortedSleepData[i].createTime;
			curData.startTimestamp 	= sleepStartTimeStamp;
			curData.endTimestamp 	= sortedSleepData[i].timeStamp;
			curData.state 			= stateeee;
			
			lastState 				= stateeee;
			
		} else {//某段未
			sEndData.push(JSON.parse(JSON.stringify(curData)));//添加一段
			
			//开始新的一段
			curData.startTime 		= sortedSleepData[i-1].createTime;
			curData.endTime 		= sortedSleepData[i].createTime;
			curData.startTimestamp	= sortedSleepData[i-1].timeStamp;
			curData.endTimestamp 	= sortedSleepData[i].timeStamp;
			curData.state 			= stateeee;
			
			lastState 				= stateeee;
			
		}
	}
	const endTimee = curData.endTime;
	const endTimestampp = curData.endTimestamp;
	/* if(curData.state != 3){//不是深睡直接加
		// console.log("执行了1",curData);
		curData.endTime = endStartTime;
		curData.endTimestamp = sleepEndTimeStamp;
		sEndData.push(JSON.parse(JSON.stringify(curData)));
	}else{
		sEndData.push(JSON.parse(JSON.stringify(curData)));
		// console.log("执行了2",curData);
		//开始新的一段
		curData.startTime 		= endTimee;
		curData.endTime 		= endStartTime;
		curData.startTimestamp	= endTimestampp;
		curData.endTimestamp 	= sleepEndTimeStamp;
		curData.state 			= 2;
		sEndData.push(JSON.parse(JSON.stringify(curData)));
	} */
	// 处理结束时间
	curData.endTime = endStartTime;
	curData.endTimestamp = sleepEndTimeStamp;
	sEndData.push(JSON.parse(JSON.stringify(curData)));
	
	return sEndData;
}


/**
 * 计算数值数组的标准差
 * @param {number[]} numbers - 输入的数值数组
 * @param {boolean} [isSample=true] - 是否为样本数据（默认true）
 * @returns {number} 计算得到的标准差
 * @throws {Error} 当输入无效时抛出错误
 * // 使用示例
	try {
		const testData = [72, 68, 75, 80, 65, 70, 78];
		
		// 计算样本标准差（默认）
		const sampleSD = calculateStandardDeviation(testData);
		console.log(`样本标准差: ${sampleSD.toFixed(2)}`); // 输出：5.83
		
		// 计算总体标准差
		const populationSD = calculateStandardDeviation(testData, false);
		console.log(`总体标准差: ${populationSD.toFixed(2)}`); // 输出：5.43
		
		// 测试异常情况
		// calculateStandardDeviation('invalid'); // 抛出错误
		// calculateStandardDeviation([]);         // 抛出错误
		// calculateStandardDeviation([1, 'a']);   // 抛出错误
	} catch (error) {
		console.error('计算错误:', error.message);
	}
 */
export function calculateStandardDeviation(numbers, isSample = true) {
    // 输入验证
    if (!Array.isArray(numbers)) {
        throw new Error('输入必须为数组');
    }
    if (numbers.length === 0) {
        throw new Error('数组不能为空');
    }
    if (!numbers.every(Number.isFinite)) {
        throw new Error('数组必须只包含有效数字');
    }

    const n = numbers.length;
    if(n == 1) return 0
    // 计算平均值
    const mean = numbers.reduce((sum, num) => sum + num, 0) / n;

    // 计算平方差
    const squaredDifferences = numbers.map(num => {
        const difference = num - mean;
        return difference ** 2;
    });
	
    // 计算方差
    const variance = squaredDifferences.reduce(
        (sum, sq) => sum + sq, 
        0
    ) / (isSample ? n - 1 : n);

    // 返回标准差（方差的平方根）
    return Math.sqrt(variance);
}







/////////////////////////////////////////////////////////////周报告的方法

/** 分割出周一到周日每一天的睡眠报告数据 */
export function fenGeWeekReports(reports, weekStartTimeStamp, weekEndTimeStamp){//reports数据中每一项的timeStamp为区分那一天的时间戳;weekStartTimeStamp和weekEndTimeStamp为周的开始和结束的时间戳
	
	// 0.先处理所有报告的时间戳字段
	reports.forEach(report => {
		if (!report.timeStamp) {
			// 优先使用tts字段
			if (report.tts) {
				report.timeStamp = report.tts;
			} else if (report.endTimeStamps) {
				report.timeStamp = report.endTimeStamps;
			} else if (report.startTimeStamps && report.bf) {
				report.timeStamp = report.startTimeStamps + (report.bf * 60 * 1000);
			}
		}
	});
	
	let weekReports = {
		'Monday': [],//周一的睡眠报告数据
		'Tuesday': [],//周二的睡眠报告数据
		'Wednesday': [],//周三的睡眠报告数据
		'Thursday': [],//周四的睡眠报告数据
		'Friday': [],//周五的睡眠报告数据
		'Saturday': [],//周六的睡眠报告数据
		'Sunday': []//周日的睡眠报告数据
	};//最终返回的周睡眠报告数据（按天划分好的数据）

	// 1.根据时间戳进行排序
	let sortedReports = [...reports].sort((a, b) => (a.timeStamp || 0) - (b.timeStamp || 0));

	// 2.根据时间戳进行分组
	let startTimestamp = weekStartTimeStamp;
	const oneDayTimeStamp = 24 * 60 * 60 * 1000;
	for(let report of sortedReports){
		if(report.timeStamp >= startTimestamp && report.timeStamp < startTimestamp + oneDayTimeStamp){  //周一
			weekReports.Monday.push(report);
		} else if(report.timeStamp >= startTimestamp + oneDayTimeStamp && report.timeStamp < startTimestamp + oneDayTimeStamp * 2){  //周二
			weekReports.Tuesday.push(report);
		} else if(report.timeStamp >= startTimestamp + oneDayTimeStamp * 2 && report.timeStamp < startTimestamp + oneDayTimeStamp * 3){  //周三
			weekReports.Wednesday.push(report);
		} else if(report.timeStamp >= startTimestamp + oneDayTimeStamp * 3 && report.timeStamp < startTimestamp + oneDayTimeStamp * 4){  //周四
			weekReports.Thursday.push(report);
		} else if(report.timeStamp >= startTimestamp + oneDayTimeStamp * 4 && report.timeStamp < startTimestamp + oneDayTimeStamp * 5){  //周五
			weekReports.Friday.push(report);
		} else if(report.timeStamp >= startTimestamp + oneDayTimeStamp * 5 && report.timeStamp < startTimestamp + oneDayTimeStamp * 6){  //周六
			weekReports.Saturday.push(report);
		} else if(report.timeStamp >= startTimestamp + oneDayTimeStamp * 6 && report.timeStamp < startTimestamp + oneDayTimeStamp * 7){  //周日
			weekReports.Sunday.push(report);
		}
	}

	// 3.将weekReports中的数据按周一到周日的顺序添加到一个数组中，格式为[[],[],[],[],[],[],[]]
	let weekReportsArr = [
		weekReports.Monday,
		weekReports.Tuesday,
		weekReports.Wednesday,
		weekReports.Thursday,
		weekReports.Friday,
		weekReports.Saturday,
		weekReports.Sunday
	];
	
	let weekReportsArrRes = [];
	for(let reports of weekReportsArr){
		weekReportsArrRes.push(sleepReportHandler(reports));
	}

	// 4.返回结果

	return weekReportsArrRes;
	
}




/////////////////////////////////////////////////////////////月报告的方法

/** 分割出一个月每一天的睡眠报告数据 */
export function fenGeMonthReports(reports, monthStartTimeStamp, monthEndTimeStamp){

	// 0.先处理所有报告的时间戳字段
	reports.forEach(report => {
		if (!report.timeStamp) {
			// 优先使用tts字段
			if (report.tts) {
				report.timeStamp = report.tts;
			} else if (report.endTimeStamps) {
				report.timeStamp = report.endTimeStamps;
			} else if (report.startTimeStamps && report.bf) {
				report.timeStamp = report.startTimeStamps + (report.bf * 60 * 1000);
			}
		}
	});

	// 1.根据时间戳进行排序
	let sortedReports = [...reports].sort((a, b) => (a.timeStamp || 0) - (b.timeStamp || 0));

	// 2.循环分割出每一天的睡眠报告数据
	let start = 0; // 从0开始,这样第一天就是monthStartTimeStamp
	let monthReports = [];
	const oneDayTimeStamp = 24 * 60 * 60 * 1000;
	
	while(monthStartTimeStamp + oneDayTimeStamp * start <= monthEndTimeStamp) {
		
		let dayStartTimeStamp = monthStartTimeStamp + oneDayTimeStamp * start;
		let dayEndTimeStamp = monthStartTimeStamp + oneDayTimeStamp * (start + 1) - 1;

		let dayReports = [];
		for(let report of sortedReports){
			if(report.timeStamp >= dayStartTimeStamp && report.timeStamp <= dayEndTimeStamp){
				dayReports.push(report);
			}
		}

		let dayReport = sleepReportHandler(dayReports);
		dayReport.date = formatDatesDay(new Date(dayStartTimeStamp));
		dayReport.dayStartTimeStamp = dayStartTimeStamp;
		dayReport.dayEndTimeStamp = dayEndTimeStamp;
		monthReports.push(dayReport);
		
		start++;
	}

	for(let report of monthReports){
		const jiaquanPingJunFen = sleepReportHandlerAvg(report);
		report.allData.jiaquanPingJunFen = jiaquanPingJunFen;
		// 添加avgDaySleepScore字段供月报告使用
		report.avgDaySleepScore = jiaquanPingJunFen;
	}

	// 3.返回结果
	return monthReports;
}

/** 根据传入的时间戳，获取获取时间戳所在周（周一到周日）每一天00:00:00和23:59:59的时间戳 */
/**
 * 根据传入的时间戳，获取该时间戳所在周（周一到周日）每一天的00:00:00和23:59:59的时间戳
 * @param {number} timeStamp - 时间戳（毫秒）
 * @returns {Array} 包含7个对象的数组，每个对象包含该天的startTime和endTime
 */
export function getWeekEveryDayStartAndEndTimeStamp(timeStamp) {
	
    const result = [];
    // 获取传入时间戳对应的日期
    const baseDate = new Date(timeStamp);
    
    // 获取该日期是星期几（0-6，0表示周日）
    const baseDay = baseDate.getDay();
    
    // 计算该周周一的日期（如果当前是周日，则向前推6天；否则向前推 (baseDay-1) 天）
    const mondayOffset = baseDay === 0 ? -6 : 1 - baseDay;
    const mondayDate = new Date(baseDate);
    mondayDate.setDate(mondayDate.getDate() + mondayOffset);
    
    // 循环7天（周一到周日）
    for (let i = 0; i < 7; i++) {
        // 创建当前日的副本
        const currentDay = new Date(mondayDate);
        currentDay.setDate(mondayDate.getDate() + i);
        
        // 获取当天的00:00:00时间戳
        const startTime = new Date(currentDay);
        startTime.setHours(0, 0, 0, 0);
        
        // 获取当天的23:59:59时间戳
        const endTime = new Date(currentDay);
        endTime.setHours(23, 59, 59, 999);
        
        // 将结果添加到数组
        result.push({
            day: getChineseDayName(i),
            startTime: startTime.getTime(),
            endTime: endTime.getTime()
        });
    }
    
    return result;
}

// 辅助函数：获取中文星期名称
function getChineseDayName(dayIndex) {
    const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    return days[dayIndex];
}


/** 处理一周的睡眠报告 */
export function weekSleepReportHandler(reports){
	
	//1.判空
	if( !reports || reports.length == 0) return;
	
	//2.取出一周的时间戳 （周一至周日)
	let weekEveryDayStartAndEndTimeStamp = getWeekEveryDayStartAndEndTimeStamp(reports[0].timeStamp);
	
	// 3. 将每段报告按天归集
	const dailyReports = {};
	
	// 初始化每天的空数组
	weekEveryDayStartAndEndTimeStamp.forEach(dayInfo => {
	    dailyReports[dayInfo.day] = [];
	});
	// 遍历所有报告，按天分类
	reports.forEach(report => {
	    const reportTimestamp = report.timeStamp;
	    
	    // 找到报告所属的日期
	    const dayInfo = weekEveryDayStartAndEndTimeStamp.find(day => {
	        return reportTimestamp >= day.startTime && reportTimestamp <= day.endTime;
	    });
	    
	    if (dayInfo) {
	        dailyReports[dayInfo.day].push(report);
	    } else {
			console.log("执行了");
	        // 如果报告不属于任何一天，尝试用报告的时间戳再计算一次
	        const fallbackDayInfo = getWeekEveryDayStartAndEndTimeStamp(reportTimestamp)
	            .find(day => reportTimestamp >= day.startTime && reportTimestamp <= day.endTime);
	        
	        if (fallbackDayInfo) {
	            dailyReports[fallbackDayInfo.day].push(report);
	        }
	    }
	});
	
	let result = []; // [{},{},{},{},{},{},{}]
	for(let key in dailyReports){
		let reports = dailyReports[key];
		
		let res = {};
		if(reports.length>0){
			res = sleepReportHandler(reports);
			result.push(res);
		}else{
			result.push(res);
		}
	}
	return result;
}

