import request from '@/utils/request'

// 查询套餐包列表
export function listBalancePackage(query) {
  return request({
    url: '/system/balancePackage/list',
    method: 'get',
    params: query
  })
}

// 查询上架套餐列表（商城）
export function getOnlinePackages() {
  return request({
    url: '/system/balancePackage/online',
    method: 'get'
  })
}

// 查询套餐包详细
export function getBalancePackage(packageId) {
  return request({
    url: '/system/balancePackage/' + packageId,
    method: 'get'
  })
}

// 新增套餐包
export function addBalancePackage(data) {
  return request({
    url: '/system/balancePackage',
    method: 'post',
    data: data
  })
}

// 修改套餐包
export function updateBalancePackage(data) {
  return request({
    url: '/system/balancePackage',
    method: 'put',
    data: data
  })
}

// 删除套餐包
export function delBalancePackage(packageIds) {
  return request({
    url: '/system/balancePackage/' + packageIds,
    method: 'delete'
  })
}

// 导出套餐包
export function exportBalancePackage(query) {
  return request({
    url: '/system/balancePackage/export',
    method: 'post',
    params: query
  })
}

// 获取用户购买记录
export function getUserPurchaseRecords(query) {
  return request({
    url: '/system/balancePackage/purchaseRecords',
    method: 'get',
    params: query
  })
}
