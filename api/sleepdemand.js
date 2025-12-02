import request from '@/utils/request'

// 查询第二代睡眠雷达的需求数据列表
export function listSleepdemand(query) {
  return request({
    url: '/devices/sleepdemand/list',
    method: 'get',
    params: query
  })
}

// 查询第二代睡眠雷达的需求数据详细
export function getSleepdemand(demandId) {
  return request({
    url: '/devices/sleepdemand/' + demandId,
    method: 'get'
  })
}

// 新增第二代睡眠雷达的需求数据
export function addSleepdemand(data) {
  return request({
    url: '/devices/sleepdemand',
    method: 'post',
    data: data
  })
}

// 修改第二代睡眠雷达的需求数据
export function updateSleepdemand(data) {
  return request({
    url: '/devices/sleepdemand',
    method: 'put',
    data: data
  })
}

// 删除第二代睡眠雷达的需求数据
export function delSleepdemand(demandId) {
  return request({
    url: '/devices/sleepdemand/' + demandId,
    method: 'delete'
  })
}
