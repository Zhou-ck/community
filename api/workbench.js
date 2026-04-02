import request from '@/utils/request'

// 查询当前服务人员的订单列表（按状态标签分类：待服务/服务中/待核销/已完成）
export function listMyOrders(query) {
  return request({
    url: '/services/serviceorder/list',
    method: 'get',
    params: query
  })
}

// 商家查看自己的订单列表（通过当前登录用户的商家ID查询）
export function listMyProviderOrders(query) {
  return request({
    url: '/services/order/assignment/my/orders',
    method: 'get',
    params: query
  })
}

// 查询订单详情
export function getOrderDetail(orderId) {
  return request({
    url: '/services/serviceorder/' + orderId,
    method: 'get'
  })
}

// 扫码核销（服务人员扫描居民二维码）
export function verifyScan(data) {
  return request({
    url: '/services/verification/verify/scan',
    method: 'post',
    data: data
  })
}

// 手动输入核销码核销
export function verifyManual(data) {
  return request({
    url: '/services/verification/verify/manual',
    method: 'post',
    data: data
  })
}

// 获取订单核销码（查看需要核销的码）
export function getVerificationCode(orderId) {
  return request({
    url: '/services/verification/code/' + orderId,
    method: 'get'
  })
}

// 获取当前登录服务人员信息
export function getMyStaffInfo(staffId) {
  return request({
    url: '/services/staff/' + staffId,
    method: 'get'
  })
}
