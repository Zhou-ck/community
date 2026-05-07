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
    } else if (deviceTypeStr === 'Za') {//手表(H102C)
        resDeviceNumber.deviceType = '21';
    } else if (deviceTypeStr === 'Zb') {//手表(BP100C)
        resDeviceNumber.deviceType = '22';
    } else if (deviceTypeStr === 'Ls') {//SOS拉绳紧急按钮
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
 *   - 23: SOS拉绳紧急按钮
 * 
 * 手表设备-无参数设置（使用iwown接口）:
 *   - 21: 手表(H102C)
 *   - 22: 手表(BP100C)
 */
const DEVICE_TYPES = {
    // KAT设备（有参数设置）
    KAT: ['1', '2', '4'],
    // AEP设备-有参数设置
    AEP_WITH_PARAMS: ['15', '16', '19'],
    // AEP设备-无参数设置
    AEP_NO_PARAMS: ['13', '14', '17', '18', '23'],
    // 手表设备-无参数设置（使用iwown接口）
    WATCH_NO_PARAMS: ['21', '22']
};

/** 判断设备是否需要配网模块
 * 只有 KAT 设备需要配网：'1'(呼吸睡眠), '2'(跌倒监测), '4'(呼吸睡眠-L2)
 * @param {string} deviceType - 设备类型值
 * @returns {boolean} - 是否需要配网
 */
export function needsNetworkConfig(deviceType) {
    return DEVICE_TYPES.KAT.includes(deviceType);
}

// ==================== 设备绑定家人相关配置 ====================

/**
 * 不同设备类型可绑定的最大家人数
 * key 为设备类型（string），value 为最大可绑定家人数
 * 0 或 undefined 表示不限制人数
 */
export const deviceTypeMaxBindCountMap = {
    '0': 0,   // 人体存在
    '1': 1,   // 呼吸睡眠
    '2': 0,   // 跌倒监测
    '4': 1,   // 呼吸睡眠-L2
    '13': 0,  // 水浸
    '14': 0,  // 门磁
    '15': 0,  // 烟感
    '16': 0,  // 可燃气体
    '17': 0,  // 红外
    '18': 0,  // 温湿度
    '19': 0,  // 一氧化碳
    '20': 0,  // 其它
    '21': 0,  // 手表(H102C)
    '22': 0,  // 手表(BP100C)
    '23': 0   // SOS拉绳紧急按钮
};

/**
 * 不支持绑定家人的设备类型列表
 * 元素为设备类型（string）
 * 在前端会根据该配置隐藏/禁用"绑定家人"入口
 */
export const deviceTypesDisableBindFamily = [
    '0',   // 人体存在
    '2',   // 跌倒监测
    '13',  // 水浸
    '14',  // 门磁
    '15',  // 烟感
    '16',  // 可燃气体
    '17',  // 红外
    '18',  // 温湿度
    '19',  // 一氧化碳
    '20',  // 其它
    '21',  // 手表(H102C)
    '22'   // 手表(BP100C)
];

/**
 * 获取设备类型可绑定的最大家人数
 * @param {string} deviceType - 设备类型值
 * @returns {number} - 最大可绑定家人数，0表示不限制
 */
export function getDeviceMaxBindCount(deviceType) {
    return deviceTypeMaxBindCountMap[deviceType] || 0;
}

/**
 * 判断设备类型是否支持绑定家人
 * @param {string} deviceType - 设备类型值
 * @returns {boolean} - true表示支持绑定家人，false表示不支持
 */
export function canBindFamily(deviceType) {
    return !deviceTypesDisableBindFamily.includes(deviceType);
}

/**
 * 判断设备是否已达到绑定家人上限
 * @param {string} deviceType - 设备类型值
 * @param {number} currentBindCount - 当前已绑定的家人数
 * @returns {boolean} - true表示已达上限，false表示未达上限
 */
export function isBindFamilyLimitReached(deviceType, currentBindCount) {
    const maxCount = getDeviceMaxBindCount(deviceType);
    // maxCount为0表示不限制
    if (maxCount === 0) {
        return false;
    }
    return currentBindCount >= maxCount;
}

/**
 * 获取设备绑定家人的提示信息
 * @param {string} deviceType - 设备类型值
 * @param {number} currentBindCount - 当前已绑定的家人数
 * @returns {string} - 提示信息
 */
export function getBindFamilyTip(deviceType, currentBindCount = 0) {
    if (!canBindFamily(deviceType)) {
        return '该设备类型不支持绑定家人';
    }
    
    const maxCount = getDeviceMaxBindCount(deviceType);
    if (maxCount === 0) {
        return '可绑定多个家人';
    }
    
    if (isBindFamilyLimitReached(deviceType, currentBindCount)) {
        return `该设备最多绑定${maxCount}个家人，已达上限`;
    }
    
    return `该设备最多可绑定${maxCount}个家人，当前已绑定${currentBindCount}个`;
}

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
 * 判断手表设备是否支持特定功能
 * 目前所有手表设备都支持以下功能：实时数据、健康数据总览、通话记录、配置
 * @param {string} deviceType - 设备类型值
 * @param {string} feature - 功能名称（可选）：'realtime'|'health'|'call'|'config'
 * @returns {boolean}
 */
export function watchSupportsFeature(deviceType, feature) {
    // 所有手表设备都支持这些功能
    return isWatchDevice(deviceType);
}

// 为了保持向后兼容，保留原有的函数名，但内部调用统一的函数
export function watchSupportsRealTimeData(deviceType) {
    return watchSupportsFeature(deviceType, 'realtime');
}

export function watchSupportsHealthOverview(deviceType) {
    return watchSupportsFeature(deviceType, 'health');
}

export function watchSupportsCallHistory(deviceType) {
    return watchSupportsFeature(deviceType, 'call');
}

export function watchSupportsConfig(deviceType) {
    return watchSupportsFeature(deviceType, 'config');
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
