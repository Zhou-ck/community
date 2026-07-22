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
    // 拉取近期订单，客户端按"预约日期=今天"过滤，展示每条订单的真实状态
    // （verificationTime 后端未填充，无法按核销时间过滤；改用预约日期+订单状态展示）
    const res = await listServiceorder({
      pageNum: 1,
      pageSize: 50,
      excludePackageByDefault: false, // 含套餐订单（如助餐）
      memberId: memberId || undefined
    })

    if (res.code !== 200 || !res.rows) {
      return { code: res.code || 500, msg: res.msg || '请求失败', data: { total: 0, completed: 0, list: [] } }
    }

    const today = date || formatToday()
    const allRows = res.rows
    // 今日订单 = 预约日期(appointmentDate) 为今天
    const todayOrders = allRows.filter(o => {
      const ad = String(o.appointmentDate || '').replace(/\//g, '-').slice(0, 10)
      return ad === today
    })

    const list = todayOrders.map(o => ({
      id: o.orderId,
      name: o.serviceName || '服务项目',
      status: o.orderStatus,            // '0'待接单 '1'已接单 '2'服务中 '3'已完成 '8'待核销
      statusName: statusText(o.orderStatus)
    }))

    const completed = todayOrders.filter(o => o.orderStatus === '3').length

    console.log('[getTodayOrder] 近期:', allRows.length, '| 今日订单:', todayOrders.length, '| 已完成:', completed)

    return {
      code: 200,
      msg: 'ok',
      data: { total: todayOrders.length, completed, list }
    }
  } catch (e) {
    console.error('getTodayOrder 请求失败:', e)
    return { code: 500, msg: '请求失败', data: { total: 0, completed: 0, list: [] } }
  }
}
