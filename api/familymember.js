import request from '@/utils/request'

// 查询家庭人员列表
export function listFamilymember(query) {
  return request({
    url: '/resident/familymember/list',
    method: 'get',
    params: query
  })
}

// 查询家庭人员列表（无分页）
export function listFamilymemberNoPage(query) {
  return request({
    url: '/resident/familymember/nopage/list',
    method: 'get',
    params: query
  })
}

// 查询家庭人员（单个）
export function getFamilymember(memberId) {
  return request({
    url: '/resident/familymember/' + memberId,
    method: 'get'
  })
}

// 新增家庭人员
export function addFamilymember(data) {
  return request({
    url: '/resident/familymember',
    method: 'post',
    data: data
  })
}

// 修改家庭人员
export function updateFamilymember(data) {
  return request({
    url: '/resident/familymember',
    method: 'put',
    data: data
  })
}

// 删除家庭人员
export function delFamilymember(memberId) {
  return request({
    url: '/resident/familymember/' + memberId,
    method: 'delete'
  })
}
