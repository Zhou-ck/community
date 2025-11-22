import request from '@/utils/request'

// 查询家庭人员-设备中间列表
export function listFamilyMemberDevice(query) {
  return request({
    url: '/devices/familyMemberDevice/list',
    method: 'get',
    params: query
  })
}

// 查询家庭人员-设备中间详细
export function getFamilyMemberDevice(memberId) {
  return request({
    url: '/devices/familyMemberDevice/' + memberId,
    method: 'get'
  })
}

// 根据deviceId查询家人id列表
export function getMemberIdsByDeviceId(deviceId) {
  return request({
    url: '/devices/familyMemberDevice/memberIds/' + deviceId,
    method: 'get'
  })
}

// 新增家庭人员-设备中间
export function addFamilyMemberDevice(data) {
  return request({
    url: '/devices/familyMemberDevice',
    method: 'post',
    data: data
  })
}

// 修改家庭人员-设备中间
export function updateFamilyMemberDevice(data) {
  return request({
    url: '/devices/familyMemberDevice',
    method: 'put',
    data: data
  })
}

// 设备绑定家人
export function bindFamilyMemberByDevice(data) {
  return request({
    url: '/devices/familyMemberDevice/bind/member',
    method: 'put',
    data: data
  })
}

// 删除家庭人员-设备中间
export function delFamilyMemberDevice(memberId) {
  return request({
    url: '/devices/familyMemberDevice/' + memberId,
    method: 'delete'
  })
}

// 查看绑定的家庭人员(根据deviceId)
export function getBindFamilyMember(deviceId, query) {
  return request({
    url: '/devices/familyMemberDevice/bindFamilyMember/' + deviceId,
    method: 'get',
    params: query
  })
}
