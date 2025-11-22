import request from '@/utils/request'

// 查询设备-接警人中间列表
export function listDevicereceiver(query) {
  return request({
    url: '/devices/devicereceiver/list',
    method: 'get',
    params: query
  })
}

// 查询设备-接警人中间详细
export function getDevicereceiver(deviceId) {
  return request({
    url: '/devices/devicereceiver/' + deviceId,
    method: 'get'
  })
}

// 新增设备-接警人中间
export function addDevicereceiver(data) {
  return request({
    url: '/devices/devicereceiver',
    method: 'post',
    data: data
  })
}

// 修改设备-接警人中间
export function updateDevicereceiver(data) {
  return request({
    url: '/devices/devicereceiver',
    method: 'put',
    data: data
  })
}

// 删除设备-接警人中间
export function delDevicereceiver(deviceId) {
  return request({
    url: '/devices/devicereceiver/' + deviceId,
    method: 'delete'
  })
}

// 根据deviceId查询接警人id列表
export function getAlarmReceiverIdsByDeviceId(deviceId) {
  return request({
    url: '/devices/devicereceiver/receiverIds/' + deviceId,
    method: 'get'
  })
}

// 根据deviceId绑定接警人
export function bindAlarmReceiverByDevice(data) {
  return request({
    url: '/devices/devicereceiver/bind/receiver',
    method: 'put',
    data: data
  })
}

// 查看绑定的接警人(根据deviceId)
export function getBindAlarmReceiver(deviceId, query) {
  return request({
    url: '/devices/devicereceiver/bindAlarmReceiver/' + deviceId,
    method: 'get',
    params: query
  })
}
