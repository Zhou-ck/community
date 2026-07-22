import { listServiceorder } from '@/api/service'
import { ORDER_STATUS_MAP, ORDER_STATUS_CODE_MAP } from '@/utils/service-helper'

// 真实接口开关：true=mock，false=调用后端 listServiceorder
const USE_MOCK = false

// ===== mock 数据（保留以备回退 / 联调）=====
const MOCK_DATA = {
  total: 3,
  completed: 3,
  list: [
    { name: '早餐配送', status: '3', statusName: '已完成' },
    { name: '居室清洁', status: '3', statusName: '已完成' },
    { name: '午餐配送', status: '3', statusName: '已完成' }
  ]
}

function statusText(orderStatus) {
  const key = ORDER_STATUS_CODE_MAP[orderStatus]
  const info = key && ORDER_STATUS_MAP[key]
  return info ? info.text : '未知'
}

function formatToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 获取今日完成订单（按核销时间）
 * @param {String|Number} memberId 家庭成员 ID（后端如支持则按成员过滤，否则取当前登录用户订单）
 * @param {String} date yyyy-MM-dd，默认今天
 * @returns {Promise<{code, msg, data:{total, completed, list}}>}
 */
export async function getTodayOrder(memberId, date) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ code: 200, msg: 'ok', data: MOCK_DATA }), 300)
    })
  }

  try {
    // 拉取已完成订单（orderStatus:'3'，与订单页"已完成"页签一致；不传 memberId：订单按登录用户维度）
    // 再客户端按"核销时间(verificationTime)=今天"过滤
    const res = await listServiceorder({
      pageNum: 1,
      pageSize: 50,
      orderStatus: '3',                // 只查已完成订单
      excludePackageByDefault: false   // 含套餐订单（如助餐）
    })

    if (res.code !== 200 || !res.rows) {
      return { code: res.code || 500, msg: res.msg || '请求失败', data: { total: 0, completed: 0, list: [] } }
    }

    const today = date || formatToday()
    const allRows = res.rows
    // 今日完成 = 核销时间(verificationTime) 为今天
    const completedToday = allRows.filter(o => {
      const vt = String(o.verificationTime || '').replace(/\//g, '-').slice(0, 10)
      return vt === today
    })

    // 诊断日志
    console.log('[getTodayOrder] 已完成订单总数:', allRows.length, '| 今日核销:', completedToday.length)
    if (allRows.length) {
      console.log('[getTodayOrder] 样例:', {
        orderStatus: allRows[0].orderStatus,
        verificationTime: allRows[0].verificationTime,
        serviceName: allRows[0].serviceName,
        appointmentDate: allRows[0].appointmentDate
      })
    } else {
      console.log('[getTodayOrder] ⚠️ 此账号没有任何已完成(status=3)订单。可能原因: 服务人员核销后订单状态未改为3，或核销的是别的账号的订单')
    }

    const list = completedToday.map(o => ({
      id: o.orderId,
      name: o.serviceName || '服务项目',
      status: o.orderStatus,            // '3' 已完成
      statusName: statusText(o.orderStatus)
    }))

    return {
      code: 200,
      msg: 'ok',
      data: { total: completedToday.length, completed: completedToday.length, list }
    }
  } catch (e) {
    console.error('getTodayOrder 请求失败:', e)
    return { code: 500, msg: '请求失败', data: { total: 0, completed: 0, list: [] } }
  }
}
