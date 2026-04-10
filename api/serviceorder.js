import request from '@/utils/request'

// 按需服务申请
export function applyOnDemandService(data) {
  return request({
    url: '/services/serviceorder/ondemand',
    method: 'post',
    data: data
  })
}
