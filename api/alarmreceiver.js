import request from '@/utils/request'

// 查询接警人列表
export function listAlarmreceiver(query) {
  return request({
    url: '/resident/alarmreceiver/list',
    method: 'get',
    params: query
  })
}

// 查询接警人详细
export function getAlarmreceiver(receiverId) {
  return request({
    url: '/resident/alarmreceiver/' + receiverId,
    method: 'get'
  })
}

// 新增接警人
export function addAlarmreceiver(data) {
  return request({
    url: '/resident/alarmreceiver',
    method: 'post',
    data: data
  })
}

// 修改接警人
export function updateAlarmreceiver(data) {
  return request({
    url: '/resident/alarmreceiver',
    method: 'put',
    data: data
  })
}

// 删除接警人
export function delAlarmreceiver(receiverId) {
  return request({
    url: '/resident/alarmreceiver/' + receiverId,
    method: 'delete'
  })
}
