import request from '@/utils/request'

// 查询健康档案列表
export function listResidenthealthrecord(query) {
  return request({
    url: '/resident/residenthealthrecord/list',
    method: 'get',
    params: query
  })
}

// 查询健康档案详细
export function getResidenthealthrecord(recordId) {
  return request({
    url: '/resident/residenthealthrecord/' + recordId,
    method: 'get'
  })
}

// 查询健康档案详细
export function getResidenthealthrecordByFamilyMemberId(familyMemberId) {
  return request({
    url: '/resident/residenthealthrecord/family/' + familyMemberId,
    method: 'get'
  })
}

// 新增健康档案
export function addResidenthealthrecord(data) {
  return request({
    url: '/resident/residenthealthrecord',
    method: 'post',
    data: data
  })
}

// 修改健康档案
export function updateResidenthealthrecord(data) {
  return request({
    url: '/resident/residenthealthrecord',
    method: 'put',
    data: data
  })
}

// 删除健康档案
export function delResidenthealthrecord(recordId) {
  return request({
    url: '/resident/residenthealthrecord/' + recordId,
    method: 'delete'
  })
}

// 获取所有已建档的家庭成员ID列表
export function getExistingFamilyMemberIds() {
  return request({
    url: '/resident/residenthealthrecord/existingMemberIds',
    method: 'get'
  })
}