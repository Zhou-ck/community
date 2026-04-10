import request from '@/utils/request'

// 查询设备监控申请列表
export function listMonitorApply(query) {
  return request({
    url: '/system/device/monitorApply/list',
    method: 'get',
    params: query
  })
}

// 查询申请详情
export function getMonitorApply(applyId) {
  return request({
    url: '/system/device/monitorApply/' + applyId,
    method: 'get'
  })
}

// 提交申请
export function submitMonitorApply(data) {
  return request({
    url: '/system/device/monitorApply',
    method: 'post',
    data: data
  })
}

// 审批通过
export function approveMonitorApply(applyId, reviewRemark, expireTime) {
  return request({
    url: '/system/device/monitorApply/approve/' + applyId,
    method: 'put',
    params: { reviewRemark, expireTime }
  })
}

// 审批拒绝
export function rejectMonitorApply(applyId, reviewRemark) {
  return request({
    url: '/system/device/monitorApply/reject/' + applyId,
    method: 'put',
    params: { reviewRemark }
  })
}

// 按设备ID撤销申请
export function cancelMonitorApplyByDeviceId(deviceId) {
  return request({
    url: '/system/device/monitorApply/cancelByDevice/' + deviceId,
    method: 'put'
  })
}

// 撤销申请
export function cancelMonitorApply(applyId) {
  return request({
    url: '/system/device/monitorApply/cancel/' + applyId,
    method: 'put'
  })
}

// 终止监控
export function terminateMonitorApply(applyId) {
  return request({
    url: '/system/device/monitorApply/terminate/' + applyId,
    method: 'put'
  })
}
