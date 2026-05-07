import request from '@/utils/request'

// 获取订单核销码（居民端，含懒刷新）
export function getVerificationCode(orderId) {
  return request({
    url: '/services/verification/code/' + orderId,
    method: 'get'
  })
}

// 居民手动确认服务完成（兜底方案）
export function residentConfirm(orderId) {
  return request({
    url: '/services/verification/confirm/' + orderId,
    method: 'post'
  })
}

// 获取订单额外信息
export function getExtraOrderInfo(orderId) {
  return request({
    url: '/services/verification/extra/order/' + orderId,
    method: 'get'
  })
}
