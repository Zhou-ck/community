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
    }
    
    return resDeviceNumber;
}