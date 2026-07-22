// api/home/todayOrder.js
import request from '@/utils/request'
import { mockTodayOrder } from './mock'

// mock 开关：后端接口 ready 后改为 false
const USE_MOCK = true

// 查询老人今日服务订单汇总
// memberId: 家庭成员 ID；date: yyyy-MM-dd
export function getTodayOrder(memberId, date) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ code: 200, msg: 'ok', data: mockTodayOrder })
      }, 300)
    })
  }
  return request({
    url: '/services/order/today',
    method: 'get',
    params: { memberId, date }
  })
}
