import request from '@/utils/request'

// 查询服务类型列表
export function grouplistServicetype(query) {
  return request({
    url: '/services/servicetype/grouplist',
    method: 'get',
    params: query,
    headers: { isToken: false }
  })
}

// 查询服务项列表
export function listServiceitem(query) {
  return request({
    url: '/services/serviceitem/list',
    method: 'get',
    params: query
    })
}

// 预约服务
export function addServiceorder(data) {
  return request({
    url: '/services/serviceorder',
    method: 'post',
    data: data
  })
}

// 取消预约
export function cancelServiceorder(data) {
  return request({
    url: '/services/serviceorder/cancel',
    method: 'put',
    data: data
  })
}

// 查询服务订单列表
export function listServiceorder(query) {
  return request({
    url: '/services/serviceorder/list',
    method: 'get',
    params: query
  })
}

// 查询服务订单(单个)
export function getServiceorder(orderId) {
  return request({
    url: '/services/serviceorder/' + orderId,
    method: 'get'
  })
}

// 修改服务订单
export function updateServiceorder(data) {
  return request({
    url: '/services/serviceorder',
    method: 'put',
    data: data
  })
}

// 查询订单的修改记录
export function getModificationHistory(orderId) {
  return request({
    url: '/services/appointment/modification/history/' + orderId,
    method: 'get'
  })
}

// 删除服务订单
export function delServiceorder(orderId) {
  return request({
    url: '/services/serviceorder/' + orderId,
    method: 'delete'
  })
}


// 服务完成
export function completeServiceorder(data) {
  return request({
    url: '/services/serviceorder/complete',
    method: 'put',
    data: data
  })
}

// 服务评价
export function evaluationServiceorder(data) {
  return request({
    url: '/services/serviceorder/evaluation',
    method: 'put',
    data: data
  })
}

// 查询订单评价列表
export function getEvaluationListByOrderId(orderId) {
  return request({
    url: '/services/evaluation/listByOrderId/' + orderId,
    method: 'get'
  })
}