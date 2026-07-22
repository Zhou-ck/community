// api/home/package.js
import { listMyPackageInstance } from '@/api/userpackage'
import { getInstanceStatusText } from '@/utils/service-helper'
import { mockPackages } from './mock'

// mock 开关：后端接口 ready 后改为 false
const USE_MOCK = false

// 查询老人首页套餐使用情况
// 返回归一化结构：{ list: [{ name, status, statusText }] }
// 说明：my/list 列表接口不返回剩余/总次数（次数在详情 packageItems 上），
//       首页概览只展示套餐名+状态，不发多个详情请求；进度条需详情接口暂不支持。
// memberId: 预留参数。居民端 /services/userpackage/my/list 按当前登录 token 查询，不传 memberId。
export async function getHomePackages(/* memberId */) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ code: 200, msg: 'ok', data: mockPackages })
      }, 300)
    })
  }
  try {
    const res = await listMyPackageInstance({ pageNum: 1, pageSize: 20 })
    const rows = (res && res.rows) || []
    const list = rows.map(r => ({
      name: r.packageName || '服务套餐',
      status: r.instanceStatus || 'ACTIVE',
      statusText: getInstanceStatusText(r.instanceStatus)
    }))
    return { code: 200, msg: 'ok', data: { list } }
  } catch (e) {
    console.error('getHomePackages 请求失败:', e)
    return { code: 500, msg: '请求失败', data: { list: [] } }
  }
}
