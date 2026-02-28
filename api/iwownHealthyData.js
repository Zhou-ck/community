import request from '@/utils/request'

// 查询埃微手健康数据列表
export function listIwownHealthyData(query) {
  return request({
    url: '/system/iwownHealthyData/list',
    method: 'get',
    params: query
  })
}

// 查询埃微手健康数据详细
export function getIwownHealthyData(hisdataId) {
  return request({
    url: '/system/iwownHealthyData/' + hisdataId,
    method: 'get'
  })
}

// 新增埃微手健康数据
export function addIwownHealthyData(data) {
  return request({
    url: '/system/iwownHealthyData',
    method: 'post',
    data: data
  })
}

// 修改埃微手健康数据
export function updateIwownHealthyData(data) {
  return request({
    url: '/system/iwownHealthyData',
    method: 'put',
    data: data
  })
}

// 删除埃微手健康数据
export function delIwownHealthyData(hisdataId) {
  return request({
    url: '/system/iwownHealthyData/' + hisdataId,
    method: 'delete'
  })
}

// 获取最新健康数据
export function getLatestHealthyData(query) {
  return request({
    url: '/system/iwownHealthyData/latest',
    method: 'get',
    params: query
  })
}

// 按时间范围查询健康数据（用于睡眠期间数据查询）
export function getHealthyDataByTimeRange(query) {
  return request({
    url: '/system/iwownHealthyData/timeRange',
    method: 'get',
    params: query
  })
}
