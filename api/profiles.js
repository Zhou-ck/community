import request from '@/utils/request'

// 查询设备资料列表
export function listProfiles(query) {
  return request({
    url: '/devices/profiles/list',
    method: 'get',
    params: query
  })
}

// 查询设备资料详细
export function getProfiles(profilesId) {
  return request({
    url: '/devices/profiles/' + profilesId,
    method: 'get'
  })
}

// 新增设备资料
export function addProfiles(data) {
  return request({
    url: '/devices/profiles',
    method: 'post',
    data: data
  })
}

// 修改设备资料
export function updateProfiles(data) {
  return request({
    url: '/devices/profiles',
    method: 'put',
    data: data
  })
}

// 删除设备资料
export function delProfiles(profilesId) {
  return request({
    url: '/devices/profiles/' + profilesId,
    method: 'delete'
  })
}

// 上传设备照片
export function uploadPhoto(data) {
  return request({
    url: '/devices/profiles/photo',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data
  })
}
