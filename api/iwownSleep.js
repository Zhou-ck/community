import request from '@/utils/request'

// 手动触发睡眠计算
export function calculateSleep(deviceId, recordDate) {
  return request({
    url: '/system/iwown/sleep/calculate',
    method: 'post',
    params: {
      deviceId,
      recordDate
    }
  })
}

// 查询睡眠报告（参数名为 deviceId，但实际传递 imei 值）
export function getSleepReport(imei, recordDate) {
  return request({
    url: '/system/iwown/sleep/report',
    method: 'get',
    params: {
      deviceId: imei,  // 后端参数名是 deviceId，但值是 imei
      recordDate
    }
  })
}

// 查询睡眠报告列表
export function getSleepReportList(deviceId, startDate, endDate) {
  return request({
    url: '/system/iwown/sleep/reportList',
    method: 'get',
    params: {
      deviceId,
      startDate,
      endDate
    }
  })
}

// 获取睡眠详细信息
export function getSleepDetail(deviceId, recordDate) {
  return request({
    url: '/system/iwown/sleep/detail',
    method: 'get',
    params: {
      deviceId,
      recordDate
    }
  })
}

// iwown睡眠报告形成
export function iwownSleepCalculate(data) {
  return request({
    url: '/system/iwown/sleep/calculate',
    method: 'post',
    data: data
  })
}