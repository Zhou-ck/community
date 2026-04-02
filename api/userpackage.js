import request from '@/utils/request'

// 购买套餐
export function purchasePackage(data) {
  return request({
    url: '/services/userpackage/purchase',
    method: 'post',
    data: data
  })
}

// 退订套餐
export function refundPackage(data) {
  return request({
    url: '/services/userpackage/refund',
    method: 'post',
    data: data
  })
}

// 套餐扣减
export function consumePackage(data) {
  return request({
    url: '/services/userpackage/consume',
    method: 'post',
    data: data
  })
}

// 查询用户套餐实例列表
export function listUserPackageInstance(query) {
  return request({
    url: '/services/userpackage/instance/list',
    method: 'get',
    params: query
  })
}

// 查询套餐实例详情
export function getUserPackageInstance(instanceId) {
  return request({
    url: '/services/userpackage/instance/' + instanceId,
    method: 'get'
  })
}

// 查询套餐购买订单列表
export function listUserPackageOrder(query) {
  return request({
    url: '/services/userpackage/order/list',
    method: 'get',
    params: query
  })
}

// 查询消费流水列表
export function listConsumeLog(query) {
  return request({
    url: '/services/userpackage/my/package/orders',
    method: 'get',
    params: query
  })
}

// 查询赠送记录列表
export function listGiftRecord(query) {
  return request({
    url: '/services/userpackage/gift/list',
    method: 'get',
    params: query
  })
}

// 居民端：查询我的套餐列表
export function listMyPackageInstance(query) {
  return request({
    url: '/services/userpackage/my/list',
    method: 'get',
    params: query
  })
}

// 居民端：查询我的套餐详情
export function getMyPackageInstance(instanceId) {
  return request({
    url: '/services/userpackage/my/' + instanceId,
    method: 'get'
  })
}

// 居民端：购买套餐
export function myPurchasePackage(data) {
  return request({
    url: '/services/userpackage/my/purchase',
    method: 'post',
    data: data
  })
}

// 居民端：申请退订套餐
export function myRefundApply(data) {
  return request({
    url: '/services/userpackage/my/refund/apply',
    method: 'post',
    data: data
  })
}

// 居民端：撤销退订申请
export function myCancelRefundApply(data) {
  return request({
    url: '/services/userpackage/my/refund/cancel',
    method: 'post',
    data: data
  })
}

// 社区端：审核退订申请
export function reviewRefund(data) {
  return request({
    url: '/services/userpackage/refund/review',
    method: 'post',
    data: data
  })
}

// 查询待审核退订申请列表
export function listRefundPending(query) {
  return request({
    url: '/services/userpackage/refund/pending/list',
    method: 'get',
    params: query
  })
}

// 查询退订统计列表
export function listRefundStatistics(query) {
  return request({
    url: '/services/userpackage/refund/statistics/list',
    method: 'get',
    params: query
  })
}

// 居民端：确认服务完成(套餐余量扣减)
export function myConsumePackage(data) {
  return request({
    url: '/services/userpackage/my/consume',
    method: 'post',
    data: data
  })
}
