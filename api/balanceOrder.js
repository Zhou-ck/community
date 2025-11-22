import request from '@/utils/request'

// 查询订单列表
export function listBalanceOrder(query) {
  return request({
    url: '/system/balanceOrder/list',
    method: 'get',
    params: query
  })
}

// 查询我的订单
export function getMyOrders(query) {
  return request({
    url: '/system/balanceOrder/myOrders',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getBalanceOrder(orderId) {
  return request({
    url: '/system/balanceOrder/' + orderId,
    method: 'get'
  })
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/system/balanceOrder/create',
    method: 'post',
    data: data
  })
}

// 取消订单
export function cancelOrder(orderId) {
  return request({
    url: '/system/balanceOrder/cancel/' + orderId,
    method: 'put'
  })
}

// 删除订单
export function delBalanceOrder(orderIds) {
  return request({
    url: '/system/balanceOrder/' + orderIds,
    method: 'delete'
  })
}

// 导出订单
export function exportBalanceOrder(query) {
  return request({
    url: '/system/balanceOrder/export',
    method: 'get',
    params: query
  })
}