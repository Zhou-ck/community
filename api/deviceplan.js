import request from '@/utils/request'

// 查询计划管理列表
export function listDevicePlan(query) {
  return request({
    url: '/system/deviceplan/list',
    method: 'get',
    params: query
  })
}
// 查询计划管理列表（当前生效中的计划）参数：双Key
export function listDevicePlanCurrent(query) {
  return request({
    url: '/system/deviceplan/plan/current',
    method: 'get',
    params: query
  })
}

// 查询计划管理详细
export function getDevicePlan(planId) {
  return request({
    url: '/system/deviceplan/' + planId,
    method: 'get'
  })
}

// 新增计划管理
export function addDevicePlan(data) {
  return request({
    url: '/system/deviceplan',
    method: 'post',
    data: data
  })
}

// 修改计划管理
export function updateDevicePlan(data) {
  return request({
    url: '/system/deviceplan',
    method: 'put',
    data: data
  })
}

// 删除计划管理
export function delDevicePlan(planId) {
  return request({
    url: '/system/deviceplan/' + planId,
    method: 'delete'
  })
}
