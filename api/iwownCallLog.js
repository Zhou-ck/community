import request from '@/utils/request'

// 查询设备通话记录列表
export function listIwownCallLog(query) {
  return request({
    url: '/system/iwownCallLog/list',
    method: 'get',
    params: query
  })
}

// 查询设备通话记录详细
export function getIwownCallLog(logId) {
  return request({
    url: '/system/iwownCallLog/' + logId,
    method: 'get'
  })
}

// 新增设备通话记录
export function addIwownCallLog(data) {
  return request({
    url: '/system/iwownCallLog',
    method: 'post',
    data: data
  })
}

// 修改设备通话记录
export function updateIwownCallLog(data) {
  return request({
    url: '/system/iwownCallLog',
    method: 'put',
    data: data
  })
}

// 删除设备通话记录
export function delIwownCallLog(logId) {
  return request({
    url: '/system/iwownCallLog/' + logId,
    method: 'delete'
  })
}
