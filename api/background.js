import request from '@/utils/request'

// 获取设备背景图列表
export function listBackgrounds(query) {
  return request({
    url: '/api/backgrounds/list',
    method: 'get',
    params: query
  })
}

// 获取背景图二进制数据
export function queryBackgroundById(query) {
  return request({
    url: '/api/backgrounds/image',
    method: 'get',
    params: query
  })
}

// 上传新背景图
export function uploadBackground(data) {
  return request({
    url: '/api/backgrounds/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data
  })
}

// 设置当前背景图
export function setCurrentBackground(data) {
  return request({
    url: '/api/backgrounds/setCurrent',
    method: 'put',
    data: data
  })
}