// api/home/mock.js
// 首页健康/订单接口的 mock 数据，后端实现后通过各 API 文件的 USE_MOCK 开关关闭

// 首页健康数据（按家庭成员）
export const mockHealthData = {
  heartRate: 72,
  temperature: 36.5,
  respiratoryRate: 18,
  bloodOxygen: 98,
  bloodPressure: { systolic: 120, diastolic: 80 },
  bloodSugar: 5.6,
  inBedStatus: 1,
  inBedStatusName: '在床',
  sleep: {
    lastNightDuration: 7.5,
    fallAsleepTime: '22:30',
    wakeUpTime: '06:00',
    // 近7天睡眠时长（小时），索引0为6天前，最后一位为今天
    last7Days: [6.5, 7.0, 7.5, 6.0, 8.0, 7.2, 7.5]
  },
  updateTime: '2026-07-22 09:30:00'
}

// 今日订单汇总（按家庭成员 + 日期）
export const mockTodayOrder = {
  total: 5,
  completed: 3,
  list: [
    { name: '早餐配送', status: '2', statusName: '已完成' },
    { name: '居室清洁', status: '2', statusName: '已完成' },
    { name: '午餐配送', status: '1', statusName: '待服务' },
    { name: '助医上门', status: '1', statusName: '待服务' }
  ]
}

// 空数据（用于联调空状态）
export const mockEmptyOrder = {
  total: 0,
  completed: 0,
  list: []
}
