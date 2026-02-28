import request from '@/utils/request'

/**
 * 获取设备单个配置
 */
export function getDeviceConfig(deviceId, configType) {
  return request({
    url: `/api/iwown/device/config/${deviceId}/${configType}`,
    method: 'get'
  })
}

/**
 * 获取设备所有配置
 */
export function getAllDeviceConfigs(deviceId) {
  return request({
    url: `/api/iwown/device/config/${deviceId}`,
    method: 'get'
  })
}

/**
 * 删除设备配置
 */
export function deleteDeviceConfig(deviceId, configType) {
  return request({
    url: `/api/iwown/device/config/${deviceId}/${configType}`,
    method: 'delete'
  })
}
