import request from '@/utils/request'

// 查询用户服务地址列表(无分页)
export function listServicesaddressNoPage(query) {
  return request({
    url: '/resident/servicesaddress/nopage/list',
    method: 'get',
    params: query
  })
}

// 查询用户服务地址详细
export function getServicesaddress(addressId) {
  return request({
    url: '/resident/servicesaddress/' + addressId,
    method: 'get'
  })
}

// 新增用户服务地址
export function addServicesaddress(data) {
  return request({
    url: '/resident/servicesaddress',
    method: 'post',
    data: data
  })
}

// 修改用户服务地址
export function updateServicesaddress(data) {
  return request({
    url: '/resident/servicesaddress',
    method: 'put',
    data: data
  })
}

// 删除用户服务地址
export function delServicesaddress(addressId) {
  return request({
    url: '/resident/servicesaddress/' + addressId,
    method: 'delete'
  })
}
