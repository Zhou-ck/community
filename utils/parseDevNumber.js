/** 解析设备编号  deviceNumber格式：ih8nw6YXiHTEd1889 */
export function parseDeviceNumber(deviceNumBering) {
    const str = deviceNumBering;

    let resDeviceNumber = {
        productKey:null,
        deviceKey:null,
        deviceType:null
    };
    
    let deviceTypeStr = "";
    
    // 匹配从后往前数字前的两位字母
    const match = str.match(/([A-Za-z]{2})(\d+)$/);
    
    if (match) {
        const index = match.index;
        const part1 = str.slice(0, index);         // 字母前的部分
        const part2 = str.slice(index,index+2);         // 字母前的部分
        const part3 = str.slice(index);            // 含字母+数字的部分
        // console.log("分割结果:", [part1, part2, part3]);
        resDeviceNumber.productKey = part1;
        resDeviceNumber.deviceKey = part3;
        
        deviceTypeStr = part2;
        
    } else {
        // console.log("未找到匹配的两位字母和数字");
        // proxy.$modal.closeLoading();
        // proxy.$modal.msg("设备编号有误")
        return -1;
    }
    
    if(deviceTypeStr === 'Ed'){//跌倒监测
        resDeviceNumber.deviceType = '2';
    } else if (deviceTypeStr === 'Ld') {//呼吸睡眠
        resDeviceNumber.deviceType = '1';
    } else if (deviceTypeStr === 'La') {//呼吸睡眠-L2
        resDeviceNumber.deviceType = '4';
    } else if (deviceTypeStr === 'Sd') {//水浸
        resDeviceNumber.deviceType = '13';
    } else if (deviceTypeStr === 'Md') {//门磁
        resDeviceNumber.deviceType = '14';
    } else if (deviceTypeStr === 'Yd') {//烟感
        resDeviceNumber.deviceType = '15';
    } else if (deviceTypeStr === 'Rd') {//可燃气体
        resDeviceNumber.deviceType = '16';
    } else if (deviceTypeStr === 'Hd') {//红外
        resDeviceNumber.deviceType = '17';
    } else if (deviceTypeStr === 'Wd') {//温湿度
        resDeviceNumber.deviceType = '18';
    } else if (deviceTypeStr === 'Td') {//一氧化碳
        resDeviceNumber.deviceType = '19';
    } else if (deviceTypeStr === 'Od') {//其它
        resDeviceNumber.deviceType = '20';
    } else if (deviceTypeStr === 'Za') {//手表(AA型)
        resDeviceNumber.deviceType = '21';
    } else if (deviceTypeStr === 'Zb') {//手表(AB型)
        resDeviceNumber.deviceType = '22';
    } else if (deviceTypeStr === 'Zc') {//手表(AC型)
        resDeviceNumber.deviceType = '23';
    }
    
    return resDeviceNumber;
}

/** 解析设备编号判断是否为imei  deviceNumber格式：15位纯数字 
 * 如果是imei号返回true，代表是aep设备
 * 如果不是imei号返回false，代表是kat设备
 * 
*/
export function parseDeviceNumberIsImei(deviceNumBering) {
    // 检查是否为15位纯数字
    const imeiRegex = /^\d{15}$/;
    return imeiRegex.test(deviceNumBering);
}

/** 判断设备是否需要配网模块
 * 只有 '1'(呼吸睡眠), '2'(跌倒监测), '4'(呼吸睡眠-L2) 需要配网
 * @param {string} deviceType - 设备类型值
 * @returns {boolean} - 是否需要配网
 */
export function needsNetworkConfig(deviceType) {
    return ['1', '2', '4'].includes(deviceType);
}


/**
 * 设备类型常量定义
 * 
 * KAT设备（有参数设置，使用KAT接口）:
 *   - 1: 呼吸睡眠
 *   - 2: 跌倒监测
 *   - 4: 呼吸睡眠-L2
 * 
 * AEP设备-有参数设置（使用AEP接口）:
 *   - 15: 烟感
 *   - 16: 可燃气体
 *   - 19: 一氧化碳
 * 
 * AEP设备-无参数设置:
 *   - 13: 水浸
 *   - 14: 门磁
 *   - 17: 红外
 *   - 18: 温湿度
 * 
 * 手表设备-无参数设置（使用iwown接口）:
 *   - 21: 手表(H102C)
 *   - 22: 手表(AB型)
 *   - 23: 手表(AC型)
 */
const DEVICE_TYPES = {
    // KAT设备（有参数设置）
    KAT: ['1', '2', '4'],
    // AEP设备-有参数设置
    AEP_WITH_PARAMS: ['15', '16', '19'],
    // AEP设备-无参数设置
    AEP_NO_PARAMS: ['13', '14', '17', '18'],
    // 手表设备-无参数设置（使用iwown接口）
    WATCH_NO_PARAMS: ['21', '22', '23']
};

/**
 * 判断是否为KAT设备
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function isKatDevice(deviceType) {
    return DEVICE_TYPES.KAT.includes(deviceType);
}

/**
 * 判断是否为手表设备
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function isWatchDevice(deviceType) {
    return DEVICE_TYPES.WATCH_NO_PARAMS.includes(deviceType);
}

/**
 * 判断手表设备是否支持实时数据
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function watchSupportsRealTimeData(deviceType) {
    return DEVICE_TYPES.WATCH_NO_PARAMS.includes(deviceType);
}

/**
 * 判断手表设备是否支持健康数据总览
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function watchSupportsHealthOverview(deviceType) {
    return DEVICE_TYPES.WATCH_NO_PARAMS.includes(deviceType);
}

/**
 * 判断手表设备是否支持通话记录
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function watchSupportsCallHistory(deviceType) {
    return DEVICE_TYPES.WATCH_NO_PARAMS.includes(deviceType);
}

/**
 * 判断手表设备是否支持配置
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function watchSupportsConfig(deviceType) {
    return DEVICE_TYPES.WATCH_NO_PARAMS.includes(deviceType);
}

/**
 * 判断是否为AEP设备
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function isAepDevice(deviceType) {
    return !isKatDevice(deviceType) && !isWatchDevice(deviceType);
}

/**
 * 判断设备是否有参数设置模块
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function hasParamsSetting(deviceType) {
    return !DEVICE_TYPES.AEP_NO_PARAMS.includes(deviceType) && !DEVICE_TYPES.WATCH_NO_PARAMS.includes(deviceType);
}

/**
 * 判断是否为有参数设置的AEP设备
 * @param {string} deviceType - 设备类型值
 * @returns {boolean}
 */
export function isAepWithParams(deviceType) {
    return DEVICE_TYPES.AEP_WITH_PARAMS.includes(deviceType);
}
