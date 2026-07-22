// api/home/package.js
import request from '@/utils/request'
import { mockPackages } from './mock'

// mock 开关：后端接口 ready 后改为 false，并在此映射真实字段为归一化结构
const USE_MOCK = true

// 查询老人首页套餐使用情况
// 返回归一化结构：{ list: [{ name, remaining, total, unit }] }
// memberId: 家庭成员 ID
export function getHomePackages(memberId) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ code: 200, msg: 'ok', data: mockPackages })
      }, 300)
    })
  }
  // TODO 阶段5: 后端确认 listMyPackageInstance 返回字段后，在此映射为归一化结构
  // 例如: r.packageName->name, r.remainCount->remaining, r.totalCount->total, r.unit->unit
  return request({
    url: '/resident/package/myInstance',
    method: 'get',
    params: { memberId }
  })
}
