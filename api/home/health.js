// api/home/health.js
import request from '@/utils/request'
import { mockHealthData } from './mock'

// mock 开关：后端接口 ready 后改为 false
const USE_MOCK = false

// 查询老人首页健康数据
// memberId: 家庭成员 ID
export function getHomeHealth(memberId) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ code: 200, msg: 'ok', data: mockHealthData })
      }, 300)
    })
  }
  return request({
    url: '/resident/home/health',
    method: 'get',
    params: { memberId }
  })
}
