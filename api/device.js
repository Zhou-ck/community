import request from '@/utils/request'

// 查询设备管理列表
export function listDevice(query) {
  return request({
    url: '/devices/device/list',
    method: 'get',
    params: query
  })
}

// 查询设备管理详细
export function getDevice(deviceId) {
  return request({
    url: '/devices/device/' + deviceId,
    method: 'get'
  })
}

// 新增设备管理
export function addDevice(data) {
  return request({
    url: '/devices/device',
    method: 'post',
    data: data
  })
}

// 修改设备管理
export function updateDevice(data) {
  return request({
    url: '/devices/device',
    method: 'put',
    data: data
  })
}

// 删除设备管理
export function delDevice(deviceId) {
  return request({
    url: '/devices/device/' + deviceId,
    method: 'delete'
  })
}

/** 获取设备实时数据
 * param: @productKey 产品key
 *        @DeviceKey  设备key
 *  */
export function getRealTimeData(query) {
  return request({
    url: '/devices/device/realtime',
    method: 'get',
    params: query
  })
}

// 发送单条指令
export function sendOneCommand(data) {
  return request({
    url: '/devices/device/set/params',
    method: 'post',
    data: data
  })
}

// 重置设备网络（让设备进入配网模式）
export function resetDeviceNetwork(data) {
  return request({
    url: '/devices/device/invoke/service',
    method: 'post',
    data: data
  })
}
