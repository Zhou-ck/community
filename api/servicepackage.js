import request from '@/utils/request'

// 查询套餐列表
export function listServicePackage(query) {
  return request({
    url: '/services/servicepackage/list',
    method: 'get',
    params: query
  })
}

// 查询套餐列表(不分页)
export function listAllServicePackage(query) {
  return request({
    url: '/services/servicepackage/listAll',
    method: 'get',
    params: query
  })
}

// 查询套餐详情
export function getServicePackage(packageId) {
  return request({
    url: '/services/servicepackage/' + packageId,
    method: 'get'
  })
}

// 居民端：查询本社区可购买的套餐列表
export function listAvailablePackage(query) {
  return request({
    url: '/services/servicepackage/available',
    method: 'get',
    params: query
  })
}

// 居民端：查询可购买套餐详情
export function getAvailablePackageDetail(packageId) {
  return request({
    url: '/services/servicepackage/available/' + packageId,
    method: 'get'
  })
}
