import request from '@/utils/request'

// 创建支付（PC端扫码支付）
export function createPayment(data) {
  return request({
    url: '/api/payment/create',
    method: 'post',
    params: data
  })
}

// 创建小程序支付
export function getWechatPayParams(orderNo, openid) {
  return request({
    url: '/api/payment/miniapp/create',
    method: 'post',
    params: {
      orderNo: orderNo,
      openid: openid
    }
  })
}

// 查询支付状态
export function queryPayment(orderNo) {
  return request({
    url: '/api/payment/query/' + orderNo,
    method: 'get'
  })
}