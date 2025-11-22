import request from '@/utils/request'

// 查询用户余量账户列表
export function listUserBalance(query) {
  return request({
    url: '/system/userBalance/list',
    method: 'get',
    params: query
  })
}

// 查询用户余量账户详细
export function getUserBalance(balanceId) {
  return request({
    url: '/system/userBalance/' + balanceId,
    method: 'get'
  })
}

// 根据用户ID查询余量账户
export function getUserBalanceByUserId(userId) {
  return request({
    url: '/system/userBalance/user/' + userId,
    method: 'get'
  })
}

// 获取当前登录用户余量
export function getCurrentUserBalance() {
  return request({
    url: '/system/userBalance/current',
    method: 'get'
  })
}

// 新增用户余量账户
export function addUserBalance(data) {
  return request({
    url: '/system/userBalance',
    method: 'post',
    data: data
  })
}

// 修改用户余量账户
export function updateUserBalance(data) {
  return request({
    url: '/system/userBalance',
    method: 'put',
    data: data
  })
}

// 删除用户余量账户
export function delUserBalance(balanceIds) {
  return request({
    url: '/system/userBalance/' + balanceIds,
    method: 'delete'
  })
}

// 导出用户余量账户
export function exportUserBalance(query) {
  return request({
    url: '/system/userBalance/export',
    method: 'get',
    params: query
  })
}

// 手动充值
export function rechargeUserBalance(data) {
  return request({
    url: '/system/userBalance/recharge',
    method: 'post',
    data: data
  })
}