import request from '@/utils/request'

// 新增iwown设备管理
export function addIwownDevice(data) {
  return request({
    url: '/api/iwown/device/add',
    method: 'post',
    data: data
  })
}

// 查询iwown设备列表
export function listIwownDevice(query) {
  return request({
    url: '/api/iwown/device/list',
    method: 'get',
    params: query
  })
}

// 根据ID查询iwown设备详情
export function getIwownDevice(iwowndeviceId) {
  return request({
    url: `/api/iwown/device/${iwowndeviceId}`,
    method: 'get'
  })
}

// 根据IMEI查询iwown设备详情
export function getIwownDeviceByImei(imei) {
  return request({
    url: `/api/iwown/device/imei/${imei}`,
    method: 'get'
  })
}

// 修改iwown设备
export function updateIwownDevice(data) {
  return request({
    url: '/api/iwown/device/update',
    method: 'put',
    data: data
  })
}

// 删除iwown设备
export function delIwownDevice(iwowndeviceIds) {
  return request({
    url: `/api/iwown/device/${iwowndeviceIds}`,
    method: 'delete'
  })
}
