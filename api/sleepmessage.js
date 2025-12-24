import request from '@/utils/request'

// 查询第二代睡眠雷达的消息数据列表
export function listSleepmessage(query) {
  return request({
    url: '/devices/sleepmessage/list',
    method: 'get',
    params: query
  })
}

// 查询第二代睡眠雷达的消息数据详细
export function getSleepmessage(demandId) {
  return request({
    url: '/devices/sleepmessage/' + demandId,
    method: 'get'
  })
}

// 新增第二代睡眠雷达的消息数据
export function addSleepmessage(data) {
  return request({
    url: '/devices/sleepmessage',
    method: 'post',
    data: data
  })
}

// 修改第二代睡眠雷达的消息数据
export function updateSleepmessage(data) {
  return request({
    url: '/devices/sleepmessage',
    method: 'put',
    data: data
  })
}

// 删除第二代睡眠雷达的消息数据
export function delSleepmessage(demandId) {
  return request({
    url: '/devices/sleepmessage/' + demandId,
    method: 'delete'
  })
}

// 设置为当前消息
export function setcurrentMsg(data) {
  return request({
    url: '/devices/sleepmessage/setcurrent',
    method: 'post',
    data: data
  })
}