import request from '@/utils/request'

// 查询睡眠设备十分钟数据列表
export function listTensleep(query) {
  return request({
    url: '/devices/tensleep/list',
    method: 'get',
    params: query
  })
}

// 查询睡眠设备十分钟数据详细
export function getTensleep(tenId) {
  return request({
    url: '/devices/tensleep/' + tenId,
    method: 'get'
  })
}

// 新增睡眠设备十分钟数据
export function addTensleep(data) {
  return request({
    url: '/devices/tensleep',
    method: 'post',
    data: data
  })
}

// 修改睡眠设备十分钟数据
export function updateTensleep(data) {
  return request({
    url: '/devices/tensleep',
    method: 'put',
    data: data
  })
}

// 删除睡眠设备十分钟数据
export function delTensleep(tenId) {
  return request({
    url: '/devices/tensleep/' + tenId,
    method: 'delete'
  })
}

// 查询睡眠评估报告
export function queryComprehensiveReportData(query) {
  return request({
    url: '/devices/tensleep/queryComprehensiveReportData',
    method: 'get',
    params: query
  })
}
