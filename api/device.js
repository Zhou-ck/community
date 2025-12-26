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

// 查询设备管理列表 参数:imei
export function getAepDevice(query) {
  return request({
    url: '/aep/device/queryone',
    method: 'get',
    params: query
  })
}

// 查询设备管理列表 参数:productKey、deviceKey、imei
export function getAepDeviceInfo(query) {
  return request({
    url: '/aep/device/queryinfo',
    method: 'get',
    params: query
  })
}

// 精华隆Aep设备在线属性调试
export function deviceCommandLwm2mProfile(data) {
  return request({
    url: '/api/command/operat/command/lwm2m/profile',
    method: 'post',
    params: data
  })
}

// 精华隆Aep设备获取单个设备详情
export function queryCommandLwm2mProfile(data) {
  return request({
    url: '/api/command/operat/command/lwm2m/profile/query',
    method: 'post',
    params: data
  })
}

// 精华隆Aep设备取消设备下所有未发送指令
export function cancelAllCommandLwm2mProfile(data) {
  return request({
    url: '/api/command/operat/command/lwm2m/profile/cancelall',
    method: 'post',
    params: data
  })
}

// 精华隆Aep设备取消单个指令
export function cancelOneCommandLwm2mProfile(data) {
  return request({
    url: '/api/command/operat/command/lwm2m/profile/cancelone',
    method: 'post',
    params: data
  })
}
