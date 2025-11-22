import request from '@/utils/request'

// 查询所有社区列表
export function listDeptCommunity(query) {
  return request({
    url: '/system/dept/community/list',
    method: 'get',
    params: query
  })
}

// 查选项
export function optionslist(communityDeptId) {
  return request({
    url: '/system/dept/community/optionslist/' + communityDeptId,
    method: 'get'
  })
}

// 查楼层和门牌号list
export function listHousehold(unitDeptId) {
  return request({
    url: '/system/household/list/' + unitDeptId,
    method: 'get'
  })
}

// 获取申请内容
export function getApplyjoin(applyId) {
  return request({
    url: '/resident/applyjoin/' + applyId,
    method: 'get'
  })
}


// 新增申请加入社区
export function addApplyjoin(data) {
  return request({
    url: '/resident/applyjoin',
    method: 'post',
    data: data
  })
}

// 修改申请加入社区
export function updateApplyjoin(data) {
  return request({
    url: '/resident/applyjoin',
    method: 'put',
    data: data
  })
}

// 删除申请加入社区
export function delApplyjoin(applyId) {
  return request({
    url: '/resident/applyjoin/' + applyId,
    method: 'delete'
  })
}

// 撤销申请加入社区
export function cancelApplyjoin(applyId) {
  return request({
    url: '/resident/applyjoin/cancel/' + applyId,
    method: 'put'
  })
}

// 退出加入社区
export function leaveJoinCommunity(data) {
  return request({
    url: '/resident/applyjoin/leave',
    method: 'put',
    data: data
  })
}


// 查新申请详情
export function getApplyjoinDetail(applyId) {
  return request({
    url: '/resident/applyjoin/' + applyId,
    method: 'get'
  })
}
